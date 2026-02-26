import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { PacientesService, PacienteFormulario } from '../../services/pacientes';

interface Paciente extends PacienteFormulario {
  estadoValidacion?: 'pendiente' | 'validado' | 'caducado';
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

  modalEditarAbierto = false;
  pacienteEditar: Paciente | null = null;

  viendoCaducados = false;

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
          estadoValidacion: p.estadoValidacion || 'pendiente'
        })) as Paciente[];

        this.pacientesFiltrados = this.pacientes.filter(p => p.estadoValidacion !== 'caducado');
        this.viendoCaducados = false;
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
      if (this.viendoCaducados && p.estadoValidacion !== 'caducado') return false;
      if (!this.viendoCaducados && p.estadoValidacion === 'caducado') return false;

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
    this.aplicarFiltros();
  }

  verCaducados() {
    this.viendoCaducados = true;
    this.menuAbierto = false;
    this.limpiarFiltros();
    this.pacientesFiltrados = this.pacientes.filter(p => p.estadoValidacion === 'caducado');
  }

  Database() { 
    this.viendoCaducados = false;
    this.menuAbierto = false;
    this.limpiarFiltros();
    this.pacientesFiltrados = this.pacientes.filter(p => p.estadoValidacion !== 'caducado');
  }

  Formulario() { this.router.navigate(['/formulario']); }
  Version() { this.router.navigate(['/version']); }
  cerrarSesion() { this.router.navigate(['/login']); }

  editarPaciente(paciente: Paciente) {
    this.pacienteEditar = { ...paciente };
    this.modalEditarAbierto = true;
    this.menuAbierto = false;
  }

  cerrarModalEditar() {
    this.modalEditarAbierto = false;
    this.pacienteEditar = null;
  }

  guardarDesdeModal() {
    if (!this.pacienteEditar || !this.pacienteEditar.id) {
      alert('❌ Error: no se puede guardar');
      return;
    }

    this.pacientesService.actualizarPaciente(this.pacienteEditar.id, this.pacienteEditar).subscribe({
      next: () => {
        alert('✅ Cambios guardados correctamente');
        
        const i = this.pacientes.findIndex(p => p.id === this.pacienteEditar!.id);
        if (i !== -1) {
          this.pacientes[i] = { ...this.pacienteEditar! };
        }
        
        this.cerrarModalEditar();
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('❌ Error al guardar', err);
        alert('❌ Error al guardar los cambios');
      }
    });
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