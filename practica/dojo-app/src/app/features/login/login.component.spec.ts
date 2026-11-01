import { destinoSeguro } from './login.component';

describe('destinoSeguro', () => {
  it.each([
    [undefined, '/inicio'],
    ['', '/inicio'],
    ['/almacenes/nuevo', '/almacenes/nuevo'],
    ['https://sitio-falso.example', '/inicio'],
    ['//sitio-falso.example', '/inicio'],
    ['/\\sitio-falso.example', '/inicio'],
    ['javascript:alert(1)', '/inicio'],
  ])('volver=%p -> %p', (volver, esperado) => {
    expect(destinoSeguro(volver)).toBe(esperado);
  });
});
