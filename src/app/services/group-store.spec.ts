import { TestBed } from '@angular/core/testing';

import { GroupStore } from './group-store';
import { provideZonelessChangeDetection } from '@angular/core';

describe('GroupStore', () => {
  let service: GroupStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
      ]
    });
    service = TestBed.inject(GroupStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
