# Architecture

This document describes the architecture, patterns, and design decisions for
the project. It applies equally to human contributors and AI coding agents
(see [CLAUDE.md](CLAUDE.md) for how the AI agent consumes this documentation).

## Overview

**Angular 21 standalone PWA** — A Progressive Web App designed primarily for mobile use on Android and iOS. No NgModules. All components use `standalone: true` and directly import their dependencies.

## Progressive Web App

The app is built as a PWA intended to be installed on Android and iOS home screens:

- **Service worker:** Angular service worker (`@angular/service-worker`) registered via `provideServiceWorker` in `app.config.ts`. Enabled in production only, with `registerWhenStable:30000` strategy. Configuration in `ngsw-config.json` prefetches all app shell and asset files for offline use.
- **Web manifest:** `public/manifest.webmanifest` defines the app with `"display": "standalone"` so it launches without browser chrome, like a native app. Includes maskable icons at sizes covering both Android and iOS requirements.
- **iOS support:** `index.html` includes `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, and `apple-touch-icon` links at all required sizes for iOS home screen installation.
- **Update flow:** `AppComponent` uses `SwUpdate` to check for new versions and prompt the user to reload when an update is available.
- **Mobile-only UI:** The app targets small/mobile screens exclusively. Do not add styles or layouts for larger viewports.

## State Management: Custom Signal-based Stores

The app uses a custom in-memory store pattern (no NgRx/Akita):

- `services/store.ts` — Abstract `AbstractStore<T extends Entity>` providing CRUD operations via Promise-based API with optional simulated delay
- Concrete stores: `UserStore`, `GroupStore`, `ExpenseStore` — each injectable, initialized with sample data in `app.component.ts` `ngOnInit`
- Stores use an internal index map for O(1) lookups and auto-generate IDs (base64 UUID) and timestamps

## Component Patterns

- **Inputs:** `input.required<T>()` signal inputs
- **Data loading:** Angular `resource({ params, loader })` API for async data
- **Derived state:** `computed()` signals
- **Forms:** Signals-based reactive forms (`@angular/forms/signals`) with `FormField` component
- **Template control flow:** `@if` / `@for` blocks (not `*ngIf`/`*ngFor`)

## Loading & Error Handling

Every async interaction must have loading and error indicators to account for network issues:

- **Data loading (`resource()`):** Show a `<progress>` bar while loading. On error, show the error and a retry button (`resource.reload()`). Handle `EntityNotFoundError` separately with a warning notification.
- **Form submissions / actions:** Use a `signal(false)` for in-flight state (e.g. `saving`, `addingFriend`). Wrap the async call in `try/catch/finally`. Set the signal to `true` before the call, reset in `finally`. Show `[class.is-loading]` on the button and `[disabled]` while in-flight. Display errors in a `notification is-danger` block.
- **Never** leave a store call (`save`, `findById`, `findByEmail`, etc.) without `try/catch` — all store operations go through `NetworkSimulation` and can throw `NetworkError`.

## Models

Base `Entity` interface (`id`, `createdAt`, `updatedAt`) in `models/entity.ts`. Domain models (`User`, `Group`, `Expense`, `Share`) extend via composition. `NewX` types use `Omit` to exclude entity fields.

## Routing

Hash-based routing (for GitHub Pages). Routes defined in `app.routes.ts`:
- `/users`, `/groups` — list views
- `/group/create`, `/group/:groupId`, `/group/:groupId/edit` — group CRUD
- `/group/:groupId/expenses`, `/group/:groupId/expenses/add` — expense management

## Styling

Bulma v1.0.4 CSS framework via SCSS. Global styles in `src/styles.scss`. Component-level SCSS files.

**Icons only:** Use icons instead of text for buttons, labels, errors, and all other UI elements. Do not use English text in the UI.
