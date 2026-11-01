/**
 * RETO A · Cazador de rutas sin guard (módulo 06)
 *
 *   npm run reto:a
 *
 * Alguien registró una ruta privada SIN guards. Cualquiera que teclee la URL
 * entra, aunque no haya iniciado sesión ni tenga permiso. Encuéntrala y
 * protégela con los guards que ya existen en `src/app/core/auth/`.
 *
 * No cambies este archivo: es la especificación.
 */
import { TestBed } from '@angular/core/testing';
import { Route, Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { authGuard } from '@core/auth/auth.guard';
import { MockDb } from '@core/mock/mock-db';
import { NotificacionService } from '@core/ui/notificacion.service';
import { proveerApiMock, sesionGuardada } from '../testing/proveedores';
import { routes } from './app.routes';

/** Las únicas rutas raíz que pueden ser públicas. */
const PUBLICAS = ['', 'login', 'salud', '**'];

async function navegarComo(perfil: 'anonimo' | 'admin' | 'consulta', url: string): Promise<string> {
  sessionStorage.clear();
  if (perfil !== 'anonimo') sesionGuardada(perfil);
  TestBed.configureTestingModule({
    providers: [
      ...proveerApiMock(),
      provideRouter(routes, withComponentInputBinding()),
      { provide: NotificacionService, useValue: { error: jest.fn(), exito: jest.fn() } },
    ],
  });
  TestBed.inject(MockDb).reiniciar();
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return TestBed.inject(Router).url;
}

describe('Reto A · rutas privadas protegidas', () => {
  it('toda ruta raíz que no es pública exige sesión (authGuard en canMatch)', () => {
    const expuestas = routes
      .filter((r: Route) => !PUBLICAS.includes(r.path ?? ''))
      .filter((r: Route) => !(r.canMatch ?? []).includes(authGuard))
      .map((r) => `/${r.path}`);
    expect(expuestas).toEqual([]);
  });

  it('sin sesión, /reportes manda a /login y recuerda a dónde iba', async () => {
    expect(await navegarComo('anonimo', '/reportes')).toBe('/login?volver=%2Freportes');
  });

  it('un perfil sin el permiso reportes.ver no entra a /reportes', async () => {
    expect(await navegarComo('consulta', '/reportes')).toBe('/inicio');
  });

  it('un perfil con reportes.ver sí entra', async () => {
    expect(await navegarComo('admin', '/reportes')).toBe('/reportes');
  });

  it('las rutas públicas siguen públicas', async () => {
    expect(await navegarComo('anonimo', '/salud')).toBe('/salud');
  });
});
