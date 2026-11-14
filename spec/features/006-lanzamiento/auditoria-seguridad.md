# 006 · T14 — Revisión OWASP ASVS 5.0, secretos y dependencias

**Estado: parte local ejecutada (2026-11-13, R3-local).** Lo que depende del
hosting (TLS, encabezados detrás del CDN, configuración del proyecto) queda
para después de la T10 (§6). **No se corrigió nada en el código de la
aplicación:** los hallazgos que tocan la CSP o el proxy caen bajo CA-20 y
esperan la decisión de Julio (**P-59**); el documental, **P-60**. La sección
final, de la auditoría independiente (T16, Fable 5.2), se añade en su tarea.

## 1. Base, alcance y fuente

| Dato | Valor |
|---|---|
| Base | `6029715` (rama `claude/admiring-babbage-bjvbo8`) más las pruebas de la R3-local |
| Build | `SITE_ORIGIN=http://localhost:3100 npm run build`, `next start` en el puerto 3100 (`BUILD_ID` `inSlECV2KH37Wgh-qSmb2`); Next 16.4.5, React 19.3.1, Node 22 |
| Fuente de los requisitos | Documento oficial, **ASVS 5.0.0** (etiqueta `v5.0.0_release` de `github.com/OWASP/ASVS`, publicada el 2025-05-30), capítulos `5.0/en/0x10`–`0x26`. Se leyeron los 345 requisitos; los identificadores y el nivel de cada uno salen de esas tablas, no de memoria |
| Alcance (P-49 = A) | Nivel 1 en V1, V2, V11, V14 y V16; niveles 1 y 2 en V3 (frontend web), V12 (comunicaciones), V13 (configuración) y V15 (arquitectura y dependencias): **71 requisitos**. V16 no tiene requisitos de nivel 1; sus requisitos de errores (16.5.x, nivel 2) se revisaron igual, a título informativo (§4) |
| No aplican, con motivo | V4 API y servicios web, V5 archivos, V6 autenticación, V7 sesiones, V8 autorización, V9 tokens, V10 OAuth/OIDC y V17 WebRTC: el lanzamiento no tiene API, subidas, cuentas, sesiones, tokens ni WebRTC (`SECURITY.md` §1). Se revisan de nuevo con la 004 (formularios) |
| Cambio frente al plan | `plan.md` §4.5 no nombra V11 (criptografía). Se revisó en nivel 1 porque el proxy genera nonces y el build calcula hashes SHA-256 |

Pruebas nuevas: `tests/e2e/headers.spec.ts` (29 casos, un proyecto) fija lo
medido en local: encabezados por tipo de respuesta, nonce sin caché,
redirecciones que no salen del sitio, `Host` falso, CORS, errores e
inyección en la ruta reflejada. Las dos brechas conocidas quedan fijadas por su
nombre, para que no crezcan sin que nadie lo note.

## 2. Requisitos

**Resultado:** **Cumple**, **No aplica** (con motivo), **Hallazgo** (§5) o
**Preview** (se mide en la T10). Evidencia: `headers.spec.ts` (H),
`csp.spec.ts` P1–P14 (C), `transversal.spec.ts` (T), búsqueda en el código
(B), pruebas unitarias (U).

### V1 Codificación y saneamiento (nivel 1)

| Id | Requisito, en breve | Resultado | Evidencia |
|---|---|---|---|
| 1.2.1 | Codificación de salida según el contexto | Cumple | React escapa por defecto. El 404 refleja la ruta en el selector de idioma y en la carga RSC **solo codificada**: con `<script>`, `"><svg onload>`, `' onmouseover='` y `<img onerror>` en la URL no sale marcado (H, «refleja la ruta solo codificada») |
| 1.2.2 | URL dinámicas codificadas; solo protocolos seguros | Cumple | Las URL salen de `routing.ts` y de slugs del repositorio; el `mailto:` se arma con constantes de `src/config/contact.ts`; el único enlace externo es GitHub, constante (B) |
| 1.2.3 | Codificación al construir JavaScript o JSON | Cumple | `serializeJsonLd` escapa `<` (`src/lib/seo/routes.ts`; U `seo.test.ts`); Next escapa `<` en la carga RSC (H) |
| 1.2.4 | Consultas parametrizadas | No aplica | Sin base de datos |
| 1.2.5 | Inyección de comandos del sistema | No aplica | El servidor no ejecuta comandos: 0 usos de `child_process` en `src` (B) |
| 1.3.1 | Saneamiento de HTML de editores | No aplica | No hay HTML de usuarios |
| 1.3.2 | Sin `eval()` ni ejecución dinámica | Cumple | 0 `eval`, `new Function`, `innerHTML` o `document.write` en `src` (B); CSP sin `'unsafe-eval'` en producción (C, U) |
| 1.5.1 | Analizadores XML restrictivos | No aplica | No se analiza XML (el sitemap se genera, no se lee) |

