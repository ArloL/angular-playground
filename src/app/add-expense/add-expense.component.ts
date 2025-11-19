import { Component, computed, Signal, signal, WritableSignal } from '@angular/core';

interface Expense {
  cost: number,
  description: string,
  currency: string,
  category: string,
  date: Date,
  shares: Share[],
}

interface Share {
  name: string,
  owed: number,
  included: boolean,
}

interface ShareRaw {
  name: string,
  owed: string,
  included: boolean,
}

@Component({
  selector: 'apezzi-add-expense',
  standalone: true,
  imports: [],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss'
})
export class AddExpenseComponent {

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

  groupMembers = ["Christopher", "Nathaniel", "Samantha"];

  sharesRaw: WritableSignal<ShareRaw[]> = signal([]);

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
        name: shareRaw.name,
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

  constructor() {
    this.reset();
  }

  reset() {
    this.costRaw.set('');
    this.descriptionRaw.set('');
    this.selectedCategory.set(0);
    this.sharesRaw.set(this.groupMembers
      .map((groupMember) => {
        return {
          name: groupMember,
          owed: '',
          included: true
        };
      }));
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

  formatNumber(number: number, digits = 2) {
    if (isNaN(number)) {
      number = 0;
    }
    if (number < 0) {
      number = 0;
    }
    return (number / 100).toLocaleString(navigator.language || 'en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
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
