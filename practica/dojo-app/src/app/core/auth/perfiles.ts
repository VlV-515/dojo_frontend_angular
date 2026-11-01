/**
 * Permisos de la app. En un ERP real los manda el backend (menús o permisos por
 * rol al iniciar sesión); aquí se simulan con perfiles fijos porque el dojo-api
 * solo valida el token.
 *
 * Convención: `<recurso>.<acción>`.
 */
export type Permiso = 'almacenes.ver' | 'almacenes.editar' | 'reportes.ver';

export interface Perfil {
  clave: string;
  nombre: string;
  permisos: readonly Permiso[];
}

export const PERFILES: readonly Perfil[] = [
  {
    clave: 'admin',
    nombre: 'Administrador',
    permisos: ['almacenes.ver', 'almacenes.editar', 'reportes.ver'],
  },
  {
    clave: 'consulta',
    nombre: 'Solo consulta',
    permisos: ['almacenes.ver'],
  },
];
