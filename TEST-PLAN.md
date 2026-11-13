# Plan de pruebas — thisjulio.com

> **Ubicación principal** de la estrategia de verificación. Cada feature
> enumera sus criterios de aceptación en su `spec.md` y los vincula a los
> niveles de este plan. Regla: **ningún resultado se declara sin haberlo
> ejecutado**; lo no ejecutado se reporta como no ejecutado.

## 1. Niveles

| Nivel | Herramienta | Qué cubre | Cuándo |
|---|---|---|---|
| Estático | ESLint, `tsc --noEmit` | Tipos, reglas, imports prohibidos (p. ej. componentes de cliente innecesarios) | Cada commit (CI) |
| Contenido | Zod en build | Entradas completas, slugs únicos, ambos idiomas, solo `approved` publicado | Build |
| i18n | Vitest + tipos de mensajes | Claves iguales en `es` y `en`; tabla de rutas recíproca; selector → equivalente o padre | Cada commit |
| Unitario | Vitest | Utilidades, cálculo del estimador, esquemas de formularios, generación de metadatos y alternates | Cada commit |
| Extremo a extremo | Playwright (Chromium preinstalado) | Navegación, redirección `/` → `/es`, selector de idioma, formularios, servicios (posición bajo el encabezado) | Por feature |
| Accesibilidad | `@axe-core/playwright` + revisión manual de teclado | WCAG 2.2 AA: contraste, foco visible, orden, nombres accesibles, `lang` | Por feature |
| Visual | Capturas Playwright vs. réplica estática del marcado del artboard con el `site.css` original (el artefacto no se puede renderizar fuera de Claude Design) + medición de geometría y estilos | Fidelidad a 1440 px y 390 px | Por página |
| Seguridad | `npm audit`, prueba de encabezados, pruebas de formularios con entradas maliciosas | CSP, HSTS, validación en servidor, antiabuso | 001 (base), 004, 006 |
| Rendimiento | Lighthouse (Chromium preinstalado) | LCP, CLS, INP en páginas sin 3D y con 3D diferida | 006 |

## 2. Fidelidad visual contra el diseño aprobado

1. Fuente: artefacto versión `1793843453-74ee`; se verifica la huella de
   `site.css` y del artboard antes de comparar
   (`docs/design/REFERENCIA-DISENO.md` §2).
2. Se renderiza el artboard y la página implementada al mismo ancho (1440 y
   390), mismo idioma (`en`, porque el diseño está en inglés), fuentes
   cargadas, animaciones detenidas.
3. Se comparan: jerarquía, tipografía, colores (tokens exactos), espaciado,
   recortes, estados (hover, foco, seleccionado).
4. Diferencias admitidas: las listadas en §5 de la referencia del diseño
   (D-01…D-13) y ajustes de antialiasing. Cualquier otra se corrige o se
   documenta para aprobación.
5. En español se comprueba además que ningún texto desborde ni se recorte
   (los textos en español suelen ser más largos).

## 3. Internacionalización

- Cada ruta de la tabla de `ARCHITECTURE.md` §3 responde en ambos idiomas.
- `/` redirige a `/es`; rutas sin prefijo no generan contenido duplicado.
- El selector en cada página lleva a la equivalente; sin traducción, al
  padre.
- `<html lang>` correcto; ningún texto visible en el idioma equivocado
  (búsqueda de claves faltantes y de cadenas en duro).

## 4. Formularios (feature 004)

Entradas vacías, demasiado largas, con HTML/JS, con saltos de línea en
campos de cabecera, correo inválido, honeypot lleno, envío demasiado rápido,
método o `Content-Type` incorrectos, origen cruzado. Resultado esperado:
rechazo genérico, sin envío y sin registro del contenido.

## 5. Escena 3D (feature 003)

Pruebas funcionales, no de rendimiento: arranque diferido (no se crea
contexto WebGL hasta entrar en viewport), pausa fuera de pantalla, cuadro
fijo con `reduced-motion`, respaldo con WebGL deshabilitado y con pérdida
de contexto simulada (`WEBGL_lose_context`), liberación de recursos al
desmontar (sin contextos acumulados al navegar), etiquetas DOM operables con
teclado y localizadas, sin errores de consola.

