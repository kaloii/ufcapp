import type { Fight } from '../../types';

interface FightCardProps {
  fight: Fight;
}

export function FightCard({ fight }: FightCardProps) {
  const isWin = fight.outcome === 'win';

  return (
    <div className="bg-bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <span
            className={`font-semibold text-text-primary ${
              isWin ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {fight.fighterName}
          </span>
          <div className="text-text-muted text-sm mt-1">
            ({fight.corner} corner)
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 text-sm">
          <span className={`font-bold uppercase ${
            isWin ? 'text-accent-green' : 'text-accent-red'
          }`}>
            {fight.outcome}
          </span>
          <span className="text-text-muted">VS</span>
          <span className="text-text-secondary">{fight.bout.method}</span>
          <span className="text-text-muted">
            R{fight.bout.resultRound} {fight.bout.resultTime}
          </span>
        </div>

        <div className="flex-1 text-center">
          <span className="font-semibold text-text-primary">
            {fight.opponent.name}
          </span>
          <div className="text-text-muted text-sm mt-1">
            ({fight.opponent.corner} corner)
          </div>
        </div>
      </div>
      <div className="text-center mt-3 text-sm text-text-muted">
        {fight.event.title} &middot; {fight.event.eventDateLabel}
        {fight.bout.titleBout && (
          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            Title Fight
          </span>
        )}
      </div>
    </div>
  );
}
