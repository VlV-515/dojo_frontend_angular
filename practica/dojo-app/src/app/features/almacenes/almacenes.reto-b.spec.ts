/**
 * RETO B · Desactivar almacenes (módulo 09)
 *
 *   npm run reto:b
 *
 * Es la contraparte del Reto B del dojo de backend: `PUT /almacenes/:id/desactivar`
 * (200 al desactivar, 404 si no existe, 409 si ya estaba inactivo).
 *
 * Contrato que este spec espera (los nombres importan, el cómo es tuyo):
 * - `AlmacenesService.desactivar(id: number): Observable<void>`.
 * - `AlmacenesStore.desactivar(id: number): Observable<void>`: al terminar bien, ese
 *   almacén queda con `activo: false` en la lista, SIN mutar el arreglo ni el objeto.
 * - El mock responde igual que el backend (para trabajar sin él).
 * - En la tabla, cada almacén ACTIVO tiene un botón con `aria-label="Desactivar <clave>"`,
 *   visible solo con el permiso `almacenes.editar`.
 * - El botón pide confirmación con `ConfirmarDialogComponent`; el botón que confirma
 *   dice "Desactivar". Al confirmar: toast de éxito y la fila pasa a "Inactivo".
 *
 * No cambies este archivo: es la especificación.
 */
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/http/api-url';
import { MockDb } from '@core/mock/mock-db';
import { NotificacionService } from '@core/ui/notificacion.service';
import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { firstValueFrom } from 'rxjs';
import { proveerApiMock, sesionGuardada } from '../../../testing/proveedores';
import { AlmacenesListaComponent } from './pages/almacenes-lista/almacenes-lista.component';
import { AlmacenesService } from './services/almacenes.service';
import { AlmacenesStore } from './state/almacenes.store';

const notificacion = { error: jest.fn(), exito: jest.fn() };

describe('Reto B · servicio', () => {
  it('desactivar hace PUT /almacenes/:id/desactivar', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    });
    let termino = false;
    TestBed.inject(AlmacenesService)
      .desactivar(7)
      .subscribe(() => (termino = true));
    const req = TestBed.inject(HttpTestingController).expectOne('/api/almacenes/7/desactivar');
    expect(req.request.method).toBe('PUT');
    req.flush({ codigo: 200, mensaje: 'Almacén desactivado', datos: null });
    expect(termino).toBe(true);
  });
});

describe('Reto B · store y mock', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sesionGuardada('admin');
    TestBed.configureTestingModule({
      providers: [...proveerApiMock(), { provide: NotificacionService, useValue: notificacion }],
    });
    TestBed.inject(MockDb).reiniciar();
  });

  it('desactiva sin mutar la lista anterior', async () => {
    const store = TestBed.inject(AlmacenesStore);
    store.cargar();
    const antes = store.almacenes();
    const centroAntes = antes.find((a) => a.id === 1);

    await firstValueFrom(store.desactivar(1));

    expect(store.almacenes().find((a) => a.id === 1)?.activo).toBe(false);
    expect(store.almacenes()).not.toBe(antes);
    expect(centroAntes?.activo).toBe(true);
    expect(store.almacenes().find((a) => a.id === 2)).toBe(antes.find((a) => a.id === 2));
  });

  it('el mock responde 409 si ya estaba inactivo y 404 si no existe', async () => {
    const store = TestBed.inject(AlmacenesStore);
    await expect(firstValueFrom(store.desactivar(3))).rejects.toMatchObject({ status: 409 });
    await expect(firstValueFrom(store.desactivar(999))).rejects.toMatchObject({ status: 404 });
  });
});

describe('Reto B · pantalla', () => {
  async function pintar(perfil: 'admin' | 'consulta') {
    sessionStorage.clear();
    sesionGuardada(perfil);
    notificacion.exito.mockClear();
    await render(AlmacenesListaComponent, {
      providers: [...proveerApiMock(), { provide: NotificacionService, useValue: notificacion }],
    });
    TestBed.inject(MockDb).reiniciar();
  }

  const filaDe = (clave: string) => screen.getByText(clave).closest('tr') as HTMLElement;

  it('solo los almacenes activos tienen botón Desactivar', async () => {
    await pintar('admin');
    expect(screen.getByRole('button', { name: 'Desactivar ALM-01' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desactivar ALM-03' })).not.toBeInTheDocument();
  });

  it('sin almacenes.editar no hay botón', async () => {
    await pintar('consulta');
    expect(screen.queryByRole('button', { name: /^Desactivar / })).not.toBeInTheDocument();
  });

  it('confirmar desactiva, avisa y actualiza la fila', async () => {
    await pintar('admin');
    await userEvent.click(screen.getByRole('button', { name: 'Desactivar ALM-01' }));
    const dialogo = await screen.findByRole('dialog');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Desactivar' }));

    // mat-table vuelve a pintar la fila cuando cambia el objeto: se busca de nuevo en cada intento.
    await waitFor(() => expect(within(filaDe('ALM-01')).getByText('Inactivo')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Desactivar ALM-01' })).not.toBeInTheDocument();
    expect(notificacion.exito).toHaveBeenCalledTimes(1);
  });

  it('cancelar no cambia nada', async () => {
    await pintar('admin');
    await userEvent.click(screen.getByRole('button', { name: 'Desactivar ALM-01' }));
    const dialogo = await screen.findByRole('dialog');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    expect(within(filaDe('ALM-01')).getByText('Activo')).toBeInTheDocument();
    expect(TestBed.inject(MockDb).almacenes.find((a) => a.id === 1)?.activo).toBe(true);
  });
});