## 6. Medición de GPU real (independiente, P-12)

No bloquea ninguna feature. Cuando Julio lo decida: dispositivos de
referencia (escritorio con GPU dedicada, portátil integrada, teléfono
gama media), perfil de calidad elegido, resolución efectiva
(`canvas.dataset.quality`) y costo por cuadro (`canvas.dataset.ms`), que el
motor ya expone.

## 7. Fuera de alcance

Pruebas del sistema POS (otro repositorio, otro producto). Pruebas de carga.

## 8. Registro de verificaciones ejecutadas

| Fecha | Fase / feature | Verificación | Resultado |
|---|---|---|---|
| 2026-11-05 | Fase 1 | Inspección del repositorio `thisjulio` (`git status`, `ls-remote`, listado) | Vacío: sin commits ni archivos; remoto sin ramas |
| 2026-11-05 | Fase 1 | Lectura de los 26 archivos `project/` del artefacto de diseño y cálculo de SHA-256 | Accesible; huellas en `docs/design/REFERENCIA-DISENO.md` |
| 2026-11-05 | Fase 1 | Revisión de solo lectura de `sistema-pos` (README, package.json, electron-builder.yml, roadmap §1, estructura) | Ver `docs/portafolio/caso-pos.md`. **Sin ejecutar pruebas** |
| 2026-11-05 | Fase 1 | Consulta al registro npm de versiones y `peerDependencies` de `next-intl` | `next-intl@4.14.9` acepta `next ^16`; `next@16.4.5` exige Node ≥ 20.9 |

