# T6a — `Plates` sin `style=`: comparación A/B

**Fecha:** 2026-11-12. **Rama:** `claude/admiring-babbage-bjvbo8`, sobre `bc7004c` (T5).
**Estado:** comparación terminada. **No se elige ninguna opción.** La técnica
definitiva la decide Julio en **▲A1** (P-23). La CSP, `scripts/csp-manifest.mjs`,
`scripts/lib/csp-scan.mjs` y `next.config.ts` **no se tocaron**.

El código de A y de B vive en dos copias aisladas **fuera del repositorio**
(scratchpad de la sesión, ver §2.4). En el repositorio solo entran este informe
y las capturas de `capturas/t6a-*`.

## 1. Qué se compara

El diseño (`Plates.dc.html`, huella `e960511d1b7f2c7d`, sin cambios) pinta cada
bloque con `style="--x: …%; --y: …%; --w: …%; --h: …%"` y cada placa con
`style="--i: …"`. La CSP (ADR 006) prohíbe `style=`. Las opciones son las del
`plan.md` §1.4:

| Opción | Técnica implementada |
|---|---|
| **A. CSS generado** | Un script recorre los datos de `Plates` y escribe una hoja con **una clase por valor distinto** (`.bx-6 { --x: 6%; }`, `.by-48_800000000000004 { --y: 48.800000000000004%; }`…) más `.i-0….i-3`. El marcado pone las clases en lugar del `style`. Las reglas `.blk`, `.plate`, `.pin` de `site.css` se usan **tal cual**. |
| **B. SVG con atributos** | Los bloques de cada placa son `<rect>` de un `<svg>` (atributos de presentación `x`, `y`, `width`, `height`; la CSP no los limita). La profundidad (`--i`) y los 4 pines usan 8 clases fijas. |

Para darle a B su mejor resultado se midieron tres variantes:

| Variante | Detalle |
|---|---|
| B1 | Literal del plan: `viewBox="0 0 100 100"`, `preserveAspectRatio="none"`, contorno con `vector-effect: non-scaling-stroke`. |
| B2 | Coordenadas en `%` sin `viewBox`; contorno interior exacto de 1 px (trazo de 2 px recortado por un `<svg>` anidado, equivalente a `outline-offset: -1px`). |
| **B3** | B2 + `shape-rendering: crispEdges` en los `<rect>`. **Es la que mejor resultado dio y la que se integró en la copia de la app** como «opción B». |

C (clases escritas a mano) no se midió: es A sin el script y queda como
respaldo del plan.

## 2. Método

### 2.1 Réplica del diseño (referencia)

Página estática con `docs/design/fuente/site.css` (huella `aac3072a2970729a`) y el
marcado **literal** de `Plates.dc.html`, con sus `style=`. Los datos se portaron
línea por línea de `renderVals()` (`plates-data.mjs`), con la misma aritmética:
salen los mismos decimales de coma flotante que en el diseño (p. ej.
`48.800000000000004`). 225 bloques, **201 valores distintos**.

Las fuentes son los mismos `woff2` que sirve la app (`next/font`), declarados con
los mismos nombres de familia que usa `site.css`: ref, A y B pintan el texto
(rótulos de `stack`) con archivos idénticos.

### 2.2 Matriz de vistas (70 por variante y ancho)

| Grupo | Vistas | Estados |
|---|---|---|
| **M1 (lo que pide la tarea)** | 7 vistas `wide` (`site`, `dash`, `inst`, `pos`, `saas`, `api`, `stack`) dentro de `.gal-item.hover-depth > .gal-view.proj-view`, como en `Work.dc.html` | reposo y hover |
| M2 · `default` (4:3) | las 7 | reposo y hover |
| M2 · `tall` (1:1) | las 7 | reposo y hover |
| M2 · `flat` | 6 vistas × capa 0–3 (24), dentro de `.shot > .shot-body`, como en `CaseStudy.dc.html` | reposo |
| M2 · `stack` + `active` | `active` 0–3 (4) | reposo |

