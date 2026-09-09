interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const STORAGE_PREFIX = 'ufc_cache_';

function getCacheKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function getCachedData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  } catch {
    // Storage full or unavailable
  }
}

export function isCacheValid(key: string, maxAgeMs: number): boolean {
  try {
    const raw = localStorage.getItem(getCacheKey(key));
    if (!raw) return false;

    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.timestamp < maxAgeMs;
  } catch {
    return false;
  }
}

export function getCachedDataIfValid<T>(
  key: string,
  maxAgeMs: number,
): T | null {
  if (!isCacheValid(key, maxAgeMs)) return null;
  return getCachedData<T>(key);
}

export function clearCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

const HOUR = 60 * 60 * 1000;

export const CACHE_DURATIONS = {
  FIGHTER_PROFILE: 24 * HOUR,
  RANKINGS: 6 * HOUR,
  FIGHT_STATS: Infinity,
  EVENTS: 12 * HOUR,
} as const;
