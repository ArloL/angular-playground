import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreate } from './expense-create';
import { provideRouter } from '@angular/router';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';

describe('ExpenseCreate', () => {
  let component: ExpenseCreate;
  let fixture: ComponentFixture<ExpenseCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCreate],
      providers: [
        provideRouter([]),
      ]
    })
      .compileComponents();

    var userStore = TestBed.inject(UserStore);
    userStore.timeout = 0;
    var user1 = await userStore.save({ name: 'Christopher' });
    var user2 = await userStore.save({ name: 'Nathaniel' });
    var user3 = await userStore.save({ name: 'Samantha' });

    var groupStore = TestBed.inject(GroupStore);
    groupStore.timeout = 0;
    var group = await groupStore.save({
      name: 'Bloemendaal',
      users: [user1.id, user2.id, user3.id],
      createdBy: user1.id,
    });

    fixture = TestBed.createComponent(ExpenseCreate);
    fixture.componentRef.setInput('groupId', group.id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be allowed to save if parts are bigger than amount', async () => {
    component.costRaw.set('60');
    component.updateShareOwed(1, '60');
    expect(component.saveEnabled()).toBe(true);
    component.updateShareOwed(2, '9');
    expect(component.saveEnabled()).toBe(false);
  });
});
