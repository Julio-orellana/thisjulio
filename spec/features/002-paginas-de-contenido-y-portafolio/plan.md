# 002 — Plan

**Estado:** implementado; Feature 002 **cerrada el 2026-11-12** (`tasks.md`, «Cierre»).
Decisiones P-18 a P-23 registradas el 2026-11-05 (`spec.md` §0.1). Abiertas: lista de
tecnologías y datos de Acerca de (P-20) y **técnica definitiva de `Plates`**
(P-23, **resuelta el 2026-11-12: opción A**, ver §1.4). No se implementa nada hasta la aprobación.

## 0. Lo que se leyó antes de planear

- Repositorio en `9ce2401`: `CLAUDE.md`, `ARCHITECTURE.md`, `SECURITY.md`,
  `TEST-PLAN.md`, roadmap, ADR 001–006, `docs/PENDIENTES.md`,
  `docs/portafolio/caso-pos.md`, `docs/design/REFERENCIA-DISENO.md`, plan,
  spec y tasks de la 001.
- Código: `routing.ts`, `alternate.ts`, `PageSkeleton`, `design.css`,
  `site.ts`, `Footer.tsx`, mensajes `es/en`, `scripts/lib/csp-scan.mjs`
  (regla `style=` en línea), pruebas e2e y unitarias existentes.
- Diseño aprobado, versión `1793843453-74ee`, leído desde el artefacto:
  `Main`, `Work`, `CaseStudy`, `Services`, `About`, `Legal`, `Plates`,
  `Deploy`. Las huellas SHA-256 de los 8 archivos coinciden con las registradas.
- `sistema-pos`: **no se abrió** en esta ronda; se usa solo lo ya revisado y
  registrado en `caso-pos.md`.
- No estuvieron disponibles `claude/DESIGN.md` ni `TECH-STACK.md` (P-01).

## 1. Arquitectura de implementación

### 1.1 Estructura (se anota en `ARCHITECTURE.md` §2 al cerrar)

```
src/
  content/                 projects.ts services.ts about.ts legal.ts process.ts schema.ts
  lib/content/             index.ts (getProjects, getProject, getServices, getService,
                           getAbout, getLegal, findTranslatedSlug, listStaticParams)
  components/
    ui/                    SectionHead, Chip, TagList, PathLink, Row, Quote, ArrowLink
    plates/                Plates.tsx (+ plates-data.ts)           ← T-03
    deploy/                Deploy.tsx                              ← SVG estático
    sections/              home/*, work/*, case/*, services/*, about/*, legal/*
      islands (use client) LayerPicker, WorkGallery, ServiceScroll
  messages/{es,en}/        home.json work.json services.json about.json legal.json cta.json
  app/[locale]/            page.tsx  work/page.tsx  work/[slug]/page.tsx
                           services/page.tsx  services/[slug]/page.tsx
                           about/page.tsx  legal/page.tsx
```

`PageSkeleton` se conserva para `architecture`, `contact`, `estimate` y
`blog` (003–005). Se usa **un solo patrón por página**, el de la 001:
`setRequestLocale`, sin `revalidate`, `generateMetadata` con título y
descripción localizados.

### 1.2 Contenido: estructura separada de texto

- **Textos de interfaz** (botones, etiquetas, «Estimar esto», «Anterior»…)
  → `src/messages`. **Contenido editorial** (proyectos, servicios, acerca,
  legal) → `src/content`, con esquema Zod por tipo.
- `schema.ts` define `Project`, `Service`, `AboutContent`, `LegalSection`.
  Un único `contentSchema.parse` se ejecuta al importar `src/lib/content`
  (en build y en Vitest); una entrada inválida rompe `next build`.
- `copy: 'draft' | 'approved'` por bloque de texto (DA-8, si Julio lo
  aprueba); `status: 'draft' | 'approved'` por proyecto (ADR 003).
- `findTranslatedSlug(pathname, slug, from, to)` se pasa a
  `resolveAlternate` desde `LocaleSwitcher`/`alternate.ts`; el cambio es
  una línea de conexión, la lógica ya está probada.

### 1.3 Rutas con slug y la CSP (ARCHITECTURE §1)

`work/[slug]` y `services/[slug]` exportan `generateStaticParams()` con **todos
los pares** (idioma, slug) y `dynamicParams = false`. Con next-intl los slugs
difieren por idioma; `generateStaticParams` devuelve los slugs de cada
`locale`. Un slug que no existe **no** llama a `notFound()`: cae en
`app/global-not-found.tsx` (P-16). Así las 34 rutas son estáticas y el
manifiesto las cubre sin cambios. Se verifica con una URL inexistente de
cada tipo (404 propio, renderizado en servidor, con nonce).

