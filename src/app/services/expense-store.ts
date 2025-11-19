import { Injectable } from '@angular/core';
import { Expense } from '../models/expense';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStore {

  private data: Expense[] = [];

  addData(item: Expense): void {
    this.data.push(item)
  }

  getData(): Expense[] {
    return [...this.data]
  }

}
