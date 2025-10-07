import { Injectable } from '@angular/core';

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
  private pacientes: PacienteFormulario[] = [];
  private contadorId = 1;

  constructor() {
    // Solo acceder a localStorage si estamos en navegador
    if (typeof window !== 'undefined') {
      const datosGuardados = localStorage.getItem('pacientes');
      if (datosGuardados) {
        this.pacientes = JSON.parse(datosGuardados);
        this.contadorId = this.pacientes.length > 0
          ? Math.max(...this.pacientes.map(p => p.id || 0)) + 1
          : 1;
      }
    }
  }

  obtenerPacientes(): PacienteFormulario[] {
    return [...this.pacientes];
  }

  guardarPaciente(paciente: PacienteFormulario): void {
    if (paciente.id) {
      // Actualizar paciente existente
      const index = this.pacientes.findIndex(p => p.id === paciente.id);
      if (index !== -1) {
        this.pacientes[index] = { ...paciente };
      }
    } else {
      // Crear nuevo paciente
      paciente.id = this.contadorId++;
      paciente.fechaCreacion = new Date();
      this.pacientes.push(paciente);
    }

    // Guardar en localStorage solo si estamos en navegador
    this.guardarEnLocalStorage();
  }

  eliminarPaciente(id: number): void {
    this.pacientes = this.pacientes.filter(p => p.id !== id);
    this.guardarEnLocalStorage();
  }

  obtenerPacientePorId(id: number): PacienteFormulario | undefined {
    return this.pacientes.find(p => p.id === id);
  }

  private guardarEnLocalStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pacientes', JSON.stringify(this.pacientes));
    }
  }
}
