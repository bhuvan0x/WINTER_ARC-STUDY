import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskCategory, PriorityLevel, DifficultyLevel, RecurringSchedule } from '../../types';
import { X, Check, Trash2 } from 'lucide-react';
import { timeStringToMinutes } from '../../utils/dateUtils';

interface TaskModalProps {
  task: Task | null; // null for new task
  isOpen: boolean;
  onClose: () => void;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  defaultStartTime = '08:00',
  defaultEndTime = '09:00',
}) => {
  const { createOrUpdateTask, deleteTask, goals, whiteRoomMode } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('ACADEMICS');
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [priority, setPriority] = useState<PriorityLevel>('NORMAL');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);
  const [actualDuration, setActualDuration] = useState<number>(0);
  const [recurring, setRecurring] = useState<RecurringSchedule>('NONE');
  const [tagsString, setTagsString] = useState('');
  const [notes, setNotes] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState<string>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setStartTime(task.startTime);
      setEndTime(task.endTime);
      setPriority(task.priority);
      setDifficulty(task.difficulty);
      setEstimatedDuration(task.estimatedDurationMinutes);
      setActualDuration(task.actualDurationMinutes || 0);
      setRecurring(task.recurring);
      setTagsString(task.tags.join(', '));
      setNotes(task.notes || '');
      setLinkedGoalId(task.linkedGoalId || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('ACADEMICS');
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
      setPriority('NORMAL');
      setDifficulty('MEDIUM');
      setEstimatedDuration(60);
      setActualDuration(0);
      setRecurring('NONE');
      setTagsString('');
      setNotes('');
      setLinkedGoalId('');
    }
  }, [task, defaultStartTime, defaultEndTime, isOpen]);

  // Automatically update estimated duration when start and end times change
  const handleTimeChange = (newStart: string, newEnd: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    const startM = timeStringToMinutes(newStart);
    let endM = timeStringToMinutes(newEnd);
    if (endM < startM) endM += 1440;
    const diff = endM - startM;
    if (diff > 0) {
      setEstimatedDuration(diff);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    await createOrUpdateTask({
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      startTime,
      endTime,
      priority,
      difficulty,
      estimatedDurationMinutes: Number(estimatedDuration) || 60,
      actualDurationMinutes: Number(actualDuration) || 0,
      recurring,
      tags,
      notes: notes.trim(),
      linkedGoalId: linkedGoalId || undefined,
      completed: task?.completed ?? false,
    });

    onClose();
  };

  const handleDelete = async () => {
    if (task && window.confirm(`Permanently remove task "${task.title}"?`)) {
      await deleteTask(task.id);
      onClose();
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`w-full max-w-xl rounded-lg border shadow-2xl p-6 font-mono text-xs my-8 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#0b0d18] border-violet-500/30 text-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-sm text-white">
              {task ? 'EDIT TASK BLOCK' : 'NEW TASK BLOCK'}
            </span>
            <span className="text-[10px] text-slate-400">
              {task ? '// UPDATE' : '// INITIALIZE'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-slate-400 mb-1">TASK TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500 font-sans text-sm"
              placeholder="e.g. Chemistry: Coordination Compounds deep work"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 mb-1">DESCRIPTION / TACTICAL SCOPE</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              placeholder="e.g. Complete NCERT exercises 1-15, zero notes, active recall."
            />
          </div>

          {/* Category & Linked Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">LINKED STRATEGIC GOAL</label>
              <select
                value={linkedGoalId}
                onChange={(e) => setLinkedGoalId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="">None (Standalone)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">START TIME</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => handleTimeChange(e.target.value, endTime)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">END TIME</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => handleTimeChange(startTime, e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">EST. MINUTES</label>
              <input
                type="number"
                min="5"
                max="1440"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Priority & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">PRIORITY LEVEL</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="NORMAL">NORMAL</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">DIFFICULTY</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
                <option value="EXTREME">EXTREME</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">RECURRING</label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as RecurringSchedule)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="NONE">NONE</option>
                <option value="DAILY">DAILY</option>
                <option value="WEEKDAYS">WEEKDAYS</option>
                <option value="WEEKENDS">WEEKENDS</option>
              </select>
            </div>
          </div>

          {/* Tags & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">TAGS (COMMA-SEPARATED)</label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
                placeholder="chem, syllabus, exam"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ACTUAL MINUTES (POST-WORK)</label>
              <input
                type="number"
                min="0"
                value={actualDuration}
                onChange={(e) => setActualDuration(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">EXECUTION NOTES</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
              placeholder="Observations, bottlenecks, questions to review..."
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {task ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>DELETE</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded border border-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Check className="w-4 h-4" />
                <span>{task ? 'SAVE CHANGES' : 'CREATE TASK'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
