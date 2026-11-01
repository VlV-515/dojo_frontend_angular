import { Route } from '@angular/router';
import { routes } from './app.routes';

/** Recorre el árbol de rutas raíz (las hijas lazy se prueban en su feature). */
function todas(lista: Route[]): Route[] {
  return lista.flatMap((r) => [r, ...todas(r.children ?? [])]);
}

describe('app.routes', () => {
  it('ninguna ruta carga su componente de forma eager', () => {
    const eager = todas(routes)
      .filter((r) => r.component)
      .map((r) => r.path);
    expect(eager).toEqual([]);
  });

  it('existe una ruta comodín al final', () => {
    expect(routes.at(-1)?.path).toBe('**');
  });

  it('/salud y /login son públicas', () => {
    for (const path of ['salud', 'login']) {
      const ruta = routes.find((r) => r.path === path);
      expect(ruta?.canMatch ?? []).toHaveLength(0);
    }
  });
});