### V2 Validación y lógica de negocio (nivel 1)

| Id | Requisito, en breve | Resultado | Evidencia |
|---|---|---|---|
| 2.1.1 | Reglas de validación de entradas documentadas | Cumple | `SECURITY.md` §8 (nuevo): las únicas entradas son la ruta, el encabezado de idioma que fija el proxy y `SITE_ORIGIN` en el build |
| 2.2.1 | Validación positiva | Cumple | Rutas cerradas (`dynamicParams = false`: lo demás es el 404); idiomas en lista (`es`, `en`); `parseSiteOrigin` en el build; contenido con Zod en el build (U) |
| 2.2.2 | Validación en una capa de confianza | Cumple | Todo se decide en el servidor o en el build; no hay validación solo en el cliente |
| 2.3.1 | Flujos en orden, sin saltar pasos | No aplica | Sin flujos de negocio por pasos |

### V3 Seguridad del frontend web (niveles 1 y 2)

| Id | Nivel | Requisito, en breve | Resultado | Evidencia |
|---|---|---|---|---|
| 3.2.1 | 1 | Impedir que se muestre contenido en un contexto equivocado | Cumple | Sin archivos de usuarios ni API; `nosniff` y `Content-Type` correctos en cada tipo de respuesta (H); scripts solo desde `/_next/static/chunks/` (C) |
| 3.2.2 | 1 | Texto con funciones seguras | Cumple | El único `dangerouslySetInnerHTML` es JSON-LD (datos, `<` escapado) (B) |
| 3.3.1 | 1 | Cookies `Secure` y prefijo | No aplica | El sitio no emite cookies: 0 `Set-Cookie` en las 32 rutas (T) y en cada tipo de respuesta (H); `localeCookie: false` |
| 3.3.2 | 2 | `SameSite` | No aplica | Sin cookies |
| 3.3.3 | 2 | Prefijo `__Host-` | No aplica | Sin cookies |
| 3.3.4 | 2 | `HttpOnly` | No aplica | Sin cookies |
| 3.4.1 | 1 | HSTS en todas las respuestas, ≥ 1 año, subdominios (L2) | **Hallazgo T14-2** | `max-age=63072000; includeSubDomains` en páginas, 404, estáticos, `robots.txt`, `sitemap.xml` y redirección de idioma (H). **No** en la redirección de barra final de Next (308) ni en la respuesta a `TRACE` (500). Detrás del CDN: Preview |
| 3.4.2 | 1 | CORS fijo | Cumple | Ninguna respuesta trae `Access-Control-Allow-Origin`, tampoco con un `Origin` ajeno (H) |
| 3.4.3 | 2 | CSP con `object-src 'none'`, **`base-uri 'none'`** y lista, nonces o hashes | **Hallazgo T14-1 y T14-3** | Hashes por página y nonce en lo dinámico, `object-src 'none'` (C, H). Pero: (T14-1) el 404 en HTML de las rutas que empiezan por `/api`, `/_vercel` o `/_next/` sale **sin CSP**; (T14-3) la directiva es `base-uri 'self'`, no `'none'` |
| 3.4.4 | 2 | `nosniff` en todas las respuestas | **Hallazgo T14-2** | Presente en todo lo medido salvo el 308 de barra final y el 500 de `TRACE` (H) |
| 3.4.5 | 2 | `Referrer-Policy` | Cumple | `strict-origin-when-cross-origin` (H) |
| 3.4.6 | 2 | `frame-ancestors` en cada respuesta | **Hallazgo T14-1** | `frame-ancestors 'none'` en toda respuesta con CSP (H). En las de T14-1 solo queda `X-Frame-Options: DENY`, que ASVS da por obsoleto. JavaScript y fuentes no son documentos que se puedan enmarcar |
| 3.5.1 | 1 | Protección contra peticiones cruzadas sin preflight | No aplica | Sin funcionalidad sensible ni peticiones que cambien estado. `POST`, `PUT` y `DELETE` a una página devuelven la misma página, sin efecto |
| 3.5.2 | 1 | Preflight no evitable | No aplica | Ídem |
| 3.5.3 | 1 | Métodos adecuados para funciones sensibles | No aplica | Ídem |
| 3.5.4 | 2 | Aplicaciones separadas en hosts separados | Cumple | Un sitio por host; el preview en su propio host del proveedor (P-41) |
| 3.5.5 | 2 | `postMessage` con origen comprobado | No aplica | 0 receptores de `message` (B) |
| 3.7.1 | 2 | Tecnologías de cliente vigentes | Cumple | HTML, CSS, JavaScript y WebGL; sin complementos |
| 3.7.2 | 2 | Redirecciones automáticas solo a destinos en lista | Cumple | Toda `Location` es una ruta relativa de una sola barra, también con `//evil.example`, `/\evil.example`, `/%2F%2F…` y `/https:evil.example/`; un `Host` o `X-Forwarded-Host` falso no cambia destino ni CSP (H) |

