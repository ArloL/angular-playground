import { Component } from '@angular/core';

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
  selectedCategory = 0;
  selectCategory(index: number) {
    this.selectedCategory = index;
  }
  amount = 0;
  currencies = ['€'];
  selectedCurrency = 0;
  selectCurrency(index: number) {
    this.selectedCurrency = index;
  }

  splitted: Split[] = [
    {
      "name": "Christopher",
      "part": 0,
      "percentage": 0,
      "included": true
    }, {
      "name": "Nathaniel",
      "part": 0,
      "percentage": 0,
      "included": true
    }, {
      "name": "Samantha",
      "part": 0,
      "percentage": 0,
      "included": true
    }
  ];

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
    return (number / 100).toFixed(digits);
  }

  parseAmountValue(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.amount = Math.round(this.customParseFloat(inputElement.value) * 100);
    this.updateSplitted();
  }

  updateSplitted() {
    const count = this.splitted.filter(s => s.included).length;
    var part;
    var remainder;
    if (count === 0) {
      part = 0;
      remainder = 0;
    } else if (count === 1) {
      part = this.amount;
      remainder = this.amount;
    } else {
      part = Math.round(this.amount / count);
      remainder = Math.round(this.amount - part * (count - 1));
    }
    for (const [i, split] of this.splitted.entries()) {
      if (split.included) {
        if (i === this.splitted.length - 1) {
          split.part = remainder;
        } else {
          split.part = part;
        }
        split.percentage = Math.round(split.part / this.amount * 100);
      } else {
        split.part = 0;
        split.percentage = 0;
      }
    }
  }

  toggleIncluded(item: Split) {
    item.included = !item.included;
    this.updateSplitted();
  }

}
