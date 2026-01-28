'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  Target, 
  MessageSquare, 
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Eye,
  ArrowUpRight,
  Pencil,
  Save,
  Download,
  ChevronDown
} from 'lucide-react';
import { 
  StakeholderInterview, 
  QuestionnaireResponse,
  AudienceInsight,
  CompetitorInsight,
  AssessorComment,
  FindingsDocument,
  BrandHypothesis
} from '@/types';
import { generateId, parseSpreadsheet, parseTextFile } from '@/lib/utils';
import FindingsView from '@/components/FindingsView';
import HypothesisView from '@/components/HypothesisView';

type Step = 'inputs' | 'findings' | 'hypothesis';

// App version - update with each build
const APP_VERSION = '1.1.0';

// Antenna Logo Component with signal bars SVG
function AntennaLogo() {
  return (
    <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Signal bars */}
      <rect x="0" y="22" width="4" height="8" rx="1" fill="#1a1a2e" opacity="0.4"/>
      <rect x="6" y="17" width="4" height="13" rx="1" fill="#1a1a2e" opacity="0.6"/>
      <rect x="12" y="12" width="4" height="18" rx="1" fill="#1a1a2e" opacity="0.8"/>
      <rect x="18" y="7" width="4" height="23" rx="1" fill="#1a1a2e"/>
      {/* Text */}
      <text x="28" y="24" fontFamily="DM Sans, sans-serif" fontSize="18" fontWeight="700" fill="#1a1a2e">.antenna</text>
      <text x="28" y="31" fontFamily="DM Sans, sans-serif" fontSize="8" fontWeight="500" fill="#6b6b7b" letterSpacing="1.5">GROUP</text>
    </svg>
  );
}

