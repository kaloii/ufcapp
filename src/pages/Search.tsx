import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks';
import { FighterCard } from '../components/fighters/FighterCard';
import { EventCard } from '../components/events/EventCard';
import { EventBoutRow } from '../components/events/EventBoutRow';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { results, loading, error } = useSearch(query);

  const { fighters, events, bouts } = results;
  const totalCount = fighters.length + events.length + bouts.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Search</h1>
      {query && (
        <p className="text-text-secondary mb-8">
          Results for &ldquo;{query}&rdquo;
        </p>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="text-text-muted">Searching…</div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="text-accent-red">{error}</div>
        </div>
      )}

      {!loading && !error && query && totalCount > 0 && (
        <div className="space-y-8">
          {fighters.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                Fighters{' '}
                <span className="text-text-muted text-sm font-normal">
                  ({fighters.length})
                </span>
              </h2>
              <div className="space-y-3">
                {fighters.map((fighter) => (
                  <FighterCard key={fighter.slug} fighter={fighter} />
                ))}
              </div>
            </section>
          )}

          {events.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                Events{' '}
                <span className="text-text-muted text-sm font-normal">
                  ({events.length})
                </span>
              </h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <EventCard key={event.slug} event={event} />
                ))}
              </div>
            </section>
          )}

          {bouts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                Bouts{' '}
                <span className="text-text-muted text-sm font-normal">
                  ({bouts.length})
                </span>
              </h2>
              <div className="space-y-3">
                {bouts.map((bout) => (
                  <EventBoutRow key={bout.id} bout={bout} showEvent />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!loading && !error && query && totalCount === 0 && (
        <div className="text-center py-12">
          <div className="text-text-muted">
            No results found for &ldquo;{query}&rdquo;
          </div>
        </div>
      )}

      {!query && (
        <div className="text-center py-12">
          <div className="text-text-muted">
            Search for fighters, events, and bouts
          </div>
        </div>
      )}
    </div>
  );
}
