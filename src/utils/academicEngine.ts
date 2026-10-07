import {
  Chapter,
  AcademicSubject,
  StudentClass,
  ExamDateType,
  PreparationPlanMetrics,
  PreparationPlanPhase,
} from '../types/academic';
import { UserSettings, CalendarEvent } from '../types';
import { addDaysToDate, getTodayDateString } from './dateUtils';
import { OFFICIAL_INDIAN_HOLIDAYS_2026_2027 } from '../data/indianHolidays';

export function calculateExamCountdown(todayDateStr: string, examDateStr: string) {
  const [ty, tm, td] = todayDateStr.split('-').map(Number);
  const [ey, em, ed] = examDateStr.split('-').map(Number);

  const today = new Date(ty, tm - 1, td);
  const exam = new Date(ey, em - 1, ed);

  const diffMs = exam.getTime() - today.getTime();
  const totalDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const months = Math.floor(totalDays / 30);
  const weeks = Math.floor(totalDays / 7);

  return {
    daysRemaining: totalDays,
    weeksRemaining: weeks,
    monthsRemaining: months,
  };
}

export function calculateChapterWeight(chapter: Chapter): number {
  const difficulty = chapter.userDifficulty || chapter.systemDifficulty;
  if (difficulty === 'EASY') return 1;
  if (difficulty === 'MODERATE') return 2;
  return 3; // HARD
}