Cada variante × ancho (1440×900 y 390×844, densidad 1) = **140 capturas**. Se
compara cada captura de A o B con la de la réplica, píxel a píxel (diferencia
máxima por canal RGB). Las animaciones se fijan con `prefers-reduced-motion:
reduce`, que en `site.css` solo acorta las transiciones a 1 ms: se mide el
estado final del hover, no el intermedio.

### 2.3 Dentro de la app, con la CSP real

Dos copias del repositorio en `bc7004c` (`git archive`), una por opción. En cada
una: `Plates` como Server Component, las reglas de `Plates` de `site.css`
(177–198, 317–319, 331, 336–347) en `design.css`, y `/es/trabajo` y `/en/work`
reemplazadas por la misma matriz de 70 vistas. En A, `npm run build` ejecuta
antes `node scripts/plates-css.mjs` (genera la hoja; no toca
`scripts/csp-manifest.mjs`). Sobre cada copia: lint, tipos, Vitest, `next build`
(con `csp-scan` y el manifiesto), `csp.spec.ts` (P1–P14) y una sesión de
Chromium contra `next start` que registra violaciones de CSP
(`securitypolicyviolation`), errores de consola y atributos `style`, y captura
las 140 vistas. Las capturas de la app se comparan con la réplica tras igualar
la posición subpíxel (desplazamiento medido: 0 px en ambos anchos).

### 2.4 Reproducción

Herramientas en el scratchpad de la sesión (no versionadas):
`t6a/lib/{plates-data,render,build-harness,capture,app-check}.mjs`,
`diff.py`, `diff3.py`; copias en `t6a/app-A` y `t6a/app-B`. Chromium de
Playwright 1.63.0, macOS, sin GPU dedicada.

## 3. Resultados píxel a píxel (réplica estática)

### 3.1 Resumen (140 capturas por variante: 70 vistas × 1440 y 390)

| Variante | Capturas idénticas | Píxeles distintos | Distintos > 16/255 | Distintos > 64/255 | Diferencia máx. |
|---|---|---|---|---|---|
| **A** | **140 / 140** | **0 %** | 0 % | 0 % | 0 |
| B1 | 20 / 140 | 1,7001 % | 0,4640 % | 0,0291 % | 224 |
| B2 | 20 / 140 | 1,6672 % | 0,2949 % | 0,0200 % | 193 |
| **B3** | 20 / 140 | **1,0336 %** | 0,2251 % | 0,0121 % | 220 |

Las 20 capturas idénticas de B son las de `stack`, que no tiene bloques (solo
placas, rótulos y pines, que B pinta igual que el diseño). **Toda vista con
bloques difiere en B.**

### 3.2 M1 — las 7 vistas `wide`, en la app con su CSP (% de píxeles distintos frente a la réplica)

| Vista | A · 1440 reposo / hover | A · 390 reposo / hover | B · 1440 reposo / hover | B · 390 reposo / hover |
|---|---|---|---|---|
| site | 0,00 / 0,00 | 0,00 / 0,00 | 0,92 / 1,00 | 2,34 / 2,74 |
| dash | 0,00 / 0,00 | 0,00 / 0,00 | 1,09 / 1,19 | 2,27 / 2,68 |
| inst | 0,00 / 0,00 | 0,00 / 0,00 | 1,24 / 1,39 | 2,91 / 3,19 |
| pos | 0,00 / 0,00 | 0,00 / 0,00 | 0,97 / 0,99 | 2,59 / 2,96 |
| saas | 0,00 / 0,00 | 0,00 / 0,00 | 1,57 / 1,70 | 3,49 / 4,18 |
| api | 0,00 / 0,00 | 0,00 / 0,00 | 1,42 / 1,56 | 3,75 / 4,19 |
| stack | 0,00 / 0,00 | 0,00 / 0,00 | 0,00 / 0,00 | 0,00 / 0,00 |

### 3.3 B3 por grupo (A: 0 % en todos)

| Grupo | 1440 reposo | 1440 hover | 390 reposo | 390 hover |
|---|---|---|---|---|
| `wide` | 1,031 % | 1,118 % | 2,477 % | 2,847 % |
| `default` | 1,507 % | 1,519 % | 2,688 % | 3,008 % |
| `tall` | 1,284 % | 1,141 % | 2,290 % | 2,284 % |
| `flat` (sin 3D) | 0,589 % | — | 1,721 % | — |
| `stack` + `active` | 0 % | — | 0 % | — |

