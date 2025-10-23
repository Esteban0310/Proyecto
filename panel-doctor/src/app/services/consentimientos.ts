import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ✅ Modelo actualizado de Consentimiento
export interface Consentimiento {
  id?: number;
  id_consentimiento: string;
  email: string;
  consentimiento: boolean;
  archivo?: string;
  version?: string;
  creado_por?: string;
  actualizado_por?: string;
  activo?: boolean;

  // 🔹 Nuevos campos del backend
  profesional?: string;
  email_profesional?: string;
  instituto?: string;
  servicio?: string;
  lateralidad?: string;
  aceptado?: boolean;
  observaciones?: string;
  estado?: string;

  // 🔹 Campos antiguos del front
  numeroVersion?: string;
  fecha?: string;
  pacienteId?: number;
  telefono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsentimientosService {
  private apiUrl = `${environment.apiUrl}/consentimientos/`;

  constructor(private http: HttpClient) {}

  /** 🟢 Obtener todos los consentimientos */
  getAll(): Observable<Consentimiento[]> {
    return this.http.get<Consentimiento[]>(this.apiUrl);
  }

  /** 🟡 Obtener un consentimiento por ID */
  getById(id: number): Observable<Consentimiento> {
    return this.http.get<Consentimiento>(`${this.apiUrl}/${id}`);
  }

  /** 🔵 Crear nuevo consentimiento */
  create(consentimiento: Consentimiento): Observable<Consentimiento> {
    return this.http.post<Consentimiento>(this.apiUrl, consentimiento);
  }

  /** 🟠 Actualizar consentimiento existente */
  update(id: number, consentimiento: Consentimiento): Observable<Consentimiento> {
    return this.http.put<Consentimiento>(`${this.apiUrl}/${id}`, consentimiento);
  }

  /** 🔴 Eliminar consentimiento */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
