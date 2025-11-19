import { GroupId } from "./group";
import { Share } from "./share";
import { UserId } from "./user";

export interface Expense {
  cost: number,
  description: string,
  currency: string,
  category: string,
  date: Date,
  shares: Share[],
  createdBy: UserId,
  groupId: GroupId,
}
