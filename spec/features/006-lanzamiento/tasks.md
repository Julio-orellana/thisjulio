# 006 — Tareas

**Estado: R1 (T1–T8) ejecutada y aprobada en ▲C1 (2026-11-13). La R2 sigue
autorizada, pero se difiere por decisión de Julio del 2026-11-13: antes va la
R3-local** (partes de T12, T14 y T15 que corren en local; ver «Cambio de orden
del 2026-11-13» más abajo). ▲C0 aprobada el mismo día. Evidencia de la R1:
`evidencia-r1.md`. Cada tarea
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
| **T1** | **Preflight.** Rama y árbol limpio; `npm ci`, `verify` y e2e como línea base; tamaños de JavaScript y HTML por ruta anotados. | ▲C0 | Sonnet · medio | Salidas de `git status`, `verify` (código 0) y e2e | CA-1 | **Hecha** (2026-11-13) sobre `0b58658`: árbol limpio salvo `Flyer.png` sin seguimiento; `verify` código 0 (233 unitarias, manifiesto de 34 rutas); e2e 981 superadas, 53 omitidas a propósito, 0 fallidas (9,6 min). Tamaños de partida: JavaScript 157 684 B gzip por ruta sin escena; HTML 7 342 a 12 114 B gzip |
| **T2** | **Puertas de publicación** (P-51). `scripts/release-gates.mjs`, activo solo con el origen de producción: G1 (`copy: 'draft'`), G2 (rótulo de borrador en Legal), G3 (icono y huella), G4 (correo configurado). Archivo de excepciones versionado y vacío. | T1 | Sonnet · medio | Vitest por regla; cuatro mutaciones (una por puerta) hacen fallar el build de producción; un build con otro origen no se ve afectado | CA-16 | **Hecha; aprobada por Julio en ▲C1** (2026-11-13): `scripts/release-gates.mjs` (último paso de `npm run build`), `scripts/lib/release-gates.mjs` y `release-gates.json` con las cuatro puertas sin cerrar y la lista de excepciones vacía. Una puerta exige su condición **y** la fecha de Julio. 17 pruebas unitarias: desde las cuatro cerradas, estropear una sola cosa reabre exactamente esa puerta. Hoy, las cuatro abiertas; con el origen de producción el build sale con 1 y se borra el manifiesto de CSP (`evidencia-r1.md` §5). **Cambio frente a lo escrito:** las puertas leen el contenido como texto (no pueden importar TypeScript desde un script) y G2 mira el rótulo `.legal-draft` del HTML construido; una prueba comprueba que el recuento coincide con la capa de contenido (102) |
| **T3** | **Contacto provisional** (P-42, P-43). `ContactView`, isla `MailLink`, correo en dos partes en `src/config/site.ts`, texto sin JavaScript, textos `draft` en `es` y `en`. Sin dirección configurada no se pinta el enlace. | T1 | Opus · medio | e2e con y sin JavaScript, teclado y axe; **0 apariciones** del correo en `.next/server/app/**/*.{html,rsc}` y en `src/messages`; manifiesto sin cambios en el generador; `csp.spec.ts` en verde | CA-3 | **Hecha; aprobada por Julio en ▲C1** (2026-11-13): `ContactView`, isla `MailLink` y `src/config/contact.ts`. El correo va en **un archivo propio** y no en `site.ts` (lo importa una isla común y viajaría en el paquete de todas las rutas). Textos nuevos en `contact.json`, en borrador (102 bloques). **Sin dirección todavía** (`null`, puerta G4): la página muestra solo GitHub. Con una dirección de prueba en una copia aislada: 0 archivos del build con la dirección o con `mailto:`, y las pruebas del enlace en verde (`evidencia-r1.md` §3) |
| **T4** | **Enlaces al estimador** (P-44). Los 9 enlaces de `spec.md` §1.6; `/estimate` fuera de `routing.ts` y de `src/app`; adaptación temporal anotada en `REFERENCIA-DISENO.md` §5. | T3 | Sonnet · medio | Manifiesto de 32 rutas; `/es/estimador` y `/en/estimate` → 404 propio; rastreo de enlaces internos en todas las rutas sin destinos vacíos; capturas ES/EN a 1440 y 390 | CA-2, CA-4 | **Hecha; aprobada por Julio en ▲C1** (2026-11-13): manifiesto de **32 rutas**; `/es/estimador` y `/en/estimate` responden el 404 propio; `links.spec.ts` rastrea el HTML del servidor de las 30 rutas que no son el blog: todos los enlaces internos responden 200, ninguno va al estimador ni al blog. Adaptaciones D-21 a D-23 en `REFERENCIA-DISENO.md` §5. **Fuera de lo planeado:** (1) el botón «Estimar esto» de cada servicio, no listado → **P-54**; (2) **defecto de la 002 corregido**: en las páginas con slug en español el selector de idioma traía enlaces rotos en el HTML del servidor (`evidencia-r1.md` §2.2) |
| **T5** | **SEO.** `src/lib/seo/` (título, descripción, canonical, alternates), `metadataBase`, indexación según el origen, `robots.ts`, `sitemap.ts`, JSON-LD (P-47), Open Graph (P-48), iconos si ya existen (G3). | T4 | Opus · alto | Vitest: alternates recíprocos, `x-default`, slugs por idioma, excepción del servicio 01; e2e sobre el HTML de cada ruta; dos builds (origen de producción y de prueba) para `robots` e indexación; sitemap = rutas indexables exactas; tabla «campo de JSON-LD → fuente» | CA-5 a CA-8 | **Hecha; aprobada por Julio en ▲C1** (2026-11-13): `src/lib/seo/` (funciones puras), `robots.ts`, `sitemap.ts`, `JsonLd`. 27 pruebas unitarias y `seo.spec.ts` sobre el HTML: canonical y `hreflang` recíprocos en 28 páginas, duplicado del servicio 01 con canonical a `/servicios`, sitemap de 28 URL, `robots.txt` cerrado fuera de producción, JSON-LD solo en Inicio. Los dos orígenes se prueban con pruebas unitarias y con un build de producción en una copia aislada. **Sin iconos** (G3) **ni imagen de Open Graph** (P-48). `og:locale`: `es_GT` y `en_US`, para revisión. Tabla «campo → fuente»: `evidencia-r1.md` §4 |
| **T6** | **Mensajes al navegador** (P-45, cierra P-24). El proveedor recibe solo los espacios que usan las islas. | T1 | Sonnet · medio | HTML por ruta antes y después (bytes y gzip); e2e completa; capturas de página completa idénticas a las de la línea base | CA-9 | **Hecha; aprobada por Julio en ▲C1** (2026-11-13): al navegador viajan solo `common`, `nav` y `work` (`src/i18n/client-messages.ts`; una prueba falla si una isla usa otro espacio). HTML por ruta: de 7 342–12 114 a **4 646–10 583 B gzip**. Regresión visual: `evidencia-r1.md` §6 |
| **T7** | **Presupuesto por ruta** (P-46). Prueba de bytes de JavaScript y HTML, LCP, CLS y tiempo de bloqueo en **todas** las rutas, móvil emulado. P-34 medido de nuevo. | T5, T6 | Sonnet · medio | Tabla por ruta frente a los límites; una mutación (un *chunk* de más) hace fallar la prueba | CA-9 | **Hecha; aprobada por Julio en ▲C1** (2026-11-13): `tests/e2e/budget.spec.ts` en las 32 rutas. JavaScript 157 756–159 069 B gzip (Inicio 169 272), HTML ≤ 10 583 B gzip, LCP 608–1 088 ms, CLS 0, bloqueo 8–39 ms: todo dentro de P-46 en las condiciones aprobadas (4× CPU, 4G rápida). **Hallazgo → P-55:** con red más lenta, `/en/architecture` a 390 px da **CLS 0,11** (la fila de pestañas se reacomoda al llegar la fuente web); reproducible, y no se tocó la tipografía. La prueba toma la mejor de tres cargas en frío, como `scene-budget.spec.ts`. Mutación (un módulo pesado en una isla común): la prueba falla. `evidencia-r1.md` §6. **Tras el push:** en un ejecutor de GitHub el tiempo de bloqueo de Inicio dio 201–250 ms y la CI falló una de dos veces; en la CI la prueba admite el doble para ese indicador (el límite de laboratorio no cambia; `evidencia-r1.md` §8) |
| **T8** | **CSP en Firefox y WebKit** (P-52). Proyectos nuevos en `playwright.config.ts` para `csp`, `not-found` y navegación; paso en la CI. | T5 | Opus · alto | P1–P14 en los tres motores con 0 violaciones, también con JSON-LD en la página; duración de la CI dentro de su tope | CA-11 | **Hecha; aprobada por Julio en ▲C1** (2026-11-13): Firefox en la suite normal; **WebKit no funciona sobre `http://localhost`** (sube los scripts a HTTPS), así que se añadió el arnés `tests/https/run.mjs`, que corre CSP, 404 y navegación en los tres motores bajo `https://thisjulio.test`: en verde, WebKit 115 de 115. Firefox pierde a veces el aviso de carga de Playwright (la página sí cargó): 2 reintentos solo en ese proyecto. La CI instala los tres navegadores y corre el arnés (tope de 30 min): **en verde en GitHub**, con WebKit en Linux, en la ejecución del PR sobre `5a752f5` (14,7 min); la del push falló por el tiempo de bloqueo (T7). Detalle: `evidencia-r1.md` §7 y §8 |
| **▲C1** | **Julio revisa** Contacto, los enlaces, los metadatos y los textos nuevos (capturas ES/EN, 1440/390), **y decide P-54 y P-55**. | T2–T8 | Julio | Aprobación o cambios registrados | — | **Hecha** (2026-11-13): Julio aprobó la R1 con P-54 = A en sus dos puntos y P-55 = A (limitación aceptada). `og:locale` queda en `es_GT` y `en_US`. Los textos nuevos de Contacto siguen en borrador (G1). R2 autorizada |
| **T9** | **Hosting y preview** (P-38 = A-Hobby, P-40, P-41). Con la guía: cuenta **en el plan Hobby** (sin equipo Pro ni Spend Management), acceso solo a este repositorio, entorno de preview con su `SITE_ORIGIN`, analítica y medición de visitantes apagadas, segundo factor. | ▲C1 | **Julio**; guía: Sonnet · medio | El preview responde; capturas del panel entregadas por Julio (incluida la página **Usage**); ninguna variable aparte de `SITE_ORIGIN` y `NEXT_TELEMETRY_DISABLED` | CA-14, CA-19 | **Guía actualizada para Hobby** (2026-11-13): `guia-t9-hosting.md`, con las fuentes oficiales y lo que queda por confirmar en el panel. **Lo que sigue es de Julio**: nada creado ni conectado todavía. Diferida por decisión de Julio (2026-11-13) hasta que G1–G4 y P-13 estén casi cerrados; el motivo era el costo de Pro, que con Hobby desaparece: **Julio confirma si se mantiene el diferimiento** (ver «Cambio del 2026-11-13: Hobby») |
| **T10** | **Prueba del hosting en el preview.** Guion de CA-12 (a–f), encabezados por tipo de respuesta, 404, redirecciones, `robots.txt` del preview, ensayo de reversión. Si el manifiesto no llega al proxy: se detiene y se presenta P-53. **P-56 = A:** Julio quita la protección del preview al empezar y la reactiva al terminar; se comprueba que la dirección vuelve a pedir acceso. | T9 | Opus · alto. **Si hay que tocar la carga del manifiesto: Fable 5.2 · alto, con aprobación previa** | `evidencia-c2-hosting.md` con la salida real de cada comprobación; si P-53 se aplica: P1–P14 y las mutaciones de la T18 repetidas | CA-10, CA-12, CA-17, CA-20 | Pendiente |
| **T11** | **e2e contra el preview** en los tres motores y **Safari real** (macOS e iOS) con la lista manual. | T10 | Sonnet · medio; lista: **Julio** | Suite en verde contra el preview; lista manual completada y fechada por Julio | CA-11 | Pendiente |
| **▲C2** | **Julio confirma el hosting** con la evidencia de T10 y T11, y decide P-53 si hizo falta. | T10, T11 | Julio | Decisión registrada; ADR 004 pasa a «Aceptada» | — | Pendiente |
| **T12** | **Auditoría de accesibilidad WCAG 2.2 AA.** axe con reglas A y AA de 2.0, 2.1 y 2.2 en todas las rutas y el 404 (1440 y 390) y la revisión manual de `plan.md` §4.4. | ▲C1 (parte local); ▲C2 (parte en el preview) | Opus · alto | `auditoria-accesibilidad.md`: criterio, resultado y evidencia; hallazgos que cambien el aspecto, presentados para aprobación antes de tocar nada | CA-15 | Pendiente. Parte local adelantada a la R3-local (2026-11-13) |
| **T13** | **Rendimiento detrás del CDN.** Muestra de rutas contra el preview; medición manual desde la red y el teléfono de Julio. | ▲C2 | Sonnet · medio; medición manual: Julio | Tabla laboratorio / preview; se dice qué no se pudo medir | CA-9 | Pendiente |
| **T14** | **Revisión OWASP ASVS** (P-49), secretos y dependencias. Requisitos tomados del documento oficial; búsqueda de secretos en el historial; `npm audit`; avisos de Next y React. | ▲C1 (parte local); ▲C2 (parte en el preview) | Opus · alto | `auditoria-seguridad.md`: cada requisito con «cumple», «no aplica» (motivo) o «hallazgo» y su evidencia; `SECURITY.md` actualizado con el nivel elegido | CA-13, CA-14 | Pendiente. Parte local adelantada a la R3-local (2026-11-13) |
| **T15** | **`security.txt`** (contacto por URL, `Expires` ≤ 1 año, idiomas) e **insumos de privacidad para G2**: qué registra el hosting y qué pasa por el reenvío de correo. No se redacta texto legal. | T14 (parte local); T14 completa (parte en el preview) | Sonnet · medio | `/.well-known/security.txt` servido y válido; nota entregada a Julio para el abogado | CA-13 | Pendiente. Parte local adelantada a la R3-local (2026-11-13) |
| **▲C3** | **Julio cierra las puertas G1 a G4** y decide P-13. | T12–T15 | Julio (G2: con el abogado) | Las cuatro con fecha en `PENDIENTES.md`; un build con el origen de producción pasa `release-gates` | CA-16 | Pendiente |
| **T16** | **Auditoría de seguridad final previa a producción.** Revisión independiente del código y de la configuración que se van a publicar: CSP y proxy, encabezados reales, manifiesto, fugas del correo, secretos, dependencias, puertas, configuración del hosting y del DNS previsto, y los hallazgos de T14. | ▲C3 | **Fable 5.2 · alto** | Sección final de `auditoria-seguridad.md`; 0 hallazgos altos o críticos abiertos; mutaciones clave repetidas | CA-18, CA-20 | Pendiente |
| **T17** | **Lanzamiento técnico.** Merge aprobado a `main`; build con `SITE_ORIGIN=https://thisjulio.com`; Julio crea los registros de `plan.md` §3; humo y e2e de solo lectura contra producción. Si falla: reversión de `plan.md` §5.2. | T16 | **Julio** (merge y DNS); verificación: Sonnet · medio | `dig` y `curl -sI` de producción guardados; e2e de lectura en verde; 0 `Set-Cookie`, 0 peticiones a terceros | CA-10, CA-17, CA-19 | Pendiente |
| **▲C4** | **Lanzamiento público:** Julio da el sitio por publicado. | T17 | Julio | Aprobación registrada | — | Pendiente |
| **T18** | **Después del lanzamiento.** Observación de 72 h; DNSSEC (P-50, lo activa Julio; se verifica el `DS`); cierre con los CA y su evidencia; `TEST-PLAN.md` §8, `ARCHITECTURE.md`, `SECURITY.md`, ADR 004, `PENDIENTES.md`. | ▲C4 | Sonnet · medio | `verify`, e2e, audit, CI; `dig DS` con respuesta | CA-1, CA-21 | Pendiente |
| **TP** | **Paso a Pro** (P-38 = A-Hobby, P-57). **Fuera del camino crítico:** no depende de ninguna tarea ni la bloquea; se dispara cuando se cumple un criterio de P-57. El día del cambio, Julio sigue `guia-t9-hosting.md`, «Cuando actives Pro»: actualiza el equipo Hobby a Pro y crea un presupuesto de equipo en Spend Management (US$20) con la pausa de producción. Va **antes** de publicar cualquier contenido comercial. | Disparo de P-57 | **Julio**; verificación: Sonnet · bajo | Captura de **Billing** con el plan Pro y de **Spend Management** con el presupuesto y la pausa; el sitio sigue respondiendo igual (humo de solo lectura) | — | Pendiente: espera a P-57 |

