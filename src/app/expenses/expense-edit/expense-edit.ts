import {
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { customParseFloat } from '../../helper/custom-parse-float';
import { randomNumberBetweenZeroAndMax } from '../../helper/random-numbers';
import { ExpenseStore } from '../../services/expense-store';
import { EntityId } from '../../models/entity';
import { Router } from '@angular/router';
import { categories, currencies, Expense } from '../../models/expense';
import { formatNumber } from '../../helper/format-number';
import { Share, ShareRaw } from '../../models/share';
import { UserStore } from '../../services/user-store';

@Component({
  selector: 'apezzi-expense-edit',
  imports: [],
  templateUrl: './expense-edit.html',
  styleUrl: './expense-edit.scss',
})
export class ExpenseEdit {
  readonly groupId = input.required<EntityId>();
  readonly expenseId = input.required<EntityId>();

  userStore = inject(UserStore);
  private expenseStore = inject(ExpenseStore);
  private router = inject(Router);

  formatNumber = formatNumber;
  currencies = currencies;
  categories = categories;

  selectedCurrency = 0;
  selectedCategory = signal(0);

  costRaw = signal('');
  descriptionRaw = signal('');

  resourceData = resource({
    params: () => ({ id: this.expenseId() }),
    loader: async ({ params }) => {
      const expense = await this.expenseStore.findById(params.id);
      const users = await this.userStore.findByIds(
        expense.shares.map((s) => s.userId),
      );
      const userNames = new Map<EntityId, string>();
      users.forEach((u) => userNames.set(u.id, u.name));
      return { expense, userNames };
    },
  });

  expenseLoadEffect = effect(() => {
    if (this.resourceData.hasValue()) {
      this.costRaw.set(formatNumber(this.resourceData.value().expense.cost));
      this.descriptionRaw.set(this.resourceData.value().expense.description);
      this.selectedCategory.set(
        this.categories.indexOf(this.resourceData.value().expense.category),
      );
    }
  });

  expenseData: Signal<Expense> = computed(() => {
    if (!this.resourceData.hasValue()) {
      return {
        id: '',
        cost: 0,
        description: '',
        currency: '',
        category: '',
        date: new Date(),
        shares: [],
        createdBy: '',
        groupId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return {
      ...this.resourceData.value()?.expense,
      cost: customParseFloat(this.costRaw()),
      description: this.descriptionRaw(),
      category: this.categories[this.selectedCategory()],
    };
  });

  sharesRaw: WritableSignal<ShareRaw[]> = signal([]);
  sharesRawInitialize = effect(() => {
    if (this.resourceData.hasValue()) {
      this.sharesRaw.set(
        this.resourceData.value()?.expense.shares.map((share) => {
          return {
            userId: share.userId,
            owed: '',
            included: share.included,
          };
        }),
      );
    }
  });

  shares: Signal<Share[]> = computed(() => {
    const numberOfIncludedShares = this.sharesRaw().filter(
      (s) => s.included,
    ).length;
    const amountManuallyDistributed = this.sharesRaw()
      .filter((s) => s.included)
      .map((s) => customParseFloat(s.owed))
      .reduce((a, b) => a + b, 0);
    const amountToDistributeAutomatically = Math.max(
      0,
      this.expenseData().cost - amountManuallyDistributed,
    );
    const numberOfComputedShares = this.sharesRaw()
      .filter((s) => s.included)
      .filter((s) => s.owed === '').length;
    let whichIndexGetsTheRemainder = randomNumberBetweenZeroAndMax(
      numberOfComputedShares,
    );
    let automaticallyDistributedAmount: number;
    let remainderForExactDistribution: number;
    if (numberOfIncludedShares === 0) {
      automaticallyDistributedAmount = 0;
      remainderForExactDistribution = 0;
    } else if (numberOfIncludedShares === 1) {
      automaticallyDistributedAmount = this.expenseData().cost;
      remainderForExactDistribution = this.expenseData().cost;
    } else {
      automaticallyDistributedAmount = Math.round(
        amountToDistributeAutomatically / numberOfComputedShares,
      );
      remainderForExactDistribution = Math.round(
        amountToDistributeAutomatically -
          automaticallyDistributedAmount * (numberOfComputedShares - 1),
      );
    }
    return this.sharesRaw().map((shareRaw) => {
      const share: Share = {
        userId: shareRaw.userId,
        included: shareRaw.included,
        owed: customParseFloat(shareRaw.owed),
      };
      if (shareRaw.included && shareRaw.owed === '') {
        if (whichIndexGetsTheRemainder === 0) {
          share.owed = remainderForExactDistribution;
        } else {
          share.owed = automaticallyDistributedAmount;
        }
        whichIndexGetsTheRemainder--;
      }
      return share;
    });
  });

  saveEnabled = computed(() => {
    const sumOfShares = this.shares()
      .filter((s) => s.included)
      .map((s) => s.owed)
      .reduce((a, b) => a + b, 0);
    return (
      this.expenseData().cost > 0 && sumOfShares === this.expenseData().cost
    );
  });

  errorMessage = signal('');
  saving = signal(false);

  async save() {
    if (this.resourceData.hasValue()) {
      this.saving.set(true);
      this.errorMessage.set('');
      try {
        const data = { ...this.expenseData(), shares: this.shares() };
        await this.expenseStore.save(data);
        this.router.navigate(['/group', this.groupId(), 'expenses']);
      } catch (e) {
        this.errorMessage.set(String(e));
      } finally {
        this.saving.set(false);
      }
    }
  }

  toggleIncluded(index: number) {
    this.sharesRaw.update((value) => {
      value[index].included = !value[index].included;
      return [...value];
    });
  }

  updateShareOwed(index: number, owed: string) {
    this.sharesRaw.update((value) => {
      value[index].owed = owed;
      return [...value];
    });
  }
}
