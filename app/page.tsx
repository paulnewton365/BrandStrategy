'use client';

import React, { useState, useCallback } from 'react';
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
  Download,
  RefreshCw,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { 
  BrandInputs, 
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
import QuadrantChart from '@/components/QuadrantChart';

type Step = 'inputs' | 'findings' | 'hypothesis';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('inputs');
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
    <div className="min-h-screen bg-brand-paper">
      {/* Header */}
      <header className="border-b border-brand-warm bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-display font-semibold text-brand-ink">
                Brand Strategy Builder
              </h1>
              {brandName && (
                <span className="px-3 py-1 bg-brand-warm rounded-full text-sm text-brand-muted">
                  {brandName}
                </span>
              )}
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              <div className={`progress-step ${currentStep === 'inputs' ? 'active' : findingsDocument ? 'completed' : 'pending'}`}>
                {findingsDocument ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className="w-8 h-0.5 bg-brand-warm" />
              <div className={`progress-step ${currentStep === 'findings' ? 'active' : brandHypothesis ? 'completed' : 'pending'}`}>
                {brandHypothesis ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="w-8 h-0.5 bg-brand-warm" />
              <div className={`progress-step ${currentStep === 'hypothesis' ? 'active' : 'pending'}`}>
                3
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Inputs */}
        {currentStep === 'inputs' && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="section-title mb-2">Research Inputs</h2>
              <p className="text-brand-muted">
                Upload stakeholder interviews, questionnaire responses, and other research materials.
              </p>
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
            <div className="flex gap-1 mb-6 border-b border-brand-warm">
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
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                    ${activeTab === tab.id ? 'tab-active' : 'text-brand-muted hover:text-brand-ink'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full text-xs">
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
                      <h3 className="font-medium text-brand-ink">Stakeholder Interview Transcripts</h3>
                      <p className="text-sm text-brand-muted">Upload up to 10 interview transcripts (.txt files)</p>
                    </div>
                    <span className="text-sm text-brand-muted">{interviews.length}/10</span>
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
                    <Upload className="w-8 h-8 mx-auto mb-2 text-brand-muted" />
                    <p className="text-brand-muted">
                      Drop files here or click to upload
                    </p>
                  </label>

                  {interviews.length > 0 && (
                    <div className="space-y-2">
                      {interviews.map((interview) => (
                        <div key={interview.id} className="flex items-center justify-between p-3 bg-brand-warm/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-brand-muted" />
                            <span className="text-sm font-medium">{interview.name}</span>
                          </div>
                          <button
                            onClick={() => removeInterview(interview.id)}
                            className="p-1 hover:bg-brand-warm rounded"
                          >
                            <Trash2 className="w-4 h-4 text-brand-muted" />
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
                    <h3 className="font-medium text-brand-ink">Questionnaire Responses</h3>
                    <p className="text-sm text-brand-muted">Upload spreadsheet exports from Smartsheet or similar (.xlsx, .csv)</p>
                  </div>

                  <label className="upload-zone block text-center mb-4">
                    <input
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => e.target.files && handleQuestionnaireUpload(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-brand-muted" />
                    <p className="text-brand-muted">
                      Drop spreadsheet files here or click to upload
                    </p>
                  </label>

                  {questionnaires.length > 0 && (
                    <p className="text-sm text-brand-muted">
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
                      <h3 className="font-medium text-brand-ink">Primary Audience Insights</h3>
                      <p className="text-sm text-brand-muted">Define key audience segments and their characteristics</p>
                    </div>
                    <button onClick={addAudienceInsight} className="btn-secondary flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Audience
                    </button>
                  </div>

                  <div className="space-y-4">
                    {audienceInsights.map((audience) => (
                      <div key={audience.id} className="p-4 border border-brand-warm rounded-lg">
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
                            className="p-1 hover:bg-brand-warm rounded"
                          >
                            <Trash2 className="w-4 h-4 text-brand-muted" />
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
                      <h3 className="font-medium text-brand-ink">Competitor Insights</h3>
                      <p className="text-sm text-brand-muted">Analyze competitive positioning and characteristics</p>
                    </div>
                    <button onClick={addCompetitorInsight} className="btn-secondary flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Competitor
                    </button>
                  </div>

                  <div className="space-y-4">
                    {competitorInsights.map((competitor) => (
                      <div key={competitor.id} className="p-4 border border-brand-warm rounded-lg">
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
                            className="p-1 hover:bg-brand-warm rounded"
                          >
                            <Trash2 className="w-4 h-4 text-brand-muted" />
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
                      <h3 className="font-medium text-brand-ink">Assessor Comments</h3>
                      <p className="text-sm text-brand-muted">Add observations and commentary from assessors</p>
                    </div>
                    <button onClick={addAssessorComment} className="btn-secondary flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Comment
                    </button>
                  </div>

                  <div className="space-y-4">
                    {assessorComments.map((comment) => (
                      <div key={comment.id} className="p-4 border border-brand-warm rounded-lg">
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
                            className="p-1 hover:bg-brand-warm rounded"
                          >
                            <Trash2 className="w-4 h-4 text-brand-muted" />
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
                className="btn-primary flex items-center gap-2"
              >
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
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Findings */}
        {currentStep === 'findings' && findingsDocument && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => setCurrentStep('inputs')}
                  className="flex items-center gap-2 text-brand-muted hover:text-brand-ink mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Inputs
                </button>
                <h2 className="section-title">Findings Document</h2>
                <p className="text-brand-muted">Version {findingsDocument.version}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep('inputs')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Add More Inputs
                </button>
                <button
                  onClick={handleGenerateHypothesis}
                  disabled={isGenerating}
                  className="btn-primary flex items-center gap-2"
                >
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
                </button>
              </div>
            </div>

            <FindingsView findings={findingsDocument} />
          </div>
        )}

        {/* Step 3: Hypothesis */}
        {currentStep === 'hypothesis' && brandHypothesis && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => setCurrentStep('findings')}
                  className="flex items-center gap-2 text-brand-muted hover:text-brand-ink mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Findings
                </button>
                <h2 className="section-title">Brand Strategy Hypothesis</h2>
                <p className="text-brand-muted">Version {brandHypothesis.version}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep('findings')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Findings
                </button>
              </div>
            </div>

            <HypothesisView hypothesis={brandHypothesis} />
          </div>
        )}
      </main>
    </div>
  );
}
