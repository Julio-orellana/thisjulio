# 002 — Tareas

**Estado: decisiones P-18 a P-23 registradas (2026-11-05); pendiente de la
aprobación expresa para implementar.** Nada de esta lista se ejecuta hasta
entonces. **Abiertas:** P-20 (lista de tecnologías y datos de Acerca de). P-23 (técnica definitiva de `Plates`)
**resuelta el 2026-11-12: opción A**. Cada tarea se marca
solo con su comprobación **ejecutada** (CLAUDE.md §5). «Modelo» es una
recomendación (`plan.md` §8). **▲** = punto de aprobación: se detiene el
trabajo y se espera a Julio.

Comando común previo a cada commit: `SITE_ORIGIN=http://localhost:3100 npm run verify`.

## Lista ordenada por dependencias

| # | Tarea | Depende de | Modelo | Comprobación (a ejecutar) | CA | Estado |
|---|---|---|---|---|---|---|
| **T1** | **Preflight.** Confirmar rama de trabajo y `git status` limpio; recalcular las huellas SHA-256 de los 8 archivos del diseño usados (`Main`, `Work`, `CaseStudy`, `Services`, `About`, `Legal`, `Plates`, `Deploy`) y comparar con `REFERENCIA-DISENO.md` §2; `npm ci` y `verify` en verde como línea base. | Aprobación de spec y plan | Sonnet Medium | Salida de `git status`, huellas iguales, `verify` con código 0 | CA-1 | **Hecha** (2026-11-12, `TEST-PLAN.md` §8) |
| **T2** | **Esquemas y capa de contenido.** Añadir `zod` (versión exacta); `src/content/schema.ts`; `src/lib/content/index.ts` con `getProjects/getProject/getServices/getService/getAbout/getLegal/findTranslatedSlug/listStaticParams`; validación al importar. | T1 | Sonnet Medium | Vitest: casos negativos (idioma faltante, slug duplicado, campo vacío, marcador `[…]`, `status` inválido, ≠ 7 servicios, texto «24/7»/«SLA»); `npm audit --omit=dev` | CA-3, CA-15 | **Hecha** (2026-11-12): `zod@4.6.7` exacta; la fábrica vive en `src/lib/content/create.ts` y la instancia con el contenido real en `index.ts` (T3); 47 unitarias nuevas; audit de producción 0 |
| **T3** | **Contenido y mensajes (borradores `copy: 'draft'`).** `src/content/*` y `src/messages/{es,en}/*.json` con los 7 servicios, proceso, «cuentas tuyas», Home, Acerca de, Legal y el caso POS **solo con lo permitido en `spec.md` §3.3**. Inglés tomado del diseño; español redactado y marcado `copy: 'draft'`. Todo lo **[Pendiente de Julio]** se omite (sin marcadores visibles): sin stack del POS, sin especialidades ni tecnologías (P-20), sin monitoreo, cobertura ni tiempos (P-22), sin retrato, CV ni LinkedIn. | T2 (P-18, P-19, P-21 y P-22 ya decididas) | **Opus High** (español de marca y afirmaciones del POS) | Vitest de claves `es`/`en` iguales; búsqueda de «24/7», «SLA», «aplicación web» junto a POS, nombres de proyectos no verificados; informe de cuántos bloques siguen en `draft` | CA-3, CA-4, CA-7, CA-12 | **Hecha** (2026-11-12): 34 de 34 bloques en `draft` (28 de `src/content` + 6 espacios de mensajes); 121 unitarias; mutaciones «24/7» en contenido y «Monitoring» en mensajes hacen fallar las pruebas. Riesgo: +5,4 KB de HTML por página (mensajes enviados al cliente), ver «R1 — resultado» |
| **T4** | **CSS del diseño por página.** Trasladar a `design.css` solo los bloques de `site.css` que usan Home, Trabajo, caso, Servicios, Acerca de y Legal; convertir los `style="…"` del diseño en clases `[app]`; añadir `scroll-margin-top` para anclas. Sin valores nuevos. | T1 | Sonnet Medium | `tokens.test.ts` y huella de `site.css` intactos; `grep` de `style=` en `src/` = 0; `verify` | CA-1, CA-10 | **Hecha** (2026-11-12): bloques de site.css de las 6 páginas (sin `Plates` → T6b, `Deploy` → T7, hero/3D → T11/003); 18 clases `[app]` por estilos en línea; `scroll-margin-top` ya venía en `.legal-sec` (92 px) y `.sv` (76 px); `design-css.test.ts` nuevo; huella de site.css y 48 tokens intactos; `grep style=` en `src/` = 0 |
| **T5** | **Primitivas `ui/`**: `SectionHead`, `Chip`, `TagList`, `PathLink`, `Row`, `Quote`, `ArrowLink` (Server Components). Muestra en `/es/sistema` (solo desarrollo). | T4 | Sonnet Medium | Captura de `/es/sistema` contra `DesignSystem` (1440/390); axe | CA-8, CA-9 | **Hecha** (2026-11-12): `src/components/ui/` (+ `Rows` y `signature` para la firma «This»). Contra una réplica estática con `site.css` y las mismas fuentes, a 1440 y 390: 7 bloques × 2 anchos con **0 diferencias** de caja y estilo computado y **0 píxeles distintos** (tras igualar la posición subpíxel y quitar el indicador de `next dev`); axe 0 violaciones. Capturas: `capturas/t5-primitivas-{1440,390}.png` |
| **T6a** | **Comparación A/B de `Plates` sin `style=`** (autorizada, P-23). Implementar las opciones A y B del `plan.md` §1.4 **en una copia aislada fuera del repositorio** sobre los datos de `Plates.dc.html` (6 vistas + `stack`, modos `wide`, `flat`, `tall`, `active`); medir contra la réplica del diseño; **no elegir**. | T4 | **Opus High** | Diferencia píxel a píxel a 1440 y 390 (reposo y hover) de las 7 vistas, por opción; `csp-scan`, `csp.spec.ts` y manifiesto sobre cada copia; informe `evidencia-t6-plates.md` con tamaño de CSS, complejidad y diferencias; CSP sin cambios | CA-8, CA-10 | **Hecha** (2026-11-12): `evidencia-t6-plates.md`. A: 140/140 + 28 (2×) capturas idénticas a la réplica; B (mejor variante, B3): 20/140 idénticas, 1,03 % de píxeles distintos. En las copias con la CSP real, ambas: build y manifiesto en verde, `csp.spec.ts` 118/22/0, 0 violaciones. **Sin elegir** |
| **▲A1** | **Julio elige la técnica definitiva de `Plates`** (P-23) con el informe de la T6a. | T6a | Julio | Decisión registrada en `PENDIENTES.md` | — | **Hecha** (2026-11-12): Julio eligió la **opción A**; registrado en `PENDIENTES.md` (P-23) |
| **T6b** | **Port definitivo de `Plates`** con la técnica elegida en `src/components/plates/` (y, si es la A, su generador de CSS sin tocar `scripts/csp-manifest.mjs`). | A1 | **Opus High** | Las comprobaciones de la T6a sobre el árbol real; `verify`; `csp.spec.ts` P1–P14 | CA-8, CA-10 | **Hecha** (2026-11-12): `src/components/plates/{data.mjs,Plates.tsx}`, `scripts/plates-css.mjs` (en `dev` y `build`), `plates.generated.css` versionada con prueba de que está al día; laboratorio solo de desarrollo en `/es/sistema/plates`. Contra la réplica del diseño: 100/100 capturas idénticas a 1× y 100/100 a 2× (25 vistas × 1440/390 × reposo/hover); 31 unitarias nuevas (sin `style=`, `csp-scan` limpio, clases definidas); `verify` 155/155; e2e 349/27/0 |
| **T7** | **`Deploy`** como Server Component (SVG del diseño) para Servicios 06. | T4 | Sonnet Medium | Captura vs artboard (1440/390); axe (el SVG lleva `role="img"` y etiqueta) | CA-8, CA-9 | **Hecha** (2026-11-12): `src/components/deploy/Deploy.tsx` con textos en `services.json` → `deploy` (ES en borrador). EN idéntico píxel a píxel a la réplica a 1440, 1040 y 390; rótulos ES medidos dentro de sus formas («SERVIDOR LOCAL» → «SERV. LOCAL»: sobresalía 8,6 u); axe 0 en ES y EN; capturas `t7-deploy-{1440,390}.png` |
| **T8** | **Servicios y rutas** (P-21 aprobada; sin renglón «Monitoreo» ni nota de cobertura, P-22). `services/page.tsx` y `services/[slug]/page.tsx` (`generateStaticParams`, `dynamicParams = false`), pestañas como enlaces, `ServiceScroll`, panel, proceso, «cuentas tuyas», cierre; enlaces `services.item` en Footer/Home; conectar `findTranslatedSlug` al selector. | T3, T5, T7 | **Opus High** | e2e: 14 rutas 200; slug inexistente → 404 propio SSR; pestañas con JS desactivado; geometría del panel bajo el encabezado (±8 px, 1440 y 390); `reduced-motion`; ida y vuelta ES⇄EN; manifiesto de CSP; axe | CA-2, CA-5, CA-6, CA-9, CA-10 | **Hecha** (2026-11-12): `ServicesView`, isla `ServiceScroll` (1 024 B, gzip 655), `services/page.tsx` y `services/[slug]/page.tsx` (`generateStaticParams` por idioma, `dynamicParams = false`); selector ES ⇄ EN con pares de slugs desde el servidor. Manifiesto: **32 rutas**. `services.spec.ts`: 138 pruebas por pasada, 3 pasadas sin fallos ni inestables; mutación sin desplazamiento → 6 fallan. Contra la réplica de `Services.dc.html` (01, EN): cajas idénticas en 6 secciones a 1440 y 390; píxeles idénticos salvo pestañas 05/07 (D-02, D-03). e2e completo 497/37/0 |
| **▲A2** | **Revisión visual de Servicios** (capturas ES/EN, 1440/390). | T8 | Julio | Aprobación registrada | — | **Hecha** (2026-11-12): Julio aprobó la revisión visual de Servicios |
| **T9** | **Trabajo.** `work/page.tsx`, `WorkItem`, `WorkGallery` (filtro oculto con <2 categorías), contador `aria-live`. | T3, T5, T6b | Sonnet Medium | e2e: 1 tarjeta, sin filtros, «1 proyecto»; prueba del filtro con datos de prueba de ≥2 categorías (fixture, no publicado); axe | CA-2, CA-4, CA-11 | **Hecha** (2026-11-12): `WorkView` (servidor, sin JavaScript propio: medido igual que `/acerca-de`), `WorkItem`, isla `WorkGallery` lista pero **sin conectar** mientras haya < 2 categorías (Next envía toda isla importada aunque no se pinte: 4,9 KB, 8,1 KB con `next/dynamic`); `work.test.ts` falla cuando haya una segunda categoría. Filtro probado con datos de prueba en `/es/sistema/trabajo` (solo desarrollo): chips con `aria-pressed`, contador, `flip`, Enter/Espacio, axe 0 a 1440 y 390. e2e: 1 tarjeta, sin filtros, «1 proyecto» |
| **T10** | **Caso de estudio y caso POS.** `work/[slug]/page.tsx`, plantilla y contenido del POS según `spec.md` §3.3: sin nombre comercial/cliente/capturas/cifras/`Deploy`, con «funcionalidades del sistema». Auditoría línea por línea contra `caso-pos.md`. | T3, T9, T6b | **Opus High** | e2e de las 2 rutas y slug inexistente; prueba de textos prohibidos; tabla «afirmación → fuente» anexa al `tasks.md` | CA-2, CA-4, CA-7, CA-12 | **Hecha** (2026-11-12): `CaseView` + `work/[slug]/page.tsx` (`generateStaticParams` por idioma, `dynamicParams = false`); manifiesto de **34 rutas**. Solo «Tipo», «Resumen», 10 funcionalidades con su aviso y cierre. `work.spec.ts`: 2 rutas, 5 slugs ajenos/borrador/inexistentes → 404 SSR, textos vedados, ida y vuelta ES⇄EN, axe. Tabla «afirmación → fuente» abajo. Capturas `t10-*` |
| **▲A3** | **Julio revisa el caso POS** (textos ES/EN, stack, funcionalidades). | T10 | Julio | Aprobación o cambios registrados (P-19) | — | **Esperando a Julio** (capturas `t10-*` y auditoría «afirmación → fuente») |
| **T11** | **Home.** Hero sin 3D, tarjetas de Trabajo, filas de servicios, «How it's built» con `LayerPicker` + `Plates stack`, «This is Julio», cierre. | T5, T6b, T8, T9 | Sonnet Medium | e2e: 6 secciones en orden; sin `canvas`; capas con `aria-pressed` y panel `aria-live`; vista a 1440/390 vs artboard con DA-2 listada | CA-2, CA-11, CA-13 | Pendiente |
| **T12** | **Acerca de.** Intro sin retrato, filosofía, especialidades, método, tecnologías (solo las confirmadas, P-20), cierre; GitHub; sin CV ni LinkedIn. | T3, T5, **P-20 (lista definitiva y datos, abiertos)** | Sonnet Medium | e2e: sin enlaces CV/LinkedIn; solo GitHub real; sin especialidades ni tecnologías hasta que Julio apruebe la lista; vista vs artboard (DA-7 listada); axe | CA-2, CA-8, CA-9 | Pendiente |
| **T13** | **Legal.** Índice y 4 secciones con las anclas del Footer (`licenciamiento`, `propiedad-intelectual`, `privacidad`, `marco-legal` y sus equivalentes en inglés), banner «Borrador pendiente de revisión legal», sin correo. | T3, T4 | Sonnet Medium | e2e: cada ancla lleva a su sección bajo el encabezado; banner presente; ninguna afirmación vedada de `SECURITY.md` §6; axe | CA-2, CA-14 | Pendiente |
| **T14** | **Pruebas transversales.** Ampliar `routes.ts` y las e2e a las 34 rutas (CSP, red, cookies, `localStorage`, axe, texto prohibido, sin blog); desbordes del español a 1440/1024/768/390; mutaciones (marcador sin resolver, `style=` en línea, slug duplicado, página dinámica). | T8–T13 | Sonnet Medium | `npm run test:e2e` desktop y mobile: superadas/omitidas/fallidas registradas; cada mutación hace fallar su prueba | CA-2, CA-7, CA-9, CA-10 | Pendiente |
| **T15** | **Fidelidad visual.** Capturas ES y EN de las 7 páginas (y casos/servicios representativos) a 1440 y 390 contra la réplica de cada artboard; lista de diferencias aprobadas vs no previstas. | T14 | Sonnet Medium (medición); Opus High solo si hay diferencias no previstas | Capturas en `capturas/` de la feature; tabla de diferencias | CA-8 | Pendiente |
| **▲A4** | **Revisión final de Julio** (capturas, textos en `draft`, adaptaciones). | T15 | Julio | Aprobación registrada | — | Pendiente |
| **T16** | **Cierre.** CA con evidencia; `TEST-PLAN.md` §8; `ARCHITECTURE.md` §2 (✔); `PENDIENTES.md`; `REFERENCIA-DISENO.md` §5 (D-14 y adaptaciones); CI de GitHub Actions; `npm audit`; integridad de `sistema-pos` (`git status`/`log`, sin tocar). | A4 | Sonnet Medium | `verify`, e2e, audit, CI en verde; informe de textos aún en `draft` | CA-1, CA-15, CA-16 | Pendiente |

