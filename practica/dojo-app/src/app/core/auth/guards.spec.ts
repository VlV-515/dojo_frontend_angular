import { TestBed } from '@angular/core/testing';
import { Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { NotificacionService } from '@core/ui/notificacion.service';
import { proveerApiMock } from '../../../testing/proveedores';
import { authGuard } from './auth.guard';
import { permisoGuard } from './permiso.guard';
import { SesionService } from './sesion.service';

const ruta: Route = {};
const segmentos = [new UrlSegment('almacenes', {}), new UrlSegment('nuevo', {})];
const ejecutar = (guard: typeof authGuard) =>
  TestBed.runInInjectionContext(() => guard(ruta, segmentos));

describe('authGuard y permisoGuard', () => {
  const notificacion = { error: jest.fn(), exito: jest.fn() };

  beforeEach(() => {
    sessionStorage.clear();
    notificacion.error.mockClear();
    TestBed.configureTestingModule({
      providers: [...proveerApiMock(), { provide: NotificacionService, useValue: notificacion }],
    });
  });

  it('sin sesión manda a /login recordando a dónde iba', () => {
    const resultado = ejecutar(authGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe(
      '/login?volver=%2Falmacenes%2Fnuevo',
    );
  });

  it('con sesión deja pasar', () => {
    TestBed.inject(SesionService).iniciar('t', 'consulta');
    expect(ejecutar(authGuard)).toBe(true);
  });

  it('permisoGuard deja pasar si el perfil tiene el permiso', () => {
    TestBed.inject(SesionService).iniciar('t', 'admin');
    expect(ejecutar(permisoGuard('almacenes.editar'))).toBe(true);
  });

  it('permisoGuard sin permiso avisa y manda a /inicio', () => {
    TestBed.inject(SesionService).iniciar('t', 'consulta');
    const resultado = ejecutar(permisoGuard('almacenes.editar')) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/inicio');
    expect(notificacion.error).toHaveBeenCalledTimes(1);
  });
});
