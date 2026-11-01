import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { catchError, map, of, startWith } from 'rxjs';
import { SaludService } from './salud.service';

type Vista = { tipo: 'cargando' } | { tipo: 'ok'; persistencia: string } | { tipo: 'caido' };

/**
 * Ruta PÚBLICA (sin guards) a propósito, como `/salud` en el backend: sirve
 * para saber si el problema es el front o el servicio. Ejemplo de `toSignal`:
 * convierte un Observable en signal y se desuscribe solo.
 */
@Component({
  selector: 'app-salud',
  imports: [MatCardModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header titulo="Salud del backend" />
    <mat-card appearance="outlined">
      <mat-card-content>
        @switch (vista().tipo) {
          @case ('cargando') {
            <p>Consultando…</p>
          }
          @case ('ok') {
            <p role="status">
              Servicio en línea. Persistencia: <strong>{{ persistencia() }}</strong>
            </p>
          }
          @case ('caido') {
            <p role="alert">No hay respuesta. ¿Está corriendo el dojo-api en el puerto 1099?</p>
          }
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class SaludComponent {
  protected readonly vista = toSignal(
    inject(SaludService)
      .consultar()
      .pipe(
        map((s): Vista => ({ tipo: 'ok', persistencia: s.persistencia })),
        catchError(() => of<Vista>({ tipo: 'caido' })),
        startWith<Vista>({ tipo: 'cargando' }),
      ),
    { requireSync: true },
  );

  protected persistencia(): string {
    const v = this.vista();
    return v.tipo === 'ok' ? v.persistencia : '';
  }
}
