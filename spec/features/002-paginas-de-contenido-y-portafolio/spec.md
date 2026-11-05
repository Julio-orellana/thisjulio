# 002 — Páginas de contenido y portafolio

**Estado:** **propuesta, pendiente de aprobación de Julio.** No se escribe código
hasta que Julio apruebe esta spec y el `plan.md` (CLAUDE.md §4).
**Redactada:** 2026-11-05, sobre `9ce2401` (cierre de la Feature 001).
**Origen:** `spec/constitution/roadmap.md` §2 (fila 002), `ARCHITECTURE.md`,
ADR 002, 003 y 006, `docs/design/REFERENCIA-DISENO.md`,
`docs/portafolio/caso-pos.md` y la ronda de planificación de Julio.
**Alcance según el roadmap:** Home (sin 3D), Trabajo, casos, Servicios,
Acerca de, Legal; capa de contenido tipada y validada.
**Condicionada por:** P-02, P-03, P-04, P-08, P-09, P-11 (roadmap) y las
nuevas P-18 a P-22 (`docs/PENDIENTES.md`).

---

## 0. Cómo leer esta spec

Cada afirmación de contenido lleva una de tres etiquetas:

| Etiqueta | Significa |
|---|---|
| **[Comprobado]** | Tiene evidencia en el repositorio (`docs/portafolio/caso-pos.md`, decisiones aprobadas, diseño aprobado). |
| **[Pendiente de Julio]** | Depende de un dato o permiso que solo Julio puede dar. Se omite del sitio hasta tenerlo. |
| **[Propuesta]** | Decisión editorial o técnica nueva. Requiere aprobación expresa antes de implementarse. |

## 1. Hallazgos de la inspección (hechos, no suposiciones)

1. **Rama y commit.** El trabajo se hizo en `claude/admiring-babbage-bjvbo8`,
   la rama asignada a esta sesión; `HEAD` es `9ce2401` (cierre formal de la
   001), árbol limpio. La rama `claude/gifted-keller-x03g4c` que cita el
   encargo **no existe** ni local ni en el remoto (`git branch -a`: solo
   `claude/admiring-babbage-bjvbo8`). El commit coincide, así que no hay
   diferencia de contenido; se anota por si Julio esperaba otro nombre.
2. **001 cerrada.** `tasks.md` de la 001 (T17), `roadmap.md` §1 y
   `CLAUDE.md` §7 dicen «completada y cerrada el 2026-11-05»; CA-1 a CA-15
   con evidencia.
3. **Discrepancia entre el encargo y el roadmap: la página Arquitectura.** El
   encargo pide incluirla en la 002. El roadmap la asigna a la **003**
   («Escena 3D y arquitectura interactiva … página Arquitectura») porque su
   contenido es el diagrama WebGL. Esta spec **respeta el roadmap**: la 002
   no construye `/arquitectura`; conserva su esqueleto y la enlaza. Si Julio
   quiere adelantarla, es un cambio de alcance (P-18, decisión DA-1).
4. **Contacto y Estimador** son de la 004 (formularios). En la 002 siguen
   siendo esqueletos; los botones de la 002 los enlazan.
5. **Estado del código.** Las 9 rutas × 2 idiomas existen como
   `PageSkeleton` (solo `<h1>`). `routing.ts` ya declara `/work/[slug]` y
   `/services/[slug]`, pero **no hay páginas** para ellas. `resolveAlternate`
   ya acepta una búsqueda de slugs traducidos (`findTranslatedSlug`), sin
   implementar. `src/content/` y `src/lib/content/` no existen. No existe
   `zod` en `package.json`.
6. **Diseño inspeccionado** (artefacto versión `1793843453-74ee`, leído el
   2026-11-05): las huellas SHA-256 de `Main`, `Work`, `CaseStudy`,
   `Services`, `About`, `Legal`, `Plates` y `Deploy` coinciden con las de `REFERENCIA-DISENO.md` §2.
   `claude/DESIGN.md` y `TECH-STACK.md` **siguen sin entregarse** (P-01);
   si llegan y contradicen algo, se revisa esta spec antes de seguir.
