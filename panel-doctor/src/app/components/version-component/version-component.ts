import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PacienteFormulario, PacientesService } from '../../services/pacientes';

@Component({
  selector: 'app-version-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './version-component.html',
  styleUrls: ['./version-component.css']
})
export class VersionFormComponent implements OnInit {
  menuAbierto = true;
  pacientesDisponibles: PacienteFormulario[] = [];
  miFormulario!: FormGroup;

  constructor(
    private router: Router,
    private pacientesService: PacientesService
  ) {}

  ngOnInit() {
    this.pacientesDisponibles = this.pacientesService.obtenerPacientes();

    this.miFormulario = new FormGroup({
      pacienteId: new FormControl('', [Validators.required]),
      numeroVersion: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      telefono: new FormControl('', [Validators.required]),
      consentimiento: new FormControl(false, [Validators.requiredTrue])
    });
  }

  // ===== Métodos faltantes para el HTML =====
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  Database() {
    this.router.navigate(['/admin']);
  }

  Formulario() {
    this.router.navigate(['/formulario']);
  }

  FormularioVersiones() {
    this.router.navigate(['/formulario']);
  }

  Version() {
    this.router.navigate(['/version']);
  }

  eliminar() {
    if (confirm('¿Deseas eliminar los datos del formulario?')) {
      this.miFormulario.reset();
    }
  }
  // ==========================================

  get pacienteInvalido() {
    return this.miFormulario.get('pacienteId')?.invalid && this.miFormulario.get('pacienteId')?.touched;
  }

  get numeroVersionInvalido() {
    return this.miFormulario.get('numeroVersion')?.invalid && this.miFormulario.get('numeroVersion')?.touched;
  }

  get fechaInvalido() {
    return this.miFormulario.get('fecha')?.invalid && this.miFormulario.get('fecha')?.touched;
  }

  get telefonoInvalido() {
    return this.miFormulario.get('telefono')?.invalid && this.miFormulario.get('telefono')?.touched;
  }

  onSubmit() {
    if (!this.miFormulario.valid) {
      alert('Por favor, completa todos los campos correctamente');
      this.marcarCamposComoTocados();
      return;
    }

    const formValue = this.miFormulario.value as {
      pacienteId: number;
      numeroVersion: string;
      fecha: string;
      telefono: string;
      consentimiento: boolean;
    };

    const pacienteSeleccionado = this.pacientesService.obtenerPacientePorId(Number(formValue.pacienteId));
    if (!pacienteSeleccionado) {
      alert('Paciente no encontrado');
      return;
    }

    const nuevaVersion: PacienteFormulario = {
      id: undefined,
      nombre: pacienteSeleccionado.nombre,
      email: pacienteSeleccionado.email,
      direccion: pacienteSeleccionado.direccion,
      telefono: formValue.telefono,
      consentimiento: formValue.consentimiento,
      version: formValue.numeroVersion,
      creadoPor: 'Admin',
      actualizadoPor: 'Admin',
      fechaCreacion: new Date(formValue.fecha),
      fechaActualizacion: new Date()
    };

    this.pacientesService.guardarPaciente(nuevaVersion);
    alert('✅ Versión guardada correctamente');
    this.miFormulario.reset();
  }

  private marcarCamposComoTocados() {
    Object.keys(this.miFormulario.controls).forEach(key => {
      this.miFormulario.get(key)?.markAsTouched();
    });
  }

  volver() {
    if (this.miFormulario.dirty && !confirm('Tienes datos sin guardar. ¿Deseas salir sin guardar?')) return;
    this.router.navigate(['/admin']);
  }
}
