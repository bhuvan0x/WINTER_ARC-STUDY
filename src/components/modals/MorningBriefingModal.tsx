import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateDisplay, addDaysToDate, getTodayDateString } from '../../utils/dateUtils';
import { calculateDailyDisciplineScore } from '../../utils/scoring';
import { Sun, CheckCircle2, Circle, ArrowRight, X } from 'lucide-react';

interface MorningBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MorningBriefingModal: React.FC<MorningBriefingModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    currentDate,
    currentDayType,
    dayNumber,
    currentPlan,
    tasks,
    objectives,
    streakStats,
    allTasks,
    allObjectives,
    allFocusSessions,
    whiteRoomMode,
  } = useApp();

  if (!isOpen) return null;

  // Calculate yesterday's discipline score
  const yesterdayDate = addDaysToDate(currentDate || getTodayDateString(), -1);
  const yesterdayTasks = allTasks.filter((t) => t.date === yesterdayDate);
  const yesterdayObjectives = allObjectives.filter((o) => o.date === yesterdayDate);
  const yesterdayFocus = allFocusSessions.filter((f) => f.date === yesterdayDate);
  const yesterdayScore = calculateDailyDisciplineScore(yesterdayTasks, yesterdayObjectives, yesterdayFocus).score;

  // Filter top 3 tasks by priority
  const topTasks = [...tasks]
    .sort((a, b) => {
      const priorityWeights = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    })
    .slice(0, 3);

  const nonNegotiables = objectives.filter((o) => o.type === 'NON_NEGOTIABLE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className={`w-full max-w-xl rounded-lg border shadow-2xl p-6 sm:p-7 font-mono text-xs my-6 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14] border-violet-500/30 text-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold tracking-widest text-sm text-white">
                WINTER ARC // MORNING BRIEF
              </div>
              <div className="text-[10px] text-violet-400">
                TACTICAL ORIENTATION // 朝の戦略ブリーフィング
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date & Day Type Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">DATE</div>
            <div className="font-bold text-slate-100 mt-0.5 truncate">{formatDateDisplay(currentDate)}</div>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">DAY TYPE</div>
            <div className="font-bold text-violet-400 mt-0.5">{currentDayType} PROTOCOL</div>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">ACTIVE STREAK</div>
            <div className="font-bold text-emerald-400 mt-0.5">{streakStats.currentStreak} DAYS</div>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">YESTERDAY SCORE</div>
            <div className="font-bold text-amber-300 mt-0.5">{yesterdayScore}%</div>
          </div>
        </div>

        {/* Primary Objective Banner */}
        <div className="p-3.5 rounded bg-violet-950/30 border border-violet-500/30 mb-4">
          <div className="text-[10px] font-bold text-violet-400 tracking-wider uppercase mb-1">
            TODAY'S PRIMARY OBJECTIVE
          </div>
          <div className="text-sm font-semibold text-white">
            "{currentPlan.primaryObjective || 'Execute the plan. No negotiation.'}"
          </div>
        </div>

        {/* Top 3 Strategic Tasks */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
            PRIORITY TARGETS (TOP 3)
          </div>
          <div className="space-y-1.5">
            {topTasks.length === 0 ? (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400 text-center">
                No tasks scheduled for today yet.
              </div>
            ) : (
              topTasks.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-violet-400 font-bold">0{idx + 1}.</span>
                    <span className="font-medium text-slate-100">{t.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="text-amber-400">[{t.priority}]</span>
                    <span>{t.startTime} - {t.endTime}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Non-Negotiables Checklist */}
        <div className="mb-5">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
            DAILY NON-NEGOTIABLES
          </div>
          <div className="space-y-1">
            {nonNegotiables.length === 0 ? (
              <div className="text-slate-400 italic">No non-negotiables specified.</div>
            ) : (
              nonNegotiables.map((nn) => (
                <div key={nn.id} className="flex items-center gap-2 text-slate-300 py-0.5">
                  {nn.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={nn.completed ? 'line-through text-slate-400' : ''}>
                    {nn.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Closing Directive Quote */}
        <div className="p-3 rounded bg-slate-950/70 border-l-2 border-violet-500 text-slate-300 italic mb-5 leading-relaxed">
          "{settings.morningQuote || 'Control the day before the day controls you.'}"
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition"
        >
          <span>INITIATE DAY {dayNumber} EXECUTION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
