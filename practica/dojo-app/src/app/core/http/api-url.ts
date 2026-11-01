import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';

/**
 * Base de la API como token de inyección (y no `environment.apiUrl` regado por
 * los servicios): en los tests se sobrescribe con un provider y listo.
 */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});
