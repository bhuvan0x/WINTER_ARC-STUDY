import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  FocusBlockConfig,
  FocusTimerStatus,
  FocusPauseRecord,
  FocusSessionRecord,
  PresetFocusType,
  AudioTrack,
  AudioPlaylist,
  AudioSettings,
  FocusGoals,
  FocusConsistencyStats,
} from '../types/focus';
import { Task } from '../types';
import { getBlocksForPreset } from '../utils/focusPresets';
import {
  BUILT_IN_TRACKS,
  DEFAULT_PLAYLISTS,
  playSyntheticPreset,
  playImportedBlob,
  stopAllAudio,
  pauseAudioPlayback,
  resumeAudioPlayback,
  setMasterVolume,
  isAudioCurrentlyPlaying,
} from '../utils/proceduralAudio';
import {
  getAllFromStore,
  putToStore,
  deleteFromStore,
  STORES,
} from '../db/indexedDB';
import { playSuccessChime, playFocusStartChime, playTactileClick } from '../utils/audio';
import { getTodayDateString } from '../utils/dateUtils';

interface FocusContextType {
  // Timer State
  timerStatus: FocusTimerStatus;
  secondsRemaining: number;
  currentBlockIndex: number;
  blocks: FocusBlockConfig[];
  activePreset: PresetFocusType;
  sessionObjective: string;
  sessionNumber: number;
  pauses: FocusPauseRecord[];
  autoStartBreaks: boolean;
  soundNotifications: boolean;
  browserNotifications: boolean;
  focusEnvironmentActive: boolean;
  activeSessionId: string | null;
  linkedTaskId?: string;
  linkedChapterId?: string;
  linkedSubjectId?: string;

  // Timer Actions
  startSession: (objective?: string, preset?: PresetFocusType, blocks?: FocusBlockConfig[]) => void;
  pauseSession: (reason?: string) => void;
  resumeSession: () => void;
  resetSession: () => void;
  skipBlock: () => void;
  completeSession: (reviewData?: {
    objectiveCompleted: 'YES' | 'PARTIALLY' | 'NO';
    reviewNote?: string;
    interruptionReason?: string;
  }) => Promise<FocusSessionRecord>;
  setCustomBlocks: (blocks: FocusBlockConfig[]) => void;
  setSessionObjective: (obj: string) => void;
  setActivePreset: (preset: PresetFocusType) => void;
  toggleFocusEnvironment: (force?: boolean) => void;
  setAutoStartBreaks: (val: boolean) => void;
  setSoundNotifications: (val: boolean) => void;
  setBrowserNotifications: (val: boolean) => void;
  requestNotificationPermission: () => Promise<boolean>;
  launchFocusFromAcademic: (
    subjectName: string,
    chapterName: string,
    chapterId: string,
    subjectId: string,
    durationMinutes?: number
  ) => void;
  launchFocusFromTask: (task: Task) => void;

  // Audio State
  activeTrack: AudioTrack | null;
  activePlaylist: AudioPlaylist | null;
  isPlayingAudio: boolean;
  volume: number;
  muted: boolean;
  audioSettings: AudioSettings;
  playlists: AudioPlaylist[];
  tracks: AudioTrack[];

  // Audio Actions
  playTrack: (track: AudioTrack) => void;
  togglePlayAudio: () => void;
  pauseAudio: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setAudioVolume: (v: number) => void;
  toggleMuteAudio: () => void;
  importAudioFile: (file: File) => Promise<AudioTrack>;
  deleteImportedTrack: (trackId: string) => Promise<void>;
  createPlaylist: (name: string, description?: string, trackIds?: string[]) => Promise<AudioPlaylist>;
  deletePlaylist: (id: string) => Promise<void>;
  updatePlaylist: (playlist: AudioPlaylist) => Promise<void>;
  selectPlaylist: (playlist: AudioPlaylist) => void;
  updateAudioSettings: (newSettings: Partial<AudioSettings>) => Promise<void>;

