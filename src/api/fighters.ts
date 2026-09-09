import { apiFetch } from './client';
import {
  getCachedDataIfValid,
  setCachedData,
  CACHE_DURATIONS,
} from '../cache/localStorage';
import type { Fighter, FighterStats, Fight } from '../types';

export async function searchFighters(query: string): Promise<Fighter[]> {
  const cacheKey = `search_${query}`;
  const cached = getCachedDataIfValid<Fighter[]>(cacheKey, 30 * 60 * 1000);
  if (cached) return cached;

  const result = await apiFetch<{ data: { fighters: Fighter[] } }>(
    `/search?q=${encodeURIComponent(query)}`,
  );
  const fighters = result.data?.fighters || [];
  setCachedData(cacheKey, fighters);
  return fighters;
}

export async function getFighterBySlug(slug: string): Promise<Fighter> {
  const cacheKey = `fighter_${slug}`;
  const cached = getCachedDataIfValid<Fighter>(
    cacheKey,
    CACHE_DURATIONS.FIGHTER_PROFILE,
  );
  if (cached) return cached;

  const result = await apiFetch<{ data: Fighter }>(
    `/fighters/${encodeURIComponent(slug)}`,
  );
  const fighter = result.data;
  setCachedData(cacheKey, fighter);
  return fighter;
}

export async function getFighterStats(slug: string): Promise<FighterStats> {
  const cacheKey = `fighter_stats_${slug}`;
  const cached = getCachedDataIfValid<FighterStats>(
    cacheKey,
    CACHE_DURATIONS.FIGHT_STATS,
  );
  if (cached) return cached;

  const result = await apiFetch<{ data: FighterStats }>(
    `/fighters/${encodeURIComponent(slug)}/stats`,
  );
  const stats = result.data;
  setCachedData(cacheKey, stats);
  return stats;
}

export async function getFighterFights(slug: string): Promise<Fight[]> {
  const cacheKey = `fighter_fights_${slug}`;
  const cached = getCachedDataIfValid<Fight[]>(
    cacheKey,
    CACHE_DURATIONS.FIGHT_STATS,
  );
  if (cached) return cached;

  const result = await apiFetch<{ data: Fight[] }>(
    `/fighters/${encodeURIComponent(slug)}/fights`,
  );
  const fights = result.data || [];
  setCachedData(cacheKey, fights);
  return fights;
}

export async function getFighters(): Promise<Fighter[]> {
  const cacheKey = 'fighters_all';
  const cached = getCachedDataIfValid<Fighter[]>(
    cacheKey,
    CACHE_DURATIONS.FIGHTER_PROFILE,
  );
  if (cached) return cached;

    const result = await apiFetch<{ data: Fighter[] }>(`/fighters?page=1&limit=200`);
  const fighters = result.data || [];
  setCachedData(cacheKey, fighters);
  return fighters;
}
