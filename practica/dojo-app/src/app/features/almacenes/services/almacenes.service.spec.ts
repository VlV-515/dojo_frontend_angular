import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/http/api-url';
import { Almacen } from '../models/almacen.model';
import { AlmacenesService } from './almacenes.service';

const centro: Almacen = { id: 1, clave: 'ALM-01', nombre: 'Centro', activo: true };

describe('AlmacenesService', () => {
  let service: AlmacenesService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(AlmacenesService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('listar desenvuelve datos', () => {
    let recibido: Almacen[] = [];
    service.listar().subscribe((l) => (recibido = l));
    const req = backend.expectOne('/api/almacenes');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('activos')).toBe(false);
    req.flush({ codigo: 200, mensaje: 'ok', datos: [centro] });
    expect(recibido).toEqual([centro]);
  });

  it('listar(true) manda ?activos=true y tolera datos null', () => {
    let recibido: Almacen[] | undefined;
    service.listar(true).subscribe((l) => (recibido = l));
    backend
      .expectOne('/api/almacenes?activos=true')
      .flush({ codigo: 200, mensaje: 'ok', datos: null });
    expect(recibido).toEqual([]);
  });

  it('obtener, crear y actualizar usan el método y cuerpo correctos', () => {
    service.obtener(1).subscribe();
    service.crear({ clave: 'ALM-01', nombre: 'Centro' }).subscribe();
    service.actualizar(1, { nombre: 'Centro Histórico' }).subscribe();

    expect(backend.expectOne({ method: 'GET', url: '/api/almacenes/1' })).toBeTruthy();
    expect(backend.expectOne({ method: 'POST', url: '/api/almacenes' }).request.body).toEqual({
      clave: 'ALM-01',
      nombre: 'Centro',
    });
    expect(backend.expectOne({ method: 'PUT', url: '/api/almacenes/1' }).request.body).toEqual({
      nombre: 'Centro Histórico',
    });
  });
});