7. **Tres choques del diseño con las reglas del repositorio** que obligan a
   adaptar sin rediseñar (detalle en §6):
   - `Plates` pinta cada bloque con `style="--x:…"`; la CSP (ADR 006) **prohíbe
     `style=""`** y `scripts/lib/csp-scan.mjs` hace fallar el build si lo ve.
   - Las páginas del diseño usan ≈25 `style="…"` sueltos y `localStorage`
     para pasar la selección entre páginas.
   - El caso POS del diseño muestra `Deploy` como si fuera del proyecto, y
     `docs/portafolio/caso-pos.md` §5 lo prohíbe.

## 2. Alcance

### 2.1 Dentro

| Ruta (clave) | Español / inglés | Qué entrega la 002 |
|---|---|---|
| `home` | `/es` · `/en` | Inicio completo **sin escena 3D** (§3.1) |
| `work` | `/es/trabajo` · `/en/work` | Galería de proyectos aprobados (§3.2) |
| `work.case` | `/es/trabajo/<slug>` · `/en/work/<slug>` | Plantilla de caso + **un** caso publicable: el POS anonimizado (§3.3) |
| `services` | `/es/servicios` · `/en/services` | Los 7 servicios, proceso y «tus cuentas son tuyas» (§3.4) |
| `services.item` | `/es/servicios/<slug>` · `/en/services/<slug>` | Enlace profundo a cada servicio (**[Propuesta]** DA-3) |
| `about` | `/es/acerca-de` · `/en/about` | Acerca de, sin retrato, CV ni LinkedIn mientras no existan (§3.5) |
| `legal` | `/es/legal` · `/en/legal` | Legal y privacidad, **«Borrador pendiente de revisión legal»** (§3.6) |
| — | `src/content`, `src/lib/content` | Capa de contenido tipada con Zod (§4) |
| — | `src/components/{ui,plates,deploy,sections}` | Componentes del diseño que las páginas necesitan (§5) |

### 2.2 Fuera (y dónde va)

| Queda fuera | Va en |
|---|---|
| Escena 3D, hero animado por capas, diagrama interactivo, página Arquitectura | 003 |
| Contacto, Estimador, formularios, correo, antiabuso | 004 |
| Blog | 005 (sigue oculto, `noindex`, sin artículos) |
| Sitemap, `hreflang`, canonical, Open Graph, JSON-LD, robots, favicon, despliegue, DNS | 006 |
| Medición de GPU, CSP en Firefox/Safari/CDN | P-12 y P-17 |
| Cambios en `sistema-pos` u otros repositorios | nunca |

La 002 **no cambia** la CSP, `proxy.ts`, el manifiesto de hashes ni
`next.config.ts`. Si una tarea lo exigiera, se detiene y se pide aprobación.

## 3. Especificación por página

Comunes a todas: Server Components; textos desde `src/messages` y
`src/content` (cero cadenas en duro); `setRequestLocale`; sin `revalidate`;
sin estilos ni manejadores en línea; títulos y descripción por idioma;
un solo `<h1>` y un `<main>`; cortes responsive 1040 px y 640 px; sin
peticiones a otros orígenes.

### 3.1 Inicio (`home`)

**Objetivo.** Que un visitante entienda en segundos qué construye THIS JULIO
y pueda ir a Trabajo, Servicios, Estimador o Contacto.

**Secciones, en el orden del diseño (`Main.dc.html`):**

| # | Sección | Contenido | Estado |
|---|---|---|---|
| 1 | Hero | Titular, línea de apoyo, «Explorar proyectos» (→ Trabajo) y «Iniciar un proyecto» (→ Estimador). | Textos **[Pendiente de Julio]** (P-04). Sin escena 3D ni recorrido fijado al desplazar: ver DA-2. |
| 2 | «This is the work» | Hasta 3 tarjetas con el mismo componente de vista y metadatos que la galería. Enlace «Ver todos los proyectos». | Hoy solo **1 proyecto aprobado** (POS): una tarjeta, sin el «seis» del diseño (D-08). |
| 3 | «This is what I can build for you» | 7 filas numeradas, cada una enlaza a su servicio. | Nombres oficiales **[Comprobado]**; frases de apoyo **[Propuesta]**. Servicio 07 sin «24/7» (D-02). |
| 4 | «This is how it's built» | Selector de 4 capas + panel `aria-live` + vista. | **[Propuesta]** DA-2: la vista es `Plates kind="stack"` (el respaldo SIN WebGL del propio diseño) con la capa activa resaltada. La 003 la reemplaza por la escena 3D. Enlace a Arquitectura. |
| 5 | «This is Julio» | Dos párrafos y «Más sobre mí». Retrato **omitido** (D-12). | Textos del diseño, a aprobar. |
| 6 | Cierre | «¿Tienes algo que construir?»: dos `path-link` (Estimador, Contacto). | — |

