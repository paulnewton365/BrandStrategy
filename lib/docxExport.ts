import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ShadingType,
  PageBreak
} from 'docx';
import { FindingsDocument, BrandHypothesis } from '@/types';
import { sanitizeForPDF } from './utils';

export async function generateFindingsDocx(findings: FindingsDocument): Promise<Blob> {
  const children: any[] = [];

  // Defensive: ensure findings has required data
  const brandName = findings?.brandName || 'Brand';
  const version = findings?.version || '1.0.0';
  const executiveSummary = findings?.executiveSummary || '';
  const keyFindings = findings?.keyFindings || [];
  const idiFindings = findings?.idiFindings || { summary: '', keyInsights: [], quotes: [] };
  const questionnaireFindings = findings?.questionnaireFindings || { summary: '', keyInsights: [], responseHighlights: [] };
  const audienceInsightFindings = findings?.audienceInsightFindings || [];
  const competitorInsightFindings = findings?.competitorInsightFindings || [];
  const contentAnalysis = findings?.contentAnalysis || { wordsToUse: [], wordsToAvoid: [], phrasesToUse: [], phrasesToAvoid: [] };
  const themes = findings?.themes || [];
  const tensions = findings?.tensions || [];
  const opportunities = findings?.opportunities || [];
  const audienceAnalyses = findings?.audienceAnalyses || [];
  const strategicDirection = findings?.strategicDirection || { whatDirection: '', whyDirection: '', howDirection: '' };
  const strategicRecommendations = Array.isArray(findings?.strategicRecommendations) ? findings.strategicRecommendations : [];
  const positioningQuadrant = findings?.positioningQuadrant || null;
  const conclusion = findings?.conclusion || '';

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: `${brandName} Brand Analysis`, bold: true, size: 48 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: `Stakeholder Interview Findings - Version ${version}`, color: '666666', size: 24 })]
    }),
    new Paragraph({ children: [] })
  );

  // Executive Summary
  if (executiveSummary) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Executive Summary', bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(executiveSummary), size: 24 })]
      }),
      new Paragraph({ children: [] })
    );
  }

  // Key Findings
  if (keyFindings.length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Key Findings', bold: true, size: 32 })]
      })
    );

    keyFindings.forEach((finding, index) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({ text: `${index + 1}. ${sanitizeForPDF(finding?.title || 'Finding')}`, bold: true, size: 28 }),
            new TextRun({ text: ` [${finding?.source || 'Research'}]`, color: '666666', size: 20 })
          ]
        })
      );

      if (finding?.finding) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: sanitizeForPDF(finding.finding), size: 24 })]
          })
        );
      }

      if ((finding?.supportingQuotes || []).length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Supporting Evidence:', bold: true, size: 22, color: '666666' })]
          })
        );
        (finding.supportingQuotes || []).forEach((quote) => {
          children.push(
            new Paragraph({
              indent: { left: 720 },
              children: [new TextRun({ text: `"${sanitizeForPDF(quote)}"`, italics: true, size: 22, color: '666666' })]
            })
          );
        });
      }

      children.push(new Paragraph({ children: [] }));
    });
  }

  // IDI Findings
  if (idiFindings.summary || (idiFindings.keyInsights || []).length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'In-Depth Interview Findings', bold: true, size: 32 })]
      })
    );

    if (idiFindings.summary) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: sanitizeForPDF(idiFindings.summary), size: 24 })]
        }),
        new Paragraph({ children: [] })
      );
    }

    if ((idiFindings.keyInsights || []).length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Key Insights', bold: true, size: 28 })]
        })
      );

      (idiFindings.keyInsights || []).forEach((insight) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${sanitizeForPDF(insight)}`, size: 24 })]
          })
        );
      });
      children.push(new Paragraph({ children: [] }));
    }

    if ((idiFindings.quotes || []).length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Notable Quotes', bold: true, size: 28 })]
        })
      );

      (idiFindings.quotes || []).forEach((quote) => {
        children.push(
          new Paragraph({
            indent: { left: 720 },
            children: [new TextRun({ text: `"${sanitizeForPDF(quote)}"`, italics: true, size: 22, color: '666666' })]
          })
        );
      });
    }
  }

  // Questionnaire Findings
  if (questionnaireFindings.summary || (questionnaireFindings.keyInsights || []).length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Questionnaire Findings', bold: true, size: 32 })]
      })
    );

    if (questionnaireFindings.summary) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: sanitizeForPDF(questionnaireFindings.summary), size: 24 })]
        }),
        new Paragraph({ children: [] })
      );
    }

    if ((questionnaireFindings.keyInsights || []).length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Key Insights', bold: true, size: 28 })]
        })
      );

      (questionnaireFindings.keyInsights || []).forEach((insight) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${sanitizeForPDF(insight)}`, size: 24 })]
          })
        );
      });
    }
  }

  // Audience Insight Findings
  if (audienceInsightFindings.length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Audience Insights', bold: true, size: 32 })]
      })
    );

    audienceInsightFindings.forEach((audience) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: audience?.audienceName || 'Audience', bold: true, size: 28 })]
        })
      );

      if (audience?.summary) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: sanitizeForPDF(audience.summary), size: 24 })]
          })
        );
      }

      (audience?.keyInsights || []).forEach((insight) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${sanitizeForPDF(insight)}`, size: 24 })]
          })
        );
      });

      children.push(new Paragraph({ children: [] }));
    });
  }

  // Competitor Insight Findings
  if (competitorInsightFindings.length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Competitor Insights', bold: true, size: 32 })]
      })
    );

    competitorInsightFindings.forEach((competitor) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: competitor?.competitorName || 'Competitor', bold: true, size: 28 })]
        })
      );

      if (competitor?.positioning) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Positioning: ', bold: true, size: 24 }),
              new TextRun({ text: sanitizeForPDF(competitor.positioning), size: 24 })
            ]
          })
        );
      }

      if ((competitor?.keyDifferentiators || []).length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Key Differentiators:', bold: true, size: 24 })]
          })
        );
        (competitor.keyDifferentiators || []).forEach((diff) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${sanitizeForPDF(diff)}`, size: 24, color: '22c55e' })]
            })
          );
        });
      }

      if ((competitor?.weaknesses || []).length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Weaknesses:', bold: true, size: 24 })]
          })
        );
        (competitor.weaknesses || []).forEach((weak) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${sanitizeForPDF(weak)}`, size: 24, color: 'ef4444' })]
            })
          );
        });
      }

      children.push(new Paragraph({ children: [] }));
    });
  }

  // Content Analysis
  if ((contentAnalysis.wordsToUse || []).length > 0 || (contentAnalysis.wordsToAvoid || []).length > 0 ||
      (contentAnalysis.phrasesToUse || []).length > 0 || (contentAnalysis.phrasesToAvoid || []).length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Content Analysis', bold: true, size: 32 })]
      })
    );

    if ((contentAnalysis.wordsToUse || []).length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Words to Use', bold: true, color: '22c55e', size: 28 })]
        })
      );
      (contentAnalysis.wordsToUse || []).forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `"${item?.word || ''}"`, bold: true, size: 24 }),
              new TextRun({ text: item?.frequency ? ` (${item.frequency}x)` : '', size: 22, color: '666666' }),
              new TextRun({ text: item?.context ? ` - ${sanitizeForPDF(item.context)}` : '', size: 22, color: '666666' })
            ]
          })
        );
      });
      children.push(new Paragraph({ children: [] }));
    }

    if ((contentAnalysis.wordsToAvoid || []).length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Words to Avoid', bold: true, color: 'ef4444', size: 28 })]
        })
      );
      (contentAnalysis.wordsToAvoid || []).forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `"${item?.word || ''}"`, bold: true, size: 24 }),
              new TextRun({ text: item?.reason ? ` - ${sanitizeForPDF(item.reason)}` : '', size: 22, color: '666666' })
            ]
          })
        );
      });
      children.push(new Paragraph({ children: [] }));
    }

    if ((contentAnalysis.phrasesToUse || []).length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Phrases to Use', bold: true, color: '22c55e', size: 28 })]
        })
      );
      (contentAnalysis.phrasesToUse || []).forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `"${item?.phrase || ''}"`, bold: true, size: 24 }),
              new TextRun({ text: item?.context ? ` - ${sanitizeForPDF(item.context)}` : '', size: 22, color: '666666' })
            ]
          })
        );
      });
      children.push(new Paragraph({ children: [] }));
    }

    if ((contentAnalysis.phrasesToAvoid || []).length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Phrases to Avoid', bold: true, color: 'ef4444', size: 28 })]
        })
      );
      (contentAnalysis.phrasesToAvoid || []).forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `"${item?.phrase || ''}"`, bold: true, size: 24 }),
              new TextRun({ text: item?.reason ? ` - ${sanitizeForPDF(item.reason)}` : '', size: 22, color: '666666' })
            ]
          })
        );
      });
    }
  }

  // Key Themes
  if (themes.length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Key Themes', bold: true, size: 32 })]
      })
    );

    themes.forEach((theme, index) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: `${index + 1}. ${theme?.title || 'Theme'}`, bold: true, size: 28 })]
        }),
        new Paragraph({
          children: [new TextRun({ text: sanitizeForPDF(theme?.description || ''), size: 24 })]
        })
      );

      (theme?.quotes || []).forEach((quote) => {
        children.push(
          new Paragraph({
            indent: { left: 720 },
            children: [new TextRun({ text: `"${sanitizeForPDF(quote)}"`, italics: true, size: 22, color: '666666' })]
          })
        );
      });

      children.push(new Paragraph({ children: [] }));
    });
  }

  // Brand Tensions
  if (tensions.length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Brand Tensions', bold: true, size: 32 })]
      })
    );

    tensions.forEach(tension => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: tension?.title || 'Tension', bold: true, size: 28 })]
        })
      );

      // Only show poles if they have actual values
      const hasPoles = tension?.pole1 && tension?.pole2 && 
                       tension.pole1 !== 'Pole 1' && tension.pole2 !== 'Pole 2';
      if (hasPoles) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: tension.pole1, bold: true, size: 24 }),
              new TextRun({ text: ' vs ', size: 24 }),
              new TextRun({ text: tension.pole2, bold: true, size: 24 })
            ]
          })
        );
      }

      if (tension?.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'The Challenge: ', bold: true, size: 24 }),
              new TextRun({ text: sanitizeForPDF(tension.description), size: 24 })
            ]
          })
        );
      }

      if (tension?.reconciliation) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'How to Reconcile: ', bold: true, color: '22c55e', size: 24 }),
              new TextRun({ text: sanitizeForPDF(tension.reconciliation), size: 24 })
            ]
          })
        );
      }

      if ((tension?.quotes || []).length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Supporting Evidence:', bold: true, size: 22, color: '666666' })]
          })
        );
        (tension.quotes || []).forEach((quote) => {
          children.push(
            new Paragraph({
              indent: { left: 720 },
              children: [new TextRun({ text: `"${sanitizeForPDF(quote)}"`, italics: true, size: 22, color: '666666' })]
            })
          );
        });
      }

      children.push(new Paragraph({ children: [] }));
    });
  }

  // Strategic Opportunities
  if (opportunities.length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Strategic Opportunities', bold: true, size: 32 })]
      })
    );

    opportunities.forEach((opp, index) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: `${index + 1}. ${opp?.title || 'Opportunity'}`, bold: true, size: 28 })]
        }),
        new Paragraph({
          children: [new TextRun({ text: sanitizeForPDF(opp?.description || ''), size: 24 })]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Rationale: ', bold: true, size: 24 }),
            new TextRun({ text: sanitizeForPDF(opp?.rationale || ''), size: 24 })
          ]
        })
      );

      if ((opp?.supportingQuotes || []).length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Supporting Evidence:', bold: true, size: 22, color: '666666' })]
          })
        );
        (opp.supportingQuotes || []).forEach((quote) => {
          children.push(
            new Paragraph({
              indent: { left: 720 },
              children: [new TextRun({ text: `"${sanitizeForPDF(quote)}"`, italics: true, size: 22, color: '666666' })]
            })
          );
        });
      }

      children.push(new Paragraph({ children: [] }));
    });
  }

  // Strategic Direction
  if (strategicDirection.whatDirection || strategicDirection.whyDirection || strategicDirection.howDirection) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Strategic Direction', bold: true, size: 32 })]
      })
    );

    if (strategicDirection.whatDirection) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'What Direction: ', bold: true, size: 24 }),
            new TextRun({ text: sanitizeForPDF(strategicDirection.whatDirection), size: 24 })
          ]
        }),
        new Paragraph({ children: [] })
      );
    }

    if (strategicDirection.whyDirection) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Why Direction: ', bold: true, size: 24 }),
            new TextRun({ text: sanitizeForPDF(strategicDirection.whyDirection), size: 24 })
          ]
        }),
        new Paragraph({ children: [] })
      );
    }

    if (strategicDirection.howDirection) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'How Direction: ', bold: true, size: 24 }),
            new TextRun({ text: sanitizeForPDF(strategicDirection.howDirection), size: 24 })
          ]
        })
      );
    }
  }

  // Positioning Rationale
  if (positioningQuadrant && (positioningQuadrant.rationale || positioningQuadrant.movementStrategy)) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Positioning Opportunity', bold: true, size: 32 })]
      })
    );

    if (positioningQuadrant.rationale) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Why This Position?', bold: true, size: 28 })]
        }),
        new Paragraph({
          children: [new TextRun({ text: sanitizeForPDF(positioningQuadrant.rationale), size: 24 })]
        }),
        new Paragraph({ children: [] })
      );
    }

    if (positioningQuadrant.movementStrategy) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'How to Get There', bold: true, size: 28 })]
        }),
        new Paragraph({
          children: [new TextRun({ text: sanitizeForPDF(positioningQuadrant.movementStrategy), size: 24 })]
        })
      );
    }
  }

  // Strategic Recommendations
  if (strategicRecommendations.length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Strategic Recommendations', bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Based on our findings, we recommend the following strategic directions for brand development:', size: 24, color: '666666' })]
      }),
      new Paragraph({ children: [] })
    );

    strategicRecommendations.forEach((rec, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. `, bold: true, size: 24 }),
            new TextRun({ text: sanitizeForPDF(rec), size: 24 })
          ]
        }),
        new Paragraph({ children: [] })
      );
    });
  }

  // Conclusion & Next Steps
  if (conclusion) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Conclusion & Next Steps', bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(conclusion), size: 24 })]
      }),
      new Paragraph({ children: [] }),
      new Paragraph({
        shading: { fill: 'E8E6E1', type: ShadingType.CLEAR },
        children: [new TextRun({ text: 'These findings provide the foundation for developing a comprehensive brand hypothesis that will guide messaging, visual identity, and strategic positioning.', size: 22, italics: true, color: '666666' })]
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 24 }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children
    }]
  });

  return await Packer.toBlob(doc);
}

