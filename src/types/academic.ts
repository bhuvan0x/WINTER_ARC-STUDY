export type StudentClass = '9' | '10' | '11' | '12';

export type ExamDateType = 'ESTIMATED' | 'OFFICIAL';

export type ChapterDifficulty = 'EASY' | 'MODERATE' | 'HARD';

export type ConceptDensity = 'LOW' | 'MEDIUM' | 'HIGH';

export type RevisionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ReadinessState =
  | 'NOT_STARTED'
  | 'LEARNING'
  | 'PRACTICING'
  | 'REVISED'
  | 'MASTERED';

export interface TestScoreRecord {
  id: string;
  date: string;
  testName: string;
  scorePercent: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  classLevel: StudentClass;
  chapterNumber: number;
  name: string;
  systemDifficulty: ChapterDifficulty;
  userDifficulty?: ChapterDifficulty;
  estimatedStudyHours: number;
  conceptDensity: ConceptDensity;
  prerequisites: string[];
  revisionPriority: RevisionPriority;
  readinessState: ReadinessState;
  progressPercent: number; // 0, 25, 50, 75, 100
  testScores: TestScoreRecord[];
  weakAreas: string[];
  notes?: string;
  deletedPortion?: string;
  addedPortion?: string;
  updatedAt: string;
}

export interface AcademicSubject {
  id: string;
  name: string;
  code: string;
  classLevel: StudentClass;
  chapters: Chapter[];
  color: string;
}

export interface SyllabusVersionMeta {
  board: 'CBSE';
  classLevel: StudentClass;
  academicYear: string;
  version: string;
  source: string;
  retrievedAt: string;
  lastVerifiedAt: string;
  isOfficial: boolean;
  statusText: string;
}

export interface PreparationPlanPhase {
  phaseNumber: number;
  name: string;
  jpTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

export interface PreparationPlanMetrics {
  totalCalendarDays: number;
  schoolDaysCount: number;
  holidaysCount: number;
  festivalsCount: number;
  availableStudyDays: number;
  estimatedStudyCapacityHours: number;
  totalWorkloadUnits: number;
  completedWorkloadUnits: number;
  remainingWorkloadUnits: number;
  syllabusCompletionPercent: number;
  revisionBufferDays: number;
  recommendedSyllabusCompletionDate: string;
  examStartDate: string;
  examDateType: ExamDateType;
  phases: PreparationPlanPhase[];
  subjectDistribution: {
    subjectId: string;
    subjectName: string;
    totalChapters: number;
    completedChapters: number;
    completionPercent: number;
    remainingHours: number;
    color: string;
  }[];
  weakChapters: Chapter[];
  alerts: {
    type: 'ALERT' | 'WARNING' | 'INFO' | 'SUCCESS';
    message: string;
  }[];
}