**Componentes.** `Hero`, `WorkCard` (`Plates wide` + `gal-meta`), `ServiceRow`,
`LayerPicker` (isla de cliente: estado de la capa activa), `PathLink`,
`SectionHead`.
**Responsive.** `work-grid` de 3 columnas → 1 columna con tarjeta en dos
columnas a 1040 px (como `site.css`); `me` y `final` a una columna; selector
de capas en una fila que envuelve.
**Interacciones.** Hover «profundidad» de las tarjetas (CSS); selector de
capas con `aria-pressed`; revelado al desplazar (`.rv`, solo CSS, desactivado
con `prefers-reduced-motion`).
**Dependencias.** Capa de contenido, `Plates`, primitivas de §5.
**Criterios.** CA-2, CA-5, CA-8, CA-9, CA-10, CA-11, CA-13.

### 3.2 Trabajo (`work`)

**Objetivo.** Mostrar solo proyectos **verificados y autorizados**.
**Contenido.** Encabezado «This is the work», filtros por categoría, contador
(«n proyectos»), tarjetas alternadas (clase `flip`) con número, etiqueta,
título y línea.
**Regla de publicación.** Solo entradas `status: 'approved'` generan tarjeta y
página (ADR 003). Hoy: **POS**. AY LUPITA (web y panel), Kinderland, ATRIO y la
API de pedidos quedan como `draft` o ni se cargan (P-08, D-08): no aparecen.
**[Propuesta]** DA-4: con menos de dos categorías aprobadas, la barra de
filtros **no se muestra** (un filtro único no filtra nada) y el contador sí
(«1 proyecto»). El filtro vuelve solo cuando haya ≥ 2 categorías.
**Componentes.** `WorkGallery` (isla de cliente: filtro por categoría con
`aria-pressed`, contador `aria-live`), `WorkItem`, `Chip`.
**Responsive.** Rejilla de 12 columnas → una columna a 1040 px.
**Interacciones.** Filtro (cuando exista), hover de profundidad, foco visible.
**Dependencias.** `getProjects(locale)`, `Plates`.
**Criterios.** CA-2, CA-5, CA-8, CA-9, CA-10, CA-12.

### 3.3 Caso de estudio (`work.case`) y el caso POS

**Objetivo.** Contar un proyecto real sin exponer cliente, producto ni
capturas, y sin afirmar lo no verificado.
**Plantilla** (de `CaseStudy.dc.html`): migas, título, línea, metadatos,
vista, resumen, problema, solución, funcionalidades + stack, arquitectura,
pantallas, resultados, CTA, siguiente proyecto.

**Qué se publica del POS** (fuente única: `docs/portafolio/caso-pos.md`):

| Elemento | Decisión | Etiqueta |
|---|---|---|
| Descripción pública | «Sistema POS de escritorio para un comercio de productos agrícolas en Guatemala.» / «Desktop POS system for an agricultural products business in Guatemala.» | **[Comprobado]** (autorizada, §1 del caso) |
| Nombre comercial del producto y del cliente | **No se publican** (P-02). El título es genérico. | **[Pendiente de Julio]** |
| Naturaleza | Aplicación **de escritorio**; nunca «aplicación web». Arquitectura **offline-first** con respaldo en la nube. | **[Comprobado]** |
| Funcionalidades | Las 10 capacidades de la tabla §3 del caso, presentadas como «funcionalidades del sistema», **nunca** «probadas en producción». | **[Comprobado]** como documentadas |
| Stack (Electron, React, TypeScript, SQLite) | Se publica si Julio lo confirma (P-19). | **[Propuesta]** |
| Año, rol, enlace | **Omitidos** (D-12). | **[Pendiente de Julio]** |
| Problema y solución | **Omitidos** hasta que Julio los cuente (P-19). El repositorio documenta *qué hace* el sistema, no *por qué lo pidió el cliente*; redactarlo sería inventar. | **[Pendiente de Julio]** |
| Capturas / «Screens» | **Sección omitida** (P-03). No se sustituye por composiciones `Plates` rotuladas como pantallas, porque parecerían capturas reales. | **[Pendiente de Julio]**; **[Propuesta]** DA-5 |
| Resultados | **Sección omitida**, como indica el diseño («Hide this section if there are none»). Sin cifras. | **[Comprobado]** |
| `Deploy` (cloud/local/híbrida) | **No va en el caso.** El POS real es local con respaldo en la nube; las tres arquitecturas son una oferta de servicio (caso §5). `Deploy` queda en Servicios 06. | **[Propuesta]** DA-5 (D-14) |
| «Siguiente proyecto» | **Omitido** mientras haya un solo caso. | — |
| Lo que NO se afirma | Multi-sucursal, SaaS, sincronización entre terminales, facturación fiscal electrónica, ventas a crédito; impresión, hardware y rendimiento reales; cifras de uso. | **[Comprobado]** (caso §4) |

