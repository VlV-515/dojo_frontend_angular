import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SesionService } from '@core/auth/sesion.service';
import { CargaService } from '@core/ui/carga.service';
import { SiPermisoDirective } from '@shared/directives/si-permiso.directive';
import { environment } from '@env/environment';

/** Shell de la app: barra superior, navegación por permisos e indicador de carga. */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatProgressBarModule,
    SiPermisoDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class App {
  protected readonly sesion = inject(SesionService);
  protected readonly carga = inject(CargaService);
  protected readonly entorno = environment.nombre;
  private readonly router = inject(Router);

  protected salir(): void {
    this.sesion.cerrar();
    void this.router.navigate(['/login']);
  }
}
