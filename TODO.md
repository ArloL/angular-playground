# TODO

Ordered by implementation sequence. Each item is a user-facing feature; technical prerequisites (model changes, services, routing, imports) are noted inline and done as part of that feature.

---

- [ ] **Group detail** — Unified group page replacing the current split `GroupView` + `GroupExpenses`.
  - **Balance section:** Pairwise balances at the top, current-user-relative language (`"You owe …"` / `"… owes you"`). Hidden when zero.
  - **Expense list:** Date-grouped (`Today`, `Yesterday`, `Mon 3 Mar`…), newest first. Settlement records shown in muted style with no actions.
  - **Tap to expand:** Reveals full description, payer, per-person split, Edit + Delete actions. Expanding one row collapses any other.
  - **Inline edit:** Edit amount and note only within the expanded row. No navigation.
  - **Delete:** Removes expense, collapses row. No confirmation.
  - **Settle up:** Sticky button at bottom (safe-area padded), disabled when all balances zero. Tapping opens confirmation sheet showing full debt summary; confirming writes one settlement record per non-zero directional debt.
  - Keep existing routes `/group/:groupId/expenses`, `/group/:groupId/expenses/add`, `/group/:groupId/expenses/:expenseId/edit`.
  - Add `Expense.type: 'expense' | 'settlement'` and update `NewExpense` when building settle-up.
  - Add `bulma/sass/components/modal` to `styles.scss` when building the settle-up sheet.
  - See SPEC §5.3, §6.1, §6.3.

- [ ] **Groups list** — Personal row pinned at the top (expense count, no balance, visual separator below). Then shared groups sorted by most recent expense, each showing net balance. "New Group" button at bottom. Empty state (no shared groups): `"No groups yet"` below the personal row.
  - Reuses `BalanceService` and `ExpenseStore.findRecentGroupActivity()` from the home screen feature.
  - See SPEC §5.2.

- [ ] **Group edit** — Pre-populated form (name + member checkboxes) accessible from the group detail overflow menu. Members can be added or removed post-creation. Block removal of a member with unsettled expenses; show an inline error directing the user to settle up first.
  - When a member is newly checked, show an inline period picker (All time / Last 30 days / Last 10 days / Last 7 days / Last 3 days / None), defaulting to **All time**. Show matching expense count and a fixed "splits will change to equal" note. On save, for each matched expense: add the new member with `included: true` and recalculate equal shares across all current group members — `floor(cost / memberCount)` each, remainder to payer. Overwrites any existing custom splits.
  - See SPEC §5.4a.

- [ ] **Login screen** — Explicit user picker: list all users from `UserStore`, tap to select, navigate to `/home`. Replaces the current random-login mechanic.
  - Update `CurrentUserService.login()` to accept a `userId` parameter.
  - Add `/home` route (stub `HomeView`) and update `/` to redirect to `/home` when logged in.
  - See SPEC §3.

---

## Open Questions


