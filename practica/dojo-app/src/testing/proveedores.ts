import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { SesionService } from '@core/auth/sesion.service';
import { API_URL } from '@core/http/api-url';
import { errorInterceptor } from '@core/http/error.interceptor';
import { MOCK_LATENCIA, mockInterceptor } from '@core/mock/mock.interceptor';
import { TOKEN_MOCK } from '@core/mock/mock-db';

/** Base de la API en todos los tests. */
export const API = '/api';

/**
 * Providers para probar contra el mock (sin backend y sin latencia):
 * mismos interceptores que la app real, en el mismo orden.
 */
export function proveerApiMock(): (Provider | EnvironmentProviders)[] {
  return [
    provideRouter([]),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, mockInterceptor])),
    { provide: API_URL, useValue: API },
    { provide: MOCK_LATENCIA, useValue: 0 },
  ];
}

/** Inicia sesión con el token del mock y el perfil indicado. Llamar después de configurar TestBed. */
export function iniciarSesion(perfil: 'admin' | 'consulta' = 'admin'): void {
  TestBed.inject(SesionService).iniciar(TOKEN_MOCK, perfil);
}

/**
 * Deja una sesión guardada ANTES de que exista el TestBed (útil con
 * `render()` de Testing Library, que configura el TestBed por su cuenta).
 */
export function sesionGuardada(perfil: 'admin' | 'consulta' = 'admin'): void {
  sessionStorage.setItem('dojo.sesion', JSON.stringify({ token: TOKEN_MOCK, perfil }));
}
