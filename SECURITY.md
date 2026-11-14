# Seguridad y privacidad — thisjulio.com

> **Ubicación principal** de las medidas de seguridad y privacidad del sitio.
> Referencias: `TECH-STACK.md` de Julio (pendiente, P-01), OWASP Top 10 y
> OWASP ASVS como guía de verificación. Estado: **§3 implementado en la
> Feature 001 (T18 y T19, aprobadas; feature cerrada el 2026-11-05)** (`src/proxy.ts`, `src/lib/security/*`, `scripts/csp-manifest.mjs`; ADR 006); el resto es
> diseño para las features siguientes.

## 1. Superficie de ataque de la v1

Páginas de contenido estáticas, dos formularios públicos (contacto y
estimador), proxy de idioma, escena WebGL en cliente. **Sin** base de datos,
autenticación, cuentas de usuario, subida de archivos (salvo aprobación,
P-06), analítica ni cookies de seguimiento.

**En el lanzamiento (feature 006) no hay formularios:** el contacto es un
enlace `mailto:` y el estimador no existe hasta la 004 (`roadmap.md` §2.1). La
superficie es páginas estáticas, el 404 dinámico, `robots.txt`, `sitemap.xml`
y el proxy. Lo que este documento dice de formularios, correo de envío y
antiabuso aplica desde la 004.

## 2. Controles por riesgo

| Riesgo | Control |
|---|---|
| XSS | React escapa por defecto; prohibido `dangerouslySetInnerHTML` salvo JSON-LD serializado y MDX del repositorio (contenido confiable, revisado por commit). CSP de hashes por página (estáticas) o nonce (dinámicas), con scripts externos solo desde `<ORIGEN>/_next/static/chunks/`; sin `'self'` ni `'strict-dynamic'` (ADR 006). |
| CSRF | Server Actions de Next.js validan el origen; los Route Handlers comprueban `Origin`/`Host` y solo aceptan `POST` con `Content-Type` esperado. Sin cookies de sesión en v1. |
| SSRF | El servidor no hace peticiones a URLs provistas por el usuario. La única salida es la API de correo, con dominio fijo. |
| IDOR / control de acceso | Sin recursos por usuario en v1. Al llegar el panel (futuro), autorización comprobada en servidor en cada acción. |
| Abuso de formularios | Ver ADR 005: honeypot, tiempo mínimo, límites de tamaño, validación estricta; verificación humana y límite de frecuencia a decidir. |
| Inyección en correo | Los campos se tratan como texto; cabeceras del correo fijas (remitente, destinatario, asunto con prefijo); `reply-to` solo tras validar el formato del correo. |
| Dependencias vulnerables | Versiones fijadas, `npm audit` en CI, actualización revisada; sin dependencias sin justificación en el plan de su feature. **Plazos de corrección (P-60, 2026-11-13):** dependencias de producción: crítico o alto, ≤ 7 días; moderado, ≤ 30 días; bajo, en la siguiente actualización. Solo de desarrollo: ≤ 90 días, o cuando exista una versión compatible. **Actualización general:** Next, React y next-intl se revisan cada mes y los parches de seguridad se aplican repitiendo P1–P14 (`SUPPORTED_NEXT_VERSION`). El plazo cuenta desde que el aviso se publica en la base de avisos de GitHub (la que consulta `npm audit`). |
| Secretos | Solo variables de entorno del servidor; nunca con prefijo `NEXT_PUBLIC_`; `.env*` en `.gitignore` salvo `.env.example` sin valores; secretos distintos por entorno. |
| Fuga de información | Errores genéricos al usuario; sin trazas en respuestas; `poweredByHeader: false`. |

## 3. Encabezados de seguridad

Implementados en la feature 001 y rehechos en su T18 (ADR 006). Los verifican
`tests/e2e/csp.spec.ts` (P1–P14) y `tests/e2e/quality.spec.ts`; se revisan en
la 006.

- `Content-Security-Policy`, en dos modos que arma `src/proxy.ts` con
  `buildCsp` (`src/lib/security/headers.ts`):

  | Respuesta | `script-src` | `style-src` |
  |---|---|---|
  | Página pública prerenderizada | `<ORIGEN>/_next/static/chunks/` + los `'sha256-…'` de los scripts en línea **de esa página** | `'self'` |
  | Ruta dinámica: el 404 propio, con o sin extensión (P-16); futuros formularios y panel | `<ORIGEN>/_next/static/chunks/` + `'nonce-…'` nuevo por respuesta | `'self' 'nonce-…'` |
  | Redirección | `<ORIGEN>/_next/static/chunks/`, sin hashes ni nonce | `'self'` |

  Directivas comunes: `default-src 'self'`, `img-src 'self' blob: data:`,
  `font-src 'self'` (fuentes autoalojadas, D-10), `connect-src 'self'`,
  `object-src 'none'`, `base-uri 'none'` (P-59, antes `'self'`), `form-action 'self'`,
  `frame-ancestors 'none'`, `manifest-src 'self'`, `worker-src 'self' blob:`
  y `upgrade-insecure-requests`.
