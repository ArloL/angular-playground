import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatNumber } from '../../helper/format-number';
import { BalanceService } from '../../services/balance';
import { CurrentUserService } from '../../services/current-user';
import { ExpenseStore } from '../../services/expense-store';
import { GroupStore } from '../../services/group-store';
import { ExpenseCreate } from '../../expenses/expense-create/expense-create';

@Component({
  selector: 'apezzi-home-view',
  imports: [RouterLink, ExpenseCreate],
  templateUrl: './home-view.html',
  styleUrl: './home-view.scss',
})
export class HomeView {
  private currentUserService = inject(CurrentUserService);
  private groupStore = inject(GroupStore);
  private expenseStore = inject(ExpenseStore);
  private balanceService = inject(BalanceService);

  protected formatNumber = formatNumber;
  protected abs = Math.abs;
  protected currencies = ['€'];

  protected currentUser = this.currentUserService.user;

  protected homeData = resource({
    loader: async () => {
      const user = this.currentUserService.user();
      if (!user) return null;

      const allGroups = await this.groupStore.findAllWhereUserIsPartOf(user.id);

      const personalGroup =
        allGroups.find((g) => g.users.length === 1 && g.users[0] === user.id) ??
        null;

      const sharedGroups = allGroups.filter((g) => g.id !== personalGroup?.id);

      let personalExpenseCount = 0;
      if (personalGroup) {
        try {
          const { total } = await this.expenseStore.findByGroupIdSortByDateDesc(
            personalGroup.id,
            1,
            0,
          );
          personalExpenseCount = total;
        } catch {
          personalExpenseCount = 0;
        }
      }

      const activity = await this.expenseStore.findRecentGroupActivity(
        sharedGroups.map((g) => g.id),
      );

      const sortedSharedGroups = activity
        .map((a) => sharedGroups.find((g) => g.id === a.groupId)!)
        .filter(Boolean);

      const recentSharedGroups = sortedSharedGroups.slice(0, 3);

      const groupBalances = new Map<string, number>();
      for (const group of recentSharedGroups) {
        try {
          const { expenses } =
            await this.expenseStore.findByGroupIdSortByDateDesc(
              group.id,
              10000,
              0,
            );
          const balances =
            this.balanceService.computePairwiseBalances(expenses);
          let netBalance = 0;
          for (const b of balances) {
            if (b.to === user.id) netBalance += b.amount;
            if (b.from === user.id) netBalance -= b.amount;
          }
          groupBalances.set(group.id, netBalance);
        } catch {
          groupBalances.set(group.id, 0);
        }
      }

      return {
        personalGroup,
        personalExpenseCount,
        recentSharedGroups,
        groupBalances,
        allSharedGroups: sortedSharedGroups,
      };
    },
  });

  protected selectedContextId = signal<string | null>(null);

  private contextInitialized = false;
  private initContextEffect = effect(() => {
    if (!this.contextInitialized && this.homeData.hasValue()) {
      const data = this.homeData.value();
      if (data?.personalGroup) {
        this.contextInitialized = true;
        this.selectedContextId.set(data.personalGroup.id);
      }
    }
  });

  protected effectiveContextId = computed(() => {
    return (
      this.selectedContextId() ??
      this.homeData.value()?.personalGroup?.id ??
      null
    );
  });

  protected selectContext(groupId: string) {
    this.selectedContextId.set(groupId);
  }
}
