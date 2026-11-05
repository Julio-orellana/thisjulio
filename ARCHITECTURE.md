# Arquitectura — thisjulio.com

> **Ubicación principal** de la arquitectura técnica: estructura, rutas,
> modelo de contenido, i18n, escena 3D, SEO y extensibilidad. Las decisiones
> y sus alternativas están en `docs/adr/`; la seguridad en `SECURITY.md`; las
> pruebas en `TEST-PLAN.md`. Estado: **propuesta de la Fase 1, nada
> implementado.**

## 1. Vista general

```
Navegador ──► Proxy de Next.js (idioma: /, prefijos, encabezados, nonce CSP)
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

Páginas estáticas por idioma generadas en build (`generateStaticParams`);
lo dinámico se limita a los formularios.

## 2. Estructura del repositorio (propuesta)

```
src/
  app/
    [locale]/
      layout.tsx            <html lang>, fuentes, Nav, Footer, proveedor i18n
      page.tsx              Inicio
      (pages)/…             trabajo|work, servicios|services, acerca-de|about,
                            contacto|contact, arquitectura|architecture,
                            estimador|estimate, legal, blog
      not-found.tsx
    robots.ts  sitemap.ts   (feature 006)
  proxy.ts                  idioma + encabezados (Next 16: antes middleware.ts)
  i18n/
    routing.ts              idiomas, predeterminado, tabla de pathnames
    navigation.ts           Link/redirect/usePathname localizados
    request.ts              carga de mensajes por petición
  messages/
    es/*.json  en/*.json    textos de interfaz por espacio de nombres
  content/
    projects/               datos estructurales + textos por idioma
    services/
    legal/
    schema.ts               esquemas Zod del contenido
  components/
    layout/                 Nav, Footer, LocaleSwitcher, SkipLink
    ui/                     Button, Link, Chip, Tag, Row, Field… (del sistema de diseño)
    sections/               bloques de página reutilizables
    plates/                 vistas «explotadas» SVG/CSS (componente Plates)
    deploy/                 arquitecturas cloud/local/híbrida (componente Deploy)
    scene3d/                motor WebGL y su envoltorio React
  lib/
    content/                getProjects(locale), getService(locale, slug)…
    seo/                    metadata, alternates, JSON-LD
    security/               encabezados, CSP
    forms/                  esquemas y envío (feature 004)
  styles/
    tokens.css              fuente única de tokens (de site.css del diseño)
    globals.css
content/
  blog/es/*.mdx  blog/en/*.mdx   (feature 005)
public/                     imágenes, favicons, CV (cuando exista)
spec/  docs/                documentación SDD
```

La estructura puede ajustarse en el plan de cada feature si la
implementación lo justifica; el cambio se anota aquí.

## 3. Rutas

| Clave estable | Español | Inglés | Notas |
|---|---|---|---|
| `home` | `/es` | `/en` | `/` → `/es` |
| `work` | `/es/trabajo` | `/en/work` | |
| `work.case` | `/es/trabajo/[slug]` | `/en/work/[slug]` | slug por idioma, id común |
| `services` | `/es/servicios` | `/en/services` | |
| `services.item` | `/es/servicios/[slug]` | `/en/services/[slug]` | Propuesta: enlace profundo al servicio elegido; la vista es la misma página con el servicio activo (`docs/design/REFERENCIA-DISENO.md` §4.2). Se confirma en 002. |
| `about` | `/es/acerca-de` | `/en/about` | |
| `contact` | `/es/contacto` | `/en/contact` | |
| `architecture` | `/es/arquitectura` | `/en/architecture` | Fuera del menú principal; enlazada desde Home y Footer |
| `estimate` | `/es/estimador` | `/en/estimate` | |
| `blog` | `/es/blog` | `/en/blog` | `noindex`, fuera de menú y sitemap hasta habilitarse |
| `blog.post` | `/es/blog/[slug]` | `/en/blog/[slug]` | puede existir en un solo idioma |
| `legal` | `/es/legal` | `/en/legal` | secciones con ancla: licencias, propiedad intelectual, privacidad, marco legal |

**Selector ES | EN:** clave estable + id de contenido → ruta equivalente; si
no hay traducción, la página padre (`blog.post` → `blog`, `work.case` →
`work`).

**Navegación principal:** Inicio · Trabajo · Servicios · Acerca de ·
Contacto · ES | EN · CTA «Iniciar un proyecto» (→ estimador). Footer: Trabajo,
Servicios, Arquitectura, Estimador, Contacto, Acerca de, GitHub, enlaces
legales.

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

Servicios, legal y navegación siguen el mismo patrón. Los textos de
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

- Se **porta el motor WebGL 1 del diseño** (`Arch3D.dc.html`) a un módulo
  TypeScript independiente de React (`scene3d/engine.ts`) con un envoltorio
  cliente (`Scene3D.tsx`). Geometrías, materiales, atlas, iluminación
  horneada, animaciones y perfiles de calidad se conservan.
- **Modos:** `hero` (recorrido por capas al desplazar) y `diagram`
  (selección de capa sincronizada con el panel).
- **Agregados respecto al diseño** (ver `docs/design/REFERENCIA-DISENO.md`
  §4.1): importación dinámica `ssr: false` y arranque al entrar en el
  viewport; `dispose()` que borra buffers, texturas, framebuffers y
  programas y libera el contexto; rótulos del atlas y botones DOM
  generados desde los mensajes del idioma activo.
- **Respaldo:** composición `Plates kind="stack"` (SVG/CSS) sin WebGL, con
  contexto perdido o con `reduced-motion` según el diseño.
- **Accesibilidad:** `<canvas aria-hidden>`; la información la llevan los
  botones DOM y el panel `aria-live`.

## 7. SEO internacional (implementación en 006)

`generateMetadata` por página e idioma; `<html lang>`; canonical
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
