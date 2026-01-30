export interface StakeholderInterview {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

export interface QuestionnaireResponse {
  id: string;
  responses: Record<string, string>;
  uploadedAt: Date;
}

export interface AudienceInsight {
  id: string;
  audienceName: string;
  motivations: string;
  barriers: string;
  notes: string;
}

export interface CompetitorInsight {
  id: string;
  competitorName: string;
  positioning: string;
  strengths: string;
  weaknesses: string;
  visualStyle: string;
  toneOfVoice: string;
}

export interface AssessorComment {
  id: string;
  comment: string;
  source: string;
  uploadedAt: Date;
}

export interface BrandInputs {
  brandName: string;
  interviews: StakeholderInterview[];
  questionnaires: QuestionnaireResponse[];
  audienceInsights: AudienceInsight[];
  competitorInsights: CompetitorInsight[];
  assessorComments: AssessorComment[];
}

export interface Theme {
  title: string;
  description: string;
  quotes: string[];
}

export interface Tension {
  title: string;
  description: string;
  pole1: string;
  pole2: string;
  quotes: string[];
}

export interface Opportunity {
  title: string;
  description: string;
  rationale: string;
  supportingQuotes: string[];
}

export interface KeyPhrase {
  phrase: string;
  frequency: number;
  source: 'interview' | 'questionnaire';
  context: string;
}

export interface PositioningQuadrant {
  xAxis: {
    label: string;
    leftLabel: string;
    rightLabel: string;
  };
  yAxis: {
    label: string;
    topLabel: string;
    bottomLabel: string;
  };
  currentPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  competitors: Array<{
    name: string;
    x: number;
    y: number;
  }>;
}

export interface AudienceAnalysis {
  audienceName: string;
  disconnects: string[];
  barriers: string[];
  opportunities: string[];
}

export interface KeyFinding {
  finding: string;
  supportingQuotes: string[];
  source: 'IDI' | 'questionnaire' | 'both';
}

export interface IDIFindings {
  summary: string;
  keyInsights: string[];
  quotes: string[];
}

export interface QuestionnaireFindings {
  summary: string;
  keyInsights: string[];
  responseHighlights: string[];
}

export interface AudienceInsightFindings {
  audienceName: string;
  summary: string;
  keyInsights: string[];
}

export interface CompetitorInsightFindings {
  competitorName: string;
  positioning: string;
  keyDifferentiators: string[];
  weaknesses: string[];
}

export interface ContentAnalysis {
  wordsToUse: Array<{
    word: string;
    frequency: number;
    context: string;
  }>;
  wordsToAvoid: Array<{
    word: string;
    reason: string;
  }>;
  phrasesToUse: Array<{
    phrase: string;
    context: string;
  }>;
  phrasesToAvoid: Array<{
    phrase: string;
    reason: string;
  }>;
}

export interface FindingsDocument {
  version: string;
  brandName: string;
  executiveSummary: string;
  keyFindings: KeyFinding[];
  idiFindings: IDIFindings;
  questionnaireFindings: QuestionnaireFindings;
  audienceInsightFindings: AudienceInsightFindings[];
  competitorInsightFindings: CompetitorInsightFindings[];
  contentAnalysis: ContentAnalysis;
  themes: Theme[];
  tensions: Tension[];
  opportunities: Opportunity[];
  keyPhrases: {
    toUse: KeyPhrase[];
    toAvoid: KeyPhrase[];
  };
  audienceAnalyses: AudienceAnalysis[];
  positioningQuadrant: PositioningQuadrant;
  strategicDirection: {
    whatDirection: string;
    whyDirection: string;
    howDirection: string;
  };
  conclusion: string;
  generatedAt: Date | string;
}

export interface BrandValue {
  name: string;
  description: string;
}

export interface BrandPersonalityTrait {
  name: string;
  description: string;
}

export interface BrandHypothesis {
  version: string;
  brandName: string;
  whatStatement: string;
  whyStatement: string;
  howStatement: string;
  organizingIdea: {
    statement: string;
    breakdown: {
      word: string;
      meaning: string;
      mappedTo: 'what' | 'why' | 'how';
    }[];
  };
  whyThisWorks: string[];
  positioningStatement: string;
  brandHouse: {
    essence: string;
    promise: string;
    mission: string;
    vision: string;
    purpose: string;
    values: BrandValue[];
    personality: BrandPersonalityTrait[];
  };
  visualGuidance: string;
  toneOfVoiceGuidance: string;
  generatedAt: Date | string;
}

export interface ProjectState {
  brandInputs: BrandInputs;
  findingsDocument: FindingsDocument | null;
  brandHypothesis: BrandHypothesis | null;
  currentStep: 'inputs' | 'findings' | 'hypothesis';
}
