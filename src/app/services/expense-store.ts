import { Injectable } from '@angular/core';
import { EntityId } from '../models/entity';
import { Expense } from '../models/expense';
import { AbstractStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStore extends AbstractStore<Expense> {
  public async findByGroupIdSortByDateDesc(
    groupId: EntityId,
    limit: number,
    offset: number,
  ): Promise<{ expenses: Expense[]; total: number }> {
    const all = await this.findWithFilter((expense) => expense.groupId === groupId);
    all.sort((a, b) => b.date.getTime() - a.date.getTime());
    return { expenses: all.slice(offset, offset + limit), total: all.length };
  }
}
