import { TestBed } from '@angular/core/testing';
import { Versiones } from './versiones';

describe('Versiones', () => {
  let service: Versiones;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Versiones] // 👈 Esto es clave
    });
    service = TestBed.inject(Versiones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