## Rondas

| Ronda | Tareas | Paradas |
|---|---|---|
| R0 | Esta planificación | **▲C0** — aprobada por Julio (2026-11-13) |
| R1 | T1–T8 (código que no depende del hosting) | ▲C1 — **aprobada por Julio (2026-11-13)** |
| R3-local | Partes locales de T12, T14 y T15 (`next build` + `next start` y Playwright) | — (sin parada propia; Julio revisa el informe) |
| R2 | T9–T11 (hosting y preview) | ▲C2 — **diferida (2026-11-13)**: T9 cuando G1–G4 y P-13 estén casi cerrados |
| R3 (cierre) | T13 y las partes de T12, T14 y T15 que necesitan el preview | ▲C3 |
| R4 | T16–T17 (auditoría final y lanzamiento técnico) | ▲C4 |
| R5 | T18 (observación y cierre) | — |
| Reserva | Correcciones | — |

## Cambio de orden del 2026-11-13: la R3-local va antes de la R2

**Decisión de Julio (2026-11-13).** Se pospone la R2 y la contratación de Vercel
Pro hasta que las puertas G1–G4 y P-13 estén casi cerradas.

- **Motivo (de Julio).** Vercel Hobby es solo para uso no comercial y no tiene
  Spend Management, y no tiene sentido pagar Pro mientras el trabajo es local.
