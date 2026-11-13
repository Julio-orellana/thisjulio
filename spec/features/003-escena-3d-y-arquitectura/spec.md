# 003 — Escena 3D y arquitectura interactiva

**Estado:** **completada y cerrada el 2026-11-13** (`tasks.md`, «Cierre de la
Feature 003»). Aprobada por Julio en ▲B0 (2026-11-13), con P-26 A, P-27 A, P-29,
P-30 A, P-31 A, P-32 A y P-33 (§10). **P-28 resuelta el mismo día: opción A
completa**, con condiciones (§10).
**Redactada:** 2026-11-12, sobre `9d8d850` (cierre de la Feature 002).
**Origen:** `spec/constitution/roadmap.md` §2 (fila 003), `ARCHITECTURE.md` §6,
`SECURITY.md` §3, `TEST-PLAN.md` §5–6, ADR 006, `docs/design/REFERENCIA-DISENO.md`
§4.1, cierre de la 002 y las fuentes del diseño versionadas en `fc3af9e`.
**Alcance según el roadmap:** port del motor WebGL a TypeScript (hero de Inicio y
diagrama), carga diferida, liberación de recursos, textos localizados y página
Arquitectura (`/es/arquitectura` · `/en/architecture`).

---

## 0. Cómo leer esta spec

Las mismas etiquetas que la 002:

| Etiqueta | Significa |
|---|---|
| **[Comprobado]** | Tiene evidencia en el repositorio (fuentes del diseño en `docs/design/fuente/`, decisiones aprobadas, código de la 001–002). |
| **[Pendiente de Julio]** | Depende de un dato, permiso o decisión de Julio. Se omite hasta tenerlo. |
| **[Propuesta]** | Decisión técnica o editorial nueva. Requiere aprobación expresa. |
| **[Inferencia]** | Estimación razonada sin medir; se mide en la tarea indicada antes de darla por buena. |

## 1. Hallazgos (hechos, no suposiciones)

1. **Fuentes del diseño.** No estaban en el repositorio. Con la autorización de
   Julio (2026-11-12) se copiaron del artefacto (versión `1794534219-8ae2`) a
   `docs/design/fuente/`: `Arch3D.dc.html` (`70cba440a2f7d01f`),
   `Technology.dc.html` (`3c615d97ba2981af`), `MobileTech.dc.html`
   (`cd5a0cffd990e1cc`) y `Main.dc.html` (`4a7efa0c0ba08554`). Las huellas
   coinciden con `REFERENCIA-DISENO.md` §2; `tests/unit/design-sources.test.ts`
   las vigila. **[Comprobado]**
2. **El motor (`Arch3D.dc.html`)** es WebGL 1 propio, sin dependencias, 686
   líneas: 3 programas (escena, brillo, profundidad), mapa de sombras y oclusión
   horneados una vez, atlas de texto dibujado en un canvas 2D, perfiles de
   calidad `high` / `balanced` / `low` (por GPU por software, puntero grueso,
   memoria y núcleos), escalera de resolución con una medición temporizada
   (`readPixels`), pausa con `IntersectionObserver` y `document.hidden`, un solo
   cuadro con `prefers-reduced-motion`, respaldo `Plates stack` si no hay
   contexto, falta `OES_standard_derivatives` o se pierde el contexto, y 4
   etiquetas DOM (`<button class="a3-tag">`) con `aria-pressed`. **[Comprobado]**
3. **Compatibilidad con la CSP (ADR 006).** El motor no usa `eval`,
   `new Function`, *workers*, `blob:`, `importScripts`, `fetch` ni orígenes
   externos. Posiciona las etiquetas con `element.style.transform` (CSSOM), que
   `style-src` no bloquea; no escribe atributos `style` en el HTML del servidor.
   Los *shaders* se compilan con la API de WebGL, que la CSP no regula.
   **[Comprobado]** en la lectura del código; **se verifica en ejecución** (T6).
4. **Lo que el motor no hace** (REFERENCIA §4.1, confirmado en la fuente):
   carga diferida (arranca al montar), liberación completa (no borra buffers,
   texturas, *framebuffers* ni programas, ni llama a `WEBGL_lose_context`) y
   textos localizados (15 rótulos en inglés en el atlas: `WEB`, `DESKTOP`,
   `MOBILE`, `SERVICES`, `API`, `RULES`, `AUTOMATION`, `POSTGRESQL`, `MONGODB`,
   `STORAGE`, `SYNC`, `CLOUD`, `LOCAL SERVER`, `NETWORK`, `SECURITY`; y los
   nombres de capa de las etiquetas DOM). **[Comprobado]**
