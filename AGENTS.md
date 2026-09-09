# AGENTS.md

## Tech Stack
- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- React Router v6 for client-side routing
- Cito API (`https://api.citoapi.com/api/v1`) for UFC data
- Deploy target: Vercel (SPA with client-side routing)

## Commands
- `npm run dev` — Vite dev server at localhost:5173
- `npm run build` — TypeScript check + Vite build (`tsc -b && vite build`)
- `npm run lint` — OxLint (React + TypeScript + OXC plugins)

No test suite exists.

## Verify After Changes
Run `npm run build` to catch type errors and lint issues in one step. The build runs `tsc -b` first, then `vite build`. Both must pass.

## TypeScript Quirks
- `erasableSyntaxOnly: true` — no `public`/`private` keywords in constructor parameters. Use explicit property declarations instead.
- `verbatimModuleSyntax: true` — use `import type` for type-only imports.
- `noUnusedLocals: true` / `noUnusedParameters: true` — unused code causes build failure.

## API Key
- Stored in `.env` as `CITO_API_KEY` (server-side only, no `VITE_` prefix)
- Get key from https://citoapi.com (free tier: 500 req/month)
- Key is read via `process.env.CITO_API_KEY` in `api/*.ts` serverless functions
- On Vercel: set `CITO_API_KEY` in Project Settings → Environment Variables
- `.env` is gitignored; never commit API keys

## API Response Shapes (Cito API)
The Cito API wraps all responses in `{ success: true, data: ... }`. Key structures:

**Fighter profile** (`/ufc/fighters/{slug}`): flat object with `division` (not `weightClass`), `recordWins`/`recordLosses`/`recordDraws` (also has nested `record`), `heightInches`/`weightLbs`/`reachInches` as strings, `country` (not `nationality`), `imageUrl`, `headshotUrl`.

**Fighter stats** (`/ufc/fighters/{slug}/stats`): flat object with `strikingAccuracy` (decimal like 0.58), `sigStrikesLandedPerMin`, `takedownDefense`, `knockdownAvg`, `winsByMethod` (keys: `dec`, `sub`, `ko-tko`), `sigStrikesByPosition`, `sigStrikesByTarget`.

**Fight history** (`/ufc/fighters/{slug}/fights`): array per-fighter perspective with `opponent`, `event`, `bout` objects. No image URLs in fight history.

**Rankings** (`/ufc/rankings`): flat array of all rankings, filter by `normalizedDivision`. Champions have `isChampion: true` and `rankText: "C"`.

**Search** (`/ufc/search?q=`): returns `{ data: { fighters: [...] } }`.

## Caching
- localStorage caching in `src/cache/localStorage.ts` to stay within free tier limits
- Fighter profiles: 24h TTL
- Rankings: 6h TTL
- Fight stats: permanent (historical data doesn't change)
- Search: 30min TTL

## Project Structure
```
api/                # Vercel serverless functions (CORS proxy to Cito API)
├── search.ts       # GET /api/search?q=...
├── fighters.ts     # GET /api/fighters?page=...&limit=...
├── fighters/
│   ├── [slug].ts           # GET /api/fighters/:slug
│   └── [slug]/
│       ├── stats.ts        # GET /api/fighters/:slug/stats
│       └── fights.ts       # GET /api/fighters/:slug/fights
└── rankings.ts     # GET /api/rankings

src/
├── api/          # Frontend API client (calls /api proxy, not Cito directly)
├── cache/        # localStorage cache with TTL
├── components/
│   ├── layout/   # Navbar, Footer
│   ├── fighters/ # FighterCard, FighterStats, SearchBar
│   ├── fights/   # FightCard
│   └── comparison/ # ComparisonTable
├── hooks/        # useFighter, useSearch, useRankings
├── pages/        # Home, Search, FighterProfile, Rankings, Compare
└── types/        # TypeScript interfaces matching Cito API responses
```

## Routes
- `/` — Home with search bar + quick links
- `/search?q=` — Search results
- `/fighters/:slug` — Fighter profile with stats + fight history
- `/rankings` — Division rankings (tab selector)
- `/compare` — Side-by-side fighter comparison

## Linting
- OxLint with React hooks rules enforced as errors
- No ESLint; OxLint is the sole linter
