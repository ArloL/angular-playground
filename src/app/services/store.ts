import { inject } from '@angular/core';
import { generateId } from '../helper/generate-id';
import { Entity, EntityId } from '../models/entity';
import { NetworkSimulation } from './network-simulation';

export class EntityNotFoundError extends Error {
  constructor(public readonly id: EntityId) {
    super(`Entity not found: ${id}`);
    this.name = 'EntityNotFoundError';
  }
}

export interface Store<T extends Entity> {
  save(entity: Omit<T, keyof Entity> | T): Promise<T>;
  findById(primaryKey: EntityId): Promise<T>;
  findByIds(primaryKeys: EntityId[]): Promise<T[]>;
  findAll(): Promise<T[]>;
  count(): Promise<number>;
  delete(entity: T): Promise<void>;
  existsById(primaryKey: EntityId): Promise<boolean>;
  findWithFilter(
    predicate: (value: T, index: number, array: T[]) => unknown,
  ): Promise<T[]>;
}

export abstract class AbstractStore<T extends Entity> implements Store<T> {
  protected data: T[] = [];
  protected index: Map<EntityId, number> = new Map();

  readonly networkSimulation = inject(NetworkSimulation);

  private reindex(): void {
    this.index = new Map();
    this.data.forEach((entity, index) => {
      this.index.set(entity.id, index);
    });
  }

  private saveSync(entity: T | Omit<T, keyof Entity>): T {
    if ('id' in entity && this.index.has(entity.id)) {
      const updatedUser = {
        ...entity,
        updatedAt: new Date(),
      };
      this.data[this.index.get(entity.id)!] = updatedUser;
      return updatedUser;
    } else {
      const newUser = {
        ...entity,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T;
      const index = this.data.push(newUser);
      this.index.set(newUser.id, index - 1);
      return newUser;
    }
  }

  save(entity: T | Omit<T, keyof Entity>): Promise<T> {
    return this.networkSimulation.wrap(() => this.saveSync(entity));
  }

  findById(primaryKey: EntityId): Promise<T> {
    return this.networkSimulation.wrap(() => {
      if (this.index.has(primaryKey)) {
        return this.data[this.index.get(primaryKey)!];
      }
      throw new EntityNotFoundError(primaryKey);
    });
  }

  findByIds(primaryKeys: EntityId[]): Promise<T[]> {
    return this.networkSimulation.wrap(() =>
      primaryKeys.map((key) => {
        if (this.index.has(key)) {
          return this.data[this.index.get(key)!];
        }
        throw new EntityNotFoundError(key);
      }),
    );
  }

  findAll(): Promise<T[]> {
    return this.networkSimulation.wrap(() =>
      this.data.map((value) => ({ ...value })),
    );
  }

  count(): Promise<number> {
    return this.networkSimulation.wrap(() => this.data.length);
  }

  delete(entity: T): Promise<void> {
    return this.networkSimulation.wrap(() => {
      if (this.index.has(entity.id)) {
        this.data.splice(this.index.get(entity.id)!, 1);
        this.reindex();
        return;
      }
      throw new EntityNotFoundError(entity.id);
    });
  }

  existsById(primaryKey: string): Promise<boolean> {
    return this.networkSimulation.wrap(() => this.index.has(primaryKey));
  }

  findWithFilter(
    predicate: (value: T, index: number, array: T[]) => unknown,
  ): Promise<T[]> {
    return this.networkSimulation.wrap(() =>
      this.data.filter(predicate).map((value: T) => ({ ...value })),
    );
  }
}
