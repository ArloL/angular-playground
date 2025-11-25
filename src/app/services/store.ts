import { generateId } from "../helper/generate-id";
import { Entity, EntityId } from "../models/entity";

export interface Store<T extends Entity> {
  save(entity: Omit<T, keyof Entity> | T): Promise<T>;
  findById(primaryKey: EntityId): Promise<T>;
  findAll(): Promise<T[]>;
  count(): Promise<number>;
  delete(entity: T): Promise<void>;
  existsById(primaryKey: EntityId): Promise<boolean>;
  findWithFilter(predicate: (value: T, index: number, array: T[]) => unknown): Promise<T[]>;
}

export abstract class AbstractStore<T extends Entity> implements Store<T> {

  protected data: T[] = [];
  protected index: Map<EntityId, number> = new Map();

  timeout: number = 0;

  private reindex(): void {
    this.index = new Map();
    this.data.forEach((entity, index) => {
      this.index.set(entity.id, index);
    });
  }

  private saveSync(entity: T | Omit<T, keyof Entity>): T {
    if ('id' in entity && this.index.has(entity.id)) {
      var updatedUser = {
        ...entity,
        updatedAt: new Date(),
      };
      this.data[this.index.get(entity.id)!] = updatedUser;
      return updatedUser;
    } else {
      var newUser = {
        ...entity,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T;
      var index = this.data.push(newUser);
      this.index.set(newUser.id, index - 1);
      return newUser;
    }
  }

  save(entity: T | Omit<T, keyof Entity>): Promise<T> {
    return new Promise<T>((resolve) => {
      setTimeout(() => {
        resolve(this.saveSync(entity));
      }, this.timeout);
    });
  }

  findById(primaryKey: EntityId): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        if (this.index.has(primaryKey)) {
          resolve(this.data[this.index.get(primaryKey)!]);
        } else {
          reject();
        }
      }, this.timeout);
    });
  }

  findAll(): Promise<T[]> {
    return new Promise<T[]>((resolve) => {
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

  delete(entity: T): Promise<void> {
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

  findWithFilter(predicate: (value: T, index: number, array: T[]) => unknown): Promise<T[]> {
    return new Promise<T[]>((resolve) => {
      setTimeout(() => {
        resolve(this.data
          .filter(predicate)
          .map((value: T) => {
            return { ...value };
          }));
      }, this.timeout);
    });
  }

}
