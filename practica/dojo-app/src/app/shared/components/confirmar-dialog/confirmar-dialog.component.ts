import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

export interface DatosConfirmar {
  titulo: string;
  mensaje: string;
  /** Texto del botón que confirma. Usa el verbo de la acción, no "Aceptar". */
  confirmar: string;
}

/**
 * Diálogo de confirmación genérico. Las acciones destructivas o difíciles de
 * deshacer (desactivar, cancelar, borrar) siempre pasan por aquí.
 */
@Component({
  selector: 'app-confirmar-dialog',
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ datos.titulo }}</h2>
    <mat-dialog-content>{{ datos.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button [mat-dialog-close]="true">{{ datos.confirmar }}</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmarDialogComponent {
  protected readonly datos = inject<DatosConfirmar>(MAT_DIALOG_DATA);
}

/** Abre el diálogo y emite `true` solo si el usuario confirmó. */
export function confirmar(dialog: MatDialog, datos: DatosConfirmar): Observable<boolean> {
  return dialog
    .open<ConfirmarDialogComponent, DatosConfirmar, boolean>(ConfirmarDialogComponent, {
      data: datos,
      width: '420px',
    })
    .afterClosed()
    .pipe(map((r) => r === true));
}
