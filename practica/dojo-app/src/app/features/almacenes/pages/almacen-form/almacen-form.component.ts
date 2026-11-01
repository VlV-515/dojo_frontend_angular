import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ConCambiosSinGuardar } from '@core/guards/cambios-sin-guardar.guard';
import { ErrorApp } from '@core/errores/error-app';
import { NotificacionService } from '@core/ui/notificacion.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { claveValida, mensajeError, noSoloEspacios } from '@shared/validators/texto.validators';
import { Almacen } from '../../models/almacen.model';
import { AlmacenesService } from '../../services/almacenes.service';
import { AlmacenesStore } from '../../state/almacenes.store';

/**
 * Alta (`/almacenes/nuevo`) y edición (`/almacenes/:id/editar`) en un solo
 * componente. `id` llega como input gracias a `withComponentInputBinding()`.
 *
 * Formulario reactivo TIPADO: `form.getRawValue()` es `{ clave: string; nombre: string }`,
 * no `any`. En código legado vas a ver `UntypedFormGroup`: mismo API, sin tipos.
 */
@Component({
  selector: 'app-almacen-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    PageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './almacen-form.component.html',
  styleUrl: './almacen-form.component.scss',
})
export class AlmacenFormComponent implements OnInit, ConCambiosSinGuardar {
  /** Parámetro `:id` de la ruta. Sin id = alta. */
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(AlmacenesService);
  private readonly store = inject(AlmacenesStore);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  protected readonly form = this.fb.group({
    clave: ['', [Validators.required, claveValida]],
    nombre: [
      '',
      [Validators.required, noSoloEspacios, Validators.minLength(3), Validators.maxLength(80)],
    ],
  });

  protected readonly guardando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly mensajeError = mensajeError;
  private guardado = false;

  protected get esEdicion(): boolean {
    return this.id() !== undefined;
  }

  ngOnInit(): void {
    const id = this.id();
    if (id === undefined) return;
    this.form.controls.clave.disable(); // la clave no se cambia después del alta
    this.service.obtener(Number(id)).subscribe({
      next: (almacen: Almacen) => this.form.reset({ clave: almacen.clave, nombre: almacen.nombre }),
      error: (err: ErrorApp) => this.errorGeneral.set(err.message),
    });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // muestra los errores de los campos que nadie tocó
      return;
    }
    const { clave, nombre } = this.form.getRawValue();
    const id = this.id();
    const peticion$ =
      id === undefined
        ? this.store.crear({ clave: clave.trim(), nombre: nombre.trim() })
        : this.store.actualizar(Number(id), { nombre: nombre.trim() });

    this.guardando.set(true);
    this.errorGeneral.set(null);
    peticion$.subscribe({
      next: () => {
        this.guardado = true;
        this.notificacion.exito(id === undefined ? 'Almacén registrado' : 'Almacén actualizado');
        void this.router.navigate(['/almacenes']);
      },
      error: (err: ErrorApp) => {
        this.guardando.set(false);
        if (err.notificado) return; // el interceptor ya lo mostró
        if (err.status === 409) {
          this.form.controls.clave.setErrors({ servidor: err.message });
        } else {
          this.errorGeneral.set(err.message);
        }
      },
    });
  }

  tieneCambiosSinGuardar(): boolean {
    return this.form.dirty && !this.guardado;
  }
}
