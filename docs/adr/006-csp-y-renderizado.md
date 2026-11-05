# ADR 006 — CSP y estrategia de renderizado

- **Estado:** **Aceptada** (decisión de Julio, 2026-11-05).
  **Implementada en la T18 de la Feature 001 y aprobada por Julio.** El 404 y
  los errores propios (P-16, al final) también están aprobados (2026-11-05),
  con sus límites aceptados. Feature 001 cerrada.
- **Fecha:** 2026-11-05
- **Reemplaza:** plan 001 §6.1 (todas las páginas dinámicas por el nonce).
- **Análisis completo:** `docs/architecture/DECISION-CSP-RENDERING.md`.
  Allí están las alternativas, las mediciones (§10 y anexos) y las pruebas
  P1–P14.

## Contexto

Con nonce, la CSP obliga en Next 16 a renderizar cada página en cada visita
[guía oficial de CSP de Next 16]:

- sin SSG, ISR ni PPR;
- sin caché de HTML en CDN.

Las alternativas que permitían páginas estáticas tenían otros problemas:

- **`'unsafe-inline'`** anula la protección contra scripts en línea.
- **El SRI experimental solo no basta:** se midió que los 3 scripts en línea de
  cada página no se cubren y la página no hidrata.
- **`'self'`** autoriza cualquier JS del origen. Se midió que ejecuta un JS
  propio que está fuera del build, incluso con trucos de ruta.

## Decisión

Las ocho decisiones de Julio:

1. **Páginas públicas estáticas (SSG)**, con hashes SHA-256 de sus scripts en
   línea calculados del HTML real del build (`scripts/csp-manifest.mjs`).
2. **Rutas dinámicas** (404 con el layout y, en el futuro, formularios y
   panel) con un **nonce único por respuesta**.
3. **Scripts externos solo desde `<ORIGEN>/_next/static/chunks/`**, en las dos
   políticas.
4. **Sin `'strict-dynamic'`**, también en las rutas dinámicas.
5. **Sin `'self'` en `script-src`.**
6. **Sin `'unsafe-inline'` ni `'unsafe-eval'`** (salvo `next dev`, plan 001 §6.4).
7. **Sin ISR** en las rutas protegidas con hashes.
8. **El origen sale de `SITE_ORIGIN`**, validada al construir, y **nunca del
   encabezado `Host`**.

Políticas resultantes (`script-src`; el resto de las directivas en
`SECURITY.md` §3):

| Respuesta | `script-src` | `style-src` | Caché |
|---|---|---|---|
| Página pública prerenderizada | `<ORIGEN>/_next/static/chunks/ 'sha256-…'×3` | `'self'` | `s-maxage=31536000` (CDN) |
| Ruta dinámica y 404 (con o sin extensión, P-16) | `<ORIGEN>/_next/static/chunks/ 'nonce-<N>'` | `'self' 'nonce-<N>'` | `private, no-cache, no-store` |
| Redirección | `<ORIGEN>/_next/static/chunks/` | `'self'` | — |

## Alternativas

| Alternativa | Por qué no |
|---|---|
| A · nonce con render por visita (la anterior) | Sin páginas estáticas ni caché de CDN. Con `strict-dynamic` confía en cualquier script que cree un script autorizado (medido, §10.5 del análisis). |
| B · `'unsafe-inline'` | Relaja la política. Descartada. |
| B' · SRI experimental + `'self'` | No hidrata (medido). |
| Hashes + `'self'` | Ejecuta JS del mismo origen fuera del build (medido). |
| CSP estricta pura de hashes (`integrity` en todos los scripts) | No funciona en Next 16.4.5: 3 scripts quedan sin `integrity` (medido). |
| Lista exacta de archivos | Funciona, pero casi triplica la CSP y no protege más (medido). |

## Consecuencias

- **El build depende de `SITE_ORIGIN`.** Sin ella, `next build` falla, y no
  hay valor por omisión que pudiera llegar a producción. Cada entorno se
  construye con su origen: el de las e2e y CI es `http://localhost:3100`; el
  de producción lo fija la 006.
- **El build tiene un paso propio y falla cerrado** si encuentra:
  - un script en línea con una forma no contemplada;
  - un script externo, o una referencia a JS, fuera de `/_next/static/chunks/`;
  - un manejador `on…=`, un estilo en línea, `javascript:`, `<base>`,
    `<object>`, `<embed>` o `<iframe>`;
  - una ruta con ISR o una página sin HTML;
  - **otra versión de Next** (`SUPPORTED_NEXT_VERSION`).

  Actualizar Next exige revisar las formas de script y repetir P1–P14.
- **El proxy lee `.next/csp-manifest.json` en tiempo de ejecución** (Next 16:
  el proxy corre en Node.js). Si el manifiesto falta o es de otro build,
  responde 500: no improvisa una CSP más laxa. El hosting de la 006 tiene que
  incluir ese archivo junto con el build (ADR 004).
- **El 404 y los errores tienen páginas propias (P-16, ver abajo).** El único
  HTML interno de Next que queda fuera del hash es `/_global-error` (su 500
  por omisión, con estilos en línea), que no es alcanzable por URL.
- **Se cede** que un *chunk* propio de Next pueda volver a cargarse sin nonce
  ni hash. Ese código es de Next, no del atacante [Inferencia].
- **Lo que no cubre:** código malicioso que llegue por el build o por una
  dependencia (supply chain), inyección de marcado sin scripts, y exfiltración
  por `img-src` y `connect-src 'self'`.
