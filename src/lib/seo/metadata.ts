import type { Metadata } from 'next';
import { site } from '@/config/site';
import { isLocale, routing, type Locale } from '@/i18n/routing';
import { getServices, slugPairs } from '@/lib/content';
import { parseSiteOrigin } from '@/lib/security/origin';
import { alternatesFor, indexableRoutes, isIndexable, OG_LOCALE, type SeoRoute } from './routes';

/** Origen del build (ADR 006): fijado por `next.config.ts`, nunca del encabezado Host. */
export function siteOrigin(): string {
  return parseSiteOrigin(process.env.SITE_ORIGIN);
}

/**
 * Metadatos de una página indexable (feature 006): título, descripción,
 * canonical absoluto, `hreflang` y Open Graph por idioma. `title` es el de la
 * página (el layout añade la marca); sin él, la página es Inicio.
 */
export function buildPageMetadata({
  origin,
  locale,
  route,
  title,
  description,
  canonical,
}: {
  origin: string;
  locale: Locale;
  route: SeoRoute;
  title?: string;
  description: string;
  canonical?: SeoRoute;
}): Metadata {
  const alternates = alternatesFor(origin, route, locale, canonical);
  return {
    ...(title ? { title } : {}),
    description,
    alternates,
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: title ? `${title} · ${site.name}` : site.name,
      description,
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    // Sin imagen de Open Graph mientras Julio no entregue una (P-48): tarjeta de texto.
    twitter: { card: 'summary', title: title ? `${title} · ${site.name}` : site.name, description },
  };
}

export function pageMetadata(input: { locale: string; route: SeoRoute; title?: string; description: string; canonical?: SeoRoute }): Metadata {
  return buildPageMetadata({ ...input, origin: siteOrigin(), locale: isLocale(input.locale) ? input.locale : routing.defaultLocale });
}

/** Indexación según el origen (spec 006 §3.4): solo el build de producción quita `noindex`. */
export function siteRobots(): Metadata['robots'] {
  return isIndexable(siteOrigin()) ? { index: true, follow: true } : { index: false, follow: false };
}

/** El servicio 01 es el que muestra `/servicios`: su ruta con slug es un duplicado (002, limitación 6). */
export function firstServiceRoute(): SeoRoute {
  const slugs = Object.fromEntries(routing.locales.map((l) => [l, getServices(l)[0].slug])) as Record<Locale, string>;
  return { pathname: '/services/[slug]', slugs };
}

/** Rutas del sitemap: las indexables, sin el duplicado del servicio 01. */
export function sitemapRoutes(): SeoRoute[] {
  return indexableRoutes(slugPairs(), [firstServiceRoute()]);
}

/** Ruta con slug a partir del slug de un idioma (para canonical y `hreflang` de casos y servicios). */
export function slugRoute(pathname: '/work/[slug]' | '/services/[slug]', locale: string, slug: string): SeoRoute | null {
  const from = isLocale(locale) ? locale : routing.defaultLocale;
  const slugs = slugPairs()[pathname]?.find((p) => p[from] === slug);
  return slugs ? { pathname, slugs } : null;
}
