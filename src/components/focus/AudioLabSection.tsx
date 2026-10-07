import React, { useState, useRef } from 'react';
import { useFocus } from '../../context/FocusContext';
import { useApp } from '../../context/AppContext';
import { AudioTrack, AudioPlaylist, AudioCategory, AudioSettings } from '../../types/focus';
import {
  Music,
  Plus,
  Upload,
  Play,
  Pause,
  Trash2,
  ListMusic,
  Sliders,
  ShieldCheck,
  Volume2,
  VolumeX,
  FileAudio,
  Shuffle,
  Repeat,
  Sparkles,
} from 'lucide-react';

export const AudioLabSection: React.FC = () => {
  const {
    tracks,
    playlists,
    activeTrack,
    activePlaylist,
    isPlayingAudio,
    playTrack,
    togglePlayAudio,
    selectPlaylist,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    importAudioFile,
    deleteImportedTrack,
    audioSettings,
    updateAudioSettings,
    volume,
    setAudioVolume,
    muted,
    toggleMuteAudio,
  } = useFocus();

  const { whiteRoomMode } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(activePlaylist?.id || playlists[0]?.id || '');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'ALL FREQUENCIES' },
    { id: 'BINAURAL', label: 'BINAURAL & SUB' },
    { id: 'CONCENTRATION', label: 'FOCUS NOISE' },
    { id: 'NATURE', label: 'ATMOSPHERIC NATURE' },
    { id: 'CALM', label: 'CALM HARMONICS' },
    { id: 'IMPORTED', label: 'IMPORTED AUDIO' },
  ];

  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

  const filteredTracks = tracks.filter((t) => {
    if (activeCategory === 'ALL') return true;
    return t.category === activeCategory;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      const track = await importAudioFile(file);
      setImportNotification(`Imported "${track.title}" locally into IndexedDB.`);
      setTimeout(() => setImportNotification(null), 4000);
    } catch (err) {
      console.warn('Audio import failed:', err);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const pl = await createPlaylist(newPlaylistName.trim());
    setSelectedPlaylistId(pl.id);
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handleToggleTrackInPlaylist = (trackId: string) => {
    if (!currentPlaylist) return;
    const exists = currentPlaylist.trackIds.includes(trackId);
    const updatedIds = exists
      ? currentPlaylist.trackIds.filter((id) => id !== trackId)
      : [...currentPlaylist.trackIds, trackId];

    updatePlaylist({
      ...currentPlaylist,
      trackIds: updatedIds,
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Synchronization Protocol Settings Card */}
      <div className={`p-6 rounded-xl border space-y-4 ${
        whiteRoomMode
          ? 'bg-black border-neutral-800'
          : 'bg-[#090b14] border-slate-800'
      }`}>
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-slate-300 border-b border-slate-800 pb-2">
          <Sliders className="w-4 h-4 text-violet-400" />
          <span>AUDIO & TIMER SYNCHRONIZATION BEHAVIOR</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Timing trigger */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-400 font-bold block">PLAYBACK WINDOW</label>
            <select
              value={audioSettings.playTiming}
              onChange={(e) =>
                updateAudioSettings({
                  playTiming: e.target.value as AudioSettings['playTiming'],
                })
              }
              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="FOCUS_ONLY">PLAY DURING FOCUS ONLY</option>
              <option value="FOCUS_AND_BREAKS">PLAY DURING FOCUS + BREAKS</option>
              <option value="STOP_ON_SESSION_END">STOP WHEN SESSION ENDS</option>
            </select>
            <span className="text-[10px] text-slate-500 block">
              Audio automatically syncs with Pomodoro timer transitions.
            </span>
          </div>

          {/* Pause trigger */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-400 font-bold block">PAUSE BEHAVIOR</label>
            <select
              value={audioSettings.pauseBehavior}
              onChange={(e) =>
                updateAudioSettings({
                  pauseBehavior: e.target.value as AudioSettings['pauseBehavior'],
                })
              }
              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="PAUSE_AUDIO">PAUSE AUDIO WITH TIMER</option>
              <option value="CONTINUE_AUDIO">CONTINUE AUDIO ON PAUSE</option>
            </select>
            <span className="text-[10px] text-slate-500 block">
              Controls whether pausing timer also mutes ambient background.
            </span>
          </div>

          {/* Fade Transitions */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
            <label className="text-slate-400 font-bold block">ACOUSTIC CROSSFADE</label>
            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
              <span>Fade Before Break</span>
              <button
                onClick={() =>
                  updateAudioSettings({ fadeBeforeBreak: !audioSettings.fadeBeforeBreak })
                }
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  audioSettings.fadeBeforeBreak
                    ? 'bg-violet-950 border-violet-500 text-violet-200'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {audioSettings.fadeBeforeBreak ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Fade In After Break</span>
              <button
                onClick={() =>
                  updateAudioSettings({ fadeAfterBreak: !audioSettings.fadeAfterBreak })
                }
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  audioSettings.fadeAfterBreak
                    ? 'bg-violet-950 border-violet-500 text-violet-200'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {audioSettings.fadeAfterBreak ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlists & Audio Library Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists Column (1 of 3) */}
        <div className={`p-5 rounded-xl border space-y-4 ${
          whiteRoomMode
            ? 'bg-black border-neutral-800'
            : 'bg-[#090b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300">
              <ListMusic className="w-4 h-4 text-violet-400" />
              <span>TACTICAL PLAYLISTS</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
              title="Create new playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {playlists.map((pl) => {
              const isSelected = selectedPlaylistId === pl.id;
              const isCurrentPlaying = activePlaylist?.id === pl.id && isPlayingAudio;
              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className={`p-3 rounded-lg border cursor-pointer font-mono transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-violet-950/60 border-violet-500 text-white'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{pl.name}</span>
                      {isCurrentPlaying && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {pl.trackIds.length} tracks · {pl.playbackMode}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectPlaylist(pl);
                      }}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                      title="Play playlist"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    {pl.id.startsWith('pl_') && !['pl_whiteroom', 'pl_rainstudy', 'pl_nightcoding', 'pl_deepfocus'].includes(pl.id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(pl.id);
                        }}
                        className="p-1.5 rounded text-rose-400 hover:text-rose-300"
                        title="Delete custom playlist"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Local Audio Importer trigger */}
          <div className="pt-2 border-t border-slate-800/80">
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-lg border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-300 font-mono text-xs flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>IMPORT PERSONAL AUDIO [MP3/FLAC]</span>
            </button>
            <span className="text-[10px] font-mono text-slate-500 block text-center mt-1">
              Stored 100% locally in IndexedDB. Zero server upload.
            </span>
          </div>

          {importNotification && (
            <div className="p-2 rounded bg-violet-950 border border-violet-500 font-mono text-[11px] text-violet-200">
              {importNotification}
            </div>
          )}
        </div>

        {/* Audio Tracks Catalog (2 of 3) */}
        <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${
          whiteRoomMode
            ? 'bg-black border-neutral-800'
            : 'bg-[#090b14] border-slate-800'
        }`}>
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold border transition ${
                  activeCategory === cat.id
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tracks List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredTracks.map((track) => {
              const isCurrentlyPlaying = activeTrack?.id === track.id && isPlayingAudio;
              const isInCurrentPlaylist = currentPlaylist?.trackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  className={`p-3.5 rounded-lg border transition font-mono flex flex-wrap items-center justify-between gap-3 ${
                    isCurrentlyPlaying
                      ? 'bg-violet-950/40 border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {track.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {track.category}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {track.subtitle}
                    </div>

                    {/* Licensing & Source Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="text-emerald-400/90 font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        {track.license}
                      </span>
                      <span>·</span>
                      <span>{track.source}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add to selected playlist checkbox */}
                    {currentPlaylist && (
                      <button
                        onClick={() => handleToggleTrackInPlaylist(track.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                          isInCurrentPlaylist
                            ? 'bg-violet-900 border-violet-500 text-violet-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={isInCurrentPlaylist ? 'Remove from playlist' : 'Add to playlist'}
                      >
                        {isInCurrentPlaylist ? '✓ IN PLAYLIST' : '+ PLAYLIST'}
                      </button>
                    )}

                    {/* Play Button */}
                    <button
                      onClick={() => {
                        if (isCurrentlyPlaying) {
                          togglePlayAudio();
                        } else {
                          playTrack(track);
                        }
                      }}
                      className={`p-2 rounded-lg font-bold flex items-center justify-center transition ${
                        isCurrentlyPlaying
                          ? 'bg-violet-600 text-white shadow'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>

                    {/* Delete if imported */}
                    {track.type === 'IMPORTED' && (
                      <button
                        onClick={() => deleteImportedTrack(track.id)}
                        className="p-1.5 rounded text-rose-400 hover:text-rose-300"
                        title="Delete imported track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e101a] border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 font-mono shadow-2xl">
            <div className="text-xs font-bold text-white tracking-wider uppercase">
              CREATE TACTICAL PLAYLIST
            </div>
            <input
              type="text"
              placeholder="e.g. WHITE ROOM, NIGHT CODING..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-1.5 rounded bg-violet-600 text-white text-xs font-bold hover:bg-violet-500"
              >
                CREATE PLAYLIST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
