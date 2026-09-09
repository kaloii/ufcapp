# Codebase Guide: API & Hooks

## Overview

The app fetches UFC data through Vercel serverless functions that proxy requests to the Cito API (`https://api.citoapi.com/api/v1`). This avoids CORS issues (the Cito API doesn't support browser-based requests). The frontend API client calls local `/api/*` endpoints, which forward requests server-side with the API key.

## API Layer

### `src/api/client.ts` — Base Fetch Wrapper

All frontend API calls go through `apiFetch<T>`, a generic wrapper that:

1. Prepends `/api` as the base URL (calls Vercel serverless functions)
2. Throws `ApiError` on non-2xx responses

```ts
// Usage pattern (from fighters.ts):
const result = await apiFetch<{ data: Fighter }>(`/fighters/${slug}`);
const fighter = result.data;
```

The generic `T` represents the **full response shape** from Cito, which is always `{ success: true, data: ... }`. Each caller specifies the shape of `data`.

### `api/*.ts` — Vercel Serverless Functions

These run server-side and proxy requests to Cito API. The API key is stored in `process.env.CITO_API_KEY` (set in Vercel dashboard).

| File | Route | Cito Endpoint |
|------|-------|---------------|
| `api/search.ts` | `GET /api/search?q=...` | `/ufc/search?q=...` |
| `api/fighters.ts` | `GET /api/fighters?page=...&limit=...` | `/ufc/fighters?page=...&limit=...` |
| `api/fighters/[slug].ts` | `GET /api/fighters/:slug` | `/ufc/fighters/:slug` |
| `api/fighters/[slug]/stats.ts` | `GET /api/fighters/:slug/stats` | `/ufc/fighters/:slug/stats` |
| `api/fighters/[slug]/fights.ts` | `GET /api/fighters/:slug/fights` | `/ufc/fighters/:slug/fights` |
| `api/rankings.ts` | `GET /api/rankings` | `/ufc/rankings` |

### `src/api/fighters.ts` — Fighter Endpoints

| Function | Endpoint | Returns | Cache TTL |
|----------|----------|---------|-----------|
| `searchFighters(query)` | `/api/search?q=` | `Fighter[]` | 30 min |
| `getFighterBySlug(slug)` | `/api/fighters/{slug}` | `Fighter` | 24 h |
| `getFighterStats(slug)` | `/api/fighters/{slug}/stats` | `FighterStats` | permanent |
| `getFighterFights(slug)` | `/api/fighters/{slug}/fights` | `Fight[]` | permanent |
| `getFighters()` | `/api/fighters?page=1&limit=200` | `Fighter[]` | 24 h |

Every function follows the same pattern:

```
1. Build cache key
2. Check localStorage (via getCachedDataIfValid)
3. If cache hit → return cached data
4. If cache miss → fetch via apiFetch, store result, return it
```

### `src/api/rankings.ts` — Rankings Endpoint

Single function `getRankings()` fetches all rankings and caches them for 6 hours. The Rankings page then filters the flat array by `normalizedDivision` client-side.

### `src/cache/localStorage.ts` — Cache Layer

Keys are prefixed with `ufc_cache_` to avoid collisions. Each entry stores `{ data, timestamp }`.

**Cache durations** (`CACHE_DURATIONS`):
- `FIGHTER_PROFILE`: 24 hours
- `RANKINGS`: 6 hours
- `FIGHT_STATS`: `Infinity` (historical data never changes)
- `EVENTS`: 12 hours

`getCachedDataIfValid<T>(key, maxAgeMs)` returns `T | null` — it checks the timestamp first, then deserializes. If the cache is expired or missing, it returns `null` and the API function proceeds to fetch.

## Custom Hooks

### `src/hooks/useFighter.ts` — Parallel Data Loading

Loads fighter profile, stats, and fight history **in parallel** via `Promise.all`. Used by the FighterProfile page.

```ts
const [fighter, stats, fights] = await Promise.all([
  getFighterBySlug(slug),
  getFighterStats(slug),
  getFighterFights(slug),
]);
```

Returns `{ fighter, stats, fights, loading, error }`.

**Cancellation pattern:** A `let cancelled = false` flag is set in the `useEffect` cleanup. After each `await`, the hook checks `if (!cancelled)` before calling `setState`. This prevents state updates on unmounted components (e.g., user navigates away before all 3 requests finish).

### `src/hooks/useSearch.ts` — Debounced Search

Searches fighters as the user types. Uses a 300ms debounce to avoid firing an API call on every keystroke.

```
query changes → setTimeout(300ms) → searchFighters(trimmed) → setState
```

If `query` changes before the timeout fires, the previous timeout is cleared via `clearTimeout` in the cleanup function. The `cancelled` flag also prevents stale results from overwriting newer ones.

Returns `{ results, loading, error }`.

### `src/hooks/useRankings.ts` — Simple Data Loader

Fetches rankings once on mount. Same `cancelled` flag pattern. Returns `{ rankings, loading, error }`.

## Key Patterns

### Cancellation

All three hooks use the same pattern to avoid state updates after unmount:

```ts
useEffect(() => {
  let cancelled = false;

  async function load() {
    setLoading(true);
    try {
      const data = await fetchData();
      if (!cancelled) setState(data);
    } catch (err) {
      if (!cancelled) setError(err);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  load();
  return () => { cancelled = true; };
}, [deps]);
```

`useSearch` additionally clears the debounce timeout in its cleanup.

### Error Handling

API errors are normalized to `string | null` at the hook level. The `ApiError` class in `client.ts` carries a `status` code, but hooks extract just the message. Components render the error string or hide the error section entirely.

### Cache-First Fetch

No hook bypasses the cache. Every API function checks localStorage first. This means:
- Navigating back to a fighter profile is instant (24h cache)
- The rankings page loads from cache on repeat visits (6h cache)
- Fight history never re-fetches once loaded (permanent cache)

To force a refresh, call `clearCache()` — this removes all `ufc_cache_*` keys from localStorage.

## Data Flow

```
Page Component
  └→ useHook(slug)          // e.g. useFighter("jon-jones")
       └→ useEffect(...)    // triggers on mount / slug change
            └→ API function // e.g. getFighterBySlug("jon-jones")
                 ├→ getCachedDataIfValid()   // check localStorage
                 │    └─ cache hit? → return data
                 │    └─ cache miss? ↓
                 └→ apiFetch<T>(endpoint)   // HTTP to /api (Vercel function)
                      └→ api/fighters/[slug].ts  // serverless function
                           └→ fetch(Cito API)    // server-side, no CORS
                                └→ response.json()
                                     └→ setCachedData() // store in localStorage
                                          └→ return data
```

The hook receives the data, sets state, and the component re-renders.
