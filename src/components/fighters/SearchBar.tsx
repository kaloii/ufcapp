import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto" role="search">
      <div className="relative">
        <label htmlFor="hero-search" className="sr-only">Search fighters by name</label>
        <input
          id="hero-search"
          type="search"
          placeholder="Search fighters by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-bg-card border border-border rounded-lg px-6 py-4 text-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark"
        >
          Search
        </button>
      </div>
    </form>
  );
}
