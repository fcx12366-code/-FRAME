import type { Progress } from '../types/film';

export const STORAGE_KEY = 'frame-cinema:v1';
export interface StorageSnapshot {
  favorites: string[];
  history: Record<string, Progress>;
}
let snapshot: StorageSnapshot = { favorites: [], history: {} };
let loaded = false;
const listeners = new Set<() => void>();

const validId = (id: unknown): id is string =>
  typeof id === 'string' &&
  id.length > 0 &&
  id.length <= 160 &&
  !['__proto__', 'constructor', 'prototype'].includes(id);
const validNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function decode(value: string | null): StorageSnapshot {
  const empty: StorageSnapshot = { favorites: [], history: {} };
  if (!value) return empty;
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return empty;
    const record = data as Record<string, unknown>;
    const favorites = Array.isArray(record.favorites)
      ? [...new Set(record.favorites.filter(validId))]
      : [];
    const history: Record<string, Progress> = {};
    if (record.history && typeof record.history === 'object' && !Array.isArray(record.history)) {
      for (const [id, raw] of Object.entries(record.history)) {
        if (!validId(id) || !raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
        const item = raw as Record<string, unknown>;
        if (
          validNumber(item.time) &&
          validNumber(item.duration) &&
          item.duration > 0 &&
          typeof item.updatedAt === 'string' &&
          Number.isFinite(Date.parse(item.updatedAt))
        ) {
          history[id] = {
            time: Math.min(item.time, item.duration),
            duration: item.duration,
            updatedAt: item.updatedAt,
          };
        }
      }
    }
    return { favorites, history };
  } catch {
    return empty;
  }
}

function read(): StorageSnapshot {
  try {
    return decode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return snapshot;
  }
}
function ensureLoaded() {
  if (!loaded) {
    snapshot = read();
    loaded = true;
  }
}
function notify() {
  for (const listener of listeners) listener();
}
function persist(next: StorageSnapshot) {
  snapshot = next;
  loaded = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* Session memory remains usable when storage is blocked/full. */
  }
  notify();
}

export function storageAvailable(): boolean {
  try {
    const probe = `${STORAGE_KEY}:probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
export function getSnapshot(): StorageSnapshot {
  ensureLoaded();
  return snapshot;
}
export function getFavorites(): string[] {
  return [...getSnapshot().favorites];
}
export function getHistory(): Record<string, Progress> {
  return Object.fromEntries(
    Object.entries(getSnapshot().history).map(([id, progress]) => [id, { ...progress }]),
  );
}
export function toggleFavorite(id: string): boolean {
  if (!validId(id)) return false;
  const current = getSnapshot();
  const favorite = !current.favorites.includes(id);
  persist({
    ...current,
    favorites: favorite
      ? [...current.favorites, id]
      : current.favorites.filter((item) => item !== id),
  });
  return favorite;
}
export function saveProgress(id: string, time: number, duration: number): void {
  if (!validId(id) || !validNumber(time) || !validNumber(duration) || duration <= 0) return;
  const current = getSnapshot();
  persist({
    ...current,
    history: {
      ...current.history,
      [id]: { time: Math.min(time, duration), duration, updatedAt: new Date().toISOString() },
    },
  });
}
export function clearHistory(): void {
  persist({ ...getSnapshot(), history: {} });
}
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    snapshot = event.key === null ? { favorites: [], history: {} } : decode(event.newValue);
    loaded = true;
    notify();
  });
}
