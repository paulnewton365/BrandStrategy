'use client';

import React, { useRef, useState } from 'react';
import { Download, Quote, TrendingUp, AlertTriangle, Lightbulb, Users, Target, FileText, ChevronDown, FileType, File } from 'lucide-react';
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
  const themes = findings.themes || [];
  const tensions = findings.tensions || [];
  const opportunities = findings.opportunities || [];
  const keyPhrasesToUse = findings.keyPhrases?.toUse || [];
  const keyPhrasesToAvoid = findings.keyPhrases?.toAvoid || [];
  const audienceAnalyses = findings.audienceAnalyses || [];
  const strategicDirection = findings.strategicDirection || {};

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
              <p>{findings.generatedAt ? formatDate(new Date(findings.generatedAt)) : 'N/A'}</p>
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
              {tensions.map((tension, index) => (
                <div key={index} className="p-6 bg-antenna-bg rounded-xl">
                  <h3 className="font-semibold text-antenna-dark mb-3">{tension.title || 'Untitled Tension'}</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-white text-antenna-dark rounded-full text-sm font-medium shadow-card">
                      {tension.pole1 || 'Pole 1'}
                    </span>
                    <span className="text-antenna-muted">vs</span>
                    <span className="px-3 py-1 bg-white text-antenna-dark rounded-full text-sm font-medium shadow-card">
                      {tension.pole2 || 'Pole 2'}
                    </span>
                  </div>
                  <p className="text-antenna-muted mb-4">{sanitizeForPDF(tension.description || '')}</p>
                  {tension.quotes && tension.quotes.length > 0 && (
                    <div className="space-y-2">
                      {tension.quotes.map((quote, qi) => (
                        <blockquote key={qi} className="flex items-start gap-3 text-sm italic text-antenna-muted">
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

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
              <div className="icon-box !mb-0">
                <Lightbulb strokeWidth={1.5} />
              </div>
              Strategic Opportunities
            </h2>
            <div className="grid gap-4">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="p-5 border border-antenna-border rounded-xl hover:shadow-card-hover transition-shadow">
                  <h3 className="font-semibold text-antenna-dark mb-2">{opportunity.title || 'Untitled Opportunity'}</h3>
                  <p className="text-antenna-muted mb-3">{sanitizeForPDF(opportunity.description || '')}</p>
                  {opportunity.rationale && (
                    <p className="text-sm text-antenna-muted">
                      <span className="font-medium text-antenna-dark">Rationale:</span> {sanitizeForPDF(opportunity.rationale)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Language */}
        {(keyPhrasesToUse.length > 0 || keyPhrasesToAvoid.length > 0) && (
          <div className="card p-8">
            <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6">
              Key Language & Phraseology
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {keyPhrasesToUse.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Words to Use
                  </h3>
                  <div className="space-y-3">
                    {keyPhrasesToUse.map((phrase, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-800">"{phrase.phrase || ''}"</p>
                        <p className="text-sm text-green-600 mt-1">
                          Used {phrase.frequency || 0}x in {phrase.source || 'unknown'}s
                        </p>
                        {phrase.context && (
                          <p className="text-sm text-green-700/70 mt-1">{sanitizeForPDF(phrase.context)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {keyPhrasesToAvoid.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Words to Avoid
                  </h3>
                  <div className="space-y-3">
                    {keyPhrasesToAvoid.map((phrase, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">"{phrase.phrase || ''}"</p>
                        <p className="text-sm text-red-600 mt-1">
                          Identified as problematic in {phrase.source || 'unknown'}s
                        </p>
                        {phrase.context && (
                          <p className="text-sm text-red-700/70 mt-1">{sanitizeForPDF(phrase.context)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                        {(audience.disconnects || []).map((item, i) => (
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
                        {(audience.barriers || []).map((item, i) => (
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
                        {(audience.opportunities || []).map((item, i) => (
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