- **Verificado solo en Chromium**, sin CDN real. Firefox, Safari y el
  comportamiento detrás de un CDN quedan **pendientes** para la 006 (P-17).
  No se presentan como superados.

## P-16 — 404 y errores propios (2026-11-05)

Decisión de Julio: **opción B**, un 404 propio, bilingüe e integrado al sitio,
sin concesiones a la CSP.

### Lo que se midió antes

- `/foto.png` y `/favicon.ico` se renderizaban como `[locale]=foto.png`. El
  layout llamaba a `notFound()` sin ningún límite por encima y Next enviaba
  su carcasa de error (`<html id="__next_error__">`) con el cuerpo vacío.
  Con la CSP sin nonce de las rutas con extensión, nada la completaba:
  **página en blanco**. Además, cada URL inventada se guardaba en la caché del
  build (`s-maxage`), una entrada por URL.
- `/es/no-existe` (con nonce) tampoco llegaba renderizada del servidor: Next
  16.4.5 manda la misma carcasa vacía cuando una página llama a `notFound()`
  bajo un layout raíz que está en `[locale]`, y el 404 se pintaba en el
  cliente. Sin JavaScript no se veía nada. Esto también pasaba en la T18
  aprobada (medido sobre ese commit).
- El patrón de next-intl (`app/layout.tsx` de paso + `app/not-found.tsx`)
  **no lo resuelve**: medido, las dos URL siguen recibiendo la carcasa vacía.

### Lo que se implementó

- **`app/global-not-found.tsx`** con `experimental.globalNotFound`, la
  convención que Next documenta para un layout raíz bajo un segmento dinámico.
  Next lo devuelve para toda URL que no es una ruta, **sin pasar por los
  layouts**, y sí se renderiza en el servidor.
- **`dynamicParams = false`** en `[locale]/layout.tsx` y **sin
  `[...rest]`**: un idioma desconocido o una ruta inexistente ya no son
  rutas, así que caen en el 404 global en lugar de llamar a `notFound()`.
- El 404 arma el mismo documento que las páginas (`SiteDocument`: Nav,
  Footer, fuentes y estilos). Está en el idioma de la URL (`/es/…`, `/en/…`).
  Si la URL no lo trae (`/foto.png`), va en español con el bloque en inglés
  debajo (`lang="en"`). El proxy le pasa el idioma en el encabezado
  `x-thisjulio-locale`, que **siempre sobrescribe** o borra el que mande el
  navegador.
- Las acciones son «Volver al inicio» (enlace) y «Regresar» (`history.back()`,
  chunk externo). El botón solo aparece si hay una página anterior: sin
  JavaScript no se muestra un control que no funcionaría.
- **`app/global-error.tsx`** propio, bilingüe, con los mismos estilos:
  «Reintentar», «Volver al inicio» y «Regresar».
- Las clases y tokens son los del diseño aprobado (`.page-head`, `.mono`,
  `.h1`, `.h2`, `.lead`, `.muted`, `.actions`, `.link`). No hay estilos ni
  manejadores en línea, y no se agregó CSS.

### Seguridad

- El 404 se renderiza **por petición con nonce** (lee el encabezado del
  proxy). Por eso el proxy ahora da nonce también a las rutas con extensión,
  que siguen sin pasar por el enrutamiento de idioma: `/foto.png` es un 404,
  no una redirección.
- **Ninguna directiva cambió.** Las dos políticas son las mismas de la tabla
  de arriba. El 404 usa la del nonce.
- El build **falla** si `/_not-found` sale prerenderizado
  (`DYNAMIC_ONLY_ROUTES` en `scripts/lib/csp-scan.mjs`): el proxy le
  pondría nonce a un HTML sin nonce y la página no hidrataría.
- **Las precargas (prefetch) pasan ahora por el proxy.** Antes el `matcher`
  las excluía (lo sugiere la guía de CSP de Next). Sin el proxy, next-intl no
  reescribe `/es/trabajo` → `/es/work`, así que la precarga de toda ruta en
  español respondía 404 desde la T18. Con el 404 global, esas respuestas
  quedaban abiertas en el navegador. Pasar por el proxy solo agrega
  encabezados: no relaja nada.

### Límites, dichos sin rodeos (aceptados por Julio al cerrar la 001, 2026-11-05)

- `globalNotFound` es una **bandera experimental** de Next 16.4.5. Si una
  versión futura la cambia, las pruebas del 404 (`tests/e2e/not-found.spec.ts`)
  y el chequeo del manifiesto lo detectan. Actualizar Next ya exige repetir
  P1–P14 (`SUPPORTED_NEXT_VERSION`).
- **Un error del servidor** (500) sigue llegando como la carcasa de Next, y
  `global-error.tsx` lo pinta en el cliente (con nonce, sin violaciones;
  medido con una ruta de prueba que no se incluyó en el código). Sin
  JavaScript, un 500 no muestra texto: así renderiza Next los errores, y no
  hay forma de cambiarlo sin dejar de usar sus límites de error.
- `[locale]/not-found.tsx` queda para `notFound()` llamado desde una página
  futura, con el mismo bloque. Por la limitación de arriba se pinta en el
  cliente. Las rutas nuevas deben preferir `dynamicParams = false`, para que
  una URL inexistente no sea una ruta.
- El 500 interno de Next (`/_global-error`, copiado a `pages/500.html`) sigue
  fuera del hash, con sus estilos en línea. No es alcanzable por URL (el
  proxy redirige `/_global-error` a `/es/_global-error`, que es un 404).
