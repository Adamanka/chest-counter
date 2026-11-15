# Chest Counter

[![CI](https://github.com/OWNER/chest-counter/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/chest-counter/actions/workflows/ci.yml)

An unofficial fan-made web app for manually counting chests opened during battle
royale matches. Tap one big button, get per-type counters, match stats, history,
charts, goals and data export — all stored locally in your browser.

> **Unofficial fan project, not affiliated with Epic Games.**
> No game API, no parsing, no automation, no game assets. The player is the only
> source of data.

## Features (MVP)

1. Big `+1` / `−1` chest buttons (`−1` never drops below zero).
2. Six built-in chest types (common, rare, epic, legendary, golden, special) plus
   user-defined types, with per-type counters and a grand total.
3. Matches: start/end a match, stats for the current match, today and all time.
4. History: timestamp + type per entry, delete an entry, undo/redo.
5. Stats and charts: per day, average per match, type shares, best match record.
6. Goals and achievements with progress bars.
7. JSON and CSV export/import, "Reset everything" with confirmation.
8. Settings: light/dark theme, RU/EN language, hotkeys (`Space` = +1), click sound
   (off by default).
9. Responsive layout (phone/tablet/desktop) and accessibility (keyboard, contrast, aria).
10. Autosave to `localStorage`; data survives a reload.

## Tech stack

Vite · React · TypeScript (strict, no `any`) · Tailwind CSS · Zustand · zod ·
Vitest + Testing Library · Playwright · ESLint + Prettier · husky + lint-staged ·
GitHub Actions.

## Quick start

Requirements: Node.js >= 20.19 and npm >= 10.

```bash
npm ci
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint with zero warnings allowed |
| `npm run format` | Prettier write |
| `npm run typecheck` | TypeScript without emitting |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:coverage` | Tests with coverage thresholds |
| `npm run e2e` | Playwright E2E (Chromium, Firefox, WebKit, mobile) |

First E2E run needs browsers: `npm run e2e:install`.

## Project structure

See [docs/PLAN.md](docs/PLAN.md) for the architecture, domain model and backlog.
Stage status lives in [docs/PROGRESS.md](docs/PROGRESS.md).

## Data & privacy

Everything is stored in your browser's `localStorage`. Nothing is sent to a
server. Clearing site data removes your counters, so use the export feature if
you want a backup.

## Assumptions

- No backend in v1; `localStorage` is the single source of truth.
- GitHub publishing requires an authenticated `gh` CLI or manual `git push`.
- Development happens on `develop`, releases are cut from `main`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Ideas that are intentionally out of scope
for v1 are listed in [docs/ROADMAP.md](docs/ROADMAP.md).

## License

[MIT](LICENSE)
