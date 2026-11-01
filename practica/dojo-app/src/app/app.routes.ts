import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { permisoGuard } from '@core/auth/permiso.guard';

/**
 * Rutas raíz. TODAS son lazy (`loadComponent` / `loadChildren`): el bundle
 * inicial solo trae el shell. Las públicas son `login`, `salud` y la 404;
 * todo lo demás exige sesión (`authGuard`) y, si aplica, un permiso.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'login',
    title: 'Entrar',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'salud',
    title: 'Salud',
    loadComponent: () => import('./features/salud/salud.component').then((m) => m.SaludComponent),
  },
  {
    path: 'inicio',
    title: 'Inicio',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/inicio/inicio.component').then((m) => m.InicioComponent),
  },
  {
    path: 'almacenes',
    canMatch: [authGuard, permisoGuard('almacenes.ver')],
    loadChildren: () =>
      import('./features/almacenes/almacenes.routes').then((m) => m.ALMACENES_ROUTES),
  },
  {
    path: 'reportes',
    title: 'Reportes',
    loadComponent: () =>
      import('./features/reportes/reportes.component').then((m) => m.ReportesComponent),
  },
  {
    path: '**',
    title: 'No encontrada',
    loadComponent: () =>
      import('./features/no-encontrada/no-encontrada.component').then(
        (m) => m.NoEncontradaComponent,
      ),
  },
];
