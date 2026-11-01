import { TestBed } from '@angular/core/testing';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MockDb } from '@core/mock/mock-db';
import { NotificacionService } from '@core/ui/notificacion.service';
import { PaginadorEs } from '@core/ui/paginador-es';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { proveerApiMock, sesionGuardada } from '../../../../../testing/proveedores';
import { AlmacenesListaComponent } from './almacenes-lista.component';

async function pintar(perfil: 'admin' | 'consulta' = 'admin') {
  sessionStorage.clear();
  sesionGuardada(perfil);
  const vista = await render(AlmacenesListaComponent, {
    providers: [
      ...proveerApiMock(),
      { provide: MatPaginatorIntl, useClass: PaginadorEs },
      { provide: NotificacionService, useValue: { error: jest.fn(), exito: jest.fn() } },
    ],
  });
  TestBed.inject(MockDb).reiniciar();
  return vista;
}

/** Filas de datos de la tabla (sin el encabezado). */
const filas = () =>
  within(screen.getByRole('table', { name: 'Almacenes' }))
    .getAllByRole('row')
    .slice(1);

describe('AlmacenesListaComponent', () => {
  it('pinta la primera página y el rango en español', async () => {
    await pintar();
    expect(filas()).toHaveLength(5);
    expect(screen.getByText('1 – 5 de 12')).toBeInTheDocument();
    expect(screen.getByText('ALM-01')).toBeInTheDocument();
  });

  it('filtra por texto y regresa a la primera página', async () => {
    await pintar();
    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(screen.getByText('6 – 10 de 12')).toBeInTheDocument();

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar por clave o nombre' }),
      'bodega',
    );
    expect(filas()).toHaveLength(2);
    expect(screen.getByText('1 – 2 de 2')).toBeInTheDocument();
  });

  it('sin coincidencias muestra el mensaje vacío', async () => {
    await pintar();
    await userEvent.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.getByText('No hay almacenes que coincidan con los filtros')).toBeInTheDocument();
  });

  it('el perfil de consulta no ve acciones de edición', async () => {
    await pintar('consulta');
    expect(screen.queryByRole('link', { name: 'Nuevo almacén' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Editar / })).not.toBeInTheDocument();
  });

  it('el admin ve Nuevo y Editar por fila', async () => {
    await pintar('admin');
    expect(screen.getByRole('link', { name: 'Nuevo almacén' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar ALM-01' })).toBeInTheDocument();
  });
});
