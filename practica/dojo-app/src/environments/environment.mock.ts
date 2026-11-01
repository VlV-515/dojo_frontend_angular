import { Environment } from './environment.model';

// Sin backend (`npm run start:mock`): el mockInterceptor responde desde memoria.
export const environment: Environment = {
  production: false,
  nombre: 'mock',
  apiUrl: '/api',
  usarMock: true,
};
