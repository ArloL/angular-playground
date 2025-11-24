import { Injectable } from '@angular/core';
import { EntityId } from '../models/entity';
import { Expense } from '../models/expense';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStore {

  private data: Expense[] = [];

  add(item: Expense): void {
    this.data.push(item)
  }

  all(): Expense[] {
    return [...this.data]
  }

  findByGroupId(groupId : EntityId): Expense[] {
    return this.data.filter(expense => expense.groupId === groupId);
  }

}
