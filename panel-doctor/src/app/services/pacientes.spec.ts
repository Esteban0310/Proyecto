import { TestBed } from '@angular/core/testing';
import { PacientesService } from './pacientes';

describe('PacientesService', () => {
  let service: PacientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PacientesService] // 👈 Esto es clave
    });
    service = TestBed.inject(PacientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an array of pacientes', () => {
    const pacientes = service.obtenerPacientes();
    expect(Array.isArray(pacientes)).toBeTrue();
  });
});
