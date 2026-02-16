import { Component, computed, effect, inject, input, resource, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from "@angular/router";
import { formatNumber } from '../../helper/format-number';
import { customParseFloat } from '../../helper/custom-parse-float';
import { randomNumberBetweenZeroAndMax } from '../../helper/random-numbers';
import { EntityId } from '../../models/entity';
import { categories, currencies, NewExpense } from '../../models/expense';
import { Share, ShareRaw } from '../../models/share';
import { ExpenseStore } from '../../services/expense-store';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';

@Component({
  selector: 'apezzi-expense-create',
  standalone: true,
  templateUrl: './expense-create.html',
  styleUrl: './expense-create.scss'
})
export class ExpenseCreate {

  expenseStore = inject(ExpenseStore);
  groupStore = inject(GroupStore);
  userStore = inject(UserStore);
  router = inject(Router);

  formatNumber = formatNumber;
  currencies = currencies;
  categories = categories;

  readonly groupId = input.required<EntityId>();

  group = resource({
    params: () => ({ id: this.groupId() }),
    loader: ({ params }) => this.groupStore.findById(params.id),
  });

  selectedCurrency = 0;
  selectedCategory = signal(0);

  costRaw = signal('');
  descriptionRaw = signal('');
  expense: Signal<NewExpense> = computed(() => {
    return {
      cost: customParseFloat(this.costRaw()),
      description: '',
      currency: '€',
      category: this.categories[this.selectedCategory()],
      date: new Date(),
      shares: [],
      createdBy: '',
      groupId: this.groupId()
    };
  });

  saveEnabled = computed(() => {
    const sumOfShares = this.shares()
      .filter(s => s.included)
      .map(s => s.owed)
      .reduce((a, b) => a + b, 0);
    return this.expense().cost > 0 && sumOfShares === this.expense().cost;
  });

  userNames = resource({
    params: () => {
      const g = this.group.value();
      if (!g) return undefined;
      return { userIds: g.users };
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
    const g = this.group.value();
    if (g) {
      this.sharesRaw.set(g.users
        .map((userId) => {
          return {
            userId: userId,
            owed: '',
            included: true
          };
        }));
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
    const amountToDistributeAutomatically = Math.max(0, this.expense().cost - amountManuallyDistributed);
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
      automaticallyDistributedAmount = this.expense().cost;
      remainderForExactDistribution = this.expense().cost;
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

  save() {
    this.expenseStore.save(this.expense())
      .then(() => this.router.navigate(['/group', this.groupId(), 'expenses']));
  }

  reset() {
    this.costRaw.set('');
    this.descriptionRaw.set('');
    this.selectedCategory.set(0);
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
