# 001 — Tareas

**Estado:** construidas el 2026-11-05. **Revisión visual aprobada por Julio
(2026-11-05):** capturas de escritorio y móvil, selector ES | EN, navegación,
footer, adaptaciones y fidelidad al diseño. **CSP y renderizado:** decisión de Julio
(alternativa C, ADR 006) implementada en la T18 el 2026-11-05 y **aprobada**.
404 y errores propios (P-16, opción B) en la T19. **Cierre pendiente de la
aprobación final de Julio** (T17). Cada tarea se marca solo con su
comprobación ejecutada.

| # | Tarea | Comprobación ejecutada | CA | Estado |
|---|---|---|---|---|
| T1 | Proyecto Next.js 16.4.5 (App Router, TS strict, Tailwind 4, ESLint, `src/`), versiones exactas, `engines`, `.nvmrc`, `.gitignore`, `.env.example` vacío. | `npm run build` y `npm run lint` sin errores | CA-1 | Hecha |
| T2 | `next-intl` 4.14.9 con `proxy.ts` y `pathnames`; TypeScript 5.9.3 (plan §6.2). | `curl`: `/es/trabajo` y `/en/work` → 200; `/es/work` → 307 a `/es/trabajo` | CA-3, CA-4 | Hecha |
| T3 | `tokens.css` copiado de `site.css`; tema Tailwind; fuentes con `next/font`. | `tests/unit/tokens.test.ts` (3 pruebas) | CA-2 | Hecha |
| T4 | Estilos base y primitivas en `src/styles/design.css`. | Página de muestra (desarrollo) → `capturas/07-muestra-sistema-dev.png` | CA-7 | Hecha |
| T5 | `routing.ts`, `navigation.ts`, `request.ts`, `messages.ts`; mensajes `common`, `nav`, `footer`, `pages`. | `tests/unit/messages.test.ts` | CA-6 | Hecha |
| T6 | Resolvedor `resolveAlternate` (equivalente o padre). | `tests/unit/routing.test.ts` | CA-5 | Hecha |
| T7 | Layout `[locale]` con `lang`, «Saltar al contenido», landmarks. | e2e `navigation.spec.ts` + axe | CA-9 | Hecha |
| T8 | `Nav`, `NavLinks`, `MobileMenu` (sin Arquitectura), `LocaleSwitcher`, estado «Taking projects» apagado. | e2e `navigation.spec.ts`, `locale-switcher.spec.ts` | CA-5, CA-8 | Hecha |
| T9 | `Footer` (sin blog, sin LinkedIn/correo). | e2e + medición contra la réplica del diseño | CA-7 | Hecha |
| T10 | Esqueletos de las 9 rutas × 2 idiomas; blog `noindex`; 404 con layout. | e2e `routing.spec.ts`, `quality.spec.ts` | CA-3, CA-4, CA-12 | Hecha |
| T11 | CSP con nonce en `proxy.ts` + encabezados en `next.config.ts`. | e2e `quality.spec.ts` (cabeceras, red, consola) | CA-10, CA-11 | Hecha |
| T12 | Vitest, Playwright (+ axe), script `verify`. | `npm run verify` → código de salida 0 | CA-1 | Hecha |
| T13 | Textos prohibidos («24/7», enlaces al blog). | Unitaria + e2e en las 18 rutas | CA-13 | Hecha |
| T14 | Workflow `.github/workflows/verify.yml` (sin despliegue). | [Ejecución nº 1](https://github.com/Julio-orellana/thisjulio/actions/runs/41955430717) sobre `8616c39`: **success** (verify, audit de producción, e2e) | CA-1 | Hecha |
| T15 | `npm audit`. | Producción: 0 vulnerabilidades. Desarrollo: 8 moderadas en la cadena de ESLint (`minimatch`), no incluidas en el sitio | R6.3 | Hecha |
| T16 | Capturas ES/EN, navegación y responsive; comparación con el diseño. | `capturas/01`–`07` y medición geométrica (abajo) | CA-7 | Hecha; **aprobada por Julio (2026-11-05)** |
| T18 | CSP y renderizado según el ADR 006 (alternativa C, `DECISION-CSP-RENDERING.md` §11): SSG, hashes por página, nonce en lo dinámico, `script-src` limitada a `<origen>/_next/static/chunks/`, `SITE_ORIGIN` validada. | Vitest (50); Playwright P1–P14 (`csp.spec.ts`); mutaciones; capturas píxel a píxel (39/39 idénticas); `evidencia-t18-encabezados.txt`; CI [nº 5](https://github.com/Julio-orellana/thisjulio/actions/runs/41968818289) sobre `71c614c`: **success** | CA-10, CA-11, CA-14 | Hecha; **aprobada por Julio (2026-11-05)** |
| T19 | P-16, opción B: 404 propio bilingüe e integrado (`app/global-not-found.tsx`), error global propio (`app/global-error.tsx`), `dynamicParams = false`, idioma de la URL desde el proxy, precargas por el proxy. | Vitest (53); Playwright 349 superadas, 27 omitidas, 0 fallidas (incluye `not-found.spec.ts`); 2 mutaciones (encabezado de idioma sin sobrescribir; 404 prerenderizado) detectadas; capturas: 37/37 de las páginas existentes idénticas píxel a píxel, el 404 cambia a propósito; `capturas/p16/` (4 anchos × 3 casos y el error global de laboratorio); CI (ver TEST-PLAN §8) | CA-9, CA-10, CA-11, CA-14, CA-15 | Hecha; **pendiente de aprobación final** |
| T17 | Cierre: CA con evidencia, documentación actualizada. | Revisión de Julio | — | **Pendiente**: visual y T18 aprobadas; T19 (P-16) hecha y verificada; falta la aprobación final de Julio |

## Estado de los criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA-1 | Cumplido | `SITE_ORIGIN=http://localhost:3100 npm run verify` (lint, tipos, 50 unitarias, build y manifiesto de CSP) sale con 0 |
| CA-2 | Cumplido | `tokens.test.ts`: 48 variables idénticas; huella `aac3072a2970729a` |
| CA-3 | Cumplido | `/` → 307 `/es` con `Accept-Language` es, en y fr; `lang` correcto en 18 rutas; sin `Set-Cookie` |
| CA-4 | Cumplido | 18 rutas → 200; slugs del otro idioma → 307 a la ruta correcta |
| CA-5 | Cumplido | Ida y vuelta ES⇄EN en las 9 rutas; resolvedor probado con slug traducido y sin traducción |
| CA-6 | Cumplido | `messages.test.ts` |
| CA-7 | Cumplido en medición; **aprobado por Julio (2026-11-05)** | Ver abajo y `capturas/` |
| CA-8 | Cumplido | Enter abre, Tab entra en la hoja, Escape cierra y devuelve el foco; sin Arquitectura |
| CA-9 | Cumplido | axe sin violaciones serias o críticas en 18 rutas × 2 anchos y con el menú abierto |
| CA-10 | Cumplido (T18) | Estáticas con los hashes de su HTML; dinámicas con nonce distinto por respuesta; redirecciones y rutas con extensión sin hashes. Ninguna con `'self'`, `'strict-dynamic'` ni `unsafe-*`. Más HSTS, `nosniff`, Referrer-Policy, Permissions-Policy y sin `X-Powered-By` (`evidencia-t18-encabezados.txt`) |
| CA-11 | Cumplido (T18) | 0 peticiones a otros orígenes, 0 errores o avisos de consola y 0 violaciones de CSP en 18 rutas × 2 anchos; todos los scripts bajo `/_next/static/chunks/` |
| CA-12 | Cumplido | `noindex` en `/es/blog` y `/en/blog`; ningún enlace al blog |
| CA-13 | Cumplido | Sin «24/7» ni enlaces al blog en 18 rutas |
| CA-15 | Cumplido (T19) | 404 en `/es/no-existe`, `/en/no-existe`, `/es/a/b/c`, `/es/foto.png`, `/en/foto.png` y `/foto.png`: status 404, `no-store`, HTML renderizado en el servidor (sin JavaScript se lee igual), idioma de la URL o los dos, Nav y Footer del sitio, nonce en cada script en línea, sin estilos ni manejadores en línea, axe sin violaciones serias, «Volver al inicio» y «Regresar» probados. Sin desborde horizontal en 1440, 1024, 768 y 390. Error global: medido en laboratorio (ruta de prueba no incluida) |
| CA-14 | Cumplido (T18), **solo Chromium y sin CDN** | P1–P14: 295 e2e superadas y 0 fallidas. Las mutaciones (`'self'`, `'strict-dynamic'`, origen desde `Host`, manifiesto viejo o ausente, otra versión de Next, chunk fuera de la ruta, script en línea nuevo) hacen fallar las pruebas o el build. Capturas antes y después idénticas píxel a píxel (39/39). Firefox, Safari y CDN, pendientes (P-17) |

### Medición contra el diseño (CA-7)

Réplica estática del marcado de `Nav.dc.html`, `MobileMenu.dc.html` y
`Footer.dc.html` con el `site.css` original y las mismas fuentes de Google,
comparada con `/en` por posición, tamaño, familia, cuerpo, peso y color de
cada elemento, a 1440 y 390 px:

- **Idénticos:** altura de la barra (76/64 px), marca, CTA, botón Menú/Cerrar,
  título, marca del footer, copyright, enlaces legales y enlaces de la hoja
  móvil.
- **Diferencias, todas previstas:** enlaces centrales desplazados 31 px
  (cambia el ancho de la zona derecha: sin «Taking projects», D-09, y con el
  selector, D-05); columnas del footer desplazadas 42 px y la tercera más
  estrecha (sin LinkedIn ni correo, D-12); «Architecture» en lugar de
  «Technology» (D-06); hoja móvil sin Technology (D-04), con el CTA al pie
  porque falta el estado (D-09).

## Fuera de esta feature

Contenido de páginas (002), escena 3D (003), formularios (004), blog (005),
SEO y despliegue (006).
