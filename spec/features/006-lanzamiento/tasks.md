# 006 — Tareas

**Estado: ▲C0 aprobada el 2026-11-13; ninguna tarea ha empezado.** La ronda R1
(T1–T8) empieza con el encargo de Julio. Cada tarea
se marca solo con su comprobación **ejecutada** (CLAUDE.md §5). «Modelo» es una
recomendación, salvo la T16, que Julio fijó. **▲** = punto de aprobación: se
detiene el trabajo y se espera a Julio. Las tareas suponen las opciones
recomendadas en `plan.md` §1, que son las que Julio eligió en ▲C0.

Comando común previo a cada commit: `SITE_ORIGIN=http://localhost:3100 npm run verify`.

**El agente no crea cuentas, no contrata, no toca DNS ni Cloudflare y no
despliega.** Donde dice «Julio», lo hace Julio con una guía escrita y el agente
comprueba el resultado desde fuera (`dig`, `curl`, Playwright).

## Lista ordenada por dependencias

| # | Tarea | Depende de | Modelo · esfuerzo | Comprobación (a ejecutar) | CA | Estado |
|---|---|---|---|---|---|---|
| **▲C0** | **Julio aprueba spec y plan, y responde P-38 a P-52.** (P-53 se decide en ▲C2.) | — | Julio | Decisiones registradas en `PENDIENTES.md` | — | **Hecha** (2026-11-13): spec y plan aprobados con las opciones recomendadas: P-38 A (Vercel Pro, condicionada a T10), P-39 A, P-40 A, P-41 A, P-42 A, P-43 A, P-44 A, P-45 A, P-46 tal cual, P-47 A, P-48 la recomendada, P-49 A, P-50 A, P-51 A y P-52 A, registradas en `PENDIENTES.md` y en `spec.md` §10. P-53, las puertas G1 a G4 y P-13 siguen abiertas |
| **T1** | **Preflight.** Rama y árbol limpio; `npm ci`, `verify` y e2e como línea base; tamaños de JavaScript y HTML por ruta anotados. | ▲C0 | Sonnet · medio | Salidas de `git status`, `verify` (código 0) y e2e | CA-1 | Pendiente |
| **T2** | **Puertas de publicación** (P-51). `scripts/release-gates.mjs`, activo solo con el origen de producción: G1 (`copy: 'draft'`), G2 (rótulo de borrador en Legal), G3 (icono y huella), G4 (correo configurado). Archivo de excepciones versionado y vacío. | T1 | Sonnet · medio | Vitest por regla; cuatro mutaciones (una por puerta) hacen fallar el build de producción; un build con otro origen no se ve afectado | CA-16 | Pendiente |
| **T3** | **Contacto provisional** (P-42, P-43). `ContactView`, isla `MailLink`, correo en dos partes en `src/config/site.ts`, texto sin JavaScript, textos `draft` en `es` y `en`. Sin dirección configurada no se pinta el enlace. | T1 | Opus · medio | e2e con y sin JavaScript, teclado y axe; **0 apariciones** del correo en `.next/server/app/**/*.{html,rsc}` y en `src/messages`; manifiesto sin cambios en el generador; `csp.spec.ts` en verde | CA-3 | Pendiente |
| **T4** | **Enlaces al estimador** (P-44). Los 9 enlaces de `spec.md` §1.6; `/estimate` fuera de `routing.ts` y de `src/app`; adaptación temporal anotada en `REFERENCIA-DISENO.md` §5. | T3 | Sonnet · medio | Manifiesto de 32 rutas; `/es/estimador` y `/en/estimate` → 404 propio; rastreo de enlaces internos en todas las rutas sin destinos vacíos; capturas ES/EN a 1440 y 390 | CA-2, CA-4 | Pendiente |
| **T5** | **SEO.** `src/lib/seo/` (título, descripción, canonical, alternates), `metadataBase`, indexación según el origen, `robots.ts`, `sitemap.ts`, JSON-LD (P-47), Open Graph (P-48), iconos si ya existen (G3). | T4 | Opus · alto | Vitest: alternates recíprocos, `x-default`, slugs por idioma, excepción del servicio 01; e2e sobre el HTML de cada ruta; dos builds (origen de producción y de prueba) para `robots` e indexación; sitemap = rutas indexables exactas; tabla «campo de JSON-LD → fuente» | CA-5 a CA-8 | Pendiente |
| **T6** | **Mensajes al navegador** (P-45, cierra P-24). El proveedor recibe solo los espacios que usan las islas. | T1 | Sonnet · medio | HTML por ruta antes y después (bytes y gzip); e2e completa; capturas de página completa idénticas a las de la línea base | CA-9 | Pendiente |
| **T7** | **Presupuesto por ruta** (P-46). Prueba de bytes de JavaScript y HTML, LCP, CLS y tiempo de bloqueo en **todas** las rutas, móvil emulado. P-34 medido de nuevo. | T5, T6 | Sonnet · medio | Tabla por ruta frente a los límites; una mutación (un *chunk* de más) hace fallar la prueba | CA-9 | Pendiente |
| **T8** | **CSP en Firefox y WebKit** (P-52). Proyectos nuevos en `playwright.config.ts` para `csp`, `not-found` y navegación; paso en la CI. | T5 | Opus · alto | P1–P14 en los tres motores con 0 violaciones, también con JSON-LD en la página; duración de la CI dentro de su tope | CA-11 | Pendiente |
| **▲C1** | **Julio revisa** Contacto, los enlaces, los metadatos y los textos nuevos (capturas ES/EN, 1440/390). | T2–T8 | Julio | Aprobación o cambios registrados | — | Pendiente |
| **T9** | **Hosting y preview** (P-38, P-40, P-41). Con la guía: cuenta y plan, acceso solo a este repositorio, entorno de preview con su `SITE_ORIGIN`, límite de gasto, analítica y medición de visitantes apagadas, segundo factor. | ▲C1 | **Julio**; guía: Sonnet · medio | El preview responde; capturas del panel entregadas por Julio; ninguna variable aparte de `SITE_ORIGIN` y `NEXT_TELEMETRY_DISABLED` | CA-14, CA-19 | Pendiente |
| **T10** | **Prueba del hosting en el preview.** Guion de CA-12 (a–f), encabezados por tipo de respuesta, 404, redirecciones, `robots.txt` del preview, ensayo de reversión. Si el manifiesto no llega al proxy: se detiene y se presenta P-53. | T9 | Opus · alto. **Si hay que tocar la carga del manifiesto: Fable 5.2 · alto, con aprobación previa** | `evidencia-c2-hosting.md` con la salida real de cada comprobación; si P-53 se aplica: P1–P14 y las mutaciones de la T18 repetidas | CA-10, CA-12, CA-17, CA-20 | Pendiente |
| **T11** | **e2e contra el preview** en los tres motores y **Safari real** (macOS e iOS) con la lista manual. | T10 | Sonnet · medio; lista: **Julio** | Suite en verde contra el preview; lista manual completada y fechada por Julio | CA-11 | Pendiente |
| **▲C2** | **Julio confirma el hosting** con la evidencia de T10 y T11, y decide P-53 si hizo falta. | T10, T11 | Julio | Decisión registrada; ADR 004 pasa a «Aceptada» | — | Pendiente |
| **T12** | **Auditoría de accesibilidad WCAG 2.2 AA.** axe con reglas A y AA de 2.0, 2.1 y 2.2 en todas las rutas y el 404 (1440 y 390) y la revisión manual de `plan.md` §4.4. | ▲C2 | Opus · alto | `auditoria-accesibilidad.md`: criterio, resultado y evidencia; hallazgos que cambien el aspecto, presentados para aprobación antes de tocar nada | CA-15 | Pendiente |
| **T13** | **Rendimiento detrás del CDN.** Muestra de rutas contra el preview; medición manual desde la red y el teléfono de Julio. | ▲C2 | Sonnet · medio; medición manual: Julio | Tabla laboratorio / preview; se dice qué no se pudo medir | CA-9 | Pendiente |
| **T14** | **Revisión OWASP ASVS** (P-49), secretos y dependencias. Requisitos tomados del documento oficial; búsqueda de secretos en el historial; `npm audit`; avisos de Next y React. | ▲C2 | Opus · alto | `auditoria-seguridad.md`: cada requisito con «cumple», «no aplica» (motivo) o «hallazgo» y su evidencia; `SECURITY.md` actualizado con el nivel elegido | CA-13, CA-14 | Pendiente |
| **T15** | **`security.txt`** (contacto por URL, `Expires` ≤ 1 año, idiomas) e **insumos de privacidad para G2**: qué registra el hosting y qué pasa por el reenvío de correo. No se redacta texto legal. | T14 | Sonnet · medio | `/.well-known/security.txt` servido y válido; nota entregada a Julio para el abogado | CA-13 | Pendiente |
| **▲C3** | **Julio cierra las puertas G1 a G4** y decide P-13. | T12–T15 | Julio (G2: con el abogado) | Las cuatro con fecha en `PENDIENTES.md`; un build con el origen de producción pasa `release-gates` | CA-16 | Pendiente |
| **T16** | **Auditoría de seguridad final previa a producción.** Revisión independiente del código y de la configuración que se van a publicar: CSP y proxy, encabezados reales, manifiesto, fugas del correo, secretos, dependencias, puertas, configuración del hosting y del DNS previsto, y los hallazgos de T14. | ▲C3 | **Fable 5.2 · alto** | Sección final de `auditoria-seguridad.md`; 0 hallazgos altos o críticos abiertos; mutaciones clave repetidas | CA-18, CA-20 | Pendiente |
| **T17** | **Lanzamiento técnico.** Merge aprobado a `main`; build con `SITE_ORIGIN=https://thisjulio.com`; Julio crea los registros de `plan.md` §3; humo y e2e de solo lectura contra producción. Si falla: reversión de `plan.md` §5.2. | T16 | **Julio** (merge y DNS); verificación: Sonnet · medio | `dig` y `curl -sI` de producción guardados; e2e de lectura en verde; 0 `Set-Cookie`, 0 peticiones a terceros | CA-10, CA-17, CA-19 | Pendiente |
| **▲C4** | **Lanzamiento público:** Julio da el sitio por publicado. | T17 | Julio | Aprobación registrada | — | Pendiente |
| **T18** | **Después del lanzamiento.** Observación de 72 h; DNSSEC (P-50, lo activa Julio; se verifica el `DS`); cierre con los CA y su evidencia; `TEST-PLAN.md` §8, `ARCHITECTURE.md`, `SECURITY.md`, ADR 004, `PENDIENTES.md`. | ▲C4 | Sonnet · medio | `verify`, e2e, audit, CI; `dig DS` con respuesta | CA-1, CA-21 | Pendiente |

