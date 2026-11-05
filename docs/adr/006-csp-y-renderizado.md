# ADR 006 — CSP y estrategia de renderizado

- **Estado:** **Aceptada** (decisión de Julio, 2026-11-05).
  **Implementada en la T18 de la Feature 001.** El cierre de la 001 espera la
  aprobación final de Julio.
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
| Ruta dinámica | `<ORIGEN>/_next/static/chunks/ 'nonce-<N>'` | `'self' 'nonce-<N>'` | `private, no-cache, no-store` |
| Redirección; ruta con extensión (archivos y el 404 interno de Next) | `<ORIGEN>/_next/static/chunks/` | `'self'` | — |

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
- **El 404 interno de Next** (URLs con extensión y el error global) usa estilos
  en línea, que esta CSP no admite: se ve sin estilos. Antes se servía **sin
  ninguna CSP**. Que tenga un diseño propio es la pregunta P-16.
- **Se cede** que un *chunk* propio de Next pueda volver a cargarse sin nonce
  ni hash. Ese código es de Next, no del atacante [Inferencia].
- **Lo que no cubre:** código malicioso que llegue por el build o por una
  dependencia (supply chain), inyección de marcado sin scripts, y exfiltración
  por `img-src` y `connect-src 'self'`.
- **Verificado solo en Chromium**, sin CDN real. Firefox, Safari y el
  comportamiento detrás de un CDN quedan **pendientes** para la 006 (P-17).
  No se presentan como superados.
