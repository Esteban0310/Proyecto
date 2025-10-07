import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login-component/login-component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin-component/admin-component')
        .then(m => m.AdminComponent)
  },
  {
    path: 'formulario',
    loadComponent: () =>
      import('./components/formulario-component/formulario-component')
        .then(m => m.FormularioComponent)
  },
  {
    path: 'version',
    loadComponent: () =>
      import('./components/version-component/version-component')
        .then(m => m.VersionFormComponent)  // <- Cambiado aquí
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
