import { Link } from 'react-router-dom';
import type { Event } from '../../types';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isLive = event.status === 'live';
  const isCompleted = event.status === 'completed';

  return (
    <Link
      to={`/events/${event.slug}`}
      className="block bg-bg-card border border-border rounded-lg p-4 card-hover card-hover-focus"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-border overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl" aria-hidden="true">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>🥊</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-text-primary font-semibold truncate">
              {event.title}
            </h3>
            {isLive && (
              <span className="text-xs bg-accent-red text-white px-2 py-0.5 rounded font-medium flex-shrink-0">
                LIVE
              </span>
            )}
            {isCompleted && (
              <span className="text-xs bg-border text-text-muted px-2 py-0.5 rounded flex-shrink-0">
                Results
              </span>
            )}
          </div>
          <p className="text-text-muted text-sm mt-1 truncate">
            {event.eventDateLabel}
            {event.locationText && <> · {event.locationText}</>}
          </p>
        </div>
      </div>
    </Link>
  );
}
