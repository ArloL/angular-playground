# Expense Tracker PWA — Product Specification

**Date:** 2026-02-24
**Status:** Draft
**Scope:** Redesign and extend the existing Angular expense-tracking app into a mobile-first PWA

---

## 1. Overview

A mobile-first Progressive Web App for tracking personal and shared group expenses. The primary design goal is interaction quality on iOS and Android — fast entry, clean navigation, and a clear mental model for debt tracking. The app runs entirely on-device (IndexedDB) with no backend. The login mechanic is a prototype demo: the user picks from a hardcoded list of users to simulate different perspectives.

---

## 2. Product Decisions Summary

| Dimension | Decision |
|---|---|
| Storage | Device-only (IndexedDB via `AbstractStore`) |
| Auth | Prototype: pick from hardcoded user list on launch |
| Currency | Euro (€), hardcoded, `€12.50` format |
| Amounts | Stored in **cents** as integers (existing convention) |
| Expense types | Personal and Group |
| Group splitting | Custom amounts per person (`Share[]`) |
| Categories | Fixed preset list (Font Awesome icons) |
| Conflict resolution | Last-write-wins (device-only, moot for now) |
| Dark mode | Dark only |
| Notifications | Out of scope |
| Data backup/export | Out of scope |
| Navigation | Single scrollable home + drill-down (no tab bar) |
| Visual style | Utility-first, no-frills |

---

## 3. User Model (Prototype Login)

On first launch (or when logged out), the app shows a login screen listing all users seeded by `TestDataService`. The user taps their name to set themselves as the current user. This is stored in `CurrentUserService.user` (already a signal). There is no password.

**Seeded users:** Christopher, Nathaniel, Samantha
**Login mechanic change from current:** Currently `CurrentUserService.login()` picks a _random_ user. The redesign replaces this with an explicit selection screen.

```
┌─────────────────────────────┐
│  Who are you?               │
│                             │
│  ○ Christopher              │
│  ○ Nathaniel                │
│  ○ Samantha                 │
└─────────────────────────────┘
```

After selection, route to `/home`.

---

## 4. Information Architecture

```
/ (login)
└── /home
    ├── /groups              (see-all groups list)
    └── /group/:groupId      (group detail + expenses)
        └── expense expanded (inline, no new route)
```

No bottom tab bar. Navigation is linear: home → group detail → back. A back button/gesture returns to home from a group detail view.

