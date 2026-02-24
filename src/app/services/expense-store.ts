import { Injectable } from '@angular/core';
import { EntityId } from '../models/entity';
import { Expense } from '../models/expense';
import { AbstractStore } from './store';
import { PlainDateLike } from '../models/plain-date-like';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStore extends AbstractStore<Expense> {
  public async findByGroupIdSortByDateDesc(
    groupId: EntityId,
    limit: number,
    offset: number,
  ): Promise<{ expenses: Expense[]; total: number }> {
    const all = await this.findWithFilter(
      (expense) => expense.groupId === groupId,
    );
    all.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());
    return { expenses: all.slice(offset, offset + limit), total: all.length };
  }

  public async findRecentGroupActivity(
    groupIds: EntityId[],
  ): Promise<{ groupId: EntityId; mostRecentDate: PlainDateLike | null }[]> {
    const result: {
      groupId: EntityId;
      mostRecentDate: PlainDateLike | null;
    }[] = [];
    for (const groupId of groupIds) {
      const { expenses } = await this.findByGroupIdSortByDateDesc(
        groupId,
        1,
        0,
      );
      result.push({
        groupId,
        mostRecentDate: expenses.length > 0 ? expenses[0].date : null,
      });
    }
    return result.sort((a, b) => {
      if (a.mostRecentDate === null && b.mostRecentDate === null) return 0;
      if (a.mostRecentDate === null) return 1;
      if (b.mostRecentDate === null) return -1;
      return (
        b.mostRecentDate.toDate().getTime() -
        a.mostRecentDate.toDate().getTime()
      );
    });
  }
}
