export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">UFC</span>
            <span className="text-text-secondary text-sm">Stats</span>
          </div>
          <p className="text-text-muted text-sm">
            Data provided by Cito API. Not affiliated with UFC.
          </p>
        </div>
      </div>
    </footer>
  );
}
