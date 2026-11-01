# 08 · HTTP, interceptores y manejo de errores

> Cinturón azul · 3 días

## Objetivos

- Escribir servicios HTTP tipados que desenvuelven la respuesta del backend.
- Entender la cadena de interceptores y su orden.
- Centralizar errores: normalizar, decidir quién los muestra y nunca tragarlos.
- Conectar el front con el dojo-api usando un proxy (y entender CORS).
- Trabajar sin backend con un mock que respeta el contrato.

## 1. Servicio HTTP tipado

[`almacenes.service.ts`](../practica/dojo-app/src/app/features/almacenes/services/almacenes.service.ts):

```ts
@Injectable({ providedIn: 'root' })
export class AlmacenesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/almacenes`;

  listar(soloActivos = false): Observable<Almacen[]> {
    const params = soloActivos ? new HttpParams().set('activos', 'true') : undefined;
    return this.http.get<Respuesta<Almacen[]>>(this.url, { params }).pipe(map((r) => r.datos ?? []));
  }
}
```

Reglas del equipo:

1. Un método por endpoint, nombre en el idioma del negocio.
2. Devuelve `Observable`; no se suscribe.
3. Desenvuelve la envoltura: el resto de la app recibe `Almacen[]`, no `Respuesta<Almacen[]>`.
4. No muestra toasts ni maneja errores: eso es del interceptor y del componente.
5. Parámetros con `HttpParams`, nunca concatenando strings (`?activos=` + valor sin codificar).

## 2. Interceptores

Un interceptor ve **todas** las peticiones y respuestas. dojo-app registra cuatro en [`app.config.ts`](../practica/dojo-app/src/app/app.config.ts):

```ts
withInterceptors([cargaInterceptor, authInterceptor, errorInterceptor, ...(environment.usarMock ? [mockInterceptor] : [])])
```

```
petición  →  carga → auth → error → (mock) → backend
respuesta ←  carga ← auth ← error ← (mock) ← backend
```

| Interceptor | Qué hace | Detalle importante |
|---|---|---|
| [`carga`](../practica/dojo-app/src/app/core/http/carga.interceptor.ts) | Indicador de carga global | `finalize`, no `tap`: se apaga también en error y cancelación |
| [`auth`](../practica/dojo-app/src/app/core/auth/auth.interceptor.ts) | `Authorization: Bearer …` | Solo hacia **nuestra** API, nunca a terceros |
| [`error`](../practica/dojo-app/src/app/core/http/error.interceptor.ts) | Normaliza y decide quién muestra | Siempre re-lanza el error |
| [`mock`](../practica/dojo-app/src/app/core/mock/mock.interceptor.ts) | Backend falso | Al final, para que los demás no noten la diferencia |

Las peticiones son inmutables: para agregar un header se usa `req.clone({ setHeaders })`.

### Opciones por petición: `HttpContext`

¿Y si una petición no quiere toast (porque la pantalla muestra el error a su manera)? Se marca con un `HttpContextToken` ([`contexto.ts`](../practica/dojo-app/src/app/core/http/contexto.ts)):

```ts
this.http.get<EstadoSalud>(url, { context: silencioso() });
```

Es mejor que headers inventados (`X-Skip-Error`) que viajan al servidor.

## 3. Una política de errores

| Status | Quién lo muestra | Por qué |
|---|---|---|
| 0 (sin conexión) | Interceptor | El componente no puede hacer nada útil |
| 401 | Interceptor: cierra sesión y manda a /login | La sesión no sirve para nada |
| 403 | Interceptor | El usuario necesita saber que es un tema de permisos |
| 400, 404, 409 | **Componente** | Tienen contexto: van junto al campo o en la tabla |
| 5xx | Interceptor | Error nuestro; el componente solo apaga su spinner |

Para que nadie muestre el mismo error dos veces, [`ErrorApp`](../practica/dojo-app/src/app/core/errores/error-app.ts) trae `notificado`. Y el [`GlobalErrorHandler`](../practica/dojo-app/src/app/core/errores/global-error-handler.ts) atrapa lo que nadie atrapó.

**Nunca:** `catchError(() => EMPTY)` sin avisar, `console.log(err)` como único manejo, o mostrar `err.message` crudo de `HttpErrorResponse` ("Http failure response for…") al usuario.

## 4. Conectar con el dojo-api: proxy y CORS

El navegador bloquea peticiones de `localhost:4200` a `localhost:1099` si el backend no responde con headers CORS (el dojo-api no los manda). En vez de abrir CORS, el dev server hace de intermediario con [`proxy.conf.json`](../practica/dojo-app/proxy.conf.json):

```
navegador → localhost:4200/api/almacenes → (proxy) → localhost:1099/almacenes
```

```bash
# terminal 1: dojo_backend_go/practica/dojo-api
swag init -g main.go && go run main.go
# terminal 2: dojo_frontend_angular/practica/dojo-app
npm start
```

Por eso `apiUrl` es `/api` (relativo) en todos los environments: en producción, un reverse proxy hace lo mismo y el bundle no trae ningún dominio.

## 5. Mock que respeta el contrato

`npm run start:mock` usa `environment.mock.ts` (`usarMock: true`), que agrega `mockInterceptor`. Responde con la misma envoltura, los mismos códigos (401 sin token, 409 si la clave existe) y una latencia de 300 ms para que veas los indicadores de carga.

Un mock que **no** respeta el contrato es peor que no tener mock: la app "funciona" en mock y truena con el backend real. Cuando el backend cambie, actualiza el mock en el mismo PR.

## Lo vas a encontrar así

```ts
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> { … }
}
// providers: [{ provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }]
// provideHttpClient(withInterceptorsFromDi())
```

Interceptores de clase registrados con `HTTP_INTERCEPTORS`. Funcionan igual; el orden es el de registro. También: servicios que devuelven `Observable<any>`, URLs completas por microservicio en el environment (`urlAlmacenes`, `urlVentas`…) y funciones utilitarias globales que muestran el error y apagan un loader manipulando el DOM.

## En un proyecto real

Un ERP habla con varios microservicios, cada uno con su base URL. El interceptor de auth tiene que saber cuáles son "nuestros" (para mandar el token) y el de errores suele manejar casos especiales: re-login en un modal cuando el token vence, reintento de la petición original, errores de descargas (`responseType: 'blob'`) cuyo cuerpo JSON viene como Blob y hay que leerlo antes de mostrarlo.

## Ejercicios — `practica/dojo-app`

1. Levanta el dojo-api y `npm start`. Entra con el token correcto; luego cierra sesión y entra con uno inventado. ¿Qué interceptor te saca y en qué momento?
2. Apaga el dojo-api con la app abierta y recarga Almacenes. ¿Qué mensaje ves y quién lo mostró?
3. Lee [`interceptores.spec.ts`](../practica/dojo-app/src/app/core/http/interceptores.spec.ts) y agrega un caso: un 403 muestra toast y el error llega con `notificado = true`.
4. Agrega a `AlmacenesService` un método `existeClave(clave)` que use `listar()` y `map`. ¿Por qué sería mejor un endpoint dedicado?
5. Compara la respuesta de `/salud` del mock con la del dojo-api real (`curl localhost:1099/salud`). ¿Coinciden?

## Autoevaluación

1. ¿En qué orden pasan petición y respuesta por los interceptores?
2. ¿Por qué el interceptor de auth revisa la URL antes de agregar el token?
3. ¿Por qué `finalize` y no `tap` para apagar el indicador de carga?
4. ¿Qué errores muestra el interceptor y cuáles el componente? Justifica.
5. ¿Qué problema resuelve el proxy del dev server y qué lo resuelve en producción?

**Listo cuando:** dojo-app funciona igual con el dojo-api real y con el mock, y tu caso de 403 pasa.

Siguiente: [09 · Estado con signals](09-estado.md)
