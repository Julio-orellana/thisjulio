# Arquitectura — thisjulio.com

> **Ubicación principal** de la arquitectura técnica: estructura, rutas,
> modelo de contenido, i18n, escena 3D, SEO y extensibilidad. Las decisiones
> y sus alternativas están en `docs/adr/`; la seguridad en `SECURITY.md`; las
> pruebas en `TEST-PLAN.md`. Estado: **fundación implementada en la
> Feature 001, cerrada el 2026-11-05** (§2 marca lo que existe); el resto es propuesta.

## 1. Vista general

```
Navegador ──► Proxy de Next.js (idioma: /, prefijos; CSP de hashes o nonce, ADR 006)
                 │
                 ▼
          App Router  src/app/[locale]/…
          ├─ Server Components (casi todo): leen contenido tipado
          │      └─ src/lib/content ─► src/content/* , content/blog/*
          ├─ Client Components (islas): Nav móvil, filtros, selector de
          │      capas, servicios, estimador, formularios
          ├─ Escena 3D (cliente, carga diferida) ─► src/components/scene3d
          └─ Route Handlers / Server Actions: contacto y estimador
                 └─ validación Zod ─► correo transaccional (ADR 005)
                    (sin base de datos, sin almacenamiento)
```

**Renderizado (ADR 006):**

- **Páginas públicas estáticas (SSG).** El layout declara
  `generateStaticParams` con los dos idiomas, y cada layout y cada página
  llaman a `setRequestLocale`.
- **Sin ISR**, y `cacheComponents: false`.
- **El 404 es `app/global-not-found.tsx`** (P-16): atiende toda URL que no
  es una ruta, con o sin extensión. Se renderiza por petición, en el servidor
  y con nonce, con el mismo documento que las páginas (`SiteDocument`). Para
  que una URL inexistente no sea una ruta, `[locale]/layout.tsx` declara
  `dynamicParams = false` y no hay `[...rest]`. Los formularios (004) y el
  panel futuro también serán dinámicos con nonce.
- **Las rutas con slug (002, 005) deben preferir `generateStaticParams` +
  `dynamicParams = false` en lugar de `notFound()`.** Con este layout raíz,
  Next 16 no renderiza en el servidor el 404 de `notFound()` y lo pinta en el
  cliente (ADR 006 §P-16).
- **Una página nueva tiene que seguir el mismo patrón** (`setRequestLocale` y
  sin `revalidate`). Si no, queda dinámica, o el build falla en el paso de
  hashes.

**Build:** `next build && node scripts/csp-manifest.mjs`, con `SITE_ORIGIN`
obligatoria. El segundo paso escribe `.next/csp-manifest.json`, que el proxy
lee para elegir la CSP de cada ruta.

## 2. Estructura del repositorio

`✔` = existe (Features 001 a 003). Lo demás es la propuesta para las features
siguientes.

