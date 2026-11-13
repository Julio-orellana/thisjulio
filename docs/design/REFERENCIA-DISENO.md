# Referencia del diseño aprobado

> **Ubicación principal** de: inventario del diseño aprobado, huellas de
> integridad, comportamiento observado en su código y discrepancias entre el
> diseño y las decisiones de producto. Los tokens visuales se documentan aquí
> solo como evidencia; su implementación se especifica en
> `spec/features/001-fundacion-i18n-y-sistema-de-diseno/`.
>
> Inspeccionado el 2026-11-05 en la Fase 1. Solo lectura: el artefacto no se
> modificó.

## 1. Origen

| Dato | Valor |
|---|---|
| Artefacto | <https://claude.ai/code/artifact/44219896-42d7-4dfa-96e0-aa54facb8429> |
| Dirección alternativa del mismo artefacto | <https://claude.ai/artifact/9QxneyTkhgmEAKe6PyLNKi> |
| Tipo | Lienzo «Design» de Claude Design (archivos `.dc.html`) |
| Título del lienzo | «THIS JULIO — Propuesta de sitio» |
| Versión inspeccionada | `1793843453-74ee` |
| Creado | 2026-11-04 (`createdOnFiles.at`) |
| Páginas del lienzo | `site` (Website), `mobile` (Mobile), `system` (Design system) |

**`DESIGN.md` no estuvo disponible** en esta ejecución (ni en el repositorio
ni dentro del artefacto). Este documento **no lo sustituye**: es un índice
verificable del código del diseño. Cuando Julio entregue `DESIGN.md`, se
guarda en `claude/DESIGN.md` sin editarlo, se anota aquí su versión y se
revisa si alguna discrepancia de §5 cambia. Ver `docs/PENDIENTES.md` (P-01).

## 2. Inventario y huellas (SHA-256, primeros 16 caracteres)

Sirven para comprobar, en fases posteriores, que la referencia visual no
cambió. Si una huella no coincide, el diseño fue editado: se vuelve a revisar
antes de seguir implementando.

| Archivo | SHA-256 (prefijo) | Artboard / rol |
|---|---|---|
| `project/canvas.json` | `76e6decb13596a56` | Índice del lienzo |
| `project/site.css` | `aac3072a2970729a` | Hoja de estilos compartida, tokens (`:root`) |
| `project/Main.dc.html` | `4a7efa0c0ba08554` | Home, 1440×5610 |
| `project/Work.dc.html` | `867e5f6f3887054e` | Trabajo (galería con filtros) |
| `project/CaseStudy.dc.html` | `cfbf33c17df14c8b` | Caso de estudio (plantilla para 6 proyectos) |
| `project/Services.dc.html` | `d49ac38b2c572217` | Servicios (índice + panel) |
| `project/Technology.dc.html` | `3c615d97ba2981af` | Arquitectura y tecnología |
| `project/About.dc.html` | `1184fb84c4423fe4` | Acerca de |
| `project/Contact.dc.html` | `8b6158c7d77f6db4` | Contacto |
| `project/Estimator.dc.html` | `97925676aa20da8a` | Estimador |
| `project/Legal.dc.html` | `cf69880bb4b6b12d` | Legal y privacidad |
| `project/Nav.dc.html` | `23373ca13b5ad982` | Componente navegación (+ hoja móvil) |
| `project/Footer.dc.html` | `882a4bfccdb688fe` | Componente footer |
| `project/Plates.dc.html` | `e960511d1b7f2c7d` | Componente «vista explotada» (SVG/CSS) y respaldo sin WebGL |
| `project/Arch3D.dc.html` | `70cba440a2f7d01f` | Componente escena 3D (WebGL) |
| `project/Deploy.dc.html` | `74447a5a6ddde3a2` | Componente arquitecturas cloud / local / híbrida |
| `project/DesignSystem.dc.html` | `52c411c5665ed948` | Hoja del sistema de diseño |
| `project/Mobile*.dc.html` (10) | ver abajo | Envoltorios 390 px de las páginas anteriores |

