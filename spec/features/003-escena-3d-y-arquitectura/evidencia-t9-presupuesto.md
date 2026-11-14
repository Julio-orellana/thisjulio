# T9 — Pruebas transversales y presupuesto de la escena (ronda R4)

**Fecha:** 2026-11-13. **Rama:** `claude/admiring-babbage-bjvbo8`.
**Estado:** medido y **aprobado por Julio en ▲B3 (2026-11-13) con P-37 = A**: el
criterio de la tarea larga pasa a ser el JavaScript de arranque del motor
(≤ 200 ms; medido, 43–127 ms) y la tarea larga en GPU real queda en P-12. Lo
que sigue es el informe tal como se presentó. Valores de
laboratorio: build de producción servido en local, Chromium 153 sin cabeza,
SwiftShader (GPU por software), macOS arm64. La GPU real es P-12.

## 1. Presupuesto (P-29, con P-34)

| Criterio | Límite | Medido | |
|---|---|---|---|
| *Chunk* del motor | ≤ 25 KB gzip | 29 311 B · **11 516 B gzip** (46 %) | Cumple |
| Motor en rutas sin escena | 0 peticiones | 0 en las 32 rutas, también tras hidratar y desplazar | Cumple |
| JavaScript de más en rutas sin escena (P-34) | ≤ 1,5 KB gzip | **+1 119 B gzip** (157 685 frente a 156 566 de línea base) | Cumple |
| Inicio frente a otra ruta | solo el motor | +11 516 B gzip: exactamente el *chunk* del motor | Cumple |
| Nada antes del viewport (200 px) | 0 *chunks*, 0 contextos | 0 peticiones, 0 `getContext`, 0 lienzos con las escenas lejos | Cumple |
| LCP de Inicio, móvil emulado (4× CPU, 4G rápida) | ≤ 2,5 s | **648 ms**; el elemento es `<h1 class="display hero-title">` | Cumple |
| Perfil con GPU por software | `low` | `low` en todas las medidas (`data-quality`) | Cumple |
| Perfil en móvil | `balanced` | Elección probada en Vitest (`pickProfile`); en el laboratorio manda la GPU por software | Cumple (unitario); GPU real: P-12 |
| **Tarea larga de arranque, escritorio** | **≤ 200 ms** | **768–960 ms** en una página sola (hasta 3 s con la suite en paralelo) | **No cumple en el laboratorio → P-37** |

«4G rápida» es el perfil *Fast 4G* de las herramientas de Chrome: 9 Mbps de
bajada, 1,5 Mbps de subida, 165 ms de latencia.

## 2. La tarea larga de arranque, desglosada

| Medida | Resultado |
|---|---|
| Tarea más larga al cargar Inicio (`PerformanceObserver`, `longtask`), 3 cargas | 960, 922 y 772 ms en escritorio; 614, 768 y 702 ms en móvil emulado |
| La misma página con WebGL desactivado | 0 tareas largas en escritorio; 84 ms como máximo en móvil emulado |
| JavaScript de `createEngine` (geometría, atlas, llamadas a WebGL), medido dentro del motor (`data-start`) | **43–127 ms** |
| Perfil de CPU del hilo principal durante la carga (1,8 s) | ~1 530 ms de tiempo nativo del navegador («(program)») frente a ~200 ms de JavaScript |
| Cuadros siguientes | 50–65 ms cada uno, también como tarea larga |

**Lectura.** El código del motor tarda entre 43 y 127 ms en arrancar. Lo que
convierte ese arranque en una tarea de casi un segundo es que Chromium sin
cabeza pinta WebGL por software en el mismo proceso: compilar los shaders y
pintar el primer cuadro (con el horneado de sombras) bloquea el hilo principal.
Por eso también cada cuadro posterior cuenta como tarea larga. Con una GPU real
ese trabajo lo hace la tarjeta, pero **aquí no se puede medir**: queda en P-12.

No es una optimización pendiente del sitio: partir el arranque en pasos no
reduce el coste del primer cuadro por software, y cambiar lo que el motor
pinta sería apartarse del diseño.

**Decisión que se pide (P-37):**

| Opción | Qué supone |
|---|---|
| **A (recomendada).** Precisar el criterio | «El JavaScript de arranque del motor cuesta ≤ 200 ms en el laboratorio (`data-start`); la tarea larga en una GPU real se mide en P-12». Hoy: 43–127 ms. Ya hay una prueba que lo vigila. |
| B. Mantener el criterio y darlo por no cumplido | CA-11 queda abierto hasta P-12. La 003 se cerraría con esa salvedad. |
| C. Cambiar el arranque | Repartir el arranque en varios cuadros. Tocaría el motor ya verificado, no garantiza cumplir con SwiftShader y habría que repetir la fidelidad. |

## 3. Transversales

| Qué | Resultado |
|---|---|
| Rutas sin escena: sin *chunk* del motor, sin contexto, sin `<canvas>` tras hidratar | 32 de 32, a 1440 y 390 |
| Consola con la escena en marcha (`/es`, `/en`, 1440 y 390) | Sin errores; un único aviso admitido (medición temporizada del motor) |
| Consola en las 34 rutas sin WebGL | Sin errores ni avisos (`quality.spec.ts`, estricta) |
| Desborde horizontal en español a 1440, 1024, 768 y 390 | Sin desborde en las 34 rutas; con la escena en marcha, sin desborde en Inicio |
| Arquitectura: 7 pestañas a 1440 y 390 | Sin desborde |
| axe (WCAG 2.2 AA) | Sin violaciones serias en las 34 rutas y con la escena en marcha |
| CSP | `csp.spec.ts` P1–P14 en las 34 rutas; 0 violaciones con la escena funcionando |

**Pruebas:** `tests/e2e/scene-budget.spec.ts` (nueva) y las suites existentes.
Cada medida queda anotada en el informe de Playwright.

**Totales (árbol final):** `verify` código 0 (19 archivos y 233 pruebas unitarias; manifiesto de 34
rutas); e2e **981 superadas, 53 omitidas a propósito, 0 fallidas** (solo Chromium,
P-17); `npm audit --omit=dev`: 0. CI de GitHub del push de la R3 (`caf34e2`):
*success* en las dos ejecuciones (10–11 minutos).
