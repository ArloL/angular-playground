import { EntityId } from "./entity";

export interface ShareRaw {
  userId: EntityId,
  owed: string,
  included: boolean,
}

export interface Share {
  userId: EntityId,
  owed: number,
  included: boolean,
}