- **Reglas fijas** (pruebas unitarias y e2e):
  - **nunca** `'self'` ni `'strict-dynamic'` en `script-src`;
  - **nunca** `'unsafe-inline'` ni `'unsafe-eval'` en producción;
  - ningún script se carga fuera de `/_next/static/chunks/`.
- **`<ORIGEN>`** sale de `SITE_ORIGIN`, validada en `next build` y fijada en el
  build. **Nunca se deduce del encabezado `Host`**: una CSP armada con un
  `Host` manipulado podría quedar en la caché de un CDN. Sin un valor válido,
  el build falla.
- **Hashes:** los calcula `scripts/csp-manifest.mjs` del HTML real del build y
  los escribe en `.next/csp-manifest.json`. **Falla cerrado** ante cualquier
  script, estilo, manejador o referencia no contemplados, ante ISR y ante una
  versión de Next no validada (ADR 006). Sin manifiesto válido, el proxy
  responde 500.
- **Prohibido:**
  - servir JS que no sea del build desde el mismo origen (subidas de archivos,
    JSONP, archivos de usuario);
  - publicar otro contenido bajo `/_next/static/chunks/`.

  Esa ruta es la única fuente de scripts permitida. `X-Content-Type-Options:
  nosniff` impide ejecutar como script un archivo con otro tipo MIME.
- **El 404 y los errores son páginas propias (P-16, ADR 006):**
  - `app/global-not-found.tsx` atiende toda URL que no es una ruta. Se
    renderiza en el servidor con nonce, sin estilos ni scripts en línea
    propios. El build falla si sale prerenderizado.
  - El idioma del 404 llega en el encabezado `x-thisjulio-locale`, que el
    proxy **siempre sobrescribe** o borra (el navegador no lo puede fijar).
  - `app/global-error.tsx` pinta los errores en el cliente con la misma CSP.
  - El único HTML interno de Next que queda fuera del hash es
    `/_global-error` (el 500 por omisión), que no es alcanzable por URL.
- **El proxy cubre también las precargas (prefetch)** desde P-16: sin él,
  next-intl no reescribe las rutas en español y las precargas respondían 404.
- **El proxy cubre todo salvo `/_next/static/` y `/_next/image`** (P-59 = A,
  feature 006): toda respuesta HTML lleva CSP, también el 404 de `/api*`,
  `/_vercel*` y `/_next/*` (antes salía sin ella). Lo fija
  `tests/e2e/headers.spec.ts`.
- **Solo con `next dev`:** `script-src` añade `'unsafe-eval'` y `style-src`
  pasa a `'self' 'unsafe-inline'` (React y el HMR de Turbopack inyectan código
  y estilos sin nonce). En desarrollo siempre se usa el modo nonce. Nunca en
  producción (prueba unitaria).
- **Verificado en Chromium, Firefox y WebKit (feature 006, R1), todavía sin
  CDN real.** Firefox corre en la suite normal. WebKit no puede probarse sobre
  `http://localhost`: aplica `upgrade-insecure-requests` también ahí, pide los
  scripts por HTTPS y ninguna página hidrata; se prueba, junto con los otros
  dos, bajo HTTPS con `node tests/https/run.mjs`. **Siguen pendientes (P-17):**
  Safari real en macOS e iOS (lista manual) y el comportamiento detrás del CDN
  del hosting.
- **Compatibilidad con WebGL:** el motor usa un `<canvas>` y texturas
  generadas en un canvas 2D; no necesita `unsafe-eval`, *workers* ni orígenes
  externos. Si una verificación demuestra lo contrario, se documenta la
  excepción mínima.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` (preload
  solo con aprobación, porque compromete el dominio entero).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy` denegando cámara,
  micrófono, geolocalización y similares, `Cross-Origin-Opener-Policy:
  same-origin`, `X-Frame-Options: DENY` (respaldo de `frame-ancestors`),
  `poweredByHeader: false`.

## 4. Privacidad y datos personales

- **Minimización:** los formularios piden solo nombre, correo y la
  descripción del proyecto; lo demás es opcional.
- **Sin almacenamiento:** los mensajes se envían por correo y no se guardan
  en el servidor; los logs no contienen el contenido ni el correo.
- **Sin analítica ni cookies de seguimiento** en v1. Tampoco hay cookie de
  idioma (`localeCookie: false`, verificado: ninguna respuesta envía
  `Set-Cookie`). Un cambio
  aquí requiere aprobación y actualizar la página de privacidad.
- **Sin servicios externos** cargados desde el navegador (fuentes, mapas,
  vídeos, widgets) sin aprobación.

## 4 bis. Telemetría de herramientas

