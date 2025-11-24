import { Injectable } from '@angular/core';
import { generateId } from '../helper/generate-id';
import { EntityId } from '../models/entity';
import { Expense, NewExpense } from '../models/expense';
import { Store } from './store';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStore implements Store<Expense> {

  private data: Expense[] = [];
  private index: Map<EntityId, number> = new Map();

  timeout: number = 0;

  private reindex(): void {
    this.index = new Map();
    this.data.forEach((entity, index) => {
      this.index.set(entity.id, index);
    });
  }

  private saveSync(entity: Expense | NewExpense): Expense {
    if ('id' in entity && this.index.has(entity.id)) {
      var newExpense: Expense = {
        ...entity,
        updatedAt: new Date(),
      };
      this.data[this.index.get(entity.id)!] = newExpense;
      return newExpense;
    } else {
      var newExpense: Expense = {
        ...entity,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      var index = this.data.push(newExpense);
      this.index.set(newExpense.id, index - 1);
      return newExpense;
    }
  }

  save(entity: Expense | NewExpense): Promise<Expense> {
    return new Promise<Expense>((resolve) => {
      setTimeout(() => {
        resolve(this.saveSync(entity));
      }, this.timeout);
    });
  }

  findById(primaryKey: EntityId): Promise<Expense> {
    return new Promise<Expense>((resolve, reject) => {
      setTimeout(() => {
        if (this.index.has(primaryKey)) {
          resolve(this.data[this.index.get(primaryKey)!]);
        } else {
          reject();
        }
      }, this.timeout);
    });
  }

  findAll(): Promise<Expense[]> {
    return new Promise<Expense[]>((resolve) => {
      setTimeout(() => {
        resolve(this.data.map((value) => {
          return { ...value };
        }));
      }, this.timeout);
    });
  }

  count(): Promise<number> {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(this.data.length);
      }, this.timeout);
    });
  }

  delete(entity: Expense): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (this.index.has(entity.id)) {
          this.data.splice(this.index.get(entity.id)!, 1);
          this.reindex();
          resolve();
        } else {
          reject();
        }
      }, this.timeout);
    });
  }

  existsById(primaryKey: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(this.index.has(primaryKey));
      }, this.timeout);
    });
  }

  findByGroupId(groupId: EntityId): Promise<Expense[]> {
    return new Promise<Expense[]>((resolve, reject) => {
      setTimeout(() => {
        resolve(this.data
          .filter(expense => expense.groupId === groupId)
          .map((value) => {
            return { ...value };
          });
      }, this.timeout);
    });
  }


}