### V11 Criptografía (nivel 1)

| Id | Requisito, en breve | Resultado | Evidencia |
|---|---|---|---|
| 11.3.1 | Sin modos de bloque ni rellenos inseguros | No aplica | La aplicación no cifra datos; TLS es del hosting (V12) |
| 11.3.2 | Solo cifrados aprobados | No aplica | Ídem |
| 11.4.1 | Solo funciones hash aprobadas | Cumple | SHA-256 para los hashes de la CSP; 0 usos de MD5 o SHA-1 (B). El nonce sale de `crypto.getRandomValues` (16 bytes) |

### V12 Comunicaciones seguras (niveles 1 y 2)

| Id | Nivel | Requisito, en breve | Resultado | Evidencia |
|---|---|---|---|---|
| 12.1.1 | 1 | Solo TLS 1.2 y 1.3 | Preview | Lo pone el hosting; en local no hay TLS (el arnés HTTPS usa un certificado de prueba) |
| 12.1.2 | 2 | Suites de cifrado recomendadas | Preview | Ídem |
| 12.1.3 | 2 | mTLS validado | No aplica | Sin certificados de cliente |
| 12.2.1 | 1 | TLS en toda conexión externa, sin caer a HTTP | Preview | En local: `upgrade-insecure-requests` y HSTS (H). La redirección de HTTP a HTTPS es del hosting |
| 12.2.2 | 1 | Certificados de confianza pública | Preview | Del hosting |
| 12.3.1 | 2 | TLS en conexiones entrantes y salientes de la aplicación | Cumple | La aplicación no abre conexiones en ejecución: 0 `fetch` en `src` (B). En el build, `next/font` descarga las fuentes de Google por HTTPS |
| 12.3.2 | 2 | Los clientes TLS validan certificados | No aplica | Sin clientes TLS en ejecución |
| 12.3.3 | 2 | TLS entre servicios internos | No aplica | Sin servicios internos |
| 12.3.4 | 2 | Certificados de confianza entre servicios internos | No aplica | Ídem |

### V13 Configuración (nivel 2; 13.4.1 de nivel 1)

