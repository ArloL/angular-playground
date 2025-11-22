import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExpenseComponent } from './add-expense.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { GroupStore } from '../services/group-store';

describe('AddExpenseComponent', () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExpenseComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddExpenseComponent);
    fixture.componentRef.setInput('groupId', TestBed.inject(GroupStore).first().id);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be allowed to save if parts are bigger than amount', () => {
    component.costRaw.set('60');
    component.updateShareOwed(1, '60');
    expect(component.saveEnabled()).toBe(true);
    component.updateShareOwed(2, '9');
    expect(component.saveEnabled()).toBe(false);
  });
});