## Rondas

| Ronda | Tareas | Paradas |
|---|---|---|
| R1 | T1–T5, T6a | ▲A1 (Julio elige la técnica de `Plates`) |
| R2 | T6b, T7–T8 | ▲A2 |
| R3 | T9–T10 | ▲A3 |
| R4 | T11–T13 | revisión de textos (P-22) |
| R5 | T14–T16 | ▲A4 |
| R6 (reserva) | correcciones | — |

T3 (contenido) puede adelantarse a R1 si Julio responde P-19 a P-22 antes; si
no, se redacta con la opción **[Recomendada]** de cada pendiente y se marca
`draft`.

## Qué puede ejecutarse con cada modelo

| Modelo | Tareas | Por qué |
|---|---|---|
| **Sonnet Medium** | T1, T2, T4, T5, T7, T9, T11, T12, T13, T14, T15 (medición), T16 | Traslado fiel de CSS/markup con la spec cerrada, componentes de presentación, esquemas, pruebas derivadas de criterios ya escritos, documentación de evidencia. |
| **Opus High** | T3, T6a, T6b, T8, T10 | T3: español de marca y límites de lo afirmable sobre el POS. T6: única solución técnica incierta, choca con la CSP y define la identidad visual de las tarjetas. T8: scroll bajo encabezado fijo, ARIA, rutas estáticas con slugs por idioma y 404 SSR. T10: redactar sobre un proyecto real sin inventar ni exponer datos. |

