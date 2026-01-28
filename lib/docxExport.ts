import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  ShadingType,
  PageBreak
} from 'docx';
import { FindingsDocument, BrandHypothesis } from '@/types';
import { sanitizeForPDF } from './utils';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

export async function generateFindingsDocx(findings: FindingsDocument): Promise<Blob> {
  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: `${findings.brandName} Brand Analysis`, bold: true, size: 48 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: `Stakeholder Interview Findings - Version ${findings.version}`, color: '666666', size: 24 })]
    }),
    new Paragraph({ children: [] })
  );

  // Executive Summary
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Executive Summary', bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: sanitizeForPDF(findings.executiveSummary), size: 24 })]
    }),
    new Paragraph({ children: [] })
  );

  // Key Themes
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Key Themes', bold: true, size: 32 })]
    })
  );

  findings.themes.forEach((theme, index) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `${index + 1}. ${theme.title}`, bold: true, size: 28 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(theme.description), size: 24 })]
      })
    );

    theme.quotes.forEach(quote => {
      children.push(
        new Paragraph({
          indent: { left: 720 },
          children: [new TextRun({ text: `"${sanitizeForPDF(quote)}"`, italics: true, color: '666666', size: 22 })]
        })
      );
    });

    children.push(new Paragraph({ children: [] }));
  });

  // Brand Tensions
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Brand Tensions', bold: true, size: 32 })]
    })
  );

  findings.tensions.forEach(tension => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: tension.title, bold: true, size: 28 })]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: tension.pole1, bold: true, size: 24 }),
          new TextRun({ text: ' vs ', size: 24 }),
          new TextRun({ text: tension.pole2, bold: true, size: 24 })
        ]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(tension.description), size: 24 })]
      }),
      new Paragraph({ children: [] })
    );
  });

  // Opportunities
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Strategic Opportunities', bold: true, size: 32 })]
    })
  );

  findings.opportunities.forEach((opp, index) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: `${index + 1}. ${opp.title}`, bold: true, size: 28 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: sanitizeForPDF(opp.description), size: 24 })]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Rationale: ', bold: true, size: 24 }),
          new TextRun({ text: sanitizeForPDF(opp.rationale), size: 24 })
        ]
      }),
      new Paragraph({ children: [] })
    );
  });

  // Key Language
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Key Language & Phraseology', bold: true, size: 32 })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: 'Words to Use', bold: true, color: '22c55e', size: 28 })]
    })
  );

  findings.keyPhrases.toUse.forEach(phrase => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `"${phrase.phrase}"`, bold: true, size: 24 }),
          new TextRun({ text: ` - ${sanitizeForPDF(phrase.context)}`, size: 22, color: '666666' })
        ]
      })
    );
  });

  children.push(
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: 'Words to Avoid', bold: true, color: 'ef4444', size: 28 })]
    })
  );

  findings.keyPhrases.toAvoid.forEach(phrase => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `"${phrase.phrase}"`, bold: true, size: 24 }),
          new TextRun({ text: ` - ${sanitizeForPDF(phrase.context)}`, size: 22, color: '666666' })
        ]
      })
    );
  });

  // Strategic Direction
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Strategic Direction', bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'What Direction: ', bold: true, size: 24 }),
        new TextRun({ text: sanitizeForPDF(findings.strategicDirection.whatDirection), size: 24 })
      ]
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Why Direction: ', bold: true, size: 24 }),
        new TextRun({ text: sanitizeForPDF(findings.strategicDirection.whyDirection), size: 24 })
      ]
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'How Direction: ', bold: true, size: 24 }),
        new TextRun({ text: sanitizeForPDF(findings.strategicDirection.howDirection), size: 24 })
      ]
    })
  );

  // Conclusion
  children.push(
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Conclusion', bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: sanitizeForPDF(findings.conclusion), size: 24 })]
    })
  );

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

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: `${hypothesis.brandName} Brief`, bold: true, size: 48 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: `Brand Strategy and Creative Direction - Version ${hypothesis.version}`, color: '666666', size: 24 })]
    }),
    new Paragraph({ children: [] })
  );

  // What Statement
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: `What ${hypothesis.brandName} Does`, bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: sanitizeForPDF(hypothesis.whatStatement), size: 24 })]
    }),
    new Paragraph({ children: [] })
  );

  // Why Statement
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: `Why ${hypothesis.brandName} Does It`, bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: sanitizeForPDF(hypothesis.whyStatement), size: 24 })]
    }),
    new Paragraph({ children: [] })
  );

  // How Statement
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: `How ${hypothesis.brandName} Thinks, Works & Acts`, bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: sanitizeForPDF(hypothesis.howStatement), size: 24 })]
    }),
    new Paragraph({ children: [] })
  );

  // Organizing Idea
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'An Organizing Idea', bold: true, size: 32 })]
    }),
    new Paragraph({
      shading: { fill: 'D4E800', type: ShadingType.CLEAR },
      children: [new TextRun({ text: sanitizeForPDF(hypothesis.organizingIdea.statement), bold: true, size: 36 })]
    }),
    new Paragraph({ children: [] })
  );

  hypothesis.organizingIdea.breakdown.forEach(item => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: item.word, bold: true, size: 24, shading: { fill: 'D4E800', type: ShadingType.CLEAR } }),
          new TextRun({ text: ` = ${sanitizeForPDF(item.meaning)} (${item.mappedTo === 'what' ? 'What we do' : item.mappedTo === 'why' ? 'Why we do it' : 'How we act'})`, size: 24 })
        ]
      })
    );
  });

  // Why This Works
  children.push(
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Why This Works', bold: true, size: 32 })]
    })
  );

  hypothesis.whyThisWorks.forEach(reason => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: '✓ ', color: '22c55e', size: 24 }),
          new TextRun({ text: sanitizeForPDF(reason), size: 24 })
        ]
      })
    );
  });

  // Positioning Statement
  children.push(
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'A Brand Positioning Statement', bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: sanitizeForPDF(hypothesis.positioningStatement), size: 24 })]
    })
  );

  // Brand House
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'A Brand House Hypothesis', bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Essence: ', bold: true, size: 24 }),
        new TextRun({ text: sanitizeForPDF(hypothesis.brandHouse.essence), italics: true, size: 24 })
      ]
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Promise: ', bold: true, size: 24 }),
        new TextRun({ text: sanitizeForPDF(hypothesis.brandHouse.promise), size: 24 })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Mission: ', bold: true, size: 24 }),
        new TextRun({ text: sanitizeForPDF(hypothesis.brandHouse.mission), size: 24 })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Vision: ', bold: true, size: 24 }),
        new TextRun({ text: sanitizeForPDF(hypothesis.brandHouse.vision), size: 24 })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Purpose: ', bold: true, size: 24 }),
        new TextRun({ text: sanitizeForPDF(hypothesis.brandHouse.purpose), size: 24 })
      ]
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: 'Brand Values', bold: true, size: 28 })]
    })
  );

  hypothesis.brandHouse.values.forEach(value => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${value.name}: `, bold: true, size: 24 }),
          new TextRun({ text: sanitizeForPDF(value.description), size: 24 })
        ]
      })
    );
  });

  children.push(
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: 'Brand Personality', bold: true, size: 28 })]
    })
  );

  hypothesis.brandHouse.personality.forEach(trait => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${trait.name}: `, bold: true, size: 24 }),
          new TextRun({ text: sanitizeForPDF(trait.description), size: 24 })
        ]
      })
    );
  });

  // Visual Guidance
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Brand Guidance For Visual Expression', bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: sanitizeForPDF(hypothesis.visualGuidance), size: 24 })]
    })
  );

  // Tone of Voice
  children.push(
    new Paragraph({ children: [] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Brand Guidance For Tone of Voice', bold: true, size: 32 })]
    }),
    new Paragraph({
      children: [new TextRun({ text: sanitizeForPDF(hypothesis.toneOfVoiceGuidance), size: 24 })]
    })
  );

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
