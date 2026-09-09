import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks';
import { FighterCard } from '../components/fighters/FighterCard';

export function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { results, loading, error } = useSearch(query);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Search</h1>
      {query && (
        <p className="text-text-secondary mb-8">
          Results for "{query}"
        </p>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="text-text-muted">Searching...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="text-accent-red">{error}</div>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="space-y-3">
          {results.map((fighter) => (
            <FighterCard key={fighter.slug} fighter={fighter} />
          ))}
        </div>
      )}

      {!loading && !error && query && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-text-muted">No fighters found</div>
        </div>
      )}

      {!query && (
        <div className="text-center py-12">
          <div className="text-text-muted">
            Enter a search query to find fighters
          </div>
        </div>
      )}
    </div>
  );
}
