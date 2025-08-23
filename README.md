# HypurScope

Real‑time insights into HyperEVM & HyperCore data layers (TVL, stablecoins, wallet positions) built with Next.js App Router.

## Tech Stack
- Next.js 15 (App Router, Server & Client Components) ([src/app/layout.tsx](src/app/layout.tsx))
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts (metrics visualization)
- Framer Motion (UI motion)
- Heroicons / Lucide (icons)

## Quick Start
```bash
npm install
npm run dev
# visit http://localhost:3000
```

Build & run production:
```bash
npm run build
npm start
```

Lint:
```bash
npm run lint
```

## Scripts
- dev: Local development (hot reload)
- build: Production compile (Next.js + SWC)
- start: Run compiled output
- lint: ESLint (Next config + TypeScript rules)

## Project Structure (high level)
```
src/
  app/
    api/
      tvl/route.ts
      spot-info/route.ts
      stablecoins/route.ts
      holders/route.ts
      user-info/[address]/route.ts
    (pages & layouts)
  components/
    common/        # Shared UI (Tabs, metrics cards, etc.)
    home/          # Home dashboard components
    wallet/        # Wallet / address related UI (positions, holdings, etc.)
  types/           # Shared TypeScript types
  styles/          # (Tailwind + globals)
```

## Data Layer & Caching

Each API route wraps an upstream service and normalizes data for charts/UI:

| Route | File | Purpose | Caching |
|-------|------|---------|---------|
| /api/tvl | [src/app/api/tvl/route.ts](src/app/api/tvl/route.ts) | Aggregated TVL time series | `export const revalidate = 300` (5m) |
| /api/spot-info | [src/app/api/spot-info/route.ts](src/app/api/spot-info/route.ts) | Spot / market info | (check file for revalidate) |
| /api/stablecoins | [src/app/api/stablecoins/route.ts](src/app/api/stablecoins/route.ts) | Stablecoin metrics | (check file) |
| /api/holders | [src/app/api/holders/route.ts](src/app/api/holders/route.ts) | Holder stats | (check file) |
| /api/user-info/[address] | [src/app/api/user-info/[address]/route.ts](src/app/api/user-info/[address]/route.ts) | Wallet summary (positions, balances) | `revalidate = 60` (example) |

(Adjust table if caching values differ.)

### Fresh vs Cached Fetches
- Server Components default to cached fetch unless `cache: 'no-store'` or `revalidate: 0`.
- Short revalidation (e.g. 30–60s) keeps UI snappy while limiting upstream load.
- For a manual fresh snapshot (user pressed Refresh / new search of same address):
  ```ts
  fetch(`/api/user-info/${address}?t=${Date.now()}`, { cache: 'no-store' })
  ```
  The `t` param busts CDN key; `cache: 'no-store'` skips Next data cache.

### When NOT to Add Global State
Most data is server‑fetched & streamed; avoid a global client store until:
- Multiple client components need the same rapidly changing (websocket) state.
- You add user preferences (theme, currency) you want to persist.

If needed later: introduce a lightweight store (e.g. Zustand) only for UI prefs or wallet connection metadata.

## UI / Components
- Tabs & metric overview cards compose server-provided datasets.
- Charts: Built with Recharts; values pre‑formatted server-side (e.g. displayValue) to keep client logic minimal.

## Formatting & Utilities
Helper functions (see API routes) sanitize numeric strings, compress large numbers (K/M/B/T), and parse loose date formats into UTC timestamps.

## Environment Variables (TBD)
List required variables here (e.g. UPSTREAM_API_URL, RPC_URL, etc.)
```
# .env.example (create)
# NEXT_PUBLIC_... variables if needed client-side
```

## Adding a New Metric Endpoint
1. Create `src/app/api/<metric>/route.ts`.
2. Fetch upstream with desired caching:
   ```ts
   export const revalidate = 120;
   export async function GET() { /* normalize & return JSON */ }
   ```
3. Build a Server Component (preferred) that calls the route.
4. Add a tab / card referencing the new component.

## Performance Notes
- Prefer server aggregation to reduce client bundle size.
- Keep chart payload lean: strip unused fields, pre-format labels.
- Use `cache: 'no-store'` only on explicit user actions; otherwise rely on `revalidate` windows.

## Testing (TBD)
Add a section if unit / integration tests are introduced.

## Deployment
- Optimized for Vercel (edge-aware caching via `revalidate`).
- Ensure any upstream domains are allowed (if using fetch on edge).
- Monitor function logs for upstream timeout or rate issues.

## Roadmap (Example)
- [ ] Manual Refresh buttons for wallet sub-sections
- [ ] Interval auto-refresh (30–60s) toggle
- [ ] Address search history (localStorage)
- [ ] Protocol breakdown (enable commented tab)
- [ ] Dark mode & user prefs persistence
- [ ] Websocket layer for live TVL tick

## Contributing
1. Fork / clone
2. Create feature branch
3. Conventional commits (optional)
4. PR with concise description & screenshots (if UI)

## License
TBD 

---
Generated scaffold; refine descriptions & fill TBD sections