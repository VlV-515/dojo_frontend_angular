import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockDb } from '@core/mock/mock-db';
import { NotificacionService } from '@core/ui/notificacion.service';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { proveerApiMock, sesionGuardada } from '../../../../../testing/proveedores';
import { AlmacenFormComponent } from './almacen-form.component';

const notificacion = { error: jest.fn(), exito: jest.fn() };

async function pintar(id?: string) {
  sessionStorage.clear();
  sesionGuardada('admin');
  const vista = await render(AlmacenFormComponent, {
    inputs: id ? { id } : {},
    providers: [...proveerApiMock(), { provide: NotificacionService, useValue: notificacion }],
  });
  const navegar = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  return { vista, navegar };
}

describe('AlmacenFormComponent', () => {
  beforeEach(() => notificacion.exito.mockClear());
  afterEach(() => TestBed.inject(MockDb).reiniciar());

  it('no envía si es inválido y muestra los errores', async () => {
    const { navegar } = await pintar();
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getAllByText('Este campo es obligatorio')).toHaveLength(2);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('valida el formato de la clave', async () => {
    await pintar();
    await userEvent.type(screen.getByRole('textbox', { name: /Clave/ }), 'ALM 99');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByText('Solo letras, números y guiones (2 a 20)')).toBeInTheDocument();
  });

  it('registra y regresa a la lista', async () => {
    const { navegar } = await pintar();
    await userEvent.type(screen.getByRole('textbox', { name: /Clave/ }), 'alm-99');
    await userEvent.type(screen.getByRole('textbox', { name: /Nombre/ }), 'Almacén Nuevo');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(notificacion.exito).toHaveBeenCalledWith('Almacén registrado');
    expect(navegar).toHaveBeenCalledWith(['/almacenes']);
    expect(TestBed.inject(MockDb).almacenes.some((a) => a.clave === 'ALM-99')).toBe(true);
  });

  it('una clave duplicada (409) se muestra en el campo', async () => {
    const { navegar } = await pintar();
    await userEvent.type(screen.getByRole('textbox', { name: /Clave/ }), 'ALM-01');
    await userEvent.type(screen.getByRole('textbox', { name: /Nombre/ }), 'Repetido');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Ya existe un almacén con la clave ALM-01')).toBeInTheDocument();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('en edición carga los datos y bloquea la clave', async () => {
    await pintar('1');
    expect(screen.getByRole('heading', { name: 'Editar almacén' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Clave/ })).toHaveValue('ALM-01');
    expect(screen.getByRole('textbox', { name: /Clave/ })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Nombre/ })).toHaveValue('Almacén Centro');
  });

  it('avisa de cambios sin guardar', async () => {
    const { vista } = await pintar();
    expect(vista.fixture.componentInstance.tieneCambiosSinGuardar()).toBe(false);
    await userEvent.type(screen.getByRole('textbox', { name: /Nombre/ }), 'x');
    expect(vista.fixture.componentInstance.tieneCambiosSinGuardar()).toBe(true);
  });
});
