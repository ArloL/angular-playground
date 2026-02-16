import { Component, computed, effect, inject, input, resource, Signal, signal, WritableSignal } from '@angular/core';
import { debounce, form, required } from '@angular/forms/signals';
import { ExpenseStore } from '../../services/expense-store';
import { EntityId } from '../../models/entity';
import { Router } from '@angular/router';
import { categories, currencies, Expense } from '../../models/expense';
import { formatNumber } from '../../helper/format-number';
import { Share } from '../../models/share';
import { UserStore } from '../../services/user-store';
import { AsyncPipe } from '@angular/common';

interface ShareRaw {
  userId: EntityId,
  owed: string,
  included: boolean,
}

@Component({
  selector: 'apezzi-expense-edit',
  imports: [AsyncPipe],
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
        this.expenseData.set({ ...g });
      }
    });

  expenseData = signal<Expense>({
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
    updatedAt: new Date()
  });

  expenseForm = form(this.expenseData, (schemaPath) => {
    debounce(schemaPath.description, 150);
    required(schemaPath.description);
  });

  sharesRaw: WritableSignal<ShareRaw[]> = signal([]);
  sharesRawInitialize = effect(async () => {
    const e = this.expense.value();
    if (e) {
      // e.shares.map(share => share.userId);
      // this.userStore.findById
      this.sharesRaw.set(e.shares
        .map((share => {
          return {
            userId: share.userId,
            owed: formatNumber(share.owed),
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
      .map(s => this.customParseFloat(s.owed))
      .reduce((a, b) => a + b, 0);
    const amountToDistributeAutomatically = Math.max(0, this.expense().cost - amountManuallyDistributed);
    const numberOfComputedShares = this.sharesRaw()
      .filter(s => s.included)
      .filter(s => s.owed === '')
      .length;
    var whichIndexGetsTheRemainder = this.randomNumberBetweenZeroAndMax(numberOfComputedShares);
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
        owed: this.customParseFloat(shareRaw.owed),
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
      this.expenseStore.save(this.expenseData())
        .finally(() => this.router.navigate(['/group', this.groupId(), '/expenses']));
    }
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
