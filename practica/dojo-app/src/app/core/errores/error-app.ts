import { HttpErrorResponse } from '@angular/common/http';

/**
 * Error normalizado que el resto de la app consume. Los componentes nunca leen
 * `HttpErrorResponse.error` directo: no saben si el backend respondió JSON,
 * texto plano o nada.
 */
export class ErrorApp extends Error {
  constructor(
    /** Código HTTP (0 = no hubo respuesta: red caída, CORS, backend apagado). */
    readonly status: number,
    /** Mensaje apto para mostrar al usuario. */
    override readonly message: string,
    /** Detalle técnico (para consola o soporte, no para la UI). */
    readonly detalle?: string,
    /** true si el interceptor ya lo mostró: el componente no debe repetirlo. */
    public notificado = false,
  ) {
    super(message);
    this.name = 'ErrorApp';
  }
}

const MENSAJES_POR_ESTADO: Record<number, string> = {
  0: 'No hay conexión con el servidor',
  401: 'Tu sesión no es válida. Vuelve a entrar.',
  403: 'No tienes permiso para esta acción',
  404: 'No se encontró lo que buscas',
  500: 'Ocurrió un error en el servidor',
  503: 'El servicio no está disponible',
};

/** Convierte cualquier HttpErrorResponse en un ErrorApp con mensaje legible. */
export function normalizarError(err: HttpErrorResponse): ErrorApp {
  const cuerpo: unknown = err.error;
  if (typeof cuerpo === 'object' && cuerpo !== null && 'mensaje' in cuerpo) {
    const { mensaje, detalle } = cuerpo as { mensaje: unknown; detalle?: unknown };
    if (typeof mensaje === 'string' && mensaje.trim() !== '') {
      return new ErrorApp(err.status, mensaje, typeof detalle === 'string' ? detalle : undefined);
    }
  }
  if (typeof cuerpo === 'string' && cuerpo.trim() !== '' && cuerpo.length < 200) {
    return new ErrorApp(err.status, cuerpo);
  }
  const mensaje = MENSAJES_POR_ESTADO[err.status] ?? `Error inesperado (${err.status})`;
  return new ErrorApp(err.status, mensaje, err.message);
}
