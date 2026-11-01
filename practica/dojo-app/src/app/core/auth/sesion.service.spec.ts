import { TestBed } from '@angular/core/testing';
import { SesionService } from './sesion.service';

describe('SesionService', () => {
  beforeEach(() => sessionStorage.clear());

  it('arranca sin sesión', () => {
    const sesion = TestBed.inject(SesionService);
    expect(sesion.autenticado()).toBe(false);
    expect(sesion.tiene('almacenes.ver')).toBe(false);
  });

  it('iniciar guarda token y permisos del perfil', () => {
    const sesion = TestBed.inject(SesionService);
    sesion.iniciar('  abc  ', 'consulta');
    expect(sesion.token()).toBe('abc');
    expect(sesion.tiene('almacenes.ver')).toBe(true);
    expect(sesion.tiene('almacenes.editar')).toBe(false);
  });

  it('recupera la sesión de sessionStorage al recargar', () => {
    TestBed.inject(SesionService).iniciar('abc', 'admin');
    TestBed.resetTestingModule();
    expect(TestBed.inject(SesionService).perfil()?.clave).toBe('admin');
  });

  it('ignora basura en sessionStorage', () => {
    sessionStorage.setItem('dojo.sesion', '{no es json');
    expect(TestBed.inject(SesionService).autenticado()).toBe(false);
  });

  it('cerrar limpia todo', () => {
    const sesion = TestBed.inject(SesionService);
    sesion.iniciar('abc', 'admin');
    sesion.cerrar();
    expect(sesion.autenticado()).toBe(false);
    expect(sessionStorage.getItem('dojo.sesion')).toBeNull();
  });

  it('perfil desconocido truena', () => {
    expect(() => TestBed.inject(SesionService).iniciar('abc', 'root')).toThrow(
      'Perfil desconocido',
    );
  });
});