### 1.4 `Plates` sin `style=` (T-03, el punto difícil)

El diseño fija la posición de cada bloque con `style="--x:6%; --y:10%;
--w:88%; --h:80%"` y la profundidad con `style="--i:2"`. Eso no pasa la CSP.
Tres candidatos, que **se miden antes de elegir** (T-03):

| Opción | Cómo | A favor | En contra |
|---|---|---|---|
| **A. CSS generado** | Script de prebuild que recorre los datos de `plates-data.ts` y emite una hoja con una clase por valor distinto (`.bx-6`, `.by-10`, `.bw-88`, `.bh-80`) más `.i-0…i-3`. | Render **idéntico** (mismas reglas `.blk`); sin JS. | Hoja de ~10–25 KB; una pieza de build más. |
| **B. SVG con atributos** | Cada placa lleva un `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` con `<rect x y width height>` (atributos de presentación; la CSP no los restringe). | Sin hoja generada; datos y marcado coinciden. | El `outline` inset de 1 px se aproxima con `stroke` + `vector-effect: non-scaling-stroke`: puede variar medio píxel. |
| **C. Clases por valor escrito a mano** | Como A pero a mano en `design.css`. | Sin script. | Mantenimiento frágil; descartada salvo que A y B fallen. |

**Criterio de decisión:** diferencia píxel a píxel con la réplica del diseño
(`TEST-PLAN` §2) a 1440 y 390 px, 6 vistas × 4 placas × estados reposo/hover
y `flat`; el manifiesto de CSP y `csp.spec.ts` deben seguir en verde.
Recomendación previa: **A** (render idéntico), **sin decidir**. Julio autorizó
solo la **comparación A/B** (P-23) y, con su informe, **eligió la opción A el 2026-11-12** (▲A1; `evidencia-t6-plates.md`). La T6a la ejecutó **fuera del árbol del
repositorio** (copia aislada en el scratchpad), sin tocar la CSP ni el
manifiesto, y presenta resultados. La implementación definitiva (T6b) solo
empieza después de que Julio elija. C queda como respaldo y requeriría su
aprobación. El script de A, si se elige, **no** toca `scripts/csp-manifest.mjs`.

### 1.5 Islas de cliente (las únicas)

| Isla | Página | Estado | Tamaño esperado |
|---|---|---|---|
| `LayerPicker` | Home | capa activa (0–3 o todas) | muy pequeña; panel `aria-live` |
| `WorkGallery` | Trabajo | filtro de categoría | pequeña; se omite si <2 categorías |
| `ServiceScroll` | Servicios | alinear scroll y foco tras elegir | muy pequeña; sin estado |

El resto son Server Components. Una página sin isla no debe añadir JavaScript
propio (se mide en T-12).

### 1.6 Servicios: enlaces reales en lugar de estado (DA-3)

- Las pestañas son `<Link>` a `/servicios/<slug>` con `scroll={false}`; el
  panel se renderiza en servidor según el slug. `ServiceScroll` (efecto en
  montaje y en cada cambio de ruta) calcula el desplazamiento exactamente
  como el diseño: `head = (innerWidth ≤ 640 ? 64 : 76) + (barra apilada ?
  alto de la barra : 0) + 20`, sin mover si `|top − head| ≤ 8`,
  `behavior: 'auto'` con `reduced-motion`. Mueve el foco al `<section
  tabindex="-1">` del panel.
- `/servicios` renderiza el servicio 01; las 7 rutas por idioma comparten el
  mismo componente.

## 2. Orden de construcción y por qué

1. **Preflight y huellas** (T1): confirmar rama, árbol limpio, huellas del
   diseño, que `verify` verde parte de una base conocida.
2. **Capa de contenido antes que páginas** (T2–T3): es la dependencia de
   todas, y es donde se aplican las reglas «no inventar» (esquema que
   rechaza marcadores y estados no aprobados).
3. **CSS y primitivas** (T4–T5), con los `style=` ya convertidos en clases.
4. **`Plates` (T6a comparación A/B fuera del árbol, ▲A1 decisión de Julio, T6b port definitivo).** Es el único
   componente que puede obligar a replantear algo; si A y B fallan, se
   detiene aquí y no se construye ninguna página sobre él.
