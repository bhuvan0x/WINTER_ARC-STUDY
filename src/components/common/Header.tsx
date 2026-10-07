import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getCurrentTimeHHMMSS, formatDateDisplay, getTodayDateString } from '../../utils/dateUtils';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Volume2,
  VolumeX,
  Eye,
  Calendar as CalendarIcon,
  HelpCircle,
  Sun,
  Moon,
  Cpu,
} from 'lucide-react';

interface HeaderProps {
  onOpenShortcuts: () => void;
  onOpenMorningBrief: () => void;
  onOpenNightReport: () => void;
  onOpenScoreBreakdown: () => void;
  onOpenFeatureCompendium?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenShortcuts,
  onOpenMorningBrief,
  onOpenNightReport,
  onOpenScoreBreakdown,
  onOpenFeatureCompendium,
}) => {
  const {
    settings,
    saveSettings,
    currentDate,
    effectiveToday,
    dayNumber,
    currentDayType,
    disciplineBreakdown,
    streakStats,
    whiteRoomMode,
    toggleWhiteRoomMode,
    setActiveView,
  } = useApp();

  const [timeString, setTimeString] = useState(getCurrentTimeHHMMSS());

  const countdownDays = useMemo(() => {
    if (!settings.examDate) return 0;
    const [ty, tm, td] = (effectiveToday || getTodayDateString()).split('-').map(Number);
    const [ey, em, ed] = settings.examDate.split('-').map(Number);
    const diff = new Date(ey, em - 1, ed).getTime() - new Date(ty, tm - 1, td).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [effectiveToday, settings.examDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeString(getCurrentTimeHHMMSS());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    saveSettings({ soundEffects: !settings.soundEffects });
  };

  return (
    <header className={`border-b sticky top-0 z-30 backdrop-blur-md transition-colors ${
      whiteRoomMode
        ? 'bg-black/90 border-neutral-800 text-white'
        : 'bg-[#080910]/95 border-slate-800/80 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center font-mono font-bold text-xs border ${
            whiteRoomMode
              ? 'border-neutral-500 bg-neutral-900 text-neutral-200'
              : 'border-violet-500/50 bg-violet-950/40 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
          }`}>
            WA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-slate-100">
                WINTER ARC
              </span>
              <span className="text-[10px] font-mono text-violet-400/80 border border-violet-900/60 px-1 py-0.2 rounded bg-violet-950/20">
                DAY {dayNumber}
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-tight text-slate-400 flex items-center gap-1.5">
              <span>DISCIPLINE SYSTEM</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">規律体系</span>
            </div>
          </div>
        </div>

        {/* Tactical status center (Time & Day Type) */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <CalendarIcon className="w-3.5 h-3.5 text-violet-400" />
            <span>{formatDateDisplay(currentDate)}</span>
          </div>

          <div className="px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-700/80 bg-slate-900/50 text-slate-300">
            {currentDayType === 'SCHOOL' && 'SCHOOL PROTOCOL'}
            {currentDayType === 'HOLIDAY' && 'HOLIDAY INTENSIVE'}
            {currentDayType === 'CUSTOM' && 'CUSTOM OPERATION'}
          </div>

          <div className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-slate-950 border border-slate-800 text-emerald-400 tracking-wider">
            {timeString}
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {/* CBSE Exam Countdown quick access badge */}
          <button
            onClick={() => setActiveView('academics')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              whiteRoomMode
                ? 'border-neutral-700 bg-neutral-900 text-neutral-200'
                : 'border-violet-500/50 bg-violet-950/40 text-violet-200 hover:bg-violet-900/50 shadow-sm'
            }`}
            title={`CBSE ${settings.studentClass} Exam: ${countdownDays} days remaining`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="font-bold">{countdownDays}D TO EXAM</span>
          </button>

          {/* Discipline Score badge - interactive breakdown */}
          <button
            onClick={onOpenScoreBreakdown}
            className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              whiteRoomMode
                ? 'border-neutral-700 bg-neutral-900 text-neutral-200'
                : 'border-slate-800 bg-slate-900/70 hover:border-violet-500/50 hover:bg-slate-900 text-slate-200'
            }`}
            title="View transparent Discipline Score breakdown"
          >
            <span className="text-slate-400 text-[10px]">SCORE</span>
            <span className={`font-bold ${disciplineBreakdown.score >= 75 ? 'text-violet-300' : 'text-amber-300'}`}>
              {disciplineBreakdown.score}%
            </span>
            <span className="text-slate-500 text-[10px]">·</span>
            <span className="text-emerald-400 text-[10px]">{streakStats.currentStreak}D STREAK</span>
          </button>

          {/* Morning & Night Report Triggers */}
          <button
            onClick={onOpenMorningBrief}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Open Morning Briefing"
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>BRIEF</span>
          </button>

          <button
            onClick={onOpenNightReport}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Open Night Report"
          >
            <Moon className="w-3 h-3 text-violet-400" />
            <span>REPORT</span>
          </button>

          {/* White Room Mode toggle */}
          <button
            onClick={toggleWhiteRoomMode}
            className={`p-1.5 rounded border transition-colors ${
              whiteRoomMode
                ? 'border-white bg-white text-black font-bold'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title={whiteRoomMode ? 'Exit White Room Mode' : 'Enter White Room Mode (Monochrome / Sterile)'}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title={settings.soundEffects ? 'Sound: On' : 'Sound: Off'}
          >
            {settings.soundEffects ? (
              <Volume2 className="w-3.5 h-3.5 text-violet-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* PWA Install */}
          <PWAInstallButton />

          {/* System Specs & Features Showcase */}
          {onOpenFeatureCompendium && (
            <button
              onClick={onOpenFeatureCompendium}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono border border-violet-500/40 bg-violet-950/40 text-violet-300 hover:bg-violet-900/40 hover:text-white transition shadow-sm"
              title="System Architecture & Feature Showcase"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px] font-bold">FEATURES</span>
            </button>
          )}

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white transition-colors"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
