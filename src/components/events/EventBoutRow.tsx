import { Link } from 'react-router-dom';
import type { Bout, BoutFighter } from '../../types';

interface EventBoutRowProps {
  bout: Bout;
  showEvent?: boolean;
}

function FighterSide({ fighter, align }: { fighter: BoutFighter; align: 'left' | 'right' }) {
  const isWin = fighter.outcome === 'win';
  const isLoss = fighter.outcome === 'loss';
  const isRight = align === 'right';

  const initials = fighter.fighterName
    .split(' ')
    .map((n) => n[0])
    .join('');

  const avatar = (
    <div className="w-10 h-10 rounded-full bg-border overflow-hidden flex-shrink-0 flex items-center justify-center">
      <span className="text-text-muted text-sm font-bold">{initials}</span>
    </div>
  );

  const text = (
    <div className={`min-w-0 ${isRight ? 'text-right' : ''}`}>
      <span
        className={`font-semibold block truncate ${
          isWin ? 'text-accent-green' : isLoss ? 'text-accent-red' : 'text-text-primary'
        }`}
      >
        {fighter.fighterName}
      </span>
      <span className="text-text-muted text-xs">({fighter.corner})</span>
    </div>
  );

  return (
    <Link
      to={`/fighters/${fighter.fighterSlug}`}
      className={`flex items-center gap-3 flex-1 min-w-0 ${isRight ? 'justify-end' : ''}`}
    >
      {isRight ? (
        <>
          {text}
          {avatar}
        </>
      ) : (
        <>
          {avatar}
          {text}
        </>
      )}
    </Link>
  );
}

export function EventBoutRow({ bout, showEvent = false }: EventBoutRowProps) {
  const isCancelled = bout.isCancelled || bout.status === 'cancelled';

  return (
    <div className="bg-bg-card border border-border rounded-lg p-4 card-hover">
      <div className="flex items-center gap-4">
        {bout.fighters[0] && <FighterSide fighter={bout.fighters[0]} align="left" />}

        <div className="flex flex-col items-center gap-1 text-sm px-4 flex-shrink-0">
          {isCancelled ? (
            <span className="text-text-muted text-xs uppercase font-bold">Cancelled</span>
          ) : (
            <>
              <span className="text-text-secondary text-xs">
                {bout.method || '—'}
              </span>
              {bout.status === 'completed' && bout.resultRound != null && (
                <span className="text-text-muted text-xs">
                  R{bout.resultRound} {bout.resultTime}
                </span>
              )}
            </>
          )}
          <span className="text-text-muted text-xs">{bout.weightClass}</span>
        </div>

        {bout.fighters[1] && <FighterSide fighter={bout.fighters[1]} align="right" />}
      </div>

      <div className="flex items-center justify-center gap-2 mt-3 text-sm text-text-muted">
        {bout.titleBout && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            Title Fight
          </span>
        )}
        {showEvent && bout.event && (
          <Link
            to={`/events/${bout.event.slug}`}
            className="hover:text-text-primary transition-colors truncate"
          >
            {bout.event.title} · {bout.event.eventDateLabel}
          </Link>
        )}
        {!showEvent && bout.cardSection && (
          <span className="text-xs">{bout.cardSection}</span>
        )}
      </div>
    </div>
  );
}
