# Progress log

Stage-by-stage record of what is done, verified and pending.
If context is lost, resume from the first stage not marked `DONE`.

## Environment notes

- Windows host, PowerShell.
- Node.js / npm / git / gh were **not installed** at the start of the work.
  Installed via `winget`: Node.js LTS v26.13.1, Git 2.56.0, GitHub CLI 2.104.0.
- PowerShell execution policy for the current user: `RemoteSigned`
  (needed to run `npm.ps1`).
- `gh auth status` → logged in as **Adamanka** (scopes: gist, read:org, repo, workflow).
- Temporary Vite smoke test (`npm create vite` → install → build) passed and was deleted.
- GitHub repository: <https://github.com/Adamanka/chest-counter> (public).
  Branches: `main` (stable) and `develop` (work in progress).
- The dev server binds to IPv6 `localhost`; Playwright therefore uses
  `http://localhost:4173` as its base URL instead of `127.0.0.1`.

## Status

| Stage                       | Status      | Notes                                                      |
| --------------------------- | ----------- | ---------------------------------------------------------- |
| A — AGENTS.md + PROGRESS.md | DONE        | Rules and product scope copied verbatim                    |
| 0 — Plan                    | DONE        | `docs/PLAN.md`, `docs/ROADMAP.md`                          |
| 1 — Repository bootstrap    | DONE        | Scaffold, tooling, hooks, repo created and pushed          |
| 2 — MVP                     | DONE        | All 10 MVP features implemented and checked in the browser |
| 3 — Architecture & quality  | IN PROGRESS |                                                            |
| 4 — Tests                   | PENDING     |                                                            |
| 5 — Audit                   | PENDING     |                                                            |
| 6 — CI/CD                   | PENDING     |                                                            |
| 7 — Beta                    | PENDING     |                                                            |
| 8 — Release                 | PENDING     |                                                            |

## Stage A — project memory

Done:

- `AGENTS.md` with the original rules and product scope (verbatim, Russian).
- This log.

## Stage 0 — plan

Done:

- `docs/PLAN.md`: architecture, domain model, MVP backlog, quality gates,
  risk list and explicit assumptions.
- `docs/ROADMAP.md`: ideas that are **out of scope for v1** (accounts and cloud
  sync, player rating, OBS overlay, PWA, offline mode).

## Stage 1 — repository bootstrap

Done:

- Git repository initialised on branch `main`, then `develop` created.
- `.gitignore`, `.gitattributes` (LF everywhere except `*.cmd`/`*.bat`),
  `README.md`, `LICENSE` (MIT, 2026 Adamanka), `CONTRIBUTING.md`.
- GitHub issue templates (`bug_report.yml`, `feature_request.yml`, `config.yml`)
  and a pull request template.
- Vite + React + TypeScript (strict) scaffold, Tailwind CSS v4 via
  `@tailwindcss/vite`.
- ESLint 9 (flat config, `typescript-eslint` strict type checked, jsx-a11y,
  react-hooks), Prettier, husky `pre-commit` (`lint-staged` + `typecheck`).
- Scripts: `dev`, `build`, `preview`, `lint`, `format`, `typecheck`, `test`,
  `test:coverage`, `e2e`.
- `npm ci` → `added 372 packages, and audited 379 packages`.
- `npm run dev` → `VITE v8.3.8 ready in 453 ms`, `GET /` returned HTTP 200.
- Repository pushed: `main` and `develop` track `origin`.

Known issues recorded for stage 5:

- `npm ci` reports `7 moderate severity vulnerabilities`.
- npm warns that `eslint@9.39.5` is no longer supported.

## Stage 2 — MVP

Done (all data in `localStorage`, no backend, no Epic Games API):

1. Big `+1 chest` button and `−1` (never below zero).
2. Six built-in chest types (common, rare, epic, legendary, golden, special)
   plus user-defined types with a name and an emoji; per-type and total counters.
3. Matches: start/end, live timer, per-match counter, per-match/day/all-time
   statistics.
4. History: timestamp, type, match label, delete an entry, undo/redo of the
   last 100 actions.
5. Statistics: by day (14-day bar chart), average per match, type shares
   (donut), match record and day streak.
6. Goals (total / today / match / single type) and 8 achievements with
   progress bars.
7. Export/import JSON and CSV, reset-all with a confirmation dialog.
8. Settings: light/dark/system theme, RU/EN language, hotkeys (Space = +1),
   click sound (off by default).
9. Responsive layout (mobile bottom nav, desktop top nav), keyboard support,
   skip link, `aria` attributes, `role="progressbar"` on progress bars.
10. Autosave to `localStorage` (debounced 150 ms, flushed on `pagehide`,
    `beforeunload` and `visibilitychange`) with a save-status indicator.

Bugs found and fixed (test first, then fix):

- Built-in chest type names rendered empty: the `types.*` and `match.title`
  i18n keys were missing. Reproduced with `src/i18n/i18n.test.ts`
  (`1 failed | 3 passed`), then added the keys to RU and EN → `4 passed`.
- The settings screen crashed with `Maximum update depth exceeded` because
  `DataPanel` selected a freshly created object from Zustand v5
  (`useAppStore(selectPersistedData)`). Reproduced with
  `src/components/settings/DataPanel.test.tsx`, then replaced the selector with
  individual slices plus `useMemo` → test passes.

Verified in the browser (Chromium via the in-app browser, `npm run dev`):

- `+1` / Space → `Всего сундуков` 0 → 4; reload → data survived (`events: 3`
  before the third click, then 6 after Space).
- Match: start → `Матч идёт`, timer `00:03`, `В матче: 2`, average `2.0`,
  best match `2`; end → `Матч не начат`, `В матче: 0`.
- History: 5 entries with `матч` / `вне матча` labels; delete 5 → 4, undo → 5;
  storage contains 5 events.
- Tabs and hash routing: `#/stats`, `#/history`, `#/goals`, `#/settings` all
  render, no console errors.
- Settings: locale RU → EN (`<html lang="en">`, dictionary switched, footer still
  `Unofficial fan project, not affiliated with Epic Games`), theme toggle adds
  `.dark` and body background `rgb(6, 11, 21)`.
- Custom type "Сундук босса" created in the UI and persisted
  (`customTypes: [{ name: "Сундук босса", emoji: "🎁" }]`).
- Reset: total `0`, storage key removed; undo restored 5 entries.

Commands run at the end of the stage:

- `npx tsc --noEmit` → exit code 0
- `npx eslint . --max-warnings=0` → exit code 0
- `npm run build` → `dist/assets/index-*.js 381.54 kB │ gzip: 114.74 kB`,
  `✓ built in 185ms`
- `npx vitest run` → see stage 4 for the full suite