```
src/
  proxy.ts                ✔ enrutamiento de idioma y CSP por ruta: hashes (estáticas) o nonce (dinámicas y 404); idioma de la URL para el 404 (Next 16: antes middleware.ts)
  app/
    globals.css           ✔ Tailwind + tokens + fuentes + estilos del diseño
    fonts.ts              ✔ las tres fuentes autoalojadas (D-10), una sola declaración
    global-not-found.tsx  ✔ 404 propio para toda URL que no es una ruta (P-16)
    global-error.tsx      ✔ error global propio, bilingüe (P-16)
    [locale]/
      layout.tsx          ✔ idioma (dynamicParams = false) y SiteDocument
      page.tsx            ✔ Inicio (003: escena 3D en el hero, con su recorrido, y en «How it's built»)
      work/ work/[slug]/ services/ services/[slug]/ about/ legal/
                          ✔ páginas de la 002 (34 rutas estáticas con slugs por idioma, dynamicParams = false)
      architecture/       ✔ Arquitectura (003): diagrama HTML de bandas y piezas, sin escena 3D (P-27)
      contact/            ✔ Contacto provisional por `mailto:` (006, P-43); la 004 lo sustituye por el formulario
      blog/               ✔ esqueleto (005), `noindex`; carpeta = clave interna, URL localizada por routing.ts
                            (`estimate/` se retiró en la 006 y vuelve con la 004: P-44)
      not-found.tsx       ✔ para notFound() de páginas futuras (mismo bloque que el 404)
      sistema/page.dev.tsx ✔ muestra del sistema de diseño, solo `next dev` (+ plates/ y trabajo/: laboratorios)
    robots.ts  sitemap.ts ✔ robots y sitemap estáticos (006): solo el build de producción se deja rastrear
  i18n/
    routing.ts            ✔ idiomas, predeterminado, tabla de pathnames
    navigation.ts         ✔ Link/redirect/usePathname localizados
    request.ts            ✔ configuración por petición
    messages.ts           ✔ registro de mensajes por idioma
    alternate.ts          ✔ resolvedor del selector ES | EN (`templateOf`: plantilla de una ruta interna con slug)
    client-messages.ts    ✔ espacios de mensajes que viajan al navegador: solo los de las islas (006, P-45)
    locale-hint.ts        ✔ idioma de la URL para el 404 (encabezado del proxy)
  messages/{es,en}/*.json ✔ common, nav, footer, pages, home, work, services, about, legal, cta, architecture, contact
  config/site.ts          ✔ datos no localizables (GitHub, interruptores)
  config/contact.ts       ✔ correo de contacto en dos partes; solo lo importan la isla `MailLink` y `ContactView` (006)
  components/
    layout/               ✔ SiteDocument (<html>, fuentes, Nav, Footer, «Saltar al contenido»), Nav, NavLinks, MobileMenu, LocaleSwitcher, Footer, ArrowIcon
    errors/               ✔ ErrorPanel, NotFoundPanel, BackButton (P-16)
    sections/             ✔ PageSkeleton (blog); home/ work/ services/ about/ legal/ (002); architecture/ (003); contact/ (006)
    seo/                  ✔ JsonLd: bloque `application/ld+json` (006)
    ui/                   ✔ SectionHead, Chip, TagList, PathLink, Row, Quote, ArrowLink, firma «This» (002)
    plates/               ✔ Plates sin estilos en línea + data.mjs (P-23, opción A)
    deploy/               ✔ arquitecturas cloud/local/híbrida (Servicios 06)
    scene3d/              ✔ engine.ts (motor WebGL 1, sin React), engine-shaders.ts, engine-profile.ts (puro), Scene3D.tsx (isla) (003)
  content/                ✔ esquema Zod, política de contenido y contenido (002); architecture.ts (003, P-28)
  lib/content/            ✔ única puerta al contenido, validada al importar (002)
  lib/seo/                ✔ routes.ts (puro: URL públicas, canonical, hreflang, sitemap, JSON-LD) y metadata.ts (006)
  lib/forms/ (004)
  lib/security/           ✔ headers.ts (CSP en dos modos y encabezados), origin.ts (SITE_ORIGIN validada), csp-manifest.ts (lectura del manifiesto)
  styles/
    tokens.css            ✔ copia literal de :root de site.css
    fonts.css             ✔ enlace de las familias con next/font
    design.css            ✔ estilos del diseño usados hasta ahora (001 a 003)
    plates.generated.css  ✔ una clase por valor de `Plates` (generada, versionada)
scripts/csp-manifest.mjs    ✔ hashes de la CSP desde el HTML del build (falla cerrado; lib/csp-scan.mjs)
scripts/plates-css.mjs      ✔ genera plates.generated.css antes de `dev` y `build` (002)
scripts/release-gates.mjs   ✔ puertas de publicación: último paso del build; solo bloquea el de producción (006; lib/release-gates.mjs)
release-gates.json          ✔ registro de las puertas que cierra Julio y de sus excepciones (006)
content/blog/{es,en}/*.mdx  (005)
docs/design/fuente/site.css ✔ copia de referencia del diseño (huella verificada en pruebas)
tests/unit  tests/e2e     ✔ Vitest y Playwright (e2e: la escena corre en proyectos propios con WebGL; el resto, sin él)
tests/fidelity            ✔ arnés de fidelidad del motor 3D frente al del diseño (003; fuera de `verify` y de la CI)
tests/https               ✔ arnés HTTPS local: CSP, 404 y navegación en Chromium, Firefox y WebKit (006; fuera de `verify`, en la CI)
.github/workflows/verify.yml ✔ CI solo de verificación
```

`AGENTS.md` lo genera Next.js (`next dev`) con avisos para agentes sobre
cambios de la versión 16; se conserva tal cual.

La estructura puede ajustarse en el plan de cada feature si la
implementación lo justifica; el cambio se anota aquí.

## 3. Rutas

