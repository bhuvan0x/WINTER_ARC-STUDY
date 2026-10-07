import React from 'react';
import { FocusBlockConfig, FocusTimerStatus } from '../../types/focus';

interface CircularTimerRingProps {
  secondsRemaining: number;
  totalBlockSeconds: number;
  currentBlock: FocusBlockConfig;
  currentBlockIndex: number;
  totalBlocks: number;
  timerStatus: FocusTimerStatus;
  whiteRoomMode?: boolean;
}

export const CircularTimerRing: React.FC<CircularTimerRingProps> = ({
  secondsRemaining,
  totalBlockSeconds,
  currentBlock,
  currentBlockIndex,
  totalBlocks,
  timerStatus,
  whiteRoomMode = false,
}) => {
  const isFocusBlock = currentBlock?.type === 'FOCUS';
  const isBreakBlock = currentBlock?.type === 'SHORT_BREAK' || currentBlock?.type === 'LONG_BREAK';

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(((totalBlockSeconds - secondsRemaining) / Math.max(1, totalBlockSeconds)) * 100)
    )
  );

  // SVG dimensions
  const size = 300;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Format HH:MM:SS or MM:SS
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const timeString =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Theme colors
  const activeColor = isFocusBlock
    ? '#8b5cf6' // Violet
    : isBreakBlock
    ? '#10b981' // Emerald
    : '#38bdf8'; // Sky

  const statusColor =
    timerStatus === 'RUNNING'
      ? activeColor
      : timerStatus === 'BREAK'
      ? '#10b981'
      : timerStatus === 'PAUSED'
      ? '#f59e0b'
      : '#64748b';

  return (
    <div className="relative flex flex-col items-center justify-center my-4 select-none">
      {/* Outer ambient glow effect */}
      {!whiteRoomMode && timerStatus === 'RUNNING' && (
        <div
          className="absolute w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-25"
          style={{ backgroundColor: activeColor }}
        />
      )}

      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle calibrated tick ring */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i * 6 * Math.PI) / 180;
          const isMajor = i % 5 === 0;
          const tickLen = isMajor ? 8 : 4;
          const r1 = radius + 14;
          const r2 = r1 - tickLen;
          const x1 = center + r1 * Math.cos(angle);
          const y1 = center + r1 * Math.sin(angle);
          const x2 = center + r2 * Math.cos(angle);
          const y2 = center + r2 * Math.sin(angle);

          const isPassed = (i / 60) * 100 <= progressPercent;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={
                isPassed
                  ? activeColor
                  : isMajor
                  ? 'rgba(148, 163, 184, 0.25)'
                  : 'rgba(100, 116, 139, 0.12)'
              }
              strokeWidth={isMajor ? 1.5 : 1}
            />
          );
        })}

        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={whiteRoomMode ? '#262626' : 'rgba(255, 255, 255, 0.05)'}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Active progress arc with smooth transitions */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={isFocusBlock ? 'url(#focusGradient)' : 'url(#breakGradient)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          filter={!whiteRoomMode ? 'url(#timerGlow)' : undefined}
          className="transition-all duration-700 ease-linear"
        />
      </svg>

      {/* Centerpiece Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
        {/* Cycle & Status badge */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full transition-colors"
            style={{ backgroundColor: statusColor }}
          />
          <span className="font-mono text-[10px] tracking-widest text-slate-400 font-bold uppercase">
            CYCLE {String(currentBlockIndex + 1).padStart(2, '0')}/{String(totalBlocks).padStart(2, '0')}
          </span>
        </div>

        {/* Dominant Monospace Digital Time */}
        <div
          className={`font-mono font-black text-5xl sm:text-6xl tracking-tight transition-colors ${
            isFocusBlock ? 'text-white' : 'text-emerald-300'
          }`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {timeString}
        </div>

        {/* Block descriptor */}
        <div className="mt-1 font-mono text-[11px] font-bold tracking-widest uppercase text-slate-300">
          {currentBlock?.label || (isFocusBlock ? 'DEEP WORK' : 'RECOVERY')}
        </div>

        {/* Percentage badge */}
        <div className="mt-2 font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800">
          {progressPercent}% EXECUTED · {currentBlock?.durationMinutes}M TOTAL
        </div>
      </div>
    </div>
  );
};
