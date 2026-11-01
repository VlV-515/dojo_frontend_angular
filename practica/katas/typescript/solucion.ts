// Solución de referencia. Solo se usa con `npm run test:solucion`.
// Intenta primero: leerla antes te quita justo lo que viniste a aprender.
import { Almacen, EstadoPeticion, Pagina, Respuesta } from './tipos';

export function normalizarClave(clave: string): string {
  return clave.trim().toUpperCase().replace(/\s+/g, '-');
}

export function agruparPor<T, K extends PropertyKey>(items: T[], llave: (item: T) => K): Record<K, T[]> {
  const grupos = {} as Record<K, T[]>;
  for (const item of items) {
    const k = llave(item);
    (grupos[k] ??= []).push(item);
  }
  return grupos;
}

export function paginar<T>(items: T[], pagina: number, tamano: number): Pagina<T> {
  if (pagina < 1 || tamano < 1) {
    throw new RangeError('pagina y tamano deben ser >= 1');
  }
  const inicio = (pagina - 1) * tamano;
  return {
    items: items.slice(inicio, inicio + tamano),
    pagina,
    total: items.length,
    paginas: Math.ceil(items.length / tamano),
  };
}

export function actualizar<T extends object>(original: T, cambios: Partial<T>): T {
  const definidos = Object.fromEntries(Object.entries(cambios).filter(([, v]) => v !== undefined));
  return { ...original, ...definidos };
}

export function describirEstado(estado: EstadoPeticion<unknown[]>): string {
  switch (estado.tipo) {
    case 'inactivo':
      return 'Sin consultar';
    case 'cargando':
      return 'Cargando…';
    case 'exito':
      return `${estado.datos.length} ${estado.datos.length === 1 ? 'registro' : 'registros'}`;
    case 'error':
      return `Error: ${estado.mensaje}`;
    default: {
      const imposible: never = estado;
      return imposible;
    }
  }
}

export function esAlmacen(valor: unknown): valor is Almacen {
  if (typeof valor !== 'object' || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return (
    typeof v['id'] === 'number' &&
    typeof v['clave'] === 'string' &&
    typeof v['nombre'] === 'string' &&
    typeof v['activo'] === 'boolean'
  );
}

export function leerAlmacenes(json: unknown): Respuesta<Almacen[]> {
  if (typeof json !== 'object' || json === null) throw new Error('Respuesta inválida');
  const r = json as Record<string, unknown>;
  const datos = r['datos'];
  if (
    typeof r['codigo'] !== 'number' ||
    typeof r['mensaje'] !== 'string' ||
    !Array.isArray(datos) ||
    !datos.every(esAlmacen)
  ) {
    throw new Error('Respuesta inválida');
  }
  return { codigo: r['codigo'], mensaje: r['mensaje'], datos };
}

export async function conReintentos<T>(fn: () => Promise<T>, intentos: number): Promise<T> {
  let ultimo: unknown;
  for (let i = 0; i < intentos; i++) {
    try {
      return await fn();
    } catch (err) {
      ultimo = err;
    }
  }
  throw ultimo;
}