| Clave estable | Español | Inglés | Notas |
|---|---|---|---|
| `home` | `/es` | `/en` | `/` → `/es` |
| `work` | `/es/trabajo` | `/en/work` | |
| `work.case` | `/es/trabajo/[slug]` | `/en/work/[slug]` | slug por idioma, id común |
| `services` | `/es/servicios` | `/en/services` | |
| `services.item` | `/es/servicios/[slug]` | `/en/services/[slug]` | Declarada en `routing.ts`; sin página todavía. Propuesta: enlace profundo al servicio elegido; la vista es la misma página con el servicio activo (`docs/design/REFERENCIA-DISENO.md` §4.2). Se confirma en 002. |
| `about` | `/es/acerca-de` | `/en/about` | |
| `contact` | `/es/contacto` | `/en/contact` | |
| `architecture` | `/es/arquitectura` | `/en/architecture` | Fuera del menú principal; enlazada desde Home y Footer |
| `estimate` | `/es/estimador` | `/en/estimate` | **Retirada hasta la 004** (P-44, feature 006): hoy no es una ruta y responde el 404 propio |
| `blog` | `/es/blog` | `/en/blog` | `noindex`, fuera de menú y sitemap hasta habilitarse |
| `blog.post` | `/es/blog/[slug]` | `/en/blog/[slug]` | puede existir en un solo idioma |
| `legal` | `/es/legal` | `/en/legal` | secciones con ancla: licencias, propiedad intelectual, privacidad, marco legal |

**Selector ES | EN:** clave estable + id de contenido → ruta equivalente; si
no hay traducción, la página padre (`blog.post` → `blog`, `work.case` →
`work`). Implementado en `src/i18n/alternate.ts`; la capa de contenido (002)
aportará la búsqueda de slugs traducidos. Sin ella, toda ruta con slug cae en
su página padre.

**Navegación principal:** Inicio · Trabajo · Servicios · Acerca de ·
Contacto · ES | EN · CTA «Iniciar un proyecto» (→ Contacto mientras no exista
el estimador: P-44; con la 004 vuelve a → estimador). Footer: Trabajo,
Servicios, Arquitectura, Contacto, Acerca de, GitHub, enlaces legales
(«Estimador» vuelve con la 004).

## 4. Modelo de contenido

Cada entrada separa lo **estructural** de lo **localizado**:

```ts
// Forma ilustrativa, no código definitivo
Project = {
  id: 'pos',                       // estable, común a ambos idiomas
  status: 'draft' | 'approved',    // solo 'approved' genera página
  order: number,
  view: 'site'|'dash'|'inst'|'pos'|'saas'|'api',   // composición Plates
  categories: ('web'|'dash'|'pos'|'saas'|'api')[],
  stack: string[],                 // nombres propios, no se traducen
  year?: number, links?: {...}, images?: {...},
  locales: {
    es: { slug, title, tag, line, overview, problem, solution, features[], cta },
    en: { … }
  }
}
```

Servicios, legal y navegación siguen el mismo patrón. Arquitectura (003)
guarda en `src/content/architecture.ts` sus tipos de sistema, bandas y piezas;
el esquema limita las tecnologías que puede nombrar a la lista que Julio
confirmó (P-28). Los textos de
interfaz (botones, etiquetas, estados de formulario, rótulos 3D) van en
`src/messages`. El contenido se valida con Zod en build (ADR 003).

## 5. Sistema de diseño

- `src/styles/tokens.css` traslada **literalmente** `:root` de `site.css`
  (color, tipografía, espaciado, movimiento, radio).
- Tailwind consume esas variables (tema extendido con los nombres del
  diseño); no se introducen colores ni tamaños fuera de los tokens.
- Las clases semánticas del diseño (`.display`, `.h1`…`.h3`, `.lead`,
  `.mono`, `.btn-*`, `.chip`, `.row`, `.wrap`, `.section`, `.rule`, `.band`,
  `.this`) se reproducen como componentes o utilidades equivalentes; el plan
  de la 001 decide cuáles van como componente y cuáles como capa CSS.
- Cortes responsive del diseño: 1040 px y 640 px.

## 6. Escena 3D

Implementada en la Feature 003 (cerrada el 2026-11-13). Detalle y evidencia:
`spec/features/003-escena-3d-y-arquitectura/`.

- **Motor:** port del motor WebGL 1 del diseño (`Arch3D.dc.html`) a
  TypeScript, sin React ni dependencias (`scene3d/engine.ts`; P-26).
  Geometría, materiales, atlas, sombras y oclusión horneadas, cámara,
  animación, perfiles de calidad y orden de llamadas a WebGL son los del
  diseño: pinta los mismos píxeles (arnés `tests/fidelity/`). Los shaders son
  cadenas literales; no usa `eval`, *workers*, `blob:` ni red.
- **Isla `Scene3D`:** importa el motor con `import()` y crea el `<canvas>`
  solo cuando el contenedor se acerca al viewport (200 px). El servidor no
  pinta ningún `<canvas>`. No se usa `next/dynamic` ni `React.lazy`: con
  `Suspense`, React emite scripts en línea que la CSP de hashes rechaza.
- **Dónde se usa:** solo en Inicio. `HeroScene` (modo `hero`, recorrido por
  capas al desplazar con el hero fijado; sin fijar a ≤ 1040 px, en pantallas
  muy altas y con `reduced-motion`) y `LayerPicker` (modo `diagram`,
  sincronizado con el selector de capas). **Arquitectura no lleva escena**
  (P-27): es un diagrama HTML.
