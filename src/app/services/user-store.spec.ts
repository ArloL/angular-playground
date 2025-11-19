import { TestBed } from '@angular/core/testing';

import { UserStore } from './user-store';
import { provideZonelessChangeDetection } from '@angular/core';

describe('UserStore', () => {
  let service: UserStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
      ]
    });
    service = TestBed.inject(UserStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
