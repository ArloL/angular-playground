import { inject, Injectable } from '@angular/core';
import { Expense } from '../models/expense';
import { UserStore } from './user-store';
import { groupBy } from 'rxjs';
import { GroupStore } from './group-store';
import { GroupId } from '../models/group';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStore {

  private userStore = inject(UserStore);
  private groupStore = inject(GroupStore);

  private data: Expense[] = [{
    cost: 1800,
    description: 'Bugonia',
    currency: '€',
    category: '🎟️',
    date: new Date(),
    shares: [],
    createdBy: this.userStore.first().id,
    groupId: this.groupStore.first().id,
  }];

  add(item: Expense): void {
    this.data.push(item)
  }

  all(): Expense[] {
    return [...this.data]
  }

  findByGroupId(groupId : GroupId): Expense[] {
    return this.data.filter(expense => expense.groupId === groupId);
  }

}