- **Agregados respecto al diseño** (`docs/design/REFERENCIA-DISENO.md` §4.1):
  carga diferida; `dispose()` que borra buffers, texturas, framebuffer,
  renderbuffer, programas y shaders, retira escuchas y suelta el contexto
  (cada montaje usa un `<canvas>` nuevo); rótulos del atlas y etiquetas DOM
  desde los mensajes del idioma (el atlas se repinta al cambiar de idioma y
  al cargar la fuente); un rótulo vacío deja su celda transparente.
- **`prefers-reduced-motion`:** un cuadro fijo de la escena, sin bucle (no el
  respaldo: así lo hace el diseño).
- **Reposo (P-58 = B, WCAG 2.2.2; feature 006):** sin esa preferencia, el bucle
  se detiene 4 s después de la última interacción (puntero, desplazamiento,
  rueda, teclado, toque, elegir o señalar una capa) y la escena queda en el
  último cuadro. La interacción la reanuda desde el mismo tiempo de animación,
  sin salto. Las fórmulas de dibujo no cambian (arnés de fidelidad: mismos
  píxeles y misma traza).
- **Respaldo:** `Plates kind="stack"` sin WebGL, sin
  `OES_standard_derivatives`, con el contexto perdido y sin JavaScript
  (`<noscript>`).
- **Accesibilidad:** `<canvas aria-hidden>`; la información la llevan las 4
  etiquetas DOM (`<button aria-pressed>`, ocultas hasta que el motor las
  coloca y por debajo de 1040 / 560 px, como el diseño) y el panel `aria-live`.
- **Peso:** el motor es un *chunk* de 11,5 KB gzip que solo descarga Inicio.
  El código de las islas va en el *chunk* común: +1,1 KB gzip en todas las
  rutas (P-34).
- **Diagnóstico en el lienzo:** `data-quality` (perfil, tamaño y peldaño),
  `data-ms` (costo de un cuadro), `data-start` (JavaScript de arranque) y
  `data-triangles`, para P-12.
- **Pruebas:** Chromium sin cabeza pinta WebGL por software, caro y sensible a
  la carga. Solo `scene.spec.ts` y `scene-budget.spec.ts` corren con WebGL
  (proyectos `desktop-webgl` y `mobile-webgl`); el resto de la suite, sin él.

## 7. SEO internacional (implementado en la 006, R1)

Una función pura (`src/lib/seo/routes.ts`) escribe la URL pública de cada ruta
en cada idioma; de ella salen el canonical, el `hreflang`, el sitemap y el
JSON-LD, así que no pueden contradecirse. La indexación depende del origen
del build: solo `https://thisjulio.com` quita `noindex` y abre `robots.txt`.
El duplicado del servicio 01 (`/servicios/<slug>` muestra lo mismo que
`/servicios`) apunta su canonical a `/servicios` y no entra en el sitemap.
Sin imagen de Open Graph hasta que Julio entregue una (P-48). El JSON-LD
(`WebSite` y `Person`, P-47) va solo en Inicio.

Resumen: `generateMetadata` por página e idioma; `<html lang>`; canonical
autorreferenciado; `alternates.languages` con `es`, `en` y `x-default` →
`/es`; `sitemap.ts` con alternates (sin blog mientras esté oculto);
`robots.ts`; Open Graph por idioma; JSON-LD solo con datos reales
(`Person`/`Organization` con nombre, URL y perfiles verificados; sin
dirección, teléfono ni certificaciones no confirmadas).

## 8. Formularios (implementación en 004)

Contacto y estimador → Server Action/Route Handler → Zod → antiabuso →
correo. Sin almacenamiento. El cálculo del estimador se ejecuta en cliente
para la interacción y, si se envía, se recalcula en servidor. La tarifa
vive en configuración del servidor, no en el cliente (P-06).

## 9. Extensibilidad prevista (no se implementa)

| Futuro | Punto de extensión que ya deja la arquitectura |
|---|---|
| Panel administrativo | Grupo de rutas separado `src/app/(admin)/…` fuera de `[locale]`, con su propio layout y autenticación. |
| Clientes, proyectos, cotizaciones, contratos | `src/lib/*` con interfaces de repositorio; se agrega base de datos (PostgreSQL + Prisma) mediante un ADR nuevo cuando exista el primer caso real. |
| CMS | `src/lib/content` es la única puerta al contenido; se cambia la fuente sin tocar componentes. |
| Estimador persistente | El esquema Zod del estimador ya define el formato de una solicitud. |
| Productos y servicios digitales | Nuevo tipo de contenido con el mismo patrón estructural + localizado. |

Ninguno de estos puntos introduce dependencias, tablas ni rutas en la v1.
