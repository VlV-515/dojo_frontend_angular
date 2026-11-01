import { Pipe, PipeTransform } from '@angular/core';

/** `{{ almacen.activo | estatus }}` -> "Activo" / "Inactivo". Pipe puro: solo recalcula si cambia la entrada. */
@Pipe({ name: 'estatus' })
export class EstatusPipe implements PipeTransform {
  transform(activo: boolean | null | undefined): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