| Id | Nivel | Requisito, en breve | Resultado | Evidencia |
|---|---|---|---|---|
| 13.1.1 | 2 | Necesidades de comunicación documentadas | Cumple | `SECURITY.md` §8 (nuevo): en ejecución, ninguna; en el build, el registro de npm y las fuentes de Google; hosting y DNS |
| 13.2.1 | 2 | Comunicación autenticada entre componentes de backend | No aplica | Sin componentes de backend que se comuniquen |
| 13.2.2 | 2 | Mínimo privilegio entre componentes | No aplica | Ídem |
| 13.2.3 | 2 | Sin credenciales por defecto | No aplica | Sin credenciales de servicio |
| 13.2.4 | 2 | Lista de recursos externos permitidos | Cumple | La lista está vacía: ninguna petición saliente en ejecución (B); el optimizador de imágenes rechaza URL externas (400) |
| 13.2.5 | 2 | El servidor solo pide recursos de la lista | Cumple | Ídem |
| 13.3.1 | 2 | Gestor de secretos | No aplica | Sin secretos de backend: solo `SITE_ORIGIN` y `NEXT_TELEMETRY_DISABLED`, que no son secretos |
| 13.3.2 | 2 | Mínimo privilegio sobre secretos | No aplica | Ídem |
| 13.4.1 | 1 | Sin metadatos de control de versiones | Cumple (local) | `/.git/config` → 307 a `/es/.git/config` → 404 (H). Que el hosting no publique `.git`: Preview |
| 13.4.2 | 2 | Modos de depuración apagados | Cumple | Build de producción; `/es/sistema` (solo desarrollo) → 404; sin mapas de código (H) |
| 13.4.3 | 2 | Sin listados de directorios | Cumple | `/_next/static` → 404 (H) |
| 13.4.4 | 2 | `TRACE` no admitido | Cumple, con detalle | `TRACE` → 500 genérico de 21 B, **sin eco** ni trazas (H); sin encabezados de seguridad (T14-2). Detrás del CDN: Preview |
| 13.4.5 | 2 | Sin documentación ni monitoreo expuestos | Cumple (local) | Sin API, sin analítica. Las rutas `/_vercel/*` del hosting: Preview |

### V14 Protección de datos (nivel 1)

| Id | Requisito, en breve | Resultado | Evidencia |
|---|---|---|---|
| 14.2.1 | Datos sensibles fuera de la URL | Cumple | El sitio no recibe datos sensibles; las URL no llevan claves ni tokens |
| 14.3.1 | Datos autenticados borrados del cliente | No aplica | Sin sesiones; sin `localStorage` (T) |

### V15 Código seguro y arquitectura (niveles 1 y 2)

| Id | Nivel | Requisito, en breve | Resultado | Evidencia |
|---|---|---|---|---|
| 15.1.1 | 1 | Plazos de corrección de dependencias, según el riesgo, documentados | **Hallazgo T14-4** | `SECURITY.md` dice «actualización revisada», sin plazos. Propuesta en **P-60** |
| 15.1.2 | 2 | Inventario de componentes (SBOM) de repositorios de confianza | Cumple | `package-lock.json` versionado: 527 paquetes, todos de `registry.npmjs.org` y con `integrity`. SBOM formal bajo demanda: `npm sbom` (npm 10.9.2) |
| 15.1.3 | 2 | Funciones costosas documentadas | Cumple | `SECURITY.md` §8 (nuevo): en el servidor no hay ninguna (páginas estáticas, proxy de costo constante). La escena 3D es del cliente y se pausa fuera de la pantalla |
| 15.2.1 | 1 | Componentes dentro de los plazos | Cumple (producción) | `npm audit --omit=dev`: **0** vulnerabilidades. Desarrollo: T14-5. Sin plazos aprobados (P-60) no se puede medir contra ellos |
| 15.2.2 | 2 | Defensas contra la pérdida de disponibilidad | Cumple | Sin funciones costosas en el servidor; HTML cacheable por el CDN (`s-maxage`, H); el 404 con nonce no se cachea (H). En Hobby, pasar un límite detiene la función en vez de cobrar (P-38): riesgo de disponibilidad, no de costo |
| 15.2.3 | 2 | Producción sin código de prueba ni de desarrollo | Cumple | `/es/sistema` → 404; las pruebas no se importan desde `src`; los «datos de prueba» de `pages.spec.ts` se inyectan en el DOM desde la prueba (B) |
| 15.3.1 | 1 | Solo los campos necesarios | No aplica | Sin objetos de datos ni API |
| 15.3.2 | 2 | No seguir redirecciones en llamadas salientes | No aplica | Sin llamadas salientes |
| 15.3.3 | 2 | Asignación masiva | No aplica | Sin formularios ni modelos |
| 15.3.4 | 2 | IP original de confianza | No aplica | La aplicación no registra IP ni limita frecuencia; es del hosting |
| 15.3.5 | 2 | Tipos y comparaciones estrictos | Cumple | TypeScript `strict`; 0 comparaciones `==` o `!=` en `src` (B) |
| 15.3.6 | 2 | Contaminación de prototipos | Cumple | No se mezcla ninguna entrada externa en objetos; el JSON que se lee es del repositorio (B) |
| 15.3.7 | 2 | Contaminación de parámetros HTTP | No aplica | La aplicación no lee parámetros de consulta, cuerpo ni cookies; solo el encabezado de idioma que fija el proxy (B) |

