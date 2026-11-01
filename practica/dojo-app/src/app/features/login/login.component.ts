import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { PERFILES } from '@core/auth/perfiles';
import { SesionService } from '@core/auth/sesion.service';
import { noSoloEspacios } from '@shared/validators/texto.validators';

/**
 * Login de práctica: pide el token del dojo-api y un perfil simulado.
 * En un ERP real aquí va el flujo de tu proveedor de identidad (OAuth2/OIDC:
 * Auth0, Keycloak, Entra ID…), que devuelve el token. El resto de la app no
 * cambia: interceptor, guards y permisos funcionan igual.
 */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  /** `?volver=/almacenes`: a dónde regresar después de entrar (lo pone authGuard). */
  readonly volver = input<string>();

  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  protected readonly perfiles = PERFILES;
  protected readonly form = inject(NonNullableFormBuilder).group({
    token: ['', [Validators.required, noSoloEspacios]],
    perfil: ['admin', Validators.required],
  });

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { token, perfil } = this.form.getRawValue();
    this.sesion.iniciar(token, perfil);
    void this.router.navigateByUrl(destinoSeguro(this.volver()));
  }
}

/**
 * Solo rutas internas. Hoy `navigateByUrl` no sale de la app, pero si mañana
 * alguien cambia a `window.location.href = volver`, aceptar cualquier valor
 * sería un open redirect: `?volver=//sitio-falso` (o `/\sitio-falso`, que el
 * navegador trata igual) mandaría al usuario fuera después de entrar.
 */
export function destinoSeguro(volver: string | undefined): string {
  return volver && /^\/(?![/\\])/.test(volver) ? volver : '/inicio';
}
