import { useState, useEffect } from 'react';
import type { SearchResults } from '../types';
import { searchAll } from '../api';

const EMPTY: SearchResults = { fighters: [], events: [], bouts: [] };

export function useSearch(query: string) {
  const [state, setState] = useState<{
    results: SearchResults;
    loading: boolean;
    error: string | null;
  }>({ results: EMPTY, loading: false, error: null });

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
        const results = await searchAll(trimmed);
        if (!cancelled) {
          setState({ results, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            results: EMPTY,
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
