import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { playSuccessChime, playFocusStartChime } from '../../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Crosshair,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const FocusView: React.FC = () => {
  const {
    tasks,
    currentPlan,
    recordFocusSession,
    toggleTaskComplete,
    whiteRoomMode,
    toggleWhiteRoomMode,
    settings,
  } = useApp();

  // Timer presets in minutes
  type PresetType = '25/5' | '50/10' | '90/15' | 'CUSTOM';
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('50/10');
  const [sessionMinutes, setSessionMinutes] = useState(50);
  const [customInput, setCustomInput] = useState(50);

  // Timer running state
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Set default task from active tasks
  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      const active = tasks.find((t) => !t.completed);
      if (active) setSelectedTaskId(active.id);
    }
  }, [tasks, selectedTaskId]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const nextTask = tasks.find((t) => !t.completed && t.id !== selectedTaskId);

  // Handle Preset selection
  const handleSelectPreset = (preset: PresetType) => {
    setIsRunning(false);
    setSelectedPreset(preset);
    setIsBreak(false);

    let mins = 50;
    if (preset === '25/5') mins = 25;
    if (preset === '50/10') mins = 50;
    if (preset === '90/15') mins = 90;
    if (preset === 'CUSTOM') mins = customInput;

    setSessionMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const handleCustomApply = () => {
    const mins = Math.max(1, Math.min(240, Number(customInput) || 30));
    setSessionMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsRunning(false);
  };

  // Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      // Session finished
      setIsRunning(false);
      handleSessionCompleted();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining]);

  const handleStart = () => {
    setIsRunning(true);
    if (settings.soundEffects) playFocusStartChime();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(sessionMinutes * 60);
  };

  const handleSessionCompleted = async () => {
    if (settings.soundEffects) playSuccessChime();

    // Record session to IndexedDB
    const typeMapping = {
      '25/5': 'POMODORO_25',
      '50/10': 'POMODORO_50',
      '90/15': 'POMODORO_90',
      CUSTOM: 'CUSTOM',
    } as const;

    await recordFocusSession({
      date: new Date().toISOString().split('T')[0],
      taskId: selectedTask?.id,
      taskTitle: selectedTask?.title || currentPlan.primaryObjective,
      durationMinutes: sessionMinutes,
      type: typeMapping[selectedPreset] || 'CUSTOM',
      completedAt: new Date().toISOString(),
      notes: isBreak ? 'Break cycle' : 'Deep work block executed',
    });

    // Toggle break phase if preset supports it
    if (!isBreak) {
      let breakMins = 5;
      if (selectedPreset === '50/10') breakMins = 10;
      if (selectedPreset === '90/15') breakMins = 15;
      setIsBreak(true);
      setSecondsRemaining(breakMins * 60);
    } else {
      setIsBreak(false);
      setSecondsRemaining(sessionMinutes * 60);
    }
  };

  const handleCompleteCurrentTask = async () => {
    if (selectedTask) {
      await toggleTaskComplete(selectedTask.id);
    }
    await handleSessionCompleted();
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalSecs = sessionMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((totalSecs - secondsRemaining) / totalSecs) * 100)));

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  return (
    <div className={`min-h-[80vh] flex flex-col justify-between font-mono max-w-4xl mx-auto p-4 sm:p-8 rounded-lg border transition-colors ${
      whiteRoomMode
        ? 'bg-black text-white border-neutral-800'
        : 'bg-[#080910] text-slate-100 border-slate-800 shadow-2xl'
    }`}>
      {/* 1. Control Header: Presets, White Room Toggle, Fullscreen */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold tracking-widest text-white uppercase">
            WHITE ROOM // DEEP FOCUS CHAMBER
          </span>
          <span className="text-[10px] text-neutral-400">白部屋集中</span>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['25/5', '50/10', '90/15', 'CUSTOM'] as PresetType[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                selectedPreset === preset
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              {preset}
            </button>
          ))}

          {selectedPreset === 'CUSTOM' && (
            <div className="flex items-center gap-1 ml-1">
              <input
                type="number"
                min="1"
                max="240"
                value={customInput}
                onChange={(e) => setCustomInput(Number(e.target.value))}
                className="w-14 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-xs text-white text-center focus:outline-none"
              />
              <button
                onClick={handleCustomApply}
                className="px-2 py-0.5 rounded bg-neutral-800 text-xs text-neutral-200 hover:bg-neutral-700"
              >
                SET
              </button>
            </div>
          )}

          <button
            onClick={toggleFullScreen}
            className="p-1.5 rounded border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white ml-2"
            title="Toggle Browser Fullscreen"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Tactical Objective Display */}
      <div className="my-8 text-center space-y-3">
        <div className="text-[11px] uppercase tracking-widest text-neutral-400">
          {isBreak ? 'RECOVERY & COGNITIVE RESET' : 'CURRENT OPERATIONAL OBJECTIVE'}
        </div>

        {/* Task selector / Objective display */}
        <div className="max-w-xl mx-auto">
          {isBreak ? (
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-emerald-400">
              RECOVER & HYDRATE // REST INTERVAL
            </h2>
          ) : selectedTask ? (
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-sans text-white tracking-tight">
                {selectedTask.title}
              </h2>
              {selectedTask.description && (
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  {selectedTask.description}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white">
                "{currentPlan.primaryObjective || 'Execute the plan. No negotiation.'}"
              </h2>
            </div>
          )}
        </div>

        {/* Task selector dropdown if multiple tasks available */}
        {tasks.length > 0 && !isBreak && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-[10px] text-neutral-400">BIND TO TASK:</span>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none"
            >
              <option value="">General Objective</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.completed ? '✓ ' : ''}[{t.startTime}] {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Monolithic Digital Countdown Clock */}
      <div className="my-6 text-center">
        <div className="text-[11px] text-neutral-400 uppercase tracking-widest mb-2">
          TIME REMAINING
        </div>

        <div className="text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-white tabular-nums select-none">
          {formatTime(secondsRemaining)}
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mt-6">
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>PROGRESS</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-neutral-950 border border-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isBreak ? 'bg-emerald-400' : 'bg-white'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Tactical Control Bar: Start / Pause / Reset / Complete */}
      <div className="my-6 flex flex-wrap items-center justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded font-bold text-xs bg-white text-black hover:bg-neutral-200 flex items-center gap-2 shadow-lg transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START EXECUTION</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-6 py-3 rounded font-bold text-xs bg-neutral-800 text-white hover:bg-neutral-700 flex items-center gap-2 transition"
          >
            <Pause className="w-4 h-4" />
            <span>PAUSE SESSION</span>
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-4 py-3 rounded text-xs border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white flex items-center gap-1.5 transition"
          title="Reset Timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>

        <button
          onClick={handleCompleteCurrentTask}
          className="px-5 py-3 rounded text-xs border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-bold flex items-center gap-2 transition"
          title="Mark Current Block Finished & Log Session"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>[ COMPLETE BLOCK ]</span>
        </button>
      </div>

      {/* 5. Next Task Preview Footer */}
      <div className="border-t border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400 uppercase">NEXT TARGET:</span>
          {nextTask ? (
            <span className="text-neutral-200 font-semibold font-sans">
              [{nextTask.startTime}] {nextTask.title}
            </span>
          ) : (
            <span className="text-neutral-400 italic">No further targets pending</span>
          )}
        </div>

        <div className="text-[10px] text-neutral-400 tracking-wider">
          AYANOKOJI DIRECTIVE: ZERO NEGOTIATION. TOTAL COGNITIVE IMMERSION.
        </div>
      </div>
    </div>
  );
};
