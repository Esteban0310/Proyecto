import { Injectable } from '@angular/core';

export interface Consentimiento {
  numeroVersion: string;
  fecha: string;
  pacienteId: string;
  telefono: string;
  consentimiento: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConsentimientosService {
  private storageKey = 'consentimientos';
  private consentimientos: Consentimiento[] = [];

  constructor() {
    this.cargarDesdeStorage();
  }

  // Cargar consentimientos desde localStorage
  private cargarDesdeStorage() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      this.consentimientos = JSON.parse(data);
    } else {
      this.consentimientos = []; // Array vacío si no hay datos
    }
  }

  // Guardar en localStorage
  private guardarEnStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.consentimientos));
  }

  // Buscar por número de versión
  buscarPorVersion(numeroVersion: string): Consentimiento | undefined {
    return this.consentimientos.find(c => c.numeroVersion === numeroVersion);
  }

  // Actualizar o añadir consentimiento
  actualizarConsentimiento(consentimiento: Consentimiento) {
    const index = this.consentimientos.findIndex(c => c.numeroVersion === consentimiento.numeroVersion);
    if (index !== -1) {
      this.consentimientos[index] = consentimiento; // Actualizar existente
    } else {
      this.consentimientos.push(consentimiento); // Añadir nuevo
    }
    this.guardarEnStorage();
  }

  // Opcional: obtener todos los consentimientos
  obtenerTodos(): Consentimiento[] {
    return [...this.consentimientos];
  }
}
