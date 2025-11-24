import { Entity, EntityId } from "./entity";

export interface Group extends Entity {
  name: string,
  users: EntityId[],
  createdBy: EntityId,
}

export interface NewGroup extends Omit<Group, keyof Entity> {
}
