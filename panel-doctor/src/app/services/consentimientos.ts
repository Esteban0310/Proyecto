import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Consentimiento {
  id?: number;
  numeroVersion: string;
  fecha: string;
  pacienteId: number;
  telefono: string;
  consentimiento: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConsentimientosService {
  // ✅ Usa environment.apiUrl para que funcione en Docker y local
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
