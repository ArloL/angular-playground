import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExpenseComponent } from './add-expense.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AddExpenseComponent', () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExpenseComponent],
      providers: [
        provideZonelessChangeDetection(),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be allowed to save if parts are bigger than amount', () => {
    component.costRaw.set('60');
    component.updateShareOwed(1, '60');
    expect(component.saveEnabled()).toBeTrue();
    component.updateShareOwed(2, '9');
    expect(component.saveEnabled()).toBeFalse();
  });
});