### 3.4 Densidad 2× (pantallas retina), solo M1 (28 capturas)

| Variante | Idénticas | Píxeles distintos | > 16/255 | Máx. |
|---|---|---|---|---|
| A | 28 / 28 | 0 % | 0 % | 0 |
| B3 | 4 / 28 (las de `stack`) | 0,8346 % | 0,0887 % | 138 |

### 3.5 Qué son las diferencias de B

Bordes de bloque desplazados **hasta 1 px** y antialias distinto: el diseño
posiciona `div` con `left/top/width/height` en %, que el motor de CSS ajusta a
píxeles al pintar; el SVG rasteriza el `<rect>` con sus coordenadas exactas.
Visualmente las vistas se ven iguales a tamaño normal; la diferencia aparece en
la ampliación (`capturas/t6a-plates-b-detalle.png`, ×4: un borde entre dos
bloques cae una fila más arriba). Es mayor a 390 px porque cada bloque mide
menos píxeles y un píxel pesa más. `crispEdges` (B3) la reduce pero no la
elimina.

Capturas: `capturas/t6a-plates-wide-{1440,390}-{reposo,hover}.png` (réplica |
A | B | diferencia de A ×4 | diferencia de B ×4, con el % de píxeles distintos
en el rótulo) y `capturas/t6a-plates-b-detalle.png`.

## 4. Resultados con la CSP real (copias aisladas de la app)

| Comprobación | Opción A | Opción B (B3) |
|---|---|---|
| ESLint | 0 errores | 0 errores |
| `npm run typecheck` | código 0 | código 0 |
| Vitest | 123 / 124 · falla solo `design-css.test.ts` «no hay estilos de Plates … antes de su tarea (T6b, T7)», **a propósito**: la guarda de T4 detecta las reglas de `Plates` añadidas en la copia | igual: 123 / 124, misma guarda |
| `next build` + `csp-scan` + manifiesto | código 0; **18 rutas** con CSP de hashes; `/es/trabajo` y `/en/work` con 49 vistas `Plates` cada una | código 0; 18 rutas; ídem |
| `style=` en el HTML del servidor | **0** | **0** |
| `csp.spec.ts` (P1–P14, desktop y mobile) | **118 superadas, 22 omitidas a propósito, 0 fallidas** | **118 / 22 / 0** |
| Violaciones de CSP en el navegador (1440 y 390) | **0** | **0** |
| Errores de consola | 0 | 0 |
| `[style]` en el DOM tras hidratar | solo `next-route-announcer` (lo añade Next por JavaScript; ya existía en la 001; no está en el HTML) | ídem |
| App frente a la réplica del diseño (140 capturas) | **140 / 140 idénticas** | 20 / 140 idénticas; 1,0336 % de píxeles distintos (igual que en el arnés) |
| App frente a la misma opción en el arnés | 140 / 140 idénticas | 140 / 140 idénticas: la CSP no altera el resultado |
| ¿Se tocó la CSP, el proxy, el manifiesto o `next.config.ts`? | No | No |

Línea base del repositorio (sin `Plates`, `bc7004c`): `npm run test:e2e` completo
**349 superadas, 27 omitidas a propósito, 0 fallidas** (igual que al cerrar la 001).

## 5. Tamaño

| Medida | A | B (B3) |
|---|---|---|
| CSS propio de la técnica | **4 566 B** (gzip 1 127 B): 205 reglas (4 de profundidad + 201 valores). El plan estimaba 10–25 KB | **662 B** (gzip 339 B): 8 clases fijas y 8 reglas de SVG |
| Reglas de `Plates` de `site.css` (comunes a ambas) | 4 133 B (gzip 1 380 B) | igual |
| Hoja CSS total del build (repo actual sin `Plates`: 38 726 B, gzip 7 716 B) | 45 601 B (gzip 9 713 B) | 42 817 B (gzip 8 731 B) |
| Marcado de las 7 vistas `wide` (diseño: 20 800 B, 327 elementos) | **14 897 B, 327 elementos** (mismo DOM que el diseño) | 21 049 B, **407 elementos** (+24 %: `<svg>` por placa y `<svg>` anidado por contorno) |
| HTML de la página de laboratorio (70 vistas, incluye la carga RSC) | 289 438 B (gzip 16 435 B) | 452 585 B (gzip 22 530 B) |
| JavaScript en el cliente | 0 (Server Component) | 0 (Server Component) |

