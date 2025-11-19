import { UserId } from "./user";

export interface Share {
  userId: UserId,
  owed: number,
  included: boolean,
}
