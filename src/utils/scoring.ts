import {
  Task,
  DailyObjective,
  FocusSession,
  DisciplineScoreBreakdown,
  DayPlan,
} from '../types';
import { getTodayDateString, addDaysToDate } from './dateUtils';

export function calculateDailyDisciplineScore(
  tasks: Task[],
  objectives: DailyObjective[],
  focusSessions: FocusSession[]
): DisciplineScoreBreakdown {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  // 1. Task Completion (0-100)
  const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // 2. Schedule Adherence (0-100)
  // Considers tasks that have scheduled time slots: completed on schedule
  const timedTasks = tasks.filter((t) => t.startTime && t.endTime);
  const timedCompleted = timedTasks.filter((t) => t.completed).length;
  const scheduleAdherencePercent =
    timedTasks.length > 0 ? Math.round((timedCompleted / timedTasks.length) * 100) : taskCompletionPercent;

  // 3. Priority & Non-Negotiables Completion (0-100)
  const criticalOrHighTasks = tasks.filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH');
  const criticalCompleted = criticalOrHighTasks.filter((t) => t.completed).length;

  const nonNegotiables = objectives.filter((o) => o.type === 'NON_NEGOTIABLE');
  const nonNegCompleted = nonNegotiables.filter((o) => o.completed).length;

  const primaryObj = objectives.filter((o) => o.type === 'PRIMARY');
  const primaryCompleted = primaryObj.filter((o) => o.completed).length;

  const priorityTotalItems = criticalOrHighTasks.length + nonNegotiables.length + primaryObj.length;
  const priorityCompletedItems = criticalCompleted + nonNegCompleted + primaryCompleted;

  const priorityCompletionPercent =
    priorityTotalItems > 0
      ? Math.round((priorityCompletedItems / priorityTotalItems) * 100)
      : taskCompletionPercent;

  // 4. Consistency & Focus Factor (0-100)
  const totalFocusMinutes = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  // Benchmark: 90 minutes of dedicated focus session = 100% consistency bonus component
  const focusScore = Math.min(100, Math.round((totalFocusMinutes / 90) * 100));
  const consistencyPercent = Math.round(
    0.6 * taskCompletionPercent + 0.4 * (totalFocusMinutes > 0 ? focusScore : taskCompletionPercent)
  );

  // Overall Discipline Score calculation (weighted, transparent)
  // Task Completion: 35%
  // Schedule Adherence: 25%
  // Priority & Non-Negotiables: 25%
  // Consistency & Focus: 15%
  if (totalTasks === 0 && objectives.length === 0) {
    return {
      score: 0,
      taskCompletionPercent: 0,
      scheduleAdherencePercent: 0,
      priorityCompletionPercent: 0,
      consistencyPercent: 0,
      focusMinutes: 0,
      totalTasks: 0,
      completedTasks: 0,
      nonNegotiablesCompleted: 0,
      nonNegotiablesTotal: 0,
    };
  }

  const rawScore =
    0.35 * taskCompletionPercent +
    0.25 * scheduleAdherencePercent +
    0.25 * priorityCompletionPercent +
    0.15 * consistencyPercent;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    score: finalScore,
    taskCompletionPercent,
    scheduleAdherencePercent,
    priorityCompletionPercent,
    consistencyPercent,
    focusMinutes: totalFocusMinutes,
    totalTasks,
    completedTasks,
    nonNegotiablesCompleted: nonNegCompleted,
    nonNegotiablesTotal: nonNegotiables.length,
  };
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
}

export function calculateStreaks(
  allTasks: Task[],
  _allPlans: DayPlan[],
  streakMinimumPercent: number = 75,
  winterArcStartDate: string = ''
): StreakStats {
  const todayStr = getTodayDateString();
  const startDate = winterArcStartDate || addDaysToDate(todayStr, -30);

  // Group tasks by date
  const tasksByDate = new Map<string, Task[]>();
  allTasks.forEach((t) => {
    const list = tasksByDate.get(t.date) || [];
    list.push(t);
    tasksByDate.set(t.date, list);
  });

  // Calculate day completion % for each date
  const dayQualifies = (dateStr: string): boolean => {
    const dayTasks = tasksByDate.get(dateStr) || [];
    if (dayTasks.length === 0) return false;
    const completed = dayTasks.filter((t) => t.completed).length;
    const pct = (completed / dayTasks.length) * 100;
    return pct >= streakMinimumPercent;
  };

  // Calculate current streak backwards from today (or yesterday if today is not yet qualified)
  let currentStreak = 0;
  let checkDate = todayStr;

  if (dayQualifies(todayStr)) {
    currentStreak = 1;
    checkDate = addDaysToDate(todayStr, -1);
  } else {
    // If today is in progress, check if streak from yesterday is active
    checkDate = addDaysToDate(todayStr, -1);
  }

  while (checkDate >= startDate) {
    if (dayQualifies(checkDate)) {
      currentStreak++;
      checkDate = addDaysToDate(checkDate, -1);
    } else {
      break;
    }
  }

  // Calculate longest streak and total completed days across recorded history
  let totalCompletedDays = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  // Iterate chronologically from start date to today
  let iterDate = startDate;
  while (iterDate <= todayStr) {
    if (dayQualifies(iterDate)) {
      totalCompletedDays++;
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
    iterDate = addDaysToDate(iterDate, 1);
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Weekly completion rate (last 7 days)
  let past7TotalTasks = 0;
  let past7CompletedTasks = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDaysToDate(todayStr, -i);
    const ts = tasksByDate.get(d) || [];
    past7TotalTasks += ts.length;
    past7CompletedTasks += ts.filter((t) => t.completed).length;
  }
  const weeklyCompletionRate =
    past7TotalTasks > 0 ? Math.round((past7CompletedTasks / past7TotalTasks) * 100) : 0;

  // Monthly completion rate (last 30 days)
  let past30TotalTasks = 0;
  let past30CompletedTasks = 0;
  for (let i = 0; i < 30; i++) {
    const d = addDaysToDate(todayStr, -i);
    const ts = tasksByDate.get(d) || [];
    past30TotalTasks += ts.length;
    past30CompletedTasks += ts.filter((t) => t.completed).length;
  }
  const monthlyCompletionRate =
    past30TotalTasks > 0 ? Math.round((past30CompletedTasks / past30TotalTasks) * 100) : 0;

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompletedDays,
    weeklyCompletionRate,
    monthlyCompletionRate,
  };
}
