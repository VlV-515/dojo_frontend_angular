import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * `Validators.required` acepta "   " como válido. Este no.
 * Error: `{ soloEspacios: true }`.
 */
export const noSoloEspacios: ValidatorFn = (
  control: AbstractControl<string | null>,
): ValidationErrors | null => {
  const valor = control.value;
  if (typeof valor !== 'string' || valor.length === 0) return null; // eso lo decide `required`
  return valor.trim().length === 0 ? { soloEspacios: true } : null;
};

/**
 * Clave de catálogo: letras, números y guiones, de 2 a 20 caracteres.
 * Error: `{ claveInvalida: true }`.
 */
export const claveValida: ValidatorFn = (
  control: AbstractControl<string | null>,
): ValidationErrors | null => {
  const valor = (control.value ?? '').trim();
  if (valor === '') return null;
  return /^[A-Za-z0-9-]{2,20}$/.test(valor) ? null : { claveInvalida: true };
};

/** Primer mensaje de error de un control, para mostrar en `<mat-error>`. */
export function mensajeError(control: AbstractControl): string {
  const e = control.errors;
  if (!e) return '';
  if (e['required'] || e['soloEspacios']) return 'Este campo es obligatorio';
  if (e['minlength']) return `Mínimo ${e['minlength'].requiredLength} caracteres`;
  if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres`;
  if (e['claveInvalida']) return 'Solo letras, números y guiones (2 a 20)';
  if (e['servidor']) return String(e['servidor']);
  return 'Valor inválido';
}
