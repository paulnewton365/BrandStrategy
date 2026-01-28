# Brand Strategy Builder

A comprehensive tool for generating brand strategy hypotheses from stakeholder research. This application analyzes stakeholder interviews, questionnaire responses, audience insights, and competitor analysis to produce professional brand strategy documents.

## Features

- **Multi-Source Input Support**
  - Stakeholder IDI (In-Depth Interview) transcripts (up to 10)
  - Questionnaire responses from Smartsheet exports
  - Primary audience insights with motivations and barriers
  - Competitor positioning analysis
  - Assessor comments and observations

- **Findings Document Generation**
  - Executive summary
  - Key themes with anonymized pull quotes
  - Brand tensions analysis
  - Strategic opportunities
  - Key language and phraseology (words to use/avoid)
  - Audience analysis with disconnects, barriers, and opportunities
  - Positioning quadrant visualization
  - Strategic direction for What/Why/How statements
  - Version controlled (x.x.x format)

- **Brand Hypothesis Generation**
  - What statement (up to 140 words)
  - Why statement (up to 140 words)
  - How statement (up to 140 words)
  - Organizing idea with word-to-pillar mapping
  - Strategic rationale
  - Positioning statement (up to 150 words)
  - Brand house (essence, promise, mission, vision, purpose, values, personality)
  - Visual expression guidance
  - Tone of voice guidance

- **Export Options**
  - PDF export for both documents
  - Clean, professional formatting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd brand-strategy-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Deployment to Vercel

1. Push your code to GitHub

2. Import the project in Vercel

3. Add your `ANTHROPIC_API_KEY` to the environment variables in Vercel settings

4. Deploy

## Usage Guide

### Step 1: Input Research Materials

1. **Brand Name**: Enter the name of the brand being analyzed

2. **IDI Transcripts**: Upload stakeholder interview transcripts as .txt files (primary source)

3. **Questionnaires**: Upload Smartsheet exports as .xlsx or .csv files (secondary source)

4. **Audiences**: Add primary audience segments with:
   - Audience name
   - Key motivations
   - Barriers to engagement
   - Additional notes

5. **Competitors**: Add competitor analysis with:
   - Competitor name
   - Positioning
   - Strengths and weaknesses
   - Visual style and tone

6. **Assessor Comments**: Add observations from brand assessors

### Step 2: Generate Findings

Click "Generate Findings" to analyze all inputs. The AI will:
- Prioritize IDI transcripts over questionnaire data
- Extract themes with anonymized quotes
- Identify brand tensions
- Map audience disconnects and opportunities
- Create positioning quadrant
- Provide strategic direction

### Step 3: Review and Iterate

- Review the findings document
- Add more inputs if needed
- Re-generate to incorporate new information
- Export PDF when satisfied

### Step 4: Generate Hypothesis

Click "Generate Hypothesis" to create the brand strategy document with:
- Core statements (What, Why, How)
- Organizing idea
- Brand house elements
- Creative direction

## Technical Architecture

```
brand-strategy-app/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # Findings generation
│   │   └── generate-hypothesis/route.ts  # Hypothesis generation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application
├── components/
│   ├── FindingsView.tsx          # Findings document display
│   ├── HypothesisView.tsx        # Hypothesis document display
│   └── QuadrantChart.tsx         # Positioning visualization
├── lib/
│   ├── prompts.ts                # AI prompts
│   └── utils.ts                  # Utility functions
├── types/
│   └── index.ts                  # TypeScript definitions
└── ...config files
```

## Design Principles

- **No em-dashes**: All dashes use regular hyphens (-)
- **Authentic language**: Output uses phraseology from actual research
- **Prioritized sources**: IDI transcripts weighted over questionnaires
- **Word limits enforced**: Statements stay within specified limits
- **Version control**: Documents are version numbered

## API Endpoints

### POST /api/analyze

Analyzes research inputs and generates findings document.

**Request Body:**
```json
{
  "brandName": "string",
  "interviews": [{ "name": "string", "content": "string" }],
  "questionnaires": [{ "field": "value" }],
  "audienceInsights": [{ "audienceName": "string", "motivations": "string", "barriers": "string", "notes": "string" }],
  "competitorInsights": [{ "competitorName": "string", "positioning": "string", "strengths": "string", "weaknesses": "string" }],
  "assessorComments": [{ "comment": "string", "source": "string" }]
}
```

### POST /api/generate-hypothesis

Generates brand hypothesis from findings document.

**Request Body:**
```json
{
  "findingsDocument": { ... },
  "brandName": "string"
}
```

## License

MIT