// Session data type
interface SessionData {
  brandName: string;
  interviews: { name: string; content: string }[];
  questionnaires: Record<string, string>[];
  audienceInsights: AudienceInsight[];
  competitorInsights: CompetitorInsight[];
  assessorComments: { comment: string; source: string }[];
  findingsDocument: FindingsDocument | null;
  brandHypothesis: BrandHypothesis | null;
  savedAt: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('inputs');
  const [showForm, setShowForm] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [interviews, setInterviews] = useState<StakeholderInterview[]>([]);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireResponse[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([]);
  const [competitorInsights, setCompetitorInsights] = useState<CompetitorInsight[]>([]);
  const [assessorComments, setAssessorComments] = useState<AssessorComment[]>([]);
  const [findingsDocument, setFindingsDocument] = useState<FindingsDocument | null>(null);
  const [brandHypothesis, setBrandHypothesis] = useState<BrandHypothesis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'interviews' | 'questionnaires' | 'audiences' | 'competitors' | 'comments'>('interviews');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save session to JSON
  const handleSaveSession = useCallback(() => {
    const sessionData: SessionData = {
      brandName,
      interviews: interviews.map(i => ({ name: i.name, content: i.content })),
      questionnaires: questionnaires.map(q => q.responses),
      audienceInsights,
      competitorInsights,
      assessorComments: assessorComments.map(c => ({ comment: c.comment, source: c.source })),
      findingsDocument,
      brandHypothesis,
      savedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandName || 'brand-strategy'}_session_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [brandName, interviews, questionnaires, audienceInsights, competitorInsights, assessorComments, findingsDocument, brandHypothesis]);

  // Load session from JSON
  const handleLoadSession = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: SessionData = JSON.parse(e.target?.result as string);
        
        setBrandName(data.brandName || '');
        setInterviews(data.interviews.map(i => ({
          id: generateId(),
          name: i.name,
          content: i.content,
          uploadedAt: new Date()
        })));
        setQuestionnaires(data.questionnaires.map(q => ({
          id: generateId(),
          responses: q,
          uploadedAt: new Date()
        })));
        setAudienceInsights(data.audienceInsights.map(a => ({ ...a, id: generateId() })));
        setCompetitorInsights(data.competitorInsights.map(c => ({ ...c, id: generateId() })));
        setAssessorComments(data.assessorComments.map(c => ({
          id: generateId(),
          comment: c.comment,
          source: c.source,
          uploadedAt: new Date()
        })));
        
        if (data.findingsDocument) {
          setFindingsDocument(data.findingsDocument);
        }
        if (data.brandHypothesis) {
          setBrandHypothesis(data.brandHypothesis);
        }

        setShowForm(true);
        if (data.brandHypothesis) {
          setCurrentStep('hypothesis');
        } else if (data.findingsDocument) {
          setCurrentStep('findings');
        } else {
          setCurrentStep('inputs');
        }

        setError(null);
      } catch (err) {
        setError('Failed to load session file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  }, []);

  // File upload handlers
  const handleInterviewUpload = useCallback(async (files: FileList) => {
    const newInterviews: StakeholderInterview[] = [];
    for (let i = 0; i < files.length && interviews.length + newInterviews.length < 10; i++) {
      const file = files[i];
      try {
        const content = await parseTextFile(file);
        newInterviews.push({
          id: generateId(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          content,
          uploadedAt: new Date()
        });
      } catch (err) {
        console.error('Error parsing file:', err);
      }
    }
    setInterviews(prev => [...prev, ...newInterviews]);
  }, [interviews.length]);

  const handleQuestionnaireUpload = useCallback(async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const data = await parseSpreadsheet(file);
        const newQuestionnaires: QuestionnaireResponse[] = data.map(row => ({
          id: generateId(),
          responses: row,
          uploadedAt: new Date()
        }));
        setQuestionnaires(prev => [...prev, ...newQuestionnaires]);
      } catch (err) {
        console.error('Error parsing spreadsheet:', err);
      }
    }
  }, []);

  const addAudienceInsight = useCallback(() => {
    setAudienceInsights(prev => [...prev, {
      id: generateId(),
      audienceName: '',
      motivations: '',
      barriers: '',
      notes: ''
    }]);
  }, []);

  const updateAudienceInsight = useCallback((id: string, field: keyof AudienceInsight, value: string) => {
    setAudienceInsights(prev => prev.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  }, []);

  const removeAudienceInsight = useCallback((id: string) => {
    setAudienceInsights(prev => prev.filter(a => a.id !== id));
  }, []);

  const addCompetitorInsight = useCallback(() => {
    setCompetitorInsights(prev => [...prev, {
      id: generateId(),
      competitorName: '',
      positioning: '',
      strengths: '',
      weaknesses: '',
      visualStyle: '',
      toneOfVoice: ''
    }]);
  }, []);

  const updateCompetitorInsight = useCallback((id: string, field: keyof CompetitorInsight, value: string) => {
    setCompetitorInsights(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  }, []);

  const removeCompetitorInsight = useCallback((id: string) => {
    setCompetitorInsights(prev => prev.filter(c => c.id !== id));
  }, []);

  const addAssessorComment = useCallback(() => {
    setAssessorComments(prev => [...prev, {
      id: generateId(),
      comment: '',
      source: '',
      uploadedAt: new Date()
    }]);
  }, []);

  const updateAssessorComment = useCallback((id: string, field: keyof AssessorComment, value: string) => {
    setAssessorComments(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  }, []);

  const removeAssessorComment = useCallback((id: string) => {
    setAssessorComments(prev => prev.filter(c => c.id !== id));
  }, []);

  const removeInterview = useCallback((id: string) => {
    setInterviews(prev => prev.filter(i => i.id !== id));
  }, []);

  // Analysis handler
  const handleAnalyze = useCallback(async () => {
    if (!brandName.trim()) {
      setError('Please enter a brand name');
      return;
    }
    if (interviews.length === 0) {
      setError('Please upload at least one stakeholder interview');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          interviews: interviews.map(i => ({ name: i.name, content: i.content })),
          questionnaires: questionnaires.map(q => q.responses),
          audienceInsights: audienceInsights.filter(a => a.audienceName.trim()),
          competitorInsights: competitorInsights.filter(c => c.competitorName.trim()),
          assessorComments: assessorComments.filter(c => c.comment.trim()).map(c => ({
            comment: c.comment,
            source: c.source
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setFindingsDocument(data);
      setCurrentStep('findings');
    } catch (err) {
      setError('Failed to analyze inputs. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [brandName, interviews, questionnaires, audienceInsights, competitorInsights, assessorComments]);

  // Generate hypothesis handler
  const handleGenerateHypothesis = useCallback(async () => {
    if (!findingsDocument) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-hypothesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          findingsDocument,
          brandName
        })
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setBrandHypothesis(data);
      setCurrentStep('hypothesis');
    } catch (err) {
      setError('Failed to generate hypothesis. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [findingsDocument, brandName]);

  const canProceed = brandName.trim() && interviews.length > 0;

  return (
    <div className="min-h-screen bg-antenna-bg">
      {/* Hidden file input for loading sessions */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoadSession}
        className="hidden"
      />

      {/* Header */}
      <header className="py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <AntennaLogo />
          <div />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 pb-24">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Landing Page */}
        {currentStep === 'inputs' && !showForm && (
          <div className="animate-fade-in pt-16">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-antenna-dark mb-6">
                Brand Strategy Builder
              </h1>
              <p className="text-lg text-antenna-muted max-w-2xl mx-auto leading-relaxed">
                Generate brand strategy hypotheses from stakeholder research.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              {/* New Analysis Card */}
              <div className="card p-8 text-center">
                <div className="icon-box mx-auto">
                  <Pencil strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-antenna-dark mb-3">
                  Start New Analysis
                </h2>
                <p className="text-antenna-muted mb-6 leading-relaxed">
                  Upload stakeholder IDI transcripts and questionnaire responses. AI analyzes the research to identify themes, tensions, and opportunities.
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="btn-primary w-full mb-4"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary w-full"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Load Previous Session
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        {currentStep === 'inputs' && showForm && (
          <div className="animate-fade-in">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-3 mb-12 pt-4">
              <div className="flex items-center gap-2">
                <div className="progress-step active">1</div>
                <span className="text-sm font-medium text-antenna-dark">Inputs</span>
              </div>
              <div className="w-12 h-px bg-antenna-border" />
              <div className="flex items-center gap-2">
                <div className="progress-step pending">2</div>
                <span className="text-sm text-antenna-muted">Findings</span>
              </div>
              <div className="w-12 h-px bg-antenna-border" />
              <div className="flex items-center gap-2">
                <div className="progress-step pending">3</div>
                <span className="text-sm text-antenna-muted">Hypothesis</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex items-center gap-2 text-antenna-muted hover:text-antenna-dark mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <h2 className="text-3xl font-display font-bold text-antenna-dark mb-2">
                  Research Inputs
                </h2>
                <p className="text-antenna-muted">
                  Upload stakeholder interviews, questionnaire responses, and other research materials.
                </p>
              </div>
              <button
                onClick={handleSaveSession}
                className="btn-secondary flex items-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Session
                </span>
              </button>
            </div>

            {/* Brand Name */}
            <div className="card p-6 mb-6">
              <label className="label">Brand Name *</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter the brand name"
                className="input-field max-w-md"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-antenna-border overflow-x-auto">
              {[
                { id: 'interviews', label: 'IDI Transcripts', icon: FileText, count: interviews.length },
                { id: 'questionnaires', label: 'Questionnaires', icon: MessageSquare, count: questionnaires.length },
                { id: 'audiences', label: 'Audiences', icon: Users, count: audienceInsights.length },
                { id: 'competitors', label: 'Competitors', icon: Target, count: competitorInsights.length },
                { id: 'comments', label: 'Assessor Comments', icon: MessageSquare, count: assessorComments.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                    ${activeTab === tab.id ? 'tab-active' : 'text-antenna-muted hover:text-antenna-dark'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="px-2 py-0.5 bg-antenna-dark text-white rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="card p-6">
              {/* Interviews Tab */}
              {activeTab === 'interviews' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-antenna-dark">Stakeholder Interview Transcripts</h3>
                      <p className="text-sm text-antenna-muted">Upload up to 10 interview transcripts (.txt files)</p>
                    </div>
                    <span className="text-sm text-antenna-muted">{interviews.length}/10</span>
                  </div>

                  <label className="upload-zone block text-center mb-4">
                    <input
                      type="file"
                      multiple
                      accept=".txt,.doc,.docx"
                      onChange={(e) => e.target.files && handleInterviewUpload(e.target.files)}
                      className="hidden"
                      disabled={interviews.length >= 10}
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-antenna-muted" />
                    <p className="text-antenna-muted">
                      Drop files here or click to upload
                    </p>
                  </label>

                  {interviews.length > 0 && (
                    <div className="space-y-2">
                      {interviews.map((interview) => (
                        <div key={interview.id} className="flex items-center justify-between p-3 bg-antenna-bg rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-antenna-dark" />
                            <span className="text-sm font-medium text-antenna-dark">{interview.name}</span>
                          </div>
                          <button
                            onClick={() => removeInterview(interview.id)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-antenna-muted hover:text-antenna-error" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Questionnaires Tab */}
              {activeTab === 'questionnaires' && (
                <div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-antenna-dark">Questionnaire Responses</h3>
                    <p className="text-sm text-antenna-muted">Upload spreadsheet exports from Smartsheet or similar (.xlsx, .csv)</p>
                  </div>

                  <label className="upload-zone block text-center mb-4">
                    <input
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => e.target.files && handleQuestionnaireUpload(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-antenna-muted" />
                    <p className="text-antenna-muted">
                      Drop spreadsheet files here or click to upload
                    </p>
                  </label>

                  {questionnaires.length > 0 && (
                    <p className="text-sm text-antenna-dark font-medium">
                      {questionnaires.length} responses loaded
                    </p>
                  )}
                </div>
              )}

              {/* Audiences Tab */}
              {activeTab === 'audiences' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-antenna-dark">Primary Audience Insights</h3>
                      <p className="text-sm text-antenna-muted">Define key audience segments and their characteristics</p>
                    </div>
                    <button onClick={addAudienceInsight} className="btn-secondary">
                      <span className="relative z-10 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Audience
                      </span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {audienceInsights.map((audience) => (
                      <div key={audience.id} className="p-4 border border-antenna-border rounded-xl bg-antenna-bg/50">
                        <div className="flex items-start justify-between mb-3">
                          <input
                            type="text"
                            value={audience.audienceName}
                            onChange={(e) => updateAudienceInsight(audience.id, 'audienceName', e.target.value)}
                            placeholder="Audience Name"
                            className="input-field max-w-xs"
                          />
                          <button
                            onClick={() => removeAudienceInsight(audience.id)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-antenna-muted hover:text-antenna-error" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">Motivations</label>
                            <textarea
                              value={audience.motivations}
                              onChange={(e) => updateAudienceInsight(audience.id, 'motivations', e.target.value)}
                              placeholder="What motivates this audience?"
                              className="input-field h-24 resize-none"
                            />
                          </div>
                          <div>
                            <label className="label">Barriers</label>
                            <textarea
                              value={audience.barriers}
                              onChange={(e) => updateAudienceInsight(audience.id, 'barriers', e.target.value)}
                              placeholder="What barriers exist for this audience?"
                              className="input-field h-24 resize-none"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="label">Additional Notes</label>
                          <textarea
                            value={audience.notes}
                            onChange={(e) => updateAudienceInsight(audience.id, 'notes', e.target.value)}
                            placeholder="Any other relevant insights"
                            className="input-field h-16 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitors Tab */}
              {activeTab === 'competitors' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-antenna-dark">Competitor Insights</h3>
                      <p className="text-sm text-antenna-muted">Analyze competitive positioning and characteristics</p>
                    </div>
                    <button onClick={addCompetitorInsight} className="btn-secondary">
                      <span className="relative z-10 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Competitor
                      </span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {competitorInsights.map((competitor) => (
                      <div key={competitor.id} className="p-4 border border-antenna-border rounded-xl bg-antenna-bg/50">
                        <div className="flex items-start justify-between mb-3">
                          <input
                            type="text"
                            value={competitor.competitorName}
                            onChange={(e) => updateCompetitorInsight(competitor.id, 'competitorName', e.target.value)}
                            placeholder="Competitor Name"
                            className="input-field max-w-xs"
                          />
                          <button
                            onClick={() => removeCompetitorInsight(competitor.id)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-antenna-muted hover:text-antenna-error" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">Positioning</label>
                            <textarea
                              value={competitor.positioning}
                              onChange={(e) => updateCompetitorInsight(competitor.id, 'positioning', e.target.value)}
                              placeholder="How do they position themselves?"
                              className="input-field h-20 resize-none"
                            />
                          </div>
                          <div>
                            <label className="label">Strengths</label>
                            <textarea
                              value={competitor.strengths}
                              onChange={(e) => updateCompetitorInsight(competitor.id, 'strengths', e.target.value)}
                              placeholder="What are their key strengths?"
                              className="input-field h-20 resize-none"
                            />
                          </div>
                          <div>
                            <label className="label">Weaknesses</label>
                            <textarea
                              value={competitor.weaknesses}
                              onChange={(e) => updateCompetitorInsight(competitor.id, 'weaknesses', e.target.value)}
                              placeholder="What are their weaknesses?"
                              className="input-field h-20 resize-none"
                            />
                          </div>
                          <div>
                            <label className="label">Visual Style / Tone</label>
                            <textarea
                              value={competitor.visualStyle}
                              onChange={(e) => updateCompetitorInsight(competitor.id, 'visualStyle', e.target.value)}
                              placeholder="Describe their visual and verbal style"
                              className="input-field h-20 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-antenna-dark">Assessor Comments</h3>
                      <p className="text-sm text-antenna-muted">Add observations and commentary from assessors</p>
                    </div>
                    <button onClick={addAssessorComment} className="btn-secondary">
                      <span className="relative z-10 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Comment
                      </span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {assessorComments.map((comment) => (
                      <div key={comment.id} className="p-4 border border-antenna-border rounded-xl bg-antenna-bg/50">
                        <div className="flex items-start justify-between mb-3">
                          <input
                            type="text"
                            value={comment.source}
                            onChange={(e) => updateAssessorComment(comment.id, 'source', e.target.value)}
                            placeholder="Source / Assessor"
                            className="input-field max-w-xs"
                          />
                          <button
                            onClick={() => removeAssessorComment(comment.id)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-antenna-muted hover:text-antenna-error" />
                          </button>
                        </div>
                        <textarea
                          value={comment.comment}
                          onChange={(e) => updateAssessorComment(comment.id, 'comment', e.target.value)}
                          placeholder="Enter the comment or observation"
                          className="input-field h-24 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!canProceed || isAnalyzing}
                className="btn-primary"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Generate Findings
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Findings */}
        {currentStep === 'findings' && findingsDocument && (
          <div className="animate-fade-in">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-3 mb-12 pt-4">
              <div className="flex items-center gap-2">
                <div className="progress-step completed"><Check className="w-4 h-4" /></div>
                <span className="text-sm text-antenna-muted">Inputs</span>
              </div>
              <div className="w-12 h-px bg-antenna-border" />
              <div className="flex items-center gap-2">
                <div className="progress-step active">2</div>
                <span className="text-sm font-medium text-antenna-dark">Findings</span>
              </div>
              <div className="w-12 h-px bg-antenna-border" />
              <div className="flex items-center gap-2">
                <div className="progress-step pending">3</div>
                <span className="text-sm text-antenna-muted">Hypothesis</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => { setCurrentStep('inputs'); setShowForm(true); }}
                  className="flex items-center gap-2 text-antenna-muted hover:text-antenna-dark mb-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Inputs
                </button>
                <h2 className="text-3xl font-display font-bold text-antenna-dark">Findings Document</h2>
                <p className="text-antenna-muted">Version {findingsDocument.version}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveSession}
                  className="btn-secondary"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Session
                  </span>
                </button>
                <button
                  onClick={() => { setCurrentStep('inputs'); setShowForm(true); }}
                  className="btn-secondary"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Add More Inputs
                  </span>
                </button>
                <button
                  onClick={handleGenerateHypothesis}
                  disabled={isGenerating}
                  className="btn-primary"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Hypothesis
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            <FindingsView findings={findingsDocument} brandName={brandName} />
          </div>
        )}

        {/* Step 3: Hypothesis */}
        {currentStep === 'hypothesis' && brandHypothesis && (
          <div className="animate-fade-in">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-3 mb-12 pt-4">
              <div className="flex items-center gap-2">
                <div className="progress-step completed"><Check className="w-4 h-4" /></div>
                <span className="text-sm text-antenna-muted">Inputs</span>
              </div>
              <div className="w-12 h-px bg-antenna-border" />
              <div className="flex items-center gap-2">
                <div className="progress-step completed"><Check className="w-4 h-4" /></div>
                <span className="text-sm text-antenna-muted">Findings</span>
              </div>
              <div className="w-12 h-px bg-antenna-border" />
              <div className="flex items-center gap-2">
                <div className="progress-step active">3</div>
                <span className="text-sm font-medium text-antenna-dark">Hypothesis</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => setCurrentStep('findings')}
                  className="flex items-center gap-2 text-antenna-muted hover:text-antenna-dark mb-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Findings
                </button>
                <h2 className="text-3xl font-display font-bold text-antenna-dark">Brand Strategy Hypothesis</h2>
                <p className="text-antenna-muted">Version {brandHypothesis.version}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveSession}
                  className="btn-secondary"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Session
                  </span>
                </button>
                <button
                  onClick={() => setCurrentStep('findings')}
                  className="btn-secondary"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Findings
                  </span>
                </button>
              </div>
            </div>

            <HypothesisView hypothesis={brandHypothesis} brandName={brandName} />
          </div>
        )}
      </main>

      {/* Version Badge */}
      <div className="version-badge">
        v{APP_VERSION}
      </div>
    </div>
  );
}
