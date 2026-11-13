# R3 — Página Arquitectura (T8)

**Fecha:** 2026-11-13. **Rama:** `claude/admiring-babbage-bjvbo8`. **Modelo:**
Claude Fable 5.2, esfuerzo alto (decisión de Julio en ▲B1).
**Estado:** ronda R3 ejecutada. **Parada en ▲B2: revisión de Arquitectura
(contenido y capturas).** Nada de este informe se da por aprobado. La CSP, el
proxy, `scripts/csp-manifest.mjs`, `scripts/lib/csp-scan.mjs`, `next.config.ts` y
`package.json` **no se tocaron**.

## 1. Qué hay ahora

`/es/arquitectura` · `/en/architecture` dejan de ser el esqueleto de la 001 y
pasan a ser la página del artboard `Technology.dc.html` (P-27 = A: diagrama
HTML, sin escena 3D).

| Pieza | Archivo | Qué hace |
|---|---|---|
| Vista | `src/components/sections/architecture/ArchitectureView.tsx` | Servidor: encabezado con la firma «This», las 4 vistas `Plates stack` del inspector y la banda final «The simplest setup that does the job» con «Start a project». |
| Isla | `ArchitectureExplorer.tsx` | Cliente: 7 pestañas de tipo de sistema (`aria-pressed`), bandas con sus piezas (botones `aria-pressed`), enlaces animados entre bandas, nota de las capas punteadas e inspector `aria-live` con la banda, el nombre y el texto de la pieza. Guarda solo la pestaña y la pieza; al cambiar de pestaña elige su primera pieza, como el diseño. |
| Contenido | `src/content/architecture.ts` (R2) | 7 sistemas, 33 bandas, 42 piezas; P-28 dentro del esquema. Sin cambios en esta ronda (P-36 = A: Electron como el artboard). |
| CSS | `src/styles/design.css` | Reglas de `site.css` 351–363, 384, 401–405, 450, 456–457 y 466, literales, y 3 clases `[app]` que sustituyen a los estilos en línea del artboard. |
| Inicio (P-35 = B) | `src/messages/{es,en}/home.json` | El panel de la capa «Datos» vuelve al texto y las etiquetas del diseño (PostgreSQL, MongoDB). |

Sin JavaScript se ve la primera pestaña con su primera pieza (la pinta el
servidor). La ruta sigue estática, con CSP de hashes (manifiesto de 34 rutas).

## 2. Comprobaciones

| Qué | Cómo | Resultado |
|---|---|---|
| **Fidelidad al artboard (CA-12)** | Réplica del artboard en inglés: su marcado literal, con sus estilos en línea, pintado solo con `site.css`, frente al `<main>` de `/en/architecture`. 13 estados (las 7 pestañas con su primera pieza y 6 piezas de otras bandas, una de ellas punteada) a 1440 y a 390. Se comparan las cajas de 30 a 43 elementos por estado (encabezado, pestañas, bandas, piezas, enlaces, inspector, banda final) y los píxeles. | **0 píxeles distintos y cajas iguales en los 26 estados** |
| Estructura y contenido (CA-2) | e2e en ES y EN: un `<h1>`, `lang`, 7 pestañas con sus nombres, primera pestaña y primera pieza elegidas, nota, banda final con enlace al estimador, sin `<canvas>`. | Superado |
| Todas las pestañas y piezas (CA-8) | e2e en ES y EN, a 1440 y 390: se recorren las 7 pestañas y se pulsa cada pieza (81 pulsaciones por idioma: las 42 piezas en todas las bandas donde aparecen). Por cada una: `aria-pressed` exclusivo, banda resaltada, rótulo de banda, nombre y texto del inspector iguales al contenido, y capa de `Plates` resaltada (a ≤ 1040 px el diseño oculta `Plates`). | Superado |
| Teclado (CA-8) | Tab recorre pestañas y piezas en orden; Enter y Espacio eligen; foco visible. | Superado |
| axe, WCAG 2.2 AA (CA-8) | Estado inicial (suite general) y con una pieza de banda punteada elegida, ES y EN, 1440 y 390. | Sin violaciones serias |
| Política de contenido (CA-13) | En los 81 estados de cada idioma, el texto visible del `<main>` no rompe ninguna regla, una vez descontados los 12 nombres de tecnología y el nombre de la capa de monitoreo que P-28 autoriza. La suite transversal aplica la misma excepción solo a esta ruta. | Superado |
| Condiciones de P-28 en pantalla | Las 12 tecnologías se ven con su nombre; «Monitoring» / «Monitoreo» está en banda punteada y su texto empieza por «A layer of the architecture» / «Capa de la arquitectura», sin promesas; Electron está en «POS: local», «POS: híbrido» y «Mobile & desktop» (P-36 = A) y su texto no menciona el POS ni al cliente. | Superado |
| Móvil | Ninguna pestaña desborda en horizontal (ES y EN); a 390 el inspector va primero y queda fijado, como `MobileTech.dc.html`. | Superado |
| Sin JavaScript | Primera pestaña con su primera pieza. | Superado |
| CSP (CA-10) | Build con manifiesto de 34 rutas en modo hash; `csp.spec.ts` (P1–P14) recorre también esta ruta: hidratación y 0 violaciones. | Superado |
| Sin escena (CA-3) | La ruta no pide el motor, no crea contextos ni lienzos (suite de la escena, 32 rutas). | Superado |

