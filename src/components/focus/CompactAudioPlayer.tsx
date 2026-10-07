import React, { useEffect, useRef, useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import { getVisualizerData } from '../../utils/proceduralAudio';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Music,
} from 'lucide-react';

export const CompactAudioPlayer: React.FC = () => {
  const {
    activeTrack,
    activePlaylist,
    isPlayingAudio,
    togglePlayAudio,
    nextTrack,
    prevTrack,
    volume,
    setAudioVolume,
    muted,
    toggleMuteAudio,
    audioSettings,
  } = useFocus();

  const { whiteRoomMode } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle audio visualizer animation loop
  useEffect(() => {
    if (whiteRoomMode || !audioSettings.visualizerEnabled) return;
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          if (isPlayingAudio) {
            const data = getVisualizerData();
            const barWidth = 3;
            const barGap = 2;
            const barCount = Math.floor(width / (barWidth + barGap));

            for (let i = 0; i < barCount; i++) {
              const val = data[i % data.length] || 0;
              const barHeight = Math.max(2, (val / 255) * height);
              const x = i * (barWidth + barGap);
              const y = height - barHeight;

              ctx.fillStyle = 'rgba(139, 92, 246, 0.45)'; // soft violet
              ctx.fillRect(x, y, barWidth, barHeight);
            }
          } else {
            // Flat calm baseline
            ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
            ctx.fillRect(0, height - 2, width, 2);
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlayingAudio, whiteRoomMode, audioSettings.visualizerEnabled]);

  if (!activeTrack) return null;

  return (
    <div className={`rounded-xl border p-3.5 sm:p-4 font-mono transition-all max-w-4xl mx-auto ${
      whiteRoomMode
        ? 'bg-black border-neutral-800 text-neutral-300'
        : 'bg-[#090a12]/95 border-slate-800 text-slate-300 shadow-lg'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Track & Playlist Info + Visualizer Canvas */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-violet-400">
            <Music className="w-4 h-4" />
          </div>

          <div>
            <div className="text-xs font-bold text-white tracking-wide truncate max-w-[220px]">
              {activeTrack.title}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              PLAYLIST: {activePlaylist?.name || 'STANDALONE'}
            </div>
          </div>

          {/* Real-time ambient visualizer */}
          {!whiteRoomMode && audioSettings.visualizerEnabled && (
            <div className="hidden sm:block ml-2">
              <canvas
                ref={canvasRef}
                width={80}
                height={20}
                className="rounded overflow-hidden"
              />
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevTrack}
            className="p-1.5 rounded text-slate-400 hover:text-white transition"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayAudio}
            className="p-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition shadow-[0_0_12px_rgba(139,92,246,0.25)]"
            title={isPlayingAudio ? 'Pause audio' : 'Play audio'}
          >
            {isPlayingAudio ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded text-slate-400 hover:text-white transition"
            title="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Mute Slider */}
        <div className="flex items-center gap-2 min-w-[150px]">
          <button
            onClick={toggleMuteAudio}
            className="text-slate-400 hover:text-white transition"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : volume}
            onChange={(e) => setAudioVolume(Number(e.target.value))}
            className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />

          <span className="text-[10px] text-slate-500 w-7 text-right">
            {muted ? '0%' : `${volume}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
