import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeEsMx from '@angular/common/locales/es-MX';
import {
  ApplicationConfig,
  ErrorHandler,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { GlobalErrorHandler } from '@core/errores/global-error-handler';
import { cargaInterceptor } from '@core/http/carga.interceptor';
import { errorInterceptor } from '@core/http/error.interceptor';
import { mockInterceptor } from '@core/mock/mock.interceptor';
import { PaginadorEs } from '@core/ui/paginador-es';
import { environment } from '@env/environment';
import { routes } from './app.routes';

// Fechas, números y moneda en formato mexicano (`| date`, `| currency`, `| number`).
registerLocaleData(localeEsMx);

/**
 * Configuración raíz (reemplaza al antiguo AppModule). Aquí se registran los
 * providers globales: router, HTTP, interceptores, locale y manejo de errores.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // zone.js detecta cambios tras cada evento/timer/petición. Las apps nuevas de
    // Angular 21 son zoneless por default; ver módulo 04.
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Hash (`/#/almacenes`): funciona en cualquier hosting estático sin reglas de
    // reescritura en el servidor. Ver módulo 06.
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      // El orden importa: la petición pasa de arriba hacia abajo y la respuesta
      // de abajo hacia arriba. El mock va al final para que los demás no noten
      // la diferencia entre backend real y falso.
      withInterceptors([
        cargaInterceptor,
        authInterceptor,
        errorInterceptor,
        ...(environment.usarMock ? [mockInterceptor] : []),
      ]),
    ),
    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: MatPaginatorIntl, useClass: PaginadorEs },
  ],
};
