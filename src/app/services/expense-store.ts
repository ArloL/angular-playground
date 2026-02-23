import { Injectable } from '@angular/core';
import { EntityId } from '../models/entity';
import { Expense } from '../models/expense';
import { AbstractStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStore extends AbstractStore<Expense> {
  public async findByGroupIdSortByDateDesc(groupId: EntityId): Promise<Expense[]> {
    const expenses = await this.findWithFilter((expense) => expense.groupId === groupId);
    return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
