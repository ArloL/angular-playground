import { Entity, EntityId } from './entity';
import { PlainDateLike } from './plain-date-like';
import { Share } from './share';

export interface Expense extends Entity {
  cost: number;
  description: string;
  currency: string;
  category: string;
  date: PlainDateLike;
  shares: Share[];
  createdBy: EntityId;
  groupId: EntityId;
}

export interface NewExpense extends Omit<Expense, keyof Entity> {}

export const currencies = ['€'];

export const categories = [
  'fa-solid fa-utensils',
  'fa-solid fa-bread-slice',
  'fa-solid fa-cart-shopping',
  'fa-solid fa-train',
  'fa-solid fa-ticket',
  'fa-solid fa-hotel',
  'fa-solid fa-soap',
  'fa-solid fa-car',
  'fa-solid fa-pump-soap',
  'fa-solid fa-chair',
];
