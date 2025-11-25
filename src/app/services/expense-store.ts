import { Injectable } from '@angular/core';
import { EntityId } from '../models/entity';
import { Expense } from '../models/expense';
import { AbstractStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStore extends AbstractStore<Expense> {

  findByGroupId(groupId: EntityId): Promise<Expense[]> {
    return this.findWithFilter(expense => expense.groupId === groupId);
  }

}