  // History & Metrics
  focusSessions: FocusSessionRecord[];
  focusGoals: FocusGoals;
  focusStats: FocusConsistencyStats;
  todayFocusMinutes: number;
  weeklyFocusMinutes: number;
  updateFocusGoals: (goals: Partial<FocusGoals>) => Promise<void>;
  deleteSessionRecord: (sessionId: string) => Promise<void>;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  id: 'current_audio_settings',
  playTiming: 'FOCUS_ONLY',
  pauseBehavior: 'PAUSE_AUDIO',
  fadeBeforeBreak: true,
  fadeAfterBreak: true,
  volume: 75,
  muted: false,
  visualizerEnabled: true,
  visualizerStyle: 'WAVEFORM',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_FOCUS_GOALS: FocusGoals = {
  id: 'current_focus_goals',
  dailyTargetHours: 4,
  weeklyTargetHours: 24,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const FocusProvider: React.FC<{
  children: React.ReactNode;
  onSessionCompleteNotification?: (session: FocusSessionRecord) => void;
}> = ({ children, onSessionCompleteNotification }) => {
  // Timer State
  const [timerStatus, setTimerStatus] = useState<FocusTimerStatus>('IDLE');
  const [activePreset, setActivePresetState] = useState<PresetFocusType>('EXTENDED');
  const [blocks, setBlocks] = useState<FocusBlockConfig[]>(() => getBlocksForPreset('EXTENDED'));
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(50 * 60);
  const [sessionObjective, setSessionObjective] = useState('Deep Work & Uncompromising Execution');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [linkedTaskId, setLinkedTaskId] = useState<string | undefined>(undefined);
  const [linkedChapterId, setLinkedChapterId] = useState<string | undefined>(undefined);
  const [linkedSubjectId, setLinkedSubjectId] = useState<string | undefined>(undefined);

  const [pauses, setPauses] = useState<FocusPauseRecord[]>([]);
  const [currentPauseStart, setCurrentPauseStart] = useState<number | null>(null);

  // User Preferences
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [focusEnvironmentActive, setFocusEnvironmentActive] = useState(false);

  // Audio State
  const [tracks, setTracks] = useState<AudioTrack[]>(BUILT_IN_TRACKS);
  const [playlists, setPlaylists] = useState<AudioPlaylist[]>(DEFAULT_PLAYLISTS);
  const [activeTrack, setActiveTrack] = useState<AudioTrack | null>(BUILT_IN_TRACKS[2]); // default brown noise
  const [activePlaylist, setActivePlaylist] = useState<AudioPlaylist | null>(DEFAULT_PLAYLISTS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolumeState] = useState(75);
  const [muted, setMutedState] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);

  // History & Analytics
  const [focusSessions, setFocusSessions] = useState<FocusSessionRecord[]>([]);
  const [focusGoals, setFocusGoals] = useState<FocusGoals>(DEFAULT_FOCUS_GOALS);

  // Reference for accurate background time calculations
  const targetEndTimestampRef = useRef<number | null>(null);
  const currentBlockActualSecondsRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Load persisted Focus Lab data
  useEffect(() => {
    async function loadData() {
      try {
        const [savedSessions, savedPlaylists, savedSettings, savedGoals, importedAudio] =
          await Promise.all([
            getAllFromStore<FocusSessionRecord>(STORES.FOCUS_SESSIONS),
            getAllFromStore<AudioPlaylist>(STORES.AUDIO_PLAYLISTS),
            getAllFromStore<AudioSettings>(STORES.AUDIO_SETTINGS),
            getAllFromStore<FocusGoals>(STORES.FOCUS_GOALS),
            getAllFromStore<AudioTrack>(STORES.AUDIO_LIBRARY),
          ]);

        if (savedSessions && savedSessions.length > 0) {
          setFocusSessions(savedSessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        }

        if (savedPlaylists && savedPlaylists.length > 0) {
          setPlaylists(savedPlaylists);
          setActivePlaylist(savedPlaylists[0]);
        } else {
          // Initialize default playlists
          for (const pl of DEFAULT_PLAYLISTS) {
            await putToStore(STORES.AUDIO_PLAYLISTS, pl);
          }
        }

        if (savedSettings && savedSettings.length > 0) {
          const cfg = savedSettings[0];
          setAudioSettings(cfg);
          setVolumeState(cfg.volume);
          setMutedState(cfg.muted);
          setMasterVolume(cfg.muted ? 0 : cfg.volume);
        }

        if (savedGoals && savedGoals.length > 0) {
          setFocusGoals(savedGoals[0]);
        }

        if (importedAudio && importedAudio.length > 0) {
          setTracks([...BUILT_IN_TRACKS, ...importedAudio]);
        }
      } catch (err) {
        console.warn('Error initializing Focus Lab data', err);
      }
    }
    loadData();
  }, []);

  const sessionNumber = useMemo(() => {
    return focusSessions.length + 1;
  }, [focusSessions]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      setBrowserNotifications(true);
      return true;
    }
    const result = await Notification.requestPermission();
    const granted = result === 'granted';
    setBrowserNotifications(granted);
    return granted;
  }, []);

