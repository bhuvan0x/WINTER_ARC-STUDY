import React, { useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import { formatMinutes } from '../../utils/dateUtils';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Maximize2,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  AlertCircle,
  PauseCircle,
  HelpCircle,
} from 'lucide-react';

interface TimerDisplayProps {
  onOpenReviewModal: () => void;
  onOpenPresetBuilder: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  onOpenReviewModal,
  onOpenPresetBuilder,
}) => {
  const {
    timerStatus,
    secondsRemaining,
    currentBlockIndex,
    blocks,
    activePreset,
    sessionObjective,
    setSessionObjective,
    pauses,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
    skipBlock,
    completeSession,
    toggleFocusEnvironment,
    activeTrack,
    isPlayingAudio,
    togglePlayAudio,
    linkedChapterId,
  } = useFocus();

  const { whiteRoomMode } = useApp();
  const [pauseReasonInput, setPauseReasonInput] = useState('');
  const [showPauseReasonModal, setShowPauseReasonModal] = useState(false);
  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [objectiveInput, setObjectiveInput] = useState(sessionObjective);

  const currentBlock = blocks[currentBlockIndex] || blocks[0];
  const isFocusBlock = currentBlock?.type === 'FOCUS';
  const totalBlockSeconds = (currentBlock?.durationMinutes || 50) * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((totalBlockSeconds - secondsRemaining) / totalBlockSeconds) * 100))
  );

  // Next block info
  const nextBlock = blocks[currentBlockIndex + 1];

  // Total pause time in seconds
  const totalPauseSeconds = pauses.reduce((sum, p) => sum + p.durationSeconds, 0);

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

  const handlePauseClick = () => {
    if (timerStatus === 'RUNNING' || timerStatus === 'BREAK') {
      setShowPauseReasonModal(true);
    } else if (timerStatus === 'PAUSED') {
      resumeSession();
    }
  };

  const confirmPause = () => {
    pauseSession(pauseReasonInput.trim() || undefined);
    setShowPauseReasonModal(false);
    setPauseReasonInput('');
  };

  const skipPauseReason = () => {
    pauseSession();
    setShowPauseReasonModal(false);
    setPauseReasonInput('');
  };

  const handleSaveObjective = () => {
    if (objectiveInput.trim()) {
      setSessionObjective(objectiveInput.trim());
    }
    setIsEditingObjective(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Protocol Status Header */}
      <div className={`p-4 rounded-lg border flex flex-wrap items-center justify-between gap-4 ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-800'
          : 'bg-[#0b0d18]/90 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${
            timerStatus === 'RUNNING'
              ? 'bg-violet-400 animate-pulse'
              : timerStatus === 'BREAK'
              ? 'bg-emerald-400 animate-pulse'
              : timerStatus === 'PAUSED'
              ? 'bg-amber-400'
              : 'bg-slate-600'
          }`} />
          <div className="font-mono text-xs font-bold tracking-wider text-slate-300">
            PROTOCOL: <span className="text-white">{activePreset}</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="font-mono text-xs text-slate-400">
            CYCLE {String(currentBlockIndex + 1).padStart(2, '0')} / {String(blocks.length).padStart(2, '0')}
          </div>
          {linkedChapterId && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/80 border border-violet-500 text-violet-300 font-mono font-bold">
              CBSE SYLLABUS LINKED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenPresetBuilder()}
            className="px-2.5 py-1 rounded text-xs font-mono font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
          >
            CONFIGURE PRESETS
          </button>
          <button
            onClick={() => toggleFocusEnvironment(true)}
            title="Enter Focus Environment (F)"
            className="p-1.5 rounded text-xs font-mono border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-[10px]">ENV [F]</span>
          </button>
        </div>
      </div>

      {/* Main Focus Chamber Card */}
      <div className={`p-8 sm:p-12 rounded-xl border text-center relative overflow-hidden transition-all ${
        whiteRoomMode
          ? 'bg-black border-neutral-800 text-white'
          : 'bg-[#090b14] border-slate-800 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
      }`}>
        {/* Subtle background glow when running */}
        {!whiteRoomMode && timerStatus === 'RUNNING' && (
          <div className="absolute inset-0 bg-radial from-violet-950/20 via-transparent to-transparent pointer-events-none" />
        )}

        {/* Objective Display */}
        <div className="relative z-10 max-w-xl mx-auto mb-6">
          <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-1">
            TARGET DIRECTIVE
          </div>
          {isEditingObjective ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveObjective()}
                className="px-3 py-1.5 bg-slate-950 border border-violet-500 rounded font-mono text-sm text-white w-full max-w-md focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveObjective}
                className="px-3 py-1.5 rounded bg-violet-600 text-white font-mono text-xs font-bold"
              >
                SAVE
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setObjectiveInput(sessionObjective);
                setIsEditingObjective(true);
              }}
              title="Click to edit objective"
              className="text-base sm:text-lg font-bold tracking-wide text-slate-200 hover:text-white cursor-pointer px-4 py-1.5 rounded hover:bg-slate-900/60 transition inline-block border border-transparent hover:border-slate-800 font-mono"
            >
              {sessionObjective || 'Unspecified Objective'}
            </div>
          )}
        </div>

        {/* Current Block Label */}
        <div className="relative z-10 font-mono text-xs font-bold tracking-widest uppercase mb-4">
          <span className={`px-3 py-1 rounded border ${
            isFocusBlock
              ? 'bg-violet-950/60 border-violet-600 text-violet-300'
              : 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
          }`}>
            {currentBlock?.label || (isFocusBlock ? 'DEEP WORK FOCUS' : 'REST INTERVAL')}
          </span>
        </div>

        {/* Big Monospace Timer Display */}
        <div className="relative z-10 my-4 sm:my-8 font-mono font-bold text-6xl sm:text-8xl tracking-tight select-none">
          <span className={isFocusBlock ? 'text-white' : 'text-emerald-300'}>
            {formatTime(secondsRemaining)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 max-w-md mx-auto my-6">
          <div className="h-2 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isFocusBlock ? 'bg-violet-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mt-2">
            <span>{progressPercent}% EXECUTED</span>
            <span>{currentBlock?.durationMinutes}M TOTAL</span>
          </div>
        </div>

        {/* Next Block Teaser */}
        {nextBlock && (
          <div className="relative z-10 text-[11px] font-mono text-slate-400 mb-8">
            NEXT: <span className="text-slate-300 uppercase font-semibold">{nextBlock.label} ({nextBlock.durationMinutes}M)</span>
          </div>
        )}

        {/* Main Controls Row */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4 border-t border-slate-800/80 max-w-md mx-auto">
          {timerStatus === 'IDLE' ? (
            <button
              onClick={() => startSession()}
              className="px-8 py-3 rounded-lg font-mono text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-2 transition shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ENGAGE FOCUS [SPACE]</span>
            </button>
          ) : timerStatus === 'RUNNING' || timerStatus === 'BREAK' ? (
            <button
              onClick={handlePauseClick}
              className="px-6 py-2.5 rounded-lg font-mono text-xs font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSE [SPACE]</span>
            </button>
          ) : (
            <button
              onClick={resumeSession}
              className="px-6 py-2.5 rounded-lg font-mono text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RESUME [SPACE]</span>
            </button>
          )}

          {timerStatus !== 'IDLE' && (
            <>
              <button
                onClick={skipBlock}
                title="Skip Block (S)"
                className="px-4 py-2.5 rounded-lg font-mono text-xs font-bold border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 flex items-center gap-1.5 transition"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>SKIP [S]</span>
              </button>

              <button
                onClick={onOpenReviewModal}
                className="px-5 py-2.5 rounded-lg font-mono text-xs font-bold border border-emerald-600/80 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>COMPLETE</span>
              </button>

              <button
                onClick={resetSession}
                title="Reset (R)"
                className="p-2.5 rounded-lg font-mono text-xs border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Active Pause Tracker Statistics */}
        {pauses.length > 0 && (
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-center gap-6 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>PAUSES: <strong className="text-white">{pauses.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>TOTAL PAUSED: <strong className="text-white">{formatTime(totalPauseSeconds)}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Pause Reason Dialog Modal */}
      {showPauseReasonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e101a] border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 font-mono shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>INTERRUPT PROTOCOL // RECORD PAUSE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every pause is tracked analytically. Optionally record why this session was interrupted to diagnose time-waste patterns later.
            </p>
            <input
              type="text"
              placeholder="e.g. Phone notification, physical distraction, urgent call..."
              value={pauseReasonInput}
              onChange={(e) => setPauseReasonInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmPause()}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={skipPauseReason}
                className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 text-slate-400 text-xs hover:text-white"
              >
                PAUSE WITHOUT NOTE
              </button>
              <button
                onClick={confirmPause}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
              >
                RECORD & PAUSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
