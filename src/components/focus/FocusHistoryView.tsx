import React, { useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import { FocusSessionRecord } from '../../types/focus';
import { formatMinutes, formatDateDisplay } from '../../utils/dateUtils';
import {
  Calendar,
  Clock,
  Flame,
  Award,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  BarChart2,
  Trash2,
  X,
  Target,
  Edit2,
} from 'lucide-react';

export const FocusHistoryView: React.FC = () => {
  const {
    focusSessions,
    focusStats,
    focusGoals,
    updateFocusGoals,
    todayFocusMinutes,
    weeklyFocusMinutes,
    deleteSessionRecord,
  } = useFocus();

  const { whiteRoomMode } = useApp();
  const [selectedSession, setSelectedSession] = useState<FocusSessionRecord | null>(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [dailyGoalHours, setDailyGoalHours] = useState(focusGoals.dailyTargetHours || 4);
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(focusGoals.weeklyTargetHours || 24);

  // Daily target progress
  const dailyTargetMinutes = (focusGoals.dailyTargetHours || 4) * 60;
  const dailyProgressPercent = Math.min(
    100,
    Math.round((todayFocusMinutes / Math.max(1, dailyTargetMinutes)) * 100)
  );

  // Weekly target progress
  const weeklyTargetMinutes = (focusGoals.weeklyTargetHours || 24) * 60;
  const weeklyProgressPercent = Math.min(
    100,
    Math.round((weeklyFocusMinutes / Math.max(1, weeklyTargetMinutes)) * 100)
  );

  // Generate 28-day calendar heatmap
  const heatmapDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayMinutes = focusSessions
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + s.actualFocusMinutes, 0);

    let level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT' = 'NONE';
    if (dayMinutes > 0 && dayMinutes < 60) level = 'LOW';
    else if (dayMinutes >= 60 && dayMinutes < 150) level = 'MEDIUM';
    else if (dayMinutes >= 150 && dayMinutes < 240) level = 'HIGH';
    else if (dayMinutes >= 240) level = 'EXCELLENT';

    return {
      date: dateStr,
      dayNum: day,
      dayMinutes,
      level,
    };
  });

  const handleSaveGoals = async () => {
    await updateFocusGoals({
      dailyTargetHours: Number(dailyGoalHours) || 4,
      weeklyTargetHours: Number(weeklyGoalHours) || 24,
    });
    setIsEditingGoals(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-mono">
      {/* 1. Target Progress Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Target Card */}
        <div className={`p-5 rounded-xl border space-y-3 ${
          whiteRoomMode
            ? 'bg-black border-neutral-800'
            : 'bg-[#090b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-violet-400" />
              DAILY FOCUS TARGET
            </span>
            <span className="text-white font-bold">
              {formatMinutes(todayFocusMinutes)} / {focusGoals.dailyTargetHours}H
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>{dailyProgressPercent}% OF DAILY TARGET EXECUTED</span>
            <button
              onClick={() => setIsEditingGoals(true)}
              className="text-violet-400 hover:text-violet-300 underline"
            >
              EDIT GOALS
            </button>
          </div>
        </div>

        {/* Weekly Target Card */}
        <div className={`p-5 rounded-xl border space-y-3 ${
          whiteRoomMode
            ? 'bg-black border-neutral-800'
            : 'bg-[#090b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              WEEKLY FOCUS TARGET
            </span>
            <span className="text-white font-bold">
              {formatMinutes(weeklyFocusMinutes)} / {focusGoals.weeklyTargetHours}H
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${weeklyProgressPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500">
            <span>{weeklyProgressPercent}% OF WEEKLY CAPACITY MASTERED</span>
          </div>
        </div>
      </div>

      {/* 2. Analytical Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">LONGEST SESSION</div>
          <div className="text-lg font-bold text-white">
            {formatMinutes(focusStats.longestSessionMinutes)}
          </div>
          <div className="text-[10px] text-emerald-400">Peak execution</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">AVG UNINTERRUPTED</div>
          <div className="text-lg font-bold text-white">
            {formatMinutes(focusStats.averageUninterruptedMinutes)}
          </div>
          <div className="text-[10px] text-slate-400">Before pause/distraction</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">COMPLETION RATE</div>
          <div className="text-lg font-bold text-white">
            {focusStats.completionRatePercent}%
          </div>
          <div className="text-[10px] text-violet-400">Target vs Actual</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase">AVG PAUSES / SESSION</div>
          <div className="text-lg font-bold text-white">
            {focusStats.averagePausesPerSession}
          </div>
          <div className="text-[10px] text-slate-400">Stability index</div>
        </div>
      </div>

      {/* 3. Consistency Calendar Heatmap */}
      <div className={`p-6 rounded-xl border space-y-4 ${
        whiteRoomMode
          ? 'bg-black border-neutral-800'
          : 'bg-[#090b14] border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            28-DAY FOCUS EXECUTION HEATMAP
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>NONE</span>
            <span className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-800" />
            <span className="w-2.5 h-2.5 rounded bg-violet-950 border border-violet-800" />
            <span className="w-2.5 h-2.5 rounded bg-violet-700" />
            <span className="w-2.5 h-2.5 rounded bg-violet-400" />
            <span>EXCELLENT (4H+)</span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-2">
          {heatmapDays.map((h) => {
            let bgClass = 'bg-slate-950 border-slate-900 text-slate-600';
            if (h.level === 'LOW') bgClass = 'bg-violet-950/70 border-violet-800 text-violet-300';
            if (h.level === 'MEDIUM') bgClass = 'bg-violet-800 border-violet-700 text-white';
            if (h.level === 'HIGH') bgClass = 'bg-violet-600 border-violet-500 text-white font-bold';
            if (h.level === 'EXCELLENT') bgClass = 'bg-violet-400 border-violet-300 text-black font-bold';

            return (
              <div
                key={h.date}
                title={`${h.date}: ${h.dayMinutes}m focused`}
                className={`p-2 rounded border text-center transition flex flex-col justify-between h-14 ${bgClass}`}
              >
                <span className="text-[10px] block opacity-70">{h.dayNum}</span>
                <span className="text-[9px] block">
                  {h.dayMinutes > 0 ? `${h.dayMinutes}m` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Focus Session Logs History Table */}
      <div className={`p-6 rounded-xl border space-y-4 ${
        whiteRoomMode
          ? 'bg-black border-neutral-800'
          : 'bg-[#090b14] border-slate-800'
      }`}>
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
          CHRONOLOGICAL SESSION LOGS
        </div>

        {focusSessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No focus sessions logged yet. Engage a timer session above to build historical discipline records.
          </div>
        ) : (
          <div className="space-y-2">
            {focusSessions.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setSelectedSession(s)}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-bold w-12">
                    #{String(s.sessionNumber || focusSessions.length - idx).padStart(3, '0')}
                  </span>
                  <div>
                    <div className="font-bold text-white tracking-wide">
                      {s.objective || s.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {s.date} · {s.presetType} · {s.audioTrackTitle || 'Procedural Audio'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-violet-300">
                      {formatMinutes(s.actualFocusMinutes)}
                    </span>
                    <span className="text-slate-500 text-[10px] block">
                      {s.pauseCount} pauses ({s.totalPausedMinutes}m)
                    </span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                    s.status === 'COMPLETED'
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-amber-950 border-amber-600 text-amber-300'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e101a] border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="text-xs font-bold text-violet-300 uppercase tracking-widest">
                SESSION #{String(selectedSession.sessionNumber).padStart(3, '0')} // DEBRIEF
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">OBJECTIVE</span>
                <div className="font-bold text-white text-sm">
                  {selectedSession.objective}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">PLANNED DURATION</span>
                  <div className="font-bold text-white">{selectedSession.totalPlannedMinutes} MIN</div>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">ACTUAL FOCUS</span>
                  <div className="font-bold text-emerald-400">{selectedSession.actualFocusMinutes} MIN</div>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">PAUSE FREQUENCY</span>
                  <div className="font-bold text-amber-400">{selectedSession.pauseCount} PAUSES</div>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">TOTAL PAUSED</span>
                  <div className="font-bold text-white">{selectedSession.totalPausedMinutes} MIN</div>
                </div>
              </div>

              {selectedSession.interruptionReason && (
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase">INTERRUPTION CAUSE</span>
                  <div className="text-slate-300 text-xs">{selectedSession.interruptionReason}</div>
                </div>
              )}

              {selectedSession.reviewNote && (
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">POST-SESSION REFLECTION</span>
                  <div className="text-slate-300 text-xs">{selectedSession.reviewNote}</div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  deleteSessionRecord(selectedSession.id);
                  setSelectedSession(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE LOG</span>
              </button>

              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goals Modal */}
      {isEditingGoals && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e101a] border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 font-mono shadow-2xl">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              CONFIGURE FOCUS TARGETS
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">DAILY TARGET (HOURS)</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={dailyGoalHours}
                  onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">WEEKLY TARGET (HOURS)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={weeklyGoalHours}
                  onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditingGoals(false)}
                className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveGoals}
                className="px-4 py-1.5 rounded bg-violet-600 text-white text-xs font-bold hover:bg-violet-500"
              >
                SAVE TARGETS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
