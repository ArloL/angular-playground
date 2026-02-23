# Contributing

This guide covers everything you need to develop, test, and submit changes to
this project.

## Build & Development Commands

- `npm start` — Dev server on port 58967, served under `/angular-playground/`
- `npm run build` — Production build (runs environment timestamp generation first)
- `npm test` — Run unit tests (Vitest)
- `npm run test:ci` — CI test runner (`ng test --no-watch --no-progress`)
- `npm run lint` — ESLint (`eslint src`)
- `npm run format:check` — Prettier check
- `npm run format` — Prettier auto-fix
- `npm run e2e` — Run Playwright e2e tests (starts dev server automatically)
- `npm run e2e:update` — Update Playwright visual snapshots
- `make server` — Dev server with auto-open
- `make build` — Build with base-href and sync to `_site/`

## Git

- Make PRs easy to review by using focused commits and rewriting branch history
  if later changes make previous commits obsolete

## Testing

- After making code changes, run `npm run test:ci` and ensure all tests pass before considering the task complete.
- Do not mark work as done if tests are failing.
- Run `npm run lint` and fix any ESLint errors before finishing.
- Run `npm run format:check` and fix formatting issues with `npm run format` before finishing.

### E2E / Visual Regression Tests

Playwright runs visual regression tests against a mobile viewport (Pixel 5). Tests live in the `e2e/` directory with baseline screenshots in `e2e/*.spec.ts-snapshots/`.

- **CI:** The PR check workflow (`.github/workflows/pr-check.yaml`) installs Chromium, runs `npm run e2e`, and uploads the Playwright HTML report as an artifact on failure.
- **Updating snapshots:** When a visual change is intentional, run `npm run e2e:update` locally on Linux to regenerate the baseline PNGs (snapshots are platform-specific). Commit the updated snapshots.
- **Config:** `playwright.config.ts` — uses the dev server on port 58967, single `Mobile Chrome` project.

## TypeScript

Strict mode fully enabled including `strictTemplates`, `strictInjectionParameters`, and `strictInputAccessModifiers`. Target ES2022 with bundler module resolution.

## Style Guides

Follow the [Angular Style Guide](https://angular.dev/style-guide) and the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html). Key rules are summarized below.

### Angular Style Guide

- **Standalone only** — No NgModules. All components, directives, and pipes use `standalone: true` and import dependencies directly.
- **`inject()` over constructor injection** — Use the `inject` function for dependency injection instead of constructor parameters.
- **Signals** — Use Angular signals (`signal`, `computed`, `effect`, `input`, `output`, `model`) for reactive state.
- **`readonly` for Angular-initialized properties** — Mark properties initialized by `input`, `model`, `output`, and queries as `readonly`.
- **`protected` for template members** — Use `protected` access for members read from the component template, not `public`.
- **Class member ordering** — Group Angular-specific properties (injected dependencies, inputs, outputs, queries) near the top of the class, before methods.
- **File naming** — Hyphen-separated lowercase: `user-profile.ts`. Avoid generic names like `helpers.ts` or `utils.ts`.
- **No type suffixes in class names** — Name classes for what they do, not their Angular type. Use `UserDataClient` instead of `UserService`. Exceptions: Pipes and NgModules keep their suffixes.
- **Event handlers** — Name methods for what they do, not when they are called (e.g., `saveUser()` not `onSubmit()`).
- **Directive selectors** — Use an app-specific camelCase prefix for attribute selectors.
- **One concept per file** — Prefer one component, directive, or service per file. Keep files small.
- **Flat directory structure** — Keep directories as flat as possible. Group related files together without deep nesting.
- **Template control flow** — Use `@if` / `@for` blocks, not structural directives.

### Google TypeScript Style Guide

- **Naming conventions:**
  - `UpperCamelCase` — Classes, interfaces, types, enums, decorators, type parameters.
  - `lowerCamelCase` — Variables, functions, parameters, module aliases.
  - `UPPER_SNAKE_CASE` — Global constants and enum values.
  - Treat abbreviations as whole words: `loadHttpUrl`, not `loadHTTPURL`.
- **No `_` prefix/suffix** — Do not use leading or trailing underscores on identifiers, including private members.
- **Names must not duplicate type information** — e.g., `name: string`, not `nameString: string`.
- **Descriptive names** — Names must be clear to a new reader. No ambiguous abbreviations.
- **`const` by default** — Use `const` unless reassignment is needed, then `let`. Never use `var`.
- **One variable per declaration** — No `let a = 1, b = 2;`.
- **Interfaces over type aliases** — Use `interface` for object shapes. Do not prefix interfaces (no `IFoo`).
- **No `any`** — Avoid `any`; prefer `unknown` or more specific types.
- **No default exports** — Use named exports only.
- **ES module imports** — Use `import {foo} from './bar';`. No `require`. Use relative paths within the project.
- **No namespaces** — Use separate files for code organization.
- **Use `enum`, not `const enum`**.
- **Comments** — Use `/** JSDoc */` for public API documentation. Use `//` for implementation notes. Do not use `/* block */` for multi-line comments.