**Componentes.** `CaseHeader`, `CaseMeta` (solo campos con dato), `CaseTrio`
(solo bloques con dato), `FeatureList`, `TagList`, `SectionBand`.
**Rutas.** `work/[slug]` con `generateStaticParams` por idioma y
`dynamicParams = false` (ARCHITECTURE §1; **sin `notFound()`**). Slugs
**[Propuesta]**: `sistema-pos-de-escritorio` / `desktop-pos-system`.
**Responsive.** `case-trio` y `split` a una columna a 1040 px.
**Criterios.** CA-2, CA-4, CA-5, CA-8, CA-9, CA-12.

### 3.4 Servicios (`services`) y `services.item`

**Objetivo.** Explicar los siete servicios aprobados, cada uno desde un
problema de negocio.
**Contenido** (de `Services.dc.html`): encabezado, índice de pestañas 01–07,
un único panel con valor, «Un buen punto de partida si», «Qué recibes»,
«Estimar esto» (→ Estimador), navegación anterior/siguiente; el 06 incluye
`Deploy`; luego «This is how a project runs» (5 pasos), «Tus cuentas son
tuyas» y cierre.
**Los siete nombres oficiales [Comprobado]** (mission §4): 01 Desarrollo de
software a la medida · 02 Aplicaciones web y plataformas · 03 Aplicaciones
móviles y de escritorio · 04 E-commerce y Shopify · 05 APIs y automatización
de procesos · 06 Sistemas POS y gestión de negocios · 07 **Soporte y
mantenimiento**.
**Servicio 07.** Sin «24/7», SLA, tiempos de respuesta ni disponibilidad
garantizada. **[Propuesta]** DA-6: la nota del diseño («Coverage, availability
and response times are defined in each service agreement») menciona
«availability» y «response times»; se reemplaza por «El alcance se define en
cada acuerdo de servicio». El renglón «Monitoreo, según el plan de servicio»
requiere confirmación de Julio (P-22).
**Rutas [Propuesta] DA-3.** `ARCHITECTURE.md` §3 dejó pendiente confirmar en la
002 el enlace profundo. Se propone **una página estática por servicio y por
idioma** (`/servicios/<slug>`, 14 páginas) con la misma vista y el servicio
activo; `/servicios` muestra el 01. Las pestañas son enlaces reales
(funcionan sin JavaScript, el estado vive en la URL, se elimina
`localStorage`). Slugs **[Propuesta]** en `plan.md` §3.
**Comportamiento a conservar (REFERENCIA §4.3).** Al elegir un servicio, su
número y título quedan **justo debajo del encabezado fijo** (76 px escritorio /
64 px móvil, más la barra de pestañas cuando se apila), sin desplazar si ya
están ahí; desplazamiento suave salvo `reduced-motion`; un solo panel visible.
**Componentes.** `ServiceTabs` + `ServicePanel` (isla mínima solo para
alinear el desplazamiento y el foco), `Deploy`, `ProcessSteps`, `OwnBlock`.
**Responsive.** Pestañas verticales → barra horizontal desplazable a 1040 px;
`process` de 5 columnas → 1 (y 2→1 según `site.css`).
**Criterios.** CA-2, CA-4, CA-5, CA-6, CA-8, CA-9, CA-10, CA-11, CA-13.

