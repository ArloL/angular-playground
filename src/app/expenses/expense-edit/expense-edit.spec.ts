import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseEdit } from './expense-edit';
import { provideRouter } from '@angular/router';
import { UserStore } from '../../services/user-store';
import { GroupStore } from '../../services/group-store';
import { ExpenseStore } from '../../services/expense-store';
import { NetworkSimulation } from '../../services/network-simulation';

describe('ExpenseEdit', () => {
  let component: ExpenseEdit;
  let fixture: ComponentFixture<ExpenseEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseEdit],
      providers: [
        provideRouter([]),
      ]
    })
      .compileComponents();

    var networkSimulation = TestBed.inject(NetworkSimulation);
    networkSimulation.use("none");

    var userStore = TestBed.inject(UserStore);
    var user1 = await userStore.save({ name: 'Christopher' });
    var user2 = await userStore.save({ name: 'Nathaniel' });

    var groupStore = TestBed.inject(GroupStore);
    var group = await groupStore.save({
      name: 'Bloemendaal',
      users: [user1.id, user2.id],
      createdBy: user1.id,
    });

    var expenseStore = TestBed.inject(ExpenseStore);
    var expense = await expenseStore.save({
      cost: 6000,
      description: 'Dinner',
      currency: '€',
      category: '🍽️',
      date: new Date(),
      shares: [
        { userId: user1.id, owed: 3000, included: true },
        { userId: user2.id, owed: 3000, included: true },
      ],
      createdBy: user1.id,
      groupId: group.id,
    });

    fixture = TestBed.createComponent(ExpenseEdit);
    fixture.componentRef.setInput('groupId', group.id);
    fixture.componentRef.setInput('expenseId', expense.id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load expense data', () => {
    expect(component.expenseData().cost).toBe(6000);
    expect(component.expenseData().description).toBe('Dinner');
    expect(component.expenseData().category).toBe('🍽️');
  });

  it('should reflect cost edits in expenseData', () => {
    component.costRaw.set('80.00');
    expect(component.expenseData().cost).toBe(8000);
  });

  it('should reflect description edits in expenseData', () => {
    component.descriptionRaw.set('Lunch');
    expect(component.expenseData().description).toBe('Lunch');
  });

  it('should reflect category edits in expenseData', () => {
    component.selectedCategory.set(2);
    expect(component.expenseData().category).toBe(component.categories[2]);
  });
});
