# CLAUDE.md

For full details see @CONTRIBUTING.md and @ARCHITECTURE.md.

## Commands

- `npm run test:ci` — Run unit tests (use this, not `npm test`, to avoid watch mode)
- `npm run lint` — ESLint
- `npm run format:check` — Prettier check (`npm run format` to auto-fix)
- `npm run e2e` — Playwright visual regression tests (starts dev server automatically)
- `npm start` — Dev server on port 58967, served under `/angular-playground/`

IMPORTANT: Always run `npm run test:ci`, `npm run lint`, and `npm run format:check` after making changes. Do not consider work done if any of these fail.

## Architecture

- Angular 21 standalone PWA — **no NgModules**. All components use `standalone: true`.
- **Mobile-only UI.** Do not add styles or layouts for larger viewports.
- **Icons only.** Use icons instead of text for buttons, labels, errors, and all UI elements. Do not use English text in the UI.
- Custom signal-based stores in `services/store.ts` (no NgRx). Stores simulate network latency and can throw `NetworkError`.
- Every store call (`save`, `findById`, `findByEmail`, etc.) MUST be wrapped in `try/catch` — all operations go through `NetworkSimulation`.
- Async data loading uses Angular `resource()`. Show `<progress>` while loading, show error + retry on failure.
- Bulma v1.0.4 CSS framework via SCSS.

## Code style

- Use `inject()` for dependency injection, not constructor parameters.
- Use Angular signals (`signal`, `computed`, `input`, `output`, `model`) for reactive state.
- Use `@if` / `@for` template control flow, not structural directives.
- `readonly` for properties initialized by `input`, `model`, `output`, and queries.
- `protected` for members read from the component template.
- **No type suffixes in class names** — use `UserDataClient`, not `UserService`. Exceptions: Pipes and NgModules.
- No `any` — use `unknown` or specific types.
- No default exports. Use named exports only.
- `const` by default. `let` only when reassignment is needed. Never `var`.

## E2E snapshots

Snapshots are platform-specific (Linux). Run `npm run e2e:update` on Linux to regenerate baselines. Commit updated snapshots when visual changes are intentional.

## Working style

- **SPEC.md is the specification.** It contains everything the app is supposed to become now. If something is unclear, ask. Keep it up to date as work progresses. 
- **TODO.md is the task list.** Each item is a user-facing feature. Work through it in order. Check it at the start of each session and keep it up to date as work progresses.
- **No upfront preparatory tasks.** Model changes, service additions, new imports, and routing updates are done inline as part of the feature that needs them — not as separate preceding tasks.
