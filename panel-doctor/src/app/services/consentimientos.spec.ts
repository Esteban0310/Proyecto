import { TestBed } from '@angular/core/testing';
import { ConsentimientosService } from './consentimientos';

describe('ConsentimientosService', () => {
  let service: ConsentimientosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsentimientosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
