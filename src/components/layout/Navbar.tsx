import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg-dark/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-primary font-bold text-xl tracking-tight">
              UFC
            </span>
            <span className="text-text-primary font-semibold text-lg">
              Stats
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/rankings"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Rankings
            </Link>
            <Link
              to="/compare"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Compare
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              placeholder="Search fighters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg-card border border-border rounded-lg px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary w-48 md:w-64"
            />
          </form>
        </div>
      </div>
    </nav>
  );
}
