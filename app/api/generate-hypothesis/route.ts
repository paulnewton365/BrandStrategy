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
      max_tokens: 6000,
      messages: [
        {
          role: 'user',
          content: `${HYPOTHESIS_PROMPT}

Here are the findings to build the brand hypothesis from:

${findingsContext}

Please create a brand strategy hypothesis and return a JSON object matching the BrandHypothesis structure. Remember:
- Do NOT use em-dashes or en-dashes anywhere (use regular hyphens or rewrite)
- What, Why, How statements: Maximum 140 words each, use "we" voice
- Positioning statement: Maximum 150 words, use brand name (third person)
- Total document should not exceed 1350 words
- Values: Maximum 6
- Personality traits: Maximum 6
- Use authentic language from the research findings
- Organizing idea should be pithy (3-6 words) with clear word-to-pillar mapping

Return ONLY valid JSON, no markdown code blocks.`
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
