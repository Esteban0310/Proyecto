import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 🧩 Interfaz compatible con el backend
export interface VersionFormulario {
  id?: number;
  consentimiento_id: number;   // 🔄 reemplaza pacienteId
  numero_version: string;      // 🔄 reemplaza numeroVersion
  fecha: string;
  archivo?: string | null;
  creado_por: string;          // 🔄 reemplaza correo
  actualizado_por: string;
}

@Injectable({
  providedIn: 'root'
})
export class VersionesService {
  private apiUrl = `${environment.apiUrl}/versiones/`;

  constructor(private http: HttpClient) {}

  /** 🟢 Crear nueva versión */
  crearVersion(version: VersionFormulario): Observable<VersionFormulario> {
    return this.http.post<VersionFormulario>(this.apiUrl, version);
  }

  /** 🟡 Obtener todas las versiones */
  obtenerVersiones(): Observable<VersionFormulario[]> {
    return this.http.get<VersionFormulario[]>(this.apiUrl);
  }

  /** 🔵 Obtener versión por ID */
  obtenerVersionPorId(id: number): Observable<VersionFormulario> {
    return this.http.get<VersionFormulario>(`${this.apiUrl}/${id}`);
  }

  /** 🟠 Actualizar versión existente */
  actualizarVersion(id: number, version: VersionFormulario): Observable<VersionFormulario> {
    return this.http.put<VersionFormulario>(`${this.apiUrl}/${id}`, version);
  }

  /** 🔴 Eliminar versión */
  eliminarVersion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
