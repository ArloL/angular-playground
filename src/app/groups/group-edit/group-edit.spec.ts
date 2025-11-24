import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupEdit } from './group-edit';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';

describe('GroupEdit', () => {
  let component: GroupEdit;
  let fixture: ComponentFixture<GroupEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupEdit]
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

    fixture = TestBed.createComponent(GroupEdit);
    fixture.componentRef.setInput('groupId', group.id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
