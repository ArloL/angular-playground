import {
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { customParseFloat } from '../../helper/custom-parse-float';
import { formatNumber } from '../../helper/format-number';
import { EntityId } from '../../models/entity';
import { Expense } from '../../models/expense';
import { PlainDateLike } from '../../models/plain-date-like';
import { BalanceService, PairwiseBalance } from '../../services/balance';
import { CurrentUserService } from '../../services/current-user';
import { ExpenseStore } from '../../services/expense-store';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';

@Component({
  selector: 'apezzi-group-view',
  imports: [RouterLink],
  templateUrl: './group-view.html',
  styleUrl: './group-view.scss',
})
export class GroupView {
  public readonly groupId = input.required<EntityId>();

  private readonly groupStore = inject(GroupStore);
  private readonly userStore = inject(UserStore);
  private readonly expenseStore = inject(ExpenseStore);
  private readonly balanceService = inject(BalanceService);
  private readonly currentUserService = inject(CurrentUserService);
  protected readonly router = inject(Router);

  protected resourceData = resource({
    params: () => ({ id: this.groupId() }),
    loader: async ({ params }) => {
      const group = await this.groupStore.findById(params.id);
      const [members, { expenses }] = await Promise.all([
        this.userStore.findByIds(group.users),
        this.expenseStore.findByGroupIdSortByDateDesc(params.id, 10000, 0),
      ]);
      return { group, members, expenses };
    },
  });

  protected expandedExpenseId = signal<EntityId | null>(null);
  protected editingExpenseId = signal<EntityId | null>(null);
  protected editAmountRaw = signal<string>('');
  protected editNoteRaw = signal<string>('');
  protected settleUpOpen = signal<boolean>(false);
  protected isSaving = signal<boolean>(false);

  protected pairwiseBalances = computed(() => {
    const data = this.resourceData.value();
    if (!data) return [];
    return this.balanceService.computePairwiseBalances(data.expenses);
  });

  protected allSettled = computed(() => this.pairwiseBalances().length === 0);

  protected isPersonalGroup = computed(() => {
    const data = this.resourceData.value();
    return data ? data.group.users.length === 1 : true;
  });

  protected groupedExpenses = computed(() => {
    const data = this.resourceData.value();
    if (!data) return [];
    return this.buildDateGroups(data.expenses);
  });

  protected getUserName(id: EntityId): string {
    const data = this.resourceData.value();
    if (!data) return id;
    const member = data.members.find((m) => m.id === id);
    return member?.name ?? id;
  }

  protected balanceLabel(b: PairwiseBalance): string {
    const currentUser = this.currentUserService.user();
    const fromName = this.getUserName(b.from);
    const toName = this.getUserName(b.to);
    if (currentUser && b.from === currentUser.id) {
      return `You owe ${toName}`;
    }
    if (currentUser && b.to === currentUser.id) {
      return `${fromName} owes you`;
    }
    return `${fromName} owes ${toName}`;
  }

  protected formatCost(cents: number): string {
    return `€${formatNumber(cents)}`;
  }

  protected toggleExpand(id: EntityId): void {
    if (this.expandedExpenseId() === id) {
      this.expandedExpenseId.set(null);
      this.cancelEditing();
    } else {
      this.expandedExpenseId.set(id);
    }
  }

  protected startEditing(expense: Expense): void {
    this.editingExpenseId.set(expense.id);
    this.editAmountRaw.set(formatNumber(expense.cost));
    this.editNoteRaw.set(expense.description);
  }

  protected cancelEditing(): void {
    this.editingExpenseId.set(null);
    this.editAmountRaw.set('');
    this.editNoteRaw.set('');
  }

  protected async saveEdit(): Promise<void> {
    const id = this.editingExpenseId();
    if (!id) return;
    const data = this.resourceData.value();
    if (!data) return;
    const expense = data.expenses.find((e) => e.id === id);
    if (!expense) return;
    this.isSaving.set(true);
    try {
      await this.expenseStore.save({
        ...expense,
        cost: customParseFloat(this.editAmountRaw()),
        description: this.editNoteRaw(),
      });
      this.cancelEditing();
      this.resourceData.reload();
    } catch {
      // stay in editing state on error
    } finally {
      this.isSaving.set(false);
    }
  }

  protected async deleteExpense(expense: Expense): Promise<void> {
    try {
      await this.expenseStore.delete(expense);
      this.expandedExpenseId.set(null);
      this.resourceData.reload();
    } catch {
      // ignore
    }
  }

  protected openSettleUp(): void {
    this.settleUpOpen.set(true);
  }

  protected async confirmSettleUp(): Promise<void> {
    const balances = this.pairwiseBalances();
    if (balances.length === 0) return;
    this.isSaving.set(true);
    try {
      for (const balance of balances) {
        await this.expenseStore.save({
          type: 'settlement',
          groupId: this.groupId(),
          cost: balance.amount,
          description: 'Settlement',
          currency: '€',
          category: '',
          date: PlainDateLike.now(),
          createdBy: balance.from,
          shares: [
            { userId: balance.to, owed: balance.amount, included: true },
            { userId: balance.from, owed: 0, included: false },
          ],
        });
      }
      this.settleUpOpen.set(false);
      this.resourceData.reload();
    } catch {
      // ignore
    } finally {
      this.isSaving.set(false);
    }
  }

  private buildDateGroups(
    expenses: Expense[],
  ): { label: string; expenses: Expense[] }[] {
    const now = new Date();
    const todayStr = PlainDateLike.fromDate(now).toString();
    const yesterdayDate = new Date(now.getTime() - 86400000);
    const yesterdayStr = PlainDateLike.fromDate(yesterdayDate).toString();
    const groups = new Map<string, { label: string; expenses: Expense[] }>();

    for (const expense of expenses) {
      const key = expense.date.toString();
      if (!groups.has(key)) {
        let label: string;
        if (key === todayStr) {
          label = 'Today';
        } else if (key === yesterdayStr) {
          label = 'Yesterday';
        } else {
          label = expense.date
            .toDate()
            .toLocaleDateString(navigator.language || 'en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              timeZone: 'UTC',
            });
        }
        groups.set(key, { label, expenses: [] });
      }
      groups.get(key)!.expenses.push(expense);
    }

    return [...groups.values()];
  }
}