Next.js recopila telemetría anónima de uso en `next build`/`next dev`. En CI
se desactiva (`NEXT_TELEMETRY_DISABLED=1`); en local cada desarrollador
puede desactivarla con `npx next telemetry disable`. No afecta a los
visitantes del sitio.

## 5. Almacenamiento en el navegador

El diseño usa `localStorage` para pasar estado entre artboards; la
aplicación lo sustituye por rutas y anclas (`docs/design/REFERENCIA-DISENO.md`
§4.2). No se guarda nada personal en el navegador.

## 6. Contenido legal

La página Legal es **informativa y marcada «Borrador pendiente de revisión
legal»** hasta la revisión jurídica (P-09). Reglas de redacción:

- No afirmar que Guatemala tiene una ley integral de protección de datos
  equivalente al RGPD; las obligaciones surgen de varias fuentes (p. ej.
  Constitución Política y Decreto 57-2008, en su ámbito), sujeto a revisión.
- No afirmar que el RGPD aplica automáticamente a todos los proyectos.
- Derechos de autor sobre software: Decreto 33-98 y reformas (vigencia y
  aplicabilidad a confirmar), Convenio de Berna, Tratado de la OMPI sobre
  Derecho de Autor y ADPIC cuando corresponda.
- Principio operativo: THIS JULIO no recopila ni procesa información
  adicional de los usuarios de los sistemas que desarrolla, salvo cuando sea
  parte de los requerimientos, las responsabilidades autorizadas o las
  obligaciones aplicables del proyecto.
- Sin contratos, garantías ni cláusulas de responsabilidad en el sitio.

## 7. Reporte de vulnerabilidades

Hasta que exista un correo de seguridad real (P-11), los reportes se reciben
por el canal de contacto.

**`/.well-known/security.txt`** (RFC 9116; feature 006, T15):
`public/.well-known/security.txt`. `Contact` es la página Contacto, en
español y en inglés y por ese orden; el archivo **no lleva correo**
(`spec/features/006-lanzamiento/spec.md` §3.2). Lleva además `Expires`,
`Preferred-Languages: es, en` y `Canonical` con la URL de producción.

- **Depende de G4:** mientras no haya correo de contacto, la página Contacto
  solo muestra GitHub. El archivo ya existe, pero el canal para reportar se
  completa al cerrar G4.
- **Renovación:** `Expires` vence el 2027-11-12. `tests/unit/security-txt.test.ts`
  falla 30 días antes, para avisar: se cambia la fecha a menos de un año de
  ese día.

## 8. Verificación OWASP ASVS (feature 006)

- **Versión y nivel (P-49 = A):** ASVS **5.0.0**. Nivel 1 en codificación y
  saneamiento (V1), validación (V2), criptografía (V11), protección de datos
  (V14) y registro y errores (V16); niveles 1 y 2 en frontend web (V3),
  comunicaciones (V12), configuración (V13) y arquitectura y dependencias
  (V15). No aplican en el lanzamiento V4–V10 ni V17 (sin API, archivos,
  cuentas, sesiones, tokens ni WebRTC). Revisión requisito por requisito:
  `spec/features/006-lanzamiento/auditoria-seguridad.md`.
- **Entradas y sus reglas (ASVS 2.1.1).** El sitio no recibe datos de las
  personas. Las únicas entradas son:
  - la **ruta**: solo las rutas del build existen (`dynamicParams = false`);
    cualquier otra es el 404 propio; el idioma sale del primer segmento y solo
    vale `es` o `en`;
  - el encabezado **`x-thisjulio-locale`**, que el proxy siempre sobrescribe o
    borra (§3);
  - **`SITE_ORIGIN`**, en el build: `parseSiteOrigin` solo admite
    `https://<host>` en minúsculas, sin puerto, ruta ni credenciales, o
    `http://localhost[:puerto]` para pruebas; con otro valor, o sin él, el
    build falla.

  El contenido del repositorio se valida con Zod en el build.
- **Comunicaciones (ASVS 13.1.1).** En ejecución, la aplicación **no abre
  ninguna conexión** saliente ni carga nada de terceros en el navegador
  (§4). En el build: el registro de npm (`npm ci`) y las fuentes de Google
  que `next/font` descarga y autoaloja. Fuera de la aplicación: el hosting
  (P-38) y Cloudflare (DNS y reenvío de correo, P-42).
- **Funciones costosas (ASVS 15.1.3).** En el servidor no hay ninguna: las
  páginas son estáticas y cacheables y el proxy hace un trabajo constante por
  petición (leer el manifiesto una vez y armar la CSP). La escena 3D corre en
  el navegador y se pausa fuera de la pantalla y con la pestaña oculta. El
  optimizador de imágenes de Next no tiene imágenes que optimizar y rechaza
  URL externas.
- **Decisiones de Julio (2026-11-13):** P-59 = A, aplicado: el proxy cubre
  todo salvo `/_next/static/` y `/_next/image`, y `base-uri 'none'` (§3; ADR
  006). P-60 = la propuesta (plazos en §2).

