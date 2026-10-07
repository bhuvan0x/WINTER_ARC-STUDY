import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatMinutes } from '../../utils/dateUtils';
import { Moon, CheckSquare, Dumbbell, BookOpen, Clock, ArrowRight, X } from 'lucide-react';

interface NightReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAAR: () => void;
}

export const NightReportModal: React.FC<NightReportModalProps> = ({
  isOpen,
  onClose,
  onOpenAAR,
}) => {
  const {
    tasks,
    disciplineBreakdown,
    streakStats,
    focusSessions,
    whiteRoomMode,
    dailyReviews,
    currentDate,
  } = useApp();

  if (!isOpen) return null;

  // Calculate study, exercise, and focus minutes
  const studyMinutes = tasks
    .filter((t) => (t.category === 'ACADEMICS' || t.category === 'CODING') && t.completed)
    .reduce((acc, t) => acc + (t.actualDurationMinutes || t.estimatedDurationMinutes || 0), 0);

  const exerciseMinutes = tasks
    .filter((t) => t.category === 'FITNESS' && t.completed)
    .reduce((acc, t) => acc + (t.actualDurationMinutes || t.estimatedDurationMinutes || 0), 0);

  const totalFocusMinutes = focusSessions.reduce((acc, f) => acc + f.durationMinutes, 0);

  const currentReview = dailyReviews.find((r) => r.date === currentDate);

  const handleLaunchAAR = () => {
    onClose();
    onOpenAAR();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className={`w-full max-w-xl rounded-lg border shadow-2xl p-6 sm:p-7 font-mono text-xs my-6 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14] border-violet-500/30 text-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-violet-950/60 border border-violet-500/40 text-violet-300">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold tracking-widest text-sm text-white">
                WINTER ARC // DAILY REPORT
              </div>
              <div className="text-[10px] text-violet-400">
                NIGHT RECONNAISSANCE & DEBRIEF // 夜間総括
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Key Operational Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>TASKS</span>
              <CheckSquare className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-lg font-bold text-slate-100">
              {disciplineBreakdown.completedTasks} / {disciplineBreakdown.totalTasks}
            </div>
            <div className="text-[10px] text-slate-400">
              {disciplineBreakdown.taskCompletionPercent}% completed
            </div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>DISCIPLINE</span>
              <div className="w-2 h-2 rounded-full bg-violet-400" />
            </div>
            <div className="text-lg font-bold text-violet-300">
              {disciplineBreakdown.score}
            </div>
            <div className="text-[10px] text-slate-400">Score of 100</div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>ACTIVE STREAK</span>
              <span className="text-[10px] text-emerald-400">QUALIFIED</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {streakStats.currentStreak} DAYS
            </div>
            <div className="text-[10px] text-slate-400">
              Record: {streakStats.longestStreak}d
            </div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>STUDY TIME</span>
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-300">
              {formatMinutes(studyMinutes)}
            </div>
            <div className="text-[10px] text-slate-400">Academics + Code</div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>EXERCISE</span>
              <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-lg font-bold text-rose-300">
              {formatMinutes(exerciseMinutes)}
            </div>
            <div className="text-[10px] text-slate-400">Physical training</div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>FOCUS SESSIONS</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-300">
              {formatMinutes(totalFocusMinutes)}
            </div>
            <div className="text-[10px] text-slate-400">White Room timer</div>
          </div>
        </div>

        {/* Tactical Debrief Sections */}
        <div className="space-y-3 mb-5">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
              WHAT WORKED // 達成事項
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {currentReview?.completed || `${disciplineBreakdown.completedTasks} scheduled tasks executed accurately on timeline.`}
            </p>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
              WHAT FAILED / DEVIATION // 未達・時間浪費
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {currentReview?.missed || (disciplineBreakdown.totalTasks - disciplineBreakdown.completedTasks > 0
                ? `${disciplineBreakdown.totalTasks - disciplineBreakdown.completedTasks} tasks uncompleted. Root cause must be logged.`
                : 'Zero tactical deviations logged today. Clean execution.')}
            </p>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1">
              WHAT CHANGES TOMORROW // 明日の改善策
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {currentReview?.tomorrowChanges || 'Lock sleep protocol. Zero negotiation on morning wake schedule.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-slate-800 text-slate-400 hover:text-white transition"
          >
            CLOSE REPORT
          </button>

          <button
            onClick={handleLaunchAAR}
            className="px-5 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1.5 shadow transition"
          >
            <span>OPEN AFTER-ACTION REVIEW</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
