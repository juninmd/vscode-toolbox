# ⏳ whenkit

Tiny, **dependency-free** duration parsing/formatting and human relative-time. Fully typed, ships **ESM + CJS + `.d.ts`**. ~90 LOC, zero runtime deps.

```ts
import { parseDuration, formatDuration, humanize, toUnit } from "whenkit";

parseDuration("1h30m");            // 5400000
parseDuration("2.5h");             // 9000000
formatDuration(5_400_000);         // "1h 30m"
formatDuration(90_061_000, { parts: 2 }); // "1d 1h"
humanize(Date.now() - 3 * 3600_000);      // "3 hours ago"
humanize(Date.now() + 2 * 86400_000);     // "in 2 days"
toUnit("1d", "h");                 // 24
```

## API
| fn | signature | notes |
|----|-----------|-------|
| `parseDuration` | `(string \| number) → ms` | units `w d h m s ms`; bare number = ms; throws on garbage or trailing text (`"5 months"`) |
| `formatDuration` | `(ms, {parts?, separator?}) → string` | compact, sign-aware, `parts` caps segments |
| `humanize` | `(date, now?) → string` | `"3 hours ago"` / `"in 2 days"` / `"just now"`; throws on invalid dates |
| `toUnit` | `(dur, unit) → number` | convert to a unit as float |

## Dev
```bash
bun install
bun test        # unit tests
bun run build   # tsdown → dist/ (esm, cjs, d.ts)
```

Publish to npm on a version tag once CI/billing is set up.

MIT.