5. **`Deploy` y Servicios** (T7–T8): Servicios es la página con más
   comportamiento (scroll, ARIA, enlaces profundos); sale pronto para
   detectar problemas de ruta/CSP temprano.
6. **Trabajo, casos y POS** (T9–T10): requiere `Plates` aprobada y la
   respuesta de Julio sobre el caso (P-19).
7. **Home, Acerca de, Legal** (T11–T13): ensamblan lo anterior.
8. **Pruebas y fidelidad** (T14–T15) y cierre (T16).

## 3. Rutas y slugs (ruta por servicio aprobada, P-21; slugs documentados como propuesta)

| Servicio | Slug `es` | Slug `en` |
|---|---|---|
| 01 | `desarrollo-a-la-medida` | `custom-software` |
| 02 | `aplicaciones-web` | `web-applications` |
| 03 | `aplicaciones-moviles-y-escritorio` | `mobile-and-desktop-apps` |
| 04 | `ecommerce-y-shopify` | `ecommerce-and-shopify` |
| 05 | `apis-y-automatizacion` | `apis-and-automation` |
| 06 | `sistemas-pos` | `pos-systems` |
| 07 | `soporte-y-mantenimiento` | `support-and-maintenance` |
| Caso POS | `sistema-pos-de-escritorio` | `desktop-pos-system` |

Los slugs no contienen marcas ni nombres de cliente. Cambiarlos después de
publicar rompe URLs; por eso se aprueban ahora.

## 4. Dependencias

| Dependencia | Para qué | Justificación / alternativa descartada |
|---|---|---|
| `zod` 4.x (versión exacta, la verificada en el registro al empezar) | Esquemas de contenido en build | Aprobada en `tech-stack.md` y ADR 003. Alternativa: validar a mano → pierde mensajes y tipos. |
| *(ninguna más)* | — | Sin librería de animación, iconos, MDX, Markdown ni gestor de estado. Los iconos son los SVG del diseño; las animaciones, CSS. |

## 5. Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Incluir Arquitectura en la 002 | El roadmap la liga a la escena 3D (003). Una versión sin 3D sería trabajo desechable y un rediseño de hecho. |
| Hero y «How it's built» con una imagen o captura del 3D | Introduce un activo que no existe y sería de composición nueva. |
| Omitir «How it's built» en Home hasta la 003 | Alternativa válida de DA-2 (más simple, deja Home incompleta); se aplica si Julio rechaza la propuesta. |
| Estado de servicio con `useState` y sin rutas | Pierde el enlace profundo, necesita JavaScript para funcionar y arrastra la lógica de `localStorage` del diseño. |
| Poner capturas ilustrativas del POS con `Plates` | Parecerían capturas reales (P-03). |
| Publicar todos los proyectos del diseño con marcadores | Viola «lo no verificado no se publica» (D-08). |
| Cargar contenido de una base de datos o CMS | ADR 003. |
| Excepción en la CSP (`unsafe-inline` en estilos) para `Plates` | Prohibido por el ADR 006; la regla del manifiesto es fallar cerrado. |

## 6. Riesgos y regresiones

| Riesgo | Efecto | Mitigación / prueba |
|---|---|---|
| `Plates` sin estilos en línea no coincide visualmente | Pierde la «vista explotada», que es la identidad de las tarjetas | Comparación A/B en T6a (copia aislada) y decisión de Julio en ▲A1; plan B (opción B/C) |
| Una página nueva sale dinámica o con `style=` y rompe el build | Manifiesto falla cerrado | Cada tarea corre `build`; `csp.spec.ts` ampliado a las 34 rutas |
| Rutas con slug devuelven 404 pintado en cliente | Contradice ARCHITECTURE §1 | `dynamicParams = false` + prueba con slugs inexistentes (404 propio SSR) |
| El HTML nuevo incluye scripts en línea de Next distintos | Hashes cambian | El manifiesto los recalcula del build; no se toca |
| Texto afirma algo no verificado (POS, tecnologías) | Violación de CLAUDE.md §5 | Esquema rechaza marcadores; prueba de texto prohibido; revisión de Julio (CA-7, CA-12); contenido en `draft` hasta aprobar |
| Español más largo desborda | Cortes, solapes | Revisión a 1440/1024/768/390 con textos reales; `text-wrap` del diseño |
| Scroll de Servicios mal alineado bajo el encabezado fijo | Pierde el comportamiento aprobado | Prueba geométrica con tolerancia 8 px en 1440 y 390 |
| `generateStaticParams` de rutas con slug no devuelve un slug por idioma (next-intl con `pathnames`) | Páginas faltantes o 404 en un idioma | Prueba que compara los pares (idioma, slug) de `listStaticParams` con las 34 rutas del manifiesto; ruta del otro idioma redirige o da 404, nunca 200 |
| Anclas de Legal e identificadores de sección distintos por idioma | Enlaces del Footer rotos | Los ids salen de `footer.json` → `anchors`; prueba e2e en ES y EN |
| Páginas con estado en la URL (servicios) pierden el idioma al cambiar | Selector lleva a otra página | Cubierto por la ida y vuelta de las 34 rutas |
| `findTranslatedSlug` mal conectado | Selector lleva a 404 | Prueba de ida y vuelta de las 34 rutas |
| Réplica de comparación incompleta | Falsa sensación de fidelidad | Se declara qué se midió; lo no medido se marca |
| Faltan `DESIGN.md` y `TECH-STACK.md` (P-01) | Textos o reglas podrían cambiar | Textos en `draft`; revisión al llegar |
| Tamaño de commits grandes | Revisión difícil | Un commit por tarea o bloque pequeño, `verify` antes de cada uno |
| Fechas y cifras | Inventar | No se escribe ninguna que no esté en `caso-pos.md` o decidida |

