/**
 * RETO C · Cajas de punta a punta (módulo 14, proyecto final)
 *
 *   npm run reto:c
 *
 * Contraparte del Reto C del dojo de backend: `GET /cajas?almacen_id=N` y
 * `POST /cajas` con `{ nombre, almacen_id }` (400 si faltan datos, 404 si el
 * almacén no existe). Construye la feature completa, como una de verdad.
 *
 * Contrato que este spec espera:
 * - `features/cajas/models/caja.model.ts`: `Caja { id, nombre, almacen_id, abierta }`
 *   y `CajaAlta { nombre, almacen_id }` (mismos nombres JSON que el backend).
 * - `features/cajas/services/cajas.service.ts`: `CajasService` con
 *   `listarPorAlmacen(almacenId: number): Observable<Caja[]>` y `crear(alta: CajaAlta): Observable<Caja>`.
 * - Permisos nuevos `cajas.ver` y `cajas.editar`: admin tiene ambos, consulta solo `cajas.ver`.
 * - Ruta raíz `cajas` lazy, con `authGuard` y `permisoGuard('cajas.ver')`.
 * - `features/cajas/pages/cajas-lista/cajas-lista.component.ts`: `CajasListaComponent` con
 *   un `mat-select` con etiqueta "Almacén" (solo almacenes activos), una tabla con
 *   `aria-label="Cajas"`, y un formulario con un campo "Nombre de la caja" y un botón
 *   "Agregar caja" (este último solo con `cajas.editar`).
 * - El mock implementa `/cajas` con las mismas reglas que el backend, guardando en `MockDb.cajas`.
 *
 * No cambies este archivo: es la especificación.
 */
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PERFILES } from '@core/auth/perfiles';
import { API_URL } from '@core/http/api-url';
import { MockDb } from '@core/mock/mock-db';
import { NotificacionService } from '@core/ui/notificacion.service';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { firstValueFrom } from 'rxjs';
import { API, iniciarSesion, proveerApiMock, sesionGuardada } from '../../../testing/proveedores';
import { routes } from '../../app.routes';
import { Caja } from './models/caja.model';
import { CajasListaComponent } from './pages/cajas-lista/cajas-lista.component';
import { CajasService } from './services/cajas.service';

const notificacion = { error: jest.fn(), exito: jest.fn() };

describe('Reto C · servicio', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    }),
  );

  it('listarPorAlmacen hace GET /cajas?almacen_id=N y desenvuelve datos', () => {
    let recibido: Caja[] = [];
    TestBed.inject(CajasService)
      .listarPorAlmacen(2)
      .subscribe((c) => (recibido = c));
    const req = TestBed.inject(HttpTestingController).expectOne('/api/cajas?almacen_id=2');
    expect(req.request.method).toBe('GET');
    const caja: Caja = { id: 1, nombre: 'Caja 1', almacen_id: 2, abierta: false };
    req.flush({ codigo: 200, mensaje: 'Cajas consultadas', datos: [caja] });
    expect(recibido).toEqual([caja]);
  });

  it('crear hace POST /cajas con { nombre, almacen_id }', () => {
    TestBed.inject(CajasService).crear({ nombre: 'Caja 1', almacen_id: 2 }).subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/cajas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombre: 'Caja 1', almacen_id: 2 });
  });
});

