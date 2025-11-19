import { Component, computed, effect, inject, input, Signal, signal, WritableSignal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { formatNumber } from '../helper/format-number';
import { Expense } from '../models/expense';
import { GroupId } from '../models/group';
import { Share } from '../models/share';
import { UserId } from '../models/user';
import { ExpenseStore } from '../services/expense-store';
import { GroupStore } from '../services/group-store';
import { UserStore } from '../services/user-store';

interface ShareRaw {
  userId: UserId,
  owed: string,
  included: boolean,
}

@Component({
  selector: 'apezzi-add-expense',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss'
})
export class AddExpenseComponent {

  expenseStore = inject(ExpenseStore);
  groupStore = inject(GroupStore);
  userStore = inject(UserStore);

  formatNumber = formatNumber;

  groupId = input.required<GroupId>();

  title = 'apezzi';
  categories = ['🍽️', '🥐', '🛒', '🚂', '🎟️', '🏨', '🧽', '🚗', '🧴', '🪑'];
  selectedCategory = signal(0);

  costRaw = signal('');
  descriptionRaw = signal('');
  expense: Signal<Expense> = computed(() => {
    return {
      cost: this.customParseFloat(this.costRaw()),
      description: '',
      currency: '€',
      category: this.categories[this.selectedCategory()],
      date: new Date(),
      shares: [],
      createdBy: this.userStore.first().id,
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

  currencies = ['€'];
  selectedCurrency = 0;

  sharesRaw: WritableSignal<ShareRaw[]> = signal([]);
  sharesRawInitialize = effect(() => {
    const group = this.groupStore.findById(this.groupId());
    this.sharesRaw.set(group.users
      .map((userId) => {
        return {
          userId: userId,
          owed: '',
          included: true
        };
      }));
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

  save() {
    this.expenseStore.add(this.expense());
    this.reset();
  }

  reset() {
    this.costRaw.set('');
    this.descriptionRaw.set('');
    this.selectedCategory.set(0);
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