- **Orden nuevo.** R3-local (T12, T14 y T15 en sus partes que corren en local)
  → R2 (T9, T10, T11) → ▲C2 → cierre de la R3 (T13 y las partes de T12, T14 y
  T15 que necesitan el preview) → ▲C3. El orden original era R2 → ▲C2 → R3 →
  ▲C3.
- **Parte local:** lo que se comprueba con `next build` + `next start` y
  Playwright en esta máquina. **Parte en el preview:** lo que depende del
  hosting real (encabezados y caché del CDN, configuración del proyecto,
  registros del proveedor, pruebas de Julio contra la URL del preview). El
  reparto exacto de cada tarea se fija en su evidencia.
- **Qué no cambia.** P-38 = A (Vercel Pro, condicionada a la T10) sigue
  vigente: solo cambia cuándo se contrata. *(Superado el mismo día por P-38 =
  A-Hobby: ver «Cambio del 2026-11-13: Hobby».)* ▲C2 sigue cerrando la R2, P-53 se
  sigue decidiendo en ▲C2 con la evidencia de la T10, y P-56 = A se aplica igual
  en la T10 y la T11. Las puertas G1–G4 y P-13 siguen siendo de Julio. Nada
  contratado, conectado ni desplegado.

## Cambio del 2026-11-13: Hobby hasta la actividad comercial

