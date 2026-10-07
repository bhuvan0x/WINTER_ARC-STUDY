import React from 'react';
import { FocusBlockConfig } from '../../types/focus';
import { Check, Clock, Coffee, Sparkles } from 'lucide-react';

interface CycleTimelineBarProps {
  blocks: FocusBlockConfig[];
  currentBlockIndex: number;
  whiteRoomMode?: boolean;
}

export const CycleTimelineBar: React.FC<CycleTimelineBarProps> = ({
  blocks,
  currentBlockIndex,
  whiteRoomMode = false,
}) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="w-full my-4">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
        <span>SESSION TIMELINE ARCHITECTURE</span>
        <span>
          CYCLE {currentBlockIndex + 1} OF {blocks.length}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {blocks.map((block, idx) => {
          const isDone = idx < currentBlockIndex;
          const isCurrent = idx === currentBlockIndex;
          const isUpcoming = idx > currentBlockIndex;
          const isFocus = block.type === 'FOCUS';

          return (
            <div
              key={block.id || idx}
              className={`flex-1 min-w-[120px] p-2.5 rounded-lg border font-mono transition-all relative ${
                isCurrent
                  ? isFocus
                    ? 'bg-violet-950/60 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.25)] text-white'
                    : 'bg-emerald-950/60 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white'
                  : isDone
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-80'
                  : 'bg-slate-950/40 border-slate-900 text-slate-400'
              }`}
            >
              {/* Header inside pill */}
              <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                <span className="flex items-center gap-1">
                  {isDone ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : isFocus ? (
                    <Clock className={`w-3 h-3 ${isCurrent ? 'text-violet-400' : 'text-slate-500'}`} />
                  ) : (
                    <Coffee className={`w-3 h-3 ${isCurrent ? 'text-emerald-400' : 'text-slate-500'}`} />
                  )}
                  <span>
                    {String(idx + 1).padStart(2, '0')}. {isFocus ? 'FOCUS' : 'BREAK'}
                  </span>
                </span>

                <span
                  className={`text-[9px] px-1 rounded ${
                    isCurrent
                      ? 'bg-white/20 text-white font-black animate-pulse'
                      : isDone
                      ? 'bg-emerald-950 text-emerald-300'
                      : 'text-slate-500'
                  }`}
                >
                  {isCurrent ? 'ACTIVE' : isDone ? 'DONE' : `${block.durationMinutes}M`}
                </span>
              </div>

              {/* Label & duration */}
              <div className="mt-1 flex items-center justify-between text-[11px] truncate">
                <span className="truncate font-semibold text-slate-200">{block.label}</span>
                <span className="text-[10px] font-mono text-slate-400 ml-1">{block.durationMinutes}m</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
