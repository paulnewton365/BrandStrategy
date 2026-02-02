import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ANALYSIS_PROMPT, buildAnalysisContext } from '@/lib/prompts';
import { FindingsDocument } from '@/types';

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
    const { brandName, interviews, questionnaires, audienceInsights, competitorInsights, assessorComments } = body;

    if (!brandName || !interviews || interviews.length === 0) {
      return NextResponse.json(
        { error: 'Brand name and at least one interview are required' },
        { status: 400 }
      );
    }

    const context = buildAnalysisContext({
      brandName,
      interviews,
      questionnaires: questionnaires || [],
      audienceInsights: audienceInsights || [],
      competitorInsights: competitorInsights || [],
      assessorComments: assessorComments || []
    });

    console.log('Context length:', context.length, 'characters');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 12000,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `${ANALYSIS_PROMPT}

Here is the research data to analyze:

${context}

Please analyze this data and return a JSON object matching the FindingsDocument structure. 

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON - no markdown, no code blocks, no explanatory text
- Do NOT use em-dashes (—) or en-dashes (–) anywhere - use regular hyphens (-) only
- Prioritize IDI transcripts over questionnaire data
- Anonymize all quotes (remove names, use "they" instead of "I")
- All array fields must be arrays, even if empty: []
- All string fields must be strings, even if empty: ""

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
    let findings: FindingsDocument;
    try {
      // Clean the response - remove any markdown code blocks if present
      let jsonStr = textContent.text.trim();
      
      // Remove markdown code blocks
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
      
      // Try to find JSON object if there's extra text
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      findings = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response. First 1000 chars:', textContent.text.substring(0, 1000));
      console.error('Last 500 chars:', textContent.text.substring(textContent.text.length - 500));
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse analysis response. The AI may have returned invalid JSON.');
    }

    // Helper to extract string from potential object
    const ensureString = (value: unknown): string => {
      if (typeof value === 'string') return value;
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (typeof obj.text === 'string') return obj.text;
        if (typeof obj.content === 'string') return obj.content;
        if (typeof obj.statement === 'string') return obj.statement;
        if (typeof obj.description === 'string') return obj.description;
        if (typeof obj.value === 'string') return obj.value;
        for (const v of Object.values(obj)) {
          if (typeof v === 'string' && v.length > 0) return v;
        }
        return '';
      }
      return String(value);
    };

    // Helper to ensure array
    const ensureArray = <T>(value: unknown): T[] => {
      if (Array.isArray(value)) return value;
      return [];
    };

    // Helper to ensure string array
    const ensureStringArray = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value.map(v => typeof v === 'string' ? v : String(v || ''));
      }
      return [];
    };

    // Ensure required fields and sanitize
    findings.version = findings.version || '1.0.0';
    findings.brandName = brandName;
    findings.generatedAt = new Date().toISOString();
    
    // Ensure string fields
    findings.executiveSummary = ensureString(findings.executiveSummary);
    findings.conclusion = ensureString(findings.conclusion);
    
    // Ensure array fields
    findings.keyFindings = ensureArray(findings.keyFindings);
    findings.themes = ensureArray(findings.themes);
    findings.tensions = ensureArray(findings.tensions);
    findings.opportunities = ensureArray(findings.opportunities);
    findings.audienceAnalyses = ensureArray(findings.audienceAnalyses);
    findings.audienceInsightFindings = ensureArray(findings.audienceInsightFindings);
    
    // Normalize audience insights to ensure audienceName is set
    findings.audienceInsightFindings = findings.audienceInsightFindings.map((a: unknown) => {
      if (a && typeof a === 'object') {
        const aud = a as Record<string, unknown>;
        return {
          audienceName: ensureString(aud.audienceName || aud.name || aud.audience || aud.segment || ''),
          summary: ensureString(aud.summary || aud.description || ''),
          keyInsights: ensureStringArray(aud.keyInsights || aud.insights || [])
        };
      }
      return { audienceName: '', summary: '', keyInsights: [] };
    }).filter((a: {audienceName: string}) => a.audienceName);
    
    findings.competitorInsightFindings = ensureArray(findings.competitorInsightFindings);
    
    // Normalize competitor insights to ensure competitorName is set
    findings.competitorInsightFindings = findings.competitorInsightFindings.map((c: unknown) => {
      if (c && typeof c === 'object') {
        const comp = c as Record<string, unknown>;
        return {
          competitorName: ensureString(comp.competitorName || comp.name || comp.competitor || comp.companyName || ''),
          positioning: ensureString(comp.positioning || comp.position || ''),
          keyDifferentiators: ensureStringArray(comp.keyDifferentiators || comp.differentiators || comp.strengths || []),
          weaknesses: ensureStringArray(comp.weaknesses || comp.weakness || [])
        };
      }
      return { competitorName: '', positioning: '', keyDifferentiators: [], weaknesses: [] };
    }).filter((c: {competitorName: string}) => c.competitorName);
    
    findings.strategicRecommendations = ensureArray(findings.strategicRecommendations);
    
    // Ensure nested objects
    if (!findings.idiFindings || typeof findings.idiFindings !== 'object') {
      findings.idiFindings = { summary: '', keyInsights: [], quotes: [] };
    }
    findings.idiFindings.summary = ensureString(findings.idiFindings.summary);
    findings.idiFindings.keyInsights = ensureArray(findings.idiFindings.keyInsights);
    findings.idiFindings.quotes = ensureArray(findings.idiFindings.quotes);
    
    if (!findings.questionnaireFindings || typeof findings.questionnaireFindings !== 'object') {
      findings.questionnaireFindings = { summary: '', keyInsights: [], responseHighlights: [] };
    }
    findings.questionnaireFindings.summary = ensureString(findings.questionnaireFindings.summary);
    findings.questionnaireFindings.keyInsights = ensureArray(findings.questionnaireFindings.keyInsights);
    findings.questionnaireFindings.responseHighlights = ensureArray(findings.questionnaireFindings.responseHighlights);
    
    if (!findings.contentAnalysis || typeof findings.contentAnalysis !== 'object') {
      findings.contentAnalysis = { wordsToUse: [], wordsToAvoid: [], phrasesToUse: [], phrasesToAvoid: [] };
    }
    findings.contentAnalysis.wordsToUse = ensureArray(findings.contentAnalysis.wordsToUse);
    findings.contentAnalysis.wordsToAvoid = ensureArray(findings.contentAnalysis.wordsToAvoid);
    findings.contentAnalysis.phrasesToUse = ensureArray(findings.contentAnalysis.phrasesToUse);
    findings.contentAnalysis.phrasesToAvoid = ensureArray(findings.contentAnalysis.phrasesToAvoid);
    
    if (!findings.keyPhrases || typeof findings.keyPhrases !== 'object') {
      findings.keyPhrases = { toUse: [], toAvoid: [] };
    }
    findings.keyPhrases.toUse = ensureArray(findings.keyPhrases.toUse);
    findings.keyPhrases.toAvoid = ensureArray(findings.keyPhrases.toAvoid);
    
    if (!findings.strategicDirection || typeof findings.strategicDirection !== 'object') {
      findings.strategicDirection = { whatDirection: '', whyDirection: '', howDirection: '' };
    }
    findings.strategicDirection.whatDirection = ensureString(findings.strategicDirection.whatDirection);
    findings.strategicDirection.whyDirection = ensureString(findings.strategicDirection.whyDirection);
    findings.strategicDirection.howDirection = ensureString(findings.strategicDirection.howDirection);
    
    if (!findings.positioningQuadrant || typeof findings.positioningQuadrant !== 'object') {
      findings.positioningQuadrant = {
        xAxis: { label: 'Approach', leftLabel: 'Visionary', rightLabel: 'Pragmatic' },
        yAxis: { label: 'Focus', topLabel: 'Audience Benefit', bottomLabel: 'Technical/Product' },
        currentPosition: { x: 0, y: 0 },
        targetPosition: { x: 0.5, y: 0.5 },
        competitors: [],
        rationale: '',
        movementStrategy: ''
      };
    }
    findings.positioningQuadrant.rationale = ensureString(findings.positioningQuadrant.rationale);
    findings.positioningQuadrant.movementStrategy = ensureString(findings.positioningQuadrant.movementStrategy);
    findings.positioningQuadrant.competitors = ensureArray(findings.positioningQuadrant.competitors);

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

    findings = sanitize(findings) as FindingsDocument;

    return NextResponse.json(findings);
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to analyze inputs: ${errorMessage}` },
      { status: 500 }
    );
  }
}
