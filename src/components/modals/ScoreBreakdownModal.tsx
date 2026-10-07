import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calculator } from 'lucide-react';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({ isOpen, onClose }) => {
  const { disciplineBreakdown, whiteRoomMode } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-lg border shadow-2xl p-6 font-mono text-xs transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#0b0d18] border-violet-500/30 text-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-violet-950/60 border border-violet-500/40 text-violet-300">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold tracking-wider text-sm text-white">DISCIPLINE SCORE AUDIT</div>
              <div className="text-[10px] text-slate-400">TRANSPARENT FORMULA BREAKDOWN</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Score Header */}
        <div className="p-4 rounded border border-slate-800 bg-slate-950/80 mb-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">CALCULATED SCORE</div>
            <div className="text-3xl font-bold font-mono text-violet-300 mt-0.5">
              {disciplineBreakdown.score}
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>Tasks: {disciplineBreakdown.completedTasks} / {disciplineBreakdown.totalTasks}</div>
            <div>Non-Negotiables: {disciplineBreakdown.nonNegotiablesCompleted} / {disciplineBreakdown.nonNegotiablesTotal}</div>
            <div>Focus Logged: {disciplineBreakdown.focusMinutes}m</div>
          </div>
        </div>

        {/* Mathematical Breakdown Components */}
        <div className="space-y-3 mb-5">
          {/* Factor 1 */}
          <div className="p-3 rounded bg-slate-900/40 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">1. TASK COMPLETION RATE (35% WEIGHT)</span>
              <span className="text-violet-400 font-bold">{disciplineBreakdown.taskCompletionPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-violet-500 h-full rounded-full transition-all"
                style={{ width: `${disciplineBreakdown.taskCompletionPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Contribution: {(0.35 * disciplineBreakdown.taskCompletionPercent).toFixed(1)} pts
            </div>
          </div>

          {/* Factor 2 */}
          <div className="p-3 rounded bg-slate-900/40 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">2. SCHEDULE ADHERENCE (25% WEIGHT)</span>
              <span className="text-blue-400 font-bold">{disciplineBreakdown.scheduleAdherencePercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${disciplineBreakdown.scheduleAdherencePercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Contribution: {(0.25 * disciplineBreakdown.scheduleAdherencePercent).toFixed(1)} pts
            </div>
          </div>

          {/* Factor 3 */}
          <div className="p-3 rounded bg-slate-900/40 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">3. CRITICAL PRIORITY & NON-NEGOTIABLES (25% WEIGHT)</span>
              <span className="text-amber-400 font-bold">{disciplineBreakdown.priorityCompletionPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${disciplineBreakdown.priorityCompletionPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Contribution: {(0.25 * disciplineBreakdown.priorityCompletionPercent).toFixed(1)} pts
            </div>
          </div>

          {/* Factor 4 */}
          <div className="p-3 rounded bg-slate-900/40 border border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200">4. CONSISTENCY & FOCUS DURATION (15% WEIGHT)</span>
              <span className="text-emerald-400 font-bold">{disciplineBreakdown.consistencyPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${disciplineBreakdown.consistencyPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Contribution: {(0.15 * disciplineBreakdown.consistencyPercent).toFixed(1)} pts
            </div>
          </div>
        </div>

        {/* Operating Philosophy Note */}
        <div className="p-3 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
          <span className="text-violet-400 font-semibold">DIRECTIVE:</span> The scoring algorithm measures long-term execution consistency rather than generating unhealthy pressure. Single missed sub-tasks do not catastrophically drop the rating.
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            DISMISS AUDIT
          </button>
        </div>
      </div>
    </div>
  );
};