**Pruebas nuevas necesarias:** unitarias del esquema (casos negativos),
`findTranslatedSlug`, texto prohibido y marcadores; e2e por página
(secciones, orden, enlaces, slug inexistente), interacciones (filtro, capas,
pestañas), scroll de Servicios, anclas de Legal, ida y vuelta ES⇄EN con slugs,
CSP y red en 34 rutas, axe en 34 rutas, mutaciones (marcador sin resolver,
`style=` en línea, slug duplicado), capturas 1440/390 vs réplica.

## 7. Verificación

Comando previo a cada commit: `SITE_ORIGIN=http://localhost:3100 npm run
verify`. Por feature: `npm run test:e2e` (desktop y mobile), `npm audit
--omit=dev`, y CI de GitHub Actions. Fidelidad: capturas ES y EN a 1440 y
390 px contra la réplica del artboard, con las adaptaciones aprobadas
enumeradas. Resultados en `TEST-PLAN.md` §8 con comando y salida; lo que no
se ejecute se reporta como no ejecutado.

## 8. Estimación de rondas y modelo recomendado

Una **ronda** = una sesión de implementación que termina con commit(s) verdes,
evidencia registrada y, donde se indica, parada para aprobación de Julio.

| Ronda | Contenido | Tareas | Modelo y esfuerzo | Parada |
|---|---|---|---|---|
| R0 | Esta planificación y su aprobación | — | (hecha) | **Julio aprueba spec/plan** |
| R1 | Base: preflight, capa de contenido, CSS y primitivas, **comparación A/B de `Plates`** | T1–T5, T6a | **T3 y T6a Opus High**; T1, T2, T4, T5 Sonnet Medium | **Julio elige la técnica de `Plates` (P-23, ▲A1)** |
| R2 | `Deploy` + Servicios + 7 rutas | T7–T8 | **T8 Opus High** (scroll, ARIA, rutas); T7 Sonnet Medium | Revisión visual de Servicios |
| R3 | Trabajo, caso y contenido POS | T9–T10 | **T10 Opus High** (auditoría de afirmaciones del POS contra `caso-pos.md`); T9 Sonnet Medium | **Julio revisa el caso POS (P-19)** |
| R4 | Home, Acerca de, Legal | T11–T13 | Sonnet Medium; borrador del español de marca (T12 parte de redacción) Opus High | Revisión de textos (P-22) |
| R5 | Pruebas, fidelidad y cierre | T14–T16 | Sonnet Medium (ejecución); Opus High solo para interpretar diferencias visuales o de CSP que aparezcan | **Aprobación final de Julio** |
| R6 (reserva) | Correcciones tras la revisión de Julio | las que surjan | Sonnet Medium | — |

**Estimación: 5 rondas de implementación (R1–R5) más 1 de reserva (R6)**;
rango razonable de 5 a 7. El desvío probable está en R1 (si ninguna técnica de
`Plates` cumple a la primera) y en R6 (cambios de texto tras la revisión).

**Criterio para Opus High:** decisiones de arquitectura con riesgo de CSP,
comportamiento fino de interacción/accesibilidad, redacción de afirmaciones
sobre un proyecto real y español de marca. **Sonnet Medium:** traslado
mecánico de CSS/markup con la spec cerrada, componentes de presentación,
tests derivados de criterios ya escritos, documentación de evidencia.
