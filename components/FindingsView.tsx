'use client';

import React, { useRef } from 'react';
import { Download, Quote, TrendingUp, AlertTriangle, Lightbulb, Users, Target, MessageSquare } from 'lucide-react';
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
          logging: false
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

      <div ref={contentRef} className="space-y-8">
        {/* Header */}
        <div className="card p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-brand-ink mb-2">
                {findings.brandName} Brand Analysis
              </h1>
              <p className="text-brand-muted">Stakeholder Interview Findings</p>
            </div>
            <div className="text-right text-sm text-brand-muted">
              <p>Version {findings.version}</p>
              <p>{formatDate(new Date(findings.generatedAt))}</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-accent" />
            Executive Summary
          </h2>
          <p className="text-brand-ink/90 leading-relaxed">
            {sanitizeForPDF(findings.executiveSummary)}
          </p>
        </div>

        {/* Key Themes */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-accent" />
            Key Themes
          </h2>
          <div className="space-y-6">
            {findings.themes.map((theme, index) => (
              <div key={index} className="border-l-4 border-brand-accent pl-6">
                <h3 className="font-semibold text-brand-ink mb-2">{index + 1}. {theme.title}</h3>
                <p className="text-brand-ink/80 mb-4">{sanitizeForPDF(theme.description)}</p>
                {theme.quotes.length > 0 && (
                  <div className="space-y-2">
                    {theme.quotes.map((quote, qi) => (
                      <blockquote key={qi} className="flex items-start gap-3 text-sm italic text-brand-muted">
                        <Quote className="w-4 h-4 flex-shrink-0 mt-1 text-brand-accent/50" />
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
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-accent" />
            Brand Tensions
          </h2>
          <div className="space-y-6">
            {findings.tensions.map((tension, index) => (
              <div key={index} className="p-6 bg-brand-warm/30 rounded-lg">
                <h3 className="font-semibold text-brand-ink mb-3">{tension.title}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
                    {tension.pole1}
                  </span>
                  <span className="text-brand-muted">vs</span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
                    {tension.pole2}
                  </span>
                </div>
                <p className="text-brand-ink/80 mb-4">{sanitizeForPDF(tension.description)}</p>
                {tension.quotes.length > 0 && (
                  <div className="space-y-2">
                    {tension.quotes.map((quote, qi) => (
                      <blockquote key={qi} className="flex items-start gap-3 text-sm italic text-brand-muted">
                        <Quote className="w-4 h-4 flex-shrink-0 mt-1 text-brand-accent/50" />
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
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-brand-accent" />
            Strategic Opportunities
          </h2>
          <div className="grid gap-4">
            {findings.opportunities.map((opportunity, index) => (
              <div key={index} className="p-5 border border-brand-warm rounded-lg">
                <h3 className="font-semibold text-brand-ink mb-2">{opportunity.title}</h3>
                <p className="text-brand-ink/80 mb-3">{sanitizeForPDF(opportunity.description)}</p>
                <p className="text-sm text-brand-muted">
                  <span className="font-medium">Rationale:</span> {sanitizeForPDF(opportunity.rationale)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Language */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-6">
            Key Language & Phraseology
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-green-700 mb-4">Words to Use</h3>
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
              <h3 className="font-semibold text-red-700 mb-4">Words to Avoid</h3>
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
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-accent" />
            Audience Analysis
          </h2>
          <div className="space-y-6">
            {findings.audienceAnalyses.map((audience, index) => (
              <div key={index} className="p-6 border border-brand-warm rounded-lg">
                <h3 className="font-semibold text-brand-ink mb-4">{audience.audienceName}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2">Disconnects</h4>
                    <ul className="space-y-1">
                      {audience.disconnects.map((item, i) => (
                        <li key={i} className="text-sm text-brand-ink/80">• {sanitizeForPDF(item)}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-700 mb-2">Barriers</h4>
                    <ul className="space-y-1">
                      {audience.barriers.map((item, i) => (
                        <li key={i} className="text-sm text-brand-ink/80">• {sanitizeForPDF(item)}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">Opportunities</h4>
                    <ul className="space-y-1">
                      {audience.opportunities.map((item, i) => (
                        <li key={i} className="text-sm text-brand-ink/80">• {sanitizeForPDF(item)}</li>
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
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-accent" />
            Positioning Opportunity
          </h2>
          <QuadrantChart quadrant={findings.positioningQuadrant} brandName={findings.brandName} />
        </div>

        {/* Strategic Direction */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-6">
            Strategic Direction
          </h2>
          <div className="space-y-6">
            <div className="p-5 bg-brand-warm/30 rounded-lg">
              <h3 className="font-semibold text-brand-ink mb-2">What Direction</h3>
              <p className="text-brand-ink/80">{sanitizeForPDF(findings.strategicDirection.whatDirection)}</p>
            </div>
            <div className="p-5 bg-brand-warm/30 rounded-lg">
              <h3 className="font-semibold text-brand-ink mb-2">Why Direction</h3>
              <p className="text-brand-ink/80">{sanitizeForPDF(findings.strategicDirection.whyDirection)}</p>
            </div>
            <div className="p-5 bg-brand-warm/30 rounded-lg">
              <h3 className="font-semibold text-brand-ink mb-2">How Direction</h3>
              <p className="text-brand-ink/80">{sanitizeForPDF(findings.strategicDirection.howDirection)}</p>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4">
            Conclusion
          </h2>
          <p className="text-brand-ink/90 leading-relaxed">
            {sanitizeForPDF(findings.conclusion)}
          </p>
        </div>
      </div>
    </div>
  );
}
