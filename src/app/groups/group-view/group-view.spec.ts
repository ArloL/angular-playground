import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupView } from './group-view';
import { GroupStore } from '../../services/group-store';

describe('GroupEdit', () => {
  let component: GroupView;
  let fixture: ComponentFixture<GroupView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupView);
    fixture.componentRef.setInput('groupId', TestBed.inject(GroupStore).first().id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
