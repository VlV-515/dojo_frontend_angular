import { FormControl, Validators } from '@angular/forms';
import { claveValida, mensajeError, noSoloEspacios } from './texto.validators';

describe('validadores de texto', () => {
  it.each([
    ['', null],
    ['   ', { soloEspacios: true }],
    [' a ', null],
  ])('noSoloEspacios(%p)', (valor, esperado) => {
    expect(noSoloEspacios(new FormControl(valor))).toEqual(esperado);
  });

  it.each([
    ['', null],
    ['ALM-01', null],
    ['A', { claveInvalida: true }],
    ['ALM 01', { claveInvalida: true }],
    ['ALM_01', { claveInvalida: true }],
  ])('claveValida(%p)', (valor, esperado) => {
    expect(claveValida(new FormControl(valor))).toEqual(esperado);
  });

  it('mensajeError traduce el primer error', () => {
    expect(mensajeError(new FormControl('', Validators.required))).toBe(
      'Este campo es obligatorio',
    );
    expect(mensajeError(new FormControl('ab', Validators.minLength(3)))).toBe(
      'Mínimo 3 caracteres',
    );
    expect(mensajeError(new FormControl('ok'))).toBe('');
  });
});
