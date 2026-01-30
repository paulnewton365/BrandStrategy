import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { HYPOTHESIS_PROMPT } from '@/lib/prompts';
import { BrandHypothesis, FindingsDocument } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'API configuration error. Please check environment variables.' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const body = await request.json();
    const { findingsDocument, brandName } = body as { findingsDocument: FindingsDocument; brandName: string };

    if (!findingsDocument || !brandName) {
      return NextResponse.json(
        { error: 'Findings document and brand name are required' },
        { status: 400 }
      );
    }

    // Build context from findings with defensive checks
    const themes = findingsDocument.themes || [];
    const tensions = findingsDocument.tensions || [];
    const opportunities = findingsDocument.opportunities || [];
    const keyPhrasesToUse = findingsDocument.keyPhrases?.toUse || [];
    const keyPhrasesToAvoid = findingsDocument.keyPhrases?.toAvoid || [];
    const audienceAnalyses = findingsDocument.audienceAnalyses || [];
    const strategicDirection = findingsDocument.strategicDirection || {};
    const keyFindings = findingsDocument.keyFindings || [];
    const contentAnalysis = findingsDocument.contentAnalysis || {};

    const findingsContext = `
BRAND NAME: ${brandName}

FINDINGS DOCUMENT SUMMARY:

EXECUTIVE SUMMARY:
${findingsDocument.executiveSummary || 'Not provided'}

KEY FINDINGS:
${keyFindings.map((f, i) => `${i + 1}. ${f.title || 'Finding'}: ${f.finding || ''}`).join('\n') || 'Not provided'}

KEY THEMES:
${themes.map((t, i) => `${i + 1}. ${t.title || 'Theme'}: ${t.description || ''}\n   Quotes: ${(t.quotes || []).map(q => `"${q}"`).join(', ')}`).join('\n') || 'Not provided'}

BRAND TENSIONS:
${tensions.map((t, i) => `${i + 1}. ${t.title || 'Tension'} (${t.pole1 || ''} vs ${t.pole2 || ''}): ${t.description || ''}\n   How to reconcile: ${t.reconciliation || 'Not specified'}`).join('\n') || 'Not provided'}

STRATEGIC OPPORTUNITIES:
${opportunities.map((o, i) => `${i + 1}. ${o.title || 'Opportunity'}: ${o.description || ''} - Rationale: ${o.rationale || ''}`).join('\n') || 'Not provided'}

CONTENT ANALYSIS - WORDS TO USE:
${Array.isArray(contentAnalysis.wordsToUse) ? contentAnalysis.wordsToUse.map(w => `- "${w.word || ''}" (${w.context || ''})`).join('\n') : 'Not provided'}

CONTENT ANALYSIS - WORDS TO AVOID:
${Array.isArray(contentAnalysis.wordsToAvoid) ? contentAnalysis.wordsToAvoid.map(w => `- "${w.word || ''}" (${w.reason || ''})`).join('\n') : 'Not provided'}

KEY LANGUAGE TO USE:
${keyPhrasesToUse.map(p => `- "${p.phrase || ''}" (${p.context || ''})`).join('\n') || 'Not provided'}

LANGUAGE TO AVOID:
${keyPhrasesToAvoid.map(p => `- "${p.phrase || ''}" (${p.context || ''})`).join('\n') || 'Not provided'}

AUDIENCE INSIGHTS:
${audienceAnalyses.map(a => `
${a.audienceName || 'Audience'}:
- Disconnects: ${(a.disconnects || []).join('; ') || 'None identified'}
- Barriers: ${(a.barriers || []).join('; ') || 'None identified'}
- Opportunities: ${(a.opportunities || []).join('; ') || 'None identified'}`).join('\n') || 'Not provided'}

STRATEGIC DIRECTION:
- What Direction: ${strategicDirection.whatDirection || 'Not specified'}
- Why Direction: ${strategicDirection.whyDirection || 'Not specified'}
- How Direction: ${strategicDirection.howDirection || 'Not specified'}

CONCLUSION:
${findingsDocument.conclusion || 'Not provided'}
`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `${HYPOTHESIS_PROMPT}

Here are the findings to build the brand hypothesis from:

${findingsContext}

Please create a brand strategy hypothesis and return a JSON object with this EXACT structure:
{
  "whatStatement": "string - what the brand does (max 140 words, 'we' voice)",
  "whyStatement": "string - why the brand does it (max 140 words, 'we' voice)",
  "howStatement": "string - how the brand thinks/works/acts (max 140 words, 'we' voice)",
  "organizingIdea": {
    "statement": "string - 3-6 word pithy organizing idea",
    "breakdown": [{ "word": "string", "meaning": "string", "mappedTo": "what|why|how" }]
  },
  "whyThisWorks": ["string - reason 1", "string - reason 2", ...],
  "positioningStatement": "string - positioning using brand name (max 150 words)",
  "brandHouse": {
    "essence": "string - the core brand essence",
    "promise": "string - what the brand delivers daily",
    "mission": "string - ultimate goal",
    "vision": "string - ownable future state",
    "purpose": "string - higher-order reason for existence",
    "values": [{ "name": "string", "description": "string" }],
    "personality": [{ "name": "string", "description": "string" }]
  },
  "visualGuidance": "string - direction for visual expression",
  "toneOfVoiceGuidance": "string - tone and messaging guidance"
}

CRITICAL RULES:
- Return ONLY valid JSON - no markdown, no code blocks, no explanatory text
- Do NOT use em-dashes (—) or en-dashes (–) anywhere - use regular hyphens (-) only
- All string fields must be actual string values, not nested objects
- Values array must have 3-6 items with name and description
- Personality array must have 3-6 items with name and description
- Use authentic language from the research findings

Return the JSON object starting with { and ending with }`
        }
      ]
    });

    // Extract text content from the response
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Parse the JSON response
    let hypothesis: BrandHypothesis;
    try {
      // Clean the response - remove any markdown code blocks if present
      let jsonStr = textContent.text.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      hypothesis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent.text.substring(0, 500));
      throw new Error('Failed to parse hypothesis response');
    }

    // Helper to extract string from potential object
    const ensureString = (value: unknown): string => {
      if (typeof value === 'string') return value;
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        // Try common text properties
        if (typeof obj.text === 'string') return obj.text;
        if (typeof obj.content === 'string') return obj.content;
        if (typeof obj.statement === 'string') return obj.statement;
        if (typeof obj.description === 'string') return obj.description;
        if (typeof obj.value === 'string') return obj.value;
        // Return first string value found
        for (const v of Object.values(obj)) {
          if (typeof v === 'string' && v.length > 0) return v;
        }
        return '';
      }
      return String(value);
    };

    // Ensure required fields are strings
    hypothesis.whatStatement = ensureString(hypothesis.whatStatement);
    hypothesis.whyStatement = ensureString(hypothesis.whyStatement);
    hypothesis.howStatement = ensureString(hypothesis.howStatement);
    hypothesis.positioningStatement = ensureString(hypothesis.positioningStatement);
    hypothesis.visualGuidance = ensureString(hypothesis.visualGuidance);
    hypothesis.toneOfVoiceGuidance = ensureString(hypothesis.toneOfVoiceGuidance);
    
    // Ensure organizingIdea is properly structured
    if (!hypothesis.organizingIdea || typeof hypothesis.organizingIdea !== 'object') {
      hypothesis.organizingIdea = { statement: '', breakdown: [] };
    }
    hypothesis.organizingIdea.statement = ensureString(hypothesis.organizingIdea.statement);
    if (!Array.isArray(hypothesis.organizingIdea.breakdown)) {
      hypothesis.organizingIdea.breakdown = [];
    }

    // Ensure brandHouse is properly structured
    if (!hypothesis.brandHouse || typeof hypothesis.brandHouse !== 'object') {
      hypothesis.brandHouse = { essence: '', promise: '', mission: '', vision: '', purpose: '', values: [], personality: [] };
    }
    hypothesis.brandHouse.essence = ensureString(hypothesis.brandHouse.essence);
    hypothesis.brandHouse.promise = ensureString(hypothesis.brandHouse.promise);
    hypothesis.brandHouse.mission = ensureString(hypothesis.brandHouse.mission);
    hypothesis.brandHouse.vision = ensureString(hypothesis.brandHouse.vision);
    hypothesis.brandHouse.purpose = ensureString(hypothesis.brandHouse.purpose);
    
    // Process values array - handle various formats
    if (!Array.isArray(hypothesis.brandHouse.values)) {
      hypothesis.brandHouse.values = [];
    } else {
      hypothesis.brandHouse.values = hypothesis.brandHouse.values.map((v: unknown) => {
        if (typeof v === 'string') {
          return { name: v, description: '' };
        }
        if (v && typeof v === 'object') {
          const val = v as Record<string, unknown>;
          return {
            name: ensureString(val.name || val.title || val.value || ''),
            description: ensureString(val.description || val.text || val.meaning || '')
          };
        }
        return { name: '', description: '' };
      }).filter((v: {name: string}) => v.name);
    }
    
    // Process personality array - handle various formats
    if (!Array.isArray(hypothesis.brandHouse.personality)) {
      hypothesis.brandHouse.personality = [];
    } else {
      hypothesis.brandHouse.personality = hypothesis.brandHouse.personality.map((p: unknown) => {
        if (typeof p === 'string') {
          return { name: p, description: '' };
        }
        if (p && typeof p === 'object') {
          const trait = p as Record<string, unknown>;
          return {
            name: ensureString(trait.name || trait.title || trait.trait || ''),
            description: ensureString(trait.description || trait.text || trait.meaning || '')
          };
        }
        return { name: '', description: '' };
      }).filter((p: {name: string}) => p.name);
    }
    
    // Process organizingIdea breakdown
    if (Array.isArray(hypothesis.organizingIdea.breakdown)) {
      hypothesis.organizingIdea.breakdown = hypothesis.organizingIdea.breakdown.map((b: unknown) => {
        if (b && typeof b === 'object') {
          const item = b as Record<string, unknown>;
          const mappedValue = ensureString(item.mappedTo || item.maps || item.pillar || 'what').toLowerCase();
          const validMapped = ['what', 'why', 'how'].includes(mappedValue) ? mappedValue as 'what' | 'why' | 'how' : 'what';
          return {
            word: ensureString(item.word || item.term || ''),
            meaning: ensureString(item.meaning || item.description || item.explanation || ''),
            mappedTo: validMapped
          };
        }
        return { word: '', meaning: '', mappedTo: 'what' as const };
      }).filter((b: {word: string}) => b.word);
    }

    // Ensure whyThisWorks is an array
    if (!Array.isArray(hypothesis.whyThisWorks)) {
      hypothesis.whyThisWorks = [];
    }

    // Ensure required fields
    hypothesis.version = hypothesis.version || '1.0.0';
    hypothesis.brandName = brandName;
    hypothesis.generatedAt = new Date().toISOString();

    // Sanitize em-dashes throughout
    const sanitize = (obj: unknown): unknown => {
      if (typeof obj === 'string') {
        return obj.replace(/[\u2014\u2013—–]/g, '-');
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return obj;
    };

    hypothesis = sanitize(hypothesis) as BrandHypothesis;

    return NextResponse.json(hypothesis);
  } catch (error) {
    console.error('Hypothesis generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate hypothesis: ${errorMessage}` },
      { status: 500 }
    );
  }
}