## R1 — alcance definitivo (T1–T5 y T6a)

**No se ejecuta hasta la aprobación expresa.** R1 termina con el commit de
T1–T5, el informe de T6a y la parada ▲A1. Sin T6b, sin páginas, sin CSP tocada.

### Archivos que se modificarían o crearían

| Tarea | Archivos |
|---|---|
| T1 | Ninguno de la aplicación. Fila de evidencia en `TEST-PLAN.md` §8 |
| T2 | `package.json` y `package-lock.json` (solo `zod`, versión exacta); `src/content/schema.ts`; `src/lib/content/index.ts`; `tests/unit/content-schema.test.ts`; `tests/unit/content-slugs.test.ts` |
| T3 | `src/content/{projects,services,about,legal,process}.ts`; `src/messages/{es,en}/{home,work,services,about,legal,cta}.json`; `src/i18n/messages.ts` (registro de los nuevos espacios de nombres); ampliación de `tests/unit/messages.test.ts` (claves iguales, texto prohibido) |
| T4 | `src/styles/design.css` (y `globals.css` solo si hace falta importar); `tests/unit/tokens.test.ts` sin cambios |
| T5 | `src/components/ui/*`; `src/app/[locale]/sistema/page.dev.tsx` (solo desarrollo) |
| T6a | Nada en el repositorio salvo `spec/features/002-…/evidencia-t6-plates.md` y capturas en `capturas/`; el código de A y B vive en una copia aislada |

