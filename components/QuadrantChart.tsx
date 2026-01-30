'use client';

import React from 'react';
import { PositioningQuadrant } from '@/types';

interface QuadrantChartProps {
  quadrant: PositioningQuadrant;
  brandName: string;
}

export default function QuadrantChart({ quadrant, brandName }: QuadrantChartProps) {
  // Defensive: ensure quadrant data exists
  if (!quadrant) {
    return <div className="text-center text-antenna-muted p-8">No positioning data available.</div>;
  }

  // Safe defaults
  const xAxis = quadrant.xAxis || { label: '', leftLabel: 'Technical', rightLabel: 'Benefit' };
  const yAxis = quadrant.yAxis || { label: '', topLabel: 'Visionary', bottomLabel: 'Pragmatic' };
  const currentPosition = quadrant.currentPosition || { x: 0, y: 0 };
  const targetPosition = quadrant.targetPosition || { x: 0.5, y: 0.5 };
  const competitors = quadrant.competitors || [];

  // Convert -1 to 1 coordinates to percentage positions
  const toPercent = (val: number) => ((val + 1) / 2) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative aspect-square bg-white border border-antenna-border rounded-xl overflow-hidden shadow-card">
        {/* Grid lines */}
        <div className="absolute inset-0">
          {/* Vertical center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-antenna-border" />
          {/* Horizontal center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-antenna-border" />
          {/* Subtle grid */}
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-antenna-border/50" />
          <div className="absolute left-3/4 top-0 bottom-0 w-px bg-antenna-border/50" />
          <div className="absolute top-1/4 left-0 right-0 h-px bg-antenna-border/50" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-antenna-border/50" />
        </div>

        {/* Quadrant labels */}
        <div className="absolute top-4 left-4 text-xs text-antenna-muted font-medium uppercase tracking-wide">
          Visionary + Technical
        </div>
        <div className="absolute top-4 right-4 text-xs text-antenna-muted font-medium uppercase tracking-wide text-right">
          Visionary + Benefit
        </div>
        <div className="absolute bottom-4 left-4 text-xs text-antenna-muted font-medium uppercase tracking-wide">
          Pragmatic + Technical
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-antenna-muted font-medium uppercase tracking-wide text-right">
          Pragmatic + Benefit
        </div>

        {/* Axis labels */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-antenna-dark whitespace-nowrap">
          {yAxis.topLabel}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-xs font-medium text-antenna-dark whitespace-nowrap">
          {yAxis.bottomLabel}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-antenna-dark">
          {xAxis.leftLabel}
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-antenna-dark">
          {xAxis.rightLabel}
        </div>

        {/* Competitors */}
        {competitors.map((competitor, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${toPercent(competitor.x || 0)}%`,
              top: `${100 - toPercent(competitor.y || 0)}%`
            }}
          >
            <div className="w-3 h-3 bg-antenna-muted rounded-full border-2 border-white shadow-sm" />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-antenna-muted whitespace-nowrap">
              {competitor.name || 'Competitor'}
            </span>
          </div>
        ))}

        {/* Current Position */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: `${toPercent(currentPosition.x)}%`,
            top: `${100 - toPercent(currentPosition.y)}%`
          }}
        >
          <div className="w-5 h-5 bg-antenna-dark rounded-full border-2 border-white shadow-lg" />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-medium text-antenna-dark whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm">
            {brandName} (Current)
          </span>
        </div>

        {/* Target Position */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: `${toPercent(targetPosition.x)}%`,
            top: `${100 - toPercent(targetPosition.y)}%`
          }}
        >
          <div className="w-5 h-5 bg-antenna-accent rounded-full border-2 border-white shadow-lg" />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-medium text-antenna-dark whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm">
            {brandName} (Target)
          </span>
        </div>

        {/* Arrow from current to target */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 15 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#1a1a2e"
              />
            </marker>
          </defs>
          <line
            x1={`${toPercent(currentPosition.x)}%`}
            y1={`${100 - toPercent(currentPosition.y)}%`}
            x2={`${toPercent(targetPosition.x)}%`}
            y2={`${100 - toPercent(targetPosition.y)}%`}
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeDasharray="6"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-antenna-dark rounded-full" />
          <span className="text-antenna-muted">Current Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-antenna-accent rounded-full" />
          <span className="text-antenna-muted">Target Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-antenna-muted rounded-full" />
          <span className="text-antenna-muted">Competitors</span>
        </div>
      </div>
    </div>
  );
}
