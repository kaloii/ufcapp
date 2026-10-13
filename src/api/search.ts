import { apiFetch } from './client';
import { getCachedDataIfValid, setCachedData } from '../cache/localStorage';
import type { SearchResults } from '../types';

const SEARCH_TTL = 30 * 60 * 1000;

export async function searchAll(query: string): Promise<SearchResults> {
  const cacheKey = `searchall_${query}`;
  const cached = getCachedDataIfValid<SearchResults>(cacheKey, SEARCH_TTL);
  if (cached) return cached;

  const result = await apiFetch<SearchResults>(
    `/search?q=${encodeURIComponent(query)}`,
  );
  const results: SearchResults = {
    fighters: result.fighters || [],
    events: result.events || [],
    bouts: result.bouts || [],
  };
  setCachedData(cacheKey, results);
  return results;
}
