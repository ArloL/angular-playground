import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupOverviewComponent } from './group-overview.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { GroupStore } from '../services/group-store';

describe('GroupOverviewComponent', () => {
  let component: GroupOverviewComponent;
  let fixture: ComponentFixture<GroupOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupOverviewComponent],
      providers: [
        provideZonelessChangeDetection(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupOverviewComponent);
    fixture.componentRef.setInput('groupId', TestBed.inject(GroupStore).first().id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