## 6. Complejidad y mantenimiento

| Aspecto | A | B (B3) |
|---|---|---|
| Código del componente | `Plates.tsx` 31 líneas | `Plates.tsx` 46 líneas |
| Pieza de build | **Sí**: `scripts/plates-css.mjs` (11 líneas) antes de `next build`, y la hoja generada importada en `globals.css`. `next dev` también la necesita (generarla en `dev` o versionarla con una prueba que exija que esté al día) | No |
| Datos | `data.mjs` (78 líneas, port literal del diseño), compartido por el componente y el generador | El mismo `data.mjs` |
| Estilos de los bloques | Las reglas `.blk.l/.f/.s/.a/.al` de `site.css` **sin cambios**: una sola fuente de verdad | Colores y contornos reescritos como reglas de SVG (`.pr-*`): **dos fuentes** que deben mantenerse iguales si el diseño cambia |
| Cambiar una composición | Editar `data.mjs`; la hoja se regenera sola en el build | Editar `data.mjs`; nada más |
| Riesgo de deriva | La hoja generada desactualizada (se cubre con una prueba unitaria) | El SVG difiere del CSS del diseño en cómo rasteriza (§3.5) y puede variar más entre navegadores |
| Nombres de clase | Arrastran los decimales de coma flotante del diseño (`by-48_800000000000004`). Redondearlos a 4 decimales es posible, pero cambiaría el valor en ~1e-12 %: habría que volver a medir | No aplica |
| Encaje con la CSP | Solo hojas de estilo del propio origen (`style-src 'self'`) | Solo atributos de presentación SVG |
| Toca `scripts/csp-manifest.mjs` | No | No |

## 7. Límites de esta medición (dichos sin rodeos)

- **Solo Chromium** (el de Playwright 1.63.0, el mismo de las e2e). Firefox y
  Safari no se midieron; las transformaciones 3D rasterizan distinto según el
  navegador y la GPU. A produce las mismas propiedades CSS que el diseño, así
  que se espera que coincida con él en cualquier navegador **[Inferencia]**; B
  no tiene esa garantía.
- Densidad 2× solo para M1. Sin medición en dispositivos reales.
- El hover se mide en su estado final (`reduced-motion`); los fotogramas
  intermedios de la transición no se compararon. Las transiciones son las
  mismas reglas de `site.css` en ambas opciones.
- Las copias muestran las vistas en `/trabajo` solo para meterlas en el HTML
  que revisa `csp-scan`; no es la página de Trabajo (T9).
- Los rótulos de `stack` se midieron en inglés (como el diseño); localizarlos
  es parte de la T6b/T11.

## 8. Decisión pendiente — ▲A1 (P-23)

Se pide a Julio elegir la técnica definitiva de `Plates`:

| Si elige | La T6b implementa en `src/components/plates/` |
|---|---|
| **A** | `data.mjs` + `Plates.tsx` + `scripts/plates-css.mjs` + hoja generada, con una prueba unitaria que falle si la hoja no corresponde a los datos y el paso de generación en `build` (y en `dev`). |
| **B** | `data.mjs` + `Plates.tsx` (variante B3) + ~660 B de CSS fijo. Aceptando las diferencias de §3 como adaptación aprobada de la CA-8. |
| **C** | Clases escritas a mano (respaldo del plan; requiere su aprobación). |

Hecho, no elección: el criterio que fijó el `plan.md` §1.4 era la diferencia
píxel a píxel con la réplica del diseño. Con ese criterio, A da 0 píxeles
distintos en las 140 + 28 capturas y B no (≈1–4 % por vista con bloques). La
decisión, con su costo de mantenimiento (§6), es de Julio. Hasta entonces no se
empieza la T6b ni ninguna página que use `Plates` (T9, T10, T11).
