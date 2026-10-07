export type PresetFocusType =
  | 'UNIVERSAL'
  | 'CLASSIC'
  | 'EXTENDED'
  | 'DEEP_WORK'
  | 'TRIPLE_FOCUS'
  | 'ULTRA_FOCUS'
  | 'CUSTOM';

export type FocusBlockType = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface FocusBlockConfig {
  id: string;
  type: FocusBlockType;
  durationMinutes: number;
  label: string;
}

export interface FocusBlockRecord {
  id: string;
  sessionId: string;
  blockIndex: number;
  type: FocusBlockType;
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FocusTimerStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'BREAK'
  | 'COMPLETED';

export interface FocusPauseRecord {
  id: string;
  sessionId: string;
  blockIndex: number;
  pausedAt: number; // timestamp
  resumedAt?: number; // timestamp
  durationSeconds: number;
  reason?: string;
  createdAt: string;
}

export interface FocusSessionRecord {
  id: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  objective: string;
  presetType: PresetFocusType;
  totalPlannedMinutes: number;
  actualFocusMinutes: number;
  totalPausedMinutes: number;
  pauseCount: number;
  completionPercent: number;
  status: 'COMPLETED' | 'ABANDONED' | 'PARTIAL';
  objectiveCompleted?: 'YES' | 'PARTIALLY' | 'NO' | 'UNRATED';
  reviewNote?: string;
  interruptionReason?: string;
  audioTrackTitle?: string;
  playlistName?: string;
  academicSubjectId?: string;
  academicChapterId?: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AudioCategory =
  | 'BINAURAL'
  | 'NATURE'
  | 'CALM'
  | 'CONCENTRATION'
  | 'IMPORTED';

export type SyntheticPreset =
  | '40HZ_BINAURAL'
  | 'LOW_FREQ_DRONE'
  | 'RAIN'
  | 'HEAVY_RAIN'
  | 'LIGHT_RAIN'
  | 'FOREST_WIND'
  | 'OCEAN'
  | 'FIREPLACE'
  | 'CALM_DRONE'
  | 'BROWN_NOISE'
  | 'PINK_NOISE'
  | 'WHITE_NOISE';

export interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  category: AudioCategory;
  type: 'SYNTHETIC' | 'IMPORTED';
  syntheticPreset?: SyntheticPreset;
  audioBlob?: Blob;
  blobUrl?: string;
  fileName?: string;
  durationSeconds?: number;
  license: string;
  source: string;
  attributionRequirement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudioPlaylist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  playbackMode: 'SEQUENTIAL' | 'SHUFFLE' | 'LOOP_PLAYLIST' | 'LOOP_TRACK';
  fadeDuration: number; // 0, 2, 5, 10 seconds
  createdAt: string;
  updatedAt: string;
}

export interface AudioSettings {
  id: 'current_audio_settings';
  playTiming: 'FOCUS_ONLY' | 'FOCUS_AND_BREAKS' | 'STOP_ON_SESSION_END';
  pauseBehavior: 'PAUSE_AUDIO' | 'CONTINUE_AUDIO';
  fadeBeforeBreak: boolean;
  fadeAfterBreak: boolean;
  volume: number; // 0-100
  muted: boolean;
  activePlaylistId?: string;
  activeTrackId?: string;
  visualizerEnabled: boolean;
  visualizerStyle: 'WAVEFORM' | 'BARS' | 'BREATHING';
  createdAt: string;
  updatedAt: string;
}

export interface FocusGoals {
  id: 'current_focus_goals';
  dailyTargetHours: number; // default 4
  weeklyTargetHours: number; // default 24
  createdAt: string;
  updatedAt: string;
}

export interface FocusConsistencyStats {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  totalPlannedMinutes: number;
  actualFocusMinutes: number;
  totalPauses: number;
  averagePausesPerSession: number;
  totalPauseMinutes: number;
  averageUninterruptedMinutes: number;
  completionRatePercent: number;
  longestSessionMinutes: number;
  bestDayOfWeek: string;
  bestTimeWindow: string;
}
