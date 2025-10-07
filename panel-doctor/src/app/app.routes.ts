import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login-component';
import { AdminComponent } from './components/admin-component/admin-component';
import { FormularioComponent } from './components/formulario-component/formulario-component';
import { VersionFormComponent } from './components/version-component/version-component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'formulario', component: FormularioComponent },
  { path: 'version', component: VersionFormComponent }
];
