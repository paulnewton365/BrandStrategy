'use client';

import React, { useRef } from 'react';
import { Download, Quote, TrendingUp, AlertTriangle, Lightbulb, Users, Target, FileText } from 'lucide-react';
import { FindingsDocument } from '@/types';
import QuadrantChart from './QuadrantChart';
import { formatDate, sanitizeForPDF } from '@/lib/utils';

interface FindingsViewProps {
  findings: FindingsDocument;
}

export default function FindingsView({ findings }: FindingsViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
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
        
        pdf.save(`${findings.brandName}_Findings_v${findings.version}.pdf`);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4 no-print">
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      <div ref={contentRef} className="space-y-6">
        {/* Header */}
        <div className="card p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-antenna-dark mb-2">
                {findings.brandName} Brand Analysis
              </h1>
              <p className="text-antenna-muted">Stakeholder Interview Findings</p>
            </div>
            <div className="text-right text-sm text-antenna-muted">
              <p className="tag mb-2">v{findings.version}</p>
              <p>{formatDate(new Date(findings.generatedAt))}</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
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

        {/* Key Themes */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <TrendingUp strokeWidth={1.5} />
            </div>
            Key Themes
          </h2>
          <div className="space-y-6">
            {findings.themes.map((theme, index) => (
              <div key={index} className="border-l-4 border-antenna-dark pl-6">
                <h3 className="font-semibold text-antenna-dark mb-2">{index + 1}. {theme.title}</h3>
                <p className="text-antenna-muted mb-4">{sanitizeForPDF(theme.description)}</p>
                {theme.quotes.length > 0 && (
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

        {/* Brand Tensions */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <AlertTriangle strokeWidth={1.5} />
            </div>
            Brand Tensions
          </h2>
          <div className="space-y-6">
            {findings.tensions.map((tension, index) => (
              <div key={index} className="p-6 bg-antenna-bg rounded-xl">
                <h3 className="font-semibold text-antenna-dark mb-3">{tension.title}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-white text-antenna-dark rounded-full text-sm font-medium shadow-card">
                    {tension.pole1}
                  </span>
                  <span className="text-antenna-muted">vs</span>
                  <span className="px-3 py-1 bg-white text-antenna-dark rounded-full text-sm font-medium shadow-card">
                    {tension.pole2}
                  </span>
                </div>
                <p className="text-antenna-muted mb-4">{sanitizeForPDF(tension.description)}</p>
                {tension.quotes.length > 0 && (
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

        {/* Opportunities */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Lightbulb strokeWidth={1.5} />
            </div>
            Strategic Opportunities
          </h2>
          <div className="grid gap-4">
            {findings.opportunities.map((opportunity, index) => (
              <div key={index} className="p-5 border border-antenna-border rounded-xl hover:shadow-card-hover transition-shadow">
                <h3 className="font-semibold text-antenna-dark mb-2">{opportunity.title}</h3>
                <p className="text-antenna-muted mb-3">{sanitizeForPDF(opportunity.description)}</p>
                <p className="text-sm text-antenna-muted">
                  <span className="font-medium text-antenna-dark">Rationale:</span> {sanitizeForPDF(opportunity.rationale)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Language */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6">
            Key Language & Phraseology
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Words to Use
              </h3>
              <div className="space-y-3">
                {findings.keyPhrases.toUse.map((phrase, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-800">"{phrase.phrase}"</p>
                    <p className="text-sm text-green-600 mt-1">
                      Used {phrase.frequency}x in {phrase.source}s
                    </p>
                    <p className="text-sm text-green-700/70 mt-1">{sanitizeForPDF(phrase.context)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Words to Avoid
              </h3>
              <div className="space-y-3">
                {findings.keyPhrases.toAvoid.map((phrase, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-medium text-red-800">"{phrase.phrase}"</p>
                    <p className="text-sm text-red-600 mt-1">
                      Identified as problematic in {phrase.source}s
                    </p>
                    <p className="text-sm text-red-700/70 mt-1">{sanitizeForPDF(phrase.context)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Audience Analysis */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Users strokeWidth={1.5} />
            </div>
            Audience Analysis
          </h2>
          <div className="space-y-6">
            {findings.audienceAnalyses.map((audience, index) => (
              <div key={index} className="p-6 border border-antenna-border rounded-xl">
                <h3 className="font-semibold text-antenna-dark mb-4">{audience.audienceName}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Disconnects
                    </h4>
                    <ul className="space-y-1">
                      {audience.disconnects.map((item, i) => (
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
                      {audience.barriers.map((item, i) => (
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
                      {audience.opportunities.map((item, i) => (
                        <li key={i} className="text-sm text-antenna-muted">• {sanitizeForPDF(item)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Positioning Quadrant */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Target strokeWidth={1.5} />
            </div>
            Positioning Opportunity
          </h2>
          <QuadrantChart quadrant={findings.positioningQuadrant} brandName={findings.brandName} />
        </div>

        {/* Strategic Direction */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6">
            Strategic Direction
          </h2>
          <div className="space-y-4">
            <div className="p-5 bg-antenna-bg rounded-xl">
              <h3 className="font-semibold text-antenna-dark mb-2">What Direction</h3>
              <p className="text-antenna-muted">{sanitizeForPDF(findings.strategicDirection.whatDirection)}</p>
            </div>
            <div className="p-5 bg-antenna-bg rounded-xl">
              <h3 className="font-semibold text-antenna-dark mb-2">Why Direction</h3>
              <p className="text-antenna-muted">{sanitizeForPDF(findings.strategicDirection.whyDirection)}</p>
            </div>
            <div className="p-5 bg-antenna-bg rounded-xl">
              <h3 className="font-semibold text-antenna-dark mb-2">How Direction</h3>
              <p className="text-antenna-muted">{sanitizeForPDF(findings.strategicDirection.howDirection)}</p>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4">
            Conclusion
          </h2>
          <p className="text-antenna-text leading-relaxed">
            {sanitizeForPDF(findings.conclusion)}
          </p>
        </div>
      </div>
    </div>
  );
}
