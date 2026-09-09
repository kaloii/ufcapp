import { useState, useEffect } from 'react';
import type { Fighter, FighterStats, Fight } from '../types';
import {
  getFighterBySlug,
  getFighterStats,
  getFighterFights,
} from '../api';

export function useFighter(slug: string | undefined) {
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [stats, setStats] = useState<FighterStats | null>(null);
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [fighterData, statsData, fightsData] = await Promise.all([
          getFighterBySlug(slug!),
          getFighterStats(slug!),
          getFighterFights(slug!),
        ]);
        if (!cancelled) {
          setFighter(fighterData);
          setStats(statsData);
          setFights(fightsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load fighter');
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

  return { fighter, stats, fights, loading, error };
}
