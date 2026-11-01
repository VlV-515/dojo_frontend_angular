import { Environment } from './environment.model';

// Producción (`ng build`). Todo lo que esté aquí termina en el bundle y lo puede
// leer cualquiera con las DevTools: NUNCA pongas secretos en un environment.
export const environment: Environment = {
  production: true,
  nombre: 'producción',
  apiUrl: '/api',
  usarMock: false,
};
