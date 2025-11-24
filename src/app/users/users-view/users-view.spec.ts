import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersView } from './users-view';

describe('UsersView', () => {
  let component: UsersView;
  let fixture: ComponentFixture<UsersView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
