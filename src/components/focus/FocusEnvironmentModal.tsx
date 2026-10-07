import React, { useEffect } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  Minimize2,
  Volume2,
  VolumeX,
  SkipForward,
  CheckCircle2,
  Music,
} from 'lucide-react';

export const FocusEnvironmentModal: React.FC = () => {
  const {
    timerStatus,
    secondsRemaining,
    currentBlockIndex,
    blocks,
    sessionObjective,
    activeTrack,
    isPlayingAudio,
    togglePlayAudio,
    muted,
    toggleMuteAudio,
    pauseSession,
    resumeSession,
    completeSession,
    skipBlock,
    toggleFocusEnvironment,
  } = useFocus();

  const { whiteRoomMode } = useApp();
  const currentBlock = blocks[currentBlockIndex] || blocks[0];
  const isFocusBlock = currentBlock?.type === 'FOCUS';

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between p-8 sm:p-16 select-none transition-colors ${
      whiteRoomMode
        ? 'bg-black text-white'
        : 'bg-[#06070b] text-slate-100'
    }`}>
      {/* Top Header: Objective & Exit */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <div className="font-mono text-xs tracking-widest text-slate-500 uppercase">
          FOCUS ENVIRONMENT // ESC TO EXIT
        </div>
        <button
          onClick={() => toggleFocusEnvironment(false)}
          className="p-2 rounded text-slate-400 hover:text-white border border-transparent hover:border-slate-800 transition"
          title="Exit Focus Environment (ESC)"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Dominant Centerpiece: Objective & Giant Monospace Timer */}
      <div className="flex flex-col items-center justify-center text-center my-auto space-y-6">
        <div className="font-mono text-sm sm:text-base tracking-widest text-slate-400 uppercase max-w-xl">
          {sessionObjective}
        </div>

        <div className="font-mono text-xs font-bold px-3 py-1 rounded border border-slate-800 bg-slate-950/60 text-slate-300">
          {currentBlock?.label || (isFocusBlock ? 'FOCUS BLOCK' : 'RECOVERY BREAK')}
        </div>

        <div className="font-mono font-bold text-7xl sm:text-9xl md:text-[11rem] tracking-tighter text-white">
          {formatTime(secondsRemaining)}
        </div>

        {/* Minimal Audio Status */}
        {activeTrack && (
          <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
            <Music className="w-3.5 h-3.5 text-violet-400" />
            <span>{activeTrack.title}</span>
            <button
              onClick={togglePlayAudio}
              className="text-slate-400 hover:text-white ml-2 underline"
            >
              {isPlayingAudio ? 'PAUSE AUDIO' : 'PLAY AUDIO'}
            </button>
          </div>
        )}
      </div>

      {/* Minimal Bottom Controls */}
      <div className="flex items-center justify-center gap-4 w-full max-w-md mx-auto">
        {timerStatus === 'RUNNING' || timerStatus === 'BREAK' ? (
          <button
            onClick={() => pauseSession()}
            className="px-8 py-3 rounded-lg font-mono text-xs font-bold border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition"
          >
            <Pause className="w-4 h-4" />
            <span>PAUSE [SPACE]</span>
          </button>
        ) : (
          <button
            onClick={resumeSession}
            className="px-8 py-3 rounded-lg font-mono text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME [SPACE]</span>
          </button>
        )}

        <button
          onClick={skipBlock}
          className="px-4 py-3 rounded-lg font-mono text-xs border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition"
          title="Skip block"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            completeSession();
            toggleFocusEnvironment(false);
          }}
          className="px-5 py-3 rounded-lg font-mono text-xs font-bold border border-emerald-600/80 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 flex items-center gap-1.5 transition"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>COMPLETE</span>
        </button>
      </div>
    </div>
  );
};