**No se tocan:** `src/proxy.ts`, `src/lib/security/*`, `scripts/csp-manifest.mjs`,
`scripts/lib/csp-scan.mjs`, `next.config.ts`, `docs/design/fuente/site.css`,
`src/app/[locale]/*/page.tsx`, `routing.ts`, Nav, Footer, `sistema-pos`.

### Criterios de aceptación de R1

| Criterio | Verificación |
|---|---|
| CA-1 parcial: `verify` en verde tras cada commit | `SITE_ORIGIN=http://localhost:3100 npm run verify` |
| CA-3: el esquema rechaza idioma faltante, slug duplicado, campo vacío, marcador `[…]`, `status` o `copy` inválido, ≠ 7 servicios, proyecto `approved` sin `source` | Vitest con casos negativos |
| CA-4 y CA-7 (nivel de contenido): solo el POS aprobado; ninguna cadena «24/7», «SLA», «tiempos de respuesta», «monitoreo», «cobertura» ni stack del POS, ni nombres de proyectos no verificados | Vitest sobre `src/content` y `src/messages` |
| CA-5 (nivel unitario): `findTranslatedSlug` ida y vuelta de los 7 servicios y del caso; sin traducción → padre | Vitest |
| CA-15: solo `zod` añadido; audit de producción sin vulnerabilidades | `git diff package.json`; `npm audit --omit=dev` |
| CA-10 (sin regresión): 18 rutas estáticas con su CSP y `csp.spec.ts` P1–P14 en verde; `grep 'style='` en `src/` = 0 | `npm run test:e2e` (build previo) y `grep` |
| T4: huella de `site.css` y 48 tokens intactos | `tokens.test.ts` |
| T6a: informe con, para A y B, diferencia píxel a píxel en 7 vistas × 2 anchos × (reposo, hover), peso del CSS, resultado de `csp-scan` y de `csp.spec.ts` | `evidencia-t6-plates.md` |

