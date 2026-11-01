import { Routes } from '@angular/router';
import { permisoGuard } from '@core/auth/permiso.guard';
import { cambiosSinGuardarGuard } from '@core/guards/cambios-sin-guardar.guard';

/**
 * Rutas hijas de `/almacenes`. Se cargan lazy desde app.routes.ts, así que
 * nada de este archivo (ni de sus componentes) viaja en el bundle inicial.
 * El permiso de ver ya lo pidió la ruta padre; aquí solo se agrega el de editar.
 */
export const ALMACENES_ROUTES: Routes = [
  {
    path: '',
    title: 'Almacenes',
    loadComponent: () =>
      import('./pages/almacenes-lista/almacenes-lista.component').then(
        (m) => m.AlmacenesListaComponent,
      ),
  },
  {
    path: 'nuevo',
    title: 'Nuevo almacén',
    canMatch: [permisoGuard('almacenes.editar')],
    canDeactivate: [cambiosSinGuardarGuard],
    loadComponent: () =>
      import('./pages/almacen-form/almacen-form.component').then((m) => m.AlmacenFormComponent),
  },
  {
    path: ':id/editar',
    title: 'Editar almacén',
    canMatch: [permisoGuard('almacenes.editar')],
    canDeactivate: [cambiosSinGuardarGuard],
    loadComponent: () =>
      import('./pages/almacen-form/almacen-form.component').then((m) => m.AlmacenFormComponent),
  },
];
