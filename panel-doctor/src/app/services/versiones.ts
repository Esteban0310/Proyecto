import { Injectable } from '@angular/core';

export interface VersionFormulario {
  id?: number;
  numeroVersion: string;
  fecha: string;
  pacienteId: number;
  pacienteNombre: string;
  telefono: string;
  consentimiento: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Versiones {
  private versiones: VersionFormulario[] = [];
  private contadorId = 1;

  constructor() {
    // Cargar versiones del localStorage si existen
    this.cargarVersiones();
  }

  guardarVersion(version: VersionFormulario): void {
    if (version.id) {
      // Actualizar versión existente
      const index = this.versiones.findIndex(v => v.id === version.id);
      if (index !== -1) {
        this.versiones[index] = version;
      }
    } else {
      // Crear nueva versión
      version.id = this.contadorId++;
      this.versiones.push(version);
    }
    this.guardarEnLocalStorage();
  }

  obtenerVersiones(): VersionFormulario[] {
    return [...this.versiones];
  }

  obtenerVersionPorId(id: number): VersionFormulario | undefined {
    return this.versiones.find(v => v.id === id);
  }

  eliminarVersion(id: number): void {
    this.versiones = this.versiones.filter(v => v.id !== id);
    this.guardarEnLocalStorage();
  }

  obtenerVersionesPorPaciente(pacienteId: number): VersionFormulario[] {
    return this.versiones.filter(v => v.pacienteId === pacienteId);
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('versiones', JSON.stringify(this.versiones));
    localStorage.setItem('versionesContador', this.contadorId.toString());
  }

  private cargarVersiones(): void {
    const versionesGuardadas = localStorage.getItem('versiones');
    const contador = localStorage.getItem('versionesContador');
    
    if (versionesGuardadas) {
      this.versiones = JSON.parse(versionesGuardadas);
    }
    
    if (contador) {
      this.contadorId = parseInt(contador, 10);
    }
  }
}