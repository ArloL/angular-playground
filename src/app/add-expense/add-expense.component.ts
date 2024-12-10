import { Component, ElementRef, ViewChild } from '@angular/core';

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
  splits = [50, 100, 0, 70, 30];
  selectedSplit = 0;
  selectSplit(index: number) {
    this.selectedSplit = index;
    this.updateSplitted();
  }
  amount = 0;
  currencies = ['€'];
  selectedCurrency = 0;
  selectCurrency(index: number) {
    this.selectedCurrency = index;
  }
  splitted = [
    {
      "name": "Christopher",
      "part": 0,
      "percentage": 0
    }, {
      "name": "Nathaniel",
      "part": 0,
      "percentage": 0
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
    return number.toFixed(digits).toLocaleString();
  }
  parseAmountValue(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.amount = this.customParseFloat(inputElement.value);
    this.updateSplitted();
  }
  updateSplitted() {
    var part = Math.round(this.amount / 100 * this.splits[this.selectedSplit] * 100) / 100;
    this.splitted = [
      {
        "name": "Christopher",
        "part": part,
        "percentage": part / this.amount * 100
      }, {
        "name": "Nathaniel",
        "part": this.amount - part,
        "percentage": (this.amount - part) / this.amount * 100
      }
    ];
  }

}
