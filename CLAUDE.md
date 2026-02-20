# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm start` — Dev server on port 58967, served under `/angular-playground/`
- `npm run build` — Production build (runs environment timestamp generation first)
- `npm test` — Run unit tests (Vitest)
- `npm run test:ci` — CI test runner (`ng test --no-watch --no-progress`)
- `npm run lint` — ESLint (`eslint src`)
- `npm run format:check` — Prettier check
- `npm run format` — Prettier auto-fix
- `make server` — Dev server with auto-open
- `make build` — Build with base-href and sync to `_site/`

## Architecture

**Angular 21 standalone app** — No NgModules. All components use `standalone: true` and directly import their dependencies.

### State Management: Custom Signal-based Stores

The app uses a custom in-memory store pattern (no NgRx/Akita):

- `services/store.ts` — Abstract `AbstractStore<T extends Entity>` providing CRUD operations via Promise-based API with optional simulated delay
- Concrete stores: `UserStore`, `GroupStore`, `ExpenseStore` — each injectable, initialized with sample data in `app.component.ts` `ngOnInit`
- Stores use an internal index map for O(1) lookups and auto-generate IDs (base64 UUID) and timestamps

### Component Patterns

- **Inputs:** `input.required<T>()` signal inputs
- **Data loading:** Angular `resource({ params, loader })` API for async data
- **Derived state:** `computed()` signals
- **Forms:** Signals-based reactive forms (`@angular/forms/signals`) with `FormField` component
- **Template control flow:** `@if` / `@for` blocks (not `*ngIf`/`*ngFor`)

### Models

Base `Entity` interface (`id`, `createdAt`, `updatedAt`) in `models/entity.ts`. Domain models (`User`, `Group`, `Expense`, `Share`) extend via composition. `NewX` types use `Omit` to exclude entity fields.

### Routing

Hash-based routing (for GitHub Pages). Routes defined in `app.routes.ts`:
- `/users`, `/groups` — list views
- `/group/create`, `/group/:groupId`, `/group/:groupId/edit` — group CRUD
- `/group/:groupId/expenses`, `/group/:groupId/expenses/add` — expense management

### Styling

Bulma v1.0.4 CSS framework via SCSS. Global styles in `src/styles.scss`. Component-level SCSS files.

## Git

- Make PRs easy to review by using focused commits and rewriting branch history
  if later changes make previous commits obsolete

## Testing

- After making code changes, run `npm run test:ci` and ensure all tests pass before considering the task complete.
- Do not mark work as done if tests are failing.
- Run `npm run lint` and fix any ESLint errors before finishing.
- Run `npm run format:check` and fix formatting issues with `npm run format` before finishing.

## TypeScript

Strict mode fully enabled including `strictTemplates`, `strictInjectionParameters`, and `strictInputAccessModifiers`. Target ES2022 with bundler module resolution.
