import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { PacientesService, PacienteFormulario } from '../../services/pacientes';

interface Paciente extends PacienteFormulario {
  estadoValidacion?: 'pendiente' | 'validado';
  version: string;
  nombreArchivoCatalan?: string;
  nombreArchivoCastellano?: string;
  archivoCatalan?: File;
  archivoCastellano?: File;
  modificado?: boolean;
}

@Component({
  selector: 'app-admin-component',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-component.html',
  styleUrls: ['./admin-component.css']
})
export class AdminComponent implements OnInit {

  usuario = {
    nombre: 'Administrador',
    email: 'admin@local.com',
    rol: 'Admin'
  };

  menuAbierto = false;
  menuUsuario = false;
  filtrosAbiertos = false;
  busqueda = '';

  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];

  filtros = {
    id: '',
    version: '',
    email: '',
    idConsentimiento: '',
    estadoValidacion: ''
  };

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private pacientesService: PacientesService
  ) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  // ---------- CARGAR ----------
  cargarPacientes() {
    this.pacientesService.obtenerPacientes().subscribe({
      next: (data) => {
        this.pacientes = data.map((p: PacienteFormulario) => ({
          ...p,
          version: p.version || 'V.1',
          estadoValidacion: 'pendiente'
        })) as Paciente[];

        this.pacientesFiltrados = [...this.pacientes];
      },
      error: (err) => console.error('❌ Error al cargar pacientes', err)
    });
  }

  refrescar() {
    this.cargarPacientes();
  }

  // ---------- MENÚ ----------
  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    this.menuUsuario = false;
    this.filtrosAbiertos = false;
  }

  toggleUserMenu() {
    this.menuUsuario = !this.menuUsuario;
    this.menuAbierto = false;
    this.filtrosAbiertos = false;
  }

  toggleFiltros() {
    this.filtrosAbiertos = !this.filtrosAbiertos;
    this.menuAbierto = false;
    this.menuUsuario = false;
  }

  // ---------- FILTROS ----------
  buscar() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.pacientesFiltrados = this.pacientes.filter(p => {
      const coincideBusqueda =
        !this.busqueda ||
        Object.values(p).some(v =>
          v?.toString().toLowerCase().includes(this.busqueda.toLowerCase())
        );

      const coincideId = !this.filtros.id || p.id?.toString().includes(this.filtros.id);
      const coincideVersion = !this.filtros.version || p.version.includes(this.filtros.version);
      const coincideEmail =
        !this.filtros.email ||
        p.emailProfesional?.toLowerCase().includes(this.filtros.email.toLowerCase());

      const coincideEstado =
        !this.filtros.estadoValidacion ||
        p.estadoValidacion === this.filtros.estadoValidacion;

      return coincideBusqueda && coincideId && coincideVersion && coincideEmail && coincideEstado;
    });
  }

  limpiarFiltros() {
    this.filtros = { id: '', version: '', email: '', idConsentimiento: '', estadoValidacion: '' };
    this.busqueda = '';
    this.pacientesFiltrados = [...this.pacientes];
  }

  // ---------- NAVEGACIÓN ----------
  Database() { this.router.navigate(['/admin']); }
  Formulario() { this.router.navigate(['/formulario']); }
  Version() { this.router.navigate(['/version']); }
  cerrarSesion() { this.router.navigate(['/login']); }

  // editar el consentimiento creado 
  editarPaciente(paciente: Paciente) {

    const codigoInterno = prompt('Código interno:', paciente.codigoConsentimientoInterno ?? '');
    if (codigoInterno === null) return;

    const nombreConsentimiento = prompt('Consentimiento:', paciente.nombreConsentimiento ?? '');
    if (nombreConsentimiento === null) return;

    const nombreProfesional = prompt('Profesional:', paciente.nombreProfesional ?? '');
    if (nombreProfesional === null) return;

    const emailProfesional = prompt('Email profesional:', paciente.emailProfesional ?? '');
    if (emailProfesional === null) return;

    const instituto = prompt('Instituto:', paciente.instituto ?? '');
    if (instituto === null) return;

    const codigoServicio = prompt('Servicio:', paciente.codigoServicio ?? '');
    if (codigoServicio === null) return;

    const observaciones = prompt('Observaciones:', paciente.observaciones ?? '');
    if (observaciones === null) return;

    const aceptadoTxt = prompt(
      '¿Aceptado por profesional? (si / no)',
      paciente.aceptadoPorProfesional ? 'si' : 'no'
    );
    if (aceptadoTxt === null) return;

    const actualizado: Paciente = {
      ...paciente,
      codigoConsentimientoInterno: codigoInterno,
      nombreConsentimiento,
      nombreProfesional,
      emailProfesional,
      instituto,
      codigoServicio,
      observaciones,
      aceptadoPorProfesional: aceptadoTxt.toLowerCase() === 'si',
      actualizadoPor: this.usuario.nombre,
      fechaActualizacion: new Date(),
      modificado: true
    };

    if (!actualizado.id) return;
    // Actualizar en memoria sin guardar automáticamente
    const i = this.pacientes.findIndex(p => p.id === actualizado.id);
    if (i !== -1) {
      this.pacientes[i] = actualizado;
      this.pacientesFiltrados = [...this.pacientes];
    }
  }

  // Eliminar el consentimiento creado 
  eliminarPaciente(id?: number) {
    if (!id) return;
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;

    this.pacientesService.eliminarPaciente(id).subscribe({
      next: () => this.cargarPacientes(),
      error: (err) => console.error('❌ Error al eliminar', err)
    });
  }

  // exportar en excel 
  exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(this.pacientesFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
    XLSX.writeFile(wb, 'pacientes.xlsx');
  }

  importFromExcel(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.pacientesService.importarExcel(file).subscribe({
      next: () => {
        this.fileInput.nativeElement.value = '';
        this.cargarPacientes();
      },
      error: () => alert('Error al importar archivo')
    });
  }

  // Subir archivo en catalan 
  subirArchivoCatalan(event: any, paciente: Paciente) {
    const file = event.target.files?.[0];
    if (!file) return;

    paciente.archivoCatalan = file;
    paciente.nombreArchivoCatalan = file.name;
    paciente.modificado = true;

    console.log('Archivo Catalán seleccionado:', file.name, '- Presiona GUARDAR para subir');
  }

  // subir archivo en castellano 
  subirArchivoCastellano(event: any, paciente: Paciente) {
    const file = event.target.files?.[0];
    if (!file) return;

    paciente.archivoCastellano = file;
    paciente.nombreArchivoCastellano = file.name;
    paciente.modificado = true;

    console.log('Archivo Castellano seleccionado:', file.name, '- Presiona GUARDAR para subir');
  }

  // guardar cambios de la tabla de los consentimientos 
  guardarPaciente(paciente: Paciente) {
    if (!paciente.id) {
      alert('❌ No se puede guardar: falta el ID del paciente');
      return;
    }

    this.pacientesService.actualizarPaciente(paciente.id, paciente).subscribe({
      next: () => {
        alert('✅ Cambios guardados correctamente');
        paciente.modificado = false;
        
        const i = this.pacientes.findIndex(p => p.id === paciente.id);
        if (i !== -1) {
          this.pacientes[i] = { ...paciente };
          this.aplicarFiltros();
        }
      },
      error: (err) => {
        console.error('❌ Error al guardar', err);
        alert('❌ Error al guardar los cambios');
      }
    });
  }

  // ---------- 💾 GUARDAR TODOS ----------
  guardarTodos() {
    if (!confirm('¿Deseas guardar todos los cambios realizados?')) return;

    let guardados = 0;
    let errores = 0;

    this.pacientesFiltrados.forEach((paciente, index) => {
      if (!paciente.id) return;

      this.pacientesService.actualizarPaciente(paciente.id, paciente).subscribe({
        next: () => {
          guardados++;
          paciente.modificado = false;
          if (index === this.pacientesFiltrados.length - 1) {
            alert(`✅ ${guardados} registros guardados correctamente${errores > 0 ? ` (${errores} errores)` : ''}`);
            this.cargarPacientes();
          }
        },
        error: () => {
          errores++;
        }
      });
    });
  }
}