5. **Dónde se usa la escena en el diseño:** solo en `Main.dc.html`, en el hero
   (`mode="hero"`, recorrido por las 4 capas al desplazar, `hero-pin`) y en
   «How it's built» (`mode="diagram"`, sincronizado con el selector de capas).
   **[Comprobado]**
6. **Contradicción roadmap ↔ diseño: la página Arquitectura no lleva escena 3D.**
   `Technology.dc.html` es un diagrama de **bandas y nodos en HTML** (`.arch`,
   `.arch-band`, `.arch-node`), con 7 pestañas de tipo de sistema, un inspector
   `aria-live` con `Plates kind="stack"` (no WebGL) y una banda «The simplest
   setup that does the job». El roadmap agrupó Arquitectura con la 3D. Esta spec
   **no decide**: propone opciones en P-27 (§10). **[Comprobado]**
7. **Contenido del diagrama de Arquitectura en conflicto con decisiones
   vigentes.** Sus 43 nodos (42 en uso) incluyen 12 tecnologías concretas (Next.js, React,
   TypeScript, Prisma, PostgreSQL, Redis, NestJS, Express, Electron, React
   Native, Expo, Server Actions) que P-20 y la política de contenido
   (`src/content/policy.ts`) vedan sin confirmación, un nodo «Monitoring» que
   P-22 veda, y pestañas «POS: cloud / local / hybrid» que describen
   arquitecturas de servicio (no el caso POS, `caso-pos.md` §5). El atlas 3D
   rotula `POSTGRESQL` y `MONGODB` (P-20). **[Comprobado]** → P-28.
8. **Estado actual (002).** Inicio usa el respaldo `Plates stack` en el hero y en
   «How it's built» (DA-2, P-18), con el hero sin fijar y sin «Scroll to
   follow…»; `/arquitectura` es un esqueleto (`PageSkeleton`); el selector de
   capas es la isla `LayerPicker` (1 006 B). Ninguna ruta crea un `<canvas>`
   (`transversal.spec.ts`). Las 34 rutas son estáticas con CSP de hashes.
   **[Comprobado]**
9. **Faltan `DESIGN.md` y `TECH-STACK.md`** (P-01). Si llegan y contradicen algo,
   se revisa esta spec. **[Comprobado]**
10. **Dominio.** `thisjulio.com` pertenece a THIS JULIO y su DNS está en
    Cloudflare (dato de Julio, 2026-11-12); hosting y correo siguen abiertos
    (P-07). No afecta al alcance de la 003. **[Comprobado]** (dato de Julio)

## 2. Alcance

### 2.1 Dentro

| Pieza | Qué entrega la 003 |
|---|---|
| Motor | Port fiel de `Arch3D.dc.html` a TypeScript, independiente de React (`src/components/scene3d/engine.ts`), con lo que le falta: `dispose()` completo y rótulos del atlas por idioma. **[Propuesta]** P-26 decide port propio o librería |
| Envoltorio | Isla de cliente `Scene3D` que importa el motor **solo** al entrar en el viewport, pausa fuera de pantalla, respeta `reduced-motion`, cae al respaldo `Plates stack` y libera todo al desmontar |
| Inicio | Hero con la escena (`mode="hero"`) y «How it's built» con el diagrama (`mode="diagram"`) sincronizado con el selector de capas, como `Main.dc.html`; se retiran las adaptaciones temporales de DA-2 según P-30 |
| Arquitectura | La página `/es/arquitectura` · `/en/architecture` según la opción que Julio elija en P-27, con el contenido que apruebe en P-28 |
| Textos | Rótulos del atlas, etiquetas DOM, textos del recorrido del hero y de Arquitectura en `es` y `en`, `copy: 'draft'` (DA-8) |
| Pruebas | e2e con y sin WebGL, pérdida de contexto, `reduced-motion`, liberación, rutas sin escena, CSP, presupuesto de rendimiento y comparación de cuadros contra el motor del diseño |

### 2.2 Fuera (y dónde va)

