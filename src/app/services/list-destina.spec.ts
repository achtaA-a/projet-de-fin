import { TestBed } from '@angular/core/testing';

import { ListDestina } from './list-destina';

describe('ListDestina', () => {
  let service: ListDestina;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListDestina);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
