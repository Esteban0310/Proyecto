import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PacienteFormulario {
  id?: number;
  idConsentimiento: string;
  email: string;
  consentimiento: boolean;
  version?: string;
  
  // Campos opcionales
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
  
  // ✅ CAMPOS DE VALIDACIÓN
  fechaValidacionIA?: string;
  fechaReenvioProfesional?: string;
  aceptadoPorProfesional?: boolean | 'si' | 'no_contesta' | 'no';
  idiomasDisponibles?: string;
  fechaSubidaIntranet?: string;
  fechaDisponibleEConsentimiento?: string;
  codigoEConsentimiento?: string;
  observacionesValidacion?: string;
  
  // ✅ CAMPOS DE LINKS
  linkConsentimientoDefinitivoCatala?: string;
  linkConsentimientoDefinitivoCastellano?: string;
  
  observaciones?: string;
  observacionesSolicitud?: string;
  
  // Campos base del backend
  archivo?: string | File | null;
  creadoPor?: string;
  actualizadoPor?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  activo?: boolean;
  estadoValidacion?: 'pendiente' | 'validado';
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private apiUrl = `${environment.apiUrl}/consentimientos/`;

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

  importarExcel(file: File): Observable<{ mensaje: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ mensaje: string }>(`${environment.apiUrl}/importar_excel/`, formData);
  }

  exportarExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}exportar_excel/`, { responseType: 'blob' });
  }
}