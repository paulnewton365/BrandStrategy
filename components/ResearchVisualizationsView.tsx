'use client';

import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { BarChart3, Activity, CheckCircle, AlertTriangle, Hash } from 'lucide-react';
import { ResearchVisualization } from '@/types';

// Antenna-aligned chart colors
const CHART_COLORS = ['#D4E800', '#1a1a2e', '#2A9D8F', '#3B6EBF', '#E8853D', '#6C5CE7', '#D66BA0', '#D64545'];

interface ResearchVisualizationsViewProps {
  visualization: ResearchVisualization;
  brandName: string;
}

/* ─── Custom Tooltip ─── */
const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-antenna-border rounded-lg shadow-lg p-3 text-sm">
      <div className="font-semibold text-antenna-dark mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-antenna-muted" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ─── Stat Pill ─── */
const StatPill = ({ value, label }: { value: string | number; label: string }) => (
  <div className="bg-white border border-antenna-border rounded-xl p-5 text-center shadow-sm">
    <div className="text-3xl font-display font-light text-antenna-dark">{value}</div>
    <div className="text-[10px] text-antenna-muted uppercase tracking-widest mt-1 font-medium">{label}</div>
  </div>
);

export default function ResearchVisualizationsView({ visualization, brandName }: ResearchVisualizationsViewProps) {
  const {
    researchOverview,
    brandDescriptors,
    thematicRadar,
    convergencePoints,
    divergencePoints,
  } = visualization;

  const hasOverview = researchOverview && (researchOverview.interviewCount > 0 || researchOverview.surveyResponseCount > 0);
  const hasDescriptors = brandDescriptors && brandDescriptors.length > 0;
  const hasRadar = thematicRadar && thematicRadar.dimensions?.length > 0 && thematicRadar.speakers?.length > 0;
  const hasConvergence = convergencePoints && convergencePoints.length > 0;
  const hasDivergence = divergencePoints && divergencePoints.length > 0;

  if (!hasOverview && !hasDescriptors && !hasRadar && !hasConvergence && !hasDivergence) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ═══ Research Overview ═══ */}
      {hasOverview && researchOverview && (
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <BarChart3 strokeWidth={1.5} />
            </div>
            Research Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {researchOverview.interviewCount > 0 && (
              <StatPill value={researchOverview.interviewCount} label="Interviews" />
            )}
            {researchOverview.surveyResponseCount > 0 && (
              <StatPill value={researchOverview.surveyResponseCount} label="Survey Responses" />
            )}
            {researchOverview.wordsAnalyzed && (
              <StatPill value={researchOverview.wordsAnalyzed} label="Words Analyzed" />
            )}
            {researchOverview.conceptsTracked > 0 && (
              <StatPill value={researchOverview.conceptsTracked} label="Concepts Tracked" />
            )}
            {researchOverview.themesFound > 0 && (
              <StatPill value={researchOverview.themesFound} label="Themes Found" />
            )}
          </div>
        </div>
      )}

      {/* ═══ Brand Descriptor Galaxy ═══ */}
      {hasDescriptors && brandDescriptors && (
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Hash strokeWidth={1.5} />
            </div>
            Brand Descriptor Galaxy
          </h2>
          <p className="text-sm text-antenna-muted mb-6 -mt-2">
            Combined from survey descriptive words and interview language patterns
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 py-5 min-h-[160px]">
            {brandDescriptors.map((descriptor, i) => {
              const maxCount = Math.max(...brandDescriptors.map(d => d.count));
              const scale = 0.55 + (descriptor.count / maxCount) * 1.0;
              const baseFontSize = 14 + (descriptor.count / maxCount) * 20;
              const isTop = descriptor.count >= (maxCount * 0.6);
              const isMid = descriptor.count >= (maxCount * 0.3);

              return (
                <span
                  key={i}
                  className="whitespace-nowrap transition-all hover:scale-105"
                  style={{
                    padding: `${5 * scale}px ${14 * scale}px`,
                    fontSize: baseFontSize,
                    fontWeight: isTop ? 500 : 600,
                    fontStyle: isTop ? 'italic' : 'normal',
                    color: isTop ? '#1a1a2e' : isMid ? '#4A4E57' : '#7A7E87',
                    background: isTop ? 'rgba(212, 232, 0, 0.13)' : '#F7F5F0',
                    borderRadius: 100,
                    border: isTop ? '1px solid rgba(212, 232, 0, 0.27)' : '1px solid #E8E3D9',
                    letterSpacing: isTop ? '0' : '0.01em',
                  }}
                >
                  {descriptor.word}
                  <span style={{ fontSize: 10, marginLeft: 5, opacity: 0.5 }}>×{descriptor.count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Thematic Emphasis Radar ═══ */}
      {hasRadar && thematicRadar && (
        <div className="card p-8">
          <h2 className="text-xl font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
            <div className="icon-box !mb-0">
              <Activity strokeWidth={1.5} />
            </div>
            Thematic Emphasis Radar
          </h2>
          <p className="text-sm text-antenna-muted mb-6 -mt-2">
            Raw word frequency counts per speaker across key thematic dimensions
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={thematicRadar.dimensions} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="#E8E3D9" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#4A4E57', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}
              />
              <PolarRadiusAxis tick={{ fill: '#A0A3AB', fontSize: 10 }} />
              {thematicRadar.speakers.map((speaker, i) => (
                <Radar
                  key={speaker.key}
                  name={speaker.name}
                  dataKey={speaker.key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  fillOpacity={0.08}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif' }} />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ═══ Convergence & Divergence ═══ */}
      {(hasConvergence || hasDivergence) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Convergence Points */}
          {hasConvergence && convergencePoints && (
            <div className="card p-8">
              <h2 className="text-lg font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
                <div className="icon-box !mb-0 !w-9 !h-9">
                  <CheckCircle strokeWidth={1.5} className="!w-4 !h-4" />
                </div>
                Convergence Points
              </h2>
              <p className="text-sm text-antenna-muted mb-5 -mt-2">
                Where interviews and surveys agree
              </p>
              <div className="space-y-4">
                {convergencePoints.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-antenna-muted font-medium">{item.label}</span>
                      <span className="text-sm font-bold" style={{ color: '#2A9D8F' }}>{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-antenna-bg rounded-full border border-antenna-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: '#2A9D8F',
                          opacity: 0.5,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divergence Points */}
          {hasDivergence && divergencePoints && (
            <div className="card p-8">
              <h2 className="text-lg font-display font-semibold text-antenna-dark mb-6 flex items-center gap-3">
                <div className="icon-box !mb-0 !w-9 !h-9">
                  <AlertTriangle strokeWidth={1.5} className="!w-4 !h-4" />
                </div>
                Divergence Points
              </h2>
              <p className="text-sm text-antenna-muted mb-5 -mt-2">
                Topics where internal alignment is weaker
              </p>
              <div className="space-y-4">
                {divergencePoints.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-antenna-muted font-medium">{item.label}</span>
                      <span className="text-sm font-bold" style={{ color: '#D64545' }}>{item.tensionScore}%</span>
                    </div>
                    <div className="h-1.5 bg-antenna-bg rounded-full border border-antenna-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.tensionScore}%`,
                          background: 'linear-gradient(90deg, #D4E800, #D64545)',
                          opacity: 0.5,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-antenna-muted italic pt-2">
                  Tension score = degree of disagreement across sources (higher = more divergent)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
