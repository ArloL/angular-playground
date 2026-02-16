import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { GroupExpenses } from './group-expenses';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';
import { NetworkSimulation } from '../../services/network-simulation';

describe('GroupOverviewComponent', () => {
  let component: GroupExpenses;
  let fixture: ComponentFixture<GroupExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupExpenses],
      providers: [provideRouter([])],
    }).compileComponents();

    var networkSimulation = TestBed.inject(NetworkSimulation);
    networkSimulation.use("none");

    var userStore = TestBed.inject(UserStore);
    var user1 = await userStore.save({ name: 'Christopher', email: 'christopher@example.com', friends: [] });
    var user2 = await userStore.save({ name: 'Nathaniel', email: 'nathaniel@example.com', friends: [] });
    var user3 = await userStore.save({ name: 'Samantha', email: 'samantha@example.com', friends: [] });

    var groupStore = TestBed.inject(GroupStore);
    var group = await groupStore.save({
      name: 'Bloemendaal',
      users: [user1.id, user2.id, user3.id],
      createdBy: user1.id,
    });

    fixture = TestBed.createComponent(GroupExpenses);
    fixture.componentRef.setInput('groupId', group.id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
