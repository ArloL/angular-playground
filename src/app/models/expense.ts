import { Entity, EntityId } from "./entity";
import { Share } from "./share";

export interface Expense extends Entity {
  cost: number,
  description: string,
  currency: string,
  category: string,
  date: Date,
  shares: Share[],
  createdBy: EntityId,
  groupId: EntityId,
}

export interface NewExpense extends Omit<Expense, keyof Entity> {
}
