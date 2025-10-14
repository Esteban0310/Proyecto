import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PacienteFormulario {
  id?: number;
  nombre: string;
  email: string;
  direccion: string;
  telefono: string;
  consentimiento: boolean;
  archivo?: File | null;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  creadoPor?: string;
  actualizadoPor?: string;
  version?: string;
  estadoValidacion?: 'pendiente' | 'validado';
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private apiUrl = 'http://localhost:8000/api/consentimientos'; // endpoint backend

  constructor(private http: HttpClient) {}

  obtenerPacientes(): Observable<PacienteFormulario[]> {
    return this.http.get<PacienteFormulario[]>(this.apiUrl);
  }

  guardarPaciente(paciente: PacienteFormulario): Observable<PacienteFormulario> {
    return this.http.post<PacienteFormulario>(this.apiUrl, paciente);
  }

  eliminarPaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerPacientePorId(id: number): Observable<PacienteFormulario> {
    return this.http.get<PacienteFormulario>(`${this.apiUrl}/${id}`);
  }
}
