import { apiFetch } from './client';
import {
  getCachedDataIfValid,
  setCachedData,
  CACHE_DURATIONS,
} from '../cache/localStorage';
import type { Ranking } from '../types';

export async function getRankings(): Promise<Ranking[]> {
  const cacheKey = 'rankings';
  const cached = getCachedDataIfValid<Ranking[]>(
    cacheKey,
    CACHE_DURATIONS.RANKINGS,
  );
  if (cached) return cached;

  const result = await apiFetch<{ data: Ranking[] }>('/rankings');
  const rankings = result.data || [];
  setCachedData(cacheKey, rankings);
  return rankings;
}
