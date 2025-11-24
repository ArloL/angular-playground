import { Entity } from "./entity";

export interface User extends Entity {
  name: string,
}

export interface NewUser extends Omit<User, keyof Entity> {
}
