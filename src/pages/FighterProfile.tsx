import { useParams } from 'react-router-dom';
import { useFighter } from '../hooks';
import { FighterStats } from '../components/fighters/FighterStats';
import { FightCard } from '../components/fights/FightCard';

function inchesToHeight(inches: string | null): string {
  if (!inches) return 'N/A';
  const h = Number(inches);
  return `${Math.floor(h / 12)}'${h % 12}"`;
}

export function FighterProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { fighter, stats, fights, loading, error } = useFighter(slug);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-text-muted">Loading…</div>
      </div>
    );
  }

  if (error || !fighter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-accent-red">
          {error || 'Fighter not found'}
        </div>
      </div>
    );
  }

  const record = fighter.record || {
    wins: fighter.recordWins,
    losses: fighter.recordLosses,
    draws: fighter.recordDraws,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <div className="w-32 h-32 rounded-full bg-border overflow-hidden flex-shrink-0">
          {fighter.imageUrl ? (
            <img
              src={fighter.imageUrl}
              alt={fighter.name}
              className="w-full h-full object-cover"
              width={128}
              height={128}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-3xl font-bold">
              {fighter.firstName?.[0]}
              {fighter.lastName?.[0]}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-bold text-text-primary mb-1" style={{ textWrap: 'balance' }}>
            {fighter.name}
          </h1>
          {fighter.nickname && (
            <p className="text-text-muted text-lg mb-4">
              &ldquo;{fighter.nickname}&rdquo;
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-text-muted">Record</div>
              <div className="text-text-primary font-semibold text-lg font-variant-numeric tabular-nums">
                {record.wins}-{record.losses}-{record.draws}
              </div>
            </div>
            <div>
              <div className="text-text-muted">Division</div>
              <div className="text-text-primary font-semibold">
                {fighter.division}
              </div>
            </div>
            <div>
              <div className="text-text-muted">Height</div>
              <div className="text-text-primary font-semibold">
                {inchesToHeight(fighter.heightInches)}
              </div>
            </div>
            <div>
              <div className="text-text-muted">Reach</div>
              <div className="text-text-primary font-semibold">
                {fighter.reachInches ? `${fighter.reachInches}"` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-text-muted">Stance</div>
              <div className="text-text-primary font-semibold">
                {fighter.stance || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-text-muted">Country</div>
              <div className="text-text-primary font-semibold">
                {fighter.country || fighter.placeOfBirth || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-text-muted">Status</div>
              <div className="text-text-primary font-semibold">
                {fighter.status}
              </div>
            </div>
            <div>
              <div className="text-text-muted">Fighting Style</div>
              <div className="text-text-primary font-semibold">
                {fighter.fightingStyle || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Stats</h2>
        {stats && <FighterStats stats={stats} />}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Fight History
        </h2>
        {fights.length > 0 ? (
          <div className="space-y-3">
            {fights.map((fight, i) => (
              <FightCard key={`${fight.bout.id}-${i}`} fight={fight} />
            ))}
          </div>
        ) : (
          <div className="text-text-muted text-center py-8">
            No fights found
          </div>
        )}
      </section>
    </div>
  );
}
