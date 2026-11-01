import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SiPermisoDirective } from '@shared/directives/si-permiso.directive';
import { EstatusPipe } from '@shared/pipes/estatus.pipe';
import { FiltroEstatus } from '../../models/almacen.model';
import { AlmacenesStore } from '../../state/almacenes.store';

/**
 * Listado de almacenes: filtros + tabla + paginación del lado del cliente.
 *
 * El dojo-api devuelve todo de una vez, así que se pagina aquí. Con miles de
 * registros la paginación va en el servidor (`?pagina=&tamano=`) y esta
 * pantalla solo manda los parámetros: lo ves en el módulo 10.
 */
@Component({
  selector: 'app-almacenes-lista',
  imports: [
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    PageHeaderComponent,
    SiPermisoDirective,
    EstatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './almacenes-lista.component.html',
  styleUrl: './almacenes-lista.component.scss',
})
export class AlmacenesListaComponent implements OnInit {
  protected readonly store = inject(AlmacenesStore);

  protected readonly columnas = ['clave', 'nombre', 'estatus', 'acciones'];
  protected readonly tamanos = [5, 10, 25];
  protected readonly indice = signal(0);
  protected readonly tamano = signal(5);

  /** Solo la página visible: la tabla nunca recibe más filas de las que pinta. */
  protected readonly pagina = computed(() => {
    const inicio = this.indice() * this.tamano();
    return this.store.filtrados().slice(inicio, inicio + this.tamano());
  });

  ngOnInit(): void {
    this.store.cargar();
  }

  protected filtrarTexto(texto: string): void {
    this.store.texto.set(texto);
    this.indice.set(0); // un filtro nuevo siempre regresa a la primera página
  }

  protected filtrarEstatus(estatus: FiltroEstatus): void {
    this.store.estatus.set(estatus);
    this.indice.set(0);
  }

  protected cambiarPagina(evento: PageEvent): void {
    this.indice.set(evento.pageIndex);
    this.tamano.set(evento.pageSize);
  }
}
