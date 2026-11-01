import { Injectable, computed, signal } from '@angular/core';
import { PERFILES, Perfil, Permiso } from './perfiles';

interface Sesion {
  token: string;
  perfil: Perfil;
}

const LLAVE = 'dojo.sesion';

/**
 * Estado de la sesión con signals. Guarda en `sessionStorage` (se borra al
 * cerrar la pestaña). `localStorage` sobrevive y cualquier script que logre
 * correr en la página (XSS) puede leer ambos: el módulo 13 explica por qué en
 * producción se prefieren cookies `HttpOnly` cuando el backend lo permite.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly sesion = signal<Sesion | null>(leerGuardada());

  readonly autenticado = computed(() => this.sesion() !== null);
  readonly token = computed(() => this.sesion()?.token ?? null);
  readonly perfil = computed(() => this.sesion()?.perfil ?? null);

  iniciar(token: string, clavePerfil: string): void {
    const perfil = PERFILES.find((p) => p.clave === clavePerfil);
    if (!perfil) throw new Error(`Perfil desconocido: ${clavePerfil}`);
    const sesion: Sesion = { token: token.trim(), perfil };
    this.sesion.set(sesion);
    sessionStorage.setItem(LLAVE, JSON.stringify({ token: sesion.token, perfil: perfil.clave }));
  }

  cerrar(): void {
    this.sesion.set(null);
    sessionStorage.removeItem(LLAVE);
  }

  tiene(permiso: Permiso): boolean {
    return this.perfil()?.permisos.includes(permiso) ?? false;
  }
}

function leerGuardada(): Sesion | null {
  try {
    const crudo = sessionStorage.getItem(LLAVE);
    if (!crudo) return null;
    const { token, perfil } = JSON.parse(crudo) as { token?: unknown; perfil?: unknown };
    const encontrado = PERFILES.find((p) => p.clave === perfil);
    return typeof token === 'string' && token !== '' && encontrado
      ? { token, perfil: encontrado }
      : null;
  } catch {
    return null;
  }
}
