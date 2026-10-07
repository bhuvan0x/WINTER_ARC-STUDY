import React, { useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import { FocusBlockConfig, PresetFocusType } from '../../types/focus';
import { getBlocksForPreset } from '../../utils/focusPresets';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Sparkles,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';

export const SessionBuilder: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const {
    activePreset,
    setActivePreset,
    blocks,
    setCustomBlocks,
    startSession,
    sessionObjective,
  } = useFocus();

  const { whiteRoomMode } = useApp();
  const [localBlocks, setLocalBlocks] = useState<FocusBlockConfig[]>(blocks);

  const presets: { type: PresetFocusType; title: string; subtitle: string; icon: string }[] = [
    {
      type: 'UNIVERSAL',
      title: 'UNIVERSAL FOCUS',
      subtitle: '3-Hour Balanced Master Protocol: 50m Focus / 10m Break × 3',
      icon: '⚡',
    },
    {
      type: 'CLASSIC',
      title: 'CLASSIC POMODORO',
      subtitle: '25 min focus / 5 min tactical recovery',
      icon: '⏱️',
    },
    {
      type: 'EXTENDED',
      title: 'EXTENDED PROTOCOL',
      subtitle: '50 min focus / 10 min break',
      icon: '🎯',
    },
    {
      type: 'DEEP_WORK',
      title: 'DEEP WORK CYCLE',
      subtitle: '90 min intensive deep work / 15 min mental recharge',
      icon: '🧠',
    },
    {
      type: 'ULTRA_FOCUS',
      title: 'ULTRA FOCUS',
      subtitle: '90 / 15 min × 2 consecutive blocks',
      icon: '🔥',
    },
  ];

  const handleSelectPreset = (p: PresetFocusType) => {
    setActivePreset(p);
    const generated = getBlocksForPreset(p);
    setLocalBlocks(generated);
  };

  const handleAddFocusBlock = () => {
    const newBlock: FocusBlockConfig = {
      id: `b_${Date.now()}`,
      type: 'FOCUS',
      durationMinutes: 50,
      label: `Focus Block ${localBlocks.filter((b) => b.type === 'FOCUS').length + 1}`,
    };
    const updated = [...localBlocks, newBlock];
    setLocalBlocks(updated);
    setCustomBlocks(updated);
  };

  const handleAddBreakBlock = () => {
    const newBlock: FocusBlockConfig = {
      id: `b_${Date.now()}`,
      type: 'SHORT_BREAK',
      durationMinutes: 10,
      label: 'Recovery Break',
    };
    const updated = [...localBlocks, newBlock];
    setLocalBlocks(updated);
    setCustomBlocks(updated);
  };

  const handleRemoveBlock = (index: number) => {
    if (localBlocks.length <= 1) return;
    const updated = localBlocks.filter((_, i) => i !== index);
    setLocalBlocks(updated);
    setCustomBlocks(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...localBlocks];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setLocalBlocks(updated);
    setCustomBlocks(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === localBlocks.length - 1) return;
    const updated = [...localBlocks];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setLocalBlocks(updated);
    setCustomBlocks(updated);
  };

  const handleDurationChange = (index: number, newMins: number) => {
    const clamped = Math.max(1, Math.min(240, newMins));
    const updated = localBlocks.map((b, i) =>
      i === index ? { ...b, durationMinutes: clamped } : b
    );
    setLocalBlocks(updated);
    setCustomBlocks(updated);
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    const updated = localBlocks.map((b, i) =>
      i === index ? { ...b, label: newLabel } : b
    );
    setLocalBlocks(updated);
    setCustomBlocks(updated);
  };

  const totalFocusMins = localBlocks
    .filter((b) => b.type === 'FOCUS')
    .reduce((sum, b) => sum + b.durationMinutes, 0);

  const totalBreakMins = localBlocks
    .filter((b) => b.type !== 'FOCUS')
    .reduce((sum, b) => sum + b.durationMinutes, 0);

  const handleLaunch = () => {
    startSession(sessionObjective, 'CUSTOM', localBlocks);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Universal Presets Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
          01. ARCHITECTURAL PRESETS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p) => {
            const isSelected = activePreset === p.type;
            return (
              <button
                key={p.type}
                onClick={() => handleSelectPreset(p.type)}
                className={`p-4 rounded-lg border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-violet-950/60 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'bg-[#0a0c16] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      {p.title}
                    </span>
                    <span className="text-xs">{p.icon}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    {p.subtitle}
                  </p>
                </div>
                {isSelected && (
                  <div className="mt-3 text-[10px] font-mono text-violet-300 font-bold flex items-center gap-1">
                    <span>ACTIVE PROTOCOL</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Block Sequence Builder */}
      <div className={`p-6 rounded-xl border space-y-4 ${
        whiteRoomMode
          ? 'bg-black border-neutral-800'
          : 'bg-[#090b14] border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-slate-200 tracking-wider">
              02. CUSTOM SESSION TIMELINE ARCHITECTURE
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Total Duration: <strong className="text-white">{totalFocusMins + totalBreakMins}m</strong> (Focus: {totalFocusMins}m · Recovery: {totalBreakMins}m)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddFocusBlock}
              className="px-2.5 py-1.5 rounded bg-violet-950/60 hover:bg-violet-900/60 border border-violet-500 text-violet-200 font-mono text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD FOCUS</span>
            </button>
            <button
              onClick={handleAddBreakBlock}
              className="px-2.5 py-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500 text-emerald-200 font-mono text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD BREAK</span>
            </button>
          </div>
        </div>

        {/* Sequence Blocks List */}
        <div className="space-y-2">
          {localBlocks.map((block, idx) => {
            const isFocus = block.type === 'FOCUS';
            return (
              <div
                key={block.id}
                className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 font-mono transition ${
                  isFocus
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-emerald-950/20 border-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-bold w-6">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                    isFocus
                      ? 'bg-violet-950 border-violet-600 text-violet-300'
                      : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  }`}>
                    {block.type}
                  </span>
                  <input
                    type="text"
                    value={block.label}
                    onChange={(e) => handleLabelChange(idx, e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-violet-500 text-xs text-slate-200 focus:outline-none px-1 py-0.5"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {/* Duration input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="240"
                      value={block.durationMinutes}
                      onChange={(e) => handleDurationChange(idx, Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-center text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                    <span className="text-[11px] text-slate-400">MIN</span>
                  </div>

                  {/* Move Up/Down */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === localBlocks.length - 1}
                      className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Block */}
                  <button
                    onClick={() => handleRemoveBlock(idx)}
                    disabled={localBlocks.length <= 1}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 disabled:opacity-20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Visualization Bar */}
        <div className="pt-3">
          <div className="text-[11px] font-mono text-slate-400 mb-1.5">
            SESSION TIMELINE VISUALIZATION
          </div>
          <div className="h-4 rounded-md overflow-hidden flex bg-slate-950 border border-slate-800">
            {localBlocks.map((b, i) => {
              const total = totalFocusMins + totalBreakMins || 1;
              const widthPct = (b.durationMinutes / total) * 100;
              return (
                <div
                  key={b.id}
                  style={{ width: `${widthPct}%` }}
                  title={`${b.label}: ${b.durationMinutes}m`}
                  className={`h-full border-r border-black/40 ${
                    b.type === 'FOCUS' ? 'bg-violet-600' : 'bg-emerald-500'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleLaunch}
            className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>APPLY & ENGAGE CUSTOM PROTOCOL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
