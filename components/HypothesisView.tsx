'use client';

import React, { useRef, useState } from 'react';
import { Download, Check, Palette, MessageSquare, Sparkles, Target, Heart, ChevronDown, FileType, File } from 'lucide-react';
import { BrandHypothesis } from '@/types';
import { formatDate, sanitizeForPDF } from '@/lib/utils';
import { generateHypothesisDocx } from '@/lib/docxExport';

interface HypothesisViewProps {
  hypothesis: BrandHypothesis;
  brandName: string;
}

export default function HypothesisView({ hypothesis, brandName }: HypothesisViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
        
        pdf.save(`${brandName}_Brand_Hypothesis_v${hypothesis.version}.pdf`);
      }
    }
    setIsExporting(false);
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const blob = await generateHypothesisDocx(hypothesis);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandName}_Brand_Hypothesis_v${hypothesis.version}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting DOCX:', err);
    }
    
    setIsExporting(false);
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
                {brandName} Brief
              </h1>
              <p className="text-antenna-muted">Brand Strategy and Creative Direction</p>
            </div>
            <div className="text-right text-sm text-antenna-muted">
              <p className="tag mb-2">v{hypothesis.version}</p>
              <p>{formatDate(new Date(hypothesis.generatedAt))}</p>
            </div>
          </div>
        </div>

        {/* What Statement */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Target strokeWidth={1.5} />
            </div>
            What {brandName} Does
          </h2>
          <p className="text-antenna-text leading-relaxed text-lg">
            {sanitizeForPDF(hypothesis.whatStatement)}
          </p>
        </div>

        {/* Why Statement */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Heart strokeWidth={1.5} />
            </div>
            Why {brandName} Does It
          </h2>
          <p className="text-antenna-text leading-relaxed text-lg">
            {sanitizeForPDF(hypothesis.whyStatement)}
          </p>
        </div>

        {/* How Statement */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Sparkles strokeWidth={1.5} />
            </div>
            How {brandName} Thinks, Works & Acts
          </h2>
          <p className="text-antenna-text leading-relaxed text-lg">
            {sanitizeForPDF(hypothesis.howStatement)}
          </p>
        </div>

        {/* Organizing Idea */}
        <div className="card p-8 bg-antenna-dark text-white">
          <h2 className="text-xl font-display font-semibold mb-6">
            An Organizing Idea
          </h2>
          <p className="text-3xl font-display font-bold mb-8">
            <span className="bg-antenna-accent text-antenna-dark px-2 py-1">{sanitizeForPDF(hypothesis.organizingIdea.statement)}</span>
          </p>
          <div className="space-y-3">
            {hypothesis.organizingIdea.breakdown.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="px-3 py-1 bg-antenna-accent text-antenna-dark rounded font-semibold text-sm">
                  {item.word}
                </span>
                <span className="text-white/80">
                  = {sanitizeForPDF(item.meaning)} <span className="text-white/50">({item.mappedTo === 'what' ? 'What we do' : item.mappedTo === 'why' ? 'Why we do it' : 'How we act'})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why This Works */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4">
            Why This Works
          </h2>
          <ul className="space-y-3">
            {hypothesis.whyThisWorks.map((reason, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-antenna-muted">{sanitizeForPDF(reason)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Positioning Statement */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4">
            A Brand Positioning Statement
          </h2>
          <p className="text-antenna-text leading-relaxed text-lg">
            {sanitizeForPDF(hypothesis.positioningStatement)}
          </p>
        </div>

        {/* Brand House */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6">
            A Brand House Hypothesis
          </h2>
          <div className="space-y-6">
            <div className="p-4 bg-antenna-accent/30 border-l-4 border-antenna-accent rounded-r-lg">
              <h3 className="font-semibold text-antenna-dark mb-1">Essence</h3>
              <p className="text-antenna-muted italic">{sanitizeForPDF(hypothesis.brandHouse.essence)}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-antenna-bg rounded-xl">
                <h3 className="font-semibold text-antenna-dark mb-1">Promise</h3>
                <p className="text-antenna-muted text-sm">{sanitizeForPDF(hypothesis.brandHouse.promise)}</p>
              </div>
              <div className="p-4 bg-antenna-bg rounded-xl">
                <h3 className="font-semibold text-antenna-dark mb-1">Mission</h3>
                <p className="text-antenna-muted text-sm">{sanitizeForPDF(hypothesis.brandHouse.mission)}</p>
              </div>
              <div className="p-4 bg-antenna-bg rounded-xl">
                <h3 className="font-semibold text-antenna-dark mb-1">Vision</h3>
                <p className="text-antenna-muted text-sm">{sanitizeForPDF(hypothesis.brandHouse.vision)}</p>
              </div>
              <div className="p-4 bg-antenna-bg rounded-xl">
                <h3 className="font-semibold text-antenna-dark mb-1">Purpose</h3>
                <p className="text-antenna-muted text-sm">{sanitizeForPDF(hypothesis.brandHouse.purpose)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-antenna-dark mb-3">Brand Values</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {hypothesis.brandHouse.values.map((value, index) => (
                  <div key={index} className="p-3 border border-antenna-border rounded-xl hover:shadow-card-hover transition-shadow">
                    <h4 className="font-medium text-antenna-dark">{value.name}</h4>
                    <p className="text-sm text-antenna-muted mt-1">{sanitizeForPDF(value.description)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-antenna-dark mb-3">Brand Personality</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {hypothesis.brandHouse.personality.map((trait, index) => (
                  <div key={index} className="p-3 border border-antenna-border rounded-xl hover:shadow-card-hover transition-shadow">
                    <h4 className="font-medium text-antenna-dark">{trait.name}</h4>
                    <p className="text-sm text-antenna-muted mt-1">{sanitizeForPDF(trait.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Guidance */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Palette strokeWidth={1.5} />
            </div>
            Brand Guidance For Visual Expression
          </h2>
          <div className="text-antenna-muted leading-relaxed whitespace-pre-line">
            {sanitizeForPDF(hypothesis.visualGuidance)}
          </div>
        </div>

        {/* Tone of Voice */}
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-4 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <MessageSquare strokeWidth={1.5} />
            </div>
            Brand Guidance For Tone of Voice
          </h2>
          <div className="text-antenna-muted leading-relaxed whitespace-pre-line">
            {sanitizeForPDF(hypothesis.toneOfVoiceGuidance)}
          </div>
        </div>
      </div>
    </div>
  );
}