| Queda fuera | Va en |
|---|---|
| Medición en GPU real (dispositivos de referencia) | P-12, independiente (`TEST-PLAN.md` §6) |
| CSP en Firefox, Safari y CDN real | P-17 (006) |
| Contacto, Estimador y formularios | 004 |
| Blog | 005 |
| SEO, sitemap, hosting, despliegue, DNS de registros, correo | 006 / P-07 |
| Aprobación de los textos de la 002 | Antes de la 006 (▲A4 de la 002) |
| Cambios en la CSP, el proxy, el manifiesto o `next.config.ts` | Nunca en esta feature; si hicieran falta, se detiene y se pide aprobación |

## 3. Especificación

### 3.1 Motor y envoltorio

**Fidelidad.** Geometrías, materiales, colores por capa, iluminación y sombras
horneadas, cámara, animación de datos entre capas, perfiles de calidad,
escalera de resolución y respuesta al puntero se conservan como en la fuente.
**[Comprobado]** como requisito (ARCHITECTURE §6, «no rediseñar»).

**Agregados (los mismos que fija ARCHITECTURE §6):**

| Agregado | Comportamiento exigido |
|---|---|
| Carga diferida | Ningún *chunk* del motor se pide y ningún contexto WebGL se crea hasta que el contenedor entra en el viewport (con margen **[Propuesta]** de 200 px). Las rutas sin escena no cargan el motor nunca. |
| Pausa | Sin cuadros con el lienzo fuera de pantalla o la pestaña oculta (ya en la fuente). |
| `reduced-motion` | Un solo cuadro fijo, sin bucle de animación, sin paralaje y **sin recorrido fijado del hero** (la fuente y `site.css` 487). Corrige ARCHITECTURE §6, que decía «respaldo `Plates` con `reduced-motion`»: el diseño pinta un cuadro fijo de la escena. |
| Respaldo | `Plates kind="stack"` (ya portado, P-23) sin contexto, sin `OES_standard_derivatives` o tras `webglcontextlost`; sin errores de consola. |
| Liberación | Al desmontar: cancelar el bucle, desconectar observadores y escuchas, borrar buffers, texturas, *framebuffers* y programas, y `WEBGL_lose_context`. Navegar ida y vuelta no acumula contextos. |
| Idioma | Rótulos del atlas y etiquetas DOM desde `src/messages`; el atlas se regenera al cambiar de idioma (navegación de cliente). Las fuentes se cargan antes de dibujar el atlas (`document.fonts.load`). |

### 3.2 Inicio

| Sección | Con la 003 | Estado |
|---|---|---|
| Hero | Escena `mode="hero"` en `.hero-3d`; recorrido por capas al desplazar con `hero-pin` y el rótulo «Scroll to follow a request through the system» / pasos, como el diseño (escritorio y sin `reduced-motion`; a ≤ 1040 px y con `reduced-motion`, sin fijar, como `site.css`). | **[Propuesta]** P-30 (restaurar el diseño) |
| «How it's built» | Escena `mode="diagram"` en `.built-stage`, sincronizada con el selector de capas y con las 4 etiquetas DOM; se recupera la frase «The moving lights show data travelling between them» que la 002 quitó por no haber luces. | **[Comprobado]** (diseño); textos `draft` |
| Capa «Datos» | La 002 quitó PostgreSQL y MongoDB del texto y de las etiquetas (P-20). El atlas 3D los rotula. | **[Comprobado]** P-28 = A: el atlas conserva `POSTGRESQL` y `MONGODB`. P-35 = B (▲B1): el panel del selector vuelve al texto y las etiquetas del diseño |
| Resto | Sin cambios respecto a la 002. | — |

### 3.3 Arquitectura (`architecture`)

Depende de P-27 y P-28. Lo que el diseño define **[Comprobado]**
(`Technology.dc.html`, `MobileTech.dc.html` a 390 px):

- Encabezado «This is how it's built» y una línea de apoyo.
- Pestañas (chips con `aria-pressed`) de 7 tipos de sistema: Web applications,
  SaaS platforms, POS: cloud, POS: local, POS: hybrid, APIs & integrations,
  Mobile & desktop.
- Diagrama de bandas apiladas con nodos (`<button>` con `aria-pressed`), enlaces
  animados entre bandas, bandas punteadas «Add when needed» y la nota «Dashed
  layers are added only when a project needs them».