### Pruebas necesarias

Unitarias nuevas: esquema (negativos), `findTranslatedSlug`, `listStaticParams`
(34 pares tras T8; en R1, los de contenido), texto prohibido, claves ES/EN.
Existentes que deben seguir verdes: 53 unitarias y Playwright (desktop y
mobile) de la 001. No hay pruebas e2e nuevas en R1 porque no hay páginas.

### Riesgos de R1

Que ninguna de A/B iguale el diseño (se informa; no se relaja la CSP); que
`zod` 4.x cambie de versión estable (se fija la verificada en el registro ese
día); que el español de T3 afirme de más (todo en `draft`, revisión de Julio).

## R1 — resultado (2026-11-12)

Tareas T1–T5 y T6a hechas; **parada en ▲A1**. Sin páginas nuevas, sin CSP tocada.

| Comprobación | Resultado |
|---|---|
| `SITE_ORIGIN=http://localhost:3100 npm run verify` tras cada commit | Código 0; 124/124 unitarias (53 de la 001 + 71 nuevas); manifiesto de 18 rutas |
| `npm run test:e2e` (desktop y mobile) sobre `bc7004c` | 349 superadas, 27 omitidas a propósito, 0 fallidas (igual que al cerrar la 001) |
| `npm audit --omit=dev` | 0 vulnerabilidades (solo se añadió `zod@4.6.7`) |
| `grep -rn 'style=' src` | 0 |
| Textos en `draft` | 34 de 34 bloques (28 de `src/content` + 6 espacios de mensajes) |

