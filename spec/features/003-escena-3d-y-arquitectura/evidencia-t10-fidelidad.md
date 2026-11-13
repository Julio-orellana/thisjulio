# T10 — Fidelidad de la Feature 003 (ronda R4)

**Fecha:** 2026-11-13. **Rama:** `claude/admiring-babbage-bjvbo8`.
**Estado:** medido; pendiente de la revisión final de Julio (▲B3). Chromium 153
sin cabeza (SwiftShader), macOS arm64. Tolerancia aprobada (P-33): 0 píxeles
distintos, o ≤ 0,5 % con diferencia máxima ≤ 16/255 y cada diferencia explicada.

## 1. Resumen

| Qué se compara | Referencia | Casos | Resultado |
|---|---|---|---|
| Motor (lienzo, etiquetas y llamadas a WebGL) | `Arch3D.dc.html` sin modificar, en el arnés | 124 cuadros: 20 pedidos, 80 de perfiles y densidades, 24 de animación | **124 de 124 idénticos**; trazas iguales |
| Inicio: hero | Réplica de `Main.dc.html` con el motor original | 3 estados × 1440 y 390 | **0 píxeles distintos**; 14 cajas iguales |
| Inicio: «How it's built» | Réplica de `Main.dc.html` con el motor original | Capas 0, 2 y sistema completo × 1440 y 390 | **0 píxeles distintos**; 24–25 cajas iguales |
| Arquitectura | Réplica de `Technology.dc.html` | 13 estados × 1440 y 390 | **0 píxeles distintos**; 30–43 cajas iguales |

**Diferencias no previstas: ninguna.**

## 2. Motor frente al arnés (repetición sobre el código final)

`node tests/fidelity/run.mjs --matrix full`, con `engine.ts` en su versión final
(`4746658c98a1…`: rótulo vacío sin recuadro y `data-start`, que no cambian
ninguna llamada a WebGL).

| Tramo | Resultado |
|---|---|
| 20 cuadros fijos pedidos (hero y diagrama, 1440 y 390, capas −1 y 0–3) | 0 píxeles distintos |
| 80 cuadros fijos más (perfiles `high`, `balanced`, `low`; densidades 2× y 3×) | 0 píxeles distintos |
| 24 cuadros de animación con reloj virtual | 0 píxeles distintos; cursor, etiquetas y clics iguales |
| Trazas de WebGL | Arranque: 20 de 20 iguales. Cuadros: 100 de 100. Animación: 4 de 4 |
| Rótulo oculto (solo el port) | Cambian 1 063 píxeles (el recuadro) y 2 llamadas, las dos subidas del atlas |
| Liberación | 16 de 16 objetos borrados; 0 contextos vivos tras 20 montajes |

## 3. Inicio frente a `Main.dc.html`

**Réplica:** el marcado literal del artboard para las dos secciones que llevan
escena, con sus estilos en línea, pintado solo con `site.css`, y **el motor
original del diseño** (el script de `Arch3D.dc.html`, sin modificar, con un
`DCLogic` mínimo). **App:** `/en` del build de producción, con el port. Las dos
con `prefers-reduced-motion` (cuadro fijo), mismo navegador, mismo tamaño y
las mismas fuentes. Se compara la sección entera tal como la compone el
navegador: texto, botones, panel, lienzo y etiquetas.

| Sección | Ancho | Estado | Lienzos | Cajas | Píxeles distintos |
|---|---|---|---|---|---|
| Hero | 1440 | ninguna capa | 1440×824 | 14 iguales | 0 de 1 186 560 |
| How it's built | 1440 | capa 0 (Interface) | 845×638 | 24 iguales | 0 de 1 513 440 |
| How it's built | 1440 | capa 2 (Data) | 845×638 | 25 iguales | 0 de 1 513 440 |
| How it's built | 1440 | sistema completo | 845×638 | 25 iguales | 0 de 1 513 440 |
| Hero | 390 | ninguna capa | 390×360 | 14 iguales | 0 de 308 880 |
| How it's built | 390 | capa 0 | 348×378 | 24 iguales | 0 de 458 640 |
| How it's built | 390 | capa 2 | 348×378 | 25 iguales | 0 de 460 200 |
| How it's built | 390 | sistema completo | 348×378 | 25 iguales | 0 de 478 140 |

