import {
  UserSettings,
  DayPlan,
  Task,
  DailyObjective,
  Goal,
  FocusSession,
  DailyReview,
  CalendarEvent,
  FocusSessionRecord,
  FocusBlockRecord,
  FocusPauseRecord,
  AudioTrack,
  AudioPlaylist,
  AudioSettings,
  FocusGoals,
} from '../types';
import { Chapter } from '../types/academic';

const DB_NAME = 'WinterArcDisciplineDB';
const DB_VERSION = 3;

export const STORES = {
  SETTINGS: 'settings',
  TASKS: 'tasks',
  DAILY_PLANS: 'daily_plans',
  OBJECTIVES: 'objectives',
  GOALS: 'goals',
  FOCUS_SESSIONS: 'focus_sessions',
  DAILY_REVIEWS: 'daily_reviews',
  CALENDAR_EVENTS: 'calendar_events',
  ACADEMIC_CHAPTERS: 'academic_chapters',
  FOCUS_BLOCKS: 'focus_blocks',
  FOCUS_PAUSES: 'focus_pauses',
  AUDIO_LIBRARY: 'audio_library',
  AUDIO_PLAYLISTS: 'audio_playlists',
  AUDIO_SETTINGS: 'audio_settings',
  FOCUS_GOALS: 'focus_goals',
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        taskStore.createIndex('date', 'date', { unique: false });
        taskStore.createIndex('category', 'category', { unique: false });
        taskStore.createIndex('completed', 'completed', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.DAILY_PLANS)) {
        const planStore = db.createObjectStore(STORES.DAILY_PLANS, { keyPath: 'id' });
        planStore.createIndex('date', 'date', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORES.OBJECTIVES)) {
        const objStore = db.createObjectStore(STORES.OBJECTIVES, { keyPath: 'id' });
        objStore.createIndex('date', 'date', { unique: false });
        objStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.GOALS)) {
        const goalStore = db.createObjectStore(STORES.GOALS, { keyPath: 'id' });
        goalStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.FOCUS_SESSIONS)) {
        const focusStore = db.createObjectStore(STORES.FOCUS_SESSIONS, { keyPath: 'id' });
        focusStore.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.DAILY_REVIEWS)) {
        const reviewStore = db.createObjectStore(STORES.DAILY_REVIEWS, { keyPath: 'id' });
        reviewStore.createIndex('date', 'date', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORES.CALENDAR_EVENTS)) {
        const calStore = db.createObjectStore(STORES.CALENDAR_EVENTS, { keyPath: 'id' });
        calStore.createIndex('date', 'date', { unique: false });
        calStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ACADEMIC_CHAPTERS)) {
        const chapStore = db.createObjectStore(STORES.ACADEMIC_CHAPTERS, { keyPath: 'id' });
        chapStore.createIndex('subjectId', 'subjectId', { unique: false });
        chapStore.createIndex('classLevel', 'classLevel', { unique: false });
      }

      // Version 3: Focus Lab & Audio Lab stores
      if (!db.objectStoreNames.contains(STORES.FOCUS_BLOCKS)) {
        const blockStore = db.createObjectStore(STORES.FOCUS_BLOCKS, { keyPath: 'id' });
        blockStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.FOCUS_PAUSES)) {
        const pauseStore = db.createObjectStore(STORES.FOCUS_PAUSES, { keyPath: 'id' });
        pauseStore.createIndex('sessionId', 'sessionId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.AUDIO_LIBRARY)) {
        const audioStore = db.createObjectStore(STORES.AUDIO_LIBRARY, { keyPath: 'id' });
        audioStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.AUDIO_PLAYLISTS)) {
        db.createObjectStore(STORES.AUDIO_PLAYLISTS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.AUDIO_SETTINGS)) {
        db.createObjectStore(STORES.AUDIO_SETTINGS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.FOCUS_GOALS)) {
        db.createObjectStore(STORES.FOCUS_GOALS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// Generic CRUD helpers
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  key: IDBValidKey
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(key);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIdFromStore<T>(storeName: string, id: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function putToStore<T>(storeName: string, item: T): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function bulkPutToStore<T>(storeName: string, items: T[]): Promise<void> {
  if (!items.length) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    items.forEach((item) => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Full Export / Import API
export interface ExportDataPayload {
  version: number;
  exportedAt: string;
  settings: UserSettings[];
  tasks: Task[];
  daily_plans: DayPlan[];
  objectives: DailyObjective[];
  goals: Goal[];
  focus_sessions: FocusSessionRecord[];
  daily_reviews: DailyReview[];
  calendar_events: CalendarEvent[];
  academic_chapters?: Chapter[];
  focus_blocks?: FocusBlockRecord[];
  focus_pauses?: FocusPauseRecord[];
  audio_playlists?: AudioPlaylist[];
  audio_settings?: AudioSettings[];
  focus_goals?: FocusGoals[];
  audio_metadata?: Omit<AudioTrack, 'audioBlob' | 'blobUrl'>[];
}

export async function exportAllData(): Promise<ExportDataPayload> {
  const [
    settings,
    tasks,
    daily_plans,
    objectives,
    goals,
    focus_sessions,
    daily_reviews,
    calendar_events,
    academic_chapters,
    focus_blocks,
    focus_pauses,
    audio_playlists,
    audio_settings,
    focus_goals,
    audio_tracks,
  ] = await Promise.all([
    getAllFromStore<UserSettings>(STORES.SETTINGS),
    getAllFromStore<Task>(STORES.TASKS),
    getAllFromStore<DayPlan>(STORES.DAILY_PLANS),
    getAllFromStore<DailyObjective>(STORES.OBJECTIVES),
    getAllFromStore<Goal>(STORES.GOALS),
    getAllFromStore<FocusSessionRecord>(STORES.FOCUS_SESSIONS),
    getAllFromStore<DailyReview>(STORES.DAILY_REVIEWS),
    getAllFromStore<CalendarEvent>(STORES.CALENDAR_EVENTS),
    getAllFromStore<Chapter>(STORES.ACADEMIC_CHAPTERS),
    getAllFromStore<FocusBlockRecord>(STORES.FOCUS_BLOCKS),
    getAllFromStore<FocusPauseRecord>(STORES.FOCUS_PAUSES),
    getAllFromStore<AudioPlaylist>(STORES.AUDIO_PLAYLISTS),
    getAllFromStore<AudioSettings>(STORES.AUDIO_SETTINGS),
    getAllFromStore<FocusGoals>(STORES.FOCUS_GOALS),
    getAllFromStore<AudioTrack>(STORES.AUDIO_LIBRARY),
  ]);

  // Strip large binary blobs for standard JSON safety
  const audio_metadata = audio_tracks.map(({ audioBlob, blobUrl, ...rest }) => rest);

  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    tasks,
    daily_plans,
    objectives,
    goals,
    focus_sessions,
    daily_reviews,
    calendar_events,
    academic_chapters,
    focus_blocks,
    focus_pauses,
    audio_playlists,
    audio_settings,
    focus_goals,
    audio_metadata,
  };
}

export async function importAllData(payload: Partial<ExportDataPayload>): Promise<void> {
  if (payload.settings) await bulkPutToStore(STORES.SETTINGS, payload.settings);
  if (payload.tasks) await bulkPutToStore(STORES.TASKS, payload.tasks);
  if (payload.daily_plans) await bulkPutToStore(STORES.DAILY_PLANS, payload.daily_plans);
  if (payload.objectives) await bulkPutToStore(STORES.OBJECTIVES, payload.objectives);
  if (payload.goals) await bulkPutToStore(STORES.GOALS, payload.goals);
  if (payload.focus_sessions) await bulkPutToStore(STORES.FOCUS_SESSIONS, payload.focus_sessions);
  if (payload.daily_reviews) await bulkPutToStore(STORES.DAILY_REVIEWS, payload.daily_reviews);
  if (payload.calendar_events) await bulkPutToStore(STORES.CALENDAR_EVENTS, payload.calendar_events);
  if (payload.academic_chapters) await bulkPutToStore(STORES.ACADEMIC_CHAPTERS, payload.academic_chapters);
  if (payload.focus_blocks) await bulkPutToStore(STORES.FOCUS_BLOCKS, payload.focus_blocks);
  if (payload.focus_pauses) await bulkPutToStore(STORES.FOCUS_PAUSES, payload.focus_pauses);
  if (payload.audio_playlists) await bulkPutToStore(STORES.AUDIO_PLAYLISTS, payload.audio_playlists);
  if (payload.audio_settings) await bulkPutToStore(STORES.AUDIO_SETTINGS, payload.audio_settings);
  if (payload.focus_goals) await bulkPutToStore(STORES.FOCUS_GOALS, payload.focus_goals);
  if (payload.audio_metadata) {
    const tracksToPut: AudioTrack[] = payload.audio_metadata.map((t) => ({
      ...t,
      type: t.type || 'SYNTHETIC',
      license: t.license || 'CC0',
      source: t.source || 'Local Audio Engine',
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: t.updatedAt || new Date().toISOString(),
    }));
    await bulkPutToStore(STORES.AUDIO_LIBRARY, tracksToPut);
  }
}

export async function clearAllData(): Promise<void> {
  await Promise.all(Object.values(STORES).map((storeName) => clearStore(storeName)));
}