**Totales (árbol final):** `verify` código 0 (19 archivos y 233 pruebas unitarias; manifiesto de 34
rutas); e2e **975 superadas, 49 omitidas a propósito, 0 fallidas** (solo Chromium,
P-17); `npm audit --omit=dev`: 0.

## 3. Peso

Misma medida que en la R2 (suma de los `.js` que descarga cada ruta, gzip -9).

| Ruta | Antes de la 003 | Tras R2 | Tras R3 |
|---|---|---|---|
| Sin escena ni Arquitectura (p. ej. Acerca de) | 520 947 B · 156 566 gzip | 523 863 B · 157 684 gzip | **523 863 B · 157 684 gzip (sin cambio)** |
| Arquitectura | 520 947 B · 156 566 gzip | 523 863 B · 157 684 gzip | 525 871 B · 158 499 gzip (+2 008 B · +815 gzip: su isla, en un *chunk* propio) |
| Inicio | 520 947 B · 156 566 gzip | 553 101 B · 169 182 gzip | sin cambio |

La isla de Arquitectura no añade nada a las demás rutas (el empaquetador le dio
*chunk* propio). El criterio de P-34 se mantiene: 1 118 B gzip del envoltorio de
la escena en las rutas sin escena (límite, 1,5 KB). El HTML de Arquitectura pesa
52 934 B (11 538 gzip): lleva los textos de las 42 piezas para la isla.

## 4. Diferencias respecto al artboard

| # | Diferencia | Motivo |
|---|---|---|
| 1 | Texto de «Monitoring» distinto del artboard. | Condición de P-28 (aplicado en la R2). |
| 2 | Sin la pieza «Browser». | El artboard la define y ninguna pestaña la usa. |
| 3 | Español: todo redactado, en borrador. Las pestañas «POS: en la nube / local / híbrido», las bandas («Se agrega cuando hace falta», «En el local», «Entre ambos»…) y las 42 descripciones necesitan tu revisión. | D-01, P-22. |
| 4 | Navegación y pie del sitio en lugar de los del artboard; título de la pestaña del navegador «Arquitectura y tecnología» / «Architecture & technology». | 001 (D-04, D-06). |

En inglés, y fuera de los puntos 1 y 2, la página es el artboard píxel a píxel.

## 5. Puntos para tu revisión en ▲B2

Capturas: `b2-es-1440-pagina.png`, `b2-en-1440-pagina.png`, `b2-es-390-pagina.png`,
`b2-en-390-pagina.png` (página completa), `b2-es-1440-1-web.png` a
`b2-es-1440-7-movil.png` (las 7 pestañas), `b2-es-390-pos-hibrido.png` y
`b2-{es,en}-1440-monitoreo.png`.

1. **Contenido de las 7 pestañas** (capturas `capturas/b2-*.png`, ES y EN).
2. **Pestañas POS frente a `caso-pos.md` §5.** Las tres describen arquitecturas
   que se ofrecen como servicio. La página no menciona el caso POS ni al
   cliente, y Electron va con su texto general (P-36 = A). Queda a tu criterio
   si la lectura conjunta con el caso publicado te parece correcta.
3. **Borradores en español** de esta página (§4, punto 3) y de la R2. Un
   detalle de maquetación: el rótulo de banda «Se agrega cuando hace falta»
   ocupa dos líneas en su columna de 148 px (en inglés, «Add when needed», una).
4. **Textos nuevos que no son del diseño:** la descripción de «Monitoring»
   (ES y EN).

## 6. Límites y riesgos

- **Solo Chromium** (P-17). La réplica se comparó en macOS con el Chromium de
  Playwright.
- **La vista `Plates` del inspector** de la réplica es la de la app (verificada
  contra el diseño en la 002), no el marcado de `Plates.dc.html`.
- **P-24 (mensajes en todas las páginas):** como `NextIntlClientProvider` envía
  todos los mensajes a cada página, las palabras «PostgreSQL» y «MongoDB» del
  panel «Datos» de Inicio (P-35) viajan ahora en el HTML de las 34 rutas, aunque
  solo se vean en Inicio. No es texto visible ni lo recoge la política de
  contenido, pero está en el código fuente de páginas como el caso POS. Si te
  importa, es un motivo más para resolver P-24.
- **Suite e2e reorganizada (riesgo de R2 resuelto).** Tras la R2 la suite
  tardaba 8–9 minutos en local y fallaba de forma intermitente por tiempo (una
  prueba distinta de la escena en cada corrida): toda prueba que abría Inicio
  pintaba el hero por software. Ahora `playwright.config.ts` tiene cuatro
  proyectos: `desktop` y `mobile` corren con WebGL desactivado (ven el respaldo
  `Plates stack`, como en la 002) y solo `scene.spec.ts` corre con WebGL, en
  `desktop-webgl` y `mobile-webgl`. La comprobación de consola con la escena en
  marcha (y su único aviso admitido) pasó de `quality.spec.ts`, que vuelve a
  ser estricta, a `scene.spec.ts`. Resultado: 4,3 minutos y 0 fallos.
- **Queda para la R4:** presupuesto completo (tarea larga, LCP), fidelidad de
  Inicio frente a la réplica de `Main.dc.html`, y el cierre (T9–T11).
