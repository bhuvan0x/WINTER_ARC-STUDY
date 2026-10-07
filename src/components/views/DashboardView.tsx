import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import {
  getCurrentTimeMinutes,
  getCurrentTimeHHMMSS,
  timeStringToMinutes,
  formatMinutes,
  isTimeInRange,
  formatDateDisplay,
  formatDateShort,
} from '../../utils/dateUtils';
import { Task, DailyObjective } from '../../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Play,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  Dumbbell,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Crosshair,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenTaskModal: (task?: Task) => void;
  onOpenAAR: () => void;
  onOpenMorningBrief: () => void;
  onOpenNightReport: () => void;
  onOpenScoreBreakdown: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTaskModal,
  onOpenAAR,
  onOpenMorningBrief,
  onOpenNightReport,
  onOpenScoreBreakdown,
}) => {
  const {
    settings,
    currentDate,
    effectiveToday,
    dayNumber,
    currentDayType,
    currentPlan,
    tasks,
    objectives,
    focusSessions,
    disciplineBreakdown,
    streakStats,
    academicMetrics,
    whiteRoomMode,
    toggleTaskComplete,
    createObjective,
    toggleObjective,
    deleteObjective,
    updatePrimaryObjective,
    setActiveView,
  } = useApp();

  const { todayFocusMinutes, focusGoals } = useFocus();

  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(getCurrentTimeMinutes());
  const [digitalTime, setDigitalTime] = useState(getCurrentTimeHHMMSS());
  const [isEditingPrimary, setIsEditingPrimary] = useState(false);
  const [primaryInput, setPrimaryInput] = useState(currentPlan.primaryObjective || '');
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [newObjectiveType, setNewObjectiveType] = useState<DailyObjective['type']>('SECONDARY');

  // Sync clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMinutes(getCurrentTimeMinutes());
      setDigitalTime(getCurrentTimeHHMMSS());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setPrimaryInput(currentPlan.primaryObjective || '');
  }, [currentPlan.primaryObjective]);

  // Determine current active task and next upcoming task
  const sortedTasks = [...tasks].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const currentTask = sortedTasks.find((t) =>
    isTimeInRange(t.startTime, t.endTime, currentTimeMinutes)
  );

  const nextTask = sortedTasks.find((t) => {
    const startM = timeStringToMinutes(t.startTime);
    return startM > currentTimeMinutes;
  });

  // Calculate study, exercise, and focus hours today
  const studyMinutes = tasks
    .filter((t) => (t.category === 'ACADEMICS' || t.category === 'CODING') && t.completed)
    .reduce((acc, t) => acc + (t.actualDurationMinutes || t.estimatedDurationMinutes || 0), 0);

  const exerciseMinutes = tasks
    .filter((t) => t.category === 'FITNESS' && t.completed)
    .reduce((acc, t) => acc + (t.actualDurationMinutes || t.estimatedDurationMinutes || 0), 0);

  const totalFocusMinutes = focusSessions.reduce((acc, f) => acc + f.durationMinutes, 0);

  // Group objectives
  const primaryObjectives = objectives.filter((o) => o.type === 'PRIMARY');
  const secondaryObjectives = objectives.filter((o) => o.type === 'SECONDARY');
  const nonNegotiables = objectives.filter((o) => o.type === 'NON_NEGOTIABLE');

  const handleSavePrimary = () => {
    if (primaryInput.trim()) {
      updatePrimaryObjective(primaryInput.trim());
      setIsEditingPrimary(false);
    }
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (newObjectiveText.trim()) {
      createObjective(newObjectiveType, newObjectiveText.trim());
      setNewObjectiveText('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* 1. Tactical Command Hero / Status Header */}
      <div className={`rounded-lg border p-5 sm:p-6 transition-colors shadow-lg ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-100'
          : 'bg-[#090b14]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">
                WINTER ARC STATUS
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400">{formatDateDisplay(currentDate)}</span>
              <span className="text-slate-600">/</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-300">
                {currentDayType} PROTOCOL
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
              <span>DAY {dayNumber}</span>
              <span className="text-xs sm:text-sm font-normal text-slate-400 font-mono">
                [{digitalTime}]
              </span>
            </div>
          </div>

          {/* Quick Core Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <button
              onClick={onOpenScoreBreakdown}
              className="p-3 rounded bg-slate-950 border border-slate-800/80 text-left hover:border-violet-500/50 transition group"
            >
              <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                <span>DISCIPLINE</span>
                <Award className="w-3 h-3 text-violet-400" />
              </div>
              <div className="text-xl font-bold text-violet-300 group-hover:text-violet-200">
                {disciplineBreakdown.score}%
              </div>
              <div className="text-[9px] text-slate-400">Target ≥ 75%</div>
            </button>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                <span>COMPLETION</span>
                <CheckCircle2 className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-xl font-bold text-blue-300">
                {disciplineBreakdown.taskCompletionPercent}%
              </div>
              <div className="text-[9px] text-slate-400">
                {disciplineBreakdown.completedTasks}/{disciplineBreakdown.totalTasks} tasks
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                <span>STREAK</span>
                <Flame className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-emerald-300">
                {streakStats.currentStreak} DAYS
              </div>
              <div className="text-[9px] text-slate-400">Max: {streakStats.longestStreak}d</div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                <span>FOCUS LOG</span>
                <Clock className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-300">
                {formatMinutes(totalFocusMinutes)}
              </div>
              <div className="text-[9px] text-slate-400">{focusSessions.length} sessions</div>
            </div>
          </div>
        </div>

        {/* Tactical Directive (Primary Objective Banner) */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="text-[10px] font-bold tracking-widest text-violet-400 uppercase mb-0.5">
              TODAY'S STRATEGIC OBJECTIVE
            </div>
            {isEditingPrimary ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={primaryInput}
                  onChange={(e) => setPrimaryInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-violet-500 rounded text-slate-100 text-xs focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSavePrimary}
                  className="px-3 py-1.5 bg-violet-600 text-white rounded text-xs hover:bg-violet-500"
                >
                  LOCK
                </button>
                <button
                  onClick={() => setIsEditingPrimary(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <span className="text-sm sm:text-base font-semibold text-white font-sans italic">
                  "{currentPlan.primaryObjective || 'Execute the plan. No negotiation.'}"
                </span>
                <button
                  onClick={() => setIsEditingPrimary(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition"
                  title="Modify Strategic Directive"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onOpenMorningBrief}
              className="px-3 py-1.5 rounded text-xs border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              MORNING BRIEF
            </button>
            <button
              onClick={onOpenNightReport}
              className="px-3 py-1.5 rounded text-xs border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              NIGHT REPORT
            </button>
          </div>
        </div>
      </div>

      {/* CBSE Academic Engine Strategic Card */}
      <div className="p-4 rounded-lg border border-violet-500/30 bg-[#090b14]/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-violet-950/60 border border-violet-500/40 text-violet-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                CBSE CLASS {settings.studentClass} PREPARATION
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] text-amber-300 font-bold">
                {academicMetrics.totalCalendarDays} DAYS TO EXAM
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {settings.examDateType}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              Syllabus Completion: {academicMetrics.syllabusCompletionPercent}% · Target Finish: {formatDateShort(academicMetrics.recommendedSyllabusCompletionDate)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Revision Buffer: {academicMetrics.revisionBufferDays} days reserved before {formatDateShort(settings.examDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setActiveView('academics')}
            className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <span>ACADEMIC ENGINE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Focus Lab Protocol & Target Banner */}
      <div className="p-4 rounded-lg border border-slate-800 bg-[#090b14]/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-violet-950/60 border border-violet-500/40 text-violet-300">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                FOCUS TARGET
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] text-emerald-300 font-bold">
                {formatMinutes(todayFocusMinutes)} / {focusGoals.dailyTargetHours || 4}H
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="h-2 w-36 sm:w-48 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (todayFocusMinutes /
                          Math.max(1, (focusGoals.dailyTargetHours || 4) * 60)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-white">
                {Math.min(
                  100,
                  Math.round(
                    (todayFocusMinutes /
                      Math.max(1, (focusGoals.dailyTargetHours || 4) * 60)) *
                      100
                  )
                )}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setActiveView('focus')}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <span>ENTER FOCUS LAB</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Tactical Execution Grid: Current Task + Next Task Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Task Box */}
        <div className={`p-5 rounded-lg border flex flex-col justify-between transition-colors ${
          currentTask
            ? 'bg-violet-950/20 border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold tracking-wider text-violet-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CURRENT TASK OPERATION
              </span>
              <span className="text-slate-400">{digitalTime}</span>
            </div>

            {currentTask ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                    {currentTask.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-violet-500/50 bg-violet-900/40 text-violet-300 shrink-0">
                    {currentTask.category}
                  </span>
                </div>
                {currentTask.description && (
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {currentTask.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>TIME: {currentTask.startTime} – {currentTask.endTime}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-bold">[{currentTask.priority}]</span>
                  <span>·</span>
                  <span>{currentTask.estimatedDurationMinutes}m</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">No active block for this exact minute.</p>
                <p className="text-[11px] text-slate-400 mt-1">Review upcoming timeline or initiate White Room deep focus.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
            {currentTask ? (
              <button
                onClick={() => toggleTaskComplete(currentTask.id)}
                className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition ${
                  currentTask.completed
                    ? 'bg-emerald-900/50 border border-emerald-500 text-emerald-300'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentTask.completed ? 'COMPLETED' : 'COMPLETE BLOCK'}</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenTaskModal()}
                className="px-4 py-2 rounded text-xs border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition"
              >
                + SCHEDULE BLOCK
              </button>
            )}

            <button
              onClick={() => setActiveView('focus')}
              className="px-3 py-2 rounded text-xs border border-violet-500/40 bg-violet-950/30 text-violet-300 hover:bg-violet-900/50 flex items-center gap-1.5 transition"
            >
              <Play className="w-3.5 h-3.5 text-violet-400" />
              <span>WHITE ROOM FOCUS</span>
            </button>
          </div>
        </div>

        {/* Next Task Box */}
        <div className="p-5 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold tracking-wider text-slate-300">
                NEXT STRATEGIC TARGET
              </span>
              <span className="text-[11px] text-slate-400">UPCOMING</span>
            </div>

            {nextTask ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
                    {nextTask.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 shrink-0">
                    {nextTask.category}
                  </span>
                </div>
                {nextTask.description && (
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {nextTask.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>STARTS: {nextTask.startTime}</span>
                  <span>·</span>
                  <span>UNTIL: {nextTask.endTime}</span>
                  <span>·</span>
                  <span className="text-amber-400">[{nextTask.priority}]</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs">All scheduled blocks for today are concluded.</p>
                <p className="text-[11px] text-slate-400 mt-1">Proceed to night After-Action Review.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
            <button
              onClick={() => setActiveView('planner')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>VIEW FULL TIMELINE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {nextTask && (
              <button
                onClick={() => onOpenTaskModal(nextTask)}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                EDIT SPEC
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Daily Objectives Matrix: Primary / Secondary / Non-Negotiables */}
      <div className="rounded-lg border border-slate-800 bg-[#090b14]/90 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              DAILY OBJECTIVES MATRIX
            </h2>
            <p className="text-xs text-slate-400">
              NON-NEGOTIABLES & MISSION PARAMETERS // 必達目標一覧
            </p>
          </div>

          {/* Add Objective form */}
          <form onSubmit={handleAddObjective} className="flex items-center gap-2">
            <select
              value={newObjectiveType}
              onChange={(e) => setNewObjectiveType(e.target.value as DailyObjective['type'])}
              className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="PRIMARY">PRIMARY</option>
              <option value="SECONDARY">SECONDARY</option>
              <option value="NON_NEGOTIABLE">NON-NEGOTIABLE</option>
            </select>
            <input
              type="text"
              placeholder="+ New objective..."
              value={newObjectiveText}
              onChange={(e) => setNewObjectiveText(e.target.value)}
              className="px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 w-44 sm:w-56"
            />
            <button
              type="submit"
              className="p-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white transition"
              title="Add Objective"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Non-Negotiables (Highest tactical importance) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                NON-NEGOTIABLES
              </span>
              <span className="text-[10px] text-slate-400">
                {nonNegotiables.filter((n) => n.completed).length} / {nonNegotiables.length}
              </span>
            </div>
            <div className="space-y-2">
              {nonNegotiables.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No non-negotiables entered.</div>
              ) : (
                nonNegotiables.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2 group"
                  >
                    <button
                      onClick={() => toggleObjective(item.id)}
                      className="flex items-start gap-2 text-left flex-1"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-rose-400/80 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {item.text}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteObjective(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Primary Objectives */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                PRIMARY OBJECTIVES
              </span>
              <span className="text-[10px] text-slate-400">
                {primaryObjectives.filter((p) => p.completed).length} / {primaryObjectives.length}
              </span>
            </div>
            <div className="space-y-2">
              {primaryObjectives.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No primary objectives added.</div>
              ) : (
                primaryObjectives.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2 group"
                  >
                    <button
                      onClick={() => toggleObjective(item.id)}
                      className="flex items-start gap-2 text-left flex-1"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {item.text}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteObjective(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Secondary Objectives */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                SECONDARY OBJECTIVES
              </span>
              <span className="text-[10px] text-slate-400">
                {secondaryObjectives.filter((s) => s.completed).length} / {secondaryObjectives.length}
              </span>
            </div>
            <div className="space-y-2">
              {secondaryObjectives.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No secondary objectives.</div>
              ) : (
                secondaryObjectives.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2 group"
                  >
                    <button
                      onClick={() => toggleObjective(item.id)}
                      className="flex items-start gap-2 text-left flex-1"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {item.text}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteObjective(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Daily Execution Timeline Overview */}
      <div className="rounded-lg border border-slate-800 bg-[#090b14]/90 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              DAY EXECUTION SCHEDULE
            </h2>
            <p className="text-xs text-slate-400">
              {tasks.length} BLOCKS TOTAL // {disciplineBreakdown.completedTasks} EXECUTED
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenTaskModal()}
              className="px-3 py-1.5 rounded text-xs bg-violet-600 hover:bg-violet-500 text-white font-medium transition"
            >
              + ADD BLOCK
            </button>
            <button
              onClick={() => setActiveView('planner')}
              className="px-3 py-1.5 rounded text-xs border border-slate-800 text-slate-300 hover:text-white transition"
            >
              EXPAND PLANNER
            </button>
          </div>
        </div>

        {/* Task Cards horizontal/vertical scroll list */}
        {sortedTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 border border-dashed border-slate-800 rounded">
            No schedule blocks created for today yet. Load a preset or create a custom task.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((t) => {
              const isCurrent = isTimeInRange(t.startTime, t.endTime, currentTimeMinutes);
              return (
                <div
                  key={t.id}
                  className={`p-3 rounded border flex items-center justify-between gap-3 transition-colors ${
                    isCurrent
                      ? 'bg-violet-950/30 border-violet-500/60 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                      : t.completed
                      ? 'bg-slate-950/40 border-slate-900 opacity-60'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(t.id)}
                      className="text-slate-400 hover:text-emerald-400 transition"
                      title={t.completed ? 'Mark pending' : 'Mark completed'}
                    >
                      {t.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 hover:text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold shrink-0">
                          {t.startTime} - {t.endTime}
                        </span>
                        <span className={`text-xs font-semibold truncate ${
                          t.completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}>
                          {t.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 animate-pulse shrink-0">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {t.category}
                    </span>
                    <button
                      onClick={() => onOpenTaskModal(t)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Night After-Action Review Prompt Bar */}
      <div className="p-4 rounded-lg border border-violet-500/30 bg-violet-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-violet-300 tracking-wider">
            END-OF-DAY PROTOCOL: AFTER-ACTION REVIEW
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Audit completion percentage, log root-cause deviations, and lock tomorrow's primary objective.
          </div>
        </div>
        <button
          onClick={onOpenAAR}
          className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 transition shrink-0 shadow-md"
        >
          <span>EXECUTE AAR REVIEW</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
