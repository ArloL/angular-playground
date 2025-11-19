import { TestBed } from '@angular/core/testing';

import { ExpenseStore } from './expense-store';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ExpenseStore', () => {
  let service: ExpenseStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(),] });
    service = TestBed.inject(ExpenseStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