export function computeAcademicPlanMetrics(
  todayDateStr: string,
  settings: UserSettings,
  subjects: AcademicSubject[],
  calendarEvents: CalendarEvent[] = []
): PreparationPlanMetrics {
  const examStartDate = settings.examDate || '2027-02-15';
  const countdown = calculateExamCountdown(todayDateStr, examStartDate);
  const totalCalendarDays = countdown.daysRemaining;

  // 1. Gather all chapters across selected subjects
  const allChapters = subjects.flatMap((s) => s.chapters);
  const totalChapters = allChapters.length;
  const completedChapters = allChapters.filter(
    (c) => c.readinessState === 'MASTERED' || c.progressPercent >= 100
  ).length;

  const totalWorkloadUnits = allChapters.reduce((acc, c) => acc + calculateChapterWeight(c), 0);
  const completedWorkloadUnits = allChapters
    .filter((c) => c.readinessState === 'MASTERED' || c.progressPercent >= 100)
    .reduce((acc, c) => acc + calculateChapterWeight(c), 0);
  const remainingWorkloadUnits = Math.max(0, totalWorkloadUnits - completedWorkloadUnits);

  const syllabusCompletionPercent =
    totalWorkloadUnits > 0
      ? Math.round((completedWorkloadUnits / totalWorkloadUnits) * 100)
      : 0;

  // 2. Calendar Intelligence: School Days vs Holidays vs Festivals
  let schoolDaysCount = 0;
  let holidaysCount = 0;
  let festivalsCount = 0;
  let estimatedStudyCapacityHours = 0;

  const schoolDayCapacity = settings.schoolDayStudyHours || 3.5;
  const holidayCapacity = settings.holidayStudyHours || 7.0;
  const festivalCapacity = settings.festivalStudyHours || 2.0;

  const schoolDaysConfig = settings.schoolDays || [1, 2, 3, 4, 5, 6];

  let iterDate = todayDateStr;
  for (let i = 0; i < totalCalendarDays; i++) {
    const [y, m, d] = iterDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();

    // Check custom calendar event
    const calEvent = calendarEvents.find((e) => e.date === iterDate);
    const indianHoliday = OFFICIAL_INDIAN_HOLIDAYS_2026_2027.find((h) => h.date === iterDate);

    if (calEvent?.type === 'HOLIDAY' || indianHoliday?.type === 'SCHOOL_HOLIDAY') {
      holidaysCount++;
      estimatedStudyCapacityHours += holidayCapacity;
    } else if (indianHoliday?.type === 'FESTIVAL') {
      festivalsCount++;
      estimatedStudyCapacityHours += festivalCapacity;
    } else if (dayOfWeek === 0 || !schoolDaysConfig.includes(dayOfWeek)) {
      // Sunday or weekend off
      holidaysCount++;
      estimatedStudyCapacityHours += holidayCapacity;
    } else {
      // Regular school day
      schoolDaysCount++;
      estimatedStudyCapacityHours += schoolDayCapacity;
    }

    iterDate = addDaysToDate(iterDate, 1);
  }

  // 3. Revision Buffer Calculation (Default 25% of total remaining days reserved)
  const bufferPercent = Math.min(40, Math.max(15, settings.revisionBufferPercent || 25));
  const revisionBufferDays = Math.max(7, Math.round((totalCalendarDays * bufferPercent) / 100));

  // Target Syllabus Completion Date (Buffer reserved right before exam)
  const recommendedSyllabusCompletionDate = addDaysToDate(examStartDate, -revisionBufferDays);

  // Available days specifically for Phase 1 syllabus teaching
  const daysForSyllabusCompletion = Math.max(1, totalCalendarDays - revisionBufferDays);

  // 4. Generate 6-Phase Breakdown
  const phases: PreparationPlanPhase[] = [
    {
      phaseNumber: 1,
      name: 'PHASE 1 — SYLLABUS COMPLETION',
      jpTitle: '基礎完遂',
      description: 'Execute untouched chapters. Target hard & conceptual foundations first.',
      startDate: todayDateStr,
      endDate: recommendedSyllabusCompletionDate,
      durationDays: daysForSyllabusCompletion,
      status: 'ACTIVE',
    },
    {
      phaseNumber: 2,
      name: 'PHASE 2 — CONSOLIDATION & PROBLEM DRILLS',
      jpTitle: '演習定着',
      description: 'Solve past CBSE 10-year question banks and NCERT exemplar problems.',
      startDate: recommendedSyllabusCompletionDate,
      endDate: addDaysToDate(recommendedSyllabusCompletionDate, Math.max(3, Math.round(revisionBufferDays * 0.25))),
      durationDays: Math.max(3, Math.round(revisionBufferDays * 0.25)),
      status: 'UPCOMING',
    },
    {
      phaseNumber: 3,
      name: 'PHASE 3 — SYSTEMATIC CHAPTER-WISE REVISION',
      jpTitle: '全域復習',
      description: 'Spaced repetition cycles across all core formulas, reactions, and theorems.',
      startDate: addDaysToDate(recommendedSyllabusCompletionDate, Math.max(3, Math.round(revisionBufferDays * 0.25)) + 1),
      endDate: addDaysToDate(recommendedSyllabusCompletionDate, Math.max(6, Math.round(revisionBufferDays * 0.55))),
      durationDays: Math.max(3, Math.round(revisionBufferDays * 0.3)),
      status: 'UPCOMING',
    },
    {
      phaseNumber: 4,
      name: 'PHASE 4 — FULL-LENGTH MOCK TESTS & TIME AUDIT',
      jpTitle: '実戦模試',
      description: 'Timed 3-hour exam simulations in exact CBSE examination format.',
      startDate: addDaysToDate(recommendedSyllabusCompletionDate, Math.max(6, Math.round(revisionBufferDays * 0.55)) + 1),
      endDate: addDaysToDate(recommendedSyllabusCompletionDate, Math.max(9, Math.round(revisionBufferDays * 0.8))),
      durationDays: Math.max(3, Math.round(revisionBufferDays * 0.25)),
      status: 'UPCOMING',
    },
    {
      phaseNumber: 5,
      name: 'PHASE 5 — HIGH-YIELD FORMULA & DIAGRAM REVISION',
      jpTitle: '要点総覧',
      description: 'Condense notes to 1-pagers: definitions, error log audit, derivations.',
      startDate: addDaysToDate(recommendedSyllabusCompletionDate, Math.max(9, Math.round(revisionBufferDays * 0.8)) + 1),
      endDate: addDaysToDate(examStartDate, -3),
      durationDays: Math.max(2, Math.round(revisionBufferDays * 0.15)),
      status: 'UPCOMING',
    },
    {
      phaseNumber: 6,
      name: 'PHASE 6 — EXAM PROTOCOL // TARGETED PEAK',
      jpTitle: '本番態勢',
      description: 'Zero new material. Rest, mental calmness, formula sheets, peak recovery.',
      startDate: addDaysToDate(examStartDate, -2),
      endDate: examStartDate,
      durationDays: 3,
      status: 'UPCOMING',
    },
  ];

  // 5. Subject Distribution stats
  const subjectDistribution = subjects.map((sub) => {
    const sTotal = sub.chapters.length;
    const sComp = sub.chapters.filter((c) => c.progressPercent >= 100).length;
    const sPct = sTotal > 0 ? Math.round((sComp / sTotal) * 100) : 0;
    const remainingHours = sub.chapters
      .filter((c) => c.progressPercent < 100)
      .reduce((acc, c) => acc + (c.estimatedStudyHours * (1 - c.progressPercent / 100)), 0);

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      totalChapters: sTotal,
      completedChapters: sComp,
      completionPercent: sPct,
      remainingHours: Math.round(remainingHours),
      color: sub.color,
    };
  });

  // 6. Weak Chapters identification
  const weakChapters = allChapters.filter((c) => {
    const isHard = (c.userDifficulty || c.systemDifficulty) === 'HARD';
    const isLowScore = c.testScores.some((t) => t.scorePercent < 70);
    const hasWeakAreas = c.weakAreas.length > 0;
    const isBehind = c.progressPercent < 50;
    return isHard && (isBehind || isLowScore || hasWeakAreas);
  });

  // 7. Tactical Alerts Generation
  const alerts: PreparationPlanMetrics['alerts'] = [];

  if (settings.examDateType === 'OFFICIAL') {
    alerts.push({
      type: 'INFO',
      message: 'Official CBSE board datesheet locked. Real-time timetable active.',
    });
  } else {
    alerts.push({
      type: 'INFO',
      message: 'Exam schedule currently on estimated official baseline (mid-February / March).',
    });
  }

  if (revisionBufferDays >= 20) {
    alerts.push({
      type: 'SUCCESS',
      message: `Strategic revision buffer secured: ${revisionBufferDays} days reserved before final exams.`,
    });
  } else {
    alerts.push({
      type: 'WARNING',
      message: `Revision buffer contracted to ${revisionBufferDays} days. Prioritize high-weight chapters.`,
    });
  }

  if (weakChapters.length > 0) {
    alerts.push({
      type: 'ALERT',
      message: `${weakChapters.length} high-friction chapters detected. System has increased their revision priority.`,
    });
  }

  return {
    totalCalendarDays,
    schoolDaysCount,
    holidaysCount,
    festivalsCount,
    availableStudyDays: totalCalendarDays,
    estimatedStudyCapacityHours: Math.round(estimatedStudyCapacityHours),
    totalWorkloadUnits,
    completedWorkloadUnits,
    remainingWorkloadUnits,
    syllabusCompletionPercent,
    revisionBufferDays,
    recommendedSyllabusCompletionDate,
    examStartDate,
    examDateType: settings.examDateType || 'ESTIMATED',
    phases,
    subjectDistribution,
    weakChapters,
    alerts,
  };
}

// Balanced Daily Subject Rotation generator
export function getRecommendedDailySubjects(dayOfWeek: number): string[] {
  // Day of week: 0=Sun, 1=Mon, ..., 6=Sat
  // Alternates quantitative with conceptual/descriptive
  switch (dayOfWeek) {
    case 1: // Monday
      return ['Physics', 'Chemistry'];
    case 2: // Tuesday
      return ['Mathematics', 'English Core'];
    case 3: // Wednesday
      return ['Chemistry', 'Physics'];
    case 4: // Thursday
      return ['Mathematics', 'Computer Science'];
    case 5: // Friday
      return ['Physics', 'English Core'];
    case 6: // Saturday
      return ['Chemistry', 'Mathematics'];
    case 0: // Sunday
    default:
      return ['Full Revision Block', 'Subject Mock Test'];
  }
}
