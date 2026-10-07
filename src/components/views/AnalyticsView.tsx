import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import {
  formatMinutes,
  addDaysToDate,
  getTodayDateString,
  formatDateShort,
} from '../../utils/dateUtils';
import { calculateDailyDisciplineScore } from '../../utils/scoring';
import {
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Dumbbell,
  Clock,
  Calendar,
  Layers,
  Crosshair,
  PauseCircle,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    allTasks,
    allObjectives,
    allFocusSessions,
    streakStats,
    goals,
    whiteRoomMode,
  } = useApp();

  const { focusStats, focusSessions } = useFocus();

  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH'>('WEEK');

  const todayStr = getTodayDateString();
  const daysCount = timeRange === 'WEEK' ? 7 : 30;

  // Prepare chronological historical data for past 7 or 30 days
  const historicalData = useMemo(() => {
    const list = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = addDaysToDate(todayStr, -i);
      const dayTasks = allTasks.filter((t) => t.date === d);
      const dayObj = allObjectives.filter((o) => o.date === d);
      const dayFocus = allFocusSessions.filter((f) => f.date === d);

      const scoreObj = calculateDailyDisciplineScore(dayTasks, dayObj, dayFocus);
      const studyMins = dayTasks
        .filter((t) => (t.category === 'ACADEMICS' || t.category === 'CODING') && t.completed)
        .reduce((acc, t) => acc + (t.actualDurationMinutes || t.estimatedDurationMinutes || 0), 0);

      const exerciseMins = dayTasks
        .filter((t) => t.category === 'FITNESS' && t.completed)
        .reduce((acc, t) => acc + (t.actualDurationMinutes || t.estimatedDurationMinutes || 0), 0);

      const focusMins = dayFocus.reduce((acc: number, f) => acc + f.durationMinutes, 0);

      list.push({
        date: d,
        shortDate: formatDateShort(d),
        score: scoreObj.score,
        totalTasks: scoreObj.totalTasks,
        completedTasks: scoreObj.completedTasks,
        missedTasks: scoreObj.totalTasks - scoreObj.completedTasks,
        completionRate: scoreObj.taskCompletionPercent,
        studyMinutes: studyMins,
        exerciseMinutes: exerciseMins,
        focusMinutes: focusMins,
      });
    }
    return list;
  }, [allTasks, allObjectives, allFocusSessions, daysCount, todayStr]);

  // Aggregate statistics
  const activeDays = historicalData.filter((d) => d.totalTasks > 0);
  const avgDiscipline =
    activeDays.length > 0
      ? Math.round(activeDays.reduce((acc, d) => acc + d.score, 0) / activeDays.length)
      : 0;

  const totalStudyMinutes = historicalData.reduce((acc, d) => acc + d.studyMinutes, 0);
  const totalExerciseMinutes = historicalData.reduce((acc, d) => acc + d.exerciseMinutes, 0);
  const totalFocusMinutes = historicalData.reduce((acc, d) => acc + d.focusMinutes, 0);
  const totalCompletedTasks = historicalData.reduce((acc, d) => acc + d.completedTasks, 0);
  const totalMissedTasks = historicalData.reduce((acc, d) => acc + Math.max(0, d.missedTasks), 0);

  // Best & Weakest day
  let bestDay = activeDays.length > 0 ? activeDays[0] : null;
  let weakestDay = activeDays.length > 0 ? activeDays[0] : null;

  activeDays.forEach((d) => {
    if (!bestDay || d.score > bestDay.score) bestDay = d;
    if (!weakestDay || d.score < weakestDay.score) weakestDay = d;
  });

  // Average Goal Progress
  const avgGoalProgress =
    goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-xs">
      {/* 1. Header with Time Filter */}
      <div className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h1 className="text-base sm:text-lg font-bold text-white">
              TACTICAL ANALYTICS MATRIX
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            DISCIPLINE & PERFORMANCE AUDIT // データ分析・検証
          </p>
        </div>

        {/* Range Tabs */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-1">
          <button
            onClick={() => setTimeRange('WEEK')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              timeRange === 'WEEK'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WEEKLY (7D)
          </button>
          <button
            onClick={() => setTimeRange('MONTH')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              timeRange === 'MONTH'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MONTHLY (30D)
          </button>
        </div>
      </div>

      {/* 2. Top Level KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border border-slate-800 bg-[#090b14]/90">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
            <span>AVG DISCIPLINE</span>
            <Award className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-violet-300 mt-1">
            {avgDiscipline}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Target benchmark: 75%
          </div>
        </div>

        <div className="p-4 rounded-lg border border-slate-800 bg-[#090b14]/90">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
            <span>STUDY ACCUMULATION</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300 mt-1">
            {formatMinutes(totalStudyMinutes)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Academics + Code Deep Work
          </div>
        </div>

        <div className="p-4 rounded-lg border border-slate-800 bg-[#090b14]/90">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
            <span>FITNESS SESSIONS</span>
            <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 mt-1">
            {formatMinutes(totalExerciseMinutes)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Total conditioning duration
          </div>
        </div>

        <div className="p-4 rounded-lg border border-slate-800 bg-[#090b14]/90">
          <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
            <span>TASK EXECUTION</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">
            {totalCompletedTasks}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Missed / Deviated: {totalMissedTasks}
          </div>
        </div>
      </div>

      {/* 3. Discipline Trend Chart (SVG) */}
      <div className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              DISCIPLINE SCORE TRAJECTORY ({timeRange})
            </h2>
            <p className="text-[11px] text-slate-400">
              Daily calculated adherence vs. consistency benchmark
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-violet-500" /> Score
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-600" /> 75% Benchmark
            </span>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="h-64 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="20" x2="600" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="65" x2="600" y2="65" stroke="#334155" strokeDasharray="4 4" /> {/* 75% line */}
            <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1="180" x2="600" y2="180" stroke="#1e293b" strokeDasharray="3 3" />

            {/* Benchmark Label */}
            <text x="5" y="60" fill="#64748b" fontSize="9" fontFamily="monospace">75% QUALIFYING</text>
            <text x="5" y="15" fill="#64748b" fontSize="9" fontFamily="monospace">100%</text>

            {/* Bars or Polyline */}
            {historicalData.map((d, idx) => {
              const xStep = 600 / historicalData.length;
              const barWidth = Math.max(6, xStep * 0.6);
              const x = idx * xStep + (xStep - barWidth) / 2;
              const height = (d.score / 100) * 160;
              const y = 180 - height;
              const isQualified = d.score >= 75;

              return (
                <g key={d.date} className="group">
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    rx="2"
                    fill={isQualified ? '#8b5cf6' : d.score > 0 ? '#38bdf8' : '#1e293b'}
                    className="hover:opacity-80 transition cursor-pointer"
                  />
                  {/* Date label at bottom */}
                  <text
                    x={x + barWidth / 2}
                    y="205"
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {d.shortDate.split(' ')[1]}
                  </text>
                  {/* Score tooltip value on bar top */}
                  {d.score > 0 && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 4}
                      fill="#e2e8f0"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {d.score}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. Comparative Breakdown: Best Day / Weakest Day & Goals Alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Extremes Audit Box */}
        <div className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            EXTREMES & DEVIATION AUDIT
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-slate-950 border border-emerald-900/40">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">BEST EXECUTION DAY</div>
              {bestDay ? (
                <div className="mt-1">
                  <div className="text-xl font-bold text-white">{bestDay.score}%</div>
                  <div className="text-[10px] text-slate-400">{formatDateShort(bestDay.date)}</div>
                  <div className="text-[10px] text-emerald-300 mt-1">
                    {bestDay.completedTasks} tasks executed
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-[10px] mt-1">No recorded data</div>
              )}
            </div>

            <div className="p-3 rounded bg-slate-950 border border-amber-900/40">
              <div className="text-[10px] text-amber-400 font-bold uppercase">WEAKEST EXECUTION DAY</div>
              {weakestDay ? (
                <div className="mt-1">
                  <div className="text-xl font-bold text-white">{weakestDay.score}%</div>
                  <div className="text-[10px] text-slate-400">{formatDateShort(weakestDay.date)}</div>
                  <div className="text-[10px] text-amber-300 mt-1">
                    {weakestDay.missedTasks} uncompleted
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-[10px] mt-1">No recorded data</div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
            <span className="text-violet-400 font-bold">ANALYSIS:</span> Consistency is built by compressing the delta between best and weakest days. Eliminate recurring time-loss bottlenecks.
          </div>
        </div>

        {/* Focus Consistency Deep Analysis */}
        <div className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-violet-400" />
              <span>FOCUS LAB CONSISTENCY // {timeRange === 'WEEK' ? '7-DAY' : '30-DAY'} ANALYSIS</span>
            </h2>
            <span className="text-[10px] text-emerald-400 font-bold">
              {focusStats.completionRatePercent}% EXECUTION
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">PLANNED TIME</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {formatMinutes(focusStats.totalPlannedMinutes)}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">FOCUSED TIME</span>
              <span className="text-sm font-bold text-emerald-300 mt-0.5 block">
                {formatMinutes(focusStats.actualFocusMinutes)}
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">PAUSE COUNT</span>
              <span className="text-sm font-bold text-amber-300 mt-0.5 block">
                {focusStats.totalPauses} ({focusStats.averagePausesPerSession}/sess)
              </span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">AVG UNINTERRUPTED</span>
              <span className="text-sm font-bold text-violet-300 mt-0.5 block">
                {focusStats.averageUninterruptedMinutes}m block
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>
              Best Peak Focus Window: <strong className="text-white">{focusStats.bestTimeWindow}</strong>
            </span>
            <span>
              Most Productive Day: <strong className="text-violet-300">{focusStats.bestDayOfWeek}</strong>
            </span>
          </div>
        </div>

        {/* Goals Progress Overview */}
        <div className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              STRATEGIC GOAL ATTAINMENT
            </h2>
            <span className="text-[10px] text-violet-400 font-bold">
              AVG {avgGoalProgress}%
            </span>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              No strategic goals established.
            </div>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 4).map((g) => (
                <div key={g.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-medium truncate">{g.title}</span>
                    <span className="text-violet-300 font-bold">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-violet-500 h-full rounded-full"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
