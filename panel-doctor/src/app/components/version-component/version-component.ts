import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsentimientosService } from '../../services/consentimientos'; 
import { PacienteFormulario, PacientesService } from '../../services/pacientes';

@Component({
  selector: 'app-version-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './version-component.html',
  styleUrls: ['./version-component.css']
})
export class VersionFormComponent implements OnInit {
  menuAbierto = false;
  pacientesDisponibles: PacienteFormulario[] = [];
  miFormulario!: FormGroup;

  constructor(
    private router: Router,
    private pacientesService: PacientesService,
    private consentimientosService: ConsentimientosService
  ) {}

  ngOnInit() {
    this.pacientesService.obtenerPacientes().subscribe({
      next: (pacientes) => this.pacientesDisponibles = pacientes,
      error: (err) => console.error('Error cargando pacientes:', err)
    });

    this.miFormulario = new FormGroup({
      pacienteId: new FormControl('', [Validators.required]),
      numeroVersion: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      telefono: new FormControl('', [Validators.required]),
      consentimiento: new FormControl(false, [Validators.requiredTrue])
    });
  }

  // ---------- MÉTODOS DEL SIDEBAR ----------
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  Database() { this.router.navigate(['/admin']); }
  Formulario() { this.router.navigate(['/formulario']); }
  FormularioVersiones() { this.router.navigate(['/version-form']); }
  Version() { this.router.navigate(['/version']); }

  // ---------- MÉTODOS DEL FORMULARIO ----------
  onSubmit() {
    if (!this.miFormulario.valid) {
      alert('Por favor, completa todos los campos correctamente');
      Object.keys(this.miFormulario.controls).forEach(key => this.miFormulario.get(key)?.markAsTouched());
      return;
    }

    const formValue = this.miFormulario.value;

    this.consentimientosService.create(formValue).subscribe({
      next: () => {
        alert('✅ Consentimiento guardado correctamente');
        this.miFormulario.reset();
      },
      error: (err) => {
        console.error('❌ Error al guardar:', err);
        alert('Error al conectar con el backend');
      }
    });
  }

  eliminar() {
    if (confirm('¿Deseas eliminar los datos del formulario?')) {
      this.miFormulario.reset();
    }
  }

  volver() {
    if (this.miFormulario.dirty && !confirm('Tienes datos sin guardar. ¿Deseas salir sin guardar?')) return;
    this.router.navigate(['/admin']);
  }
}
