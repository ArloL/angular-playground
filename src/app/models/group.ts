import { UserId } from "./user";

export type GroupId = string;

export interface Group {
  id: GroupId,
  name: string,
  users: UserId[],
  createdAt: Date,
  updatedAt: Date,
  createdBy: UserId,
}