| 2026-11-05 | Feature 001 | `npm run verify` (ESLint, `next typegen` + `tsc`, Vitest, `next build`) | Código de salida 0; 16/16 pruebas unitarias |
| 2026-11-05 | Feature 001 | `npx playwright test` contra el build de producción, proyectos `desktop` (1440×900) y `mobile` (390×844) | 187 superadas, 5 omitidas a propósito (pruebas de un solo ancho), 0 fallidas |
| 2026-11-05 | Feature 001 | `npm audit --omit=dev` / `npm audit` | Producción: 0. Desarrollo: 8 moderadas (cadena de ESLint, `minimatch`) |
| 2026-11-05 | Feature 001 | Medición geométrica y de estilos contra la réplica de `Nav`/`MobileMenu`/`Footer` del diseño (1440 y 390) | Idénticos salvo D-04, D-05, D-06, D-09, D-12 (detalle en `tasks.md` de la 001) |
| 2026-11-05 | Feature 001 | `next dev` + `/es/sistema` | 200, sin errores de consola tras ajustar la CSP de desarrollo (plan 001 §6.4) |
| 2026-11-05 | P-14 (CSP/renderizado) | Copia aislada en el scratchpad (repositorio sin tocar): build SSG con SRI experimental y seis variantes de `script-src` en Chromium, 390 y 1440 px | `'self'` solo y `strict-dynamic` + hashes: no hidrata. `'unsafe-inline'` y hashes exactos por página: 0 errores. Hashes de otra página: no hidrata. Detalle en `docs/architecture/DECISION-CSP-RENDERING.md`, anexo A |
| 2026-11-05 | P-14 (alcance de `script-src`) | Copias aisladas (SSG sin y con SRI) detrás de un frente HTTPS local para `thisjulio.com`; ocho variantes de `script-src` en Chromium 153: 18 rutas × 2 anchos, menú móvil, navegación de cliente, idioma e inyecciones negativas; build actual comparado con nonce | `'self'`, `/_next/static/`, `/_next/static/chunks/`, sin esquema y lista exacta: 36/36. Solo ruta sin host, y solo hashes con `integrity` (con o sin `strict-dynamic`): 0/36. La ruta bloquea JS del mismo origen fuera del build (también con `..`, `%2e%2e`, `\` y 308); `'self'` no. `strict-dynamic` deja pasar scripts creados por un script confiable; la ruta no. Detalle: §10 y anexo B |
| 2026-11-05 | Feature 001 · T18 | `SITE_ORIGIN=http://localhost:3100 npm run verify` | Código 0: lint, tipos, 50/50 unitarias, build y manifiesto de CSP (18 rutas) |
| 2026-11-05 | Feature 001 · T18 | `npx playwright test` (desktop 1440 y mobile 390), con `csp.spec.ts` P1–P14 | 295 superadas, 27 omitidas a propósito, 0 fallidas. **Solo Chromium**; Firefox, Safari y CDN pendientes (P-17) |
| 2026-11-05 | Feature 001 · T18 | Mutaciones: `'self'`, `strict-dynamic`, origen desde `Host`, hash viejo, manifiesto ausente, otra versión de Next, chunk fuera de la ruta, script en línea nuevo | Cada una hace fallar las pruebas o el build (detalle: `DECISION-CSP-RENDERING.md` §12) |
| 2026-11-05 | Feature 001 · T18 · P9 | 39 capturas de página completa antes y después del cambio, comparadas píxel a píxel | 39/39 idénticas |
| 2026-11-05 | Feature 001 · T18 | `npm audit --omit=dev` / `npm audit` | Producción: 0. Desarrollo: 8 moderadas (sin cambios) |
| 2026-11-05 | Feature 001 · T18 | GitHub Actions [ejecución nº 5](https://github.com/Julio-orellana/thisjulio/actions/runs/41968818289) sobre `71c614c` (con `SITE_ORIGIN=http://localhost:3100`) | **success**: verify, audit de producción y e2e |
| 2026-11-05 | Feature 001 · T19 (P-16) | Diagnóstico previo sobre el build de la T18 | `/foto.png`: carcasa de error de Next con el cuerpo vacío y scripts bloqueados (página en blanco). `/es/no-existe`: misma carcasa, completada en el cliente. El patrón `app/layout.tsx` + `app/not-found.tsx` no lo corrige (medido) |
| 2026-11-05 | Feature 001 · T19 (P-16) | `SITE_ORIGIN=http://localhost:3100 npm run verify` | Código 0: lint, tipos, 53/53 unitarias, build y manifiesto de CSP (18 rutas) |
| 2026-11-05 | Feature 001 · T19 (P-16) | `npx playwright test` (desktop 1440 y mobile 390), con `not-found.spec.ts` nuevo | 349 superadas, 27 omitidas a propósito, 0 fallidas. **Solo Chromium** (P-17) |
| 2026-11-05 | Feature 001 · T19 (P-16) | Mutaciones: el proxy no borra el encabezado de idioma; el 404 deja de leer el encabezado y sale prerenderizado | La primera hace fallar la prueba de suplantación; la segunda hace fallar el build (`DYNAMIC_ONLY_ROUTES`) |
| 2026-11-05 | Feature 001 · T19 (P-16) | 39 capturas de página completa contra las de la T18 | 37/37 de las páginas existentes idénticas; solo cambia `/es/no-existe` (el 404, a propósito). 404 sin desborde horizontal en 1440, 1024, 768 y 390 |
| 2026-11-05 | Feature 001 · T19 (P-16) | Error global en una copia de laboratorio con dos rutas de prueba (error en el servidor y en el cliente), retiradas antes del commit | 500 con nonce; `global-error.tsx` pinta la página bilingüe sin violaciones de CSP; «Reintentar» presente |
| 2026-11-05 | Feature 001 · T19 (P-16) | `npm audit --omit=dev` / `npm audit` | Producción: 0. Desarrollo: 8 moderadas (sin cambios) |
| 2026-11-05 | Feature 001 · T19 (P-16) | GitHub Actions [ejecución nº 7](https://github.com/Julio-orellana/thisjulio/actions/runs/41972899454) sobre `0e3e972` | **success**: verify, audit de producción y e2e |
| 2026-11-05 | Feature 001 · T17 (cierre) | Aprobación final de Julio; comprobación de `sistema-pos` (`git status`, `git log`, `git reflog`, `git stash list`) | Feature 001 cerrada. `sistema-pos` intacto: limpio en `develop` (`ced39d4`), sin stash, reflog solo con el clon |
| 2026-11-05 | Feature 002 · planificación | Lectura del artefacto de diseño (`Main`, `Work`, `CaseStudy`, `Services`, `About`, `Legal`, `Plates`, `Deploy`) y comparación de SHA-256 con `REFERENCIA-DISENO.md` §2 | Las 8 huellas (SHA-256 que informó la lectura del artefacto, versión `1793843453-74ee`) coinciden con las registradas |
| 2026-11-05 | Feature 002 · planificación | Inspección del repositorio: rama, `HEAD`, `git status`, rutas y esqueletos, `grep` de `style=` y `localStorage` | `claude/admiring-babbage-bjvbo8` en `9ce2401`, limpio; `claude/gifted-keller-x03g4c` no existe. Solo documentos modificados; sin código |
| 2026-11-05 | Feature 002 · planificación | `npm ci` y `SITE_ORIGIN=http://localhost:3100 npm run verify` con solo documentos modificados; revisión de referencias a archivos y de columnas de tablas en `spec/features/002-…` | `verify` código 0 (lint, tipos, unitarias, build y manifiesto de 18 rutas). Referencias válidas salvo `src/content/schema.ts` y `src/lib/content/index.ts`, que son archivos futuros. No se ejecutó Playwright: no hay código nuevo |
| 2026-11-05 | Feature 002 · decisiones | Integración de rama: `git merge-base --is-ancestor`, push sin force de `9e3ef84` a `claude/gifted-keller-x03g4c` (fast-forward `9883c52..9e3ef84`); registro de P-18 a P-23 y alcance de R1 en `spec/features/002-…`; `verify` previo al commit | Ver el commit siguiente; solo documentos |
| 2026-11-12 | Feature 002 · R1 · T1 (preflight) | Rama `claude/admiring-babbage-bjvbo8` en `216f9f0` (clon nuevo), `git status`; SHA-256 de `Main`, `Work`, `CaseStudy`, `Services`, `About`, `Legal`, `Plates`, `Deploy` y `site.css` leídos del artefacto y recalculados con `shasum -a 256`; `npm ci`; `SITE_ORIGIN=http://localhost:3100 npm run verify` | Árbol versionado limpio (solo `Flyer.png` sin seguimiento, ajeno al repositorio y no se versiona). Las 9 huellas coinciden con `REFERENCIA-DISENO.md` §2. **El artefacto informa ahora la versión `1794534219-8ae2`** (antes `1793843453-74ee`): los archivos usados por la 002 no cambiaron. `verify` código 0: lint, tipos, 53/53 unitarias, build y manifiesto de 18 rutas |
| 2026-11-12 | Feature 002 · R1 · T2–T5 | `SITE_ORIGIN=http://localhost:3100 npm run verify` antes de cada commit (`27b7426`, `d5ec32c`, `d393bc8`, `bc7004c`) | Código 0 en los cuatro; 100 → 121 → 124 → 124 unitarias; manifiesto de 18 rutas |
| 2026-11-12 | Feature 002 · R1 · T2 | `npm install --save-exact zod@4.6.7`; `npm audit --omit=dev` | Solo `zod` añadido; 0 vulnerabilidades de producción |
| 2026-11-12 | Feature 002 · R1 · T2–T4 | Mutaciones: quitar la regla «approved sin fuente», «24/7» en un servicio, «Monitoring» en un mensaje, un valor cambiado en `design.css` | Cada una hace fallar su prueba |
| 2026-11-12 | Feature 002 · R1 · T5 | Primitivas de `/es/sistema` (`next dev`) contra una réplica estática con `site.css` y las mismas fuentes, 1440 y 390; axe | 7 bloques × 2 anchos: 0 diferencias de caja y estilo computado, 0 píxeles distintos; axe 0 violaciones |
| 2026-11-12 | Feature 002 · R1 · T6a | `Plates` A/B en copias aisladas (scratchpad): 70 vistas × 1440/390 × reposo/hover contra la réplica del diseño; densidad 2× para M1; build, `csp-scan`, manifiesto, `csp.spec.ts` y violaciones de CSP en cada copia | A: 140/140 y 28/28 idénticas. B (B3): 20/140 idénticas, 1,03 % de píxeles distintos. Ambas: build y manifiesto en verde, `csp.spec.ts` 118 superadas / 22 omitidas / 0 fallidas, 0 violaciones. Detalle: `spec/features/002-…/evidencia-t6-plates.md` |
| 2026-11-12 | Feature 002 · R1 | `npm run test:e2e` (desktop 1440 y mobile 390) sobre `bc7004c` | 349 superadas, 27 omitidas a propósito, 0 fallidas. **Solo Chromium** (P-17) |
| 2026-11-12 | Feature 002 · R2 · T6b | `Plates` (opción A) en `/es/sistema/plates` (`next dev`) contra la réplica del diseño: 25 vistas × 1440/390 × reposo/hover, a 1× y 2× | 100/100 y 100/100 capturas idénticas; 0 `style` en las vistas |
| 2026-11-12 | Feature 002 · R2 · T7 | `Deploy` en `/sistema` contra la réplica de `Deploy.dc.html` (1440, 1040, 390); rótulos ES medidos con `getBBox`; axe ES/EN | EN idéntico; «SERVIDOR LOCAL» sobresalía 8,6 u → «SERV. LOCAL»; axe 0 |
| 2026-11-12 | Feature 002 · R2 · T8 | `services.spec.ts` ×3 (`--repeat-each=3`); mutación sin desplazamiento de la isla | 276 superadas, 30 omitidas, 0 fallidas, 0 inestables; la mutación hace fallar 6 pruebas de geometría |
| 2026-11-12 | Feature 002 · R2 · T8 | `/en/services` contra una réplica de `Services.dc.html` (01) a 1440 y 390 | Cajas idénticas en 6 secciones; píxeles idénticos salvo las pestañas 05/07 (D-02, D-03). Detectada y corregida la negrita de los títulos `.mono` (preflight de Tailwind) |
| 2026-11-12 | Feature 002 · R2 | `SITE_ORIGIN=http://localhost:3100 npm run verify`; `npm run test:e2e`; `npm audit --omit=dev` | Código 0, 156/156 unitarias, manifiesto de 32 rutas; e2e 497 superadas, 37 omitidas a propósito, 0 fallidas (solo Chromium, P-17); audit 0 |
| 2026-11-12 | Feature 002 · R3 · T9 | JavaScript de `/es/trabajo` frente a `/es/acerca-de` en el build; filtro con datos de prueba en `/es/sistema/trabajo` (`next dev`), 1440 y 390 | Sin isla: mismos 10 scripts y bytes. Con la isla importada sin pintar: +4,9 KB (+8,1 KB con `next/dynamic`), por eso no se conecta. Filtro: 10/10 comprobaciones (aria-pressed, contador, flip, Enter/Espacio, axe 0) |
| 2026-11-12 | Feature 002 · R3 | Corrección de `global-error.tsx` (solo `common`) | JavaScript por página −14 313 B (645 824 → 631 511 B en `/es/acerca-de`) |
| 2026-11-12 | Feature 002 · R3 · T10 | `work.spec.ts` + `csp.spec.ts` (34 rutas); auditoría «afirmación → fuente» del caso POS (`tasks.md`) | 211 superadas, 23 omitidas, 0 fallidas; cada texto del caso con fuente en `caso-pos.md` |
| 2026-11-12 | Feature 002 · R3 | `SITE_ORIGIN=http://localhost:3100 npm run verify`; `npm run test:e2e`; `npm audit --omit=dev` | Código 0, 160/160 unitarias, manifiesto de 34 rutas; e2e 534 superadas, 38 omitidas a propósito, 0 fallidas (solo Chromium, P-17); audit 0 |
| 2026-11-12 | Feature 002 · R4 · T11–T13 | Fidelidad de CSS: el `<main>` de cada página, devuelto a la forma del diseño (clases `[app]` y de `Plates` → estilos en línea), pintado solo con `site.css`; 1440 y 390 | Inicio, Acerca de y Legal (ES, EN), Servicios, Trabajo y caso (EN): 0 píxeles distintos salvo la fila de 1 px del borde del pie |
| 2026-11-12 | Feature 002 · R4 | `pages.spec.ts` (×2); rótulos del selector de capas medidos | 76 superadas en 2 pasadas, 0 fallidas; «Todo» (≈32 px en 30 px) → «1–4» |
| 2026-11-12 | Feature 002 · R4 | `SITE_ORIGIN=http://localhost:3100 npm run verify`; `npm run test:e2e`; `npm audit --omit=dev` | Código 0, 161/161 unitarias, manifiesto de 34 rutas; e2e 575 superadas, 39 omitidas a propósito, 0 fallidas (solo Chromium, P-17); audit 0 |
| 2026-11-12 | Feature 002 · R5 · T14 | `npm run test:e2e` con `quality`, `routing`, `csp` y `transversal.spec.ts` sobre las 34 rutas | 840 superadas, 40 omitidas a propósito, 0 fallidas (solo Chromium, P-17) |
| 2026-11-12 | Feature 002 · R5 · T14 | Mutaciones: marcador `[Confirm stack]` en un servicio; `style={{…}}` en Acerca de; slug duplicado; `headers()` en Acerca de | Vitest (3 archivos) y build fallan; build falla (manifiesto: `style=` en `/en/about`); Vitest y build fallan; build pasa con 32 rutas y P1 falla. Todo restaurado |
| 2026-11-12 | Feature 002 · R5 · T15 | Réplicas de `Main`, `Work`, `CaseStudy` (POS), `Services`, `About`, `Legal` contra la app EN/ES a 1440 y 390; alto por sección | Diferencias clasificadas en `spec/features/002-…/evidencia-t15-fidelidad.md` §3: todas aprobadas o corregidas, salvo una de texto para revisión |
| 2026-11-12 | Feature 002 · ▲A4 | Tarjeta única de Inicio: `work.test.ts` y `pages.spec.ts` (1 proyecto → ancho completo en ES y EN; datos de prueba de 3 → 3 columnas en escritorio, 1 en móvil) | Superadas (18 pruebas de Inicio en desktop y mobile) |
| 2026-11-12 | Feature 002 · T16 | Flujo `verify.yml` reproducido en una copia limpia de `75bb37a` (`npm ci`, verify, audit de producción `--audit-level=high`, e2e) | verify 0 (161/161, 34 rutas); audit 0; e2e 840 superadas, 40 omitidas, 0 fallidas |
| 2026-11-12 | Feature 002 · T16 | `SITE_ORIGIN=http://localhost:3100 npm run verify`; `npm run test:e2e`; `npm audit --omit=dev` / `npm audit` (con el ajuste de ▲A4) | Código 0, 162/162 unitarias, manifiesto de 34 rutas; e2e 844 superadas, 40 omitidas a propósito, 0 fallidas (solo Chromium, P-17); producción 0; desarrollo 8 moderadas (cadena de ESLint, `minimatch`; sin cambios desde la 001) |
| 2026-11-12 | Feature 002 · T16 | Push sin force de `216f9f0..75bb37a` a `claude/admiring-babbage-bjvbo8`; GitHub Actions | [Ejecución 43364128117](https://github.com/Julio-orellana/thisjulio/actions/runs/43364128117) sobre `75bb37a`: **success** (verify, audit de producción y e2e) |
| 2026-11-12 | Feature 002 · T16 | Integridad de `sistema-pos` (solo lectura: `git ls-remote`) | `develop` sigue en `ced39d4`; no se abrió ni modificó durante la 002 |
| 2026-11-12 | Feature 002 · corrección | CI del PR #1 sobre `9d8d850` ([43366239473](https://github.com/Julio-orellana/thisjulio/actions/runs/43366239473)): falla `legal-date.test.ts` (clon superficial: la fusión del PR, fechada 2026-11-13, aparenta ser el último cambio de `legal.ts`). Arreglo: la prueba se omite en clones superficiales y la CI usa `fetch-depth: 0`. Simulación local: clon completo con fusión fechada 2026-11-13 → `git log` da 2026-11-12, la prueba pasa; clon superficial → se omite | Ver la corrida del commit de la corrección en el registro siguiente |

Fase 1: no se ejecutaron pruebas de aplicación porque no existía código.
