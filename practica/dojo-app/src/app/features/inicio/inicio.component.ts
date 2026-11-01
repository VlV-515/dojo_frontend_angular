import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { SesionService } from '@core/auth/sesion.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SiPermisoDirective } from '@shared/directives/si-permiso.directive';

/** Tablero de entrada: una tarjeta por módulo al que el perfil tiene acceso. */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MatCardModule, MatButtonModule, PageHeaderComponent, SiPermisoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header titulo="Inicio" [subtitulo]="'Perfil: ' + (sesion.perfil()?.nombre ?? '')" />
    <div class="tarjetas">
      <mat-card *appSiPermiso="'almacenes.ver'" appearance="outlined">
        <mat-card-header><mat-card-title>Almacenes</mat-card-title></mat-card-header>
        <mat-card-content>Catálogo con filtros, alta y edición.</mat-card-content>
        <mat-card-actions><a mat-button routerLink="/almacenes">Abrir</a></mat-card-actions>
      </mat-card>
      <mat-card *appSiPermiso="'reportes.ver'" appearance="outlined">
        <mat-card-header><mat-card-title>Reportes</mat-card-title></mat-card-header>
        <mat-card-content>Exporta el catálogo a CSV.</mat-card-content>
        <mat-card-actions><a mat-button routerLink="/reportes">Abrir</a></mat-card-actions>
      </mat-card>
      <mat-card appearance="outlined">
        <mat-card-header><mat-card-title>Salud</mat-card-title></mat-card-header>
        <mat-card-content>Estado del backend (pública).</mat-card-content>
        <mat-card-actions><a mat-button routerLink="/salud">Abrir</a></mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .tarjetas {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
  `,
})
export class InicioComponent {
  protected readonly sesion = inject(SesionService);
}
