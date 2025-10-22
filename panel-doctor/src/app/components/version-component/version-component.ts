import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Consentimiento, ConsentimientosService } from '../../services/consentimientos';
import { VersionesService } from '../../services/versiones';

@Component({
  selector: 'app-version-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './version-component.html',
  styleUrls: ['./version-component.css']
})
export class VersionFormComponent implements OnInit {
  menuAbierto = false;
  consentimientosDisponibles: Consentimiento[] = [];
  miFormulario!: FormGroup;
  cargandoConsentimientos = false;

  constructor(
    private router: Router,
    private consentimientosService: ConsentimientosService,
    private versionesService: VersionesService
  ) {}

  ngOnInit() {
    // ✅ Inicializar el formulario
    this.miFormulario = new FormGroup({
      consentimientoId: new FormControl('', [Validators.required]),
      numeroVersion: new FormControl('', [Validators.required]),
      fecha: new FormControl('', [Validators.required]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      consentimiento: new FormControl(false, [Validators.requiredTrue])
    });

    // ✅ Cargar lista de consentimientos
    this.cargandoConsentimientos = true;
    this.consentimientosService.getAll().subscribe({
      next: (consentimientos) => {
        this.consentimientosDisponibles = consentimientos || [];
        this.cargandoConsentimientos = false;
      },
      error: (err) => {
        console.error('❌ Error cargando consentimientos:', err);
        this.cargandoConsentimientos = false;
        alert('Error cargando consentimientos desde el backend. Revisa la consola.');
      }
    });
  }

  // ✅ Navegación del menú lateral
  toggleMenu() { this.menuAbierto = !this.menuAbierto; }
  Database() { this.router.navigate(['/admin']); }
  Formulario() { this.router.navigate(['/formulario']); }
  FormularioVersiones() { this.router.navigate(['/version-form']); }
  Version() { this.router.navigate(['/version']); }

  // 💾 Guardar nueva versión (envío al backend)
  onSubmit() {
    if (!this.miFormulario.valid) {
      alert('Por favor, completa todos los campos correctamente');
      Object.keys(this.miFormulario.controls).forEach(key =>
        this.miFormulario.get(key)?.markAsTouched()
      );
      return;
    }

    const formValue = this.miFormulario.value;

    // ✅ Crear el payload EXACTO que espera el backend
    const payload = {
      consentimiento_id: Number(formValue.consentimientoId), // 👈 clave correcta
      numero_version: formValue.numeroVersion,
      fecha: formValue.fecha,
      archivo: null,
      creado_por: formValue.correo,
      actualizado_por: formValue.correo
    };

    this.versionesService.crearVersion(payload).subscribe({
      next: () => {
        alert('✅ Versión guardada correctamente');
        this.miFormulario.reset();
      },
      error: (err) => {
        console.error('❌ Error al guardar versión:', err);
        alert('Error al guardar la versión. Revisa consola o backend.');
      }
    });
  }

  // 🗑️ Eliminar datos del formulario
  eliminar() {
    if (confirm('¿Deseas eliminar los datos del formulario?')) {
      this.miFormulario.reset();
    }
  }

  // 🔙 Volver al panel principal
  volver() {
    if (this.miFormulario.dirty && !confirm('Tienes datos sin guardar. ¿Deseas salir sin guardar?')) return;
    this.router.navigate(['/admin']);
  }
}
