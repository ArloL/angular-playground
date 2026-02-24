import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeView } from './home-view';

describe('HomeView', () => {
  let component: HomeView;
  let fixture: ComponentFixture<HomeView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeView],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
