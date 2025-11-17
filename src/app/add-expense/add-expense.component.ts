import { Component, computed, signal, WritableSignal } from '@angular/core';

interface Split {
  name: string,
  part: number,
  percentage: number,
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
  amount = computed(() => Math.round(this.customParseFloat(this.amountRaw()) * 100));

  saveEnabled = computed(() => {
    const sumOfSplits = this.splits()
      .map(s => s.part)
      .reduce((a, b) => a + b, 0);
    return this.amount() > 0 && sumOfSplits == this.amount();
  });

  currencies = ['€'];
  selectedCurrency = 0;

  groupMembers = ["Christopher", "Nathaniel", "Samantha"];

  splitsRaw: WritableSignal<Split[]> = signal(this.groupMembers.map((groupMember) => {
    return {
      name: groupMember,
      part: NaN,
      percentage: NaN,
      included: true
    };
  }));

  splits = computed(() => {
    const count = this.splitsRaw().filter(s => s.included).length;
    const amountManuallyDistributed = this.splitsRaw().filter(s => !Number.isNaN(s.part)).map(s => s.part).reduce((a, b) => a + b, 0);
    const amountToDistributeAutomatically = this.amount() - amountManuallyDistributed;
    const numberOfComputedSplits = this.splitsRaw().filter(s => s.included).filter(s => Number.isNaN(s.part)).length;
    var whichIndexGetsTheRemainder = this.randomNumberBetweenZeroAndMax(numberOfComputedSplits);
    var part: number;
    var remainder: number;
    if (count === 0) {
      part = 0;
      remainder = 0;
    } else if (count === 1) {
      part = this.amount();
      remainder = this.amount();
    } else {
      part = Math.round(amountToDistributeAutomatically / numberOfComputedSplits);
      remainder = Math.round(amountToDistributeAutomatically - part * (numberOfComputedSplits - 1));
    }
    return this.splitsRaw().map((split, i) => {
      const newSplit = { ...split }
      if (newSplit.included) {
        if (Number.isNaN(newSplit.part)) {
          if (whichIndexGetsTheRemainder == 0) {
            newSplit.part = remainder;
          } else {
            newSplit.part = part;
          }
          whichIndexGetsTheRemainder--;
        }
        newSplit.percentage = Math.round(newSplit.part / this.amount() * 100);
      } else {
        newSplit.part = 0;
        newSplit.percentage = 0;
      }
      return newSplit
    });
  });

  randomNumberBetweenZeroAndMax(max: number) {
    return Math.floor(Math.random() * max);
  }

  customParseFloat(str: string) {
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
    return Number.parseFloat(str);
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
      value[index].part = Math.round(this.customParseFloat(part) * 100);
      return [...value];
    });
  }

}
