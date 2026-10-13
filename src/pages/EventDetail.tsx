import { useParams } from 'react-router-dom';
import { useEvent } from '../hooks';
import { EventBoutRow } from '../components/events/EventBoutRow';
import type { Bout } from '../types';

function groupBySection(bouts: Bout[]): { section: string; bouts: Bout[] }[] {
  const groups: { section: string; bouts: Bout[] }[] = [];
  for (const bout of bouts) {
    const section = bout.cardSection || 'Card';
    const last = groups[groups.length - 1];
    if (last && last.section === section) {
      last.bouts.push(bout);
    } else {
      groups.push({ section, bouts: [bout] });
    }
  }
  return groups;
}

export function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { event, bouts, loading, error } = useEvent(slug);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-text-muted">Loading…</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-accent-red">
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  const groups = groupBySection(bouts);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1
            className="text-4xl font-bold text-text-primary"
            style={{ textWrap: 'balance' }}
          >
            {event.title}
          </h1>
          {event.status === 'live' && (
            <span className="text-sm bg-accent-red text-white px-2 py-0.5 rounded font-medium">
              LIVE
            </span>
          )}
          {event.status === 'completed' && (
            <span className="text-sm bg-border text-text-muted px-2 py-0.5 rounded">
              Results
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
          <div>
            <div className="text-text-muted">Date</div>
            <div className="text-text-primary font-semibold">
              {event.eventDateLabel}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Venue</div>
            <div className="text-text-primary font-semibold">
              {event.venue || 'TBA'}
            </div>
          </div>
          <div>
            <div className="text-text-muted">Location</div>
            <div className="text-text-primary font-semibold">
              {event.city
                ? `${event.city}${event.country ? `, ${event.country}` : ''}`
                : event.locationText || 'TBA'}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Fight Card</h2>
        {groups.length > 0 ? (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.section}>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
                  {group.section}
                </h3>
                <div className="space-y-3">
                  {group.bouts.map((bout) => (
                    <EventBoutRow key={bout.id} bout={bout} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-text-muted text-center py-8">
            {event.status === 'scheduled'
              ? 'No bouts announced yet'
              : 'No bouts found'}
          </div>
        )}
      </section>
    </div>
  );
}
