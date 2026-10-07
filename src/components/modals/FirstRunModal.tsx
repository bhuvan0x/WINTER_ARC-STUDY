import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowRight, Check, GraduationCap } from 'lucide-react';
import { DayType } from '../../types';
import { StudentClass } from '../../types/academic';
import { getTodayDateString } from '../../utils/dateUtils';
import { DEFAULT_EXAM_SCHEDULE } from '../../data/cbseCurriculum';

export const FirstRunModal: React.FC = () => {
  const { settings, saveSettings, loadPresetForCurrentDate, currentDayType } = useApp();

  const [name, setName] = useState(settings.name || 'Operative');
  const [studentClass, setStudentClass] = useState<StudentClass>(settings.studentClass || '12');
  const [academicYear, setAcademicYear] = useState('2026–27');
  const [board, setBoard] = useState('CBSE');
  const [todayDateInput, setTodayDateInput] = useState(getTodayDateString());
  const [wakeTime, setWakeTime] = useState(settings.wakeTime || '05:30');
  const [sleepTime, setSleepTime] = useState(settings.sleepTime || '22:30');
  const [schoolDays, setSchoolDays] = useState<number[]>(settings.schoolDays || [1, 2, 3, 4, 5, 6]);
  const [schoolStartTime, setSchoolStartTime] = useState(settings.schoolStartTime || '06:00');
  const [schoolEndTime, setSchoolEndTime] = useState(settings.schoolEndTime || '15:00');
  const [coachingSchedule, setCoachingSchedule] = useState(settings.coachingSchedule || 'None / Self-Directed Deep Work');
  const [academicGoals, setAcademicGoals] = useState(settings.academicGoals.join('\n'));
  const [fitnessGoals, setFitnessGoals] = useState(settings.fitnessGoals.join('\n'));
  const [personalGoals, setPersonalGoals] = useState(settings.personalGoals.join('\n'));
  const [initialPreset, setInitialPreset] = useState<DayType>(currentDayType || 'SCHOOL');

  const daysMap = [
    { label: 'SUN', value: 0 },
    { label: 'MON', value: 1 },
    { label: 'TUE', value: 2 },
    { label: 'WED', value: 3 },
    { label: 'THU', value: 4 },
    { label: 'FRI', value: 5 },
    { label: 'SAT', value: 6 },
  ];

  const toggleSchoolDay = (dayVal: number) => {
    if (schoolDays.includes(dayVal)) {
      setSchoolDays(schoolDays.filter((d) => d !== dayVal));
    } else {
      setSchoolDays([...schoolDays, dayVal].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const defaultExam = DEFAULT_EXAM_SCHEDULE[studentClass];

    await saveSettings({
      name: name.trim() || 'Operative',
      studentClass,
      academicYear,
      board,
      simulatedTodayDate: todayDateInput !== getTodayDateString() ? todayDateInput : '',
      examDate: defaultExam.examStartDate,
      examDateType: defaultExam.examDateType,
      wakeTime,
      sleepTime,
      schoolDays,
      schoolStartTime,
      schoolEndTime,
      coachingSchedule: coachingSchedule.trim(),
      academicGoals: academicGoals.split('\n').map((g) => g.trim()).filter(Boolean),
      fitnessGoals: fitnessGoals.split('\n').map((g) => g.trim()).filter(Boolean),
      personalGoals: personalGoals.split('\n').map((g) => g.trim()).filter(Boolean),
      hasCompletedInit: true,
    });

    // Populate today's schedule according to preset
    await loadPresetForCurrentDate(initialPreset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#090b14] border border-violet-500/40 rounded-lg shadow-2xl p-6 sm:p-8 font-mono my-8 text-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="p-2 rounded bg-violet-950/60 border border-violet-500/50 text-violet-300">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-widest text-white">
              WINTER ARC INITIALIZATION
            </h1>
            <p className="text-xs text-violet-400">
              DISCIPLINE SYSTEM PROTOCOL SETUP // 規律体系初期設定
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 0: Academic Class & Board Calibration */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 pb-1 flex items-center justify-between">
              <span>01. Academic Preparation Level (CBSE / NCERT)</span>
              <span className="text-violet-400 font-bold">BOARD: CBSE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">SELECT CLASS *</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['9', '10', '11', '12'] as StudentClass[]).map((cls) => (
                    <button
                      type="button"
                      key={cls}
                      onClick={() => setStudentClass(cls)}
                      className={`py-2 rounded border font-bold text-xs transition ${
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
                <label className="block text-slate-400 mb-1">ACADEMIC YEAR</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">TODAY'S DATE</label>
                <input
                  type="date"
                  required
                  value={todayDateInput}
                  onChange={(e) => setTodayDateInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                  title="Auto-detected device date (can be changed for testing/simulation)"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Identity & Circadian Lock */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 pb-1">
              02. Operative Identity & Circadian Anchor
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">OPERATIVE NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="e.g. Ayanokoji / Kiyataka"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">WAKE-UP TIME</label>
                <input
                  type="time"
                  required
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">SLEEP TIME</label>
                <input
                  type="time"
                  required
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: School Protocol Schedule */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 pb-1">
              02. Institutional School Schedule
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5">SCHOOL DAYS (STANDARD MON–SAT)</label>
              <div className="flex flex-wrap gap-2">
                {daysMap.map((d) => {
                  const isSelected = schoolDays.includes(d.value);
                  return (
                    <button
                      type="button"
                      key={d.value}
                      onClick={() => toggleSchoolDay(d.value)}
                      className={`px-3 py-1.5 rounded border text-xs transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-violet-950/70 border-violet-500 text-violet-200'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-violet-400" />}
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1">SCHOOL START TIME</label>
                <input
                  type="time"
                  required
                  value={schoolStartTime}
                  onChange={(e) => setSchoolStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">SCHOOL END TIME</label>
                <input
                  type="time"
                  required
                  value={schoolEndTime}
                  onChange={(e) => setSchoolEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">COACHING / TUITION SCHEDULE</label>
              <input
                type="text"
                value={coachingSchedule}
                onChange={(e) => setCoachingSchedule(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500"
                placeholder="e.g. Physics Tuition MWF 16:30 - 18:00 or None"
              />
            </div>
          </div>

          {/* Section 3: Goals Matrix */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 pb-1">
              03. Strategic Objectives (Winter Arc Pillars)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">ACADEMIC GOALS (1 per line)</label>
                <textarea
                  rows={3}
                  value={academicGoals}
                  onChange={(e) => setAcademicGoals(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500 resize-none text-[11px]"
                  placeholder="Master Syllabus..."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">FITNESS GOALS (1 per line)</label>
                <textarea
                  rows={3}
                  value={fitnessGoals}
                  onChange={(e) => setFitnessGoals(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500 resize-none text-[11px]"
                  placeholder="Calisthenics, 100 pushups..."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PERSONAL DEV GOALS</label>
                <textarea
                  rows={3}
                  value={personalGoals}
                  onChange={(e) => setPersonalGoals(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-violet-500 resize-none text-[11px]"
                  placeholder="Coding, strategy, zero distraction..."
                />
              </div>
            </div>
          </div>

          {/* Section 4: Initial Day Preset */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 pb-1">
              04. Today's Initial Plan Preset
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setInitialPreset('SCHOOL')}
                className={`p-3 rounded border text-left transition-all ${
                  initialPreset === 'SCHOOL'
                    ? 'border-violet-500 bg-violet-950/40 text-violet-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">[SCHOOL DAY]</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  06:00-15:00 School, followed by Deep Work, Training, Revision
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInitialPreset('HOLIDAY')}
                className={`p-3 rounded border text-left transition-all ${
                  initialPreset === 'HOLIDAY'
                    ? 'border-violet-500 bg-violet-950/40 text-violet-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">[HOLIDAY INTENSIVE]</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Morning workout, Academic Deep Work I & II, Coding, Reading
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInitialPreset('CUSTOM')}
                className={`p-3 rounded border text-left transition-all ${
                  initialPreset === 'CUSTOM'
                    ? 'border-violet-500 bg-violet-950/40 text-violet-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">[CUSTOM DAY]</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Blank canvas for self-constructed schedule blocks
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Settings and schedules can be modified at any time in Settings.
            </span>

            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition"
            >
              <span>INITIALIZE ARC</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