## Rondas

| Ronda | Tareas | Paradas |
|---|---|---|
| R0 | Esta planificación | **▲C0** — aprobada por Julio (2026-11-13) |
| R1 | T1–T8 (código que no depende del hosting) | ▲C1 |
| R2 | T9–T11 (hosting y preview) | ▲C2 |
| R3 | T12–T15 (auditorías) | ▲C3 |
| R4 | T16–T17 (auditoría final y lanzamiento técnico) | ▲C4 |
| R5 | T18 (observación y cierre) | — |
| Reserva | Correcciones | — |

## Lo que Julio puede adelantar desde hoy

No dependen de ninguna tarea y son lo más lento del lanzamiento:

| Puerta | Qué preparar |
|---|---|
| G1 | Revisar los 101 textos de `spec/features/002-…/textos-borrador.md` y `spec/features/003-…/textos-borrador.md` |
| G2 | Encargar la revisión jurídica de Legal y Privacidad (P-09) |
| G3 | Entregar el favicon y los iconos (P-15) y, si la quiere, la imagen de Open Graph (P-48) |
| G4 | Elegir la dirección `@thisjulio.com` (P-42) |

## Qué queda fuera de esta lista

Formularios, estimador, correo de envío y antiabuso (004); blog (005); medición
en GPU real (P-12); alta en servicios de buscadores; analítica.
