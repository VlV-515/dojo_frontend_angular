import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '@core/http/api-url';
import { SesionService } from './sesion.service';

/**
 * Agrega `Authorization: Bearer <token>` SOLO a las peticiones hacia nuestra
 * API. Si lo agregas a todas, el token viaja a cualquier dominio de terceros
 * al que la app le pida algo (mapas, CDNs, analítica).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SesionService).token();
  const esNuestraApi = req.url.startsWith(inject(API_URL));
  if (!token || !esNuestraApi || req.headers.has('Authorization')) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
