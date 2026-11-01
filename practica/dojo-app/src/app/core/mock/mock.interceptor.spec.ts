import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ErrorApp } from '@core/errores/error-app';
import { NotificacionService } from '@core/ui/notificacion.service';
import { firstValueFrom } from 'rxjs';
import { API, iniciarSesion, proveerApiMock } from '../../../testing/proveedores';
import { MockDb } from './mock-db';

describe('mockInterceptor', () => {
  let http: HttpClient;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        ...proveerApiMock(),
        { provide: NotificacionService, useValue: { error: jest.fn() } },
      ],
    });
    TestBed.inject(MockDb).reiniciar();
    http = TestBed.inject(HttpClient);
  });

  it('/salud es pública', async () => {
    await expect(firstValueFrom(http.get(`${API}/salud`))).resolves.toEqual({
      estado: 'ok',
      persistencia: 'mock',
    });
  });

  it('sin token responde 401 como el dojo-api', async () => {
    await expect(firstValueFrom(http.get(`${API}/almacenes`))).rejects.toMatchObject({
      status: 401,
    });
  });

  it('lista con la envoltura { codigo, mensaje, datos } y filtra activos', async () => {
    iniciarSesion();
    const todos = await firstValueFrom(
      http.get<{ codigo: number; datos: unknown[] }>(`${API}/almacenes`),
    );
    const activos = await firstValueFrom(
      http.get<{ datos: unknown[] }>(`${API}/almacenes?activos=true`),
    );
    expect(todos.codigo).toBe(200);
    expect(activos.datos.length).toBeLessThan(todos.datos.length);
  });

  it('alta normaliza la clave y rechaza duplicados con 409', async () => {
    iniciarSesion();
    const alta = await firstValueFrom(
      http.post<{ datos: { clave: string } }>(`${API}/almacenes`, {
        clave: ' alm-99 ',
        nombre: 'Nuevo',
      }),
    );
    expect(alta.datos.clave).toBe('ALM-99');
    const dup = firstValueFrom(http.post(`${API}/almacenes`, { clave: 'ALM-99', nombre: 'Otro' }));
    await expect(dup).rejects.toBeInstanceOf(ErrorApp);
    await expect(dup).rejects.toMatchObject({ status: 409 });
  });

  it('ruta desconocida responde 404', async () => {
    iniciarSesion();
    await expect(firstValueFrom(http.get(`${API}/no-existe`))).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('mockInterceptor con otras URLs', () => {
  it('deja pasar lo que no es de la API', () => {
    TestBed.configureTestingModule({
      providers: [...proveerApiMock(), provideHttpClientTesting()],
    });
    TestBed.inject(HttpClient).get('/otra-cosa').subscribe();
    TestBed.inject(HttpTestingController).expectOne('/otra-cosa').flush('ok');
  });
});
