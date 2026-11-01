# 13 · Seguridad en el front

> Cinturón café · 1–2 días

## Objetivos

- Entender qué puede y qué no puede proteger un front.
- Prevenir XSS: cómo Angular sanitiza y cómo **no** romperlo.
- Guardar tokens con criterio y no filtrarlos.
- Evitar open redirects, fugas en logs y secretos en el bundle.
- Cuidar dependencias y cabeceras de seguridad.

## 1. El front corre en territorio enemigo

Todo tu código, environments incluidos, está en el navegador del usuario. Puede leerlo, modificarlo y llamar a tu API sin pasar por tu app. Por eso:

- **El backend valida todo**: permisos, montos, estados. El front valida para dar buena experiencia.
- Ocultar un botón o un guard **no** es control de acceso (módulo 06).
- No hay secretos en el front. Si una funcionalidad necesita un secreto, pasa por el backend.

## 2. XSS

XSS es lograr que tu página ejecute JavaScript de un atacante (por ejemplo, un nombre de almacén `<img src=x onerror=…>`). Angular te protege por default:

```html
<p>{{ almacen.nombre }}</p>            <!-- se escapa: se ve como texto -->
<div [innerHTML]="comentario"></div>   <!-- se sanitiza: quita scripts y handlers -->
```

Lo que **rompe** la protección:

| Peligro | Por qué |
|---|---|
| `bypassSecurityTrustHtml(…)` con datos del usuario | Le dices a Angular "confía en esto" |
| `element.innerHTML = …` vía `ElementRef` | Te saltas a Angular por completo |
| Construir plantillas con strings | Ídem |
| Librerías que inyectan HTML sin sanitizar | Revisa qué hacen con lo que les das |

Si de verdad necesitas HTML de usuario (comentarios con formato), sanitízalo con una librería probada y una lista blanca de etiquetas.

## 3. Tokens

[`sesion.service.ts`](../practica/dojo-app/src/app/core/auth/sesion.service.ts) guarda en `sessionStorage`:

| Dónde | Ventaja | Riesgo |
|---|---|---|
| Memoria (signal) | Nadie más lo lee | Se pierde al recargar |
| `sessionStorage` | Muere al cerrar la pestaña | Un XSS lo lee |
| `localStorage` | Sobrevive días | Un XSS lo lee, y dura más |
| Cookie `HttpOnly; Secure; SameSite` | JavaScript no la puede leer | Requiere que el backend la emita y protección CSRF |

La mejor defensa del token es **no tener XSS**. Si el backend lo permite, cookies `HttpOnly`. Y:

- El interceptor agrega el token **solo** a tu API ([`auth.interceptor.ts`](../practica/dojo-app/src/app/core/auth/auth.interceptor.ts)).
- Nunca en query params (`?token=…`): queda en logs, historial y cabeceras `Referer`.
- Nunca en `console.log`, en mensajes de error ni en reportes de soporte.
- Tokens de vida corta y renovación (refresh) manejada por tu proveedor de identidad (OIDC).

## 4. Open redirect

`/login?volver=…` es cómodo. Si el destino se usa para salir de la app (`window.location.href = volver`) y aceptas cualquier valor, un enlace de phishing manda al usuario a tu login real y, tras entrar, a un sitio falso. `router.navigateByUrl` no sale de la app, pero el código cambia: [`destinoSeguro()`](../practica/dojo-app/src/app/features/login/login.component.ts) solo acepta rutas internas (`/algo`, nunca `//otro-sitio`, `/\otro-sitio` ni `https://…`) y tiene spec. Es defensa en profundidad: barata hoy, cara de agregar después de un incidente.

## 5. Lo que se filtra sin querer

- Environments con URLs internas, IPs o llaves: van al bundle.
- Source maps en producción: exponen tu código fuente tal cual.
- Mensajes de error del backend con detalles técnicos (consultas SQL, rutas de servidor) mostrados en la UI. Por eso `ErrorApp` separa `message` (para el usuario) de `detalle` (para consola o soporte).
- Datos de ejemplo realistas en tests, Swagger o capturas de pantalla.

## 6. Dependencias y cabeceras

```bash
npm audit --omit=dev      # vulnerabilidades en lo que llega al navegador
npm outdated
```

Cada dependencia es código de un tercero corriendo con tus permisos. Antes de agregar una: ¿está mantenida?, ¿cuánto pesa?, ¿la necesitas o son 10 líneas?

Cabeceras que configura el servidor web (no Angular): `Content-Security-Policy` (qué scripts pueden correr), `X-Content-Type-Options`, `Strict-Transport-Security`, `frame-ancestors` (contra clickjacking). Angular es compatible con CSP estrictas (`ngCspNonce`, `autoCsp`).

## Lo vas a encontrar así

- Token en `localStorage` leído en cada servicio con `localStorage.getItem('token')`.
- Interceptor que agrega el token a **toda** petición, incluidas las de terceros.
- Llaves de servicios externos escritas directamente en `app.config.ts` o en environments.
- `bypassSecurityTrustHtml` para "arreglar" un HTML que Angular limpiaba.

Nada de eso se arregla de golpe; se arregla cada vez que tocas el código y se discute con el equipo cuando el cambio es grande.

## En un proyecto real

En un ERP los permisos los decide el backend en cada endpoint, y el front los replica solo para no mostrar lo que no sirve. Cuando encuentres algo que solo está protegido en el front (un botón oculto que llama a un endpoint sin validación), repórtalo como bug de seguridad, no lo "arregles" escondiendo más.

## Ejercicios — `practica/dojo-app`

1. Con el mock, registra un almacén con nombre `<img src=x onerror=alert(1)>`. ¿Qué se ve en la tabla y por qué no salió la alerta?
2. Busca en `dist/` (después de `npm run build`) si aparece el token del dojo. ¿Por qué no está?
3. Corre `npm audit --omit=dev` y explica el resultado.
4. Lee los casos de `login.component.spec.ts`. ¿Por qué `destinoSeguro` rechaza `/\otro-sitio` si empieza con `/`? Agrega un caso que creas que falta.

## Autoevaluación

1. ¿Por qué un guard no es control de acceso?
2. ¿Qué hace Angular con `{{ }}` y con `[innerHTML]`?
3. Compara `sessionStorage` y una cookie `HttpOnly` para guardar un token.
4. ¿Qué es un open redirect y cómo lo evita dojo-app?
5. ¿Qué cosas de un front terminan, sin querer, a la vista de cualquiera?

**Listo cuando:** puedes explicar los cinco riesgos de este módulo con un ejemplo en dojo-app.

Siguiente: [14 · Proyecto final](14-proyecto-final.md)
