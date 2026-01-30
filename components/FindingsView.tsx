'use client';

import React, { useRef, useState } from 'react';
import { Download, Quote, TrendingUp, AlertTriangle, Lightbulb, Users, Target, FileText, ChevronDown, FileType, File, MessageSquare, BarChart3, Eye, Crosshair } from 'lucide-react';
import { FindingsDocument } from '@/types';
import QuadrantChart from './QuadrantChart';
import { formatDate, sanitizeForPDF } from '@/lib/utils';
import { generateFindingsDocx } from '@/lib/docxExport';

interface FindingsViewProps {
  findings: FindingsDocument;
  brandName: string;
}

export default function FindingsView({ findings, brandName }: FindingsViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Defensive: ensure findings exists
  if (!findings) {
    return <div className="card p-8 text-center text-antenna-muted">No findings data available.</div>;
  }

  const handleExportPDF = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    if (typeof window !== 'undefined') {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      if (contentRef.current) {
        const canvas = await html2canvas(contentRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#f0ede8'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let position = 0;
        let heightLeft = imgHeight;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }
        
        pdf.save(`${brandName}_Findings_v${findings.version || '1.0.0'}.pdf`);
      }
    }
    setIsExporting(false);
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const blob = await generateFindingsDocx(findings);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandName}_Findings_v${findings.version || '1.0.0'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting DOCX:', err);
    }
    
    setIsExporting(false);
  };

  // Safe accessors with defaults
  const keyFindings = findings.keyFindings || [];
  const idiFindings = findings.idiFindings || { summary: '', keyInsights: [], quotes: [] };
  const questionnaireFindings = findings.questionnaireFindings || { summary: '', keyInsights: [], responseHighlights: [] };
  const audienceInsightFindings = findings.audienceInsightFindings || [];
  const competitorInsightFindings = findings.competitorInsightFindings || [];
  const contentAnalysis = findings.contentAnalysis || { wordsToUse: [], wordsToAvoid: [], phrasesToUse: [], phrasesToAvoid: [] };
  const themes = findings.themes || [];
  const tensions = findings.tensions || [];
  const opportunities = findings.opportunities || [];
  const keyPhrasesToUse = findings.keyPhrases?.toUse || [];
  const keyPhrasesToAvoid = findings.keyPhrases?.toAvoid || [];
  const audienceAnalyses = findings.audienceAnalyses || [];
  const strategicDirection = findings.strategicDirection || {};

  // Helper function to safely convert to array
  const toArray = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (value !== null && value !== undefined && value !== '') {
      return [value] as T[];
    }
    return [];
  };

  // Helper for string arrays specifically
  const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(v => String(v));
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
  };

  return (
    <div>
      <div className="flex justify-end mb-4 no-print relative">
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="btn-secondary"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
              <ChevronDown className="w-4 h-4" />
            </span>
          </button>
          
          {showExportMenu && (
            <div className="export-dropdown">
              <button onClick={handleExportPDF}>
                <File className="w-4 h-4 text-red-500" />
                Export as PDF
              </button>
              <button onClick={handleExportDocx}>
                <FileType className="w-4 h-4 text-blue-500" />
                Export as Word (.docx)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowExportMenu(false)}
        />
      )}

      <div ref={contentRef} className="space-y-6">
        {/* Header */}
        <div className="card p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-antenna-dark mb-2">
                {brandName} Brand Analysis
              </h1>
              <p className="text-antenna-muted">Stakeholder Interview Findings</p>
            </div>
            <div className="text-right text-sm text-antenna-muted">
              <p className="tag mb-2">v{findings.version || '1.0.0'}</p>
              <p>{findings.generatedAt ? formatDate(findings.generatedAt) : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {findings.executiveSummary && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <FileText strokeWidth={1.5} />
              </div>
              Executive Summary
            </h2>
            <p className="text-antenna-text leading-relaxed">
              {sanitizeForPDF(findings.executiveSummary)}
            </p>
          </div>
        )}

        {/* Key Findings */}
        {keyFindings.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <Lightbulb strokeWidth={1.5} />
              </div>
              Key Findings
            </h2>
            <div className="space-y-6">
              {keyFindings.map((finding, index) => (
                <div key={index} className="border-l-4 border-antenna-accent pl-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-antenna-dark">{sanitizeForPDF(finding.title || `Finding ${index + 1}`)}</h3>
                    <span className="tag text-xs">{finding.source || 'Research'}</span>
                  </div>
                  <p className="text-antenna-muted mb-3">{sanitizeForPDF(finding.finding)}</p>
                  {toArray(finding?.supportingQuotes).length > 0 && (
                    <div className="space-y-2">
                      {toArray(finding?.supportingQuotes).map((quote, qi) => (
                        <blockquote key={qi} className="flex items-start gap-3 text-sm italic text-antenna-muted bg-antenna-bg p-3 rounded-lg">
                          <Quote className="w-4 h-4 flex-shrink-0 mt-1 text-antenna-muted" />
                          <span>"{sanitizeForPDF(quote)}"</span>
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IDI Findings */}
        {(idiFindings.summary || toArray(idiFindings?.keyInsights).length > 0) && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <MessageSquare strokeWidth={1.5} />
              </div>
              In-Depth Interview Findings
            </h2>
            {idiFindings.summary && (
              <p className="text-antenna-text mb-6">{sanitizeForPDF(idiFindings.summary)}</p>
            )}
            {toArray(idiFindings?.keyInsights).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-antenna-dark mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {toArray(idiFindings?.keyInsights).map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-antenna-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-antenna-accent mt-2 flex-shrink-0" />
                      {sanitizeForPDF(insight)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {toArray(idiFindings?.quotes).length > 0 && (
              <div>
                <h3 className="font-semibold text-antenna-dark mb-3">Notable Quotes</h3>
                <div className="space-y-2">
                  {toArray(idiFindings?.quotes).map((quote, i) => (
                    <blockquote key={i} className="flex items-start gap-3 text-sm italic text-antenna-muted bg-antenna-bg p-3 rounded-lg">
                      <Quote className="w-4 h-4 flex-shrink-0 mt-1" />
                      <span>"{sanitizeForPDF(quote)}"</span>
                    </blockquote>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questionnaire Findings */}
        {(questionnaireFindings.summary || toArray(questionnaireFindings?.keyInsights).length > 0) && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <BarChart3 strokeWidth={1.5} />
              </div>
              Questionnaire Findings
            </h2>
            {questionnaireFindings.summary && (
              <p className="text-antenna-text mb-6">{sanitizeForPDF(questionnaireFindings.summary)}</p>
            )}
            {toArray(questionnaireFindings?.keyInsights).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-antenna-dark mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {toArray(questionnaireFindings?.keyInsights).map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-antenna-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-antenna-accent mt-2 flex-shrink-0" />
                      {sanitizeForPDF(insight)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {toArray(questionnaireFindings?.responseHighlights).length > 0 && (
              <div>
                <h3 className="font-semibold text-antenna-dark mb-3">Response Highlights</h3>
                <ul className="space-y-2">
                  {toArray(questionnaireFindings?.responseHighlights).map((highlight, i) => (
                    <li key={i} className="text-sm text-antenna-muted bg-antenna-bg p-3 rounded-lg">
                      {sanitizeForPDF(highlight)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Audience Insight Findings */}
        {audienceInsightFindings.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <Users strokeWidth={1.5} />
              </div>
              Audience Insights
            </h2>
            <div className="space-y-6">
              {audienceInsightFindings.map((audience, index) => (
                <div key={index} className="p-5 border border-antenna-border rounded-xl">
                  <h3 className="font-semibold text-antenna-dark mb-3">{audience.audienceName || 'Audience'}</h3>
                  {audience.summary && (
                    <p className="text-antenna-muted mb-4">{sanitizeForPDF(audience.summary)}</p>
                  )}
                  {toArray(audience?.keyInsights).length > 0 && (
                    <ul className="space-y-2">
                      {toArray(audience?.keyInsights).map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-antenna-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-antenna-accent mt-1.5 flex-shrink-0" />
                          {sanitizeForPDF(insight)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitor Insight Findings */}
        {competitorInsightFindings.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <Crosshair strokeWidth={1.5} />
              </div>
              Competitor Insights
            </h2>
            <div className="space-y-6">
              {competitorInsightFindings.map((competitor, index) => {
                const differentiators = toArray(competitor?.keyDifferentiators);
                const weaknesses = toArray(competitor?.weaknesses);
                return (
                  <div key={index} className="p-5 border border-antenna-border rounded-xl">
                    <h3 className="font-semibold text-antenna-dark mb-3">{competitor.competitorName || 'Competitor'}</h3>
                    {competitor.positioning && (
                      <p className="text-antenna-muted mb-4">
                        <span className="font-medium text-antenna-dark">Positioning: </span>
                        {sanitizeForPDF(competitor.positioning)}
                      </p>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      {differentiators.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-green-600 mb-2">Key Differentiators</h4>
                          <ul className="space-y-1">
                            {differentiators.map((diff, i) => (
                              <li key={i} className="text-sm text-antenna-muted">• {sanitizeForPDF(diff)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {weaknesses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-600 mb-2">Weaknesses</h4>
                          <ul className="space-y-1">
                            {weaknesses.map((weak, i) => (
                              <li key={i} className="text-sm text-antenna-muted">• {sanitizeForPDF(weak)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Analysis */}
        {(Array.isArray(contentAnalysis.wordsToUse) && contentAnalysis.wordsToUse.length > 0 || 
          Array.isArray(contentAnalysis.wordsToAvoid) && contentAnalysis.wordsToAvoid.length > 0 || 
          Array.isArray(contentAnalysis.phrasesToUse) && contentAnalysis.phrasesToUse.length > 0 || 
          Array.isArray(contentAnalysis.phrasesToAvoid) && contentAnalysis.phrasesToAvoid.length > 0) && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <Eye strokeWidth={1.5} />
              </div>
              Content Analysis
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Words to Use */}
              {Array.isArray(contentAnalysis.wordsToUse) && contentAnalysis.wordsToUse.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Words to Use
                  </h3>
                  <div className="space-y-2">
                    {contentAnalysis.wordsToUse.map((item, i) => (
                      <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-800">"{item?.word || ''}"</p>
                        {item?.frequency && <p className="text-xs text-green-600">Used {item.frequency}x</p>}
                        {item?.context && <p className="text-sm text-green-700/70 mt-1">{sanitizeForPDF(item.context)}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Words to Avoid */}
              {Array.isArray(contentAnalysis.wordsToAvoid) && contentAnalysis.wordsToAvoid.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Words to Avoid
                  </h3>
                  <div className="space-y-2">
                    {contentAnalysis.wordsToAvoid.map((item, i) => (
                      <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">"{item?.word || ''}"</p>
                        {item?.reason && <p className="text-sm text-red-700/70 mt-1">{sanitizeForPDF(item.reason)}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Phrases to Use */}
              {Array.isArray(contentAnalysis.phrasesToUse) && contentAnalysis.phrasesToUse.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Phrases to Use
                  </h3>
                  <div className="space-y-2">
                    {contentAnalysis.phrasesToUse.map((item, i) => (
                      <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-800">"{item?.phrase || ''}"</p>
                        {item?.context && <p className="text-sm text-green-700/70 mt-1">{sanitizeForPDF(item.context)}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Phrases to Avoid */}
              {Array.isArray(contentAnalysis.phrasesToAvoid) && contentAnalysis.phrasesToAvoid.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Phrases to Avoid
                  </h3>
                  <div className="space-y-2">
                    {contentAnalysis.phrasesToAvoid.map((item, i) => (
                      <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">"{item?.phrase || ''}"</p>
                        {item?.reason && <p className="text-sm text-red-700/70 mt-1">{sanitizeForPDF(item.reason)}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Themes */}
        {themes.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <TrendingUp strokeWidth={1.5} />
              </div>
              Key Themes
            </h2>
            <div className="space-y-6">
              {themes.map((theme, index) => (
                <div key={index} className="border-l-4 border-antenna-dark pl-6">
                  <h3 className="font-semibold text-antenna-dark mb-2">{index + 1}. {theme.title || 'Untitled Theme'}</h3>
                  <p className="text-antenna-muted mb-4">{sanitizeForPDF(theme.description || '')}</p>
                  {theme.quotes && theme.quotes.length > 0 && (
                    <div className="space-y-2">
                      {theme.quotes.map((quote, qi) => (
                        <blockquote key={qi} className="flex items-start gap-3 text-sm italic text-antenna-muted bg-antenna-bg p-3 rounded-lg">
                          <Quote className="w-4 h-4 flex-shrink-0 mt-1 text-antenna-muted" />
                          <span>"{sanitizeForPDF(quote)}"</span>
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Tensions */}
        {tensions.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <AlertTriangle strokeWidth={1.5} />
              </div>
              Brand Tensions
            </h2>
            <div className="space-y-6">
              {tensions.map((tension, index) => {
                // Only show poles if they have actual values (not "Pole 1" / "Pole 2")
                const pole1Valid = tension.pole1 && tension.pole1 !== 'Pole 1' && tension.pole1.toLowerCase() !== 'pole 1';
                const pole2Valid = tension.pole2 && tension.pole2 !== 'Pole 2' && tension.pole2.toLowerCase() !== 'pole 2';
                const showPoles = pole1Valid && pole2Valid;
                
                return (
                  <div key={index} className="p-6 bg-antenna-bg rounded-xl">
                    <h3 className="font-semibold text-antenna-dark text-lg mb-3">{tension.title || 'Untitled Tension'}</h3>
                    {showPoles && (
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-3 py-1 bg-white text-antenna-dark rounded-full text-sm font-medium shadow-card">
                          {tension.pole1}
                        </span>
                        <span className="text-antenna-muted">vs</span>
                        <span className="px-3 py-1 bg-white text-antenna-dark rounded-full text-sm font-medium shadow-card">
                          {tension.pole2}
                        </span>
                      </div>
                    )}
                    {tension.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-antenna-dark mb-2">The Challenge</h4>
                        <p className="text-antenna-muted">{sanitizeForPDF(tension.description)}</p>
                      </div>
                    )}
                    {tension.reconciliation && (
                      <div className="mb-4 p-4 bg-white rounded-lg border border-antenna-border">
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          How to Reconcile
                        </h4>
                        <p className="text-antenna-muted">{sanitizeForPDF(tension.reconciliation)}</p>
                      </div>
                    )}
                    {tension.quotes && tension.quotes.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-antenna-border/50">
                        <p className="text-xs font-medium text-antenna-muted uppercase tracking-wide mb-2">Supporting Evidence</p>
                        {tension.quotes.map((quote, qi) => (
                          <blockquote key={qi} className="flex items-start gap-3 text-sm italic text-antenna-muted">
                            <Quote className="w-4 h-4 flex-shrink-0 mt-1" />
                            <span>"{sanitizeForPDF(quote)}"</span>
                          </blockquote>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strategic Opportunities */}
        {opportunities.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <Target strokeWidth={1.5} />
              </div>
              Strategic Opportunities
            </h2>
            <div className="space-y-6">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="p-5 border border-antenna-border rounded-xl hover:shadow-card-hover transition-shadow">
                  <h3 className="font-semibold text-antenna-dark mb-2">{opportunity.title || 'Untitled Opportunity'}</h3>
                  <p className="text-antenna-muted mb-3">{sanitizeForPDF(opportunity.description || '')}</p>
                  {opportunity.rationale && (
                    <p className="text-sm text-antenna-muted mb-4">
                      <span className="font-medium text-antenna-dark">Rationale:</span> {sanitizeForPDF(opportunity.rationale)}
                    </p>
                  )}
                  {toArray(opportunity?.supportingQuotes).length > 0 && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-antenna-border">
                      <p className="text-xs font-medium text-antenna-muted uppercase tracking-wide">Supporting Evidence</p>
                      {toArray(opportunity?.supportingQuotes).map((quote, qi) => (
                        <blockquote key={qi} className="flex items-start gap-3 text-sm italic text-antenna-muted bg-antenna-bg p-3 rounded-lg">
                          <Quote className="w-4 h-4 flex-shrink-0 mt-1" />
                          <span>"{sanitizeForPDF(quote)}"</span>
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audience Analysis */}
        {audienceAnalyses.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <Users strokeWidth={1.5} />
              </div>
              Audience Analysis
            </h2>
            <div className="space-y-6">
              {audienceAnalyses.map((audience, index) => (
                <div key={index} className="p-6 border border-antenna-border rounded-xl">
                  <h3 className="font-semibold text-antenna-dark mb-4">{audience.audienceName || 'Unknown Audience'}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Disconnects
                      </h4>
                      <ul className="space-y-1">
                        {toArray(audience?.disconnects).map((item, i) => (
                          <li key={i} className="text-sm text-antenna-muted">• {sanitizeForPDF(item)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-600 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        Barriers
                      </h4>
                      <ul className="space-y-1">
                        {toArray(audience?.barriers).map((item, i) => (
                          <li key={i} className="text-sm text-antenna-muted">• {sanitizeForPDF(item)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Opportunities
                      </h4>
                      <ul className="space-y-1">
                        {toArray(audience?.opportunities).map((item, i) => (
                          <li key={i} className="text-sm text-antenna-muted">• {sanitizeForPDF(item)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positioning Quadrant */}
        {findings.positioningQuadrant && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <Target strokeWidth={1.5} />
              </div>
              Positioning Opportunity
            </h2>
            <QuadrantChart quadrant={findings.positioningQuadrant} brandName={brandName} />
          </div>
        )}

        {/* Strategic Direction */}
        {(strategicDirection.whatDirection || strategicDirection.whyDirection || strategicDirection.howDirection) && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6">
              Strategic Direction
            </h2>
            <div className="space-y-4">
              {strategicDirection.whatDirection && (
                <div className="p-5 bg-antenna-bg rounded-xl">
                  <h3 className="font-semibold text-antenna-dark mb-2">What Direction</h3>
                  <p className="text-antenna-muted">{sanitizeForPDF(strategicDirection.whatDirection)}</p>
                </div>
              )}
              {strategicDirection.whyDirection && (
                <div className="p-5 bg-antenna-bg rounded-xl">
                  <h3 className="font-semibold text-antenna-dark mb-2">Why Direction</h3>
                  <p className="text-antenna-muted">{sanitizeForPDF(strategicDirection.whyDirection)}</p>
                </div>
              )}
              {strategicDirection.howDirection && (
                <div className="p-5 bg-antenna-bg rounded-xl">
                  <h3 className="font-semibold text-antenna-dark mb-2">How Direction</h3>
                  <p className="text-antenna-muted">{sanitizeForPDF(strategicDirection.howDirection)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conclusion */}
        {findings.conclusion && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4">
              Conclusion
            </h2>
            <p className="text-antenna-text leading-relaxed">
              {sanitizeForPDF(findings.conclusion)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