Envoltorios móviles: `MobileHome` `3f1b9ec142fd086a`, `MobileMenu`
`8b9d8b619c0f30b0`, `MobileWork` `19607a4973399aee`, `MobileCase`
`16a39158fcef71b3`, `MobileServices` `9c704513b3ccd96d`, `MobileTech`
`cd5a0cffd990e1cc`, `MobileEstimator` `e93ea963221f57ea`, `MobileResult`
`c28b442a971b9314`, `MobileContact` `4ab3958704700cb5`. Cada uno importa la
página de escritorio a 390 px: **la versión móvil es el mismo marcado con las
reglas responsive de `site.css`** (cortes en 1040 px y 640 px), no un diseño
aparte.

Los archivos fuera de `project/` (`artifact-type/…`, `index.html`,
`SKILL.md`) pertenecen al editor de Claude Design, no al diseño.

## 3. Sistema visual observado (evidencia)

Tokens declarados en `site.css` `:root`. Coinciden con la paleta aprobada del
prompt de dirección técnica; los tokens adicionales (`--line`, `--line-2`,
`--accent-up`, `--accent-ink`, `--accent-soft`, `--warn`, `--ok`) existen en
el diseño y se conservan.

- **Color:** `--bg #090A0D`, `--bg-2 #12151B`, `--surface #202630`,
  `--line #283140`, `--line-2 #3A4658`, `--text #E8EAF0`, `--text-2 #929AA8`,
  `--accent #78A9FF`, `--accent-up #A3C4FF`, `--cyan #55DCEB`,
  `--violet #9B8CFF`, `--steel #C9D3E3`, `--accent-ink #06101F`,
  `--accent-soft rgba(120,169,255,.12)`, `--warn #F5BC8F`, `--ok #A9DDBF`.
- **Tipografía:** Space Grotesk (display/títulos, 300–500), Inter (cuerpo,
  400–600), JetBrains Mono (etiquetas, 400–500). Escala fluida con `clamp()`:
  display 44–104, h1 44–96, h2 32–60, h3 23–32, lead 18–22, body 16, small 14,
  mono 12 (+0.06em).
- **Espaciado:** escala `--s-1…--s-10` (4, 8, 12, 16, 24, 32, 48, 64, 96, 144),
  `--gutter clamp(20px,4.4vw,64px)`, `--section clamp(72px,10vw,152px)`,
  `--radius 2px`.
- **Movimiento:** `--ease cubic-bezier(.2,.7,.1,1)`, `--fast 160ms`,
  `--base 320ms`, `--slow 720ms`. «Things settle, they never bounce.» Con
  `prefers-reduced-motion: reduce` la escena 3D queda en un cuadro fijo.
