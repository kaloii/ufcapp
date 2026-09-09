import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRankings } from '../hooks';

const DIVISIONS = [
  'flyweight',
  'bantamweight',
  'featherweight',
  'lightweight',
  'welterweight',
  'middleweight',
  'light-heavyweight',
  'heavyweight',
  'womens-strawweight',
  'womens-flyweight',
  'womens-bantamweight',
];

const DIVISION_LABELS: Record<string, string> = {
  flyweight: 'Flyweight',
  bantamweight: 'Bantamweight',
  featherweight: 'Featherweight',
  lightweight: 'Lightweight',
  welterweight: 'Welterweight',
  middleweight: 'Middleweight',
  'light-heavyweight': 'Light Heavyweight',
  heavyweight: 'Heavyweight',
  'womens-strawweight': "Women's Strawweight",
  'womens-flyweight': "Women's Flyweight",
  'womens-bantamweight': "Women's Bantamweight",
};

export function Rankings() {
  const { rankings, loading, error } = useRankings();
  const [selected, setSelected] = useState('welterweight');

  const filteredRankings = useMemo(() => {
    return rankings.filter((r) => r.normalizedDivision === selected);
  }, [rankings, selected]);

  const champion = filteredRankings.find((r) => r.isChampion);
  const rankedFighters = filteredRankings
    .filter((r) => !r.isChampion && r.rank !== null)
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-text-muted">Loading rankings…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-accent-red">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Rankings</h1>

      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Division selector">
        {DIVISIONS.map((div) => (
          <button
            key={div}
            role="tab"
            aria-selected={selected === div}
            onClick={() => setSelected(div)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selected === div
                ? 'bg-primary text-white'
                : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {DIVISION_LABELS[div]}
          </button>
        ))}
      </div>

      {champion && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            Champion
          </h2>
          <Link
            to={`/fighters/${champion.fighterSlug}`}
            className="flex items-center gap-4 bg-bg-card border border-primary/30 rounded-lg p-4 card-hover card-hover-focus"
          >
            <div className="w-14 h-14 rounded-full bg-border overflow-hidden flex-shrink-0">
              {champion.imageUrl ? (
                <img
                  src={champion.imageUrl}
                  alt={champion.fighterName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted font-bold">
                  {champion.fighterName[0]}
                </div>
              )}
            </div>
            <div>
              <div className="text-primary font-bold">Champion</div>
              <div className="text-text-primary font-semibold">
                {champion.fighterName}
              </div>
            </div>
          </Link>
        </div>
      )}

      {rankedFighters.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            Rankings
          </h2>
          <div className="space-y-2">
            {rankedFighters.map((r) => (
              <Link
                key={r.id}
                to={`/fighters/${r.fighterSlug}`}
                className="flex items-center gap-4 bg-bg-card border border-border rounded-lg p-4 card-hover card-hover-focus"
              >
                <div className="w-8 text-text-muted font-bold text-center font-variant-numeric tabular-nums">
                  {r.rank}
                </div>
                <div className="w-10 h-10 rounded-full bg-border overflow-hidden flex-shrink-0">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.fighterName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm font-bold">
                      {r.fighterName[0]}
                    </div>
                  )}
                </div>
                <div className="text-text-primary font-semibold">
                  {r.fighterName}
                </div>
                {r.movement && r.movement.direction !== 'same' && (
                  <span className={`text-sm ml-auto ${
                    r.movement.direction === 'up' ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {r.movement.icon}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!champion && rankedFighters.length === 0 && (
        <div className="text-text-muted text-center py-8">
          No rankings available for this division
        </div>
      )}
    </div>
  );
}
