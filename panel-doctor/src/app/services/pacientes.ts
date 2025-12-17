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
  fechaValidacionIA?: string;
  fechaReenvioProfesional?: string;
  aceptadoPorProfesional?: boolean;
  idiomasDisponibles?: string;
  fechaSubidaIntranet?: string;
  fechaDisponibleEConsentimiento?: string;
  codigoEConsentimiento?: string;
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
  // 🔹 IMPORTANTE: barra final '/' para evitar redirecciones 307
  private apiUrl = `${environment.apiUrl}/consentimientos/`;

  constructor(private http: HttpClient) {}

  // 🟢 Obtener todos los registros
  obtenerPacientes(): Observable<PacienteFormulario[]> {
    return this.http.get<PacienteFormulario[]>(this.apiUrl);
  }

  // 🟡 Guardar un nuevo paciente
  guardarPaciente(paciente: PacienteFormulario): Observable<PacienteFormulario> {
    return this.http.post<PacienteFormulario>(this.apiUrl, paciente);
  }

  // 🔵 Actualizar paciente existente
  actualizarPaciente(id: number, paciente: PacienteFormulario): Observable<PacienteFormulario> {
    return this.http.put<PacienteFormulario>(`${this.apiUrl}${id}/`, paciente);
  }

  // 🔴 Eliminar paciente
  eliminarPaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }

  // ⚪ Obtener paciente por ID
  obtenerPacientePorId(id: number): Observable<PacienteFormulario> {
    return this.http.get<PacienteFormulario>(`${this.apiUrl}${id}/`);
  }

  // 📥 Importar Excel al backend
  importarExcel(file: File): Observable<{ mensaje: string }> {
    const formData = new FormData();
    formData.append('file', file);

    // ✅ Usamos la ruta exacta del backend que ya tiene /api/importar_excel/
    return this.http.post<{ mensaje: string }>(`${environment.apiUrl}/importar_excel/`, formData);
  }

  // 📤 Exportar Excel (opcional)
  exportarExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}exportar_excel/`, { responseType: 'blob' });
  }
}
