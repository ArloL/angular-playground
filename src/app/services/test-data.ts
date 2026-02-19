import { inject, Injectable } from '@angular/core';
import { EntityId } from '../models/entity';
import { UserStore } from './user-store';
import { GroupStore } from './group-store';
import { ExpenseStore } from './expense-store';

type ExpenseTemplate = {
  category: string;
  description: string;
  cost: number;
  day: number;
};

const bloemendaalExpenses: ExpenseTemplate[] = [
  { category: '🏨', description: 'Strandhotel', cost: 72000, day: 30 },
  { category: '🚂', description: 'Train', cost: 1840, day: 30 },
  { category: '🚗', description: 'E-bike rental', cost: 5600, day: 29 },
  { category: '🍽️', description: 'Beach Club Tizio', cost: 6800, day: 29 },
  { category: '🎟️', description: 'Nationaal Park', cost: 900, day: 28 },
  { category: '🛒', description: 'Albert Heijn', cost: 4250, day: 28 },
  { category: '🍽️', description: 'Dinner', cost: 14600, day: 27 },
  { category: '🥐', description: 'Bakkerij', cost: 1240, day: 27 },
  { category: '🎟️', description: 'canal boat tour', cost: 3800, day: 26 },
  { category: '🧴', description: 'toiletries', cost: 1560, day: 26 },
  { category: '🍽️', description: 'Woodstock', cost: 5200, day: 25 },
  { category: '🛒', description: 'picnic', cost: 2980, day: 25 },
  { category: '🚗', description: 'Beach parking', cost: 1600, day: 24 },
  { category: '🍽️', description: 'Ijs', cost: 780, day: 24 },
  { category: '🎟️', description: 'Museum', cost: 3600, day: 23 },
  { category: '🧽', description: 'Laundromat', cost: 950, day: 23 },
  { category: '🥐', description: 'coffee & pie', cost: 1080, day: 22 },
  { category: '🍽️', description: 'Borobudur', cost: 8400, day: 22 },
  { category: '🎟️', description: 'Museum', cost: 2800, day: 21 },
  { category: '🚗', description: 'Petrol', cost: 9200, day: 21 },
  { category: '🛒', description: 'Souvenirs', cost: 1450, day: 20 },
  { category: '🍽️', description: 'fish dinner', cost: 7600, day: 20 },
  { category: '🥐', description: 'Broodjesbar', cost: 920, day: 19 },
  { category: '🏨', description: 'room service', cost: 4800, day: 19 },
  { category: '🍽️', description: 'drinks', cost: 4200, day: 18 },
];

const parisExpenses: ExpenseTemplate[] = [
  {
    category: '🏨',
    description: 'Hôtel des Grands Boulevards (3 nights)',
    cost: 96000,
    day: 30,
  },
  {
    category: '🚂',
    description: 'Thalys Amsterdam–Paris return',
    cost: 38400,
    day: 30,
  },
  { category: '🎟️', description: 'Louvre tickets', cost: 3600, day: 29 },
  {
    category: '🍽️',
    description: 'Dinner at Brasserie Lipp',
    cost: 18600,
    day: 29,
  },
  { category: '🥐', description: 'Poilâne bakery', cost: 1480, day: 28 },
  { category: '🎟️', description: 'Eiffel Tower summit', cost: 5800, day: 28 },
  {
    category: '🚂',
    description: 'Paris Visite metro pass (3 days)',
    cost: 5200,
    day: 27,
  },
  { category: '🛒', description: 'Monoprix groceries', cost: 3640, day: 27 },
  {
    category: '🍽️',
    description: 'Sunday lunch at Le Comptoir du Relais',
    cost: 9200,
    day: 26,
  },
  { category: '🎟️', description: 'Centre Pompidou', cost: 4400, day: 26 },
  {
    category: '🥐',
    description: 'Breakfast at Café de Flore',
    cost: 5600,
    day: 25,
  },
  {
    category: '🛒',
    description: "Marché d'Aligre picnic supplies",
    cost: 2880,
    day: 25,
  },
  {
    category: '🍽️',
    description: 'Tasting menu at Septime',
    cost: 34000,
    day: 24,
  },
  { category: '🎟️', description: "Musée d'Orsay", cost: 4200, day: 24 },
  { category: '🚗', description: 'Uber from CDG airport', cost: 6800, day: 23 },
  {
    category: '🧴',
    description: 'Pharmacie Monge toiletries',
    cost: 4200,
    day: 23,
  },
  {
    category: '🍽️',
    description: 'Angelina hot chocolate & mont-blanc',
    cost: 3800,
    day: 22,
  },
  {
    category: '🎟️',
    description: 'Comédie-Française theatre',
    cost: 11600,
    day: 22,
  },
  {
    category: '🛒',
    description: 'La Grande Épicerie du Bon Marché',
    cost: 8400,
    day: 21,
  },
  {
    category: '🍽️',
    description: 'Dinner at Chez Georges',
    cost: 12400,
    day: 21,
  },
  { category: '🥐', description: 'Pierre Hermé macarons', cost: 2960, day: 20 },
  { category: '🚂', description: 'RER to Versailles', cost: 1480, day: 20 },
  {
    category: '🎟️',
    description: 'Château de Versailles day pass',
    cost: 5800,
    day: 19,
  },
  {
    category: '🧽',
    description: 'Pressing du Marais dry cleaning',
    cost: 2800,
    day: 19,
  },
  {
    category: '🍽️',
    description: 'Farewell dinner at Le Grand Véfour',
    cost: 46000,
    day: 18,
  },
];

