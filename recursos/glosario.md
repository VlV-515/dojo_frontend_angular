# Glosario

| Término | Qué es |
|---|---|
| **a11y** | Accesibilidad: que la app se pueda usar con teclado, lector de pantalla y buen contraste |
| **Bundle inicial** | El JavaScript que el navegador descarga antes de pintar la primera pantalla |
| **CDK** | Component Dev Kit: la base de Angular Material (overlays, tablas, drag & drop, a11y) |
| **Change detection** | Proceso con el que Angular revisa qué cambió y actualiza el DOM |
| **Chunk lazy** | Archivo JS de una ruta que se descarga solo al navegar a ella |
| **`computed`** | Signal de solo lectura derivado de otros signals; se recalcula solo si cambian sus dependencias |
| **CORS** | Regla del navegador que bloquea peticiones a otro origen si el servidor no lo permite |
| **DI** | Inyección de dependencias: Angular crea y entrega las instancias que pides con `inject()` |
| **`effect`** | Función que corre cuando cambian los signals que lee; para efectos laterales |
| **Environment** | Archivo de configuración por entorno que se elige al compilar (`fileReplacements`) |
| **Envoltura** | Forma común de las respuestas del backend: `{ codigo, mensaje, datos }` |
| **Fake** | Doble de pruebas con una implementación simplificada que funciona (el mock de dojo-app) |
| **Guard** | Función que decide si se puede entrar a una ruta, cargarla o salir de ella |
| **`HttpContext`** | Opciones por petición que leen los interceptores, sin viajar al servidor |
| **Inmutabilidad** | No modificar objetos ni arreglos: crear nuevos con los cambios |
| **Interceptor** | Función que ve y puede modificar todas las peticiones y respuestas HTTP |
| **`InjectionToken`** | Llave para inyectar algo que no es una clase (un string, una config) |
| **Lazy loading** | Cargar código bajo demanda (`loadComponent`, `loadChildren`) |
| **Marble testing** | Probar Observables dibujando su línea de tiempo con caracteres (`--a-b|`) |
| **Mock** | Doble de pruebas o backend falso; en este dojo, `mockInterceptor` |
| **Narrowing** | Cuando TypeScript reduce el tipo de una variable tras una comprobación (`if`, `switch`, type guard) |
| **Observable** | Flujo perezoso de valores en el tiempo; no hace nada hasta que alguien se suscribe |
| **OnPush** | Estrategia de detección de cambios que solo revisa el componente cuando cambian sus inputs, eventos o signals |
| **Open redirect** | Vulnerabilidad: usar un parámetro de la URL para mandar al usuario a cualquier sitio |
| **Pipe** | Transformación en la plantilla (`{{ x \| date }}`); los puros solo se recalculan si cambia la entrada |
| **Proxy (dev server)** | `proxy.conf.json`: el dev server reenvía `/api` al backend para evitar CORS |
| **Signal** | Valor reactivo (`signal()`): al leerlo Angular sabe quién depende de él |
| **Standalone** | Componente que declara sus propias dependencias en `imports`, sin `NgModule` |
| **Store** | Servicio que concentra el estado de una feature y los métodos para cambiarlo |
| **`switchMap`** | Operador que cancela el Observable interno anterior cuando llega un valor nuevo |
| **`track`** | Expresión de `@for` que identifica cada elemento para no repintar la lista entera |
| **Tree-shaking** | El build elimina código que nadie importa (`providedIn: 'root'` lo permite) |
| **Type guard** | Función `x is T` que comprueba en tiempo de ejecución y estrecha el tipo |
| **`UrlTree`** | URL ya parseada; un guard la devuelve para redirigir |
| **XSS** | Inyección de JavaScript de un atacante en tu página |
| **Zoneless** | Detección de cambios sin zone.js: solo signals, eventos y `markForCheck` |
| **zone.js** | Librería que parcha APIs asíncronas para avisarle a Angular que revise cambios |
