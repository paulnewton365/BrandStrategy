'use client';

import React from 'react';
import { PositioningQuadrant } from '@/types';

interface QuadrantChartProps {
  quadrant: PositioningQuadrant;
  brandName: string;
}

export default function QuadrantChart({ quadrant, brandName }: QuadrantChartProps) {
  // Convert -1 to 1 coordinates to percentage positions
  const toPercent = (val: number) => ((val + 1) / 2) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative aspect-square bg-white border border-brand-warm rounded-lg overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0">
          {/* Vertical center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-warm" />
          {/* Horizontal center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-brand-warm" />
        </div>

        {/* Quadrant labels */}
        <div className="absolute top-4 left-4 text-xs text-brand-muted font-medium uppercase tracking-wide">
          Visionary + Technical
        </div>
        <div className="absolute top-4 right-4 text-xs text-brand-muted font-medium uppercase tracking-wide text-right">
          Visionary + Benefit
        </div>
        <div className="absolute bottom-4 left-4 text-xs text-brand-muted font-medium uppercase tracking-wide">
          Pragmatic + Technical
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-brand-muted font-medium uppercase tracking-wide text-right">
          Pragmatic + Benefit
        </div>

        {/* Axis labels */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-brand-ink whitespace-nowrap">
          {quadrant.yAxis.topLabel}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-xs font-medium text-brand-ink whitespace-nowrap">
          {quadrant.yAxis.bottomLabel}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-brand-ink">
          {quadrant.xAxis.leftLabel}
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-brand-ink">
          {quadrant.xAxis.rightLabel}
        </div>

        {/* Competitors */}
        {quadrant.competitors.map((competitor, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${toPercent(competitor.x)}%`,
              top: `${100 - toPercent(competitor.y)}%`
            }}
          >
            <div className="w-3 h-3 bg-brand-muted rounded-full" />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-brand-muted whitespace-nowrap">
              {competitor.name}
            </span>
          </div>
        ))}

        {/* Current Position */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${toPercent(quadrant.currentPosition.x)}%`,
            top: `${100 - toPercent(quadrant.currentPosition.y)}%`
          }}
        >
          <div className="w-5 h-5 bg-brand-ink rounded-full border-2 border-white shadow-lg" />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-medium text-brand-ink whitespace-nowrap">
            {brandName} (Current)
          </span>
        </div>

        {/* Target Position */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${toPercent(quadrant.targetPosition.x)}%`,
            top: `${100 - toPercent(quadrant.targetPosition.y)}%`
          }}
        >
          <div className="w-5 h-5 bg-brand-accent rounded-full border-2 border-white shadow-lg" />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-medium text-brand-accent whitespace-nowrap">
            {brandName} (Target)
          </span>
        </div>

        {/* Arrow from current to target */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
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
                fill="#c45d3a"
              />
            </marker>
          </defs>
          <line
            x1={`${toPercent(quadrant.currentPosition.x)}%`}
            y1={`${100 - toPercent(quadrant.currentPosition.y)}%`}
            x2={`${toPercent(quadrant.targetPosition.x)}%`}
            y2={`${100 - toPercent(quadrant.targetPosition.y)}%`}
            stroke="#c45d3a"
            strokeWidth="2"
            strokeDasharray="4"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand-ink rounded-full" />
          <span className="text-brand-muted">Current Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand-accent rounded-full" />
          <span className="text-brand-muted">Target Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand-muted rounded-full" />
          <span className="text-brand-muted">Competitors</span>
        </div>
      </div>
    </div>
  );
}
