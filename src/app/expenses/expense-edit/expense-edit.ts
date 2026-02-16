import { Component, computed, effect, inject, input, resource, Signal, signal, WritableSignal } from '@angular/core';
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

  expense = resource({
    params: () => ({ id: this.expenseId() }),
    loader: ({ params }) => this.expenseStore.findById(params.id),
  });

  expenseLoadEffect = effect(() => {
      const g = this.expense.value();
      if (g) {
        this.costRaw.set(formatNumber(g.cost));
        this.descriptionRaw.set(g.description);
        this.selectedCategory.set(this.categories.indexOf(g.category));
      }
    });

  expenseData: Signal<Expense> = computed(() => {
    const loaded = this.expense.value();
    if (!loaded) {
      return {
        id: '', cost: 0, description: '', currency: '', category: '',
        date: new Date(), shares: [], createdBy: '', groupId: '',
        createdAt: new Date(), updatedAt: new Date(),
      };
    }
    return {
      ...loaded,
      cost: customParseFloat(this.costRaw()),
      description: this.descriptionRaw(),
      category: this.categories[this.selectedCategory()],
    };
  });

  userNames = resource({
    params: () => {
      const e = this.expense.value();
      if (!e) return undefined;
      return { userIds: e.shares.map(s => s.userId) };
    },
    loader: async ({ params }) => {
      const map = new Map<EntityId, string>();
      const users = await Promise.all(params.userIds.map(id => this.userStore.findById(id)));
      users.forEach(u => map.set(u.id, u.name));
      return map;
    },
  });

  sharesRaw: WritableSignal<ShareRaw[]> = signal([]);
  sharesRawInitialize = effect(() => {
    const e = this.expense.value();
    if (e) {
      this.sharesRaw.set(e.shares
        .map((share => {
          return {
            userId: share.userId,
            owed: '',
            included: share.included,
          };
        })));
    }
  });

  shares: Signal<Share[]> = computed(() => {
    const numberOfIncludedShares = this.sharesRaw()
      .filter(s => s.included)
      .length;
    const amountManuallyDistributed = this.sharesRaw()
      .filter(s => s.included)
      .map(s => customParseFloat(s.owed))
      .reduce((a, b) => a + b, 0);
    const amountToDistributeAutomatically = Math.max(0, this.expenseData().cost - amountManuallyDistributed);
    const numberOfComputedShares = this.sharesRaw()
      .filter(s => s.included)
      .filter(s => s.owed === '')
      .length;
    var whichIndexGetsTheRemainder = randomNumberBetweenZeroAndMax(numberOfComputedShares);
    var automaticallyDistributedAmount: number;
    var remainderForExactDistribution: number;
    if (numberOfIncludedShares === 0) {
      automaticallyDistributedAmount = 0;
      remainderForExactDistribution = 0;
    } else if (numberOfIncludedShares === 1) {
      automaticallyDistributedAmount = this.expenseData().cost;
      remainderForExactDistribution = this.expenseData().cost;
    } else {
      automaticallyDistributedAmount = Math.round(amountToDistributeAutomatically / numberOfComputedShares);
      remainderForExactDistribution = Math.round(amountToDistributeAutomatically - automaticallyDistributedAmount * (numberOfComputedShares - 1));
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
      .filter(s => s.included)
      .map(s => s.owed)
      .reduce((a, b) => a + b, 0);
    return this.expenseData().cost > 0 && sumOfShares === this.expenseData().cost;
  });

  save() {
    if (this.expense.hasValue()) {
      const data = { ...this.expenseData(), shares: this.shares() };
      this.expenseStore.save(data)
        .finally(() => this.router.navigate(['/group', this.groupId(), 'expenses']));
    }
  }

  randomNumberBetweenZeroAndMax(max: number) {
    return Math.floor(Math.random() * max);
  }

  customParseFloat(str: string) {
    if (str === '') {
      return 0;
    }
    const commas = (str.match(/,/g) || []).length;
    if (commas === 1) {
      str = str.replace(',', '.');
    } else if (commas > 1) {
      str = str.replaceAll(',', '');
    }
    const dots = (str.match(/\./g) || []).length;
    if (dots > 1) {
      str = str.replace('.', '');
    }
    return Math.round(Number.parseFloat(str) * 100);
  }

  toggleIncluded(index: number) {
    this.sharesRaw.update(value => {
      value[index].included = !value[index].included;
      return [...value];
    });
  }

  updateShareOwed(index: number, owed: string) {
    this.sharesRaw.update(value => {
      value[index].owed = owed;
      return [...value];
    });
  }

}
