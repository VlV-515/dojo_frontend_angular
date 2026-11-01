import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="no-encontrada">
      <h1>Página no encontrada</h1>
      <p>La dirección no existe o cambió.</p>
      <a mat-flat-button routerLink="/inicio">Ir al inicio</a>
    </section>
  `,
  styles: `
    .no-encontrada {
      text-align: center;
      padding: 3rem 1rem;
    }
  `,
})
export class NoEncontradaComponent {}
