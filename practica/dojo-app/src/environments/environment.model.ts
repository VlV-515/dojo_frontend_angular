/** Forma de todos los environments: si agregas una llave, agrégala en los tres. */
export interface Environment {
  /** true solo en el build de producción. */
  production: boolean;
  /** Nombre visible del entorno (se muestra en la barra superior). */
  nombre: string;
  /**
   * Base de la API. Es relativa (`/api`) a propósito: en desarrollo la resuelve
   * `proxy.conf.json` y en producción un reverse proxy. Así no hay CORS ni
   * dominios dentro del bundle.
   */
  apiUrl: string;
  /** true: un interceptor responde desde memoria y no se necesita el backend. */
  usarMock: boolean;
}
