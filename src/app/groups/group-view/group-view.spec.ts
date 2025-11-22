import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupEdit } from './group-view';
import { GroupStore } from '../../services/group-store';

describe('GroupEdit', () => {
  let component: GroupEdit;
  let fixture: ComponentFixture<GroupEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupEdit);
    fixture.componentRef.setInput('groupId', TestBed.inject(GroupStore).first().id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
