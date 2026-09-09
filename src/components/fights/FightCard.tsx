import { Link } from 'react-router-dom';
import type { Fight } from '../../types';

interface FightCardProps {
  fight: Fight;
}

export function FightCard({ fight }: FightCardProps) {
  const isWin = fight.outcome === 'win';

  return (
    <div className="bg-bg-card border border-border rounded-lg p-4 card-hover">
      <div className="flex items-center gap-4">
        <Link
          to={`/fighters/${fight.fighterSlug}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-full bg-border overflow-hidden flex-shrink-0 flex items-center justify-center">
            <span className="text-text-muted text-sm font-bold">
              {fight.fighterName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <span
              className={`font-semibold block truncate ${
                isWin ? 'text-accent-green' : 'text-accent-red'
              }`}
            >
              {fight.fighterName}
            </span>
            <span className="text-text-muted text-xs">
              ({fight.corner})
            </span>
          </div>
        </Link>

        <div className="flex flex-col items-center gap-1 text-sm px-4">
          <span className={`font-bold uppercase text-xs ${
            isWin ? 'text-accent-green' : 'text-accent-red'
          }`}>
            {fight.outcome}
          </span>
          <span className="text-text-muted text-xs">VS</span>
          <span className="text-text-secondary text-xs">{fight.bout.method}</span>
          <span className="text-text-muted text-xs">
            R{fight.bout.resultRound} {fight.bout.resultTime}
          </span>
        </div>

        <Link
          to={`/fighters/${fight.opponent.slug}`}
          className="flex items-center gap-3 flex-1 min-w-0 justify-end"
        >
          <div className="min-w-0 text-right">
            <span className="font-semibold text-text-primary block truncate">
              {fight.opponent.name}
            </span>
            <span className="text-text-muted text-xs">
              ({fight.opponent.corner})
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-border overflow-hidden flex-shrink-0 flex items-center justify-center">
            <span className="text-text-muted text-sm font-bold">
              {fight.opponent.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </Link>
      </div>
      <div className="text-center mt-3 text-sm text-text-muted">
        {fight.event.title} · {fight.event.eventDateLabel}
        {fight.bout.titleBout && (
          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            Title Fight
          </span>
        )}
      </div>
    </div>
  );
}
