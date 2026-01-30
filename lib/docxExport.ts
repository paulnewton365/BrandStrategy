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
  const themes = findings?.themes || [];
  const tensions = findings?.tensions || [];
  const opportunities = findings?.opportunities || [];
  const keyPhrasesToUse = findings?.keyPhrases?.toUse || [];
  const keyPhrasesToAvoid = findings?.keyPhrases?.toAvoid || [];
  const audienceAnalyses = findings?.audienceAnalyses || [];
  const strategicDirection = findings?.strategicDirection || { whatDirection: '', whyDirection: '', howDirection: '' };
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

  // Key Themes
  if (themes.length > 0) {
    children.push(
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
        }),
        new Paragraph({
          children: [
            new TextRun({ text: tension?.pole1 || '', bold: true, size: 24 }),
            new TextRun({ text: ' vs ', size: 24 }),
            new TextRun({ text: tension?.pole2 || '', bold: true, size: 24 })
          ]
        }),
        new Paragraph({
          children: [new TextRun({ text: sanitizeForPDF(tension?.description || ''), size: 24 })]
        }),
        new Paragraph({ children: [] })
      );
    });
  }

  // Opportunities
  if (opportunities.length > 0) {
    children.push(
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
        }),
        new Paragraph({ children: [] })
      );
    });
  }

  // Key Language
  if (keyPhrasesToUse.length > 0 || keyPhrasesToAvoid.length > 0) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Key Language & Phraseology', bold: true, size: 32 })]
      })
    );

    if (keyPhrasesToUse.length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Words to Use', bold: true, color: '22c55e', size: 28 })]
        })
      );

      keyPhrasesToUse.forEach(phrase => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `"${phrase?.phrase || ''}"`, bold: true, size: 24 }),
              new TextRun({ text: ` - ${sanitizeForPDF(phrase?.context || '')}`, size: 22, color: '666666' })
            ]
          })
        );
      });
    }

    if (keyPhrasesToAvoid.length > 0) {
      children.push(
        new Paragraph({ children: [] }),
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Words to Avoid', bold: true, color: 'ef4444', size: 28 })]
        })
      );

      keyPhrasesToAvoid.forEach(phrase => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `"${phrase?.phrase || ''}"`, bold: true, size: 24 }),
              new TextRun({ text: ` - ${sanitizeForPDF(phrase?.context || '')}`, size: 22, color: '666666' })
            ]
          })
        );
      });
    }
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

  // Conclusion
  if (conclusion) {
    children.push(
      new Paragraph({ children: [] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Conclusion', bold: true, size: 32 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(conclusion), size: 24 })]
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
