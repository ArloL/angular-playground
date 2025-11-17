import { Component, computed, Signal, signal, WritableSignal } from '@angular/core';

interface SplitRaw {
  name: string,
  part: string,
  included: boolean,
}

interface Split {
  name: string,
  part: number,
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

  amountRaw = signal('');
  amount = computed(() => this.customParseFloat(this.amountRaw()));

  saveEnabled = computed(() => {
    const sumOfSplits = this.splits()
      .filter(s => s.included)
      .map(s => s.part)
      .reduce((a, b) => a + b, 0);
    return this.amount() > 0 && sumOfSplits === this.amount();
  });

  currencies = ['€'];
  selectedCurrency = 0;

  groupMembers = ["Christopher", "Nathaniel", "Samantha"];

  splitsRaw: WritableSignal<SplitRaw[]> = signal(this.groupMembers
    .map((groupMember) => {
      return {
        name: groupMember,
        part: '',
        included: true
      };
    })
  );

  splits: Signal<Split[]> = computed(() => {
    const numberOfIncludedSplits = this.splitsRaw()
      .filter(s => s.included)
      .length;
    const amountManuallyDistributed = this.splitsRaw()
      .filter(s => s.included)
      .map(s => this.customParseFloat(s.part))
      .reduce((a, b) => a + b, 0);
    const amountToDistributeAutomatically = this.amount() - amountManuallyDistributed;
    const numberOfComputedSplits = this.splitsRaw()
      .filter(s => s.included)
      .filter(s => s.part === '')
      .length;
    var whichIndexGetsTheRemainder = this.randomNumberBetweenZeroAndMax(numberOfComputedSplits);
    var automaticallyDistributedAmount: number;
    var remainderForExactDistribution: number;
    if (numberOfIncludedSplits === 0) {
      automaticallyDistributedAmount = 0;
      remainderForExactDistribution = 0;
    } else if (numberOfIncludedSplits === 1) {
      automaticallyDistributedAmount = this.amount();
      remainderForExactDistribution = this.amount();
    } else {
      automaticallyDistributedAmount = Math.round(amountToDistributeAutomatically / numberOfComputedSplits);
      remainderForExactDistribution = Math.round(amountToDistributeAutomatically - automaticallyDistributedAmount * (numberOfComputedSplits - 1));
    }
    return this.splitsRaw().map((splitRaw) => {
      const split: Split = {
        name: splitRaw.name,
        included: splitRaw.included,
        part: this.customParseFloat(splitRaw.part),
      };
      if (splitRaw.included && splitRaw.part === '') {
        if (whichIndexGetsTheRemainder === 0) {
          split.part = remainderForExactDistribution;
        } else {
          split.part = automaticallyDistributedAmount;
        }
        whichIndexGetsTheRemainder--;
      }
      return split;
    });
  });

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
    this.splitsRaw.update(value => {
      value[index].included = !value[index].included;
      return [...value];
    });
  }

  updatePart(index: number, part: string) {
    this.splitsRaw.update(value => {
      value[index].part = part;
      return [...value];
    });
  }

}
