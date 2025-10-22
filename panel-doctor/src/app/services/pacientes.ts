import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PacienteFormulario {
  id?: number;
  idConsentimiento: string;
  email: string;
  consentimiento: boolean;
  version?: string;

  // Campos extra...
  codigoConsentimientoInterno?: string;
  nombreArchivoCatalan?: string;
  nombreArchivoCastellano?: string;
  numeroVersion?: string;
  nombreConsentimiento?: string;
  fechaSolicitud?: string;
  idiomaRecibido?: string;
  nombreProfesional?: string;
  matriculaProfesional?: string;
  emailProfesional?: string;
  instituto?: string;
  codigoServicio?: string;
  unidadFuncional?: string;
  biobanco?: string;
  lateralidad?: string;
  fechaValidacionIA?: string;
  fechaReenvioProfesional?: string;
  aceptadoPorProfesional?: boolean;
  idiomasDisponibles?: string;
  fechaSubidaIntranet?: string;
  fechaDisponibleEConsentimiento?: string;
  codigoEConsentimiento?: string;
  observaciones?: string;
  observacionesSolicitud?: string;
  archivo?: File | null;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  creadoPor?: string;
  actualizadoPor?: string;
  estadoValidacion?: 'pendiente' | 'validado';
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private apiUrl = `${environment.apiUrl}/consentimientos/`; // ✅ unificado

  constructor(private http: HttpClient) {}

  obtenerPacientes(): Observable<PacienteFormulario[]> {
    return this.http.get<PacienteFormulario[]>(this.apiUrl);
  }

  guardarPaciente(paciente: PacienteFormulario): Observable<PacienteFormulario> {
    return this.http.post<PacienteFormulario>(this.apiUrl, paciente);
  }

  actualizarPaciente(id: number, paciente: PacienteFormulario): Observable<PacienteFormulario> {
    return this.http.put<PacienteFormulario>(`${this.apiUrl}${id}/`, paciente);
  }

  eliminarPaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  obtenerPacientePorId(id: number): Observable<PacienteFormulario> {
    return this.http.get<PacienteFormulario>(`${this.apiUrl}${id}/`);
  }
}