The `/account` route becomes a simple profile item accessible from the home screen (e.g., tapping the current user's name/avatar).

---

## 5. Screens

### 5.1 Home Screen (`/home`)

The home screen is a single scrollable page with two sections: **Recent Groups** and the **Quick-Entry Form**.

```
┌──────────────────────────────┐
│ [Avatar] Christopher   ⚙     │  ← header: current user + settings
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Personal                 │ │  ← pinned personal card, always visible
│ │ 12 expenses              │ │
│ └──────────────────────────┘ │
│ Recent Groups          See all│
│ ┌──────────────────────────┐ │
│ │ Bloemendaal aan Zee 2025 │ │  ← shared group card
│ │ You are owed €42.00      │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Costa del Sol            │ │
│ │ You owe €18.50           │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Paris long weekend       │ │
│ │ You owe €0.00            │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Add Expense                  │
│                              │
│ ← Personal  Group A  Group B→│  ← horizontal scroll, group selector
│                              │
│ [€  Amount        ][Category]│
│ [Note / description          │
│                              │
│ [+ More options]  [Add →]    │
└──────────────────────────────┘
```

#### 5.1.1 Recent Groups Section

- **Personal card** — pinned at the top, always visible. Shows expense count instead of a balance (no debts in a single-member group). Taps to `/group/:personalGroupId`.
- **Recent shared groups** — the 3 most recently active shared groups (excludes the personal group), sorted by most recent expense date. Each card shows:
  - Group name
  - Current user's net balance: `"You are owed €X.XX"` / `"You owe €X.XX"` / `"Settled up"`
- Tapping a shared group card navigates to `/group/:groupId`.
- **"See all"** link navigates to `/groups`.

#### 5.1.2 Quick-Entry Form

The form is **always visible** below the groups section. It is scoped to the currently selected context (Personal or a specific group).

**Context selector (horizontal scroller above the form):**
- Chips: `Personal`, then one chip per group the current user belongs to.
- Tapping a chip sets the expense context. Selected chip is highlighted.
- Chips scroll horizontally if there are many groups.

**Always-visible fields:**

| Field | Input | Notes |
|---|---|---|
| Amount | Numeric input, leading `€` | Stored as cents; display converts |
| Category | Icon picker (horizontal strip) | See §7 for category list |
| Note | Text input | Short description label |

**Collapsed under "+ More options":**

| Field | Input | Notes |
|---|---|---|
| Date | Date picker | Defaults to today |
| Payer | Member dropdown | Only shown for group context; defaults to current user |
| Per-person split | Amount inputs per member | Only shown for group context; see §6.2 |

**Submit:** "Add" button (or equivalent). On success, clears the form (amount, note), keeps context selection and category.

**Validation:**
- Amount must be > 0.
- For group expenses: per-person amounts in the split must sum to the total expense amount (show running difference).

---

### 5.2 Groups List (`/groups`)

Full list of all groups the current user belongs to, sorted by most recent activity.

```
┌──────────────────────────────┐
│ ← Groups                     │
├──────────────────────────────┤
│ Personal                     │
│ 12 expenses             >    │  ← pinned, no balance
│══════════════════════════════│
│ Bloemendaal aan Zee 2025     │
│ You are owed €42.00     >    │
│──────────────────────────────│
│ Costa del Sol summer         │
│ You owe €18.50          >    │
│──────────────────────────────│
│ Paris long weekend           │
│ Settled up              >    │
├──────────────────────────────┤
│ [+ New Group]                │
└──────────────────────────────┘
```

- **Personal row** — pinned at the top with a visual separator below it. Shows expense count, no balance. Taps to the personal group detail.
- Shared group rows sorted by most recent expense. Each taps to `/group/:groupId`.
- **"+ New Group"** navigates to the group creation flow.
- Empty state (no shared groups): `"No groups yet"` below the personal row.

---

### 5.3 Group Detail (`/group/:groupId`)

A full-screen view for a single group. Contains three sections: header with balances, expense list, and (pinned at bottom) a settle-up button.

```
┌──────────────────────────────┐
│ ← Bloemendaal aan Zee 2025 ⋮ │  ← back + overflow menu (Edit group)
├──────────────────────────────┤
│ Balances                     │
│ Nathaniel owes Christopher   │
│                        €42.00│
│──────────────────────────────│
│ Today                        │
│ ┌────────────────────────────┐│
│ │ 🏨  Strandhotel    €720.00 ││  ← expense row
│ │ Christopher paid           ││
│ └────────────────────────────┘│
│ ┌────────────────────────────┐│
│ │ [expanded]                 ││
│ │ 🚂  Train          €18.40  ││
│ │ Nathaniel paid             ││
│ │                            ││
│ │ Christopher  €9.20         ││  ← split detail
│ │ Nathaniel    €9.20         ││
│ │                            ││
│ │ [Edit amount/note] [Delete]││
│ └────────────────────────────┘│
│ Yesterday                    │
│  ...                         │
├──────────────────────────────┤
│        [Settle Up]           │  ← sticky bottom button
└──────────────────────────────┘
```

#### 5.3.1 Balance Section

Displays **pairwise balances** between all group members. Only non-zero balances are shown. Language is from the current user's POV:
- If current user is owed: `"Nathaniel owes you €42.00"`
- If current user owes: `"You owe Christopher €42.00"`
- Between others: `"Nathaniel owes Christopher €42.00"`

#### 5.3.2 Expense List

- Expenses are **grouped by date** with sticky section headers: `Today`, `Yesterday`, then `Mon 3 Mar`, etc.
- Each row shows:
  - Category icon
  - Description (truncated if long)
  - Total cost (`€12.50`)
  - Payer name in smaller text below description
- Tapping a row **expands it inline** (no navigation). Expanding one row collapses any previously expanded row.
- Expanded row shows:
  - Full description (untruncated)
  - Payer: `"Christopher paid"`
  - Per-person split: list of `Name  €amount` for each `included: true` share
  - Actions: `[Edit]` and `[Delete]`
- Empty state: `"No expenses yet"` plain text.

#### 5.3.3 Settle Up Flow

1. User taps **"Settle Up"** sticky button.
2. A bottom sheet (or full-screen modal) appears showing the full pairwise debt summary for the group.
3. User taps **"Confirm"**.
4. A `settlement` expense record is written (see §6.3), zeroing all balances.
5. Sheet dismisses; expense list updates; balance section shows all-zero state.

---

### 5.4 Group Create

Minimal form:
- Group name (text input)
- Member selector: checkboxes over the full user list

On save: creates `Group` record, navigates to `/group/:newGroupId`.

### 5.4a Group Edit

Accessible from the group detail overflow menu (⋮ → Edit). Same form as Group Create, pre-populated with current values. Members can be added or removed post-creation.

**Adding a member — retroactive inclusion:**
When a new member is checked, an inline period picker appears below their name:

```
☑ Sam                              ← newly checked
  Apply to expenses from: [Last 3 days ▾]
  (4 expenses — splits will change to equal)
```

- The picker offers preset lookback periods: **Last 3 days**, **Last 7 days**, **Last 10 days**, **Last 30 days**, **All time**, **None**.
- Default selection: **All time** — the new member is automatically included in all past expenses.
- Below the picker, show a count of matching expenses and a fixed note: **"splits will change to equal"**. This communicates upfront that any custom splits on those expenses will be replaced.
- On save, for each matched expense: add the new member with `included: true` and **recalculate an equal split across all current group members**. Each member's `owed` is set to `floor(cost / memberCount)`, with any remainder (rounding cents) assigned to the payer's share. Any previously custom splits are overwritten.

**Member removal constraint:** removing a member who has unsettled expenses in the group is not allowed. Show an inline error if attempted — settle up first.

---

### 5.5 Expense Edit (inline, from expanded row)

Tapping **"Edit"** in an expanded expense row opens an inline edit form _within the expanded area_. Only two fields are editable:
- **Amount** (numeric)
- **Note** (text)

Save updates the record. Cancel dismisses. Split amounts and payer are not editable post-creation.

---

## 6. Data Model

The existing models are extended minimally. All amounts remain stored as **integer cents**.

### 6.1 Extended `Expense`

```typescript
export type ExpenseType = 'expense' | 'settlement';

export interface Expense extends Entity {
  type: ExpenseType;       // NEW — 'expense' (default) or 'settlement'
  groupId: EntityId;       // personal expenses point to the user's single-member personal group
  cost: number;            // cents, integer
  description: string;
  currency: string;        // always '€' for now
  category: string;        // Font Awesome class or empty string for settlements
  date: Date;
  shares: Share[];
  createdBy: EntityId;     // the user who paid (payer)
}
```

**Personal group:** each user has an auto-created single-member group seeded on first login. The "Personal" chip in the quick-entry form targets this group. It behaves like any other group except it never shows a balance section (only one member, so no debts).

**Backward compatibility:** Existing records have no `type` field. Code must treat missing `type` as `'expense'`.

### 6.2 Share (unchanged)

```typescript
export interface Share {
  userId: EntityId;
  owed: number;    // cents, integer
  included: boolean;
}
```

For personal expenses: `shares` contains a single entry for the current user with `owed = cost` and `included = true`.

### 6.3 Settlement Record

When a group settles up, write one `Expense` record per directional debt (i.e., one per non-zero pairwise balance):

```typescript
{
  type: 'settlement',
  groupId: <groupId>,
  cost: <amount owed>,           // the debt amount being cleared
  description: 'Settlement',
  currency: '€',
  category: '',                  // no icon
  date: new Date(),
  createdBy: <debtor userId>,    // person who was paying
  shares: [
    { userId: <creditor>, owed: <amount>, included: true },
    { userId: <debtor>, owed: 0, included: false }
  ]
}
```

Settlement records appear in the expense list with a distinct visual treatment (no icon, label `"Settlement"`, muted style). They are not editable or deletable.

### 6.4 Balance Calculation

For any group, compute pairwise balances by iterating all expense records (both `'expense'` and `'settlement'` types):

```
for each expense (including settlements):
  payer = createdBy
  for each share where included == true:
    if share.userId != payer:
      balance[share.userId][payer] += share.owed
```

Then simplify: `netBalance[A][B] = balance[A][B] - balance[B][A]`. Display only where `netBalance > 0`.

---

## 7. Categories

Fixed preset list (Font Awesome Solid icons, already in codebase):

| Icon class | Label |
|---|---|
| `fa-solid fa-utensils` | Dining |
| `fa-solid fa-bread-slice` | Café / Bakery |
| `fa-solid fa-cart-shopping` | Groceries |
| `fa-solid fa-train` | Transit |
| `fa-solid fa-ticket` | Activities |
| `fa-solid fa-hotel` | Accommodation |
| `fa-solid fa-soap` | Laundry |
| `fa-solid fa-car` | Car / Fuel |
| `fa-solid fa-pump-soap` | Toiletries |
| `fa-solid fa-chair` | Furniture |

In the quick-entry form, categories are displayed as a horizontal strip of icon buttons. One is selected at a time; the strip scrolls horizontally if needed. No text labels in the strip (icon only, with tooltip/label on long-press for accessibility).

---

## 8. Visual Design

### 8.1 Design Principles

- **CSS framework: Bulma 1.0.x**, already installed and partially imported via `src/styles.scss`. Use Bulma classes and components before writing any custom CSS.
- **Dark mode only.** Activate Bulma's built-in dark theme by setting `data-theme="dark"` on `<html>` permanently (no toggle). Bulma's `themes` module is already imported and handles all `--bulma-*` variable overrides automatically.
- **Utility-first.** Use Bulma helper classes (`has-text-*`, `is-flex`, spacing helpers, etc.) for one-off styles. Write custom CSS only when no Bulma equivalent exists.
- **Mobile-optimized.** Touch targets minimum 44×44px. Thumb-zone-friendly layout (action buttons at bottom).
- **Typography:** Bulma's default font stack. Use `.title`, `.subtitle`, `.heading` elements as appropriate.

### 8.2 Spacing & Layout

Use Bulma's built-in spacing helpers (`mt-*`, `mb-*`, `px-*`, etc., on a 0.25rem scale). Bulma's `.container` provides responsive horizontal padding. Section gaps and card spacing use Bulma defaults.

### 8.3 Dark Theme Configuration

Bulma 1.0's `themes` module exposes `--bulma-*` CSS variables. Setting `class="theme-dark"` on `<html>` activates the dark palette automatically.

**Activate in `index.html`:**
```html
<html class="theme-dark">
```

**Balance text colours** use Bulma's semantic colour helpers:

| State | Bulma class |
|---|---|
| "You are owed" (positive) | `has-text-success` |
| "You owe" (negative) | `has-text-danger` |
| "Settled up" (zero) | `has-text-grey` |

No custom colour tokens are needed for these states.

### 8.4 Bulma Component Mapping

| UI Element | Bulma approach |
|---|---|
| Group cards (home + groups list) | `.box` |
| Quick-entry form fields | `.field` / `.control` / `.input` / `.label` |
| Category icon picker | `.buttons.has-addons` with `.button.is-selected` for active state |
| Context selector chips | `.buttons.is-scrollable-x` (already defined in `styles.scss`) with `.button.is-selected` |
| "Add" / primary actions | `.button.is-primary` |
| "Settle Up" sticky button | `.button.is-fullwidth` |
| Section date headers | `.heading` (Bulma helper) or small `<p class="has-text-grey is-size-7 is-uppercase">` |
| Settlement confirmation | `.modal` |
| Loading states | `.progress.is-small.is-primary` (already used throughout) |
| Balance summary rows | `.level` with `.level-left` / `.level-right` |
| Expanded expense detail | Inline block inside the `.box`, revealed with `[hidden]` / `@if` |
| Notifications / empty states | Plain `<p class="has-text-grey">` text |
| Payer dropdown | `.select` / `<select>` wrapped in `.field` |

Add Bulma module imports to `styles.scss` as each component is built, rather than upfront. The settle-up sheet requires `bulma/sass/components/modal` when that feature is implemented.

### 8.5 Number Formatting

- Display: `€12.50` (prefix, 2 decimal places always).
- Storage: integer cents (e.g., `1250` = €12.50).
- Existing `formatNumber` helper must be verified/updated to handle this correctly.
- Do not display cent values like `€12.5` or `€12` — always 2 decimal places.

---

## 9. Navigation & Routing Changes

The redesigned routing replaces the current structure:

| New Route | Component | Notes |
|---|---|---|
| `/` | `LoginView` | Explicit user picker; redirect to `/home` if logged in |
| `/home` | `HomeView` | New — replaces `/groups` as the main screen |
| `/groups` | `GroupsView` | Full list view (existing, minor reskin) |
| `/group/create` | `GroupCreate` | Existing, minor reskin |
| `/group/:groupId` | `GroupView` | Redesigned — combines old group view + expense list |
| `/group/:groupId/edit` | `GroupEdit` | Existing, minor reskin |

**Removed routes:**
- `/group/:groupId/expenses` — merged into `/group/:groupId`
- `/group/:groupId/expenses/add` — replaced by home screen inline form
- `/group/:groupId/expenses/:expenseId/edit` — replaced by inline edit within expanded row

---

## 10. PWA Configuration

PWA support (service worker, manifest, icons, iOS meta tags) is already in place. The only PWA-related concern during feature development is the sticky "Settle Up" button — pad its bottom with `env(safe-area-inset-bottom)` to avoid overlap with the iPhone home indicator.

---

## 11. Personal Expenses

Personal expenses belong to a single-member group auto-created for each user. They are created from the home screen by selecting the **"Personal"** chip in the context selector, which scopes the form to that group.

The quick-entry form in personal mode hides the "Payer" and "per-person split" fields entirely (no "More options" for those). The personal group never shows a balance section.

---

## 12. Edge Cases & Constraints

| Case | Behaviour |
|---|---|
| Amount field: non-numeric input | Input is numeric type; mobile keyboard is numeric by default |
| Amount field: zero | "Add" button is disabled |
| Group split: amounts don't add up to total | Show running difference in red; block submission |
| Group split: one member, no split needed | Split auto-fills to 100% for that member |
| Settling a group with no outstanding debts | "Settle Up" button is disabled or shows "Already settled" |
| Deleting an expense that was part of a settlement | Settlement records are not deletable; regular expenses are |
| Group with only 1 member | No payer selector needed; balance is always €0 |
| Very long group name | Truncate with ellipsis in card; full name shown in detail header |
| Very large expense amount | No upper cap; display must not overflow (use `overflow: hidden` on amount cells) |
| Expense with all `included: false` shares | Invalid; at least one share must be `included: true` |

---

## 13. Out of Scope (this version)

- Multi-currency / exchange rates
- Push notifications
- Data export (CSV/JSON)
- Cloud sync or cross-device sharing
- Equal-split or percentage-split modes (only custom amounts)
- Receipt image capture
- Recurring expenses
- Category customisation
- Budget tracking / spending limits
- Group archive / delete
- Splitwise import
- Native apps
- Backend
- Accessibility
- Statistics
- Multiple payees
- Localization
- Login with Apple/Google/etc.
- Registration

---

## 14. Open Questions

1. ~~**Personal expenses route:** resolved — personal expenses are modelled as a single-member group (the current user). The "Personal" chip in the quick-entry form and the personal expense history both map to this group, navigating to it like any other group.~~
4. **Settle Up: partial settlements:** The spec only covers "settle everything". Should users eventually be able to settle a specific pairwise debt without zeroing all balances?
