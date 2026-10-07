import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  Volume2,
  Clock,
  Database,
  ArrowRight,
  ExternalLink,
  Layers,
  Cpu,
} from 'lucide-react';

interface FeatureCompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureCompendiumModal: React.FC<FeatureCompendiumModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setActiveView, whiteRoomMode } = useApp();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FOCUS' | 'ACADEMICS' | 'LOCALFIRST'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-mono">
      <div
        className={`w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden my-auto transition-all ${
          whiteRoomMode
            ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
            : 'bg-[#090b14] border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/50 flex items-center justify-center text-violet-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wider text-white flex items-center gap-2">
                <span>SYSTEM SPECIFICATION & ARCHITECTURE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/80 border border-violet-700 text-violet-300">
                  v3.0 // ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Winter Arc Operational Capabilities & Integrated Systems
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 sm:px-6 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'OVERVIEW'
                ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>01. DISCIPLINE HUD & PLANNER</span>
          </button>

          <button
            onClick={() => setActiveTab('FOCUS')}
            className={`px-4 sm:px-6 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'FOCUS'
                ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>02. FOCUS LAB & AUDIO ENGINE</span>
          </button>

          <button
            onClick={() => setActiveTab('ACADEMICS')}
            className={`px-4 sm:px-6 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'ACADEMICS'
                ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>03. NCERT ACADEMICS (9–12)</span>
          </button>

          <button
            onClick={() => setActiveTab('LOCALFIRST')}
            className={`px-4 sm:px-6 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'LOCALFIRST'
                ? 'border-violet-500 text-violet-300 bg-violet-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>04. LOCAL-FIRST SOVEREIGNTY</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Feature Showcase Banner */}
              <div className="rounded-xl border border-slate-800 overflow-hidden relative group">
                <img
                  src="/src/assets/images/winter_arc_overview_1791395861665.jpg"
                  alt="Winter Arc System Overview"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[380px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="font-bold text-white drop-shadow">
                    WINTER ARC // TACTICAL COMMAND DASHBOARD & DISCIPLINE DIAL
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-slate-300 text-[10px]">
                    LIVE SYSTEM PREVIEW
                  </span>
                </div>
              </div>

              {/* Key Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-violet-400" />
                    <span>MATHEMATICAL DISCIPLINE SCORE (0–100)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Algorithmic calculation combining Task Execution (35%), Schedule Adherence (20%), Academic Syllabus Mastery (20%), Focus Lab Consistency (15%), and Non-Negotiable Directives (10%).
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <span>DAY TYPE INTELLIGENCE & TIMELINE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Automatic dynamic scheduling for School Days, Holidays, Coaching Days, and Custom Protocols. Includes time budget allocation and live execution beacons.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition"
                >
                  <span>OPEN DASHBOARD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'FOCUS' && (
            <div className="space-y-6">
              {/* Feature Showcase Banner */}
              <div className="rounded-xl border border-slate-800 overflow-hidden relative group">
                <img
                  src="/src/assets/images/focus_lab_system_1791395872495.jpg"
                  alt="Focus Lab and Audio Engine"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[380px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="font-bold text-white drop-shadow">
                    FOCUS LAB // RADIAL POMODORO ENGINE & PROCEDURAL AUDIO SYNTHESIZER
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-slate-300 text-[10px]">
                    WEB AUDIO API & OSCILLOSCOPE
                  </span>
                </div>
              </div>

              {/* Key Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>THROTTLING-PROOF TIMESTAMP ACCURACY</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Uses target delta timestamps (<code className="text-violet-300">targetEndTimestamp - currentTimestamp</code>) to maintain second-perfect accuracy across background tabs, browser minimization, and OS sleep.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PROCEDURAL MATHEMATICAL SOUNDSCAPES</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    100% offline Web Audio synthesizers: 40 Hz Gamma Binaural Beats, low-frequency drones, rain soundscapes, forest wind, ocean surge, and pink/brown noise with zero copyrighted audio.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setActiveView('focus');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition"
                >
                  <span>LAUNCH FOCUS LAB</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ACADEMICS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-violet-300">
                  NCERT CLASS 9–12 CURRICULUM ARCHITECTURE
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Complete chapter database covering Physics, Chemistry, Mathematics, and Biology with CBSE difficulty ratings, concept density weighting, and 5-stage readiness tracking:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] pt-1">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    1. NOT STARTED
                  </div>
                  <div className="p-2 rounded bg-blue-950/60 border border-blue-800 text-blue-300">
                    2. THEORY
                  </div>
                  <div className="p-2 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                    3. PRACTICE
                  </div>
                  <div className="p-2 rounded bg-indigo-950/60 border border-indigo-800 text-indigo-300">
                    4. PYQ SOLVED
                  </div>
                  <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                    5. MASTERED
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setActiveView('academics');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition"
                >
                  <span>OPEN ACADEMIC COMMAND CENTER</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'LOCALFIRST' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-violet-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>DATA SOVEREIGNTY & ZERO-SURVEILLANCE GUARANTEE</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Winter Arc operates under strict sovereign software principles:
                </p>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>IndexedDB Persistence:</strong> Stored locally in your browser storage sandbox.</li>
                  <li><strong>No Remote Uploads:</strong> Audio files and personal notes never leave your machine.</li>
                  <li><strong>Full Portability:</strong> Complete JSON backup and restore anytime via Settings.</li>
                  <li><strong>Zero Cloud Telemetry:</strong> No analytics trackers, no ad networks, no third-party scripts.</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setActiveView('settings');
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center gap-2 transition"
                >
                  <span>MANAGE BACKUPS IN SETTINGS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-[11px]">
            &ldquo;Do not measure motivation. Measure execution.&rdquo;
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold transition"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
