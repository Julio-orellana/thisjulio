# 002 — Tareas

**Estado: propuesta, pendiente de aprobación de Julio.** Nada de esta lista se
ejecuta hasta que Julio apruebe `spec.md` y `plan.md`. Cada tarea se marca
solo con su comprobación **ejecutada** (CLAUDE.md §5). «Modelo» es una
recomendación (`plan.md` §8). **▲** = punto de aprobación: se detiene el
trabajo y se espera a Julio.

Comando común previo a cada commit: `SITE_ORIGIN=http://localhost:3100 npm run verify`.

## Lista ordenada por dependencias

| # | Tarea | Depende de | Modelo | Comprobación (a ejecutar) | CA | Estado |
|---|---|---|---|---|---|---|
| **T1** | **Preflight.** Confirmar rama de trabajo y `git status` limpio; recalcular las huellas SHA-256 de los 8 archivos del diseño usados (`Main`, `Work`, `CaseStudy`, `Services`, `About`, `Legal`, `Plates`, `Deploy`) y comparar con `REFERENCIA-DISENO.md` §2; `npm ci` y `verify` en verde como línea base. | Aprobación de spec y plan | Sonnet Medium | Salida de `git status`, huellas iguales, `verify` con código 0 | CA-1 | Pendiente |
| **T2** | **Esquemas y capa de contenido.** Añadir `zod` (versión exacta); `src/content/schema.ts`; `src/lib/content/index.ts` con `getProjects/getProject/getServices/getService/getAbout/getLegal/findTranslatedSlug/listStaticParams`; validación al importar. | T1 | Sonnet Medium | Vitest: casos negativos (idioma faltante, slug duplicado, campo vacío, marcador `[…]`, `status` inválido, ≠ 7 servicios, texto «24/7»/«SLA»); `npm audit --omit=dev` | CA-3, CA-15 | Pendiente |
| **T3** | **Contenido y mensajes (borradores).** `src/content/*` y `src/messages/{es,en}/*.json` con los 7 servicios, proceso, «cuentas tuyas», Home, Acerca de, Legal y el caso POS **solo con lo permitido en `spec.md` §3.3**. Inglés tomado del diseño; español redactado y marcado `copy: 'draft'`. Todo lo **[Pendiente de Julio]** se omite (sin marcadores visibles). | T2, **P-19 a P-22 respondidas o asumidas como «recomendado»** | **Opus High** (español de marca y afirmaciones del POS) | Vitest de claves `es`/`en` iguales; búsqueda de «24/7», «SLA», «aplicación web» junto a POS, nombres de proyectos no verificados; informe de cuántos bloques siguen en `draft` | CA-3, CA-4, CA-7, CA-12 | Pendiente |
| **T4** | **CSS del diseño por página.** Trasladar a `design.css` solo los bloques de `site.css` que usan Home, Trabajo, caso, Servicios, Acerca de y Legal; convertir los `style="…"` del diseño en clases `[app]`; añadir `scroll-margin-top` para anclas. Sin valores nuevos. | T1 | Sonnet Medium | `tokens.test.ts` y huella de `site.css` intactos; `grep` de `style=` en `src/` = 0; `verify` | CA-1, CA-10 | Pendiente |
| **T5** | **Primitivas `ui/`**: `SectionHead`, `Chip`, `TagList`, `PathLink`, `Row`, `Quote`, `ArrowLink` (Server Components). Muestra en `/es/sistema` (solo desarrollo). | T4 | Sonnet Medium | Captura de `/es/sistema` contra `DesignSystem` (1440/390); axe | CA-8, CA-9 | Pendiente |
| **T6** | **Spike y port de `Plates` sin `style=`.** Implementar las opciones A y B del `plan.md` §1.4 sobre los datos de `Plates.dc.html` (6 vistas + `stack`, modos `wide`, `flat`, `tall`, `active`); medir contra la réplica del diseño; elegir y documentar. | T4 | **Opus High** | Diferencia píxel a píxel a 1440 y 390 (reposo y hover) de las 7 vistas; `csp-scan` sin hallazgos; `csp.spec.ts` verde; informe de la opción elegida y descartadas | CA-8, CA-10 | Pendiente |
| **▲A1** | **Aprobación de `Plates`** (P-23): capturas, diferencias y opción elegida. | T6 | Julio | Aprobación registrada en `PENDIENTES.md` | — | Pendiente |
| **T7** | **`Deploy`** como Server Component (SVG del diseño) para Servicios 06. | T4 | Sonnet Medium | Captura vs artboard (1440/390); axe (el SVG lleva `role="img"` y etiqueta) | CA-8, CA-9 | Pendiente |
| **T8** | **Servicios y rutas.** `services/page.tsx` y `services/[slug]/page.tsx` (`generateStaticParams`, `dynamicParams = false`), pestañas como enlaces, `ServiceScroll`, panel, proceso, «cuentas tuyas», cierre; enlaces `services.item` en Footer/Home; conectar `findTranslatedSlug` al selector. | T3, T5, T7, **A1 no requerida** | **Opus High** | e2e: 14 rutas 200; slug inexistente → 404 propio SSR; pestañas con JS desactivado; geometría del panel bajo el encabezado (±8 px, 1440 y 390); `reduced-motion`; ida y vuelta ES⇄EN; manifiesto de CSP; axe | CA-2, CA-5, CA-6, CA-9, CA-10 | Pendiente |
| **▲A2** | **Revisión visual de Servicios** (capturas ES/EN, 1440/390). | T8 | Julio | Aprobación registrada | — | Pendiente |
| **T9** | **Trabajo.** `work/page.tsx`, `WorkItem`, `WorkGallery` (filtro oculto con <2 categorías), contador `aria-live`. | T3, T5, A1 | Sonnet Medium | e2e: 1 tarjeta, sin filtros, «1 proyecto»; prueba del filtro con datos de prueba de ≥2 categorías (fixture, no publicado); axe | CA-2, CA-4, CA-11 | Pendiente |
| **T10** | **Caso de estudio y caso POS.** `work/[slug]/page.tsx`, plantilla y contenido del POS según `spec.md` §3.3: sin nombre comercial/cliente/capturas/cifras/`Deploy`, con «funcionalidades del sistema». Auditoría línea por línea contra `caso-pos.md`. | T3, T9, A1, **P-19** | **Opus High** | e2e de las 2 rutas y slug inexistente; prueba de textos prohibidos; tabla «afirmación → fuente» anexa al `tasks.md` | CA-2, CA-4, CA-7, CA-12 | Pendiente |
| **▲A3** | **Julio revisa el caso POS** (textos ES/EN, stack, funcionalidades). | T10 | Julio | Aprobación o cambios registrados (P-19) | — | Pendiente |
| **T11** | **Home.** Hero sin 3D, tarjetas de Trabajo, filas de servicios, «How it's built» con `LayerPicker` + `Plates stack`, «This is Julio», cierre. | T5, T6/A1, T8, T9 | Sonnet Medium | e2e: 6 secciones en orden; sin `canvas`; capas con `aria-pressed` y panel `aria-live`; vista a 1440/390 vs artboard con DA-2 listada | CA-2, CA-11, CA-13 | Pendiente |
| **T12** | **Acerca de.** Intro sin retrato, filosofía, especialidades, método, tecnologías (solo las confirmadas, P-20), cierre; GitHub; sin CV ni LinkedIn. | T3, T5 | Sonnet Medium | e2e: sin enlaces CV/LinkedIn; solo GitHub real; vista vs artboard (DA-7 listada); axe | CA-2, CA-8, CA-9 | Pendiente |
| **T13** | **Legal.** Índice y 4 secciones con las anclas del Footer (`licenciamiento`, `propiedad-intelectual`, `privacidad`, `marco-legal` y sus equivalentes en inglés), banner «Borrador pendiente de revisión legal», sin correo. | T3, T4 | Sonnet Medium | e2e: cada ancla lleva a su sección bajo el encabezado; banner presente; ninguna afirmación vedada de `SECURITY.md` §6; axe | CA-2, CA-14 | Pendiente |
| **T14** | **Pruebas transversales.** Ampliar `routes.ts` y las e2e a las 34 rutas (CSP, red, cookies, `localStorage`, axe, texto prohibido, sin blog); desbordes del español a 1440/1024/768/390; mutaciones (marcador sin resolver, `style=` en línea, slug duplicado, página dinámica). | T8–T13 | Sonnet Medium | `npm run test:e2e` desktop y mobile: superadas/omitidas/fallidas registradas; cada mutación hace fallar su prueba | CA-2, CA-7, CA-9, CA-10 | Pendiente |
| **T15** | **Fidelidad visual.** Capturas ES y EN de las 7 páginas (y casos/servicios representativos) a 1440 y 390 contra la réplica de cada artboard; lista de diferencias aprobadas vs no previstas. | T14 | Sonnet Medium (medición); Opus High solo si hay diferencias no previstas | Capturas en `capturas/` de la feature; tabla de diferencias | CA-8 | Pendiente |
| **▲A4** | **Revisión final de Julio** (capturas, textos en `draft`, adaptaciones). | T15 | Julio | Aprobación registrada | — | Pendiente |
| **T16** | **Cierre.** CA con evidencia; `TEST-PLAN.md` §8; `ARCHITECTURE.md` §2 (✔); `PENDIENTES.md`; `REFERENCIA-DISENO.md` §5 (D-14 y adaptaciones); CI de GitHub Actions; `npm audit`; integridad de `sistema-pos` (`git status`/`log`, sin tocar). | A4 | Sonnet Medium | `verify`, e2e, audit, CI en verde; informe de textos aún en `draft` | CA-1, CA-15, CA-16 | Pendiente |

## Rondas

| Ronda | Tareas | Paradas |
|---|---|---|
| R1 | T1–T6 | ▲A1 (Plates) |
| R2 | T7–T8 | ▲A2 |
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
| **Opus High** | T3, T6, T8, T10 | T3: español de marca y límites de lo afirmable sobre el POS. T6: única solución técnica incierta, choca con la CSP y define la identidad visual de las tarjetas. T8: scroll bajo encabezado fijo, ARIA, rutas estáticas con slugs por idioma y 404 SSR. T10: redactar sobre un proyecto real sin inventar ni exponer datos. |

## Fuera de esta lista (no se hace en la 002)

Escena 3D y Arquitectura (003); Contacto y Estimador (004); blog (005); SEO,
sitemap, favicon, despliegue (006); CSP en otros navegadores (P-17); cambios
en `sistema-pos`.
