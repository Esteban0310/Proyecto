import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
    idConsentimiento: '',
    estadoValidacion: ''
  };

  // Para el input de archivo Excel
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(private router: Router, private pacientesService: PacientesService) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  // ✅ Cargar pacientes
  cargarPacientes() {
    this.pacientesService.obtenerPacientes().subscribe({
      next: (pacientesGuardados) => {
        this.pacientes = pacientesGuardados.map((p: PacienteFormulario) => ({
          ...p,
          version: p.version || 'V.1',
          estadoValidacion: p.estadoValidacion || 'pendiente'
        })) as Paciente[];
        this.pacientesFiltrados = [...this.pacientes];
      },
      error: (err) => console.error('❌ Error al cargar pacientes:', err)
    });
  }

  // 🔄 Refrescar datos
  refrescar() {
    this.cargarPacientes();
  }

  // --- Menús ---
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

  // 🔍 Buscar y filtrar
  buscar() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.pacientesFiltrados = this.pacientes.filter(p => {
      const coincideBusqueda = !this.busqueda ||
        Object.values(p).some(val =>
          val !== undefined &&
          val !== null &&
          val.toString().toLowerCase().includes(this.busqueda.toLowerCase())
        );

      const coincideId = !this.filtros.id || p.id?.toString().includes(this.filtros.id);
      const coincideVersion = !this.filtros.version || p.version?.toLowerCase().includes(this.filtros.version.toLowerCase());
      const coincideEmail = !this.filtros.email || p.email?.toLowerCase().includes(this.filtros.email.toLowerCase());
      const coincideIdConsentimiento = !this.filtros.idConsentimiento || p.idConsentimiento?.toLowerCase().includes(this.filtros.idConsentimiento.toLowerCase());
      const coincideEstado = !this.filtros.estadoValidacion || p.estadoValidacion?.toLowerCase().includes(this.filtros.estadoValidacion.toLowerCase());

      return coincideBusqueda && coincideId && coincideVersion && coincideEmail && coincideIdConsentimiento && coincideEstado;
    });
  }

  limpiarFiltros() {
    this.filtros = { id: '', version: '', email: '', idConsentimiento: '', estadoValidacion: '' };
    this.busqueda = '';
    this.pacientesFiltrados = [...this.pacientes];
  }

  // --- Navegación ---
  Database() { this.menuAbierto = false; this.router.navigate(['/admin']); }
  Formulario() { this.menuAbierto = false; this.router.navigate(['/formulario']); }
  Version() { this.menuAbierto = false; this.router.navigate(['/version']); }

  cerrarSesion() {
    this.menuAbierto = false;
    this.menuUsuario = false;
    this.filtrosAbiertos = false;
    this.router.navigate(['/login']);
  }

  // 🆕 Nueva versión (mantengo tu lógica)
  nuevaVersion(prevPaciente: Paciente) {
    const versionActual = parseInt((prevPaciente.version || 'V.1').replace('V.', '')) || 1;
    const nuevaVersion = versionActual + 1;

    const nuevoPaciente: PacienteFormulario = {
      ...prevPaciente,
      id: undefined,
      version: `V.${nuevaVersion}`,
      creadoPor: this.usuario.nombre,
      actualizadoPor: this.usuario.nombre,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      estadoValidacion: 'pendiente'
    };

    this.pacientesService.guardarPaciente(nuevoPaciente).subscribe(() => this.cargarPacientes());
  }

  // 📤 Exportar a Excel
  exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(this.pacientesFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
    XLSX.writeFile(wb, 'pacientes.xlsx');
  }

  // 📥 Importar desde Excel (guarda cada fila en el backend)
  importFromExcel(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

      // Enviamos cada fila al backend
      const saves = importedData.map(row => {
        return this.pacientesService.guardarPaciente(row).toPromise();
      });

      Promise.allSettled(saves).then(() => {
        alert('✅ Importación completada');
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        this.cargarPacientes();
      });
    };
    reader.readAsArrayBuffer(file);
  }

  // ✏️ Editar paciente
  editarPaciente(paciente: Paciente) {
    const nuevoNombre = prompt('Editar Nombre del Consentimiento:', paciente.nombreConsentimiento || '');
    if (nuevoNombre === null) return;

    const actualizado = {
      ...paciente,
      nombreConsentimiento: nuevoNombre,
      actualizadoPor: this.usuario.nombre,
      fechaActualizacion: new Date()
    };

    if (actualizado.id) {
      // Si tienes un método updatePaciente, usa ese
      this.pacientesService.actualizarPaciente(actualizado.id, actualizado).subscribe({
        next: () => this.cargarPacientes(),
        error: (err) => console.error('❌ Error al actualizar', err)
      });
    }
  }

  // 🗑️ Eliminar paciente
  eliminarPaciente(id?: number) {
    if (!id) return;
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;

    this.pacientesService.eliminarPaciente(id).subscribe({
      next: () => {
        alert('🗑️ Registro eliminado');
        this.cargarPacientes();
      },
      error: (err) => console.error('❌ Error al eliminar', err)
    });
  }
}