Riesgos detectados en R1 (para R2 en adelante):

- **Mensajes en cada página.** `NextIntlClientProvider` (en `SiteDocument`) envía
  al cliente todos los mensajes del idioma: con los espacios de la 002, el HTML
  de cada página creció ~5,4 KB sin comprimir (`/es`: 17 503 → 22 959 B). Propuesta
  para R2, a aprobar: pasar al proveedor solo los espacios que usan las islas.
- **Inicio sin retrato.** `.me` reserva una columna 4/12 para el retrato (D-12);
  sin él queda un hueco, como en Acerca de (DA-7). Se resuelve en T11 con la
  misma decisión que DA-7.
- **Hero sin 3D.** Las reglas `.hero`/`.hero-pin` del diseño suponen la escena 3D
  y el recorrido fijado; con DA-2 la T11 debe usar el estado sin fijar que el
  propio diseño define (`reduced-motion` / `min-height: 1800px`).
- **Capa Datos de Inicio.** Se quitaron «PostgreSQL» y «MongoDB» del texto y de
  las etiquetas (P-20) y la frase de las luces animadas del 3D (DA-2). El atlas
  3D de la 003 también los rotula.
- **Cierre de Inicio.** «An indicative range at the end» se omitió: sin tarifas
  (P-06) el estimador no da un rango de precio.

## R2 — resultado (2026-11-12)

T6b, T7 y T8 hechas; ▲A2 **aprobada por Julio el 2026-11-12** (revisión visual de Servicios). CSP,
proxy, manifiesto y `next.config.ts` sin cambios.

| Comprobación | Resultado |
|---|---|
| `SITE_ORIGIN=http://localhost:3100 npm run verify` | Código 0; 156/156 unitarias; manifiesto de **32 rutas** (18 + 14 de servicios) |
| `npm run test:e2e` (desktop y mobile) | 497 superadas, 37 omitidas a propósito, 0 fallidas. Solo Chromium (P-17) |
| `npm audit --omit=dev` | 0 vulnerabilidades (sin dependencias nuevas en R2) |
| `Plates` en el árbol real contra la réplica | 100/100 capturas idénticas a 1× y 100/100 a 2× |
| `Deploy` (EN) contra la réplica | idéntico a 1440, 1040 y 390 |
| Servicios (01, EN) contra la réplica de `Services.dc.html` | cajas idénticas en las 6 secciones a 1440 y 390; píxeles idénticos salvo los nombres de las pestañas 05 y 07 (D-03, D-02) |

Para la revisión de Julio (▲A2): `capturas/t8-servicios-{01,06,07}-{1440,390}.png`
(ES | EN, página completa), `capturas/t8-servicios-replica-vs-app-{1440,390}.png`
(réplica | app | diferencia ×4) y `capturas/t7-deploy-{1440,390}.png`.

