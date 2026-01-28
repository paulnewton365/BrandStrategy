'use client';

import React, { useRef } from 'react';
import { Download, Check, Palette, MessageSquare } from 'lucide-react';
import { BrandHypothesis } from '@/types';
import { formatDate, sanitizeForPDF } from '@/lib/utils';

interface HypothesisViewProps {
  hypothesis: BrandHypothesis;
}

export default function HypothesisView({ hypothesis }: HypothesisViewProps) {
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
        
        pdf.save(`${hypothesis.brandName}_Brand_Hypothesis_v${hypothesis.version}.pdf`);
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
                {hypothesis.brandName} Brief
              </h1>
              <p className="text-brand-muted">Brand Strategy and Creative Direction</p>
            </div>
            <div className="text-right text-sm text-brand-muted">
              <p>Version {hypothesis.version}</p>
              <p>{formatDate(new Date(hypothesis.generatedAt))}</p>
            </div>
          </div>
        </div>

        {/* What Statement */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4">
            What {hypothesis.brandName} Does
          </h2>
          <p className="text-brand-ink/90 leading-relaxed text-lg">
            {sanitizeForPDF(hypothesis.whatStatement)}
          </p>
        </div>

        {/* Why Statement */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4">
            Why {hypothesis.brandName} Does It
          </h2>
          <p className="text-brand-ink/90 leading-relaxed text-lg">
            {sanitizeForPDF(hypothesis.whyStatement)}
          </p>
        </div>

        {/* How Statement */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4">
            How {hypothesis.brandName} Thinks, Works & Acts
          </h2>
          <p className="text-brand-ink/90 leading-relaxed text-lg">
            {sanitizeForPDF(hypothesis.howStatement)}
          </p>
        </div>

        {/* Organizing Idea */}
        <div className="card p-8 bg-brand-ink text-white">
          <h2 className="text-xl font-display font-semibold mb-6">
            An Organizing Idea
          </h2>
          <p className="text-3xl font-display font-bold mb-8 text-brand-highlight">
            {sanitizeForPDF(hypothesis.organizingIdea.statement)}
          </p>
          <div className="space-y-3">
            {hypothesis.organizingIdea.breakdown.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="px-3 py-1 bg-white/10 rounded text-brand-highlight font-semibold">
                  {item.word}
                </span>
                <span className="text-white/80">
                  = {sanitizeForPDF(item.meaning)} ({item.mappedTo === 'what' ? 'What we do' : item.mappedTo === 'why' ? 'Why we do it' : 'How we act'})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why This Works */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4">
            Why This Works
          </h2>
          <ul className="space-y-3">
            {hypothesis.whyThisWorks.map((reason, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-brand-accent flex-shrink-0 mt-0.5" />
                <span className="text-brand-ink/90">{sanitizeForPDF(reason)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Positioning Statement */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4">
            A Brand Positioning Statement
          </h2>
          <p className="text-brand-ink/90 leading-relaxed text-lg">
            {sanitizeForPDF(hypothesis.positioningStatement)}
          </p>
        </div>

        {/* Brand House */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-6">
            A Brand House Hypothesis
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-brand-accent/10 border-l-4 border-brand-accent rounded-r-lg">
              <h3 className="font-semibold text-brand-ink mb-1">Essence</h3>
              <p className="text-brand-ink/80 italic">{sanitizeForPDF(hypothesis.brandHouse.essence)}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-brand-warm/50 rounded-lg">
                <h3 className="font-semibold text-brand-ink mb-1">Promise</h3>
                <p className="text-brand-ink/80 text-sm">{sanitizeForPDF(hypothesis.brandHouse.promise)}</p>
              </div>
              <div className="p-4 bg-brand-warm/50 rounded-lg">
                <h3 className="font-semibold text-brand-ink mb-1">Mission</h3>
                <p className="text-brand-ink/80 text-sm">{sanitizeForPDF(hypothesis.brandHouse.mission)}</p>
              </div>
              <div className="p-4 bg-brand-warm/50 rounded-lg">
                <h3 className="font-semibold text-brand-ink mb-1">Vision</h3>
                <p className="text-brand-ink/80 text-sm">{sanitizeForPDF(hypothesis.brandHouse.vision)}</p>
              </div>
              <div className="p-4 bg-brand-warm/50 rounded-lg">
                <h3 className="font-semibold text-brand-ink mb-1">Purpose</h3>
                <p className="text-brand-ink/80 text-sm">{sanitizeForPDF(hypothesis.brandHouse.purpose)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-brand-ink mb-3">Brand Values</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {hypothesis.brandHouse.values.map((value, index) => (
                  <div key={index} className="p-3 border border-brand-warm rounded-lg">
                    <h4 className="font-medium text-brand-ink">{value.name}</h4>
                    <p className="text-sm text-brand-ink/70 mt-1">{sanitizeForPDF(value.description)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-brand-ink mb-3">Brand Personality</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {hypothesis.brandHouse.personality.map((trait, index) => (
                  <div key={index} className="p-3 border border-brand-warm rounded-lg">
                    <h4 className="font-medium text-brand-ink">{trait.name}</h4>
                    <p className="text-sm text-brand-ink/70 mt-1">{sanitizeForPDF(trait.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Guidance */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-accent" />
            Brand Guidance For Visual Expression
          </h2>
          <div className="text-brand-ink/90 leading-relaxed whitespace-pre-line">
            {sanitizeForPDF(hypothesis.visualGuidance)}
          </div>
        </div>

        {/* Tone of Voice */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-brand-ink mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-accent" />
            Brand Guidance For Tone of Voice
          </h2>
          <div className="text-brand-ink/90 leading-relaxed whitespace-pre-line">
            {sanitizeForPDF(hypothesis.toneOfVoiceGuidance)}
          </div>
        </div>
      </div>
    </div>
  );
}
