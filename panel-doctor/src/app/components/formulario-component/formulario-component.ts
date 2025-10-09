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

  miFormulario = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    direccion: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.required]),
    consentimiento: new FormControl(false, [Validators.requiredTrue]),
    version: new FormControl('V.1', [Validators.required])
  });

  constructor(
    private router: Router,
    private pacientesService: PacientesService
  ) {}

  // ---- Menú ----
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  Database() {
    this.router.navigate(['/admin']);
  }

  Formulario() {
    this.router.navigate(['/formulario']);
  }

  Version(){
    this.router.navigate(['/version']);
  }

  // ---- Archivos ----
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

  // ---- Formulario ----
  onSubmit() {
    if (this.miFormulario.valid) {
      this.guardar();
    } else {
      alert('Por favor, completa todos los campos correctamente');
      this.marcarCamposComoTocados();
    }
  }

  guardar() {
    if (this.miFormulario.valid) {
      const paciente: PacienteFormulario = {
        id: this.pacienteActualId, // undefined si es nuevo, el service asigna ID
        nombre: this.miFormulario.value.nombre || '',
        email: this.miFormulario.value.email || '',
        direccion: this.miFormulario.value.direccion || '',
        telefono: this.miFormulario.value.telefono || '',
        consentimiento: this.miFormulario.value.consentimiento || false,
        archivo: this.archivoSeleccionado,
        version: this.miFormulario.value.version || 'V.1',
        // Auditoría
        creadoPor: 'Administrador',
        actualizadoPor: 'Administrador',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      };

      this.pacientesService.guardarPaciente(paciente);

      alert('✅ Datos guardados correctamente');
      console.log('Datos guardados:', paciente);
      console.log('Total de pacientes:', this.pacientesService.obtenerPacientes().length);

      this.limpiarFormulario();
    } else {
      alert('❌ Por favor, completa todos los campos correctamente');
      this.marcarCamposComoTocados();
    }
  }
  
  eliminar() {
    const confirmar = confirm('⚠️ ¿Estás seguro de que quieres eliminar los datos del formulario?');
    if (confirmar) {
      this.limpiarFormulario();
      alert('🗑️ Datos eliminados del formulario');
    }
  }

  volver() {
    const hayDatos = this.miFormulario.dirty;
    if (hayDatos) {
      const confirmar = confirm('Tienes datos sin guardar. ¿Deseas salir sin guardar?');
      if (confirmar) {
        this.router.navigate(['/admin']);
      }
    } else {
      this.router.navigate(['/admin']);
    }
  }

  private limpiarFormulario() {
    this.miFormulario.reset({ version: 'V.1', consentimiento: false });
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.pacienteActualId = undefined;
  }

  private marcarCamposComoTocados() {
    Object.keys(this.miFormulario.controls).forEach(key => {
      const control = this.miFormulario.get(key);
      control?.markAsTouched();
    });
  }

  // ---- Validaciones para template ----
  get nombreInvalido() {
    return this.miFormulario.get('nombre')?.invalid && this.miFormulario.get('nombre')?.touched;
  }

  get emailInvalido() {
    return this.miFormulario.get('email')?.invalid && this.miFormulario.get('email')?.touched;
  }

  get direccionInvalido() {
    return this.miFormulario.get('direccion')?.invalid && this.miFormulario.get('direccion')?.touched;
  }

  get telefonoInvalido() {
    return this.miFormulario.get('telefono')?.invalid && this.miFormulario.get('telefono')?.touched;
  }

  get versionInvalida() {
    return this.miFormulario.get('version')?.invalid && this.miFormulario.get('version')?.touched;
  }
}