### 3.5 Acerca de (`about`)

**Contenido** (de `About.dc.html`): «This is Julio», «Quién soy», «Qué
construyo», filosofía, especialidades técnicas, método de trabajo,
tecnologías, cierre.
**Se muestra:** GitHub (`github.com/Julio-orellana`, ya en `site.ts`)
**[Comprobado]**. **Se omite** hasta que existan: retrato, CV en PDF y
LinkedIn (P-11, D-12); no se deja marcador visible.
**[Propuesta] DA-7.** Sin retrato, el bloque `about-top` pasa a una sola
columna en lugar de dejar un hueco. Es un ajuste de composición que debe
aprobarse.
**Afirmaciones técnicas.** Las especialidades y las 14 tecnologías (TypeScript,
Next.js, React, Tailwind CSS, Express, NestJS, React Native, Expo, PostgreSQL,
Prisma, MongoDB, Shopify, Git, GitHub) son texto del diseño **no verificado
en el repositorio**: se publican solo con la confirmación de Julio (P-20).
Sin certificaciones, años de experiencia ni clientes.
**Componentes.** `AboutIntro`, `SpecList`, `MethodList`, `TagList`, `Quote`.
**Criterios.** CA-2, CA-5, CA-8, CA-9, CA-10.

### 3.6 Legal y privacidad (`legal`)

**Contenido** (de `Legal.dc.html`): índice lateral, aviso informativo y cuatro
secciones: licenciamiento de software, propiedad intelectual, principios de
privacidad y marco legal aplicable, más «Preguntas».
**Reglas** (`SECURITY.md` §6): marcada **«Borrador pendiente de revisión
legal»** (P-09); no afirma una ley integral de protección de datos en
Guatemala; no afirma que el RGPD aplique siempre; sin contratos, garantías ni
cláusulas de responsabilidad. La fecha de última actualización es la del
commit, no una inventada.
**Anclas.** El Footer ya enlaza a `#licenciamiento`, `#propiedad-intelectual`
y `#privacidad` (ES) y sus equivalentes en inglés (`footer.json` →
`anchors`). Las secciones usan **exactamente** esos identificadores; el
cuarto, «marco legal», se añade con ancla propia. El desplazamiento a un ancla
deja la sección bajo el encabezado fijo (92 px del diseño, `scroll-margin`
en CSS; **sin** `localStorage`).
**Correo de «Preguntas».** **Omitido** hasta P-11; se remite al formulario de
Contacto.
**Los textos legales en español son traducción del texto del diseño**; no son
asesoría jurídica ni se publican como definitivos.
**Criterios.** CA-2, CA-9, CA-10, CA-14.

## 4. Capa de contenido

1. **Zod 4.x** es la única dependencia nueva (ya aprobada en
   `tech-stack.md` §1 y ADR 003); se fija la versión exacta.
2. `src/content/` — módulos TypeScript: `projects`, `services`, `about`,
   `legal`, `process`. Cada entrada separa **estructura** (id, orden, estado,
   categorías, vista `Plates`, stack, slugs por idioma) de **texto por idioma**
   (`ARCHITECTURE.md` §4).
3. `src/lib/content/` — única puerta al contenido: `getProjects(locale)`,
   `getProject(locale, slug)`, `getServices(locale)`, `getService(locale,
   slug)`, `findTranslatedSlug` (alimenta `resolveAlternate`), `getAbout`,
   `getLegal`. Los componentes reciben datos tipados.
4. **Validación en build** (no en producción): idioma faltante, campo vacío,
   slug duplicado dentro de un idioma, `status` inválido, categoría
   desconocida, marcador sin resolver (`[Confirm…]`, `[Add…]`, `[year]`),
   servicio ≠ siete, o texto prohibido («24/7», «SLA») rompen el build o la
   prueba unitaria.
5. **Estado de publicación** por proyecto: `draft | approved`; solo
   `approved` genera página. **[Propuesta]** DA-8: además, cada bloque de
   texto lleva `copy: 'draft' | 'approved'` (P-04); el esquema lo exige y una
   prueba lista cuántos siguen en `draft`. La 002 puede cerrarse con textos
   en borrador (nada se publica antes de la 006), pero **el informe de cierre
   dice cuántos y cuáles**. No se hace nada con ese campo en el cliente.
