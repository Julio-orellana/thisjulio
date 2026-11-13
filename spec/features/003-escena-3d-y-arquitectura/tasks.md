# 003 — Tareas

**Estado: borrador para aprobación (2026-11-12).** Nada de esta lista se ejecuta
hasta la aprobación expresa de Julio (▲B0) y sus respuestas a P-26 a P-33. Cada
tarea se marca solo con su comprobación **ejecutada** (CLAUDE.md §5). «Modelo»
es una recomendación. **▲** = punto de aprobación: se detiene el trabajo y se
espera a Julio. Las tareas suponen P-26 = A y P-27 = A; si Julio elige otra
opción, se reescriben antes de empezar.

Comando común previo a cada commit: `SITE_ORIGIN=http://localhost:3100 npm run verify`.

## Lista ordenada por dependencias

| # | Tarea | Depende de | Modelo · esfuerzo | Comprobación (a ejecutar) | CA | Estado |
|---|---|---|---|---|---|---|
| **▲B0** | **Julio aprueba spec y plan, y responde P-26 a P-33.** | — | Julio | Decisiones registradas en `PENDIENTES.md` | — | Pendiente |
| **T1** | **Preflight.** Rama y árbol limpio; `design-sources.test.ts` en verde (huellas); `npm ci`, `verify` y e2e como línea base. | ▲B0 | Sonnet · medio | Salidas de `git status`, `verify` (código 0) y e2e | CA-1 | Pendiente |
| **T2** | **Arnés de referencia.** Ejecutar `Arch3D.dc.html` sin modificar en una página aislada (scratchpad) con un *shim* de `DCLogic` y `site.css`; cuadros fijos (`reduced-motion`) de `hero` y `diagram` (capas −1, 0–3) a 1440 y 390 con Chromium sin cabeza. | T1 | Opus · alto | Cuadros guardados y reproducibles (dos ejecuciones idénticas); perfil y `canvas.dataset.quality` registrados | CA-12 | Pendiente |
| **T3** | **Port del motor.** `engine.ts`, `engine-shaders.ts` (literales), `engine-profile.ts`; `dispose()` completo; rótulos por parámetro. Sin React. | T2 | Opus · alto | Vitest de las partes puras (perfiles, escalera, rótulos); cuadros del *port* en el arnés frente a T2 dentro de la tolerancia de P-33 | CA-12 | Pendiente |
| **T4** | **Isla `Scene3D`.** `import()` al entrar en el viewport (margen 200 px), pausa, `reduced-motion`, respaldo `Plates stack`, pérdida de contexto, etiquetas DOM localizadas, liberación al desmontar. | T3 | Opus · alto | e2e: 0 peticiones y 0 contextos antes del viewport; sin WebGL → respaldo; pérdida de contexto → respaldo; `reduced-motion` → 1 cuadro; 10 navegaciones → ≤ 1 contexto | CA-3 a CA-7 | Pendiente |
| **T5** | **Textos.** Rótulos del atlas, etiquetas, recorrido del hero y textos de Arquitectura en `src/messages` (ES redactado, EN del diseño), `copy: 'draft'`; contenido de P-28 en `src/content/architecture.ts` con su esquema y la política de contenido. | ▲B0 (P-28) | Opus · alto | Vitest: claves ES = EN, política de contenido, rótulos ES caben en su celda (medido en el atlas) | CA-9, CA-13 | Pendiente |
| **T6** | **CSP y estático** (P-32). Build con el motor cargando en Inicio. | T4 | Sonnet · medio | `csp-scan` y manifiesto (34 rutas); `csp.spec.ts` P1–P14; 0 violaciones con la escena en marcha; HTML sin `style=` | CA-2, CA-10 | Pendiente |
| **T7** | **Inicio.** Hero con escena y recorrido fijado (P-30); «How it's built» con `mode="diagram"` sincronizado con `LayerPicker` y las etiquetas; se retiran `.hero-static` y el respaldo fijo de DA-2. | T4, T5, T6 | Opus · alto | e2e: pasos del recorrido al desplazar; selección de capa sincroniza panel, escena y etiquetas; ≤ 1040 px y `reduced-motion` sin fijar; axe | CA-2, CA-5, CA-8 | Pendiente |
| **▲B1** | **Revisión visual de Inicio con la escena** (ES/EN, 1440/390, con y sin WebGL). | T7 | Julio | Aprobación registrada | — | Pendiente |
| **T8** | **Arquitectura** (P-27, P-28): encabezado, pestañas de tipo de sistema, diagrama de bandas y nodos, inspector `Plates stack`, banda final; sin los nodos no confirmados. | ▲B1 | Opus · alto | e2e: pestañas y nodos con `aria-pressed`, inspector `aria-live`, teclado; sin textos vedados; réplica de `Technology.dc.html` a 1440/390 | CA-2, CA-8, CA-12, CA-13 | Pendiente |
| **▲B2** | **Julio revisa Arquitectura** (contenido y capturas). | T8 | Julio | Aprobación o cambios registrados | — | Pendiente |
| **T9** | **Pruebas transversales y presupuesto.** Rutas sin escena (0 *chunk*, 0 `canvas` tras hidratar), bytes de JavaScript por ruta, Long Tasks, LCP de laboratorio, consola limpia, desborde ES. | T8 | Sonnet · medio | e2e desktop y mobile; tabla de presupuesto con valores medidos frente a P-29 | CA-3, CA-11 | Pendiente |
| **T10** | **Fidelidad.** Cuadros del *port* frente al arnés (T2); páginas frente a réplicas de `Main` y `Technology`; tabla de diferencias aprobadas y no previstas. | T9 | Sonnet · medio (medición); Opus · alto si hay diferencias no previstas | `evidencia-t10-fidelidad.md` con capturas | CA-12 | Pendiente |
| **▲B3** | **Revisión final de Julio.** | T10 | Julio | Aprobación registrada | — | Pendiente |
| **T11** | **Cierre.** CA con evidencia; `TEST-PLAN.md` §8; `ARCHITECTURE.md` §2 y §6; `REFERENCIA-DISENO.md` §4.1 y §5; `PENDIENTES.md`; audit; push y CI de GitHub en verde. | ▲B3 | Sonnet · medio | `verify`, e2e, audit, CI | CA-1, CA-14, CA-15 | Pendiente |

## Rondas

| Ronda | Tareas | Paradas |
|---|---|---|
| R0 | Esta planificación | **▲B0** |
| R1 | T1–T3 (arnés y *port*) | revisión del informe de fidelidad del *port* |
| R2 | T4–T7 (isla, textos, CSP, Inicio) | ▲B1 |
| R3 | T8 (Arquitectura) | ▲B2 |
| R4 | T9–T11 | ▲B3 |
| R5 (reserva) | correcciones | — |

## Qué queda fuera de esta lista

Medición en GPU real (P-12); CSP en Firefox, Safari y CDN (P-17); formularios
(004); blog (005); hosting, DNS de registros, correo y despliegue (006, P-07).
