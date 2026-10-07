import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentClass, ExamDateType } from '../../types/academic';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  Check,
  ShieldAlert,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    saveSettings,
    setStudentClass,
    setExamSchedule,
    resetAcademicPlan,
    exportDatabase,
    importDatabase,
    resetAllData,
    whiteRoomMode,
    toggleWhiteRoomMode,
  } = useApp();

  const [name, setName] = useState(settings.name);
  const [studentClass, setLocalClass] = useState<StudentClass>(settings.studentClass || '12');
  const [academicYear, setAcademicYear] = useState(settings.academicYear || '2026–27');
  const [board, setBoard] = useState(settings.board || 'CBSE');
  const [examDate, setExamDate] = useState(settings.examDate || '2027-02-15');
  const [examDateType, setExamDateType] = useState<ExamDateType>(settings.examDateType || 'ESTIMATED');
  const [revisionBuffer, setRevisionBuffer] = useState(settings.revisionBufferPercent || 25);
  const [schoolStudyHours, setSchoolStudyHours] = useState(settings.schoolDayStudyHours || 3.5);
  const [holidayStudyHours, setHolidayStudyHours] = useState(settings.holidayStudyHours || 7.0);
  const [festivalStudyHours, setFestivalStudyHours] = useState(settings.festivalStudyHours || 2.0);
  const [wakeTime, setWakeTime] = useState(settings.wakeTime);
  const [sleepTime, setSleepTime] = useState(settings.sleepTime);
  const [schoolStartTime, setSchoolStartTime] = useState(settings.schoolStartTime);
  const [schoolEndTime, setSchoolEndTime] = useState(settings.schoolEndTime);
  const [schoolDays, setSchoolDays] = useState<number[]>(settings.schoolDays);
  const [coachingSchedule, setCoachingSchedule] = useState(settings.coachingSchedule);
  const [streakMin, setStreakMin] = useState(settings.streakMinimumPercent);
  const [morningQuote, setMorningQuote] = useState(settings.morningQuote);
  const [isSaved, setIsSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const daysMap = [
    { label: 'SUN', value: 0 },
    { label: 'MON', value: 1 },
    { label: 'TUE', value: 2 },
    { label: 'WED', value: 3 },
    { label: 'THU', value: 4 },
    { label: 'FRI', value: 5 },
    { label: 'SAT', value: 6 },
  ];

  const toggleDay = (dayVal: number) => {
    if (schoolDays.includes(dayVal)) {
      setSchoolDays(schoolDays.filter((d) => d !== dayVal));
    } else {
      setSchoolDays([...schoolDays, dayVal].sort());
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    await saveSettings({
      name: name.trim(),
      studentClass,
      academicYear,
      board,
      examDate,
      examDateType,
      revisionBufferPercent: Number(revisionBuffer) || 25,
      schoolDayStudyHours: Number(schoolStudyHours) || 3.5,
      holidayStudyHours: Number(holidayStudyHours) || 7.0,
      festivalStudyHours: Number(festivalStudyHours) || 2.0,
      wakeTime,
      sleepTime,
      schoolStartTime,
      schoolEndTime,
      schoolDays,
      coachingSchedule: coachingSchedule.trim(),
      streakMinimumPercent: Number(streakMin) || 75,
      morningQuote: morningQuote.trim(),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Export full JSON database
  const handleExport = async () => {
    const data = await exportDatabase();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `winter_arc_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON format');
      }

      await importDatabase(parsed);
      setImportStatus('Backup restored successfully into IndexedDB.');
      setTimeout(() => setImportStatus(''), 4000);
    } catch (err) {
      console.error(err);
      setImportStatus('Failed to import backup: invalid file format.');
      setTimeout(() => setImportStatus(''), 4000);
    }
  };

  // Clear all data
  const handleReset = async () => {
    const confirmPhrase = prompt(
      'Type "PURGE" to permanently delete all tasks, logs, objectives, and progress from IndexedDB:'
    );
    if (confirmPhrase === 'PURGE') {
      await resetAllData();
      alert('All database stores have been purged.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono text-xs">
      {/* 1. Header */}
      <div className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#090b14]/90 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-wider">
              SYSTEM CONFIGURATION
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            OPERATIVE PROTOCOLS & DATA CONTROL // 環境設定
          </p>
        </div>

        {isSaved && (
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
            <Check className="w-4 h-4" />
            <span>CONFIG SAVED</span>
          </span>
        )}
      </div>

      {/* 2. Profile & Schedule Protocol Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-6 shadow-xl">
        {/* Academic CBSE Engine Specs */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-violet-400">
              <GraduationCap className="w-4 h-4" />
              01. ACADEMIC PREPARATION ENGINE (CBSE / NCERT)
            </span>
            <span className="text-slate-400">CURRICULUM LEVEL</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">STUDENT CLASS</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['9', '10', '11', '12'] as StudentClass[]).map((cls) => (
                  <button
                    type="button"
                    key={cls}
                    onClick={() => {
                      setLocalClass(cls);
                      setStudentClass(cls);
                    }}
                    className={`py-1.5 rounded border text-xs font-bold transition ${
                      studentClass === cls
                        ? 'bg-violet-600 border-violet-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    CLASS {cls}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">BOARD</label>
              <input
                type="text"
                required
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ACADEMIC YEAR</label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">EXAM START DATE</label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">SCHEDULE TYPE</label>
              <select
                value={examDateType}
                onChange={(e) => setExamDateType(e.target.value as ExamDateType)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none"
              >
                <option value="ESTIMATED">ESTIMATED</option>
                <option value="OFFICIAL">OFFICIAL DATESHEET</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">REVISION BUFFER (%)</label>
              <input
                type="number"
                min="10"
                max="40"
                required
                value={revisionBuffer}
                onChange={(e) => setRevisionBuffer(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-slate-400 mb-1">SCHOOL DAY STUDY (HOURS)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="8"
                value={schoolStudyHours}
                onChange={(e) => setSchoolStudyHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">HOLIDAY STUDY (HOURS)</label>
              <input
                type="number"
                step="0.5"
                min="2"
                max="12"
                value={holidayStudyHours}
                onChange={(e) => setHolidayStudyHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">FESTIVAL STUDY (HOURS)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="8"
                value={festivalStudyHours}
                onChange={(e) => setFestivalStudyHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all customized chapter progress and reload official NCERT defaults?')) {
                  resetAcademicPlan();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET ACADEMIC PLAN OVERRIDES</span>
            </button>
          </div>
        </div>

        {/* Operative Specs */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
            02. OPERATIVE IDENTITY & CIRCADIAN CLOCK
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">OPERATIVE NAME</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">WAKE TIME</label>
              <input
                type="time"
                required
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">SLEEP TIME</label>
              <input
                type="time"
                required
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Institutional Schedule */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
            02. SCHOOL SCHEDULE & ATTENDANCE DAYS
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5">SCHOOL DAYS</label>
            <div className="flex flex-wrap gap-2">
              {daysMap.map((d) => {
                const isSelected = schoolDays.includes(d.value);
                return (
                  <button
                    type="button"
                    key={d.value}
                    onClick={() => toggleDay(d.value)}
                    className={`px-3 py-1.5 rounded border text-xs transition-colors ${
                      isSelected
                        ? 'bg-violet-950/70 border-violet-500 text-violet-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">SCHOOL START TIME</label>
              <input
                type="time"
                required
                value={schoolStartTime}
                onChange={(e) => setSchoolStartTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">SCHOOL END TIME</label>
              <input
                type="time"
                required
                value={schoolEndTime}
                onChange={(e) => setSchoolEndTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">COACHING / TUITION LOGISTICS</label>
            <input
              type="text"
              value={coachingSchedule}
              onChange={(e) => setCoachingSchedule(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Scoring & Philosophy */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
            03. SCORING THRESHOLDS & DIRECTIVES
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">
                STREAK MINIMUM REQUIREMENT PERCENT (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                required
                value={streakMin}
                onChange={(e) => setStreakMin(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard: 75% daily task completion qualifies for streak progression.
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                MORNING BRIEFING MOTTO / QUOTE
              </label>
              <input
                type="text"
                required
                value={morningQuote}
                onChange={(e) => setMorningQuote(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold transition shadow-sm"
          >
            SAVE CONFIGURATION
          </button>
        </div>
      </form>

      {/* 3. Visual & Audio Environment */}
      <div className="p-6 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
          04. INTERFACE ATMOSPHERE & AUDIO
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">WHITE ROOM MODE</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Sterile monochrome environment, zero visual distractions
              </div>
            </div>
            <button
              onClick={toggleWhiteRoomMode}
              className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
                whiteRoomMode
                  ? 'bg-white text-black border-white'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              {whiteRoomMode ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">TACTILE AUDIO SYNTHESIS</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Web Audio clicks and completion chimes (zero network files)
              </div>
            </div>
            <button
              onClick={() => saveSettings({ soundEffects: !settings.soundEffects })}
              className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
                settings.soundEffects
                  ? 'bg-violet-950/80 border-violet-500 text-violet-200'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              {settings.soundEffects ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Data Persistence & Backup Management */}
      <div className="p-6 rounded-lg border border-slate-800 bg-[#090b14]/90 space-y-4">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-1">
          05. LOCAL DATA PERSISTENCE // EXPORT & IMPORT
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">
          All data is stored directly in your browser's IndexedDB. No mandatory cloud database, no external telemetry.
          To prevent data loss when clearing browser cookies or switching computers, export a JSON backup regularly.
        </p>

        <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="font-bold text-slate-300">STORAGE ARCHITECTURE NOTICE:</div>
          <div>• <strong>SETTINGS + METADATA:</strong> Exports all timeline plans, CBSE progress, focus histories, playlists, and audio catalog configurations into a portable JSON document.</div>
          <div>• <strong>LOCAL AUDIO BINARIES:</strong> Imported audio files (MP3/WAV/FLAC) are retained directly in your browser's local Blob store. To protect backup portability and avoid JSON payload truncation, large audio blobs remain in local device storage.</div>
        </div>

        {importStatus && (
          <div className="p-2.5 rounded bg-violet-950/40 border border-violet-500 text-violet-200 text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-violet-400" />
            <span>EXPORT SETTINGS + METADATA (JSON)</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>IMPORT JSON BACKUP</span>
          </button>

          {/* Wipe All Data */}
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40 font-bold flex items-center gap-2 transition ml-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>CLEAR ALL DATA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
