import { TestBed } from '@angular/core/testing';
import { ErrorApp } from '@core/errores/error-app';
import { of, throwError } from 'rxjs';
import { Almacen } from '../models/almacen.model';
import { AlmacenesService } from '../services/almacenes.service';
import { AlmacenesStore } from './almacenes.store';

const lista: Almacen[] = [
  { id: 1, clave: 'ALM-01', nombre: 'Centro', activo: true },
  { id: 2, clave: 'ALM-02', nombre: 'Norte', activo: false },
  { id: 3, clave: 'BOD-03', nombre: 'Bodega Sur', activo: true },
];

describe('AlmacenesStore', () => {
  const service = {
    listar: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
  };
  let store: AlmacenesStore;

  beforeEach(() => {
    jest.resetAllMocks();
    service.listar.mockReturnValue(of(lista));
    TestBed.configureTestingModule({
      providers: [{ provide: AlmacenesService, useValue: service }],
    });
    store = TestBed.inject(AlmacenesStore);
  });

  it('cargar llena la lista y apaga cargando', () => {
    store.cargar();
    expect(store.almacenes()).toEqual(lista);
    expect(store.cargando()).toBe(false);
    expect(store.totalActivos()).toBe(2);
  });

  it('cargar guarda el mensaje de error', () => {
    service.listar.mockReturnValue(throwError(() => new ErrorApp(0, 'Sin conexión')));
    store.cargar();
    expect(store.error()).toBe('Sin conexión');
    expect(store.cargando()).toBe(false);
  });

  it('filtrados combina texto y estatus', () => {
    store.cargar();
    store.texto.set('alm');
    expect(store.filtrados().map((a) => a.id)).toEqual([1, 2]);
    store.estatus.set('activos');
    expect(store.filtrados().map((a) => a.id)).toEqual([1]);
    store.texto.set('');
    store.estatus.set('inactivos');
    expect(store.filtrados().map((a) => a.id)).toEqual([2]);
  });

  it('crear agrega al final con un arreglo nuevo', () => {
    store.cargar();
    const antes = store.almacenes();
    const nuevo = { id: 4, clave: 'ALM-04', nombre: 'Oriente', activo: true };
    service.crear.mockReturnValue(of(nuevo));
    store.crear({ clave: 'ALM-04', nombre: 'Oriente' }).subscribe();
    expect(store.almacenes()).toEqual([...lista, nuevo]);
    expect(store.almacenes()).not.toBe(antes);
  });

  it('actualizar reemplaza solo el almacén cambiado', () => {
    store.cargar();
    const cambiado = { ...lista[0], nombre: 'Centro Histórico' };
    service.actualizar.mockReturnValue(of(cambiado));
    store.actualizar(1, { nombre: 'Centro Histórico' }).subscribe();
    expect(store.almacenes()[0]).toEqual(cambiado);
    expect(store.almacenes()[1]).toBe(lista[1]);
  });
});
