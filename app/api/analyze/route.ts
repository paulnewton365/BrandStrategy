import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ANALYSIS_PROMPT, buildAnalysisContext } from '@/lib/prompts';
import { FindingsDocument } from '@/types';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: `${ANALYSIS_PROMPT}

Here is the research data to analyze:

${context}

Please analyze this data and return a JSON object matching the FindingsDocument structure. Remember:
- Do NOT use em-dashes or en-dashes anywhere
- Prioritize IDI transcripts over questionnaire data
- Anonymize all quotes
- Create a positioning quadrant with X-axis (Technical/Product vs Audience Benefit) and Y-axis (Pragmatic vs Visionary)
- Provide strategic direction for What, Why, and How statements

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
    let findings: FindingsDocument;
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

      findings = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent.text);
      throw new Error('Failed to parse analysis response');
    }

    // Ensure required fields and sanitize
    findings.version = findings.version || '1.0.0';
    findings.brandName = brandName;
    findings.generatedAt = new Date();

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
    return NextResponse.json(
      { error: 'Failed to analyze inputs' },
      { status: 500 }
    );
  }
}
