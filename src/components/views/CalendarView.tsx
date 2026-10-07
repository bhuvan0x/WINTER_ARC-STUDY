import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatDateShort,
  addDaysToDate,
  getTodayDateString,
  detectDayType,
} from '../../utils/dateUtils';
import { calculateDailyDisciplineScore } from '../../utils/scoring';
import { CalendarEvent } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  X,
  Check,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    setActiveView,
    allTasks,
    allObjectives,
    allFocusSessions,
    calendarEvents,
    createOrUpdateCalendarEvent,
    deleteCalendarEvent,
    settings,
    whiteRoomMode,
  } = useApp();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventDate, setEventDate] = useState(currentDate);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('EXAM');
  const [eventDescription, setEventDescription] = useState('');

  // Generate calendar days for month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { dateStr: string; isCurrentMonth: boolean; dayNumber: number }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, isCurrentMonth: false, dayNumber: d });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, isCurrentMonth: true, dayNumber: d });
  }

  // Next month leading days to complete 35 or 42 grid
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 2 > 12 ? 1 : month + 2;
    const y = month + 2 > 12 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, isCurrentMonth: false, dayNumber: d });
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    await createOrUpdateCalendarEvent({
      title: eventTitle.trim(),
      date: eventDate,
      type: eventType,
      description: eventDescription.trim(),
    });

    setEventTitle('');
    setEventDescription('');
    setIsAddingEvent(false);
  };

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-xs">
      {/* 1. Header with Month Navigator & Add Event */}
      <div className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2 py-1 text-[11px] font-bold rounded bg-slate-900 text-violet-300"
            >
              CURRENT
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              {monthNames[month]} {year}
            </h1>
            <p className="text-[11px] text-slate-400">
              WINTER ARC OPERATIONAL CALENDAR // 作戦日程表
            </p>
          </div>
        </div>

        {/* Legend & Add Event Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 border border-slate-800 px-3 py-1.5 rounded bg-slate-950">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-slate-500" /> School
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-violet-400" /> Holiday
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-rose-400" /> Exam
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-400" /> Deadline
            </span>
          </div>

          <button
            onClick={() => setIsAddingEvent(true)}
            className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD EVENT / EXAM</span>
          </button>
        </div>
      </div>

      {/* 2. Add Event Overlay Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0b0d18] border border-violet-500/30 rounded-lg p-5 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="font-bold tracking-wider text-sm text-white">
                ADD CALENDAR PROTOCOL
              </span>
              <button onClick={() => setIsAddingEvent(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              <div>
                <label className="block text-slate-400 mb-1">EVENT TITLE *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="e.g. Midterm Chemistry Exam"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">DATE</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">EVENT TYPE</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as CalendarEvent['type'])}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="EXAM">EXAM</option>
                    <option value="DEADLINE">DEADLINE</option>
                    <option value="HOLIDAY">HOLIDAY</option>
                    <option value="SCHOOL">SCHOOL</option>
                    <option value="EVENT">EVENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">NOTES / DETAILS</label>
                <input
                  type="text"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-violet-500"
                  placeholder="Chapters 1-6 syllabus..."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-3 py-1.5 rounded border border-slate-800 text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  SAVE EVENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Monthly Calendar Grid */}
      <div className="rounded-lg border border-slate-800 bg-[#090b14]/90 overflow-hidden shadow-xl">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950 text-center text-[11px] font-bold text-slate-400 py-2.5">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80">
          {days.map((day) => {
            const isToday = day.dateStr === getTodayDateString();
            const isSelected = day.dateStr === currentDate;

            // Day events
            const dayEvents = calendarEvents.filter((e) => e.date === day.dateStr);

            // Day statistics
            const dayTasks = allTasks.filter((t) => t.date === day.dateStr);
            const dayObj = allObjectives.filter((o) => o.date === day.dateStr);
            const dayFocus = allFocusSessions.filter((f) => f.date === day.dateStr);

            const scoreBreakdown =
              dayTasks.length > 0 || dayObj.length > 0
                ? calculateDailyDisciplineScore(dayTasks, dayObj, dayFocus)
                : null;

            const dayType = detectDayType(day.dateStr, settings, calendarEvents);

            return (
              <div
                key={day.dateStr}
                onClick={() => {
                  setCurrentDate(day.dateStr);
                  setActiveView('planner');
                }}
                className={`min-h-[96px] p-2 flex flex-col justify-between cursor-pointer transition-colors group relative ${
                  !day.isCurrentMonth
                    ? 'bg-slate-950/30 text-slate-600'
                    : isSelected
                    ? 'bg-violet-950/30 ring-1 ring-inset ring-violet-500/50'
                    : 'bg-transparent hover:bg-slate-900/40'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold ${
                      isToday
                        ? 'bg-violet-600 text-white'
                        : isSelected
                        ? 'bg-slate-800 text-violet-300'
                        : day.isCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Discipline Score Indicator */}
                  {scoreBreakdown && scoreBreakdown.totalTasks > 0 && (
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        scoreBreakdown.score >= 75
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/50'
                          : 'text-amber-400 bg-amber-950/40 border border-amber-900/50'
                      }`}
                      title={`Discipline Score: ${scoreBreakdown.score}% (${scoreBreakdown.completedTasks}/${scoreBreakdown.totalTasks} tasks)`}
                    >
                      {scoreBreakdown.score}%
                    </span>
                  )}
                </div>

                {/* Day Type Tag & Events */}
                <div className="space-y-1 my-1">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`text-[9px] px-1 py-0.5 rounded truncate border ${
                        evt.type === 'EXAM'
                          ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                          : evt.type === 'DEADLINE'
                          ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                          : evt.type === 'HOLIDAY'
                          ? 'bg-violet-950/60 border-violet-500/50 text-violet-200'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      {evt.title}
                    </div>
                  ))}

                  {/* Subtle Day Type badge if current month and no explicit holiday event */}
                  {day.isCurrentMonth && dayEvents.length === 0 && (
                    <div className="text-[8px] text-slate-400">
                      {dayType === 'SCHOOL' ? 'SCHOOL' : 'HOLIDAY'}
                    </div>
                  )}
                </div>

                {/* Task dots */}
                {dayTasks.length > 0 && (
                  <div className="flex items-center gap-0.5 overflow-hidden">
                    {dayTasks.slice(0, 5).map((t) => (
                      <span
                        key={t.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.completed ? 'bg-emerald-400' : 'bg-slate-600'
                        }`}
                      />
                    ))}
                    {dayTasks.length > 5 && (
                      <span className="text-[8px] text-slate-400">+{dayTasks.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Events Table / Scheduled Milestones */}
      {calendarEvents.length > 0 && (
        <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/70 space-y-3">
          <div className="text-xs font-bold tracking-wider text-slate-300 uppercase">
            UPCOMING KEY EXAMS & DEADLINES
          </div>
          <div className="space-y-1.5">
            {calendarEvents.map((e) => (
              <div
                key={e.id}
                className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-950 text-slate-300 font-bold">
                    {formatDateShort(e.date)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    e.type === 'EXAM'
                      ? 'border-rose-900 text-rose-300 bg-rose-950/30'
                      : e.type === 'DEADLINE'
                      ? 'border-amber-900 text-amber-300 bg-amber-950/30'
                      : 'border-violet-900 text-violet-300 bg-violet-950/30'
                  }`}>
                    {e.type}
                  </span>
                  <span className="font-semibold text-slate-100">{e.title}</span>
                  {e.description && (
                    <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
                      — {e.description}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => deleteCalendarEvent(e.id)}
                  className="text-slate-400 hover:text-rose-400 p-1 transition"
                  title="Remove Event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