describe('Reto C · permisos y ruta', () => {
  it('admin tiene cajas.ver y cajas.editar; consulta solo cajas.ver', () => {
    const permisos = (clave: string) =>
      PERFILES.find((p) => p.clave === clave)?.permisos as readonly string[];
    expect(permisos('admin')).toEqual(expect.arrayContaining(['cajas.ver', 'cajas.editar']));
    expect(permisos('consulta')).toContain('cajas.ver');
    expect(permisos('consulta')).not.toContain('cajas.editar');
  });

  it('la ruta cajas es lazy', () => {
    const ruta = routes.find((r) => r.path === 'cajas');
    expect(ruta).toBeDefined();
    expect(ruta?.component).toBeUndefined();
    expect(ruta?.loadComponent ?? ruta?.loadChildren).toBeDefined();
  });

  it.each([
    ['anonimo', '/login?volver=%2Fcajas'],
    ['consulta', '/cajas'],
  ])('%s en /cajas termina en %s', async (perfil, esperado) => {
    sessionStorage.clear();
    if (perfil !== 'anonimo') sesionGuardada(perfil as 'consulta');
    TestBed.configureTestingModule({
      providers: [
        ...proveerApiMock(),
        provideRouter(routes),
        { provide: NotificacionService, useValue: notificacion },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/cajas');
    expect(TestBed.inject(Router).url).toBe(esperado);
  });
});

describe('Reto C · mock', () => {
  let http: HttpClient;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [...proveerApiMock(), { provide: NotificacionService, useValue: notificacion }],
    });
    TestBed.inject(MockDb).reiniciar();
    iniciarSesion();
    http = TestBed.inject(HttpClient);
  });

  it('alta y consulta por almacén', async () => {
    const alta = await firstValueFrom(
      http.post<{ codigo: number; datos: Caja }>(`${API}/cajas`, {
        nombre: ' Caja Norte ',
        almacen_id: 2,
      }),
    );
    expect(alta.codigo).toBe(201);
    expect(alta.datos).toMatchObject({ nombre: 'Caja Norte', almacen_id: 2, abierta: false });

    const lista = await firstValueFrom(http.get<{ datos: Caja[] }>(`${API}/cajas?almacen_id=2`));
    expect(lista.datos.some((c) => c.id === alta.datos.id)).toBe(true);
    expect(lista.datos.every((c) => c.almacen_id === 2)).toBe(true);
  });

  it('400 sin almacen_id o sin nombre; 404 si el almacén no existe', async () => {
    await expect(firstValueFrom(http.get(`${API}/cajas`))).rejects.toMatchObject({ status: 400 });
    await expect(
      firstValueFrom(http.post(`${API}/cajas`, { nombre: '  ', almacen_id: 1 })),
    ).rejects.toMatchObject({
      status: 400,
    });
    await expect(
      firstValueFrom(http.post(`${API}/cajas`, { nombre: 'X', almacen_id: 999 })),
    ).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('Reto C · pantalla', () => {
  async function pintar(perfil: 'admin' | 'consulta') {
    sessionStorage.clear();
    sesionGuardada(perfil);
    await render(CajasListaComponent, {
      providers: [...proveerApiMock(), { provide: NotificacionService, useValue: notificacion }],
    });
    TestBed.inject(MockDb).reiniciar();
  }

  async function elegirAlmacen(nombre: string) {
    await userEvent.click(screen.getByRole('combobox', { name: 'Almacén' }));
    await userEvent.click(await screen.findByRole('option', { name: new RegExp(nombre) }));
  }

  it('el selector solo ofrece almacenes activos', async () => {
    await pintar('admin');
    await userEvent.click(screen.getByRole('combobox', { name: 'Almacén' }));
    expect(await screen.findByRole('option', { name: /Almacén Centro/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Almacén Sur/ })).not.toBeInTheDocument();
  });

  it('agrega una caja al almacén elegido y la muestra en la tabla', async () => {
    await pintar('admin');
    await elegirAlmacen('Almacén Norte');
    await userEvent.type(
      screen.getByRole('textbox', { name: /Nombre de la caja/ }),
      'Caja Express',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Agregar caja' }));

    const tabla = screen.getByRole('table', { name: 'Cajas' });
    expect(await within(tabla).findByText('Caja Express')).toBeInTheDocument();
    expect(
      TestBed.inject(MockDb).cajas.some((c) => c.nombre === 'Caja Express' && c.almacen_id === 2),
    ).toBe(true);
  });

  it('consulta ve las cajas pero no puede agregar', async () => {
    await pintar('consulta');
    await elegirAlmacen('Almacén Centro');
    expect(screen.getByRole('table', { name: 'Cajas' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar caja' })).not.toBeInTheDocument();
  });
});
