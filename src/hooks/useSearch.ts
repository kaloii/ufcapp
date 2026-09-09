import { useState, useEffect } from 'react';
import type { Fighter } from '../types';
import { searchFighters } from '../api';

export function useSearch(query: string) {
  const [state, setState] = useState<{
    results: Fighter[];
    loading: boolean;
    error: string | null;
  }>({ results: [], loading: false, error: null });

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      if (!cancelled) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        const fighters = await searchFighters(trimmed);
        if (!cancelled) {
          setState({ results: fighters, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            results: [],
            loading: false,
            error: err instanceof Error ? err.message : 'Search failed',
          });
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return state;
}
