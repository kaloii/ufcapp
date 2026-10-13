import { useState, useEffect } from 'react';
import type { Bout, Event } from '../types';
import { getEventById, getEventBouts } from '../api';

export function useEvent(slug: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
  const [bouts, setBouts] = useState<Bout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [eventData, boutsData] = await Promise.all([
          getEventById(slug!),
          getEventBouts(slug!),
        ]);
        if (!cancelled) {
          setEvent(eventData);
          setBouts(boutsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load event');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  return { event, bouts, loading, error };
}
