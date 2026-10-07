import React, { useEffect, useRef } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import { getVisualizerData } from '../../utils/proceduralAudio';
import { Volume2, VolumeX, Sparkles, Play, Pause, Waves } from 'lucide-react';
import { AudioTrack } from '../../types/focus';

export const WaveformVisualizer: React.FC = () => {
  const {
    activeTrack,
    isPlayingAudio,
    togglePlayAudio,
    playTrack,
    tracks,
    volume,
    setAudioVolume,
    muted,
    toggleMuteAudio,
  } = useFocus();

  const { whiteRoomMode } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Top quick-access procedural presets
  const quickPresets = tracks
    .filter((t) => t.category === 'BINAURAL' || t.category === 'NATURE' || t.category === 'CONCENTRATION')
    .slice(0, 6);

  useEffect(() => {
    let animId: number;
    let phase = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (isPlayingAudio) {
        // Real frequency spectrum data from Web Audio Analyser
        const freqData = getVisualizerData();
        const barCount = 48;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width / barCount) * 0.35;

        // Draw spectrum bars
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * freqData.length);
          const rawVal = freqData[dataIndex] || 0;
          const barHeight = Math.max(3, (rawVal / 255) * (height - 8));
          const x = i * (barWidth + gap) + 4;
          const y = (height - barHeight) / 2;

          // Gradient color: violet to cyan
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, 'rgba(167, 139, 250, 0.9)'); // violet-400
          grad.addColorStop(1, 'rgba(124, 58, 237, 0.4)'); // violet-700

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }

        // Overlay smooth continuous oscilloscope curve
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(196, 181, 253, 0.7)';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < width; x += 4) {
          const index = Math.floor((x / width) * freqData.length);
          const val = (freqData[index] || 128) / 255;
          const y = height / 2 + (val - 0.5) * (height * 0.7) * Math.sin(x * 0.05 + phase);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        phase += 0.08;
      } else {
        // Idle gentle cybernetic sine pulse
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.lineWidth = 1.5;

        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.04 + phase) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        phase += 0.03;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlayingAudio, whiteRoomMode]);

  return (
    <div
      className={`rounded-lg border p-4 font-mono transition-all ${
        whiteRoomMode
          ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
          : 'bg-[#080a14]/90 border-slate-800 text-slate-300 shadow-md'
      }`}
    >
      {/* Visualizer header & info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white tracking-wider uppercase">
            PROCEDURAL AUDIO FREQUENCY
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400">
            {activeTrack?.title || 'Standby // Select Soundscape'}
          </span>
        </div>

        {/* Play/Pause & Mute controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayAudio}
            className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition ${
              isPlayingAudio
                ? 'bg-violet-600 hover:bg-violet-500 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>ACTIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ENGAGE</span>
              </>
            )}
          </button>

          <button
            onClick={toggleMuteAudio}
            className="p-1 rounded text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : volume}
            onChange={(e) => setAudioVolume(Number(e.target.value))}
            className="w-16 h-1 bg-slate-800 accent-violet-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Real-time Oscilloscope & Spectrum Canvas */}
      <div className="w-full h-12 bg-slate-950/90 rounded border border-slate-800/80 overflow-hidden relative mb-3">
        <canvas ref={canvasRef} width={640} height={48} className="w-full h-full block" />
      </div>

      {/* Quick Soundscape Presets Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
        <span className="text-slate-500 uppercase tracking-widest text-[9px] mr-1 whitespace-nowrap">
          QUICK AMBIENCE:
        </span>
        {quickPresets.map((t) => {
          const isSelected = activeTrack?.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                playTrack(t);
              }}
              className={`px-2 py-0.5 rounded border whitespace-nowrap font-mono transition ${
                isSelected && isPlayingAudio
                  ? 'bg-violet-950/90 border-violet-500 text-violet-200 font-bold shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : isSelected
                  ? 'bg-slate-900 border-violet-800 text-violet-300'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};
