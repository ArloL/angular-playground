import { Entity, EntityId } from "../models/entity";

export interface Store<T extends Entity> {
  save(entity: Omit<T, keyof Entity> | T): Promise<T>;
  findById(primaryKey: EntityId): Promise<T>;
  findAll(): Promise<T[]>;
  count(): Promise<number>;
  delete(entity: T): Promise<void>;
  existsById(primaryKey: EntityId): Promise<boolean>;
}