- Inspector `aria-live` con `Plates stack` que resalta la capa del nodo elegido,
  la banda, el nombre y la descripción del nodo.
- Banda final «The simplest setup that does the job» con «Start a project».

**P-28 = A (2026-11-13):** se muestran los 12 nodos con nombre de tecnología y
«Monitoring», con las condiciones de `PENDIENTES.md` (P-28). La redacción de las
pestañas POS frente a `caso-pos.md` §5 se revisa en ▲B2.

### 3.4 Rutas y CSP

- Inicio y Arquitectura **siguen estáticas con CSP de hashes** (ADR 006). El
  motor llega como *chunk* de `/_next/static/chunks/` (permitido por
  `script-src`); no hay scripts en línea propios ni atributos `style` en el HTML.
  **[Propuesta]** P-32; si el build o `csp.spec.ts` demostraran lo contrario, se
  detiene y se presenta la alternativa (nonce) para decisión, sin relajar nada.
- El manifiesto sigue en 34 rutas (Arquitectura ya existe como esqueleto).

## 4. Requisitos transversales

**R1. Bilingüe.** Todo texto visible y todo rótulo del atlas existe en `es` y
`en`; los rótulos en español caben en su celda del atlas (medido).
**R2. Seguridad.** CSP sin cambios; cero violaciones con la escena funcionando;
sin orígenes externos; sin almacenamiento del navegador.
**R3. Accesibilidad (WCAG 2.2 AA).** `<canvas aria-hidden>`; la información la
llevan las etiquetas DOM operables con teclado, el panel `aria-live` y, en
Arquitectura, el diagrama HTML. Equivalente textual: el selector de capas con
su panel (Inicio) y la lista de nodos con sus descripciones (Arquitectura).
Sin destellos; `reduced-motion` respetado.
**R4. Rendimiento.** Presupuesto en P-29; nunca JavaScript del motor en rutas
sin escena; el texto del hero es el LCP, no el lienzo.
**R5. Privacidad.** El motor lee `WEBGL_debug_renderer_info` solo para elegir el
perfil de calidad; no se envía a ningún lado. **[Comprobado]** en la fuente.

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
|---|---|---|
| CA-1 | `SITE_ORIGIN=http://localhost:3100 npm run verify` sale con 0. | Comando |
| CA-2 | Inicio y Arquitectura responden 200 en ES y EN con su contenido, un `<h1>` y `lang`; siguen estáticas en el manifiesto (34 rutas). | Playwright + `csp.spec.ts` P1 |
| CA-3 | Carga diferida: antes de que la escena entre en el viewport, 0 peticiones al *chunk* del motor y 0 llamadas a `getContext('webgl')`; en las 32 rutas sin escena, 0 en toda la visita. | Playwright (red + instrumentación de `getContext`) |
| CA-4 | Sin WebGL (contexto nulo) y sin `OES_standard_derivatives`: se ve `Plates stack`, sin errores de consola. Con pérdida de contexto simulada: respaldo en el siguiente cuadro. | Playwright con `addInitScript` y `WEBGL_lose_context` |
| CA-5 | `reduced-motion`: un solo cuadro; 0 cuadros nuevos en 2 s sin interacción; hero sin fijar. | Playwright (contador de `requestAnimationFrame` del motor) |
| CA-6 | Liberación: tras 10 navegaciones Inicio ⇄ otra página, contextos WebGL vivos ≤ 1, sin el aviso «Too many active WebGL contexts», y `delete*`/`loseContext` llamados al desmontar. | Playwright con instrumentación |
| CA-7 | Pausa: 0 cuadros con el lienzo fuera de pantalla o la pestaña oculta. | Playwright |
| CA-8 | Accesibilidad: lienzo `aria-hidden`; 4 etiquetas DOM con nombre localizado, foco visible y `aria-pressed`; panel `aria-live`; axe sin violaciones serias en Inicio y Arquitectura (1440 y 390). | axe + Playwright |
| CA-9 | Idioma: rótulos del atlas y etiquetas desde `es`/`en`; cambiar de idioma por el selector cambia los rótulos sin recargar; cada rótulo ES cabe en su celda. | Playwright + medición en el atlas |
| CA-10 | CSP intacta: `csp.spec.ts` P1–P14 en verde; 0 violaciones con la escena funcionando; el generador del manifiesto sin cambios; sin `style=` ni `on…=` en el HTML. | `csp.spec.ts`, `transversal.spec.ts` |
| CA-11 | Presupuesto (P-29): *chunk* del motor ≤ el límite aprobado (gzip); **el motor no se carga en las rutas sin escena (0 peticiones) y el código de las islas de la escena añade ≤ 1,5 KB gzip al JavaScript de las demás rutas** (P-34, ▲B1: antes «± 0 B», que el empaquetador no permite sin tocar la CSP); **JavaScript de arranque del motor ≤ 200 ms en el laboratorio** (P-37, ▲B3: antes «tarea larga de arranque», que con GPU por software la domina el navegador; en GPU real, P-12); LCP de laboratorio de Inicio ≤ el límite en móvil emulado. | Build + Playwright (Long Tasks, LCP) |
| CA-12 | Fidelidad: cuadros fijos (`reduced-motion`) del hero y del diagrama (capas −1, 0–3) a 1440 y 390 frente al motor del diseño ejecutado en un arnés aislado con el mismo renderizador, dentro de la tolerancia aprobada; Arquitectura frente a la réplica de `Technology.dc.html` con las adaptaciones aprobadas. | Comparación píxel a píxel + capturas; aprobación de Julio |
| CA-13 | Contenido: ningún texto ni rótulo del atlas rompe la política de contenido o las decisiones de P-28. | Vitest + `transversal.spec.ts` |
| CA-14 | Dependencias según P-26 (ninguna si se porta el motor propio); `npm audit --omit=dev` sin vulnerabilidades. | `git diff package.json`, audit |
| CA-15 | Documentación: `TEST-PLAN.md` §8, `ARCHITECTURE.md` §2 y §6, `PENDIENTES.md`, `REFERENCIA-DISENO.md` §4.1 y §5, `tasks.md` con evidencia. | Revisión |

