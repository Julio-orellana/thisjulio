# 001 — Plan

**Estado:** propuesta (se aprueba junto con `spec.md`)

## 0. Lo que se leyó antes de planear

- Diseño aprobado, versión `1793843453-74ee`: `site.css` (tokens, cortes
  1040/640), `Nav.dc.html`, `Footer.dc.html`, `MobileMenu.dc.html`,
  `DesignSystem.dc.html` (`docs/design/REFERENCIA-DISENO.md`).
- Registro npm (2026-11-05): `next@16.4.5` (Node ≥ 20.9), `react@19.3.1`,
  `next-intl@4.14.9` (peer `next ^16`), `tailwindcss@4.3.4`, `zod@4.6.7`,
  `typescript@7.0.2`.
- No estuvieron disponibles `DESIGN.md` ni `TECH-STACK.md` (P-01); si al
  llegar contradicen este plan, se revisa antes de implementar.

## 1. Orden de construcción y por qué

1. **Prueba de compatibilidad primero.** Crear el proyecto con
   `create-next-app` (App Router, TypeScript, Tailwind, ESLint, `src/`), fijar
   versiones exactas y comprobar con un ejemplo mínimo que `next-intl` funciona
   con `proxy.ts` y `pathnames` localizados. Si TypeScript 7 no está soportado
   oficialmente por Next.js, se fija la última línea soportada. Así un
   problema de versiones aparece antes de escribir nada más.
2. **Tokens y fuentes.** Copiar `:root` de `site.css` a
   `src/styles/tokens.css` y mapearlo en el tema de Tailwind 4 (`@theme`
   referenciando las variables). Fuentes con `next/font/google`
   (descargadas en build y servidas desde el propio dominio).
3. **Estilos base** del diseño en una capa `@layer base/components`
   trasladada de `site.css` solo para lo que usa esta feature (tipografía,
   `wrap`, `section`, `rule`, `band`, `.this`, botones, enlaces, estado, foco,
   nav, footer). El resto de `site.css` se trasladará en la feature que lo
   necesite, para no arrastrar CSS sin uso.
4. **i18n:** `src/i18n/routing.ts` (idiomas, predeterminado `es`,
   `localePrefix: 'always'`, `pathnames` con la tabla de `ARCHITECTURE.md` §3,
   `localeDetection` desactivado salvo decisión contraria), `navigation.ts`,
   `request.ts`; mensajes `common`, `nav`, `footer`, `pages` (títulos).
5. **Resolvedor del selector:** función pura `alternateHref(routeKey,
   params, targetLocale)` que devuelve la ruta equivalente o la del padre si
   el contenido no existe en el idioma destino. Se prueba en unitario.
6. **Layout:** `app/[locale]/layout.tsx` con `<html lang>`, fuentes,
   `NextIntlClientProvider` limitado a los mensajes que necesitan islas de
   cliente, `SkipLink`, `Nav`, `Footer`.
   - `Nav`: Server Component; la hoja móvil es una isla cliente mínima
     (`MobileMenu`) con `aria-expanded`, cierre con Escape y devolución de
     foco.
   - `LocaleSwitcher`: Server Component cuando se conoce la ruta; isla
     cliente solo si hace falta `usePathname`.
7. **Esqueletos de ruta** para todas las claves; `blog` con
   `robots: { index: false, follow: false }`.
8. **Seguridad:** `proxy.ts` genera el *nonce* y la CSP junto con el
   enrutamiento de `next-intl`; el resto de encabezados en `next.config.ts`
   (`headers()`), `poweredByHeader: false`.
9. **Pruebas y CI** (sección 4).
10. **Página de muestra del sistema** en `src/app/(dev)/sistema/` que solo
    se genera cuando `NODE_ENV !== 'production'`.

## 2. Dependencias

| Paquete | Por qué | Tipo |
|---|---|---|
| `next`, `react`, `react-dom` | Stack aprobado | prod |
| `next-intl` | i18n (ADR 002) | prod |
| `tailwindcss`, `@tailwindcss/postcss` | Estilos aprobados | dev |
| `typescript`, `@types/*`, `eslint`, `eslint-config-next` | Verificación estática | dev |
| `vitest` | Pruebas unitarias | dev |
| `@playwright/test` | e2e y cabeceras; usa el Chromium del entorno | dev |
| `@axe-core/playwright` | Accesibilidad | dev |

Zod entra en la 002 con el contenido. No se agrega ninguna otra.

## 3. Alternativas descartadas

- **Trasladar `site.css` completo de una vez:** más rápido, pero mezcla
  estilos de páginas aún inexistentes y dificulta saber qué se usa.
- **CSS Modules en lugar de Tailwind:** el stack aprobado es Tailwind; los
  tokens como variables CSS permiten usar ambos si una animación compleja
  lo pidiera.
- **Detección automática de idioma:** contradice «español predeterminado»
  (decisión en `spec.md` §6.2).

## 4. Verificación

- Unitarias: equivalencia de tokens (CA-2), claves de mensajes (CA-6),
  resolvedor del selector (CA-5).
- e2e (Playwright, Chromium preinstalado en
  `/opt/pw-browsers/chromium` si la versión fijada no lo encuentra):
  redirecciones y tabla de rutas (CA-3, CA-4), selector (CA-5), menú móvil
  (CA-8), axe (CA-9), cabeceras (CA-10), red (CA-11), blog (CA-12), textos
  prohibidos (CA-13).
- Visual: capturas de Nav/Footer a 1440 y 390 junto a los artboards; se
  adjuntan al cierre y se presentan a Julio para P-05 (CA-7).
- CI: workflow `verify.yml` (instalar con `npm ci`, `verify`, e2e).

## 5. Riesgos

Ver `spec.md` §7. Riesgo adicional de plan: **Tailwind 4 y variables con
`clamp()`** — los tamaños fluidos del diseño se mantienen como variables CSS
y se usan vía `text-[length:var(--t-h1)]` o utilidades propias, sin
recalcularlos.
