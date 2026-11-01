import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReportesService } from './reportes.service';

/** Descarga de reportes. Datos sensibles del negocio: por eso la ruta exige permiso. */
@Component({
  selector: 'app-reportes',
  imports: [MatCardModule, MatButtonModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header titulo="Reportes" />
    <mat-card appearance="outlined">
      <mat-card-header
        ><mat-card-title>Catálogo de almacenes (CSV)</mat-card-title></mat-card-header
      >
      <mat-card-actions>
        <button mat-flat-button type="button" (click)="descargar()" [disabled]="descargando()">
          {{ descargando() ? 'Generando…' : 'Descargar CSV' }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class ReportesComponent {
  private readonly reportes = inject(ReportesService);
  protected readonly descargando = signal(false);

  protected descargar(): void {
    this.descargando.set(true);
    this.reportes.almacenesCsv().subscribe({
      next: (archivo) => {
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'almacenes.csv';
        enlace.click();
        URL.revokeObjectURL(url); // libera la memoria del Blob
        this.descargando.set(false);
      },
      error: () => this.descargando.set(false),
    });
  }
}
