import { EntityId } from "./entity";

export interface Share {
  userId: EntityId,
  owed: number,
  included: boolean,
}
