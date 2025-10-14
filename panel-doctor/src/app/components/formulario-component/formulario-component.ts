import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PacienteFormulario, PacientesService } from '../../services/pacientes';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-component.html',
  styleUrls: ['./formulario-component.css']
})
export class FormularioComponent {
  menuAbierto = true;
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';
  pacienteActualId?: number;

  nombreInvalido = false;
  emailInvalido = false;
  direccionInvalido = false;
  telefonoInvalido = false;
  versionInvalida = false;

  miFormulario = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    direccion: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.required]),
    consentimiento: new FormControl(false, [Validators.requiredTrue]),
    version: new FormControl('V.1', [Validators.required])
  });

  constructor(private router: Router, private pacientesService: PacientesService) {}

  toggleMenu() { this.menuAbierto = !this.menuAbierto; }

  Database() { this.router.navigate(['/admin']); }
  Formulario() { this.router.navigate(['/formulario']); }
  Version() { this.router.navigate(['/version']); }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
    }
  }

  eliminarArchivo() {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
  }

  onSubmit() {
    if (!this.miFormulario.valid) {
      alert('Por favor, completa todos los campos correctamente');
      this.marcarCamposComoTocados();
      return;
    }

    const paciente: PacienteFormulario = {
      id: this.pacienteActualId,
      nombre: this.miFormulario.value.nombre || '',
      email: this.miFormulario.value.email || '',
      direccion: this.miFormulario.value.direccion || '',
      telefono: this.miFormulario.value.telefono || '',
      consentimiento: this.miFormulario.value.consentimiento || false,
      archivo: this.archivoSeleccionado,
      version: this.miFormulario.value.version || 'V.1',
      creadoPor: 'Administrador',
      actualizadoPor: 'Administrador',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    this.pacientesService.guardarPaciente(paciente).subscribe({
      next: () => {
        alert('✅ Datos guardados correctamente');
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('❌ Error al guardar:', err);
        alert('Error al conectar con el backend');
      }
    });
  }

  eliminar() {
    if (this.pacienteActualId) {
      this.pacientesService.eliminarPaciente(this.pacienteActualId).subscribe({
        next: () => { alert('🗑️ Paciente eliminado'); this.limpiarFormulario(); },
        error: (err) => console.error('Error al eliminar:', err)
      });
    } else {
      this.limpiarFormulario();
    }
  }

  volver() {
    if (this.miFormulario.dirty && !confirm('Tienes datos sin guardar. ¿Deseas salir sin guardar?')) return;
    this.router.navigate(['/admin']);
  }

  private limpiarFormulario() {
    this.miFormulario.reset({ version: 'V.1', consentimiento: false });
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.pacienteActualId = undefined;
  }

  private marcarCamposComoTocados() {
    Object.keys(this.miFormulario.controls).forEach(key => {
      this.miFormulario.get(key)?.markAsTouched();
    });
  }
}