6. **Selector ES | EN.** `findTranslatedSlug` conecta `alternate.ts` con el
   contenido; si no hay traducción, la página padre (comportamiento ya probado
   en la 001).

### 4.1 Fuentes verificables del portafolio

Regla: un dato solo entra al sitio si tiene una fuente de esta tabla. Sin
fuente, se omite (CLAUDE.md §5, D-08).

| Proyecto | Estado | Fuente verificable | Qué puede publicarse hoy |
|---|---|---|---|
| Sistema POS de escritorio | `approved` (anonimizado) | `docs/portafolio/caso-pos.md` (revisión de solo lectura de `sistema-pos` en `ced39d4`: `README.md`, `package.json`, `electron-builder.yml`, roadmap §1, estructura de `src/`) | Descripción autorizada; naturaleza de escritorio y offline-first con respaldo en la nube; las 10 capacidades **documentadas** (no verificadas en ejecución); stack si Julio lo confirma (P-19) |
| AY LUPITA (web y panel) | `draft`, no se carga | Ninguna (P-08) | Nada |
| Kinderland | `draft`, no se carga | Ninguna (P-08) | Nada |
| ATRIO | `draft`, no se carga | Ninguna (P-08) | Nada |
| API de pedidos | `draft`, no se carga | Ninguna (P-08) | Nada |

Cuando Julio verifique uno (existencia, permiso, stack, año, rol, enlace,
funciones confirmadas), se añade su fuente a esta tabla **antes** de pasarlo a
`approved`. El esquema (§4.4) exige un campo `source` no vacío en todo proyecto
`approved`, de modo que un proyecto sin fuente rompe el build.

## 5. Componentes: reutilizar y adaptar

| Componente del diseño | Decisión | Por qué |
|---|---|---|
| `Nav`, `Footer`, `MobileMenu` | **Reutilizar** (001, aprobados) | Sin cambios. |
| `site.css` (resto de clases) | **Reutilizar**, trasladando a `design.css` solo lo que cada página usa (plan 001 §1.3) | Mismos valores; los `style="…"` en línea pasan a clases `[app]`, como ya se hizo en 001. |
| `Plates` | **Adaptar** (T-03) | Su marcado usa `style="--x:…"` en cada bloque y `--i` por placa: prohibido por la CSP. Hay que expresar lo mismo sin atributo `style`, con el mismo resultado visual. Es el riesgo técnico mayor. |
| `Deploy` | **Reutilizar** casi tal cual | SVG estático; no lleva `style=` en el marcado leído. Se porta como Server Component. Solo en Servicios 06. |
| `Arch3D` | **No se toca** | 003. |
| `DesignSystem` | **No se toca** | Solo referencia; `/es/sistema` sigue en desarrollo. |
| Islas de cliente | **Nuevas, mínimas**: `LayerPicker` (Home), `WorkGallery` (filtro), `ServiceScroll` | Solo estado y desplazamiento; todo lo demás es servidor. |

## 6. Adaptaciones técnicas sin efecto visual y propuestas de cambio

| ID | Cambio | Tipo | Pide aprobación |
|---|---|---|---|
| T-a | `localStorage` (`thisjulio-case/service/legal`) → rutas y anclas | Técnico, sin efecto visual (REFERENCIA §4.2) | No |
| T-b | `style="…"` en línea → clases `[app]` | Técnico | No |
| T-c | Fuentes ya autoalojadas (D-10) | Hecho en 001 | No |
| T-d | `Plates` sin `style=` | Técnico, riesgo visual | **Sí**, tras comparar (P-23) |
| DA-1 | Arquitectura queda en 003 | Alcance | **Sí** (P-18) |
| DA-2 | Home sin escena 3D: hero sin recorrido por capas; «How it's built» con `Plates stack` | Diseño temporal hasta 003 | **Sí** (P-18) |
| DA-3 | Páginas estáticas por servicio | Ruta | **Sí** (P-21) |
| DA-4 | Filtros ocultos con <2 categorías | Composición | **Sí** (P-18) |
| DA-5 / D-14 | Caso POS sin `Deploy`, sin pantallas, sin resultados | Contenido | **Sí** (P-19) |
| DA-6 | Nota del servicio 07 sin «availability» ni «response times» | Contenido | **Sí** (P-22) |
| DA-7 | Acerca de en una columna sin retrato | Composición | **Sí** (P-20) |
| DA-8 | Campo `copy: draft/approved` | Proceso | **Sí** (P-22) |