## 6. Qué NO cambia

Paleta, tipografía, espaciado y composición del diseño; la CSP, el proxy, el
manifiesto y `next.config.ts`; las 32 rutas sin escena; el contenido aprobado o
en borrador de la 002 salvo lo que P-28 y P-30 decidan.

## 7. Riesgos

Ver `plan.md` §5.

## 10. Decisiones que se piden a Julio

Registradas en `docs/PENDIENTES.md` (P-26 a P-33). Resumen y recomendación en
`plan.md` §1.

**Respuestas de ▲B0 (2026-11-13):**

| ID | Decisión de Julio | Efecto en esta spec |
|---|---|---|
| P-26 | **A** | El motor es un port propio a TypeScript, sin dependencias (§2.1, §3.1; CA-14: ninguna dependencia nueva). |
| P-27 | **A** | Arquitectura se hace como `Technology.dc.html`, sin escena 3D (§3.3). |
| P-28 | **A completa** (2026-11-13, tras ▲B0) | Se muestran los 12 nodos de tecnología y «Monitoring» en Arquitectura (§3.3) y los rótulos `POSTGRESQL` y `MONGODB` del atlas (§3.2). Condiciones en `PENDIENTES.md` (P-28): «Monitoring» sin promesas, Redis opcional, Electron sin cliente ni caso POS, descripciones `draft`, lista en `src/content/architecture.ts`. Un rótulo oculto del atlas queda sin recuadro. CA-13 se comprueba contra estas condiciones. El texto y las etiquetas de la capa «Datos» del selector de Inicio no entran en la decisión: siguen como en la 002. |
| P-29 | **Aprobado tal cual** | CA-11: *chunk* del motor ≤ 25 KB gzip; +0 B en rutas sin escena; nada antes del viewport (200 px); tarea larga de arranque ≤ 200 ms; LCP de laboratorio de Inicio ≤ 2,5 s. |
| P-30 | **A** | Se restaura el recorrido fijado del hero (§3.2). |
| P-31 | **A** | Accesibilidad como el diseño (R3, CA-8). |
| P-32 | **A** | Inicio y Arquitectura siguen estáticas con hashes (§3.4). |
| P-33 | **Aprobado tal cual** | Verificación según `plan.md` §4; tolerancia de CA-12: 0 píxeles distintos, o ≤ 0,5 % con diferencia máxima ≤ 16/255 y cada diferencia explicada. |
