# 003 — Tareas

**Estado: completada y cerrada el 2026-11-13** (ver «Cierre de la Feature 003»
al final). ▲B0 a ▲B3 aprobadas por Julio el 2026-11-13; decisiones P-26 a P-37
registradas en `docs/PENDIENTES.md`. Cada
tarea se marca solo con su comprobación **ejecutada** (CLAUDE.md §5). «Modelo»
es una recomendación. **▲** = punto de aprobación: se detiene el trabajo y se
espera a Julio. Las tareas suponen P-26 = A y P-27 = A; si Julio elige otra
opción, se reescriben antes de empezar.

Comando común previo a cada commit: `SITE_ORIGIN=http://localhost:3100 npm run verify`.

## Lista ordenada por dependencias

| # | Tarea | Depende de | Modelo · esfuerzo | Comprobación (a ejecutar) | CA | Estado |
|---|---|---|---|---|---|---|
| **▲B0** | **Julio aprueba spec y plan, y responde P-26 a P-33.** | — | Julio | Decisiones registradas en `PENDIENTES.md` | — | **Hecha** (2026-11-13): spec y plan aprobados; P-26 A, P-27 A, P-29 tal cual, P-30 A, P-31 A, P-32 A, P-33 tal cual, registradas en `PENDIENTES.md` y en `spec.md` §10. **P-28 quedó sin respuesta** (el marcador del encargo llegó sin rellenar): sigue abierto |
| **T1** | **Preflight.** Rama y árbol limpio; `design-sources.test.ts` en verde (huellas); `npm ci`, `verify` y e2e como línea base. | ▲B0 | Sonnet · medio | Salidas de `git status`, `verify` (código 0) y e2e | CA-1 | **Hecha** (2026-11-13) sobre `984b712`: rama `claude/admiring-babbage-bjvbo8` igual a su remota; árbol limpio salvo `Flyer.png` sin seguimiento en la raíz (ajeno a la tarea; no se tocó ni se incluye en ningún commit). `npm ci`: código 0. `verify`: código 0, 14 archivos y 167 pruebas unitarias (las 5 huellas de `design-sources.test.ts` en verde), manifiesto de 34 rutas. e2e: 844 superadas, 40 omitidas a propósito, 0 fallidas |
| **T2** | **Arnés de referencia.** Ejecutar `Arch3D.dc.html` sin modificar en una página aislada (scratchpad) con un *shim* de `DCLogic` y `site.css`; cuadros fijos (`reduced-motion`) de `hero` y `diagram` (capas −1, 0–3) a 1440 y 390 con Chromium sin cabeza. | T1 | Opus · alto | Cuadros guardados y reproducibles (dos ejecuciones idénticas); perfil y `canvas.dataset.quality` registrados | CA-12 | **Hecha** (2026-11-13): `tests/fidelity/` ejecuta el script de `Arch3D.dc.html` sin modificar (huella comprobada al arrancar) con un `DCLogic` mínimo, el marcado de su plantilla y `site.css`. 20 cuadros de referencia en `capturas/r1-*.png`; reproducibles (dos capturas por corrida, y entre corridas distintas: PNG idénticos byte a byte). Chromium 153.0.8010.12 sin cabeza, SwiftShader → perfil `low`, `canvas.dataset.quality = "low 1440x824 step0"` (hero 1440), `low 845x638`, `low 390x360`, `low 348x378`; 9 830 triángulos. **Cambio frente a lo escrito:** el código del arnés queda versionado (no en el scratchpad) para repetirlo en T10; la página generada y las salidas siguen fuera del repositorio. Para aprobación en esta parada |
| **T3** | **Port del motor.** `engine.ts`, `engine-shaders.ts` (literales), `engine-profile.ts`; `dispose()` completo; rótulos por parámetro. Sin React. | T2 | Opus · alto | Vitest de las partes puras (perfiles, escalera, rótulos); cuadros del *port* en el arnés frente a T2 dentro de la tolerancia de P-33 | CA-12 | **Hecha; informe aprobado por Julio** (2026-11-13): `src/components/scene3d/{engine,engine-shaders,engine-profile}.ts`, sin React ni dependencias, sin integrar en ninguna página. Vitest: 38 pruebas nuevas (shaders idénticos a los del archivo del diseño; perfiles, escalera, encuadre y rótulos; buffer de vértices con la huella del que emite el motor original). Fidelidad: **0 píxeles distintos en 124 de 124 cuadros** (los 20 pedidos, 80 de perfiles forzados y pantallas densas, 24 de animación con reloj virtual) y trazas de WebGL idénticas. `dispose()`: 16 de 16 objetos borrados, contexto soltado, 0 contextos vivos tras 20 montajes. *Chunk* medido en copia desechable: 11 440 B gzip (P-29: 25 KB). Detalle, diferencias deliberadas y límites: `evidencia-t3-fidelidad-port.md` |
| **T4** | **Isla `Scene3D`.** `import()` al entrar en el viewport (margen 200 px), pausa, `reduced-motion`, respaldo `Plates stack`, pérdida de contexto, etiquetas DOM localizadas, liberación al desmontar. | T3 | Opus · alto | e2e: 0 peticiones y 0 contextos antes del viewport; sin WebGL → respaldo; pérdida de contexto → respaldo; `reduced-motion` → 1 cuadro; 10 navegaciones → ≤ 1 contexto | CA-3 a CA-7 | **Hecha** (2026-11-13): `src/components/scene3d/Scene3D.tsx`. `tests/e2e/scene.spec.ts`: fuera del viewport, 0 peticiones del motor, 0 contextos y 0 lienzos (y en las 32 rutas sin escena); sin WebGL, sin `OES_standard_derivatives`, con pérdida de contexto y sin JavaScript → `Plates stack`, 0 errores; `reduced-motion` → 0 cuadros en 2 s y 1 cuadro por cambio de capa; 10 idas y vueltas → 1 contexto vivo, 160 objetos borrados, sin aviso de Chromium; pausa con la pestaña oculta y fuera de pantalla. Cada montaje usa un `<canvas>` nuevo |
| **T5** | **Textos.** Rótulos del atlas, etiquetas, recorrido del hero y textos de Arquitectura en `src/messages` (ES redactado, EN del diseño), `copy: 'draft'`; contenido de P-28 en `src/content/architecture.ts` con su esquema y la política de contenido. | ▲B0 (P-28) | Opus · alto | Vitest: claves ES = EN, política de contenido, rótulos ES caben en su celda (medido en el atlas) | CA-9, CA-13 | **Hecha** (2026-11-13), con P-28 = A: `home.json` (15 rótulos, rótulo y 4 pasos del recorrido; EN igual al diseño, comprobado), `architecture.json`, `src/content/architecture.ts` (7 sistemas, 17 bandas, 42 piezas; 12 tecnologías en lista cerrada; «Monitoring» con texto nuevo sin promesas) con `architectureSchema` y la excepción acotada en `policy.ts`. Vitest: 232 pruebas (27 nuevas en esta ronda). Rótulos ES en su celda: medidos en el navegador con la fuente del sitio (e2e, CA-9). 67 bloques nuevos en `draft` |
| **T6** | **CSP y estático** (P-32). Build con el motor cargando en Inicio. | T4 | Sonnet · medio | `csp-scan` y manifiesto (34 rutas); `csp.spec.ts` P1–P14; 0 violaciones con la escena en marcha; HTML sin `style=` | CA-2, CA-10 | **Hecha** (2026-11-13): build con manifiesto de 34 rutas en modo hash, generador sin cambios; `csp.spec.ts` en verde; `/es` y `/en` con 0 violaciones recorriendo el hero, usando el diagrama y pasando una medición del motor; HTML sin `style=` ni `<canvas>`. La CSP, el proxy y `next.config.ts` no se tocaron. Descartado por la CSP: cargar la isla con `React.lazy` (React emite scripts en línea; el build falla) |
| **T7** | **Inicio.** Hero con escena y recorrido fijado (P-30); «How it's built» con `mode="diagram"` sincronizado con `LayerPicker` y las etiquetas; se retiran `.hero-static` y el respaldo fijo de DA-2. | T4, T5, T6 | Opus · alto | e2e: pasos del recorrido al desplazar; selección de capa sincroniza panel, escena y etiquetas; ≤ 1040 px y `reduced-motion` sin fijar; axe | CA-2, CA-5, CA-8 | **Hecha, pendiente de ▲B1** (2026-11-13): `HeroScene` (recorrido de 420 px: sin capa hasta el 8 %, luego 4 tramos; el hero sigue fijado en `top: 76px`) y `LayerPicker` con la escena en modo diagrama. e2e: los 5 estados del recorrido con su rótulo y su etiqueta; selector ⇄ etiquetas ⇄ clic en el lienzo; a 390 y con `reduced-motion`, sin fijar y sin rótulo; teclado; axe sin violaciones serias (ES y EN, 1440 y 390). Se retira `.hero-static` (DA-2). **CA-11 no se cumple al pie de la letra: +2 916 B (+1 118 B gzip) de JavaScript en las rutas sin escena → P-34** |
| **▲B1** | **Revisión visual de Inicio con la escena** (ES/EN, 1440/390, con y sin WebGL). | T7 | Julio | Aprobación registrada | — | **Hecha** (2026-11-13): Julio aprobó Inicio con la escena. P-34 = A (CA-11 precisado), P-35 = B (panel «Datos» como el diseño), P-36 = A (Electron como el artboard) |
| **T8** | **Arquitectura** (P-27, P-28): encabezado, pestañas de tipo de sistema, diagrama de bandas y nodos, inspector `Plates stack`, banda final; con todos los nodos del artboard (P-28 = A). | ▲B1 | **Fable · alto** (decisión de Julio en ▲B1; antes Opus) | e2e: pestañas y nodos con `aria-pressed`, inspector `aria-live`, teclado; sin textos vedados; réplica de `Technology.dc.html` a 1440/390 | CA-2, CA-8, CA-12, CA-13 | **Hecha, pendiente de ▲B2** (2026-11-13): `ArchitectureView` (servidor) e isla `ArchitectureExplorer`; la ruta deja de ser el esqueleto y sigue estática con hashes. `tests/e2e/architecture.spec.ts`: las 7 pestañas y las 81 pulsaciones de pieza por idioma (ES y EN, 1440 y 390) con `aria-pressed`, banda, texto del inspector y capa de `Plates`; teclado; axe; sin JavaScript; sin texto vedado fuera de lo que P-28 autoriza. Réplica literal del artboard frente a `/en/architecture`: **0 píxeles distintos y cajas iguales en 26 estados** (13 a 1440 y 13 a 390). La isla va en *chunk* propio: +0 B en las demás rutas. P-35 = B aplicada en Inicio. Detalle: `evidencia-r3-arquitectura.md` |
| **▲B2** | **Julio revisa Arquitectura** (contenido y capturas). | T8 | Julio | Aprobación o cambios registrados | — | **Hecha** (2026-11-13): Julio aprobó la página Arquitectura, su contenido y sus capturas |
| **T9** | **Pruebas transversales y presupuesto.** Rutas sin escena (0 *chunk*, 0 `canvas` tras hidratar), bytes de JavaScript por ruta, Long Tasks, LCP de laboratorio, consola limpia, desborde ES. | T8 | Sonnet · medio | e2e desktop y mobile; tabla de presupuesto con valores medidos frente a P-29 | CA-3, CA-11 | **Hecha, con un punto abierto** (2026-11-13): `tests/e2e/scene-budget.spec.ts`. Motor 11 516 B gzip (≤ 25 KB); rutas sin escena +1 119 B gzip (≤ 1,5 KB, P-34) y 0 peticiones del motor en las 32; Inicio solo añade el motor; LCP de Inicio en móvil emulado 648 ms, en el `<h1>` (≤ 2,5 s); consola, desborde, axe y CSP en verde. **No cumple en el laboratorio: tarea larga de arranque 768–960 ms (≤ 200 ms)**; el JavaScript del motor son 43–127 ms y el resto es el pintado por software de Chromium sin cabeza → **P-37**. `evidencia-t9-presupuesto.md` |
| **T10** | **Fidelidad.** Cuadros del *port* frente al arnés (T2); páginas frente a réplicas de `Main` y `Technology`; tabla de diferencias aprobadas y no previstas. | T9 | Sonnet · medio (medición); Opus · alto si hay diferencias no previstas | `evidencia-t10-fidelidad.md` con capturas | CA-12 | **Hecha, pendiente de ▲B3** (2026-11-13): motor frente al arnés sobre el código final, 124 de 124 cuadros idénticos y trazas iguales; Inicio (hero y «How it's built») frente a una réplica de `Main.dc.html` que ejecuta el motor original, 0 píxeles distintos y cajas iguales en 12 comparaciones (1440 y 390); Arquitectura frente a la réplica de `Technology.dc.html`, 0 píxeles distintos en 26 estados (R3). Diferencias no previstas: ninguna |
| **▲B3** | **Revisión final de Julio.** | T10 | Julio | Aprobación registrada | — | **Hecha** (2026-11-13): Julio aprobó la revisión final, con P-37 = A |
| **T11** | **Cierre.** CA con evidencia; `TEST-PLAN.md` §8; `ARCHITECTURE.md` §2 y §6; `REFERENCIA-DISENO.md` §4.1 y §5; `PENDIENTES.md`; audit; push y CI de GitHub en verde. | ▲B3 | Sonnet · medio | `verify`, e2e, audit, CI | CA-1, CA-14, CA-15 | **Hecha** (2026-11-13): ver «Cierre de la Feature 003» |

## Rondas

| Ronda | Tareas | Paradas |
|---|---|---|
| R0 | Esta planificación | **▲B0** |
| R1 | T1–T3 (arnés y *port*) | revisión del informe de fidelidad del *port* — **aprobado por Julio (2026-11-13)** |
| R2 | T4–T7 (isla, textos, CSP, Inicio) | ▲B1 |
| R3 | T8 (Arquitectura) | ▲B2 |
| R4 | T9–T11 | ▲B3 |
| R5 (reserva) | correcciones | — |

## Qué queda fuera de esta lista

Medición en GPU real (P-12); CSP en Firefox, Safari y CDN (P-17); formularios
(004); blog (005); hosting, DNS de registros, correo y despliegue (006, P-07).

## Cierre de la Feature 003 (2026-11-13)

**Aprobación final de Julio (▲B3), 2026-11-13.** Quedan aceptados el port del
motor (informe de R1), Inicio con la escena (▲B1), la página Arquitectura (▲B2)
y el presupuesto y la fidelidad (▲B3), con estas decisiones:

| Decisión | Resultado |
|---|---|
| P-26 | A: port del motor propio a TypeScript, sin dependencias |
| P-27 | A: Arquitectura como el artboard, sin escena 3D |
| P-28 | A completa: las 12 tecnologías y «Monitoring» en Arquitectura, `POSTGRESQL` y `MONGODB` en el atlas; con condiciones. Un rótulo oculto del atlas queda sin recuadro |
| P-29 | Presupuesto aprobado tal cual; precisado por P-34 y P-37 |
| P-30 | A: recorrido fijado del hero |
| P-31 | A: accesibilidad como el diseño |
| P-32 | A: Inicio y Arquitectura estáticas con hashes |
| P-33 | Verificación aprobada tal cual |
| P-34 | A: el motor no se carga en rutas sin escena; el envoltorio de la isla, ≤ 1,5 KB gzip |
| P-35 | B: el panel «Datos» de Inicio vuelve al texto del diseño |
| P-36 | A: Electron como en el artboard |
| P-37 | A: JavaScript de arranque del motor ≤ 200 ms; la tarea larga en GPU real, P-12 |

Toda la feature se hizo con Claude Fable 5.2: lo fijaba el encargo de la R1 y,
para la R3, lo decidió Julio expresamente (esta lista recomendaba Opus para la T8).

### Criterios de aceptación

| CA | Resultado | Evidencia |
|---|---|---|
| CA-1 | ✔ `verify` código 0: lint, tipos, 233/233 unitarias, build y manifiesto de 34 rutas | `TEST-PLAN.md` §8 (T11) |
| CA-2 | ✔ Inicio y Arquitectura responden 200 en ES y EN con su contenido, un `<h1>` y `lang`; las 34 rutas siguen estáticas en el manifiesto | `pages.spec.ts`, `architecture.spec.ts`, `csp.spec.ts` P1 |
| CA-3 | ✔ Con las escenas fuera del viewport: 0 peticiones del motor, 0 `getContext('webgl')`, 0 lienzos; en las 32 rutas sin escena, 0 en toda la visita | `scene.spec.ts` |
| CA-4 | ✔ Sin WebGL, sin `OES_standard_derivatives`, con pérdida de contexto y sin JavaScript: `Plates stack`, 0 errores de consola | `scene.spec.ts` |
| CA-5 | ✔ `reduced-motion`: 0 cuadros nuevos en 2 s, 1 cuadro por cambio de capa, hero sin fijar | `scene.spec.ts` |
| CA-6 | ✔ 10 idas y vueltas Inicio ⇄ Trabajo: 1 contexto vivo, 160 objetos borrados, sin aviso de Chromium; en el arnés, 16 de 16 objetos borrados y 0 contextos vivos tras 20 montajes | `scene.spec.ts`, `evidencia-t3-fidelidad-port.md` §4.5 |
| CA-7 | ✔ 0 cuadros con la pestaña oculta o las escenas fuera de pantalla | `scene.spec.ts` |
| CA-8 | ✔ Lienzos `aria-hidden`; etiquetas y piezas con nombre localizado, foco visible y `aria-pressed`; paneles `aria-live`; axe sin violaciones serias en Inicio (con la escena en marcha) y en Arquitectura, a 1440 y 390 | `scene.spec.ts`, `architecture.spec.ts`, `quality.spec.ts` |
| CA-9 | ✔ Atlas y etiquetas desde `es`/`en`; el cambio de idioma repinta el atlas sin recargar; cada rótulo cabe en su celda (el más ancho, 319 de 390) | `scene.spec.ts`, `messages.test.ts` |
| CA-10 | ✔ CSP intacta: `csp.spec.ts` P1–P14 en verde; 0 violaciones con la escena funcionando; HTML sin `style=` ni `on…=`; `scripts/`, `next.config.ts`, `src/proxy.ts` y `src/lib/security/` sin cambios desde `984b712` | `csp.spec.ts`, `scene.spec.ts`, `transversal.spec.ts`, `git diff 984b712 -- scripts next.config.ts src/proxy.ts src/lib/security` (vacío) |
| CA-11 | ✔ Con P-34 = A y P-37 = A: motor 11 516 B gzip (≤ 25 KB); rutas sin escena, 0 peticiones del motor y +1 119 B gzip (≤ 1,5 KB); JavaScript de arranque 43–127 ms (≤ 200 ms); LCP de Inicio en móvil emulado 648 ms, en el `<h1>` (≤ 2,5 s). La tarea larga de arranque en el laboratorio (768–960 ms, pintado por software) queda fuera del criterio: P-12 | `scene-budget.spec.ts`, `evidencia-t9-presupuesto.md` |
| CA-12 | ✔ Motor: 124 de 124 cuadros idénticos al del diseño y trazas de WebGL iguales. Inicio frente a la réplica de `Main.dc.html` con el motor original: 0 píxeles distintos en 12 comparaciones. Arquitectura frente a la réplica de `Technology.dc.html`: 0 en 26 estados. **Aprobado por Julio (R1, ▲B1, ▲B2, ▲B3)** | `evidencia-t3-fidelidad-port.md`, `evidencia-t10-fidelidad.md`, `evidencia-r3-arquitectura.md` |
| CA-13 | ✔ Ningún texto ni rótulo rompe la política de contenido; las excepciones de P-28 y P-35 están acotadas (lista cerrada de 12 tecnologías, un nodo de monitoreo, dos palabras en el panel «Datos») y vigiladas | `architecture.test.ts`, `messages.test.ts`, `content.test.ts`, `architecture.spec.ts`, `transversal.spec.ts` |
| CA-14 | ✔ Ninguna dependencia nueva: `package.json` y `package-lock.json` sin cambios desde `984b712`; `npm audit --omit=dev`: 0 | `git diff 984b712 -- package.json package-lock.json` (vacío) |
| CA-15 | ✔ Documentación actualizada en este cierre; **101 de 101 bloques de texto en `draft`** | `textos-borrador.md`, `TEST-PLAN.md` §8, `ARCHITECTURE.md` §2 y §6, `REFERENCIA-DISENO.md` §4.1 y §5, `PENDIENTES.md` |

### Evidencia conservada

| Evidencia | Ubicación |
|---|---|
| Fidelidad del port del motor (R1) | `evidencia-t3-fidelidad-port.md`, `evidencia-t3-fidelidad.json`, `capturas/r1-*` |
| Inicio con la escena (R2) | `evidencia-r2-inicio.md`, `capturas/b1-*` |
| Página Arquitectura (R3) | `evidencia-r3-arquitectura.md`, `capturas/b2-*` |
| Presupuesto (R4) | `evidencia-t9-presupuesto.md` |
| Fidelidad final (R4) | `evidencia-t10-fidelidad.md`, `capturas/t10-*` |
| Textos en borrador (ES ⇄ EN) | `textos-borrador.md` |
| Arnés del motor | `tests/fidelity/` (`node tests/fidelity/run.mjs --out <carpeta> --matrix full`) |
| Registro de verificaciones | `TEST-PLAN.md` §8 |
| Pruebas | `tests/unit/` (Vitest, 233) y `tests/e2e/` (Playwright: 981 superadas, 53 omitidas a propósito, 0 fallidas) |

### Limitaciones conocidas y aceptadas al cierre

1. **Todo se midió con GPU por software** (SwiftShader, Chromium sin cabeza). El aspecto, los perfiles `high` y `balanced`, el costo por cuadro y la tarea larga de arranque en una GPU real quedan en **P-12**. En el laboratorio esa tarea mide 768–960 ms, casi toda del navegador pintando por software (P-37).
2. **Solo Chromium** (P-17): Firefox, Safari y CDN real siguen pendientes para la 006.
3. **Las rutas sin escena cargan 1 119 B gzip más de JavaScript** (el código de las islas de la escena, en el *chunk* común; P-34). Cargar la isla con `React.lazy` lo evitaría, pero React emite scripts en línea que el manifiesto de CSP rechaza.
4. **Todos los textos siguen en borrador** (101 de 101; P-04, P-22), incluida la descripción nueva de «Monitoring», que no es del diseño.
5. **Mensajes en el navegador** (P-24): cada página lleva ~1,1 KB más de HTML, y las palabras «PostgreSQL» y «MongoDB» del panel «Datos» viajan en el código fuente de las 34 rutas, aunque solo se ven en Inicio.
6. **Chromium escribe un aviso de consola** («GPU stall due to ReadPixels») por la medición temporizada del motor, que viene del diseño. No es un error ni llega al usuario; `scene.spec.ts` admite solo ese.
7. **`prefers-reduced-motion` se lee al montar la escena** y el paso del recorrido solo se calcula al desplazar (como el diseño): un cambio de preferencia con la página abierta, o un desplazamiento restaurado dentro del tramo, se reflejan al recargar o al primer movimiento.
8. **La suite e2e general corre con WebGL desactivado** y ve el respaldo de Inicio; la escena se prueba en dos proyectos propios (`desktop-webgl`, `mobile-webgl`). La CI no ejecuta el arnés de fidelidad: lo que vigila en cada push son las pruebas unitarias de shaders y de geometría.
9. **Las réplicas de `Main` y `Technology` se escribieron a mano** desde los `.dc.html` y viven fuera del repositorio; la de Arquitectura usa la vista `Plates` de la app.
10. **Las capturas del hero animado a 1440 están al 80 % de resolución**: con SwiftShader el motor baja un peldaño, como manda el diseño con una GPU lenta.

### CI

| Comprobación | Resultado |
|---|---|
| GitHub Actions sobre `76eee55` (R1) | [43379587172](https://github.com/Julio-orellana/thisjulio/actions/runs/43379587172) y [43379590431](https://github.com/Julio-orellana/thisjulio/actions/runs/43379590431): **success** |
| GitHub Actions sobre `f3ff478` (R2) | [43386913288](https://github.com/Julio-orellana/thisjulio/actions/runs/43386913288) y [43386917377](https://github.com/Julio-orellana/thisjulio/actions/runs/43386917377): **success** (11–13 min) |
| GitHub Actions sobre `caf34e2` (R3) | [43393273918](https://github.com/Julio-orellana/thisjulio/actions/runs/43393273918) y [43393280465](https://github.com/Julio-orellana/thisjulio/actions/runs/43393280465): **success** (10–11 min) |
| GitHub Actions sobre `91f7cbb` (R4) | PR: [43396792477](https://github.com/Julio-orellana/thisjulio/actions/runs/43396792477), **success** (10 min). Push: [43396788167](https://github.com/Julio-orellana/thisjulio/actions/runs/43396788167), **cancelada por GitHub**, no fallida: llegó el push del cierre mientras corría el paso de e2e y el flujo cancela la ejecución anterior de la misma rama (`cancel-in-progress`). El mismo código pasó en la ejecución del PR y, con el cierre encima, en las dos siguientes |
| GitHub Actions sobre `610595a` (commit de cierre) | Push: [43398292793](https://github.com/Julio-orellana/thisjulio/actions/runs/43398292793). PR: [43398297457](https://github.com/Julio-orellana/thisjulio/actions/runs/43398297457). Las dos, **success** (verify, audit de producción y e2e; 12–13 min) |

### Integridad de `sistema-pos`

Durante la Feature 003 no se abrió, consultó ni modificó `sistema-pos`: la
feature no lo necesita. Arquitectura no menciona el caso POS ni al cliente, y
Electron va como tecnología general (P-28, P-36).

