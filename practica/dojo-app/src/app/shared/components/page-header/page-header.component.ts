import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Encabezado estándar de pantalla: título, subtítulo opcional y un hueco a la
 * derecha para acciones (`<ng-content>`). Que todas las pantallas lo usen es lo
 * que hace que la app se sienta "una sola".
 *
 *   <app-page-header titulo="Almacenes" subtitulo="Catálogo">
 *     <button mat-flat-button>Nuevo</button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      <div>
        <h1>{{ titulo() }}</h1>
        @if (subtitulo()) {
          <p class="subtitulo">{{ subtitulo() }}</p>
        }
      </div>
      <div class="acciones"><ng-content /></div>
    </header>
  `,
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
}
