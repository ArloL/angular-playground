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
    })
      .compileComponents();

    var networkSimulation = TestBed.inject(NetworkSimulation);
    networkSimulation.use("none");

    var userStore = TestBed.inject(UserStore);
    var user1 = await userStore.save({ name: 'Christopher' });
    var user2 = await userStore.save({ name: 'Nathaniel' });
    var user3 = await userStore.save({ name: 'Samantha' });

    var groupStore = TestBed.inject(GroupStore);
    var group = await groupStore.save({
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