- **Firma de marca:** los títulos de sección empiezan con la palabra
  **«This»** (`<span class="this">`), la única que lleva acento de color
  («This is the work.», «This is how it's built.», «This is Julio.»).
- **Sin efectos de vidrio**, sin gradientes de fondo; modales con velo oscuro
  y superficie sólida.

## 4. Comportamiento observado relevante para la implementación

### 4.1 Escena 3D (`Arch3D.dc.html`)

Motor propio sobre **WebGL 1 sin dependencias** (sin Three.js). Se conserva.

| Requisito del prompt | Estado en el código del diseño |
|---|---|
| Dos modos `hero` y `diagram` | Presente (`mode`). |
| Perfiles de calidad adaptativos | Presente: `high` / `balanced` / `low` según GPU por software, dispositivo táctil, memoria y núcleos; escalera de resolución ajustada por una medición temporizada (`readPixels`). |
| Resolución física, sin ampliar un render bajo | Presente: `ResizeObserver` con `device-pixel-content-box` y `devicePixelRatio`, con tope de píxeles por perfil. |
| Sin DoF ni Bloom de pantalla completa | Cumple: sombras y oclusión de contacto **horneadas una vez** (mapa de sombras + textura AO); no hay pases de posproceso. |
| Pausa fuera de pantalla | Presente: `IntersectionObserver` + `document.hidden`. |
| `prefers-reduced-motion` | Presente: un cuadro fijo, sin animación ni paralaje. |
| Respaldo sin WebGL | Presente: `Plates kind="stack"` si no hay contexto, falta `OES_standard_derivatives` o se pierde el contexto (`webglcontextlost`). |
| Etiquetas accesibles en DOM | Presente: cuatro `<button>` (Interface, Logic, Data, Infrastructure) con `aria-pressed`, foco y hover sincronizados con la escena; el `<canvas>` es `aria-hidden`. |
| **Carga diferida** | **Falta**: arranca al montar. Se agrega en la feature 003 (importación dinámica + arranque al entrar en el viewport). |
| **Liberación de recursos al desmontar** | **Incompleta**: `_stop` cancela el bucle y desconecta observadores, pero no borra buffers, texturas, framebuffers ni programas, ni llama a `WEBGL_lose_context`. Se completa en la feature 003. |
| **Textos localizados** | **Falta**: 15 rótulos están pintados en inglés dentro del atlas de texturas (`WEB`, `DESKTOP`, `MOBILE`, `SERVICES`, `API`, `RULES`, `AUTOMATION`, `POSTGRESQL`, `MONGODB`, `STORAGE`, `SYNC`, `CLOUD`, `LOCAL SERVER`, `NETWORK`, `SECURITY`) y los nombres de capa de los botones también. Se parametrizan por idioma en la feature 003, sin cambiar geometría ni estilo. |

### 4.2 Estado entre páginas

El diseño pasa la selección entre páginas con `localStorage`
(`thisjulio-case`, `thisjulio-service`, `thisjulio-legal`) porque los
artboards no tienen rutas. En la aplicación se reemplaza por **rutas y
anclas reales** (`/es/trabajo/<slug>`, `/es/servicios/<slug>`,
`/es/legal#privacidad`). Es un cambio técnico sin efecto visual y elimina
almacenamiento en el navegador (ver `SECURITY.md` §5).

### 4.3 Comportamientos UX aprobados que deben conservarse

- **Servicios:** al elegir un servicio, el número y el título quedan justo
  debajo del encabezado fijo (76 px escritorio / 64 px móvil, más la barra de
  pestañas cuando se apila), sin desplazar si ya están ahí; desplazamiento
  suave salvo `reduced-motion`. Un solo panel visible: el servicio elegido es
  el único foco.
- **Home → Trabajo:** las tarjetas de Home usan el mismo componente de vista
  (`Plates wide`) y los mismos metadatos que la galería de Trabajo.
- **Imágenes sin recorte:** las vistas de proyecto se dibujan con `Plates`
  (composiciones SVG/CSS); las capturas reales, cuando existan, se muestran
  completas (`object-fit: contain` o proporción fija del contenedor).
- **How it's built (Home):** selector de capas sincronizado con el diagrama 3D
  y con un panel `aria-live`; opción «View the complete system».
- **Hero:** al desplazar, el héroe queda fijo y recorre las cuatro capas
  («A request starts at the Interface» → … → «Infrastructure keeps it all
  running»).
- **POS:** el componente `Deploy` presenta cloud, local e híbrida como
  **alternativas** («not three features of every system»).
- **Estimador:** dos caminos (rápido de 8 preguntas aprox. / propuesta a
  medida); el precio solo aparece si existe una tarifa configurada
  (`unitRate > 0`; por defecto 0 → sin precio).

## 5. Discrepancias entre el diseño y las decisiones del prompt

Regla aplicada: prevalecen las decisiones explícitas del prompt de dirección
técnica (Fase 1). Ninguna se corrige todavía en código; cada una queda
asignada a su feature.

| ID | Discrepancia | Resolución propuesta | Feature |
|---|---|---|---|
| D-01 | Todo el texto del diseño está **solo en inglés**; el sitio es bilingüe con **español como idioma principal**. | El texto inglés del diseño es la fuente de `en`. El español se redacta a partir de él y requiere aprobación (P-04). | 001 (estructura), 002 (textos) |
| D-02 | Servicio 07 se llama «Maintenance, Support & **24/7** Assistance» en Home y Servicios. | Se usa «Soporte y mantenimiento» / «Support and maintenance». Sin «24/7», sin SLA ni tiempos. Se conserva la nota «La cobertura… se define en cada acuerdo». | 002 |
| D-03 | Los títulos de servicios del diseño no coinciden palabra por palabra con los siete aprobados. | Se usan los nombres del prompt (§4.5) como texto oficial en español; el inglés se ajusta a ellos. | 002 |
| D-04 | La hoja de menú móvil incluye un enlace **«Technology»**; el prompt excluye Technology del menú principal. | Se omite en la hoja móvil; Arquitectura queda accesible desde Home y Footer. Cambio mínimo de contenido, no de estilo. | 001 |
| D-05 | El diseño **no tiene selector ES \| EN**. | Se agrega en la navegación con los estilos existentes (`mono`, `nav-link`), sin introducir colores ni componentes nuevos. Su aspecto exacto requiere visto bueno (P-05). | 001 |
| D-06 | La página se llama «Technology» en el diseño; la ruta aprobada es `/es/arquitectura` · `/en/architecture`. | Ruta y título «Arquitectura y tecnología» / «Architecture & technology». | 001 (rutas), 003 (página) |
| D-07 | El caso POS del diseño es genérico («Custom POS & Business Management Systems», stack «Selected per project»). El prompt lo define como **proyecto real**: sistema POS de escritorio, Electron + React + TypeScript + SQLite, offline-first con respaldo en la nube. | El caso usa la descripción genérica autorizada y las capacidades de `docs/portafolio/caso-pos.md`. El componente `Deploy` sigue explicando las tres arquitecturas como servicio. | 002 |
| D-08 | La galería muestra seis proyectos con nombres propios (AY LUPITA ×2, Kinderland, ATRIO, Order Processing API) y textos marcados `[Confirm stack]`, `[Add confirmed feature]`. | Solo se publica lo verificado (P-08). Los marcadores no se publican; un proyecto sin verificar no aparece. «Explore all six projects» se vuelve un texto sin número fijo. | 002 |
| D-09 | Estado «Taking projects» en la navegación. | Es una afirmación comercial; se mantiene solo si Julio la aprueba (P-04). | 001 |
| D-10 | Las fuentes se cargan desde Google Fonts en tiempo de ejecución. | Se autoalojan con `next/font` (mismas familias y pesos): sin petición a terceros, CSP más estricta, sin cambio visual. | 001 |
| D-11 | El formulario a medida del estimador acepta **archivos adjuntos** y preferencia de reunión. | La carga de archivos se decide en la feature 004 (implica almacenamiento y escaneo); por defecto queda deshabilitada hasta aprobarse (P-06). | 004 |
| D-12 | Marcadores de contenido real faltante: retrato, CV en PDF, LinkedIn, correo, WhatsApp, año/rol/enlace de cada caso, capturas. | Se muestran como ausentes (sin marcador visible) hasta tener el dato real. | 002 |
| D-13 | Firma «**This** is …»: en español no hay traducción literal que conserve el juego con la marca THIS JULIO. | Decisión de copia de marca (P-04). Propuesta para revisar: mantener «This» como palabra de marca en ambos idiomas o usar «Esto es…» con el acento en «Esto». | 001 (mecanismo), 002 (texto) |
| D-14 | El caso POS del diseño muestra `Deploy` (cloud/local/híbrida) como si fueran del proyecto. | El caso no lleva `Deploy`: son alternativas de servicio (caso-pos.md §5). `Deploy` solo en Servicios 06 (P-19, DA-5). | 002 |
| D-15 | `Main.dc.html` muestra siempre 3 tarjetas de proyecto en 3 columnas. | Con un solo proyecto publicado, su tarjeta ocupa el ancho completo de la rejilla; con 2 o más, las 3 columnas del diseño (decisión de Julio, ▲A4, 2026-11-12). | 002 |

**Aplicado en la Feature 002 (2026-11-12).** D-01, D-02, D-03, D-08, D-12, D-13,
D-14 y D-15 resueltos como indica esta tabla, más las adaptaciones aprobadas DA-2 a
DA-8 y P-23 (opción A). Comparación con los artboards, diferencias aprobadas y
no previstas: `spec/features/002-…/evidencia-t15-fidelidad.md` §3. Nota de
implementación: el preflight de Tailwind quita el negrito por omisión de los
títulos; `design.css` lo restaura (`[app]`) para los títulos `.mono` del diseño.