Hallazgos de R2:

- **Negrita de los títulos `.mono`.** El preflight de Tailwind quitaba el negrito
  por omisión de `h1`–`h6`; el diseño (sin preflight) lo muestra en «What you
  get», «Overview», «Who I am». Se restauró con una regla `[app]` de
  especificidad cero; ningún título de las páginas de la 001 cambia (todos
  fijan su peso con `.h1/.h2/.h3`). Lo detectó la comparación de la T8.
- **Desplazamiento del panel.** El panel entra con `svIn` (`translateY(8px)`):
  medirlo durante la animación dejaba el título 8,2 px más abajo con
  desplazamiento suave. La isla descuenta esa traslación (el diseño tiene el
  mismo desvío, dentro de su tolerancia).
- **Rótulos ES de `Deploy`.** «SERVIDOR LOCAL» sobresalía 8,6 unidades de su
  rectángulo; se usa «SERV. LOCAL». «CLIENTE» cabe justo en su caja. Textos ES en
  `draft` (P-22).
- **`/servicios` y `/servicios/desarrollo-a-la-medida` muestran lo mismo**
  (servicio 01), como pide la spec §3.4; el canonical es de la 006.
- **Pruebas ajustadas:** `csp.spec.ts` P1–P3 cubren las 32 rutas; P6 espera el
  h1 real de Servicios. Sin JavaScript, el clic de Playwright usa `force` (su
  espera de estabilidad depende de `requestAnimationFrame`).

## R3 — resultado (2026-11-12)

T9 y T10 hechas; **parada en ▲A3** (Julio revisa el caso POS: textos ES/EN y
funcionalidades). CSP, proxy, manifiesto y `next.config.ts` sin cambios.

| Comprobación | Resultado |
|---|---|
| `SITE_ORIGIN=http://localhost:3100 npm run verify` | Código 0; 160/160 unitarias; manifiesto de **34 rutas** (18 + 14 servicios + 2 del caso) |
| `npm run test:e2e` (desktop y mobile) | 534 superadas, 38 omitidas a propósito, 0 fallidas. Solo Chromium (P-17) |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| JavaScript por página | `/trabajo` igual que `/acerca-de` (sin isla). Todas bajan 14 313 B al corregir `global-error.tsx` |
| Filtro con datos de prueba (`/es/sistema/trabajo`, `next dev`) | 10/10 comprobaciones a 1440 y 390 (estado, contador, `flip`, teclado, axe) |

Para ▲A3: `capturas/t10-caso-pos-{1440,390}.png`, `capturas/t10-trabajo-{1440,390}.png`
y la tabla «afirmación → fuente» de abajo.

Hallazgos de R3:

- **Regresión de la T3 corregida.** `global-error.tsx` importaba todos los
  mensajes y, como viaja con todas las páginas, cada una cargaba ~14 KB de
  textos de la 002. Ahora importa solo `common`.
- **Isla del filtro sin conectar.** Next envía al navegador toda isla que la
  página importa, aunque no la pinte. Con un solo proyecto, `WorkView` no la
  importa; una prueba avisa cuando Julio apruebe una segunda categoría.
- **Composición del caso con datos mínimos** (para la revisión): «Resumen»
  ocupa una de las tres columnas de `.case-trio` (problema y solución
  omitidos, P-19), y «Tipo» es el único dato de `.case-meta`. No se rellenó
  nada para ocupar el espacio.
- **Barra de Trabajo sin filtros (DA-4):** el contador queda solo, a la
  izquierda, y la barra es más baja que con los chips del diseño.

## T10 — Auditoría del caso POS: afirmación → fuente (2026-11-12)

Cada texto publicado en `/es/trabajo/sistema-pos-de-escritorio` y
`/en/work/desktop-pos-system` (contenido en `src/content/projects.ts`, todo
`copy: 'draft'`), contra `docs/portafolio/caso-pos.md`. Para ▲A3.