**Resumen** (contado sobre las tablas): 71 requisitos. Cumple 32 · No aplica
30 · Preview 4 · Hallazgo 5 (3.4.1, 3.4.3, 3.4.4, 3.4.6 y 15.1.1; ninguno alto
ni crítico).

## 3. Encabezados por tipo de respuesta (local)

Medidos con `curl -sI` y fijados en `headers.spec.ts`. «Comunes»: HSTS,
`nosniff`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy` y `X-Frame-Options`, como en `SECURITY.md` §3.

| Respuesta | Estado | Comunes | CSP | `Cache-Control` |
|---|---|---|---|---|
| Página estática (`/es`, `/en/work`) | 200 | Sí | Hashes de esa página | `s-maxage=31536000` |
| 404 propio (`/es/no-existe`, `/foto.png`, `/es/sistema`) | 404 | Sí | Nonce, distinto en cada respuesta | `private, no-cache, no-store` |
| Redirección de idioma (`/`) y `/.git/config` | 307 | Sí | Sin hashes ni nonce | — |
| `robots.txt`, `sitemap.xml` | 200 | Sí | Nonce | `public, max-age=0, must-revalidate` |
| Chunk de JavaScript, fuente | 200 | Sí | No (no son documentos) | `public, max-age=31536000, immutable` |
| **404 bajo `/api`, `/_vercel`, `/_next/`** (T14-1) | 404 | Sí | **No**, con HTML y 11 scripts | `private, no-cache, no-store` |
| **Redirección de barra final** (`/es/` → `/es`) (T14-2) | 308 | **No** | No | — |
| **`TRACE`** (T14-2) | 500 | **No** | No | `private, no-cache, no-store` |

En ninguna: `Set-Cookie`, `X-Powered-By` ni `Access-Control-Allow-Origin`.
Next añade `x-nextjs-cache`, `x-nextjs-prerender` y `x-nextjs-stale-time`
en las páginas: revelan el framework (ASVS 13.4.6, nivel 3, fuera del
alcance elegido).

## 4. Dependencias, secretos y errores

| Qué | Comando | Resultado |
|---|---|---|
| Dependencias de producción | `npm audit --omit=dev` | **0** vulnerabilidades (527 paquetes). La CI ya lo corre con `--audit-level=high` |
| Todas | `npm audit` | 8 moderadas, **solo de desarrollo** y por una sola causa: `minimatch` 10.2.6 (GHSA-g3hv-75wg-m249, denegación de servicio con patrones glob) dentro de `eslint-config-next` → `typescript-eslint`. No se publica ni recibe patrones de terceros. npm propone «corregirlo» bajando `eslint-config-next` a 15.5.29 (versión mayor anterior, rompe la alineación con Next 16): **no se aplica** (T14-5) |
| Avisos de Next 16.4.5 y React 19.3.1 | `gh api "/advisories?ecosystem=npm&affects=<paquete>@<versión>"` (base de avisos de GitHub, 2026-11-13) | **0** para `next@16.4.5`, `react@19.3.1`, `react-dom@19.3.1`, `next-intl@4.14.9` y `zod@4.6.7` |
| Secretos en el historial | Búsqueda en `git log --all -p` (77 commits) de claves de AWS, tokens de GitHub, Slack, Stripe, Google, Vercel, JWT, llaves privadas y asignaciones `password=`, `secret=`, `token=`, `api_key=`; archivos `.env`, `.pem`, `.key` o `credentials` versionados | **0**. Único archivo de entorno versionado: `.env.example`, sin valores. `.gitignore` cubre `.env*`, `*.pem` y `.vercel`. Los correos del historial son de prueba (`prueba@thisjulio.com`, `nombre@…`) o firmas de commit |
| Fuga en errores (16.5.1, informativo) | Copia aislada sin `.next/csp-manifest.json`, `next start` en otro puerto | `/es` y `/es/no-existe` → **500** `text/plain`, 21 B, «Internal Server Error»: sin rutas, trazas ni el motivo. El motivo queda solo en el registro del servidor (`Falta .next/csp-manifest.json…`). Falla cerrado, sin una CSP más laxa |
| Fallo seguro (16.5.3, informativo) | Ídem; U `security.test.ts` | Manifiesto ausente, de otro build o con hashes inválidos → 500, nunca una página sin CSP |
| CA-20 | `git diff 4561400 -- scripts src/proxy.ts src/lib/security` | No está vacío: solo `scripts/release-gates.mjs` y `scripts/lib/release-gates.mjs` (T2, aprobada en ▲C1). Ningún archivo de la CSP cambió |

## 5. Hallazgos

| Id | Severidad | ASVS | Ruta | Qué pasa | Corrección | Prueba que lo fija |
|---|---|---|---|---|---|---|
| **T14-1** | **Media** | 3.4.3, 3.4.6 | Toda ruta que empiece por `/api`, `/_vercel` o `/_next/` y no sea un archivo real (p. ej. `/api/x`, `/apiary`, `/_next/zz`) | El `matcher` del proxy (`/((?!api\|_next/\|_vercel).*)`) las deja fuera, y Next responde el 404 propio en HTML, con sus 11 scripts, **sin CSP** ni `frame-ancestors`. No refleja la ruta sin codificar (H) y no hay forma conocida de inyectar contenido, así que no es explotable hoy, pero pierde la defensa en profundidad. El sitio no tiene API, así que excluir `api` no hace falta | **Sin aplicar**: toca `src/proxy.ts` (CA-20). Propuesta en **P-59** | H fija las tres rutas como «sin CSP»: si se corrige el `matcher`, la prueba falla y obliga a actualizarla |
| **T14-2** | Baja | 3.4.1, 3.4.4, 13.4.4 | Redirección de barra final (`/es/` → `/es`, 308) y respuesta a `TRACE` (500) | Next las responde antes de aplicar los encabezados de `next.config.ts`: sin HSTS ni `nosniff`. No tienen contenido (el 500 son 21 B de texto). Detrás del CDN puede cambiar: las redirecciones de barra final y los métodos raros los atiende el hosting | Ninguna antes de medir en la T10. Si allí sigue igual, se presenta con opciones | H fija el 308 sin HSTS («conocida»): si Next o el hosting empiezan a ponerlo, avisa para cerrar T14-2 |
| **T14-3** | Baja | 3.4.3 | Todas las respuestas con CSP | `base-uri 'self'`; ASVS 5.0 pide `'none'` como mínimo. El sitio no usa `<base>`, así que `'none'` es más estricto sin efecto en el comportamiento | **Sin aplicar**: cambia una directiva (CA-20, `SECURITY.md` §3). Incluido en **P-59** | — |
| **T14-4** | Baja (documental) | 15.1.1 | `SECURITY.md` §2 | No define plazos para corregir componentes vulnerables ni para actualizar | **Sin aplicar**: los plazos son un compromiso de Julio. Propuesta en **P-60** | — |
| **T14-5** | Baja | 15.2.1 | Solo herramientas de desarrollo | 8 avisos moderados por `minimatch` en la cadena de ESLint (§4); no llega al sitio | Ninguna hasta que `typescript-eslint` adopte `minimatch` ≥ 11.0.1; no se fuerza con `overrides` (cambiaría dependencias sin plan). Se revisa con el plazo que fije P-60 | La CI sigue corriendo `npm audit --omit=dev --audit-level=high` |

## 6. Lo que queda para el preview (después de la T10)

| Qué | Requisitos | Quién |
|---|---|---|
| TLS del hosting: versiones, suites, certificado, redirección de HTTP a HTTPS | 12.1.1, 12.1.2, 12.2.1, 12.2.2 | Agente (`curl -v`, `openssl s_client`) |
| Los encabezados de §3 detrás del CDN, incluidas las filas de T14-1 y T14-2, y si el hosting añade los suyos | 3.4.x, CA-10 | Agente |
| `TRACE`, redirección de barra final y rutas `/_vercel/*` en el hosting | 13.4.4, 13.4.5, T14-2 | Agente |
| Que no se publique `.git` | 13.4.1 | Agente |
| Variables del proyecto (solo `SITE_ORIGIN` y `NEXT_TELEMETRY_DISABLED`), segundo factor en GitHub, Cloudflare y el hosting, acceso del hosting solo a este repositorio | CA-14, `plan.md` §4.5 | Julio (capturas del panel) |
