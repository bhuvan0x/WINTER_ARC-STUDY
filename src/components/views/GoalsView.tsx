import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal, GoalMilestone } from '../../types';
import { formatDateShort, getTodayDateString, addDaysToDate } from '../../utils/dateUtils';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Layers,
  ArrowRight,
  X,
  Check,
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const {
    goals,
    createOrUpdateGoal,
    deleteGoal,
    toggleGoalMilestone,
    allTasks,
    setActiveView,
    whiteRoomMode,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Goal['category']>('ACADEMICS');
  const [deadline, setDeadline] = useState(addDaysToDate(getTodayDateString(), 60));
  const [milestonesText, setMilestonesText] = useState('');

  const handleOpenAdd = () => {
    setSelectedGoal(null);
    setTitle('');
    setCategory('ACADEMICS');
    setDeadline(addDaysToDate(getTodayDateString(), 60));
    setMilestonesText('Phase 1: Foundation concepts\nPhase 2: Problem set drills\nPhase 3: Full revision & tests');
    setIsEditing(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setTitle(goal.title);
    setCategory(goal.category);
    setDeadline(goal.deadline);
    setMilestonesText(goal.milestones.map((m) => m.text).join('\n'));
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const milestonesList: GoalMilestone[] = milestonesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text, idx) => {
        // preserve completion if editing
        const existing = selectedGoal?.milestones[idx];
        return {
          id: existing?.id || `ms_${Date.now()}_${idx}`,
          text,
          completed: existing?.completed ?? false,
        };
      });

    await createOrUpdateGoal({
      id: selectedGoal?.id,
      title: title.trim(),
      category,
      deadline,
      milestones: milestonesList,
      progress: selectedGoal?.progress ?? 0,
      status: 'ACTIVE',
    });

    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-xs">
      {/* 1. Goals Strategic Header */}
      <div className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-400" />
            <h1 className="text-base sm:text-lg font-bold text-white">
              STRATEGIC GOAL DIRECTIVES
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            GOAL PROGRESS → TASK EXECUTION → DAILY ACTION // 目標管理体系
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>NEW STRATEGIC GOAL</span>
        </button>
      </div>

      {/* 2. Modal for Add / Edit Goal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0b0d18] border border-violet-500/30 rounded-lg p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="font-bold tracking-wider text-sm text-white">
                {selectedGoal ? 'EDIT STRATEGIC GOAL' : 'INITIALIZE STRATEGIC GOAL'}
              </span>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">GOAL TITLE *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500 font-sans text-sm"
                  placeholder="e.g. Complete Class 12 Chemistry syllabus"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Goal['category'])}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="ACADEMICS">ACADEMICS</option>
                    <option value="FITNESS">FITNESS</option>
                    <option value="CODING">CODING</option>
                    <option value="PROJECT">PROJECT</option>
                    <option value="PERSONAL">PERSONAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">TARGET DEADLINE</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">MILESTONES (1 PER LINE)</label>
                <textarea
                  rows={4}
                  value={milestonesText}
                  onChange={(e) => setMilestonesText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500 resize-none text-xs"
                  placeholder="Milestone 1...&#10;Milestone 2..."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded border border-slate-800 text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  SAVE GOAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Goal Cards Matrix */}
      {goals.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40 space-y-3">
          <Target className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-slate-400">No strategic goals defined yet.</div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded bg-violet-600 text-white font-medium"
          >
            Create First Strategic Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            // Find linked tasks
            const linkedTasks = allTasks.filter((t) => t.linkedGoalId === goal.id);
            const linkedCompleted = linkedTasks.filter((t) => t.completed).length;

            return (
              <div
                key={goal.id}
                className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4 shadow-sm hover:border-slate-700 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-violet-900/60 bg-violet-950/30 text-violet-300 font-bold">
                        {goal.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        DEADLINE: {formatDateShort(goal.deadline)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white font-sans">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1.5 rounded border border-slate-800 text-slate-400 hover:text-white"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete goal "${goal.title}"?`)) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="p-1.5 rounded border border-slate-800 text-slate-400 hover:text-rose-400"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>PROGRESS</span>
                    <span className="font-bold text-violet-300">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-violet-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones checklist */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    OPERATIONAL MILESTONES ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length})
                  </div>
                  <div className="space-y-1">
                    {goal.milestones.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => toggleGoalMilestone(goal.id, m.id)}
                        className="w-full flex items-center gap-2 text-left py-1 text-xs text-slate-300 hover:text-white group"
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
                        )}
                        <span className={m.completed ? 'line-through text-slate-400' : ''}>
                          {m.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Linked Tasks Info & Action */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                  <span>
                    Linked tasks: {linkedCompleted} / {linkedTasks.length} executed
                  </span>
                  <button
                    onClick={() => setActiveView('planner')}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <span>SCHEDULE TASK</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
