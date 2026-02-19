import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { GroupStore } from '../../services/group-store';
import { GroupView } from './group-view';
import { UserStore } from '../../services/user-store';
import { NetworkSimulation } from '../../services/network-simulation';

describe('GroupEdit', () => {
  let component: GroupView;
  let fixture: ComponentFixture<GroupView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupView],
      providers: [provideRouter([])],
    }).compileComponents();

    const networkSimulation = TestBed.inject(NetworkSimulation);
    networkSimulation.use('none');

    const userStore = TestBed.inject(UserStore);
    const user1 = await userStore.save({
      name: 'Christopher',
      email: 'christopher@example.com',
      friends: [],
    });
    const user2 = await userStore.save({
      name: 'Nathaniel',
      email: 'nathaniel@example.com',
      friends: [],
    });
    const user3 = await userStore.save({
      name: 'Samantha',
      email: 'samantha@example.com',
      friends: [],
    });

    const groupStore = TestBed.inject(GroupStore);
    const group = await groupStore.save({
      name: 'Bloemendaal',
      users: [user1.id, user2.id, user3.id],
      createdBy: user1.id,
    });

    fixture = TestBed.createComponent(GroupView);
    fixture.componentRef.setInput('groupId', group.id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
