import { beforeEach, describe, expect, it, vi } from 'vitest';

let values: Map<string, string>;
let storageHandler: ((event: { key: string | null; newValue: string | null }) => void) | undefined;
let blocked = false;
beforeEach(() => {
  vi.resetModules();
  values = new Map();
  blocked = false;
  storageHandler = undefined;
  vi.stubGlobal('window', {
    localStorage: {
      getItem(key: string) {
        if (blocked) throw new Error('blocked');
        return values.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        if (blocked) throw new Error('blocked');
        values.set(key, value);
      },
      removeItem(key: string) {
        if (blocked) throw new Error('blocked');
        values.delete(key);
      },
    },
    addEventListener(_type: string, handler: typeof storageHandler) {
      storageHandler = handler;
    },
  });
});

describe('resilient local persistence', () => {
  it('recovers malformed storage without crashing', async () => {
    values.set('frame-cinema:v1', '{broken');
    const storage = await import('../../src/services/storage');
    expect(storage.getFavorites()).toEqual([]);
    expect(storage.getHistory()).toEqual({});
    storage.toggleFavorite('sintel');
    expect(storage.getFavorites()).toEqual(['sintel']);
  });
  it('validates persisted shapes, dates, finite numbers, and duplicate favorites', async () => {
    values.set(
      'frame-cinema:v1',
      JSON.stringify({
        favorites: ['a', 'a', 12, '__proto__'],
        history: {
          good: { time: 50, duration: 40, updatedAt: '2026-10-30' },
          invalid: { time: '2', duration: 40, updatedAt: 'today' },
          negative: { time: -1, duration: 30, updatedAt: '2026-10-30' },
        },
      }),
    );
    const storage = await import('../../src/services/storage');
    expect(storage.getFavorites()).toEqual(['a']);
    expect(storage.getHistory()).toEqual({
      good: { time: 40, duration: 40, updatedAt: '2026-10-30' },
    });
    storage.saveProgress('infinite', Infinity, 10);
    storage.saveProgress('nan', 1, NaN);
    storage.saveProgress('zero', 1, 0);
    expect(Object.keys(storage.getHistory())).toEqual(['good']);
  });
  it('continues in session memory when localStorage is blocked', async () => {
    blocked = true;
    const storage = await import('../../src/services/storage');
    expect(storage.storageAvailable()).toBe(false);
    storage.toggleFavorite('sintel');
    storage.saveProgress('sintel', 15, 60);
    expect(storage.getFavorites()).toEqual(['sintel']);
    expect(storage.getHistory().sintel.time).toBe(15);
    storage.clearHistory();
    expect(storage.getHistory()).toEqual({});
  });
  it('emits same-tab changes and handles cross-tab updates with stable snapshots', async () => {
    const storage = await import('../../src/services/storage');
    const listener = vi.fn();
    const unsubscribe = storage.subscribe(listener);
    const initial = storage.getSnapshot();
    expect(storage.getSnapshot()).toBe(initial);
    storage.toggleFavorite('a');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(storage.getSnapshot()).not.toBe(initial);
    const updated = storage.getSnapshot();
    expect(storage.getSnapshot()).toBe(updated);
    storageHandler?.({
      key: storage.STORAGE_KEY,
      newValue: JSON.stringify({ favorites: ['b'], history: {} }),
    });
    expect(storage.getFavorites()).toEqual(['b']);
    expect(listener).toHaveBeenCalledTimes(2);
    storageHandler?.({ key: null, newValue: null });
    expect(storage.getFavorites()).toEqual([]);
    unsubscribe();
    storage.toggleFavorite('c');
    expect(listener).toHaveBeenCalledTimes(3);
  });
  it('protects stored progress from caller mutation', async () => {
    const storage = await import('../../src/services/storage');
    storage.saveProgress('a', 5, 10);
    const history = storage.getHistory();
    history.a.time = 9;
    expect(storage.getHistory().a.time).toBe(5);
  });
});
