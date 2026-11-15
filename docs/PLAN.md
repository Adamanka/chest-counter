# Chest Counter — Project Plan

## 1. Idea

**Chest Counter** is an unofficial fan-made web app for tracking chests opened in
matches of a battle-royale style game. The player taps a big button every time a
chest is opened; the app stores the count, splits it by chest rarity/type, groups
it into matches and days, and visualises progress over time.

Key principles:

- **Manual tracking only.** No game API, no screen parsing, no automation.
  The player is the only data source.
- **Local-first.** All data lives in `localStorage` in the user's browser.
  No backend, no accounts, no telemetry in v1.
- **Own assets only.** No game logos, artwork or fonts. Icons are hand-written
  SVG or emoji. The footer always states:
  `Unofficial fan project, not affiliated with Epic Games`.
- **Fast to use in-game.** One keystroke (`Space`) or one thumb tap = +1 chest.

## 2. Audience

| Segment | Need | Why this app |
| ------- | ---- | ------------ |
| Competitive players | Track chest efficiency per drop/match | Per-match totals, average per match, match record |
| Content creators | Show progress on stream / in videos | Big readable counters, charts, CSV export |
| Casual players | Personal goals and streaks | Goals, achievements, progress bars |
| Data-curious players | Own their data | JSON/CSV export and import, reset |
| Teachers / demo users | Offline-friendly tool | Works without network after load |

Constraints that follow from the audience:

- Mobile-first layout (one-hand reachable primary button), but fully usable
  on tablet and desktop.
- Keyboard support for desktop players: `Space` = +1.
- RU and EN interface.
- Light/dark theme.
- No sign-up friction: open the page and start counting.

## 3. Tech stack (fixed by the product brief)

- **Vite** + **React** + **TypeScript** (`strict`, no `any`)
- **Tailwind CSS** for styling
- **Zustand** for state management (with persist middleware)
- **zod** for validation of stored data and imports
- **Vitest** for unit tests, **Testing Library** for component tests
- **Playwright** for E2E (Chromium, Firefox, WebKit + mobile viewport)
- **ESLint** + **Prettier**
- **husky** + **lint-staged** pre-commit hooks
- **GitHub Actions** for CI and GitHub Pages deployment

## 4. Folder structure

```
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── config.yml
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── deploy.yml
│   └── pull_request_template.md
├── docs/
│   ├── PLAN.md
│   ├── PROGRESS.md
│   ├── ROADMAP.md
│   ├── QA_REPORT.md
│   └── BETA.md
├── e2e/                      # Playwright specs
├── public/                   # static assets (favicon svg only)
├── src/
│   ├── components/
│   │   ├── layout/           # AppShell, Header, Footer, Nav
│   │   ├── counter/          # CounterPanel, BigButton, TypeGrid
│   │   ├── history/          # HistoryList, HistoryItem
│   │   ├── stats/            # StatsCards, Charts, Distribution
│   │   ├── goals/            # GoalsPanel, AchievementBadge
│   │   ├── settings/         # SettingsPanel, DataPanel (export/import/reset)
│   │   └── ui/               # Button, Card, Modal, ProgressBar, Toast...
│   ├── hooks/                # useHotkeys, useTheme, useLocale, useClickSound
│   ├── i18n/                 # ru.ts, en.ts, index.ts
│   ├── lib/                  # pure logic: stats, csv, undo, format, id
│   ├── schemas/              # zod schemas + safe parsers
│   ├── store/                # zustand stores + persist
│   ├── test/                 # setup, fixtures, helpers
│   ├── types/                # shared domain types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── AGENTS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── eslint.config.js
├── package.json
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 5. Domain model (draft)

```ts
type ChestTypeId = 'common' | 'rare' | 'epic' | 'legendary' | 'golden' | 'special' | string

interface ChestType {
  id: ChestTypeId
  labelKey?: string      // built-in localized label
  customLabel?: string   // user-defined label
  color: string          // tailwind-safe hex/class token
  icon: string           // emoji or own-svg id
  isCustom: boolean
}

interface ChestEvent {
  id: string
  typeId: ChestTypeId
  at: number             // epoch ms
  matchId: string | null
}

interface Match {
  id: string
  startedAt: number
  endedAt: number | null
}

interface Goal {
  id: string
  metric: 'total' | 'day' | 'match' | 'type'
  target: number
  typeId?: ChestTypeId
  createdAt: number
}

interface Settings {
  theme: 'light' | 'dark' | 'system'
  locale: 'ru' | 'en'
  sound: boolean
  hotkeys: boolean
}

interface AppState {
  events: ChestEvent[]
  matches: Match[]
  types: ChestType[]
  goals: Goal[]
  settings: Settings
  // derived via selectors, not stored
}
```

## 6. MVP backlog (10 features from the product brief)

| # | Feature | Acceptance criteria |
| - | ------- | ------------------- |
| 1 | Big `+1 chest` / `−1` buttons | `−1` never goes below 0; works with touch, mouse and keyboard |
| 2 | Chest types | 6 built-in types + user-defined; per-type counters and grand total |
| 3 | Matches | Start/end match; stats for current match, today, all time |
| 4 | History | Timestamp + type per row, delete row, undo/redo |
| 5 | Stats & charts | By day, average per match, type shares, best match |
| 6 | Goals & achievements | Progress bars, completions |
| 7 | Export/import/reset | JSON + CSV export, JSON/CSV import with validation, reset with confirmation |
| 8 | Settings | light/dark, RU/EN, hotkeys (`Space` = +1), click sound off by default |
| 9 | Responsive & a11y | Phone/tablet/desktop, keyboard navigation, contrast, aria labels |
| 10 | Autosave | `localStorage` persistence survives reload |

## 7. Milestones

| Milestone | Outcome |
| --------- | ------- |
| M0 | Plan approved (this file) |
| M1 | Repo, tooling, scripts, GitHub project |
| M2 | All 10 MVP features working locally |
| M3 | Layered architecture, zod validation, ErrorBoundary, lint/typecheck clean |
| M4 | Unit + component + E2E suites green, ≥80% coverage of core logic |
| M5 | Lighthouse 90+, clean console, no critical `npm audit` findings |
| M6 | CI pipeline + GitHub Pages deploy |
| M7 | `v0.1.0-beta` published with feedback loop |
| M8 | `v1.0.0` released publicly |

## 8. Definition of Done

- All MVP features work on phone and desktop.
- Tests are green in CI.
- Lighthouse ≥ 90 in all categories.
- No known critical bugs.
- Site is publicly reachable.
- Footer disclaimer present, no third-party game assets used.

## 9. Assumptions

- The user has no Node.js/Git/gh installed; tooling is installed via `winget`.
- GitHub publishing is attempted with `gh`; if not authenticated, the exact
  manual commands are documented in `README.md`.
- `main` is the trunk; `develop` is the integration branch.
- UI copy is bilingual (RU default, EN fallback); code and docs are English.
