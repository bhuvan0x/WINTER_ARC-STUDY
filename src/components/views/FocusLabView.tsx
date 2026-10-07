import React, { useState, useEffect } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import { TimerDisplay } from '../focus/TimerDisplay';
import { SessionBuilder } from '../focus/SessionBuilder';
import { AudioLabSection } from '../focus/AudioLabSection';
import { FocusHistoryView } from '../focus/FocusHistoryView';
import { CompactAudioPlayer } from '../focus/CompactAudioPlayer';
import { FocusEnvironmentModal } from '../focus/FocusEnvironmentModal';
import { SessionReviewModal } from '../focus/SessionReviewModal';
import {
  Crosshair,
  Sliders,
  Music,
  BarChart2,
  Maximize2,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Sparkles,
} from 'lucide-react';

export const FocusLabView: React.FC = () => {
  const {
    timerStatus,
    focusEnvironmentActive,
    toggleFocusEnvironment,
    pauseSession,
    resumeSession,
    resetSession,
    skipBlock,
    togglePlayAudio,
    nextTrack,
    muted,
    toggleMuteAudio,
    browserNotifications,
    requestNotificationPermission,
  } = useFocus();

  const { whiteRoomMode } = useApp();

  type TabType = 'TIMER' | 'PRESETS' | 'AUDIO' | 'HISTORY';
  const [activeTab, setActiveTab] = useState<TabType>('TIMER');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Focus Lab keyboard shortcut listeners:
  // Space (Pause/Resume), R (Reset), S (Skip), F (Environment), M (Mute), N (Next track), Esc (Exit Env)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (timerStatus === 'RUNNING' || timerStatus === 'BREAK') {
            pauseSession();
          } else if (timerStatus === 'PAUSED') {
            resumeSession();
          }
          break;
        case 'r':
          e.preventDefault();
          resetSession();
          break;
        case 's':
          e.preventDefault();
          skipBlock();
          break;
        case 'f':
          e.preventDefault();
          toggleFocusEnvironment();
          break;
        case 'm':
          e.preventDefault();
          toggleMuteAudio();
          break;
        case 'n':
          e.preventDefault();
          nextTrack();
          break;
        case 'escape':
          if (focusEnvironmentActive) {
            e.preventDefault();
            toggleFocusEnvironment(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    timerStatus,
    focusEnvironmentActive,
    pauseSession,
    resumeSession,
    resetSession,
    skipBlock,
    toggleFocusEnvironment,
    toggleMuteAudio,
    nextTrack,
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-mono">
      {/* Top Focus Lab Header Banner */}
      <div className={`p-4 sm:p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
        whiteRoomMode
          ? 'bg-black border-neutral-800'
          : 'bg-[#090b14] border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-950/80 border border-violet-500/80 flex items-center justify-center text-violet-300">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-white tracking-widest flex items-center gap-2">
              <span>FOCUS LAB // DEEP WORK CHAMBER</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Sterile concentration environment · High-precision background timers · Procedural acoustics
            </div>
          </div>
        </div>

        {/* Quick controls on top right */}
        <div className="flex items-center gap-2">
          {/* Browser notification toggle */}
          <button
            onClick={() => requestNotificationPermission()}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              browserNotifications
                ? 'bg-violet-950/60 border-violet-600 text-violet-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={browserNotifications ? 'Browser notifications active' : 'Enable browser notifications'}
          >
            {browserNotifications ? (
              <Bell className="w-3.5 h-3.5" />
            ) : (
              <BellOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline text-[10px]">
              {browserNotifications ? 'NOTIFS ON' : 'ENABLE NOTIFS'}
            </span>
          </button>

          {/* Focus Environment Fullscreen button */}
          <button
            onClick={() => toggleFocusEnvironment(true)}
            className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow"
            title="Focus Environment (F)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
            <span>ENV [F]</span>
          </button>
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('TIMER')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'TIMER'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>ACTIVE TIMER</span>
        </button>

        <button
          onClick={() => setActiveTab('PRESETS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'PRESETS'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>PRESETS & BUILDER</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIO')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'AUDIO'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>AUDIO LAB</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>HISTORY & HEATMAP</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="py-2">
        {activeTab === 'TIMER' && (
          <TimerDisplay
            onOpenReviewModal={() => setIsReviewModalOpen(true)}
            onOpenPresetBuilder={() => setActiveTab('PRESETS')}
          />
        )}

        {activeTab === 'PRESETS' && (
          <SessionBuilder onClose={() => setActiveTab('TIMER')} />
        )}

        {activeTab === 'AUDIO' && <AudioLabSection />}

        {activeTab === 'HISTORY' && <FocusHistoryView />}
      </div>

      {/* Subtle Bottom Audio Player Dock */}
      <div className="pt-4">
        <CompactAudioPlayer />
      </div>

      {/* Focus Environment Fullscreen Overlay */}
      {focusEnvironmentActive && <FocusEnvironmentModal />}

      {/* After-Action Review Modal */}
      <SessionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
};
