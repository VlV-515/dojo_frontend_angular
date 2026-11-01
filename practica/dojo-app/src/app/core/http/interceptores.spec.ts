import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { SesionService } from '@core/auth/sesion.service';
import { ErrorApp } from '@core/errores/error-app';
import { CargaService } from '@core/ui/carga.service';
import { NotificacionService } from '@core/ui/notificacion.service';
import { API_URL } from './api-url';
import { cargaInterceptor } from './carga.interceptor';
import { silencioso } from './contexto';
import { errorInterceptor } from './error.interceptor';

describe('Interceptores', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  const notificacion = { error: jest.fn(), exito: jest.fn() };

  beforeEach(() => {
    sessionStorage.clear();
    notificacion.error.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([cargaInterceptor, authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
        { provide: NotificacionService, useValue: notificacion },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  describe('authInterceptor', () => {
    it('agrega el token solo a nuestra API', () => {
      TestBed.inject(SesionService).iniciar('secreto', 'admin');
      http.get('/api/almacenes').subscribe();
      http.get('https://terceros.example/recurso').subscribe();
      expect(backend.expectOne('/api/almacenes').request.headers.get('Authorization')).toBe(
        'Bearer secreto',
      );
      expect(
        backend.expectOne('https://terceros.example/recurso').request.headers.has('Authorization'),
      ).toBe(false);
    });

    it('sin sesión no agrega nada', () => {
      http.get('/api/almacenes').subscribe();
      expect(backend.expectOne('/api/almacenes').request.headers.has('Authorization')).toBe(false);
    });
  });

  describe('errorInterceptor', () => {
    it('401 cierra la sesión, avisa y manda a /login', () => {
      const navegar = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      TestBed.inject(SesionService).iniciar('vencido', 'admin');
      let recibido: ErrorApp | undefined;
      http.get('/api/almacenes').subscribe({ error: (e: ErrorApp) => (recibido = e) });
      backend
        .expectOne('/api/almacenes')
        .flush({ codigo: 401, mensaje: 'No autorizado' }, { status: 401, statusText: 'x' });
      expect(TestBed.inject(SesionService).autenticado()).toBe(false);
      expect(navegar).toHaveBeenCalledWith(['/login']);
      expect(recibido?.notificado).toBe(true);
    });

    it('409 se propaga normalizado y SIN toast (lo maneja el componente)', () => {
      let recibido: ErrorApp | undefined;
      http.post('/api/almacenes', {}).subscribe({ error: (e: ErrorApp) => (recibido = e) });
      backend
        .expectOne('/api/almacenes')
        .flush(
          { codigo: 409, mensaje: 'Clave duplicada', detalle: 'dup' },
          { status: 409, statusText: 'x' },
        );
      expect(recibido).toBeInstanceOf(ErrorApp);
      expect(recibido?.message).toBe('Clave duplicada');
      expect(notificacion.error).not.toHaveBeenCalled();
    });

    it('500 muestra toast, salvo con silencioso()', () => {
      http.get('/api/a').subscribe({ error: () => undefined });
      http.get('/api/b', { context: silencioso() }).subscribe({ error: () => undefined });
      backend.expectOne('/api/a').flush(null, { status: 500, statusText: 'x' });
      backend.expectOne('/api/b').flush(null, { status: 500, statusText: 'x' });
      expect(notificacion.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('cargaInterceptor', () => {
    it('enciende el indicador y lo apaga aunque la petición falle', () => {
      const carga = TestBed.inject(CargaService);
      http.get('/api/a').subscribe({ error: () => undefined });
      http.get('/api/b').subscribe();
      expect(carga.cargando()).toBe(true);
      backend.expectOne('/api/a').flush(null, { status: 404, statusText: 'x' });
      expect(carga.cargando()).toBe(true); // falta /api/b
      backend.expectOne('/api/b').flush({});
      expect(carga.cargando()).toBe(false);
    });
  });
});
