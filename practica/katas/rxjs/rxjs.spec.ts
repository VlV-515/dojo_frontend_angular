import { Observable, defer, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { buscador, cachear, conEstado, conReintentos, filtrar, guardarEnOrden, soloActivos } from './ejercicios';
import { Almacen } from './tipos';

// Marble testing: cada carácter es 1 ms de tiempo virtual.
// '-' = pasa el tiempo, 'a' = emite a, '|' = completa, '#' = error, '^' = suscripción.
// Dentro de `run`, debounceTime y compañía usan tiempo virtual: el test es instantáneo.
const nuevoScheduler = () => new TestScheduler((actual, esperado) => expect(actual).toEqual(esperado));

const centro: Almacen = { id: 1, clave: 'ALM-01', nombre: 'Centro', activo: true };
const norte: Almacen = { id: 2, clave: 'ALM-02', nombre: 'Norte', activo: false };
const ajusco: Almacen = { id: 3, clave: 'ALM-03', nombre: 'Ajusco', activo: true };

describe('Kata 1 · soloActivos', () => {
  it('filtra activos y ordena por nombre', () => {
    nuevoScheduler().run(({ cold, expectObservable }) => {
      const lista$ = cold('a|', { a: [centro, norte, ajusco] });
      expectObservable(soloActivos(lista$)).toBe('a|', { a: [ajusco, centro] });
    });
  });

  it('no muta la lista original', (done) => {
    const original = [centro, norte, ajusco];
    soloActivos(of(original)).subscribe(() => {
      expect(original).toEqual([centro, norte, ajusco]);
      done();
    });
  });
});

describe('Kata 2 · buscador', () => {
  it('espera el debounce, ignora repetidos y textos cortos', () => {
    nuevoScheduler().run(({ cold, hot, expectObservable }) => {
      const texto$ = hot('a 10ms b 10ms c 10ms d 10ms e', {
        a: 'c',
        b: 'ce',
        c: ' ce ',
        d: 'cen',
        e: 'x',
      });
      const buscar = (t: string) => cold('(r|)', { r: [t.toUpperCase()] });
      // a('c') -> [] sin buscar · b('ce') -> busca · c(' ce ') = repetido · d -> busca · e -> []
      expectObservable(buscador(texto$, buscar, 5)).toBe('5ms a 10ms b 21ms c 10ms d', {
        a: [],
        b: ['CE'],
        c: ['CEN'],
        d: [],
      });
    });
  });

  it('cancela la búsqueda anterior si llega texto nuevo (switchMap)', () => {
    nuevoScheduler().run(({ cold, hot, expectObservable }) => {
      const texto$ = hot('a 6ms b', { a: 'centro', b: 'norte' });
      const buscar = (t: string) => cold('8ms (r|)', { r: [t] });
      // 'centro' busca en el ms 3 y respondería en el 11; 'norte' llega en el 7 y busca en el 10: cancela.
      expectObservable(buscador(texto$, buscar, 3)).toBe('18ms r', { r: ['norte'] });
    });
  });
});

describe('Kata 3 · conEstado', () => {
  it('cargando -> listo', () => {
    nuevoScheduler().run(({ cold, expectObservable }) => {
      expectObservable(conEstado(cold('--a|', { a: 7 }))).toBe('c-a|', {
        c: { estado: 'cargando' },
        a: { estado: 'listo', datos: 7 },
      });
    });
  });

  it('cargando -> error, y completa sin propagar el error', () => {
    nuevoScheduler().run(({ cold, expectObservable }) => {
      const falla$ = cold('--#', undefined, new Error('Sin conexión'));
      expectObservable(conEstado(falla$)).toBe('c-(e|)', {
        c: { estado: 'cargando' },
        e: { estado: 'error', mensaje: 'Sin conexión' },
      });
    });
  });
});

describe('Kata 4 · filtrar', () => {
  it('reacciona a cambios de lista y de texto', () => {
    nuevoScheduler().run(({ hot, expectObservable }) => {
      const lista$ = hot('a-----b', { a: [centro, norte], b: [centro, norte, ajusco] });
      const texto$ = hot('x--y---', { x: '', y: 'alm-0' });
      expectObservable(filtrar(lista$, texto$)).toBe('a--b--c', {
        a: [centro, norte],
        b: [centro, norte],
        c: [centro, norte, ajusco],
      });
    });
  });

  it('busca en clave y nombre sin importar mayúsculas', () => {
    nuevoScheduler().run(({ cold, expectObservable }) => {
      const lista$ = cold('a', { a: [centro, norte, ajusco] });
      const texto$ = cold('t', { t: 'NOR' });
      expectObservable(filtrar(lista$, texto$)).toBe('r', { r: [norte] });
    });
  });
});

describe('Kata 5 · guardarEnOrden', () => {
  it('guarda uno después de otro, en orden', () => {
    nuevoScheduler().run(({ cold, expectObservable }) => {
      const ids$ = cold('(abc|)', { a: 1, b: 2, c: 3 });
      const guardar = (id: number) => cold('---(r|)', { r: `ok-${id}` });
      expectObservable(guardarEnOrden(ids$, guardar)).toBe('---a--b--(c|)', {
        a: 'ok-1',
        b: 'ok-2',
        c: 'ok-3',
      });
    });
  });
});

describe('Kata 6 · conReintentos', () => {
  it('reintenta y termina bien', (done) => {
    let intentos = 0;
    const fuente$ = defer(() => (++intentos < 3 ? throwError(() => new Error('falla')) : of('ok')));
    conReintentos(fuente$, 2).subscribe({
      next: (v) => {
        expect(v).toBe('ok');
        expect(intentos).toBe(3);
        done();
      },
      error: done,
    });
  });

  it('deja pasar el error si se acaban los reintentos', (done) => {
    let intentos = 0;
    const fuente$ = defer(() => {
      intentos++;
      return throwError(() => new Error('siempre falla'));
    });
    conReintentos(fuente$, 2).subscribe({
      next: () => done(new Error('no debía emitir')),
      error: (err: Error) => {
        expect(err.message).toBe('siempre falla');
        expect(intentos).toBe(3);
        done();
      },
    });
  });
});

describe('Kata 7 · cachear', () => {
  it('ejecuta la fuente una sola vez y repite el último valor', () => {
    let ejecuciones = 0;
    const fuente$ = new Observable<number>((sub) => {
      ejecuciones++;
      sub.next(42);
      sub.complete();
    });
    const cacheado$ = cachear(fuente$);
    const recibidos: number[] = [];
    cacheado$.subscribe((v) => recibidos.push(v));
    cacheado$.subscribe((v) => recibidos.push(v));
    cacheado$.subscribe((v) => recibidos.push(v));
    expect(ejecuciones).toBe(1);
    expect(recibidos).toEqual([42, 42, 42]);
  });
});
