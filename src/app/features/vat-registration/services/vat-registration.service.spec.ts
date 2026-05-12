import { TestBed } from '@angular/core/testing';

import { VatRegistrationService } from './vat-registration.service';

describe('VatRegistrationService', () => {
  let service: VatRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VatRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