El hero se midió en las tres pasadas (una por estado del diagrama): 0 en todas.

**Nota de método.** En una primera pasada «How it's built» dio un 9,5 % de
píxeles distintos, todos en bordes de texto y de líneas, con las cajas iguales.
La causa era la posición: en la app la sección empieza en una coordenada con
decimales (las secciones de encima tienen altos fraccionarios) y en la réplica,
que solo tiene esas dos secciones, en una entera; el navegador rasteriza
distinto con medio píxel de desfase. Con las dos páginas a la misma coordenada
(quitando de la app, solo para la captura, las secciones que no se comparan) la
diferencia es 0. No era una diferencia de contenido.

**Lo que esta comparación no cubre:** el hero fijado con el recorrido en
marcha (es animación; su lógica se prueba en `scene.spec.ts` y `hero-tour.test.ts`,
y el motor animado, en el arnés) y el resto de Inicio, que no cambió en la 003
(se comparó en la 002, `evidencia-t15-fidelidad.md`).

## 4. Arquitectura frente a `Technology.dc.html`

Medido en la R3 (`evidencia-r3-arquitectura.md` §2) y sin cambios de código
desde entonces: 13 estados (las 7 pestañas con su primera pieza y 6 piezas de
otras bandas) a 1440 y 390, **0 píxeles distintos** y cajas iguales en los 26.
La vista `Plates` del inspector de la réplica es la de la app (verificada
contra el diseño en la 002).

## 5. Diferencias aprobadas respecto al diseño

| # | Diferencia | Aprobación |
|---|---|---|
| 1 | Carga diferida, `dispose()` completo y rótulos por idioma en el motor | spec §3.1; informe de R1 aprobado |
| 2 | Un rótulo vacío del atlas no pinta su recuadro | Julio, 2026-11-13 (P-28) |
| 3 | El port redibuja el cuadro fijo al cargar la fuente del atlas | spec §3.1; informe de R1 |
| 4 | Etiquetas de capa ocultas hasta que el motor las coloca; respaldo en `<noscript>` | ▲B1 |
| 5 | Texto de «Monitoring»; sin la pieza «Browser» | P-28; ▲B2 |
| 6 | Español redactado (borrador) en la escena, el recorrido y Arquitectura | D-01, P-22 |
| 7 | Arquitectura sin escena 3D | P-27 |

## 6. Capturas (`capturas/t10-*.png`)

Como la app y la réplica coinciden, hay una imagen por caso.

| Captura | Qué es |
|---|---|
| `t10-en-1440-hero.png` | Hero, cuadro fijo, igual a la réplica con el motor original |
| `t10-en-1440-construccion-datos.png` | «How it's built» con la capa Data |
| `t10-en-390-construccion-sistema.png` | Lo mismo a 390 con el sistema completo |
| `t10-en-1440-arquitectura-saas.png` | Arquitectura, pestaña SaaS, igual a la réplica |

## 7. Límites

- **Un solo renderizador y un solo navegador:** SwiftShader en Chromium. GPU
  real, P-12; Firefox y Safari, P-17.
- **Inglés:** las réplicas usan el texto del diseño. El español se comprueba en
  las pruebas de contenido, de desborde y de celdas del atlas, no píxel a píxel
  (no hay diseño en español).
- **Las réplicas viven fuera del repositorio** (como en la 002): aquí quedan
  este informe y las capturas. El arnés del motor sí está versionado
  (`tests/fidelity/`).
