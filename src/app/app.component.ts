import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
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
  currency = '€';
  splitted = [
    {
      "name": "Arlo",
      "part": 0,
      "percentage": this.splits[this.selectedSplit]
    }, {
      "name": "Roxy",
      "part": 0,
      "percentage": 100 - this.splits[this.selectedSplit]
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
        "name": "Arlo",
        "part": part,
        "percentage": part / this.amount * 100
      }, {
        "name": "Roxy",
        "part": this.amount - part,
        "percentage": (this.amount - part) / this.amount * 100
      }
    ];
  }

  @ViewChild('inputRef') inputRef!: ElementRef;

  ngAfterViewInit() {
    this.inputRef.nativeElement.focus();
  }
}
