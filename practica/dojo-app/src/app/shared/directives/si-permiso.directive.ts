import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { Permiso } from '@core/auth/perfiles';
import { SesionService } from '@core/auth/sesion.service';

/**
 * Directiva estructural: pinta el elemento solo si la sesión tiene el permiso.
 *
 *   <button *appSiPermiso="'almacenes.editar'">Nuevo</button>
 *
 * Recuerda: esconder un botón es experiencia de usuario, no seguridad.
 */
@Directive({ selector: '[appSiPermiso]' })
export class SiPermisoDirective {
  readonly appSiPermiso = input.required<Permiso>();

  private readonly plantilla = inject(TemplateRef);
  private readonly contenedor = inject(ViewContainerRef);
  private readonly sesion = inject(SesionService);
  private visible = false;

  constructor() {
    // effect se vuelve a ejecutar si cambia el permiso pedido o la sesión.
    effect(() => {
      const permitido = this.sesion.tiene(this.appSiPermiso());
      if (permitido && !this.visible) this.contenedor.createEmbeddedView(this.plantilla);
      if (!permitido && this.visible) this.contenedor.clear();
      this.visible = permitido;
    });
  }
}