const spainExpenses: ExpenseTemplate[] = [
  { category: '🏨', description: 'Hotel Miramar', cost: 148000, day: 30 },
  { category: '🚗', description: 'Car rental', cost: 32000, day: 29 },
  { category: '🍽️', description: 'El Tintero', cost: 8400, day: 29 },
  { category: '🎟️', description: 'Museo Picasso Málaga', cost: 2800, day: 28 },
  { category: '🛒', description: 'Mercado', cost: 5600, day: 28 },
  { category: '🥐', description: 'Café Central', cost: 980, day: 27 },
  { category: '🍽️', description: 'José Carlos García', cost: 42000, day: 27 },
  { category: '🎟️', description: 'castle', cost: 1100, day: 26 },
  { category: '🚗', description: 'parking', cost: 6400, day: 26 },
  { category: '🛒', description: 'beach supplies', cost: 8200, day: 25 },
  { category: '🍽️', description: 'Paella', cost: 6800, day: 25 },
  { category: '🎟️', description: 'Ronda', cost: 4200, day: 24 },
  { category: '🥐', description: 'pastries', cost: 760, day: 24 },
  { category: '🍽️', description: 'Tapas', cost: 11600, day: 23 },
  { category: '🧴', description: 'Pharmacy', cost: 3480, day: 23 },
  { category: '🎟️', description: 'Museo Carmen Thyssen', cost: 2400, day: 22 },
  { category: '🛒', description: 'Mercadona', cost: 4120, day: 22 },
  { category: '🍽️', description: 'Skina Marbella', cost: 38000, day: 21 },
  { category: '🚗', description: 'Petrol', cost: 7200, day: 21 },
  {
    category: '🥐',
    description: 'Horno de San Buenaventura',
    cost: 1140,
    day: 20,
  },
  {
    category: '🎟️',
    description: 'Real Alcázar de Sevilla',
    cost: 2800,
    day: 20,
  },
  {
    category: '🍽️',
    description: 'Tapas at Bar El Rinconcillo',
    cost: 9600,
    day: 19,
  },
  { category: '🧽', description: 'Dry cleaning', cost: 3200, day: 19 },
  { category: '🍽️', description: 'El Balcón de Málaga', cost: 22400, day: 18 },
];

@Injectable({
  providedIn: 'root',
})
export class TestDataService {
  private userStore = inject(UserStore);
  private groupStore = inject(GroupStore);
  private expenseStore = inject(ExpenseStore);

  async generate(): Promise<void> {
    let user1 = await this.userStore.save({
      name: 'Christopher',
      email: 'christopher@example.com',
      friends: [],
    });
    let user2 = await this.userStore.save({
      name: 'Nathaniel',
      email: 'nathaniel@example.com',
      friends: [],
    });
    let user3 = await this.userStore.save({
      name: 'Samantha',
      email: 'samantha@example.com',
      friends: [],
    });

    user1 = await this.userStore.save({ ...user1, friends: [user2.id] });
    user2 = await this.userStore.save({ ...user2, friends: [user3.id] });
    user3 = await this.userStore.save({ ...user3, friends: [user1.id] });

    const group1 = await this.groupStore.save({
      name: 'Bloemendaal aan Zee 2025',
      users: [user1.id, user2.id],
      createdBy: user1.id,
    });
    const group2 = await this.groupStore.save({
      name: 'Paris long weekend',
      users: [user2.id, user3.id],
      createdBy: user2.id,
    });
    const group3 = await this.groupStore.save({
      name: 'Costa del Sol summer',
      users: [user3.id, user1.id],
      createdBy: user3.id,
    });

    await this.addExpenses(group1.id, user1.id, user2.id, bloemendaalExpenses);
    await this.addExpenses(group2.id, user2.id, user3.id, parisExpenses);
    await this.addExpenses(group3.id, user3.id, user1.id, spainExpenses);
  }

  private async addExpenses(
    groupId: EntityId,
    userA: EntityId,
    userB: EntityId,
    expenses: {
      category: string;
      description: string;
      cost: number;
      day: number;
    }[],
  ): Promise<void> {
    const split = (total: number) => [
      { userId: userA, owed: Math.round(total / 2), included: true },
      { userId: userB, owed: Math.round(total / 2), included: true },
    ];
    const paidBy = (i: number) => (i % 2 === 0 ? userA : userB);
    const daysAgo = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d;
    };

    for (let i = 0; i < expenses.length; i++) {
      const { category, description, cost, day } = expenses[i];
      await this.expenseStore.save({
        groupId,
        createdBy: paidBy(i),
        currency: '€',
        category,
        description,
        cost,
        date: daysAgo(day),
        shares: split(cost),
      });
    }
  }
}
