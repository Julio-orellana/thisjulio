import { site } from '@/config/site';
import type { SlugPairs } from '@/i18n/alternate';
import { routing, staticPathnames, type AppPathname, type Locale } from '@/i18n/routing';

/**
 * SEO internacional (feature 006, ARCHITECTURE.md §7): URL públicas, canonical,
 * `hreflang` y sitemap. Funciones puras: el origen entra como parámetro, para
 * probarlas sin build (tests/unit/seo.test.ts).
 */

/** Único origen que se indexa (P-39). Cualquier otro build sigue `noindex`. */
export const PRODUCTION_ORIGIN = `https://${site.domain}`;

export function isIndexable(origin: string): boolean {
  return origin === PRODUCTION_ORIGIN;
}

type SlugPathname = '/work/[slug]' | '/services/[slug]';
type PlainPathname = Exclude<AppPathname, `${string}[${string}`>;

/** Una ruta del sitio con todo lo necesario para escribir su URL en cualquier idioma. */
export type SeoRoute = { pathname: PlainPathname } | { pathname: SlugPathname; slugs: Record<Locale, string> };

/** Rutas que existen pero no se indexan ni entran en el sitemap: el blog, hasta que se habilite. */
export const NOINDEX_PATHNAMES: readonly AppPathname[] = ['/blog', '/blog/[slug]'];

/** Ruta pública sin origen: `/es`, `/es/trabajo`, `/en/work/desktop-pos-system`. */
export function publicPath(route: SeoRoute, locale: Locale): string {
  const entry = routing.pathnames[route.pathname];
  const template: string = typeof entry === 'string' ? entry : entry[locale];
  const path = 'slugs' in route ? template.replace('[slug]', route.slugs[locale]) : template;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function absoluteUrl(origin: string, route: SeoRoute, locale: Locale): string {
  return origin + publicPath(route, locale);
}

/** `hreflang`: cada idioma y `x-default` → la versión en español (idioma por omisión). */
export function languageAlternates(origin: string, route: SeoRoute): Record<Locale | 'x-default', string> {
  return {
    es: absoluteUrl(origin, route, 'es'),
    en: absoluteUrl(origin, route, 'en'),
    'x-default': absoluteUrl(origin, route, routing.defaultLocale),
  };
}

/**
 * Canonical y alternates de una página. Con `canonical` (otra ruta que muestra
 * lo mismo), la página apunta a ella y no declara `hreflang`: no es la versión
 * que se indexa.
 */
export function alternatesFor(origin: string, route: SeoRoute, locale: Locale, canonical?: SeoRoute) {
  if (canonical) return { canonical: absoluteUrl(origin, canonical, locale) };
  return { canonical: absoluteUrl(origin, route, locale), languages: languageAlternates(origin, route) };
}

/**
 * Rutas indexables, en orden estable. Las de slug salen del contenido
 * (`slugPairs()`). `duplicates` son rutas con slug que muestran lo mismo que su
 * página padre (el servicio 01 es `/servicios`): no entran en el sitemap.
 */
export function indexableRoutes(pairs: SlugPairs, duplicates: readonly SeoRoute[] = []): SeoRoute[] {
  const plain: SeoRoute[] = staticPathnames.filter((p) => !NOINDEX_PATHNAMES.includes(p)).map((pathname) => ({ pathname }));
  const withSlug: SeoRoute[] = (['/work/[slug]', '/services/[slug]'] as const).flatMap((pathname) =>
    (pairs[pathname] ?? []).map((slugs) => ({ pathname, slugs })),
  );
  const skip = new Set(duplicates.map((d) => publicPath(d, routing.defaultLocale)));
  return [...plain, ...withSlug.filter((r) => !skip.has(publicPath(r, routing.defaultLocale)))];
}

/** Entradas del sitemap: una por ruta e idioma, cada una con todos sus alternates. */
export function sitemapEntries(origin: string, routes: readonly SeoRoute[]) {
  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(origin, route, locale),
      alternates: { languages: languageAlternates(origin, route) },
    })),
  );
}

/** `og:locale` por idioma. Guatemala es la base de THIS JULIO (mission.md §1). */
export const OG_LOCALE: Record<Locale, string> = { es: 'es_GT', en: 'en_US' };

/**
 * Datos estructurados (P-47, opción A): `WebSite` y `Person`. Solo datos reales
 * y ya públicos: marca, URL, nombre de Julio (Acerca de) y GitHub. Sin correo,
 * cargo, dirección, teléfono ni valoraciones.
 */
export function structuredData(origin: string, locale: Locale) {
  const home = absoluteUrl(origin, { pathname: '/' }, locale);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${home}#website`, name: site.name, url: home, inLanguage: locale },
      {
        '@type': 'Person',
        '@id': `${origin}/#person`,
        name: site.owner,
        url: absoluteUrl(origin, { pathname: '/about' }, locale),
        sameAs: [site.githubUrl],
      },
    ],
  };
}

/** JSON-LD serializado para un `<script type="application/ld+json">`: `<` escapado (guía de JSON-LD de Next). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
