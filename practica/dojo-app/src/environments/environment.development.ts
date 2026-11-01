import { Environment } from './environment.model';

// Desarrollo contra el dojo-api real (`npm start`): `/api` -> proxy.conf.json -> localhost:1099.
export const environment: Environment = {
  production: false,
  nombre: 'desarrollo',
  apiUrl: '/api',
  usarMock: false,
};
