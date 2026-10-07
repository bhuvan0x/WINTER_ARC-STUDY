import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFocus } from '../../context/FocusContext';
import {
  StudentClass,
  ChapterDifficulty,
  ReadinessState,
  Chapter,
} from '../../types/academic';
import { calculateExamCountdown, getRecommendedDailySubjects } from '../../utils/academicEngine';
import { formatDateShort, getTodayDateString } from '../../utils/dateUtils';
import {
  GraduationCap,
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Layers,
  ArrowRight,
  TrendingUp,
  Settings,
  Plus,
  BarChart2,
  Award,
  Sparkles,
  Crosshair,
} from 'lucide-react';

export const AcademicCommandCenter: React.FC = () => {
  const {
    settings,
    setStudentClass,
    setExamSchedule,
    effectiveToday,
    setSimulatedTodayDate,
    academicSubjects,
    academicMetrics,
    syllabusMeta,
    updateStudentDifficulty,
    updateReadinessState,
    recordChapterTestScore,
    checkSyllabusUpdates,
    syncAcademicTargetToPlanner,
    setActiveView,
    whiteRoomMode,
  } = useApp();

  const { launchFocusFromAcademic } = useFocus();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [readinessFilter, setReadinessFilter] = useState<string>('ALL');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateNotification, setUpdateNotification] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Score Entry modal state
  const [scoreModalChapter, setScoreModalChapter] = useState<Chapter | null>(null);
  const [testNameInput, setTestNameInput] = useState('CBSE Sectional Test');
  const [scorePercentInput, setScorePercentInput] = useState<number>(75);

  // Simulated date edit state
  const [isSimulatingDate, setIsSimulatingDate] = useState(false);
  const [simDateInput, setSimDateInput] = useState(effectiveToday);

  // Exam Date Edit
  const [isEditingExamDate, setIsEditingExamDate] = useState(false);
  const [examDateInput, setExamDateInput] = useState(settings.examDate);
  const [examTypeInput, setExamTypeInput] = useState(settings.examDateType);

  const countdown = calculateExamCountdown(effectiveToday, settings.examDate);

  // Filter chapters
  const allChapters = academicSubjects.flatMap((s) => s.chapters);
  const filteredChapters = allChapters.filter((ch) => {
    if (selectedSubjectId !== 'ALL' && ch.subjectId !== selectedSubjectId) return false;
    const finalDiff = ch.userDifficulty || ch.systemDifficulty;
    if (difficultyFilter !== 'ALL' && finalDiff !== difficultyFilter) return false;
    if (readinessFilter !== 'ALL' && ch.readinessState !== readinessFilter) return false;
    return true;
  });

  const handleManualSyllabusCheck = async () => {
    setIsCheckingUpdate(true);
    const result = await checkSyllabusUpdates(true);
    setUpdateNotification(result.message);
    setIsCheckingUpdate(false);
    setTimeout(() => setUpdateNotification(null), 5000);
  };

  const handleSyncToPlanner = async () => {
    const count = await syncAcademicTargetToPlanner();
    if (count > 0) {
      setSyncStatus(`Scheduled ${count} priority academic blocks into today's timeline.`);
      setTimeout(() => setSyncStatus(null), 4000);
    } else {
      setSyncStatus('All current syllabus targets are already mastered.');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handleSaveExamDate = async (e: React.FormEvent) => {
    e.preventDefault();
    await setExamSchedule(examDateInput, examTypeInput);
    setIsEditingExamDate(false);
  };

  const handleApplySimulatedDate = async () => {
    await setSimulatedTodayDate(simDateInput);
    setIsSimulatingDate(false);
  };

  const handleResetSimulatedDate = async () => {
    await setSimulatedTodayDate('');
    setSimDateInput(getTodayDateString());
    setIsSimulatingDate(false);
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreModalChapter) {
      await recordChapterTestScore(scoreModalChapter.id, testNameInput, Number(scorePercentInput));
      setScoreModalChapter(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-xs">
      {/* 1. Official CBSE Header & Data Freshness Bar */}
      <div className={`p-5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold tracking-widest text-violet-400 text-xs uppercase flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              ACADEMIC PREPARATION ENGINE
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] px-2 py-0.5 rounded border border-violet-900/60 bg-violet-950/30 text-violet-300 font-bold">
              CLASS {settings.studentClass}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-300">
              BOARD: {settings.board}
            </span>
            <span className="text-[11px] text-slate-400">
              {settings.academicYear}
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-bold font-sans text-white">
            CBSE / NCERT Strategic Syllabus & Revision Operating System
          </h1>
          <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-3">
            <span>DATABASE: {syllabusMeta.version}</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {syllabusMeta.statusText}
            </span>
          </div>
        </div>

        {/* Class Switcher & Verification Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Selectors */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-1">
            {(['9', '10', '11', '12'] as StudentClass[]).map((cls) => (
              <button
                key={cls}
                onClick={() => setStudentClass(cls)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  settings.studentClass === cls
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CL {cls}
              </button>
            ))}
          </div>

          <button
            onClick={handleManualSyllabusCheck}
            disabled={isCheckingUpdate}
            className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 transition"
            title="Check official CBSE curriculum updates (verified every 24h)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin text-violet-400' : 'text-slate-400'}`} />
            <span>VERIFY SYLLABUS</span>
          </button>
        </div>
      </div>

      {/* Update notification toast */}
      {updateNotification && (
        <div className="p-3 rounded-lg border border-violet-500/40 bg-violet-950/30 text-violet-200 text-xs flex items-center justify-between animate-fadeIn">
          <span>{updateNotification}</span>
          <button onClick={() => setUpdateNotification(null)} className="text-violet-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. Prominent Board Examination Countdown & Window Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Countdown Hero (Instruction 30 & 31) */}
        <div className="p-6 rounded-lg border border-violet-500/30 bg-[#0c0e1a] lg:col-span-1 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-bold tracking-widest text-violet-400 uppercase">
                {settings.studentClass === '10' || settings.studentClass === '12'
                  ? 'BOARD EXAMINATION'
                  : 'ANNUAL EXAMINATION'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                settings.examDateType === 'OFFICIAL'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500 text-amber-300'
              }`}>
                {settings.examDateType}
              </span>
            </div>

            {/* Giant Monolithic Number */}
            <div className="my-4 text-center">
              <div className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tighter text-white tabular-nums">
                {countdown.daysRemaining}
              </div>
              <div className="text-xs uppercase tracking-widest text-violet-300 font-bold mt-1">
                DAYS REMAINING
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-3">
                <span>{countdown.monthsRemaining} MONTHS</span>
                <span>·</span>
                <span>{countdown.weeksRemaining} WEEKS</span>
                <span>·</span>
                <span>{countdown.daysRemaining} DAYS</span>
              </div>
            </div>

            <div className="text-center border-t border-slate-800/80 pt-3">
              <div className="text-xs font-bold text-slate-200">
                {formatDateShort(settings.examDate)} (EXPECTED START)
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Available preparation window: {countdown.daysRemaining} calendar days
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
            <button
              onClick={() => setIsEditingExamDate(true)}
              className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-4"
            >
              Adjust Exam Date
            </button>
            <button
              onClick={() => setIsSimulatingDate(true)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Simulate Date
            </button>
          </div>
        </div>

        {/* Usable Capacity & Workload Balance (Instruction 38, 40, 43, 55) */}
        <div className="p-6 rounded-lg border border-slate-800 bg-[#090b14]/90 lg:col-span-2 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                USABLE PREPARATION CAPACITY AUDIT
              </h2>
              <p className="text-[11px] text-slate-400">
                Calculated by subtracting school attendance, holidays, and protected buffers
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400">
                {academicMetrics.syllabusCompletionPercent}% SYLLABUS READY
              </span>
            </div>
          </div>

          {/* 4 Quantitative Breakdown Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">SCHOOL DAYS</div>
              <div className="text-xl font-bold text-slate-100 mt-0.5">
                {academicMetrics.schoolDaysCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {settings.schoolDayStudyHours}h study / day
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">SUNDAYS / HOLIDAYS</div>
              <div className="text-xl font-bold text-violet-300 mt-0.5">
                {academicMetrics.holidaysCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {settings.holidayStudyHours}h study / day
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">EST. CAPACITY</div>
              <div className="text-xl font-bold text-blue-300 mt-0.5">
                {academicMetrics.estimatedStudyCapacityHours}h
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Focused study hours
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase">REVISION BUFFER</div>
              <div className="text-xl font-bold text-amber-300 mt-0.5">
                {academicMetrics.revisionBufferDays} DAYS
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Reserved before exam
              </div>
            </div>
          </div>

          {/* Critical Deadlines & Recommended Target Completion Banner */}
          <div className="p-3 rounded bg-slate-950 border border-violet-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px]">
            <div>
              <span className="font-bold text-violet-300">TARGET SYLLABUS COMPLETION: </span>
              <span className="text-white font-bold">{formatDateShort(academicMetrics.recommendedSyllabusCompletionDate)}</span>
              <span className="text-slate-400 ml-2">
                (Protects {academicMetrics.revisionBufferDays} days for Mock Tests + Error Analysis)
              </span>
            </div>

            <button
              onClick={handleSyncToPlanner}
              className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold shadow transition shrink-0"
            >
              SYNC TO PLANNER
            </button>
          </div>

          {syncStatus && (
            <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-[11px] animate-fadeIn">
              {syncStatus}
            </div>
          )}
        </div>
      </div>

      {/* 3. Subject Syllabus Progress Meters (Instruction 47) */}
      <div className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            SYLLABUS PROGRESS ACCUMULATION
          </h2>
          <span className="text-xs font-bold text-violet-300">
            TOTAL OVERALL: {academicMetrics.syllabusCompletionPercent}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {academicMetrics.subjectDistribution.map((sub) => (
            <div key={sub.subjectId} className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100">{sub.subjectName}</span>
                <span className="text-xs font-bold text-violet-400">{sub.completionPercent}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${sub.completionPercent}%`, backgroundColor: sub.color }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{sub.completedChapters}/{sub.totalChapters} ch completed</span>
                <span>{sub.remainingHours}h left</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Visual Syllabus Heatmap (Instruction 48 & 49) */}
      <div className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              SYLLABUS HEATMAP // 規律進捗分布
            </h2>
            <p className="text-[11px] text-slate-400">
              Semantic color distribution across all syllabus chapters
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Mastered (100%)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Revised (75%)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-sky-400" /> Practicing (50%)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-orange-400" /> Learning (25%)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-slate-700" /> Not Started (0%)
            </span>
          </div>
        </div>

        {/* Heatmap Chapters Matrix by Subject */}
        <div className="space-y-3">
          {academicSubjects.map((sub) => (
            <div key={sub.id} className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>{sub.name} ({sub.code})</span>
                <span className="text-[10px] text-slate-400">{sub.chapters.length} Chapters</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sub.chapters.map((ch) => {
                  let bgColor = 'bg-slate-800 border-slate-700 text-slate-400';
                  if (ch.progressPercent >= 100) bgColor = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                  else if (ch.progressPercent >= 75) bgColor = 'bg-amber-950/80 border-amber-500 text-amber-200';
                  else if (ch.progressPercent >= 50) bgColor = 'bg-sky-950/80 border-sky-500 text-sky-200';
                  else if (ch.progressPercent >= 25) bgColor = 'bg-orange-950/80 border-orange-500 text-orange-200';

                  const isHard = (ch.userDifficulty || ch.systemDifficulty) === 'HARD';

                  return (
                    <div
                      key={ch.id}
                      className={`px-2 py-1.5 rounded border text-[10px] flex items-center gap-1.5 cursor-pointer hover:ring-1 hover:ring-violet-400 transition ${bgColor}`}
                      onClick={() => setScoreModalChapter(ch)}
                      title={`${ch.name} (${ch.progressPercent}% - ${ch.readinessState})`}
                    >
                      <span className="font-bold">Ch{ch.chapterNumber}</span>
                      <span className="truncate max-w-[130px] hidden sm:inline">{ch.name}</span>
                      {isHard && <span className="text-rose-400 font-bold" title="Hard chapter">•</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 6-Phase Strategic Roadmap (Instruction 39) */}
      <div className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
          PREPARATION PHASES ROADMAP // 段階的作戦展開
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {academicMetrics.phases.map((ph) => (
            <div
              key={ph.phaseNumber}
              className={`p-3.5 rounded-lg border transition-all ${
                ph.status === 'ACTIVE'
                  ? 'bg-violet-950/30 border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-violet-400">
                  {ph.name}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  ph.status === 'ACTIVE'
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}>
                  {ph.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {ph.description}
              </p>
              <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5 flex justify-between">
                <span>{formatDateShort(ph.startDate)} → {formatDateShort(ph.endDate)}</span>
                <span className="font-bold text-slate-200">{ph.durationDays}d duration</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Chapter Workload & Interactive Matrix (Instruction 35, 36, 37) */}
      <div className="p-5 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              CHAPTER MASTERY & DIFFICULTY AUDIT
            </h2>
            <p className="text-[11px] text-slate-400">
              System Estimates vs. Student Personal Rating with Spaced Readiness States
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px] focus:outline-none"
            >
              <option value="ALL">ALL SUBJECTS</option>
              {academicSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px] focus:outline-none"
            >
              <option value="ALL">DIFFICULTY: ALL</option>
              <option value="HARD">HARD</option>
              <option value="MODERATE">MODERATE</option>
              <option value="EASY">EASY</option>
            </select>

            <select
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-[11px] focus:outline-none"
            >
              <option value="ALL">READINESS: ALL</option>
              <option value="NOT_STARTED">NOT STARTED</option>
              <option value="LEARNING">LEARNING</option>
              <option value="PRACTICING">PRACTICING</option>
              <option value="REVISED">REVISED</option>
              <option value="MASTERED">MASTERED</option>
            </select>
          </div>
        </div>

        {/* Chapters Table */}
        <div className="space-y-2">
          {filteredChapters.map((chapter) => {
            const currentDiff = chapter.userDifficulty || chapter.systemDifficulty;
            const subject = academicSubjects.find((s) => s.id === chapter.subjectId);

            return (
              <div
                key={chapter.id}
                className="p-3.5 rounded-lg border border-slate-800/90 bg-slate-950/60 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Chapter Identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      [{subject?.name || 'CBSE'}] Ch {chapter.chapterNumber}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[10px] text-slate-400">
                      Est {chapter.estimatedStudyHours}h
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      currentDiff === 'HARD'
                        ? 'border-rose-900 text-rose-300 bg-rose-950/30'
                        : currentDiff === 'MODERATE'
                        ? 'border-amber-900 text-amber-300 bg-amber-950/30'
                        : 'border-emerald-900 text-emerald-300 bg-emerald-950/30'
                    }`}>
                      {currentDiff}
                    </span>
                    {chapter.userDifficulty && (
                      <span className="text-[9px] text-violet-400">
                        (Student Override)
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white font-sans truncate">
                    {chapter.name}
                  </h3>

                  {chapter.weakAreas.length > 0 && (
                    <div className="text-[10px] text-rose-300 mt-0.5 truncate">
                      Weak areas flagged: {chapter.weakAreas.join(', ')}
                    </div>
                  )}
                </div>

                {/* Difficulty Switcher & Readiness State */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Difficulty Override */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5">
                    {(['EASY', 'MODERATE', 'HARD'] as ChapterDifficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => updateStudentDifficulty(chapter.id, d)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                          currentDiff === d
                            ? 'bg-violet-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title={`Set student difficulty rating to ${d}`}
                      >
                        {d[0]}
                      </button>
                    ))}
                  </div>

                  {/* Readiness State Selector */}
                  <select
                    value={chapter.readinessState}
                    onChange={(e) => {
                      const state = e.target.value as ReadinessState;
                      let prog = 0;
                      if (state === 'LEARNING') prog = 25;
                      if (state === 'PRACTICING') prog = 50;
                      if (state === 'REVISED') prog = 75;
                      if (state === 'MASTERED') prog = 100;
                      updateReadinessState(chapter.id, state, prog);
                    }}
                    className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-[10px] font-semibold focus:outline-none"
                  >
                    <option value="NOT_STARTED">NOT STARTED (0%)</option>
                    <option value="LEARNING">LEARNING (25%)</option>
                    <option value="PRACTICING">PRACTICING (50%)</option>
                    <option value="REVISED">REVISED (75%)</option>
                    <option value="MASTERED">MASTERED (100%)</option>
                  </select>

                  {/* Launch Focus Lab */}
                  <button
                    onClick={() => {
                      launchFocusFromAcademic(
                        subject?.name || 'CBSE',
                        chapter.name,
                        chapter.id,
                        chapter.subjectId,
                        90
                      );
                      setActiveView('focus');
                    }}
                    className="px-2.5 py-1 rounded bg-violet-600/90 hover:bg-violet-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                    title="Engage deep work in Focus Lab"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>START FOCUS</span>
                  </button>

                  {/* Test score entry trigger */}
                  <button
                    onClick={() => setScoreModalChapter(chapter)}
                    className="px-2 py-1 rounded border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-[10px]"
                    title="Log Test / Quiz Score"
                  >
                    {chapter.testScores.length > 0 ? `${chapter.testScores[0].scorePercent}% Logged` : '+ Score'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Modal for Logging Test Score */}
      {scoreModalChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0c0e18] border border-violet-500/40 rounded-lg p-5 text-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">
              LOG TEST / QUIZ SCORE
            </h3>
            <p className="text-xs text-violet-400 mb-4 truncate">
              {scoreModalChapter.name}
            </p>

            <form onSubmit={handleSaveScore} className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">TEST TITLE / ASSESSMENT</label>
                <input
                  type="text"
                  required
                  value={testNameInput}
                  onChange={(e) => setTestNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">SCORE PERCENTAGE (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scorePercentInput}
                  onChange={(e) => setScorePercentInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs focus:outline-none focus:border-violet-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Scores below 70% automatically elevate revision priority and flag weak areas.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScoreModalChapter(null)}
                  className="px-3 py-1.5 rounded border border-slate-800 text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  SAVE SCORE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal for Adjusting Exam Date (Official vs Estimated) */}
      {isEditingExamDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0c0e18] border border-violet-500/40 rounded-lg p-5 text-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">
              CONFIGURE EXAM SCHEDULE
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Set expected or official CBSE datesheet start date.
            </p>

            <form onSubmit={handleSaveExamDate} className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">EXAM START DATE</label>
                <input
                  type="date"
                  required
                  value={examDateInput}
                  onChange={(e) => setExamDateInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1">STATUS</label>
                <select
                  value={examTypeInput}
                  onChange={(e) => setExamTypeInput(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs focus:outline-none"
                >
                  <option value="ESTIMATED">ESTIMATED (Mid-Feb / March Baseline)</option>
                  <option value="OFFICIAL">OFFICIAL (CBSE Published Datesheet)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingExamDate(false)}
                  className="px-3 py-1.5 rounded border border-slate-800 text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold"
                >
                  SAVE SCHEDULE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Modal for Simulating Today's Date (Instruction 29 & 55) */}
      {isSimulatingDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0c0e18] border border-violet-500/40 rounded-lg p-5 text-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">
              SIMULATE TODAY'S DATE // 作戦検証日付設定
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Allows testing academic preparation plans from any arbitrary calendar date (e.g., 07 October 2026).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">TARGET SIMULATED DATE</label>
                <input
                  type="date"
                  value={simDateInput}
                  onChange={(e) => setSimDateInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetSimulatedDate}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Reset to Actual Date
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSimulatingDate(false)}
                    className="px-3 py-1.5 rounded border border-slate-800 text-slate-400 hover:text-white"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleApplySimulatedDate}
                    className="px-4 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold"
                  >
                    APPLY DATE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
