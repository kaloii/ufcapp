import { apiFetch } from './client';
import {
  getCachedDataIfValid,
  setCachedData,
  CACHE_DURATIONS,
} from '../cache/localStorage';
import type { Bout, Event } from '../types';

export async function getEventById(id: string): Promise<Event> {
  const cacheKey = `event_${id}`;
  const cached = getCachedDataIfValid<Event>(
    cacheKey,
    CACHE_DURATIONS.EVENTS,
  );
  if (cached) return cached;

  const result = await apiFetch<{ data: Event }>(
    `/events/${encodeURIComponent(id)}`,
  );
  const event = result.data;
  setCachedData(cacheKey, event);
  return event;
}

export async function getEventBouts(slug: string): Promise<Bout[]> {
  const cacheKey = `event_bouts_${slug}`;
  const cached = getCachedDataIfValid<Bout[]>(
    cacheKey,
    CACHE_DURATIONS.EVENTS,
  );
  if (cached) return cached;

  const result = await apiFetch<{ data: Bout[] }>(
    `/events/${encodeURIComponent(slug)}/bouts`,
  );
  const bouts = result.data || [];
  setCachedData(cacheKey, bouts);
  return bouts;
}
