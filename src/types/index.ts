import { StudentClass, ExamDateType } from './academic';
export * from './focus';
export * from './academic';

export type DayType = 'SCHOOL' | 'HOLIDAY' | 'CUSTOM';

export type TaskCategory =
  | 'ACADEMICS'
  | 'FITNESS'
  | 'CODING'
  | 'PROJECT'
  | 'READING'
  | 'PERSONAL'
  | 'RECOVERY'
  | 'OTHER';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'MODERATE' | 'HARD' | 'EXTREME';

export type RecurringSchedule = 'NONE' | 'DAILY' | 'WEEKDAYS' | 'WEEKENDS';

export interface UserSettings {
  id: string; // 'current_settings'
  name: string;
  winterArcStartDate: string; // YYYY-MM-DD
  wakeTime: string; // e.g. "05:30"
  sleepTime: string; // e.g. "22:30"
  schoolDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat (Default: [1,2,3,4,5,6])
  schoolStartTime: string; // "06:00"
  schoolEndTime: string; // "15:00"
  coachingSchedule: string;
  academicGoals: string[];
  fitnessGoals: string[];
  personalGoals: string[];
  streakMinimumPercent: number; // default 75
  morningQuote: string;
  whiteRoomMode: boolean;
  soundEffects: boolean;
  theme: 'sakuta' | 'whiteroom';
  hasCompletedInit: boolean;
  // Academic Preparation Engine (CBSE / NCERT)
  studentClass: StudentClass;
  academicYear: string;
  board: string;
  simulatedTodayDate?: string;
  examDate: string;
  examDateType: ExamDateType;
  revisionBufferPercent: number;
  schoolDayStudyHours: number;
  holidayStudyHours: number;
  festivalStudyHours: number;
  lastSyllabusCheckAt: string;
  selectedSubjects?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DayPlan {
  id: string; // day_YYYY-MM-DD
  date: string; // YYYY-MM-DD
  dayType: DayType;
  dayTypeOverridden: boolean;
  customDayTitle?: string;
  primaryObjective: string;
  primaryObjectiveCompleted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  category: TaskCategory;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
  completed: boolean;
  completedAt?: string;
  recurring: RecurringSchedule;
  notes?: string;
  tags: string[];
  linkedGoalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyObjective {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'PRIMARY' | 'SECONDARY' | 'NON_NEGOTIABLE';
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: 'ACADEMICS' | 'FITNESS' | 'CODING' | 'PROJECT' | 'PERSONAL';
  deadline: string; // YYYY-MM-DD
  progress: number; // 0-100
  milestones: GoalMilestone[];
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  date: string; // YYYY-MM-DD
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  type: 'POMODORO_25' | 'POMODORO_50' | 'POMODORO_90' | 'CUSTOM';
  notes?: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string; // review_YYYY-MM-DD
  date: string; // YYYY-MM-DD
  completed: string;
  missed: string;
  whyMissed: string;
  wastedTimeCause: string;
  tomorrowChanges: string;
  tomorrowPrimaryObjective: string;
  submitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  title: string;
  type: 'SCHOOL' | 'HOLIDAY' | 'EXAM' | 'DEADLINE' | 'EVENT' | 'CUSTOM';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisciplineScoreBreakdown {
  score: number;
  taskCompletionPercent: number;
  scheduleAdherencePercent: number;
  priorityCompletionPercent: number;
  consistencyPercent: number;
  focusMinutes: number;
  totalTasks: number;
  completedTasks: number;
  nonNegotiablesCompleted: number;
  nonNegotiablesTotal: number;
}
