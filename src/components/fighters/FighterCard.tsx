import { Link } from 'react-router-dom';
import type { Fighter } from '../../types';

interface FighterCardProps {
  fighter: Fighter;
}

export function FighterCard({ fighter }: FighterCardProps) {
  return (
    <Link
      to={`/fighters/${fighter.slug}`}
      className="block bg-bg-card border border-border rounded-lg p-4 hover:bg-bg-card-hover transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-border overflow-hidden flex-shrink-0">
          {fighter.imageUrl ? (
            <img
              src={fighter.imageUrl}
              alt={fighter.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-xl font-bold">
              {fighter.firstName?.[0]}
              {fighter.lastName?.[0]}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-text-primary font-semibold truncate">
            {fighter.name}
          </h3>
          {fighter.nickname && (
            <p className="text-text-muted text-sm truncate">
              "{fighter.nickname}"
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-text-secondary">
              {fighter.record?.wins ?? fighter.recordWins}-{fighter.record?.losses ?? fighter.recordLosses}-{fighter.record?.draws ?? fighter.recordDraws}
            </span>
            <span className="text-text-muted">|</span>
            <span className="text-text-muted">{fighter.division}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
