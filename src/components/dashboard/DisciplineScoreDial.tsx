import React from 'react';
import { DisciplineBreakdown } from '../../types';
import { Award, ChevronRight, Sparkles, Target, Zap } from 'lucide-react';

interface DisciplineScoreDialProps {
  breakdown: DisciplineBreakdown;
  onOpenBreakdown: () => void;
  whiteRoomMode?: boolean;
}

export const DisciplineScoreDial: React.FC<DisciplineScoreDialProps> = ({
  breakdown,
  onOpenBreakdown,
  whiteRoomMode = false,
}) => {
  const score = Math.max(0, Math.min(100, Math.round(breakdown.score)));

  // SVG Gauge calculations
  const size = 160;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Grade classification
  const getGrade = (s: number) => {
    if (s >= 90) return { label: 'S-TIER // SUPREME', color: 'text-violet-300' };
    if (s >= 80) return { label: 'A-TIER // OPTIMAL', color: 'text-emerald-300' };
    if (s >= 70) return { label: 'B-TIER // ACCEPTABLE', color: 'text-blue-300' };
    if (s >= 50) return { label: 'C-TIER // DEFICIT', color: 'text-amber-300' };
    return { label: 'CRITICAL DISCIPLINE DROP', color: 'text-rose-400' };
  };

  const grade = getGrade(score);

  return (
    <div
      onClick={onOpenBreakdown}
      className={`rounded-xl border p-5 font-mono cursor-pointer transition-all group ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
          : 'bg-[#090b14]/90 border-slate-800 hover:border-violet-500/50 shadow-lg hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Circular SVG Dial */}
        <div className="relative flex items-center justify-center select-none flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={whiteRoomMode ? '#262626' : 'rgba(255, 255, 255, 0.06)'}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Calibrated ticks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i * 10 * Math.PI) / 180;
              const isTargetTick = i === Math.round(36 * 0.75); // 75% target marker
              const r1 = radius + 6;
              const r2 = r1 - 3;
              const x1 = center + r1 * Math.cos(angle);
              const y1 = center + r1 * Math.sin(angle);
              const x2 = center + r2 * Math.cos(angle);
              const y2 = center + r2 * Math.sin(angle);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isTargetTick ? '#38bdf8' : 'rgba(148, 163, 184, 0.2)'}
                  strokeWidth={isTargetTick ? 2 : 1}
                />
              );
            })}

            {/* Animated progress arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#scoreGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center text in dial */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              SCORE
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {score}%
            </div>
            <div className="text-[9px] text-slate-400">
              TARGET ≥ 75%
            </div>
          </div>
        </div>

        {/* Right: Analytical Breakdown Grid */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>MATHEMATICAL DISCIPLINE VECTOR</span>
              </div>
              <div className={`text-xs font-bold ${grade.color} mt-0.5`}>
                {grade.label}
              </div>
            </div>

            <span className="text-[10px] text-slate-400 group-hover:text-violet-300 flex items-center gap-1 transition">
              <span>VIEW FORMULA</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* 5 Weighted Bars */}
          <div className="space-y-1.5 text-[11px]">
            {/* 1. Execution (35%) */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Task Execution (35% weight)</span>
                <span className="text-white font-bold">{breakdown.taskCompletionPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${breakdown.taskCompletionPercent}%` }}
                />
              </div>
            </div>

            {/* 2. Schedule Adherence (20%) */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Schedule Adherence (20% weight)</span>
                <span className="text-white font-bold">{breakdown.timeBlockAdherencePercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${breakdown.timeBlockAdherencePercent}%` }}
                />
              </div>
            </div>

            {/* 3. Academic Progress (20%) */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Academic Syllabus Progress (20% weight)</span>
                <span className="text-white font-bold">{breakdown.academicProgressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${breakdown.academicProgressPercent}%` }}
                />
              </div>
            </div>

            {/* 4. Focus Consistency (15%) */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Focus Consistency (15% weight)</span>
                <span className="text-white font-bold">{breakdown.focusScorePercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${breakdown.focusScorePercent}%` }}
                />
              </div>
            </div>

            {/* 5. Non-Negotiable Objectives (10%) */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Daily Objectives (10% weight)</span>
                <span className="text-white font-bold">{breakdown.objectiveCompletionPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${breakdown.objectiveCompletionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
