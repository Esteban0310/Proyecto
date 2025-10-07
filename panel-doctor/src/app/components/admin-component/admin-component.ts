import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { PacientesService, PacienteFormulario } from '../../services/pacientes';

interface Paciente extends PacienteFormulario {
  servicio?: string;
  estadoValidacion: 'pendiente' | 'validado';
  version: string;
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
    nombre: '',
    estadoValidacion: ''
  };

  constructor(private router: Router, private pacientesService: PacientesService) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    const pacientesGuardados = this.pacientesService.obtenerPacientes();
    this.pacientes = pacientesGuardados.map(p => ({
      ...p,
      version: p.version || 'V.1',
      estadoValidacion: p.estadoValidacion || 'pendiente'
    }));
    this.pacientesFiltrados = [...this.pacientes];
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    if (this.menuAbierto) {
      this.menuUsuario = false;
      this.filtrosAbiertos = false;
    }
  }

  toggleUserMenu() {
    this.menuUsuario = !this.menuUsuario;
    if (this.menuUsuario) {
      this.menuAbierto = false;
      this.filtrosAbiertos = false;
    }
  }

  toggleFiltros() {
    this.filtrosAbiertos = !this.filtrosAbiertos;
    if (this.filtrosAbiertos) {
      this.menuAbierto = false;
      this.menuUsuario = false;
    }
  }

  buscar() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.pacientesFiltrados = this.pacientes.filter(p => {
      const coincideBusqueda = !this.busqueda ||
        p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        p.email.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        p.id?.toString().includes(this.busqueda) ||
        p.version.toLowerCase().includes(this.busqueda.toLowerCase());

      const coincideId = !this.filtros.id || p.id?.toString().includes(this.filtros.id);
      const coincideVersion = !this.filtros.version || p.version.toLowerCase().includes(this.filtros.version.toLowerCase());
      const coincideEmail = !this.filtros.email || p.email.toLowerCase().includes(this.filtros.email.toLowerCase());
      const coincideNombre = !this.filtros.nombre || p.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase());
      const coincideEstado = !this.filtros.estadoValidacion || p.estadoValidacion.toLowerCase().includes(this.filtros.estadoValidacion.toLowerCase());

      return coincideBusqueda && coincideId && coincideVersion && coincideEmail && coincideNombre && coincideEstado;
    });
  }

  limpiarFiltros() {
    this.filtros = { id: '', version: '', email: '', nombre: '', estadoValidacion: '' };
    this.busqueda = '';
    this.pacientesFiltrados = [...this.pacientes];
  }

  Database() {
    this.menuAbierto = false;
    this.router.navigate(['/admin']);
  }

  Formulario() {
    this.menuAbierto = false;
    this.router.navigate(['/formulario']);
  }

  Version() {
    this.menuAbierto = false;
    this.router.navigate(['/version']);
  }

  cerrarSesion() {
    this.menuAbierto = false;
    this.menuUsuario = false;
    this.filtrosAbiertos = false;
    this.router.navigate(['/login']);
  }

  // ---- NUEVA VERSION ----
  nuevaVersion(prevPaciente: Paciente) {
    const versionActual = parseInt(prevPaciente.version.replace('V.', '')) || 1;
    const nuevaVersion = versionActual + 1;

    const nuevoPaciente: PacienteFormulario = {
      ...prevPaciente,
      id: undefined, // nuevo ID lo asignará el service
      version: `V.${nuevaVersion}`,
      creadoPor: this.usuario.nombre,
      actualizadoPor: this.usuario.nombre,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      estadoValidacion: 'pendiente'
    };

    this.pacientesService.guardarPaciente(nuevoPaciente);
    this.cargarPacientes();
  }

  exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(this.pacientesFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
    XLSX.writeFile(wb, 'pacientes.xlsx');
  }
}
