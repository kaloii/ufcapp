import { apiFetch } from './client';
import {
  getCachedDataIfValid,
  setCachedData,
  CACHE_DURATIONS,
} from '../cache/localStorage';
import type { Event } from '../types';

export async function getEvents(page = 1, limit = 50): Promise<Event[]> {
  const cacheKey = `events_${page}_${limit}`;
  const cached = getCachedDataIfValid<Event[]>(
    cacheKey,
    CACHE_DURATIONS.EVENTS,
  );
  if (cached) return cached;

  const result = await apiFetch<{ data: Event[] }>(
    `/events?page=${page}&limit=${limit}`,
  );
  const events = result.data || [];
  setCachedData(cacheKey, events);
  return events;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const cacheKey = 'events_upcoming';
  const cached = getCachedDataIfValid<Event[]>(
    cacheKey,
    CACHE_DURATIONS.EVENTS,
  );
  if (cached) return cached;

  const result = await apiFetch<{ data: Event[] }>('/events/upcoming');
  const events = result.data || [];
  setCachedData(cacheKey, events);
  return events;
}

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
