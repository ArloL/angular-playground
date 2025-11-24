import { Injectable, Optional } from '@angular/core';
import { generateId } from '../helper/generate-id';
import { NewUser, User } from '../models/user';
import { Store } from './store';
import { EntityId } from '../models/entity';

@Injectable({
  providedIn: 'root',
})
export class UserStore implements Store<User> {

  private data: User[] = [];
  private index: Map<EntityId, number> = new Map();

  timeout: number = 0;

  private reindex(): void {
    this.index = new Map();
    this.data.forEach((entity, index) => {
      this.index.set(entity.id, index);
    });
  }

  private saveSync(entity: User | NewUser): User {
    if ('id' in entity && this.index.has(entity.id)) {
      var newUser: User = {
        ...entity,
        updatedAt: new Date(),
      };
      this.data[this.index.get(entity.id)!] = newUser;
      return newUser;
    } else {
      var newUser: User = {
        ...entity,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      var index = this.data.push(newUser);
      this.index.set(newUser.id, index - 1);
      return newUser;
    }
  }

  save(entity: User | NewUser): Promise<User> {
    return new Promise<User>((resolve) => {
      setTimeout(() => {
        resolve(this.saveSync(entity));
      }, this.timeout);
    });
  }

  findById(primaryKey: EntityId): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        if (this.index.has(primaryKey)) {
          resolve(this.data[this.index.get(primaryKey)!]);
        } else {
          reject();
        }
      }, this.timeout);
    });
  }

  findAll(): Promise<User[]> {
    return new Promise<User[]>((resolve) => {
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

  delete(entity: User): Promise<void> {
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

}
