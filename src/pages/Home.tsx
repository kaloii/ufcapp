import { SearchBar } from '../components/fighters/SearchBar';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-4">
          UFC <span className="text-primary">Stats</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Fighter profiles, fight statistics, rankings, and head-to-head comparisons.
        </p>
      </div>

      <SearchBar />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full px-4">
        <Link
          to="/rankings"
          className="bg-bg-card border border-border rounded-lg p-6 hover:bg-bg-card-hover transition-colors text-center"
        >
          <div className="text-3xl mb-3">🏆</div>
          <h2 className="text-text-primary font-semibold mb-1">Rankings</h2>
          <p className="text-text-muted text-sm">
            Official UFC rankings by division
          </p>
        </Link>

        <Link
          to="/compare"
          className="bg-bg-card border border-border rounded-lg p-6 hover:bg-bg-card-hover transition-colors text-center"
        >
          <div className="text-3xl mb-3">⚖️</div>
          <h2 className="text-text-primary font-semibold mb-1">Compare</h2>
          <p className="text-text-muted text-sm">
            Head-to-head fighter comparison
          </p>
        </Link>

        <Link
          to="/search?q="
          className="bg-bg-card border border-border rounded-lg p-6 hover:bg-bg-card-hover transition-colors text-center"
        >
          <div className="text-3xl mb-3">🔍</div>
          <h2 className="text-text-primary font-semibold mb-1">Explore</h2>
          <p className="text-text-muted text-sm">
            Browse all UFC fighters
          </p>
        </Link>
      </div>
    </div>
  );
}