export async function generateHypothesisDocx(hypothesis: BrandHypothesis): Promise<Blob> {
  const children: any[] = [];

  // Defensive: ensure hypothesis has required data
  const brandName = hypothesis?.brandName || 'Brand';
  const version = hypothesis?.version || '1.0.0';
  const whatStatement = hypothesis?.whatStatement || '';
  const whyStatement = hypothesis?.whyStatement || '';
  const howStatement = hypothesis?.howStatement || '';
  const organizingIdea = hypothesis?.organizingIdea || { statement: '', breakdown: [] };
  const whyThisWorks = hypothesis?.whyThisWorks || [];
  const positioningStatement = hypothesis?.positioningStatement || '';
  const brandHouse = hypothesis?.brandHouse || { essence: '', promise: '', mission: '', vision: '', purpose: '', values: [], personality: [] };
  const visualGuidance = hypothesis?.visualGuidance || '';
  const toneOfVoiceGuidance = hypothesis?.toneOfVoiceGuidance || '';

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: `${brandName} Brief`, bold: true, size: 48 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: `Brand Strategy and Creative Direction - Version ${version}`, color: '666666', size: 24 })]
    }),
    new Paragraph({ children: [] })
  );

  // What Statement
  if (whatStatement) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: `What ${brandName} Does`, bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(whatStatement), size: 24 })]
      }),
      new Paragraph({ children: [] })
    );
  }

  // Why Statement
  if (whyStatement) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: `Why ${brandName} Does It`, bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(whyStatement), size: 24 })]
      }),
      new Paragraph({ children: [] })
    );
  }

  // How Statement
  if (howStatement) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: `How ${brandName} Thinks, Works & Acts`, bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(howStatement), size: 24 })]
      }),
      new Paragraph({ children: [] })
    );
  }

  // Organizing Idea
  if (organizingIdea.statement) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'An Organizing Idea', bold: true, size: 32 })]
      }),
      new Paragraph({
        shading: { fill: 'D4E800', type: ShadingType.CLEAR },
        children: [new TextRun({ text: sanitizeForPDF(organizingIdea.statement), bold: true, size: 36 })]
      }),
      new Paragraph({ children: [] })
    );

    (organizingIdea.breakdown || []).forEach(item => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: item?.word || '', bold: true, size: 24, shading: { fill: 'D4E800', type: ShadingType.CLEAR } }),
            new TextRun({ text: ` = ${sanitizeForPDF(item?.meaning || '')} (${item?.mappedTo === 'what' ? 'What we do' : item?.mappedTo === 'why' ? 'Why we do it' : 'How we act'})`, size: 24 })
          ]
        })
      );
    });
  }

  // Why This Works
  if (whyThisWorks.length > 0) {
    children.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Why This Works', bold: true, size: 32 })]
      })
    );

    whyThisWorks.forEach(reason => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: '- ', color: '22c55e', size: 24 }),
            new TextRun({ text: sanitizeForPDF(reason), size: 24 })
          ]
        })
      );
    });
  }

  // Positioning Statement
  if (positioningStatement) {
    children.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'A Brand Positioning Statement', bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(positioningStatement), size: 24 })]
      })
    );
  }

  // Brand House
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'A Brand House Hypothesis', bold: true, size: 32 })]
    })
  );

  if (brandHouse.essence) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Essence: ', bold: true, size: 24 }),
          new TextRun({ text: sanitizeForPDF(brandHouse.essence), italics: true, size: 24 })
        ]
      }),
      new Paragraph({ children: [] })
    );
  }

  if (brandHouse.promise) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Promise: ', bold: true, size: 24 }),
          new TextRun({ text: sanitizeForPDF(brandHouse.promise), size: 24 })
        ]
      })
    );
  }

  if (brandHouse.mission) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Mission: ', bold: true, size: 24 }),
          new TextRun({ text: sanitizeForPDF(brandHouse.mission), size: 24 })
        ]
      })
    );
  }

  if (brandHouse.vision) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Vision: ', bold: true, size: 24 }),
          new TextRun({ text: sanitizeForPDF(brandHouse.vision), size: 24 })
        ]
      })
    );
  }

  if (brandHouse.purpose) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Purpose: ', bold: true, size: 24 }),
          new TextRun({ text: sanitizeForPDF(brandHouse.purpose), size: 24 })
        ]
      })
    );
  }

  if (brandHouse.values && brandHouse.values.length > 0) {
    children.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: 'Brand Values', bold: true, size: 28 })]
      })
    );

    brandHouse.values.forEach(value => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${value?.name || ''}: `, bold: true, size: 24 }),
            new TextRun({ text: sanitizeForPDF(value?.description || ''), size: 24 })
          ]
        })
      );
    });
  }

  if (brandHouse.personality && brandHouse.personality.length > 0) {
    children.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: 'Brand Personality', bold: true, size: 28 })]
      })
    );

    brandHouse.personality.forEach(trait => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${trait?.name || ''}: `, bold: true, size: 24 }),
            new TextRun({ text: sanitizeForPDF(trait?.description || ''), size: 24 })
          ]
        })
      );
    });
  }

  // Visual Guidance
  if (visualGuidance) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Brand Guidance For Visual Expression', bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(visualGuidance), size: 24 })]
      })
    );
  }

  // Tone of Voice
  if (toneOfVoiceGuidance) {
    children.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Brand Guidance For Tone of Voice', bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(toneOfVoiceGuidance), size: 24 })]
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 24 }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children
    }]
  });

  return await Packer.toBlob(doc);
}
