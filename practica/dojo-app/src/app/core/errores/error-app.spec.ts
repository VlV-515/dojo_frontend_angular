import { HttpErrorResponse } from '@angular/common/http';
import { normalizarError } from './error-app';

describe('normalizarError', () => {
  it('usa el mensaje y el detalle del cuerpo del dojo-api', () => {
    const err = new HttpErrorResponse({
      status: 409,
      error: { codigo: 409, mensaje: 'Clave duplicada', detalle: 'dup' },
    });
    const app = normalizarError(err);
    expect(app.status).toBe(409);
    expect(app.message).toBe('Clave duplicada');
    expect(app.detalle).toBe('dup');
    expect(app.notificado).toBe(false);
  });

  it('acepta texto plano corto como mensaje', () => {
    expect(
      normalizarError(new HttpErrorResponse({ status: 400, error: 'Datos inválidos' })).message,
    ).toBe('Datos inválidos');
  });

  it('status 0 significa sin conexión', () => {
    expect(
      normalizarError(new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }))
        .message,
    ).toBe('No hay conexión con el servidor');
  });

  it('si no hay nada útil usa un mensaje por status', () => {
    expect(normalizarError(new HttpErrorResponse({ status: 418 })).message).toBe(
      'Error inesperado (418)',
    );
  });
});
