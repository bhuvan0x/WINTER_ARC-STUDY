import React from 'react';
import { useApp } from '../../context/AppContext';
import { Command, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { whiteRoomMode } = useApp();

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Pause / Resume Active Focus Block' },
    { key: 'F', desc: 'Engage Focus Environment / Focus Lab' },
    { key: 'S', desc: 'Skip Current Focus or Break Block' },
    { key: 'R', desc: 'Reset Active Focus Protocol' },
    { key: 'M', desc: 'Mute / Unmute Focus Audio' },
    { key: 'N', desc: 'Next Audio Track in Playlist' },
    { key: 'C', desc: 'Academic Command Center (CBSE / NCERT)' },
    { key: 'P', desc: 'Navigate to Tactical Planner' },
    { key: 'D', desc: 'Navigate to Command Dashboard' },
    { key: 'A', desc: 'Navigate to Analytics Matrix' },
    { key: 'Esc', desc: 'Exit Focus Environment / Close Dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-lg border shadow-2xl p-6 font-mono text-xs transition-colors ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
          : 'bg-[#0b0d18] border-violet-500/30 text-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-violet-400" />
            <span className="font-bold tracking-wider text-white">KEYBOARD PROTOCOLS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded bg-slate-950/70 border border-slate-800/80"
            >
              <span className="text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-violet-300 font-bold text-[11px] shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 text-center">
          Rapid single-key command binds for high-speed discipline workflows.
        </div>
      </div>
    </div>
  );
};
