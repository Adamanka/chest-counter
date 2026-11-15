# Roadmap

Ideas intentionally **out of scope for v1**. Do not implement them in the MVP.

## Post-v1 candidates

1. **Accounts and cloud sync** — optional sign-in, sync chest history across
   devices. Requires a backend or BaaS, privacy policy and data migration from
   `localStorage`.
2. **Player leaderboard** — weekly chest rankings. Requires anti-cheat thinking
   (manual input is trivially spoofable), server-side aggregation.
3. **OBS overlay** — a transparent, always-on-top counter view for streamers,
   ideally driven by `BroadcastChannel` from the main tab.
4. **PWA** — installable app with an app manifest, icons and a service worker.
5. **Offline mode** — full offline caching of the app shell and assets (overlaps
   with PWA; requires a cache-versioning strategy).

## Smaller follow-ups (not promised)

- Additional chart types (heatmap by hour of day).
- Import merge strategies (replace vs. append vs. dedupe by id).
- Multiple profiles on one device.
- Season/pass style long-term goals.
- Shareable read-only stats link (would need a backend or URL-encoded snapshot).

## Explicitly never

- Any use of game APIs, scraping, memory reading or automation.
- Game logos, artwork, fonts or other copyrighted assets.
