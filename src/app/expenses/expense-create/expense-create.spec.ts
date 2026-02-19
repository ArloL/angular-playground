import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreate } from './expense-create';
import { provideRouter } from '@angular/router';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';
import { NetworkSimulation } from '../../services/network-simulation';
import { CurrentUserService } from '../../services/current-user';

describe('ExpenseCreate', () => {
  let component: ExpenseCreate;
  let fixture: ComponentFixture<ExpenseCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCreate],
      providers: [provideRouter([])],
    }).compileComponents();

    var networkSimulation = TestBed.inject(NetworkSimulation);
    networkSimulation.use('none');

    var userStore = TestBed.inject(UserStore);
    var user1 = await userStore.save({
      name: 'Christopher',
      email: 'christopher@example.com',
      friends: [],
    });
    var user2 = await userStore.save({
      name: 'Nathaniel',
      email: 'nathaniel@example.com',
      friends: [],
    });
    var user3 = await userStore.save({
      name: 'Samantha',
      email: 'samantha@example.com',
      friends: [],
    });

    var currentUserService = TestBed.inject(CurrentUserService);
    await currentUserService.login();

    var groupStore = TestBed.inject(GroupStore);
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
