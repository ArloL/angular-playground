import { inject, Injectable } from '@angular/core';
import { Group, NewGroup } from '../models/group';
import { generateId } from '../helper/generate-id';
import { UserStore } from './user-store';
import { Store } from './store';
import { EntityId } from '../models/entity';

@Injectable({
  providedIn: 'root',
})
export class GroupStore implements Store<Group> {

  private userStore = inject(UserStore);

  private data: Group[] = [];
  private index: Map<EntityId, number> = new Map();

  timeout: number = 0;

  private reindex(): void {
    this.index = new Map();
    this.data.forEach((entity, index) => {
      this.index.set(entity.id, index);
    });
  }

  private saveSync(entity: Group | NewGroup): Group {
    if ('id' in entity && this.index.has(entity.id)) {
      var newGroup: Group = {
        ...entity,
        updatedAt: new Date(),
      };
      this.data[this.index.get(entity.id)!] = newGroup;
      return newGroup;
    } else {
      var newGroup: Group = {
        ...entity,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      var index = this.data.push(newGroup);
      this.index.set(newGroup.id, index - 1);
      return newGroup;
    }
  }

  save(entity: Group | NewGroup): Promise<Group> {
    return new Promise<Group>((resolve) => {
      setTimeout(() => {
        resolve(this.saveSync(entity));
      }, this.timeout);
    });
  }

  findById(primaryKey: EntityId): Promise<Group> {
    return new Promise<Group>((resolve, reject) => {
      setTimeout(() => {
        if (this.index.has(primaryKey)) {
          resolve(this.data[this.index.get(primaryKey)!]);
        } else {
          reject();
        }
      }, this.timeout);
    });
  }

  findAll(): Promise<Group[]> {
    return new Promise<Group[]>((resolve) => {
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

  delete(entity: Group): Promise<void> {
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
