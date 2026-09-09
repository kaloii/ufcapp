import { useState, useEffect, useRef } from 'react';
import { getFighterStats, searchFighters } from '../api';
import { ComparisonTable } from '../components/comparison/ComparisonTable';
import type { Fighter, FighterStats as FighterStatsType } from '../types';

export function Compare() {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [suggestions1, setSuggestions1] = useState<Fighter[]>([]);
  const [suggestions2, setSuggestions2] = useState<Fighter[]>([]);
  const [fighter1, setFighter1] = useState<Fighter | null>(null);
  const [fighter2, setFighter2] = useState<Fighter | null>(null);
  const [stats1, setStats1] = useState<FighterStatsType | null>(null);
  const [stats2, setStats2] = useState<FighterStatsType | null>(null);
  const [loading, setLoading] = useState(false);
  const cancelRef1 = useRef(false);
  const cancelRef2 = useRef(false);

  useEffect(() => {
    const trimmed = query1.trim();
    if (!trimmed) return;

    cancelRef1.current = false;
    const timeout = setTimeout(async () => {
      const results = await searchFighters(trimmed);
      if (!cancelRef1.current) {
        setSuggestions1(results.slice(0, 5));
      }
    }, 300);
    return () => {
      cancelRef1.current = true;
      clearTimeout(timeout);
    };
  }, [query1]);

  useEffect(() => {
    const trimmed = query2.trim();
    if (!trimmed) return;

    cancelRef2.current = false;
    const timeout = setTimeout(async () => {
      const results = await searchFighters(trimmed);
      if (!cancelRef2.current) {
        setSuggestions2(results.slice(0, 5));
      }
    }, 300);
    return () => {
      cancelRef2.current = true;
      clearTimeout(timeout);
    };
  }, [query2]);

  const selectFighter = async (fighter: Fighter, slot: 1 | 2) => {
    if (slot === 1) {
      setFighter1(fighter);
      setQuery1(fighter.name);
      setSuggestions1([]);
      setLoading(true);
      const stats = await getFighterStats(fighter.slug);
      setStats1(stats);
      setLoading(false);
    } else {
      setFighter2(fighter);
      setQuery2(fighter.name);
      setSuggestions2([]);
      setLoading(true);
      const stats = await getFighterStats(fighter.slug);
      setStats2(stats);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        Compare Fighters
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative">
          <label htmlFor="compare-fighter1" className="block text-text-muted text-sm mb-2">
            Fighter 1
          </label>
          <div className="relative">
            {fighter1 && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-border overflow-hidden">
                {fighter1.imageUrl ? (
                  <img src={fighter1.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">
                    {fighter1.firstName?.[0]}{fighter1.lastName?.[0]}
                  </div>
                )}
              </div>
            )}
            <input
              id="compare-fighter1"
              type="search"
              placeholder="Search fighter…"
              value={query1}
              onChange={(e) => {
                setQuery1(e.target.value);
                setFighter1(null);
                setStats1(null);
              }}
              className={`w-full bg-bg-card border border-border rounded-lg py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary ${fighter1 ? 'pl-12 pr-4' : 'px-4'}`}
            />
          </div>
          {suggestions1.length > 0 && !fighter1 && (
            <div className="absolute z-10 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg">
              {suggestions1.map((f) => (
                <button
                  key={f.slug}
                  onClick={() => selectFighter(f, 1)}
                  className="w-full text-left px-4 py-3 hover:bg-bg-card-hover transition-colors border-b border-border last:border-0 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-border overflow-hidden flex-shrink-0">
                    {f.imageUrl ? (
                      <img src={f.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">
                        {f.firstName?.[0]}{f.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-text-primary">{f.name}</div>
                    <div className="text-text-muted text-sm">
                      {f.division} · {f.record?.wins ?? f.recordWins}-{f.record?.losses ?? f.recordLosses}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="compare-fighter2" className="block text-text-muted text-sm mb-2">
            Fighter 2
          </label>
          <div className="relative">
            {fighter2 && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-border overflow-hidden">
                {fighter2.imageUrl ? (
                  <img src={fighter2.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">
                    {fighter2.firstName?.[0]}{fighter2.lastName?.[0]}
                  </div>
                )}
              </div>
            )}
            <input
              id="compare-fighter2"
              type="search"
              placeholder="Search fighter…"
              value={query2}
              onChange={(e) => {
                setQuery2(e.target.value);
                setFighter2(null);
                setStats2(null);
              }}
              className={`w-full bg-bg-card border border-border rounded-lg py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary ${fighter2 ? 'pl-12 pr-4' : 'px-4'}`}
            />
          </div>
          {suggestions2.length > 0 && !fighter2 && (
            <div className="absolute z-10 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg">
              {suggestions2.map((f) => (
                <button
                  key={f.slug}
                  onClick={() => selectFighter(f, 2)}
                  className="w-full text-left px-4 py-3 hover:bg-bg-card-hover transition-colors border-b border-border last:border-0 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-border overflow-hidden flex-shrink-0">
                    {f.imageUrl ? (
                      <img src={f.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">
                        {f.firstName?.[0]}{f.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-text-primary">{f.name}</div>
                    <div className="text-text-muted text-sm">
                      {f.division} · {f.record?.wins ?? f.recordWins}-{f.record?.losses ?? f.recordLosses}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-text-muted">
          Loading stats…
        </div>
      )}

      {fighter1 && fighter2 && stats1 && stats2 && !loading && (
        <ComparisonTable
          fighter1={fighter1}
          fighter2={fighter2}
          stats1={stats1}
          stats2={stats2}
        />
      )}

      {fighter1 && fighter2 && (!stats1 || !stats2) && !loading && (
        <div className="text-center py-12 text-accent-red">
          Could not load stats for one or both fighters
        </div>
      )}
    </div>
  );
}
