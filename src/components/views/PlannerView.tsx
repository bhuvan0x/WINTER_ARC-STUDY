import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import {
  formatDateDisplay,
  addDaysToDate,
  getTodayDateString,
  timeStringToMinutes,
  formatMinutes,
} from '../../utils/dateUtils';
import { Task, DayType, TaskCategory } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Filter,
  Calendar,
  Layers,
  Crosshair,
} from 'lucide-react';

interface PlannerViewProps {
  onOpenTaskModal: (task?: Task, defaultStart?: string, defaultEnd?: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ onOpenTaskModal }) => {
  const {
    currentDate,
    setCurrentDate,
    currentDayType,
    setDayTypeOverride,
    tasks,
    toggleTaskComplete,
    deleteTask,
    loadPresetForCurrentDate,
    clearCurrentDateTasks,
    whiteRoomMode,
    disciplineBreakdown,
    setActiveView,
  } = useApp();

  const { launchFocusFromTask } = useFocus();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories: TaskCategory[] = [
    'ACADEMICS',
    'FITNESS',
    'CODING',
    'PROJECT',
    'READING',
    'PERSONAL',
    'RECOVERY',
    'OTHER',
  ];

  const handlePrevDay = () => {
    setCurrentDate(addDaysToDate(currentDate, -1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDaysToDate(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(getTodayDateString());
  };

  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter === 'ALL') return true;
    return t.category === categoryFilter;
  });

  // Calculate total minutes planned
  const totalPlannedMinutes = tasks.reduce(
    (acc, t) => acc + (t.estimatedDurationMinutes || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-xs">
      {/* 1. Date Navigation & Day Protocol Header */}
      <div className={`p-5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-900 hover:bg-slate-800 text-violet-300 transition"
            >
              TODAY
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{formatDateDisplay(currentDate)}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{tasks.length} total blocks</span>
              <span>·</span>
              <span>{formatMinutes(totalPlannedMinutes)} planned</span>
              <span>·</span>
              <span className="text-emerald-400">{disciplineBreakdown.completedTasks} completed</span>
            </div>
          </div>
        </div>

        {/* Day Type Override Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">PROTOCOL:</span>
          {(['SCHOOL', 'HOLIDAY', 'CUSTOM'] as DayType[]).map((type) => {
            const isSelected = currentDayType === type;
            return (
              <button
                key={type}
                onClick={() => setDayTypeOverride(type)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
                  isSelected
                    ? 'bg-violet-950/80 border-violet-500 text-violet-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                [{type} DAY]
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Planner Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenTaskModal()}
            className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW TASK BLOCK</span>
          </button>

          {/* Preset Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-2">
            <button
              onClick={() => {
                if (window.confirm('Apply School Day template? This replaces today’s scheduled blocks.')) {
                  loadPresetForCurrentDate('SCHOOL');
                }
              }}
              className="px-2.5 py-1 rounded border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition"
              title="Apply Standard School Day Template (05:30 - 22:30)"
            >
              LOAD SCHOOL PRESET
            </button>

            <button
              onClick={() => {
                if (window.confirm('Apply Holiday Intensive template? This replaces today’s scheduled blocks.')) {
                  loadPresetForCurrentDate('HOLIDAY');
                }
              }}
              className="px-2.5 py-1 rounded border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition"
              title="Apply Holiday Deep Work & Training Template"
            >
              LOAD HOLIDAY PRESET
            </button>
          </div>
        </div>

        {/* Clear / Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-[11px] focus:outline-none"
            >
              <option value="ALL">ALL CATEGORIES</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (tasks.length > 0 && window.confirm('Clear all tasks for this date?')) {
                clearCurrentDateTasks();
              }
            }}
            className="p-1.5 rounded border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900 transition"
            title="Clear Day Schedule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Interactive Timeline & Detailed Blocks */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
            <div className="text-slate-400">No scheduled blocks match the current criteria.</div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onOpenTaskModal()}
                className="px-3 py-1.5 rounded bg-violet-600 text-white font-medium"
              >
                Create Custom Block
              </button>
              <button
                onClick={() => loadPresetForCurrentDate(currentDayType)}
                className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-200"
              >
                Load Default {currentDayType} Schedule
              </button>
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.completed;
            const priorityColors = {
              CRITICAL: 'text-rose-400 border-rose-900/60 bg-rose-950/20',
              HIGH: 'text-amber-400 border-amber-900/60 bg-amber-950/20',
              NORMAL: 'text-blue-400 border-blue-900/60 bg-blue-950/20',
              LOW: 'text-slate-400 border-slate-800 bg-slate-950/20',
            };

            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-[#090b14]/90 border-slate-800/90 hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Left: Checkbox + Time + Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-slate-300" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-200 text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {task.startTime} – {task.endTime}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-300">
                        {task.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {task.estimatedDurationMinutes}m est
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold font-sans ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-violet-400 bg-violet-950/30 px-1.5 py-0.2 rounded border border-violet-900/40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                  {!task.completed && (
                    <button
                      onClick={() => {
                        launchFocusFromTask(task);
                        setActiveView('focus');
                      }}
                      className="px-2 py-1 rounded bg-violet-950/80 hover:bg-violet-900 border border-violet-600 text-violet-300 font-mono text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                      title="Engage deep work in Focus Lab"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>START FOCUS</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenTaskModal(task)}
                    className="p-1.5 rounded border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
                    title="Edit Task Block"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete task "${task.title}"?`)) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-1.5 rounded border border-slate-800 hover:border-rose-900 text-slate-400 hover:text-rose-400 transition"
                    title="Delete Task Block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
