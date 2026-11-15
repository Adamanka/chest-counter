# Contributing

Thanks for taking a look! This is a small fan project, so keep changes focused.

## Ground rules

- **No game assets.** Do not add logos, artwork, fonts or other copyrighted
  material. Icons must be original SVG or emoji.
- **No game APIs or scraping.** The app counts what the player tells it to count.
- **Local-first.** v1 has no backend; do not introduce network calls that send
  user data anywhere.
- **TypeScript strict, no `any`.**

## Workflow

1. Fork the repository (or create a branch if you have write access).
2. Branch from `develop`: `git checkout -b feat/short-description develop`.
3. Install dependencies: `npm ci`.
4. Make the change. Add or update tests.
5. Run the checks locally:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

6. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   `feat: add chest type editor`, `fix: clamp counter at zero`, `test: cover undo`,
   `docs: update beta checklist`.
7. Open a pull request against `develop` and fill in the template.

## Definition of done for a PR

- Lint, typecheck, unit tests and build are green.
- New behaviour is covered by a test (bug fixes start with a failing test).
- Accessibility is preserved: keyboard reachable, labelled controls, visible focus.
- Both themes and both languages still look correct.
- No new dependencies without a short justification in the PR.

## Commit hooks

`husky` + `lint-staged` run ESLint and Prettier on staged files. If a hook fails,
fix the reported issue instead of bypassing it with `--no-verify`.
