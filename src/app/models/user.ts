import { Entity, EntityId } from './entity';

export interface User extends Entity {
  name: string;
  email: string;
  friends: EntityId[];
}

export interface NewUser extends Omit<User, keyof Entity> {}