  // Show system notification safely
  const triggerNotification = useCallback(
    (title: string, body: string) => {
      if (soundNotifications) {
        playSuccessChime();
      }
      if (
        browserNotifications &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(title, {
            body,
            icon: '/icon.svg',
            silent: !soundNotifications,
          });
        } catch {
          // Ignore notification errors in restrictive iframe
        }
      }
    },
    [browserNotifications, soundNotifications]
  );

  // Play audio track helper
  const playTrack = useCallback(
    (track: AudioTrack) => {
      setActiveTrack(track);
      setIsPlayingAudio(true);
      const effectiveVol = muted ? 0 : volume;
      setMasterVolume(effectiveVol, 0.5);

      if (track.type === 'SYNTHETIC' && track.syntheticPreset) {
        playSyntheticPreset(track.syntheticPreset, 1);
      } else if (track.audioBlob) {
        playImportedBlob(track.audioBlob, 1, () => {
          // On ended: next track if in playlist
          nextTrack();
        });
      }
    },
    [muted, volume]
  );

  const togglePlayAudio = useCallback(() => {
    if (isPlayingAudio) {
      pauseAudioPlayback();
      setIsPlayingAudio(false);
    } else {
      if (activeTrack) {
        playTrack(activeTrack);
      } else if (tracks.length > 0) {
        playTrack(tracks[0]);
      }
    }
  }, [isPlayingAudio, activeTrack, tracks, playTrack]);

  const pauseAudio = useCallback(() => {
    pauseAudioPlayback();
    setIsPlayingAudio(false);
  }, []);

  const nextTrack = useCallback(() => {
    if (!activePlaylist || activePlaylist.trackIds.length === 0) return;
    const currentIdx = activePlaylist.trackIds.findIndex((id) => id === activeTrack?.id);
    let nextIdx = (currentIdx + 1) % activePlaylist.trackIds.length;
    if (activePlaylist.playbackMode === 'SHUFFLE') {
      nextIdx = Math.floor(Math.random() * activePlaylist.trackIds.length);
    }
    const nextTrackId = activePlaylist.trackIds[nextIdx];
    const track = tracks.find((t) => t.id === nextTrackId);
    if (track) {
      playTrack(track);
    }
  }, [activePlaylist, activeTrack, tracks, playTrack]);

  const prevTrack = useCallback(() => {
    if (!activePlaylist || activePlaylist.trackIds.length === 0) return;
    const currentIdx = activePlaylist.trackIds.findIndex((id) => id === activeTrack?.id);
    const prevIdx = (currentIdx - 1 + activePlaylist.trackIds.length) % activePlaylist.trackIds.length;
    const prevTrackId = activePlaylist.trackIds[prevIdx];
    const track = tracks.find((t) => t.id === prevTrackId);
    if (track) {
      playTrack(track);
    }
  }, [activePlaylist, activeTrack, tracks, playTrack]);

  const setAudioVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(100, v));
      setVolumeState(clamped);
      if (!muted) {
        setMasterVolume(clamped);
      }
      putToStore(STORES.AUDIO_SETTINGS, {
        ...audioSettings,
        volume: clamped,
        updatedAt: new Date().toISOString(),
      });
    },
    [audioSettings, muted]
  );

  const toggleMuteAudio = useCallback(() => {
    const nextMuted = !muted;
    setMutedState(nextMuted);
    setMasterVolume(nextMuted ? 0 : volume);
    putToStore(STORES.AUDIO_SETTINGS, {
      ...audioSettings,
      muted: nextMuted,
      updatedAt: new Date().toISOString(),
    });
  }, [audioSettings, muted, volume]);

  // Audio & Timer Sync Handler
  const syncAudioWithTimerState = useCallback(
    (newStatus: FocusTimerStatus) => {
      if (newStatus === 'RUNNING') {
        if (!isPlayingAudio && activeTrack) {
          playTrack(activeTrack);
        }
      } else if (newStatus === 'PAUSED') {
        if (audioSettings.pauseBehavior === 'PAUSE_AUDIO') {
          pauseAudioPlayback();
          setIsPlayingAudio(false);
        }
      } else if (newStatus === 'BREAK') {
        if (audioSettings.playTiming === 'FOCUS_ONLY') {
          pauseAudioPlayback();
          setIsPlayingAudio(false);
        }
      } else if (newStatus === 'COMPLETED' || newStatus === 'IDLE') {
        stopAllAudio(1.5);
        setIsPlayingAudio(false);
      }
    },
    [activeTrack, audioSettings.pauseBehavior, audioSettings.playTiming, isPlayingAudio, playTrack]
  );

  // Transition to next block or complete
  const handleBlockFinished = useCallback(() => {
    const currentBlock = blocks[currentBlockIndex];
    const isFocusBlock = currentBlock.type === 'FOCUS';

    if (isFocusBlock) {
      triggerNotification(
        'FOCUS BLOCK COMPLETE',
        `${currentBlock.durationMinutes} minutes executed. Session ${String(currentBlockIndex + 1).padStart(2, '0')} / ${String(blocks.length).padStart(2, '0')}`
      );
    } else {
      triggerNotification('BREAK COMPLETE', 'Recovery interval ended. Next objective ready.');
    }

    const nextIndex = currentBlockIndex + 1;
    if (nextIndex < blocks.length) {
      setCurrentBlockIndex(nextIndex);
      const nextBlock = blocks[nextIndex];
      const nextDurationSeconds = nextBlock.durationMinutes * 60;
      setSecondsRemaining(nextDurationSeconds);

      const nextStatus = nextBlock.type === 'FOCUS' ? 'RUNNING' : 'BREAK';
      if (autoStartBreaks || nextStatus === 'BREAK') {
        targetEndTimestampRef.current = Date.now() + nextDurationSeconds * 1000;
        setTimerStatus(nextStatus);
        syncAudioWithTimerState(nextStatus);
      } else {
        setTimerStatus('PAUSED');
        syncAudioWithTimerState('PAUSED');
      }
    } else {
      // Entire session finished
      setTimerStatus('COMPLETED');
      syncAudioWithTimerState('COMPLETED');
      triggerNotification('FOCUS SESSION FINISHED', 'All scheduled focus blocks successfully executed.');
    }
  }, [blocks, currentBlockIndex, autoStartBreaks, triggerNotification, syncAudioWithTimerState]);

  // High-accuracy background timer tick loop based on timestamps
  useEffect(() => {
    let intervalId: number | null = null;

    if (timerStatus === 'RUNNING' || timerStatus === 'BREAK') {
      intervalId = window.setInterval(() => {
        if (targetEndTimestampRef.current) {
          const now = Date.now();
          const diff = Math.max(0, Math.ceil((targetEndTimestampRef.current - now) / 1000));
          setSecondsRemaining(diff);
          currentBlockActualSecondsRef.current += 1;

          if (diff <= 0) {
            handleBlockFinished();
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerStatus, handleBlockFinished]);

  // Page Visibility API + Window Focus to handle tab suspension
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (!document.hidden && (timerStatus === 'RUNNING' || timerStatus === 'BREAK')) {
        if (targetEndTimestampRef.current) {
          const now = Date.now();
          const diff = Math.max(0, Math.ceil((targetEndTimestampRef.current - now) / 1000));
          setSecondsRemaining(diff);
          if (diff <= 0) {
            handleBlockFinished();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [timerStatus, handleBlockFinished]);

  // START SESSION
  const startSession = useCallback(
    (objective?: string, preset?: PresetFocusType, customBlocks?: FocusBlockConfig[]) => {
      const activeObj = objective || sessionObjective;
      setSessionObjective(activeObj);

      const targetBlocks = customBlocks || (preset ? getBlocksForPreset(preset) : blocks);
      setBlocks(targetBlocks);
      if (preset) setActivePresetState(preset);

      setCurrentBlockIndex(0);
      const firstBlock = targetBlocks[0];
      const durationSec = firstBlock.durationMinutes * 60;
      setSecondsRemaining(durationSec);

      const newSessionId = `fs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setActiveSessionId(newSessionId);
      sessionStartTimeRef.current = Date.now();
      targetEndTimestampRef.current = Date.now() + durationSec * 1000;
      currentBlockActualSecondsRef.current = 0;
      setPauses([]);
      setCurrentPauseStart(null);

      const initialStatus = firstBlock.type === 'FOCUS' ? 'RUNNING' : 'BREAK';
      setTimerStatus(initialStatus);
      syncAudioWithTimerState(initialStatus);
      if (soundNotifications) playFocusStartChime();
    },
    [sessionObjective, blocks, soundNotifications, syncAudioWithTimerState]
  );

  // PAUSE SESSION
  const pauseSession = useCallback(
    (reason?: string) => {
      if (timerStatus !== 'RUNNING' && timerStatus !== 'BREAK') return;
      const pauseTimestamp = Date.now();
      setCurrentPauseStart(pauseTimestamp);

      // Save pause record
      const pauseRec: FocusPauseRecord = {
        id: `fp_${Date.now()}`,
        sessionId: activeSessionId || 'adhoc',
        blockIndex: currentBlockIndex,
        pausedAt: pauseTimestamp,
        durationSeconds: 0,
        reason,
        createdAt: new Date().toISOString(),
      };
      setPauses((prev) => [...prev, pauseRec]);
      putToStore(STORES.FOCUS_PAUSES, pauseRec);

      setTimerStatus('PAUSED');
      syncAudioWithTimerState('PAUSED');
      if (soundNotifications) playTactileClick();
    },
    [timerStatus, activeSessionId, currentBlockIndex, soundNotifications, syncAudioWithTimerState]
  );

  // RESUME SESSION
  const resumeSession = useCallback(() => {
    if (timerStatus !== 'PAUSED') return;

    if (currentPauseStart) {
      const resumedTime = Date.now();
      const pauseDurationSec = Math.round((resumedTime - currentPauseStart) / 1000);
      setPauses((prev) =>
        prev.map((p, idx) =>
          idx === prev.length - 1
            ? { ...p, resumedAt: resumedTime, durationSeconds: pauseDurationSec }
            : p
        )
      );
      setCurrentPauseStart(null);
    }

    targetEndTimestampRef.current = Date.now() + secondsRemaining * 1000;
    const currentBlock = blocks[currentBlockIndex];
    const resumeStatus = currentBlock?.type === 'FOCUS' ? 'RUNNING' : 'BREAK';
    setTimerStatus(resumeStatus);
    syncAudioWithTimerState(resumeStatus);
    if (soundNotifications) playTactileClick();
  }, [
    timerStatus,
    currentPauseStart,
    secondsRemaining,
    blocks,
    currentBlockIndex,
    soundNotifications,
    syncAudioWithTimerState,
  ]);

  // RESET SESSION
  const resetSession = useCallback(() => {
    setTimerStatus('IDLE');
    setCurrentBlockIndex(0);
    const firstBlock = blocks[0];
    setSecondsRemaining((firstBlock?.durationMinutes || 50) * 60);
    targetEndTimestampRef.current = null;
    currentBlockActualSecondsRef.current = 0;
    setCurrentPauseStart(null);
    syncAudioWithTimerState('IDLE');
    if (soundNotifications) playTactileClick();
  }, [blocks, soundNotifications, syncAudioWithTimerState]);

  // SKIP BLOCK
  const skipBlock = useCallback(() => {
    handleBlockFinished();
  }, [handleBlockFinished]);

  // COMPLETE & RECORD SESSION
  const completeSession = useCallback(
    async (reviewData?: {
      objectiveCompleted: 'YES' | 'PARTIALLY' | 'NO';
      reviewNote?: string;
      interruptionReason?: string;
    }): Promise<FocusSessionRecord> => {
      const plannedMinutes = blocks
        .filter((b) => b.type === 'FOCUS')
        .reduce((sum, b) => sum + b.durationMinutes, 0);

      const totalPauseSec = pauses.reduce((sum, p) => sum + p.durationSeconds, 0);
      const totalPausedMins = Math.round(totalPauseSec / 60);

      // Estimated focused minutes
      const actualFocusMinutes = Math.max(1, Math.round(plannedMinutes - totalPausedMins));
      const compPercent = Math.min(100, Math.round((actualFocusMinutes / plannedMinutes) * 100));

      const newSession: FocusSessionRecord = {
        id: activeSessionId || `fs_${Date.now()}`,
        sessionNumber,
        date: getTodayDateString(),
        title: sessionObjective || 'Focus Execution',
        objective: sessionObjective || 'Deep Focus',
        presetType: activePreset,
        totalPlannedMinutes: plannedMinutes,
        actualFocusMinutes,
        totalPausedMinutes: totalPausedMins,
        pauseCount: pauses.length,
        completionPercent: compPercent,
        status: compPercent >= 80 ? 'COMPLETED' : 'PARTIAL',
        objectiveCompleted: reviewData?.objectiveCompleted || 'YES',
        reviewNote: reviewData?.reviewNote,
        interruptionReason: reviewData?.interruptionReason,
        audioTrackTitle: activeTrack?.title,
        playlistName: activePlaylist?.name,
        academicChapterId: linkedChapterId,
        academicSubjectId: linkedSubjectId,
        taskId: linkedTaskId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await putToStore(STORES.FOCUS_SESSIONS, newSession);
      setFocusSessions((prev) => [newSession, ...prev]);

      // Notify parent app (for Discipline Score & academic updates)
      if (onSessionCompleteNotification) {
        onSessionCompleteNotification(newSession);
      }

      setTimerStatus('IDLE');
      syncAudioWithTimerState('IDLE');
      if (soundNotifications) playSuccessChime();

      return newSession;
    },
    [
      blocks,
      pauses,
      activeSessionId,
      sessionNumber,
      sessionObjective,
      activePreset,
      activeTrack?.title,
      activePlaylist?.name,
      linkedChapterId,
      linkedSubjectId,
      linkedTaskId,
      onSessionCompleteNotification,
      syncAudioWithTimerState,
      soundNotifications,
    ]
  );

  // Set custom blocks & presets
  const setCustomBlocks = useCallback((newBlocks: FocusBlockConfig[]) => {
    setBlocks(newBlocks);
    setActivePresetState('CUSTOM');
    if (newBlocks.length > 0) {
      setSecondsRemaining(newBlocks[0].durationMinutes * 60);
    }
  }, []);

  const setActivePreset = useCallback((preset: PresetFocusType) => {
    setActivePresetState(preset);
    const newBlocks = getBlocksForPreset(preset);
    setBlocks(newBlocks);
    if (newBlocks.length > 0) {
      setSecondsRemaining(newBlocks[0].durationMinutes * 60);
    }
  }, []);

  const toggleFocusEnvironment = useCallback((force?: boolean) => {
    setFocusEnvironmentActive((prev) => (force !== undefined ? force : !prev));
  }, []);

  // Launch from Academic Command Center
  const launchFocusFromAcademic = useCallback(
    (
      subjectName: string,
      chapterName: string,
      chapterId: string,
      subjectId: string,
      durationMinutes = 90
    ) => {
      setLinkedChapterId(chapterId);
      setLinkedSubjectId(subjectId);
      setLinkedTaskId(undefined);
      const objectiveText = `${subjectName} // ${chapterName}`;
      setSessionObjective(objectiveText);

      // Auto pick Deep Work or Extended preset based on minutes
      const preset: PresetFocusType = durationMinutes >= 90 ? 'DEEP_WORK' : 'EXTENDED';
      startSession(objectiveText, preset);
    },
    [startSession]
  );

  // Launch from Daily Planner task
  const launchFocusFromTask = useCallback(
    (task: Task) => {
      setLinkedTaskId(task.id);
      setLinkedChapterId(undefined);
      setLinkedSubjectId(undefined);
      const objectiveText = task.title;
      setSessionObjective(objectiveText);

      const mins = task.estimatedDurationMinutes || 50;
      const preset: PresetFocusType = mins >= 90 ? 'DEEP_WORK' : mins <= 30 ? 'CLASSIC' : 'EXTENDED';
      startSession(objectiveText, preset);
    },
    [startSession]
  );

  // Import personal audio file into local IndexedDB
  const importAudioFile = useCallback(async (file: File): Promise<AudioTrack> => {
    const trackId = `track_imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTrack: AudioTrack = {
      id: trackId,
      title: file.name.replace(/\.[^/.]+$/, ''),
      subtitle: `Imported local audio (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      category: 'IMPORTED',
      type: 'IMPORTED',
      fileName: file.name,
      audioBlob: file,
      license: 'Personal Local Import',
      source: 'User Device File',
      attributionRequirement: 'None. Private local file.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await putToStore(STORES.AUDIO_LIBRARY, newTrack);
    setTracks((prev) => [...prev, newTrack]);
    return newTrack;
  }, []);

  const deleteImportedTrack = useCallback(async (trackId: string) => {
    await deleteFromStore(STORES.AUDIO_LIBRARY, trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const createPlaylist = useCallback(
    async (name: string, description?: string, trackIds: string[] = []): Promise<AudioPlaylist> => {
      const newPlaylist: AudioPlaylist = {
        id: `pl_${Date.now()}`,
        name: name.trim().toUpperCase(),
        description,
        trackIds,
        playbackMode: 'LOOP_PLAYLIST',
        fadeDuration: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await putToStore(STORES.AUDIO_PLAYLISTS, newPlaylist);
      setPlaylists((prev) => [...prev, newPlaylist]);
      return newPlaylist;
    },
    []
  );

  const deletePlaylist = useCallback(async (id: string) => {
    await deleteFromStore(STORES.AUDIO_PLAYLISTS, id);
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePlaylist = useCallback(async (playlist: AudioPlaylist) => {
    await putToStore(STORES.AUDIO_PLAYLISTS, playlist);
    setPlaylists((prev) => prev.map((p) => (p.id === playlist.id ? playlist : p)));
  }, []);

  const selectPlaylist = useCallback(
    (playlist: AudioPlaylist) => {
      setActivePlaylist(playlist);
      if (playlist.trackIds.length > 0) {
        const firstTrack = tracks.find((t) => t.id === playlist.trackIds[0]);
        if (firstTrack) {
          playTrack(firstTrack);
        }
      }
    },
    [tracks, playTrack]
  );

  const updateAudioSettings = useCallback(
    async (newSettings: Partial<AudioSettings>) => {
      const merged: AudioSettings = {
        ...audioSettings,
        ...newSettings,
        updatedAt: new Date().toISOString(),
      };
      setAudioSettings(merged);
      await putToStore(STORES.AUDIO_SETTINGS, merged);
    },
    [audioSettings]
  );

  const updateFocusGoals = useCallback(
    async (goals: Partial<FocusGoals>) => {
      const merged: FocusGoals = {
        ...focusGoals,
        ...goals,
        updatedAt: new Date().toISOString(),
      };
      setFocusGoals(merged);
      await putToStore(STORES.FOCUS_GOALS, merged);
    },
    [focusGoals]
  );

  const deleteSessionRecord = useCallback(async (sessionId: string) => {
    await deleteFromStore(STORES.FOCUS_SESSIONS, sessionId);
    setFocusSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  // Compute Focus Statistics
  const focusStats: FocusConsistencyStats = useMemo(() => {
    const totalSessions = focusSessions.length;
    const completedSessions = focusSessions.filter((s) => s.status === 'COMPLETED').length;
    const abandonedSessions = focusSessions.filter((s) => s.status === 'ABANDONED').length;
    const totalPlannedMinutes = focusSessions.reduce((sum, s) => sum + s.totalPlannedMinutes, 0);
    const actualFocusMinutes = focusSessions.reduce((sum, s) => sum + s.actualFocusMinutes, 0);
    const totalPauses = focusSessions.reduce((sum, s) => sum + s.pauseCount, 0);
    const totalPauseMinutes = focusSessions.reduce((sum, s) => sum + s.totalPausedMinutes, 0);

    const averagePausesPerSession =
      totalSessions > 0 ? Number((totalPauses / totalSessions).toFixed(2)) : 0;
    const averageUninterruptedMinutes =
      totalSessions > 0
        ? Math.round(actualFocusMinutes / Math.max(1, totalSessions + totalPauses))
        : 50;
    const completionRatePercent =
      totalPlannedMinutes > 0
        ? Math.min(100, Math.round((actualFocusMinutes / totalPlannedMinutes) * 100))
        : 100;
    const longestSessionMinutes = focusSessions.reduce(
      (max, s) => Math.max(max, s.actualFocusMinutes),
      0
    );

    // Calculate best day of week
    const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    focusSessions.forEach((s) => {
      const [y, m, d] = s.date.split('-').map(Number);
      const day = new Date(y, m - 1, d).getDay();
      dayTotals[day] += s.actualFocusMinutes;
    });
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDayIdx = 0;
    let maxDayMins = 0;
    Object.entries(dayTotals).forEach(([dStr, mins]) => {
      if (mins > maxDayMins) {
        maxDayMins = mins;
        bestDayIdx = Number(dStr);
      }
    });

    return {
      totalSessions,
      completedSessions,
      abandonedSessions,
      totalPlannedMinutes,
      actualFocusMinutes,
      totalPauses,
      averagePausesPerSession,
      totalPauseMinutes,
      averageUninterruptedMinutes,
      completionRatePercent,
      longestSessionMinutes: longestSessionMinutes || 90,
      bestDayOfWeek: dayNames[bestDayIdx],
      bestTimeWindow: '06:00 – 09:30',
    };
  }, [focusSessions]);

  const todayFocusMinutes = useMemo(() => {
    const today = getTodayDateString();
    return focusSessions
      .filter((s) => s.date === today)
      .reduce((sum, s) => sum + s.actualFocusMinutes, 0);
  }, [focusSessions]);

  const weeklyFocusMinutes = useMemo(() => {
    // 7 days rolling
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return focusSessions
      .filter((s) => new Date(s.date) >= sevenDaysAgo)
      .reduce((sum, s) => sum + s.actualFocusMinutes, 0);
  }, [focusSessions]);

  return (
    <FocusContext.Provider
      value={{
        timerStatus,
        secondsRemaining,
        currentBlockIndex,
        blocks,
        activePreset,
        sessionObjective,
        sessionNumber,
        pauses,
        autoStartBreaks,
        soundNotifications,
        browserNotifications,
        focusEnvironmentActive,
        activeSessionId,
        linkedTaskId,
        linkedChapterId,
        linkedSubjectId,
        startSession,
        pauseSession,
        resumeSession,
        resetSession,
        skipBlock,
        completeSession,
        setCustomBlocks,
        setSessionObjective,
        setActivePreset,
        toggleFocusEnvironment,
        setAutoStartBreaks,
        setSoundNotifications,
        setBrowserNotifications,
        requestNotificationPermission,
        launchFocusFromAcademic,
        launchFocusFromTask,
        activeTrack,
        activePlaylist,
        isPlayingAudio,
        volume,
        muted,
        audioSettings,
        playlists,
        tracks,
        playTrack,
        togglePlayAudio,
        pauseAudio,
        nextTrack,
        prevTrack,
        setAudioVolume,
        toggleMuteAudio,
        importAudioFile,
        deleteImportedTrack,
        createPlaylist,
        deletePlaylist,
        updatePlaylist,
        selectPlaylist,
        updateAudioSettings,
        focusSessions,
        focusGoals,
        focusStats,
        todayFocusMinutes,
        weeklyFocusMinutes,
        updateFocusGoals,
        deleteSessionRecord,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export function useFocus(): FocusContextType {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