Ninguna se implementa antes de su aprobación. Lo que Julio rechace se
reemplaza por la alternativa descrita en `plan.md` §3.

## 7. Requisitos transversales

### R1. Bilingüe
Todo texto visible existe en `es` y `en`; las claves coinciden (prueba 001).
Español primero: se redacta el `es`, con el inglés del diseño como base de
`en` (D-01). La firma «This» sigue como decisión de marca (D-13, P-22):
mientras no se resuelva se conserva «This» en ambos idiomas.

### R2. Seguridad y CSP (ADR 006)
Páginas estáticas con hashes; sin `style=`, sin `on…=`, sin scripts propios
en línea; `script-src` solo `/_next/static/chunks/`. Las rutas nuevas
(`work.case` y `services.item`) usan `generateStaticParams` +
`dynamicParams = false` y quedan **estáticas**: el manifiesto pasa de 18 a
**34 rutas** (18 + 2 casos + 14 servicios). Sin `dangerouslySetInnerHTML`.
Sin peticiones a terceros, sin cookies, sin `localStorage`.

### R3. Accesibilidad (WCAG 2.2 AA)
Un `<h1>`; jerarquía sin saltos; `aria-pressed` en filtros y selector de capas;
`aria-current` en la pestaña de servicio activa; `aria-live` en contador y
panel; enlaces con nombre accesible; foco visible; objetivos ≥ 44 px;
teclado completo; `prefers-reduced-motion` respetado (desplazamiento, `.rv`,
hover de profundidad). Las composiciones `Plates` son `aria-hidden`; la
información la lleva el texto.

### R4. Rendimiento
Server Components por defecto; solo tres islas pequeñas. Sin librerías de
animación ni de iconos. Imágenes: ninguna en la 002 (sin capturas).
`Plates` es HTML/CSS/SVG. Sin CLS por fuentes (ya `swap` con respaldo).

### R5. SEO estructural existente
Se conserva `<html lang>`, `robots: noindex` (prelanzamiento), título
`%s · THIS JULIO`. La 002 añade título y **descripción** por página e idioma;
canonical, `hreflang`, Open Graph, sitemap y JSON-LD siguen siendo de la 006.

## 8. Criterios de aceptación

