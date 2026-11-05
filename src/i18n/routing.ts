import { defineRouting } from 'next-intl/routing';

/**
 * Tabla única de idiomas y rutas (ADR 002, ARCHITECTURE.md §3).
 * La clave es la ruta interna (carpeta en src/app/[locale]); los valores son
 * las rutas públicas por idioma.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  // Decisión de Julio (Feature 001): «/» redirige siempre a «/es».
  // Sin detección por Accept-Language ni cookie de idioma.
  localeDetection: false,
  localeCookie: false,
  // Los alternates (hreflang) se definen en la feature 006.
  alternateLinks: false,
  pathnames: {
    '/': '/',
    '/work': { es: '/trabajo', en: '/work' },
    '/work/[slug]': { es: '/trabajo/[slug]', en: '/work/[slug]' },
    '/services': { es: '/servicios', en: '/services' },
    '/services/[slug]': { es: '/servicios/[slug]', en: '/services/[slug]' },
    '/about': { es: '/acerca-de', en: '/about' },
    '/contact': { es: '/contacto', en: '/contact' },
    '/architecture': { es: '/arquitectura', en: '/architecture' },
    '/estimate': { es: '/estimador', en: '/estimate' },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/legal': '/legal',
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (routing.locales as readonly string[]).includes(value);
}

/** Rutas sin parámetros: las que existen como página en la Feature 001. */
export const staticPathnames = (Object.keys(routing.pathnames) as AppPathname[]).filter(
  (p) => !p.includes('['),
) as Exclude<AppPathname, `${string}[${string}]${string}`>[];
