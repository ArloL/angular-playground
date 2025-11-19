import { Share } from "./share";

export interface Expense {
  cost: number,
  description: string,
  currency: string,
  category: string,
  date: Date,
  shares: Share[],
}
