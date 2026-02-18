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

  Database() { this.router.navigate(['/admin']); }
  Formulario() { this.router.navigate(['/formulario']); }
  Version() { this.router.navigate(['/version']); }
  cerrarSesion() { this.router.navigate(['/login']); }

  // ✅ EDITAR TODOS LOS CAMPOS (ANTIGUOS + NUEVOS)
  editarPaciente(paciente: Paciente) {
    // CAMPOS ANTIGUOS
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

    const lateralidad = prompt('Lateralidad:', paciente.lateralidad ?? '');
    if (lateralidad === null) return;

    const observaciones = prompt('Observaciones:', paciente.observaciones ?? '');
    if (observaciones === null) return;

    const aceptadoTxt = prompt(
      '¿Aceptado? (si / no)',
      paciente.aceptadoPorProfesional ? 'si' : 'no'
    );
    if (aceptadoTxt === null) return;

    // ✅ NUEVOS CAMPOS DE VALIDACIÓN
    const fechaValidacionIA = prompt('Fecha Validación IA (YYYY-MM-DD):', paciente.fechaValidacionIA ?? '');
    if (fechaValidacionIA === null) return;

    const fechaReenvioProfesional = prompt('Fecha Reenvío Profesional (YYYY-MM-DD):', paciente.fechaReenvioProfesional ?? '');
    if (fechaReenvioProfesional === null) return;

    const aceptadoPorProfesional = prompt(
      'Aceptado por Profesional (si / no_contesta / no):', 
      typeof paciente.aceptadoPorProfesional === 'string' ? paciente.aceptadoPorProfesional : (paciente.aceptadoPorProfesional ? 'si' : 'no')
    );
    if (aceptadoPorProfesional === null) return;

    const idiomasDisponibles = prompt(
      'Idiomas Disponibles (catala / espanyol / ambos):', 
      paciente.idiomasDisponibles ?? ''
    );
    if (idiomasDisponibles === null) return;

    const fechaSubidaIntranet = prompt('Fecha Subida Intranet (YYYY-MM-DD):', paciente.fechaSubidaIntranet ?? '');
    if (fechaSubidaIntranet === null) return;

    const fechaDisponibleEConsentimiento = prompt('Fecha Disponible eConsentimiento (YYYY-MM-DD):', paciente.fechaDisponibleEConsentimiento ?? '');
    if (fechaDisponibleEConsentimiento === null) return;

    const codigoEConsentimiento = prompt('Código eConsentimiento:', paciente.codigoEConsentimiento ?? '');
    if (codigoEConsentimiento === null) return;

    const observacionesValidacion = prompt('Observaciones Validación:', paciente.observacionesValidacion ?? '');
    if (observacionesValidacion === null) return;

    // ✅ NUEVOS CAMPOS DE LINKS
    const linkConsentimientoDefinitivoCatala = prompt('Link Consentimiento Definitivo Català:', paciente.linkConsentimientoDefinitivoCatala ?? '');
    if (linkConsentimientoDefinitivoCatala === null) return;

    const linkConsentimientoDefinitivoCastellano = prompt('Link Consentimiento Definitivo Castellano:', paciente.linkConsentimientoDefinitivoCastellano ?? '');
    if (linkConsentimientoDefinitivoCastellano === null) return;

    const actualizado: Paciente = {
      ...paciente,
      // CAMPOS ANTIGUOS
      codigoConsentimientoInterno: codigoInterno,
      nombreConsentimiento,
      nombreProfesional,
      emailProfesional,
      instituto,
      codigoServicio,
      lateralidad,
      observaciones,
      aceptadoPorProfesional: aceptadoTxt.toLowerCase() === 'si',
      
      // ✅ NUEVOS CAMPOS DE VALIDACIÓN
      fechaValidacionIA: fechaValidacionIA || undefined,
      fechaReenvioProfesional: fechaReenvioProfesional || undefined,
      idiomasDisponibles: idiomasDisponibles || undefined,
      fechaSubidaIntranet: fechaSubidaIntranet || undefined,
      fechaDisponibleEConsentimiento: fechaDisponibleEConsentimiento || undefined,
      codigoEConsentimiento: codigoEConsentimiento || undefined,
      observacionesValidacion: observacionesValidacion || undefined,
      
      // ✅ NUEVOS CAMPOS DE LINKS
      linkConsentimientoDefinitivoCatala: linkConsentimientoDefinitivoCatala || undefined,
      linkConsentimientoDefinitivoCastellano: linkConsentimientoDefinitivoCastellano || undefined,
      
      actualizadoPor: this.usuario.nombre,
      fechaActualizacion: new Date(),
      modificado: true
    };

    // Asignar el valor de aceptadoPorProfesional correctamente
    if (aceptadoPorProfesional) {
      actualizado.aceptadoPorProfesional = aceptadoPorProfesional as 'si' | 'no_contesta' | 'no';
    }

    if (!actualizado.id) return;
    const i = this.pacientes.findIndex(p => p.id === actualizado.id);
    if (i !== -1) {
      this.pacientes[i] = actualizado;
      this.pacientesFiltrados = [...this.pacientes];
    }
  }

  eliminarPaciente(id?: number) {
    if (!id) return;
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;

    this.pacientesService.eliminarPaciente(id).subscribe({
      next: () => this.cargarPacientes(),
      error: (err) => console.error('❌ Error al eliminar', err)
    });
  }

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

  subirArchivoCatalan(event: any, paciente: Paciente) {
    const file = event.target.files?.[0];
    if (!file) return;

    paciente.archivoCatalan = file;
    paciente.nombreArchivoCatalan = file.name;
    paciente.modificado = true;

    console.log('Archivo Catalán seleccionado:', file.name, '- Presiona GUARDAR para subir');
  }

  subirArchivoCastellano(event: any, paciente: Paciente) {
    const file = event.target.files?.[0];
    if (!file) return;

    paciente.archivoCastellano = file;
    paciente.nombreArchivoCastellano = file.name;
    paciente.modificado = true;

    console.log('Archivo Castellano seleccionado:', file.name, '- Presiona GUARDAR para subir');
  }

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