**Decisión de Julio (2026-11-13), que modifica P-38.** El sitio se despliega en
**Vercel Hobby** (gratis) mientras THIS JULIO no tenga actividad comercial, y
pasa a **Pro** (US$20/mes) cuando empiece a hacer publicidad o a vender con la
página (P-38 = A-Hobby; disparador: P-57; tarea: **TP**).

- **Qué cambia en la T9.** No se crea equipo Pro ni se configura Spend
  Management (Hobby no lo tiene). Al pasar un límite de Hobby, Vercel pausa en
  vez de cobrar. Guía: `guia-t9-hosting.md`.
- **Qué no cambia.** La condición de la T10 y la alternativa C; P-53 se decide
  en ▲C2; P-56 = A en la T10 y la T11 (Vercel Authentication existe en Hobby);
  las puertas G1–G4 y P-13 siguen siendo de Julio.
- **Condición nueva.** Mientras esté en Hobby, el sitio debe leerse como
  portafolio personal (CV, proyectos, blog, contacto), no como oferta comercial.
  El inventario de lo que hoy se lee como oferta se entregó a Julio con este
  encargo; **no se ha aplicado ningún cambio** y la decisión es suya. Lo que
  decida afecta a la puerta G1 (textos) y debe estar resuelto antes de la T17.
- **Por confirmar (Julio).** El diferimiento de la R2 se justificó por el costo
  de Pro. Con Hobby ese costo desaparece; el orden R3-local → R2 queda como
  está escrito hasta que Julio diga otra cosa.

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
