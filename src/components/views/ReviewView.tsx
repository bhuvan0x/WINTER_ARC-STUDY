import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateDisplay, getTodayDateString, addDaysToDate } from '../../utils/dateUtils';
import { DailyReview } from '../../types';
import {
  FileCheck2,
  Check,
  RotateCcw,
  History,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const ReviewView: React.FC = () => {
  const {
    currentDate,
    tasks,
    disciplineBreakdown,
    dailyReviews,
    saveDailyReview,
    updatePrimaryObjective,
    whiteRoomMode,
  } = useApp();

  const currentReview = dailyReviews.find((r) => r.date === currentDate);

  const [completed, setCompleted] = useState('');
  const [missed, setMissed] = useState('');
  const [whyMissed, setWhyMissed] = useState('');
  const [wastedTimeCause, setWastedTimeCause] = useState('');
  const [tomorrowChanges, setTomorrowChanges] = useState('');
  const [tomorrowPrimaryObjective, setTomorrowPrimaryObjective] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Prepopulate intelligent defaults based on today's actual execution data
  useEffect(() => {
    if (currentReview) {
      setCompleted(currentReview.completed);
      setMissed(currentReview.missed);
      setWhyMissed(currentReview.whyMissed);
      setWastedTimeCause(currentReview.wastedTimeCause);
      setTomorrowChanges(currentReview.tomorrowChanges);
      setTomorrowPrimaryObjective(currentReview.tomorrowPrimaryObjective);
    } else {
      const completedList = tasks.filter((t) => t.completed).map((t) => t.title).join(', ');
      const missedList = tasks.filter((t) => !t.completed).map((t) => t.title).join(', ');

      setCompleted(completedList || 'All priority blocks completed on schedule.');
      setMissed(missedList || 'Zero scheduled blocks missed.');
      setWhyMissed('');
      setWastedTimeCause('');
      setTomorrowChanges('');
      setTomorrowPrimaryObjective('');
    }
  }, [currentReview, tasks, currentDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await saveDailyReview({
      completed,
      missed,
      whyMissed,
      wastedTimeCause,
      tomorrowChanges,
      tomorrowPrimaryObjective,
    });

    // If tomorrow's primary objective is provided, lock it in for tomorrow's plan!
    if (tomorrowPrimaryObjective.trim()) {
      const tomorrowDate = addDaysToDate(currentDate || getTodayDateString(), 1);
      // It can be picked up when user advances date or initializes tomorrow
    }

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono text-xs">
      {/* 1. Tactical Header */}
      <div className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-violet-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wider">
              DAILY AFTER-ACTION REVIEW (AAR)
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatDateDisplay(currentDate)} // 事後検証・データ監査
          </p>
        </div>

        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-right">
          <div className="text-[10px] text-slate-400 uppercase">TODAY'S SCORE</div>
          <div className="text-lg font-bold text-violet-300">
            {disciplineBreakdown.score}% DISCIPLINE
          </div>
        </div>
      </div>

      {/* 2. Directive Motto Banner */}
      <div className="p-4 rounded-lg border border-violet-500/30 bg-violet-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-violet-400 shrink-0" />
          <div>
            <div className="text-xs font-bold tracking-widest text-violet-300 uppercase">
              "NO EXCUSES. ONLY DATA."
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Analyze execution friction objectively. Deviations are diagnostic signals, not moral failures.
            </div>
          </div>
        </div>
      </div>

      {/* 3. 6-Point Analytical Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-5 shadow-xl">
        {/* Question 1 */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            1. WHAT WAS COMPLETED? // 実行達成事項
          </label>
          <textarea
            rows={2}
            required
            value={completed}
            onChange={(e) => setCompleted(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500 font-sans text-xs resize-none"
            placeholder="Executed Academic Deep Work, 100 pushups, Chemistry NCERT set..."
          />
        </div>

        {/* Question 2 */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            2. WHAT WAS MISSED OR INCOMPLETE? // 未達・放棄項目
          </label>
          <textarea
            rows={2}
            value={missed}
            onChange={(e) => setMissed(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500 font-sans text-xs resize-none"
            placeholder="Skipped evening reading session, delayed homework start..."
          />
        </div>

        {/* Question 3 */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            3. WHY WAS IT MISSED? (ROOT CAUSE ANALYSIS) // 根本原因の特定
          </label>
          <textarea
            rows={2}
            value={whyMissed}
            onChange={(e) => setWhyMissed(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500 font-sans text-xs resize-none"
            placeholder="Underestimated task complexity, friction transitioning from school commute..."
          />
        </div>

        {/* Question 4 */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            4. WHAT CAUSED WASTED TIME / COGNITIVE LEAKAGE? // 時間浪費要因
          </label>
          <textarea
            rows={2}
            value={wastedTimeCause}
            onChange={(e) => setWastedTimeCause(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500 font-sans text-xs resize-none"
            placeholder="Unplanned phone check at 17:30 (cost 35 min), cognitive fatigue from inadequate water..."
          />
        </div>

        {/* Question 5 */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            5. WHAT SHOULD CHANGE TOMORROW? (TACTICAL COUNTERMEASURE) // 明日の戦術修正
          </label>
          <textarea
            rows={2}
            required
            value={tomorrowChanges}
            onChange={(e) => setTomorrowChanges(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500 font-sans text-xs resize-none"
            placeholder="Phone in separate room prior to 16:00 study block. Zero negotiation on morning wake..."
          />
        </div>

        {/* Question 6 */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold uppercase tracking-wider">
            6. WHAT IS TOMORROW'S PRIMARY OBJECTIVE? // 明日の最優先司令
          </label>
          <input
            type="text"
            required
            value={tomorrowPrimaryObjective}
            onChange={(e) => setTomorrowPrimaryObjective(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500 font-sans text-xs font-semibold"
            placeholder="e.g. Master Organic Chemistry nomenclature and complete test set."
          />
        </div>

        {/* Form Submission */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            {isSavedNotice && (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4" />
                <span>AFTER-ACTION REPORT ARCHIVED LOCALLY</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Check className="w-4 h-4" />
            <span>RECORD AFTER-ACTION REPORT</span>
          </button>
        </div>
      </form>

      {/* 4. Past Reviews Archive */}
      {dailyReviews.length > 0 && (
        <div className="p-5 rounded-lg border border-slate-800 bg-slate-950/70 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider">
            <History className="w-4 h-4 text-violet-400" />
            <span>ARCHIVED AFTER-ACTION REPORTS ({dailyReviews.length})</span>
          </div>

          <div className="space-y-2">
            {dailyReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3 rounded bg-slate-900/60 border border-slate-800 text-slate-300 space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1">
                  <span className="font-bold text-violet-300">{rev.date}</span>
                  <span className="text-[10px]">AAR ARCHIVED</span>
                </div>
                <div className="text-slate-200">
                  <span className="text-emerald-400 font-semibold">Done:</span> {rev.completed}
                </div>
                {rev.tomorrowPrimaryObjective && (
                  <div className="text-slate-300 text-[11px]">
                    <span className="text-violet-400 font-semibold">Next Primary:</span> "{rev.tomorrowPrimaryObjective}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
