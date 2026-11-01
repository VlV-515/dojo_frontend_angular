import {
  actualizar,
  agruparPor,
  conReintentos,
  describirEstado,
  esAlmacen,
  leerAlmacenes,
  normalizarClave,
  paginar,
} from './ejercicios';
import { Almacen, EstadoPeticion } from './tipos';

const almacenes: Almacen[] = [
  { id: 1, clave: 'ALM-01', nombre: 'Centro', activo: true },
  { id: 2, clave: 'ALM-02', nombre: 'Norte', activo: false },
  { id: 3, clave: 'ALM-03', nombre: 'Sur', activo: true },
];

describe('Kata 1 · normalizarClave', () => {
  it.each([
    ['  alm  centro 01 ', 'ALM-CENTRO-01'],
    ['alm-02', 'ALM-02'],
    ['   ', ''],
    ['', ''],
  ])('normalizarClave(%p) -> %p', (entrada, esperado) => {
    expect(normalizarClave(entrada)).toBe(esperado);
  });
});

describe('Kata 2 · agruparPor', () => {
  it('agrupa por la llave y conserva el orden', () => {
    const grupos = agruparPor(almacenes, (a) => (a.activo ? 'activos' : 'inactivos'));
    expect(grupos).toEqual({
      activos: [almacenes[0], almacenes[2]],
      inactivos: [almacenes[1]],
    });
  });

  it('lista vacía -> objeto vacío', () => {
    expect(agruparPor([], (x: number) => x)).toEqual({});
  });
});

describe('Kata 2 · paginar', () => {
  const numeros = [1, 2, 3, 4, 5];

  it('primera página', () => {
    expect(paginar(numeros, 1, 2)).toEqual({ items: [1, 2], pagina: 1, total: 5, paginas: 3 });
  });

  it('última página incompleta', () => {
    expect(paginar(numeros, 3, 2)).toEqual({ items: [5], pagina: 3, total: 5, paginas: 3 });
  });

  it('página fuera de rango -> items vacíos', () => {
    expect(paginar(numeros, 9, 2)).toEqual({ items: [], pagina: 9, total: 5, paginas: 3 });
  });

  it('sin items -> 0 páginas', () => {
    expect(paginar([], 1, 10)).toEqual({ items: [], pagina: 1, total: 0, paginas: 0 });
  });

  it('pagina o tamano < 1 -> RangeError', () => {
    expect(() => paginar(numeros, 0, 2)).toThrow(RangeError);
    expect(() => paginar(numeros, 1, 0)).toThrow(RangeError);
  });
});

describe('Kata 3 · actualizar', () => {
  it('devuelve un objeto nuevo con los cambios', () => {
    const original = { ...almacenes[0] };
    const nuevo = actualizar(original, { nombre: 'Centro Histórico' });
    expect(nuevo).toEqual({ ...almacenes[0], nombre: 'Centro Histórico' });
    expect(nuevo).not.toBe(original);
  });

  it('no muta el original', () => {
    const original = { ...almacenes[0] };
    actualizar(original, { activo: false });
    expect(original.activo).toBe(true);
  });

  it('ignora llaves con undefined', () => {
    const nuevo = actualizar(almacenes[0], { nombre: undefined, activo: false });
    expect(nuevo.nombre).toBe('Centro');
    expect(nuevo.activo).toBe(false);
  });
});

describe('Kata 4 · describirEstado', () => {
  const casos: [EstadoPeticion<unknown[]>, string][] = [
    [{ tipo: 'inactivo' }, 'Sin consultar'],
    [{ tipo: 'cargando' }, 'Cargando…'],
    [{ tipo: 'exito', datos: [1, 2] }, '2 registros'],
    [{ tipo: 'exito', datos: [1] }, '1 registro'],
    [{ tipo: 'exito', datos: [] }, '0 registros'],
    [{ tipo: 'error', mensaje: 'Sin conexión' }, 'Error: Sin conexión'],
  ];
  it.each(casos)('%j -> %p', (estado, esperado) => {
    expect(describirEstado(estado)).toBe(esperado);
  });
});

describe('Kata 5 · esAlmacen y leerAlmacenes', () => {
  it.each([
    [almacenes[0], true],
    [{ id: '1', clave: 'A', nombre: 'B', activo: true }, false],
    [{ id: 1, clave: 'A', nombre: 'B' }, false],
    [null, false],
    ['almacén', false],
    [[], false],
  ])('esAlmacen(%j) -> %p', (valor, esperado) => {
    expect(esAlmacen(valor)).toBe(esperado);
  });

  it('acepta una respuesta válida', () => {
    const json: unknown = JSON.parse(JSON.stringify({ codigo: 200, mensaje: 'ok', datos: almacenes }));
    expect(leerAlmacenes(json).datos).toHaveLength(3);
  });

  it.each([
    [null],
    [{ codigo: 200, mensaje: 'ok' }],
    [{ codigo: 200, mensaje: 'ok', datos: [{ id: 1 }] }],
    [{ codigo: '200', mensaje: 'ok', datos: [] }],
  ])('rechaza %j', (json) => {
    expect(() => leerAlmacenes(json)).toThrow('Respuesta inválida');
  });
});

describe('Kata 6 · conReintentos', () => {
  it('reintenta hasta que funciona', async () => {
    let llamadas = 0;
    const fn = async () => {
      llamadas++;
      if (llamadas < 3) throw new Error(`falla ${llamadas}`);
      return 'ok';
    };
    await expect(conReintentos(fn, 3)).resolves.toBe('ok');
    expect(llamadas).toBe(3);
  });

  it('rechaza con el último error si todos fallan', async () => {
    let llamadas = 0;
    const fn = async (): Promise<string> => {
      llamadas++;
      throw new Error(`falla ${llamadas}`);
    };
    await expect(conReintentos(fn, 2)).rejects.toThrow('falla 2');
    expect(llamadas).toBe(2);
  });
});