| ID | Criterio | Verificación |
|---|---|---|
| CA-1 | `SITE_ORIGIN=http://localhost:3100 npm run verify` sale con 0 (lint, tipos, unitarias, build y manifiesto de CSP). | Comando |
| CA-2 | Cada página de §3 responde 200 en ES y EN con su contenido real (no el esqueleto), un `<h1>` y `lang` correcto; el slug del otro idioma redirige a su ruta o da 404, nunca 200 duplicado. | Playwright sobre las 34 rutas |
| CA-3 | La capa de contenido rechaza en build: idioma faltante, slug duplicado, campo vacío, marcador sin resolver, `status` inválido y número de servicios ≠ 7. Solo `approved` genera página. | Vitest con casos negativos |
| CA-4 | Hay exactamente 1 caso (`pos`) y 7 servicios publicados; ningún proyecto no verificado (AY LUPITA, Kinderland, ATRIO, API de pedidos) aparece en páginas, metadatos ni HTML. | Playwright + búsqueda en el build |
| CA-5 | El selector ES \| EN lleva de cada ruta (incluidos caso y servicio) a su equivalente; con traducción simulada ausente, al padre. | Playwright + Vitest (`findTranslatedSlug`) |
| CA-6 | Servicios: al elegir un servicio, su número y título quedan bajo el encabezado fijo (±8 px) en 1440 y 390 px, sin desplazar si ya están; desplazamiento instantáneo con `reduced-motion`; las pestañas funcionan con JavaScript desactivado. | Playwright con medición de geometría |
| CA-7 | El texto «24/7», «SLA», «tiempos de respuesta» y «disponibilidad garantizada» no aparece en ninguna de las 34 rutas; el POS nunca se describe como «aplicación web»; no aparece ningún enlace al blog; los marcadores del diseño (`[Confirm stack]`, `[year]`…) no se publican. | Unitaria + Playwright en las 34 rutas |
| CA-8 | Fidelidad: cada página, en 1440 y 390 px, coincide con su artboard (réplica estática con el `site.css` original, `TEST-PLAN.md` §2) salvo las adaptaciones aprobadas de §6. Se documenta la comparación con capturas y medición de geometría. | Capturas + medición; aprobación de Julio |
| CA-9 | Sin violaciones axe serias o críticas en las 34 rutas; teclado completo en filtros, selector de capas y pestañas; ningún texto en español desborda o se recorta a 1440, 1024, 768 y 390 px. | axe + Playwright + revisión manual |
| CA-10 | CSP intacta: las 34 rutas son estáticas, sin ISR, con exactamente los hashes de su HTML; cero `style=`/`on…=`/scripts en línea propios; `csp.spec.ts` P1–P14 sigue pasando; el generador del manifiesto no necesita cambios. Cero peticiones a otro origen y cero `Set-Cookie`/`localStorage`. | `csp.spec.ts`, manifiesto, red, consola |
| CA-11 | Interacciones: filtro de Trabajo (cuando haya ≥ 2 categorías), selector de capas de Home y pestañas de Servicios cambian el estado y los atributos ARIA correctos. | Playwright |
| CA-12 | Caso POS: muestra solo lo permitido en §3.3; sin nombre comercial, sin cliente, sin capturas, sin cifras, sin `Deploy`; con la lista de funcionalidades documentadas y el aviso de que son funcionalidades del sistema, no resultados. | Revisión de contenido contra `caso-pos.md` + prueba de texto + aprobación de Julio |
| CA-13 | Home: las 6 secciones de §3.1 en orden, sin escena 3D; hero sin recorrido fijado; ningún `WebGL`/`canvas` en la página. | Playwright |
| CA-14 | Legal: rotulada «Borrador pendiente de revisión legal»; los 4 enlaces de ancla del Footer y del índice llevan a su sección y la dejan bajo el encabezado fijo. | Playwright |
| CA-15 | Dependencias: solo `zod` (versión exacta) se añade; `npm audit --omit=dev` sin vulnerabilidades. | `git diff package.json`, audit |
| CA-16 | Documentación: `TEST-PLAN.md` §8, `ARCHITECTURE.md` §2 (marcas ✔), `docs/PENDIENTES.md`, `REFERENCIA-DISENO.md` §5 y `tasks.md` actualizados con evidencia real; cuántos textos siguen en `draft`. | Revisión |

## 9. Qué NO cambia

Paleta, tipografía, espaciado, composición y animaciones del diseño aprobado;
Nav, Footer, selector ES | EN; CSP y `proxy.ts`; el 404 y los errores propios;
`sistema-pos`; la escena 3D (no existe aún); el blog (oculto); ninguna
publicación, DNS ni despliegue.

## 10. Decisiones que se piden a Julio

Registradas en `docs/PENDIENTES.md`. Las que **bloquean** el inicio de una
tarea están marcadas en `tasks.md`.

| ID | Qué se decide |
|---|---|
| P-18 | Alcance: ¿Arquitectura queda en 003 (recomendado) o se adelanta? Home sin 3D con «How it's built» sobre `Plates stack` (DA-2); filtros ocultos con un solo proyecto (DA-4). |
| P-19 | Caso POS: publicar el stack, la lista exacta de funcionalidades, y quién redacta «problema y solución»; omitir `Deploy`, pantallas y resultados (DA-5). |
| P-20 | Acerca de: confirmar especialidades y tecnologías; composición sin retrato (DA-7); fecha de entrega de retrato/CV/LinkedIn (P-11). |
| P-21 | Rutas `/servicios/<slug>` (DA-3) y los slugs propuestos de servicios y del caso. |
| P-22 | Textos ES/EN de la 002 (extiende P-04): firma «This» (D-13), nota del servicio 07 (DA-6), «Monitoreo», campo `copy` (DA-8). |
| P-23 | Aprobar la técnica de `Plates` sin estilos en línea tras la comparación píxel a píxel (T-d). |

## 11. Riesgos

Ver `plan.md` §5: Plates y CSP; regresión del manifiesto; contenido sin
verificar; textos en español más largos; rutas con slug y el 404; costo de
las islas; diferencias de la réplica del diseño; ausencia de `DESIGN.md`.
