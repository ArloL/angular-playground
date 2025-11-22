import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupExpenses } from './group-expenses';
import { GroupStore } from '../../services/group-store';

describe('GroupOverviewComponent', () => {
  let component: GroupExpenses;
  let fixture: ComponentFixture<GroupExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupExpenses],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupExpenses);
    fixture.componentRef.setInput('groupId', TestBed.inject(GroupStore).first().id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