| Elemento en la página | Texto (ES / EN) | Fuente | Estado |
|---|---|---|---|
| Título y migas | «Sistema POS de escritorio» / «Desktop POS System» | §1 (descripción autorizada, genérica) y P-02 (sin nombre comercial) | Genérico, sin nombre de producto ni cliente |
| Línea | «Sistema POS de escritorio para un comercio de productos agrícolas en Guatemala.» / «Desktop POS system for an agricultural products business in Guatemala.» | §1, literal | Autorizada |
| Tipo | «Aplicación de escritorio» / «Desktop application» | §2 («Aplicación de escritorio (no web)») | Comprobado |
| Resumen | «… arquitectura offline-first: trabaja con los datos en el equipo local y los respalda en la nube.» | §2 (offline-first, SQLite local, respaldo en la nube) y §3 «Operación local», «Respaldo en la nube» | Comprobado; sin nombrar la tecnología (P-19) |
| Aviso de las funcionalidades | «Funcionalidades del sistema, según su documentación. No son resultados medidos.» | §3 («Documentadas, no verificadas en ejecución … nunca "probadas en producción"») | Exigido por §3 |
| 01 Operación local | — | §3, `src/main/database` | Documentada |
| 02 Usuarios y roles | — | §3, `src/main/domain/usuarios` | Documentada |
| 03 Autorización remota con códigos temporales (TOTP) | — | §3, `spec/features/003-anulacion-autorizacion-remota` | Documentada; redacción pendiente de Julio (P-19 b) |
| 04 Gestión de caja | — | §3, `src/main/domain/caja` | Documentada |
| 05 Catálogo e inventario | — | §3, `src/main/domain/catalogo` | Documentada |
| 06 Ventas, con topes de descuento según el rol | — | §3 («topes de descuento por rol») | Documentada |
| 07 Recibos y soporte de impresión | — | §3, `src/main/recibo`, `src/main/impresora` | Documentada; la impresión física NO está verificada (§4) y no se afirma |
| 08 Reportes y auditoría | — | §3, `src/main/domain/reportes` | Documentada |
| 09 Respaldo en la nube | — | §3, `sincronizacion`, `restauracion` | Documentada; no se afirma sincronización entre terminales (§4) |
| 10 Instalador para Windows | — | §3, `electron-builder.yml` (NSIS) | Documentada |
| Vista `Plates` (pos) | Composición abstracta del diseño, `aria-hidden` | Diseño aprobado; no es una captura (P-03) | Decorativa |
| Cierre | «¿Necesitas un sistema hecho para tu operación?» + «Iniciar un proyecto» / «Hacer una pregunta» | Diseño (`CaseStudy.dc.html`, CTA del POS) | Texto comercial en borrador (P-04) |

**Omitido a propósito** (sin marcador visible): nombre comercial y cliente
(P-02); stack Electron/React/TypeScript/SQLite (P-19); problema y solución
(P-19); año, rol y enlace (D-12); `Deploy` (D-14); pantallas (P-03);
resultados y cifras (§4); siguiente proyecto (un solo caso). **No se afirma**
nada de §4: multi-sucursal, SaaS, sincronización entre terminales, facturación
electrónica, crédito, hardware o rendimiento reales. `work.spec.ts` lo
comprueba en el texto de la página (incluido «aplicación web», nombres de
tecnologías, años y porcentajes).

## Decisiones aún abiertas

| ID | Qué falta | Bloquea |
|---|---|---|
| P-20 | Lista definitiva de especialidades y tecnologías; datos personales y profesionales (retrato, CV, LinkedIn: P-11); composición sin retrato (DA-7) | T12 (Acerca de), no R1 |
| ~~P-23~~ | **Resuelta (2026-11-12): opción A.** | Ya no bloquea: la T6b implementa A |
| P-21 (parcial) | Aprobar los slugs concretos de `plan.md` §3 antes de publicar | Publicación (006); T8 puede usar los propuestos |
| P-04, P-08, P-09, P-11, P-02, P-03 | Sin cambios | Ver `PENDIENTES.md` |

## Fuera de esta lista (no se hace en la 002)

Escena 3D y Arquitectura (003); Contacto y Estimador (004); blog (005); SEO,
sitemap, favicon, despliegue (006); CSP en otros navegadores (P-17); cambios
en `sistema-pos`.
