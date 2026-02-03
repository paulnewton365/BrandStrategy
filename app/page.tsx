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
const APP_VERSION = '1.3.15';

// Antenna Logo Component
function AntennaLogo() {
  return (
    <svg width="196" height="50" viewBox="0 0 196 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="logo">
        <g id="Group">
          <path id="Vector" d="M72.0572 23.7025V11.9509H66.4941V6.25498H72.0572V0H77.6671V6.25498H84.4537V11.9509H77.6671V23.7025C77.6671 25.5907 78.7304 26.4585 80.6656 26.4585H84.4537V31.1498H80.0362C75.1534 31.1498 72.0572 28.7299 72.0572 23.7025Z" fill="#111720"/>
          <path id="Vector_2" d="M59.0079 11.9504H39.8091V5.99648H45.419V8.77603C47.5496 6.64543 51.0172 5.51172 54.5005 5.51172C59.8211 5.51172 64.6179 8.41246 64.6179 14.7026V31.1454H59.0079V11.9465V11.9504Z" fill="#111720"/>
          <g id="Group_2">
            <path id="Vector_3" d="M30.446 13.6403C30.446 11.1187 27.5608 10.1101 24.5155 10.1101C21.6616 10.1101 18.8782 11.4627 18.6358 13.6403H13.0728C13.5106 8.22188 19.144 5.5166 24.5624 5.5166C29.9807 5.5166 36.0051 7.88567 36.0051 13.8826V31.1503H30.446V13.6403Z" fill="#111720"/>
            <path id="Vector_4" d="M33.5966 19.6251L30.4496 19.3592H18.6512V31.1499H13.0764V27.2171C13.0764 19.7697 16.845 15.8486 24.5426 15.8486C28.7569 15.8486 30.9656 16.9863 33.5966 19.6173V19.6212V19.6251Z" fill="#111720"/>
          </g>
          <path id="Vector_5" d="M5.89922 25.251H0V31.1502H5.89922V25.251Z" fill="#111720"/>
          <path id="Vector_6" d="M111.839 19.3509C111.855 19.0928 111.862 18.8348 111.862 18.5729C111.862 11.3601 106.084 5.51562 98.9536 5.51562C91.823 5.51562 86.0449 11.364 86.0449 18.5729C86.0449 25.7817 91.823 31.6302 98.9536 31.6302H99.626C104.884 31.6302 109.403 28.4518 111.417 23.8896H105.834C104.454 25.7974 102.21 27.0406 99.6769 27.0406H99.0044C94.8097 27.0406 91.4086 23.6394 91.4086 19.4447C91.4086 19.4134 91.4086 19.3821 91.4086 19.3509H111.839ZM99.0044 10.1091C102.37 10.1091 105.224 12.2984 106.221 15.332H91.7878C92.7847 12.2984 95.6385 10.1091 99.0044 10.1091Z" fill="#111720"/>
          <path id="Vector_7" d="M129.74 5.51562C125.897 5.51562 122.785 6.64934 120.659 8.77994V6.00039H115.049V31.1493H120.659V16.3602C120.659 12.0482 124.49 10.3515 127.782 10.3515C131.613 10.3515 134.244 12.0482 134.244 15.8754V31.1493H139.854V14.7065C139.854 8.42028 135.061 5.51562 129.736 5.51562H129.74Z" fill="#111720"/>
          <path id="Vector_8" d="M183.599 5.51562C178.181 5.51562 172.544 8.22481 172.11 13.6393H177.673C177.915 11.4618 180.699 10.1091 183.552 10.1091C186.598 10.1091 189.483 11.1177 189.483 13.6393V17.1342C186.973 16.2546 184.741 15.8285 182.231 15.8285C174.541 15.8285 171.703 20.0702 171.703 24.2649C171.703 27.9084 173.955 30.0156 177.106 31.0555C178.259 31.4386 179.534 31.6341 180.863 31.6341C184.002 31.6341 187.247 30.5707 189.483 28.401V31.1532H195.042V13.8856C195.042 7.88861 189.26 5.51953 183.599 5.51953V5.51562ZM182.196 27.5488C179.545 27.5488 177.571 26.3877 177.501 24.0655C177.466 22.8966 177.978 21.5557 179.021 20.723C180.343 19.6675 181.52 19.3587 185.398 19.3587H189.479V21.8763C189.338 25.5159 185.554 27.5449 182.196 27.5449V27.5488Z" fill="#111720"/>
          <path id="Vector_9" d="M158.353 5.51562C154.51 5.51562 151.398 6.64934 149.271 8.77994V6.00039H143.661V31.1493H149.271V16.3602C149.271 12.0482 153.102 10.3515 156.394 10.3515C160.225 10.3515 162.856 12.0482 162.856 15.8754V31.1493H168.466V14.7065C168.466 8.42028 163.673 5.51562 158.349 5.51562H158.353Z" fill="#111720"/>
        </g>
        <g id="Group_3">
          <g id="Group_4">
            <path id="Vector_10" d="M163.001 48.0651H164.087C164.158 48.5225 164.713 49.0542 165.706 49.0542C166.699 49.0542 167.418 48.4756 167.418 47.4631V46.6656C166.972 47.2559 166.308 47.5843 165.416 47.5843C163.821 47.5843 162.688 46.3645 162.688 44.3395C162.688 42.3144 163.821 41.0947 165.416 41.0947C166.308 41.0947 166.972 41.4192 167.418 42.0134V41.2159H168.481V47.467C168.481 49.1089 167.227 50.0002 165.706 50.0002C164.185 50.0002 163.122 49.1558 163.004 48.069L163.001 48.0651ZM165.702 46.6421C166.425 46.6421 167.137 46.1964 167.414 45.5436V43.1315C167.137 42.4786 166.425 42.033 165.702 42.033C164.545 42.033 163.771 42.9126 163.771 44.3395C163.771 45.7664 164.545 46.646 165.702 46.646V46.6421Z" fill="#111720"/>
          </g>
          <g id="Group_5">
            <path id="Vector_11" d="M170.459 41.212H171.523V42.2519C171.992 41.5287 172.731 41.0947 173.501 41.0947H173.743V42.1815H173.501C172.535 42.1815 171.812 42.7132 171.523 43.3152V47.467H170.459V41.2159V41.212Z" fill="#111720"/>
          </g>
          <g id="Group_6">
            <path id="Vector_12" d="M174.525 44.3366C174.525 42.2372 175.827 41.0918 177.52 41.0918C179.213 41.0918 180.515 42.2372 180.515 44.3366C180.515 46.4359 179.213 47.5813 177.52 47.5813C175.827 47.5813 174.525 46.4359 174.525 44.3366ZM179.424 44.3366C179.424 42.8393 178.603 42.03 177.516 42.03C176.429 42.03 175.608 42.8393 175.608 44.3366C175.608 45.8339 176.429 46.6431 177.516 46.6431C178.603 46.6431 179.424 45.8339 179.424 44.3366Z" fill="#111720"/>
          </g>
          <g id="Group_7">
            <path id="Vector_13" d="M184.638 46.643C185.362 46.643 186.038 46.1582 186.304 45.7243V41.2129H187.367V47.464H186.304V46.6899C185.823 47.245 185.084 47.5812 184.302 47.5812C182.973 47.5812 182.082 46.858 182.082 45.2864V41.209H183.145V45.0714C183.145 46.1582 183.747 46.6391 184.642 46.6391L184.638 46.643Z" fill="#111720"/>
          </g>
          <g id="Group_8">
            <path id="Vector_14" d="M190.323 46.6665V49.8761H189.26V41.213H190.323V42.0105C190.769 41.4202 191.433 41.0918 192.325 41.0918C193.916 41.0918 195.053 42.3115 195.053 44.3366C195.053 46.3616 193.92 47.5813 192.325 47.5813C191.433 47.5813 190.769 47.2569 190.323 46.6626V46.6665ZM192.035 46.6431C193.193 46.6431 193.967 45.7635 193.967 44.3366C193.967 42.9097 193.193 42.03 192.035 42.03C191.312 42.03 190.601 42.4757 190.323 43.1286V45.5406C190.601 46.1935 191.312 46.6392 192.035 46.6392V46.6431Z" fill="#111720"/>
          </g>
        </g>
      </g>
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

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setFindingsDocument(data);
      setCurrentStep('findings');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze inputs. Please try again.';
      setError(errorMessage);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setBrandHypothesis(data);
      setCurrentStep('hypothesis');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate hypothesis. Please try again.';
      setError(errorMessage);
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
                      <p className="text-sm text-antenna-muted">Upload up to 10 interview transcripts (.txt, .docx)</p>
                    </div>
                    <span className="text-sm text-antenna-muted">{interviews.length}/10</span>
                  </div>

                  <label className="upload-zone block text-center mb-4">
                    <input
                      type="file"
                      multiple
                      accept=".txt,.docx"
                      onChange={(e) => e.target.files && handleInterviewUpload(e.target.files)}
                      className="hidden"
                      disabled={interviews.length >= 10}
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-antenna-muted" />
                    <p className="text-antenna-muted">
                      Drop files here or click to upload
                    </p>
                    <p className="text-xs text-antenna-muted/70 mt-1">
                      Supports .txt, .docx
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
