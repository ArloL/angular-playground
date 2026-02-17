import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GroupsView } from './groups-view';

describe('GroupsView', () => {
  let component: GroupsView;
  let fixture: ComponentFixture<GroupsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsView],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
