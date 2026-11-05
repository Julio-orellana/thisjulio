import type { AppPathname, Locale } from './routing';

/**
 * Resolución del selector ES | EN (ADR 002 §4).
 *
 * - Ruta sin parámetros: la misma clave en el otro idioma (equivalente exacta).
 * - Ruta con slug (caso, servicio, artículo): se pide al contenido el slug
 *   equivalente en el idioma destino. Si no existe traducción, se devuelve la
 *   página padre en el idioma destino.
 *
 * Es una función pura: la capa de contenido (feature 002/005) aporta
 * `findTranslatedSlug`. Mientras no exista contenido, toda ruta con slug cae
 * en su página padre.
 */

export const parentOf = {
  '/work/[slug]': '/work',
  '/services/[slug]': '/services',
  '/blog/[slug]': '/blog',
} as const satisfies Partial<Record<AppPathname, AppPathname>>;

type DynamicPathname = keyof typeof parentOf;
type StaticPathname = Exclude<AppPathname, DynamicPathname>;

export type RouteRef =
  | { pathname: StaticPathname }
  | { pathname: DynamicPathname; params: { slug: string } };

export type SlugLookup = (
  pathname: DynamicPathname,
  slug: string,
  from: Locale,
  to: Locale,
) => string | null | undefined;

function isDynamic(pathname: AppPathname): pathname is DynamicPathname {
  return pathname in parentOf;
}

export function resolveAlternate(
  route: { pathname: AppPathname; params?: Record<string, string | string[] | undefined> },
  from: Locale,
  to: Locale,
  findTranslatedSlug: SlugLookup = () => null,
): RouteRef {
  const { pathname } = route;
  if (!isDynamic(pathname)) return { pathname };

  const raw = route.params?.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (slug) {
    const translated = from === to ? slug : findTranslatedSlug(pathname, slug, from, to);
    if (translated) return { pathname, params: { slug: translated } };
  }
  return { pathname: parentOf[pathname] };
}
