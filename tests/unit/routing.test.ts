import { describe, expect, it } from 'vitest';
import { resolveAlternate } from '@/i18n/alternate';
import { routing, staticPathnames } from '@/i18n/routing';

// Tabla aprobada (prompt §4.1, ARCHITECTURE.md §3). Sin `/estimate`: el estimador no es una ruta hasta la
// feature 004 (P-44, decisión de Julio en ▲C0 de la 006).
const approved = {
  '/': ['/', '/'],
  '/work': ['/trabajo', '/work'],
  '/services': ['/servicios', '/services'],
  '/about': ['/acerca-de', '/about'],
  '/contact': ['/contacto', '/contact'],
  '/architecture': ['/arquitectura', '/architecture'],
  '/blog': ['/blog', '/blog'],
  '/legal': ['/legal', '/legal'],
} as const;

describe('tabla de rutas', () => {
  it('español es el idioma predeterminado, sin detección automática ni cookie', () => {
    expect(routing.defaultLocale).toBe('es');
    expect(routing.locales).toEqual(['es', 'en']);
    expect(routing.localeDetection).toBe(false);
    expect(routing.localeCookie).toBe(false);
  });

  it('contiene exactamente los pares aprobados', () => {
    const actual = Object.fromEntries(
      staticPathnames.map((p) => {
        const v = routing.pathnames[p];
        return [p, typeof v === 'string' ? [v, v] : [v.es, v.en]];
      }),
    );
    expect(actual).toEqual(approved);
  });
});

// CA-5: el selector lleva a la equivalente o a la página padre.
describe('resolveAlternate', () => {
  it('una ruta sin parámetros conserva su clave en el otro idioma', () => {
    for (const pathname of staticPathnames) {
      expect(resolveAlternate({ pathname }, 'es', 'en')).toEqual({ pathname });
    }
  });

  it('un caso con traducción lleva al slug equivalente', () => {
    const lookup = (_p: string, slug: string) => (slug === 'sistema-pos' ? 'pos-system' : null);
    expect(resolveAlternate({ pathname: '/work/[slug]', params: { slug: 'sistema-pos' } }, 'es', 'en', lookup)).toEqual({
      pathname: '/work/[slug]',
      params: { slug: 'pos-system' },
    });
  });

  it('sin traducción lleva a la página padre', () => {
    expect(resolveAlternate({ pathname: '/blog/[slug]', params: { slug: 'solo-es' } }, 'es', 'en')).toEqual({ pathname: '/blog' });
    expect(resolveAlternate({ pathname: '/work/[slug]', params: { slug: 'x' } }, 'en', 'es')).toEqual({ pathname: '/work' });
    expect(resolveAlternate({ pathname: '/services/[slug]' }, 'es', 'en')).toEqual({ pathname: '/services' });
  });

  it('en el mismo idioma conserva el slug', () => {
    expect(resolveAlternate({ pathname: '/blog/[slug]', params: { slug: 'a' } }, 'es', 'es')).toEqual({
      pathname: '/blog/[slug]',
      params: { slug: 'a' },
    });
  });
});

// 006 · CA-4: en el prerender, una página con slug en español llega con su ruta interna sin resolver.
describe('templateOf', () => {
  it('una ruta de la tabla es su propia plantilla', async () => {
    const { templateOf } = await import('@/i18n/alternate');
    for (const pathname of staticPathnames) expect(templateOf(pathname)).toBe(pathname);
    expect(templateOf('/services/[slug]')).toBe('/services/[slug]');
  });

  it('una ruta interna con slug se resuelve a su plantilla', async () => {
    const { templateOf } = await import('@/i18n/alternate');
    expect(templateOf('/services/apis-y-automatizacion')).toBe('/services/[slug]');
    expect(templateOf('/work/sistema-pos-de-escritorio')).toBe('/work/[slug]');
    expect(templateOf('/blog/un-articulo')).toBe('/blog/[slug]');
  });

  it('lo que no es del sitio no tiene plantilla', async () => {
    const { templateOf } = await import('@/i18n/alternate');
    for (const p of ['/no-existe', '/services/a/b', '/services/', '/servicios/apis-y-automatizacion', '/estimate', '/foto.png']) {
      expect(templateOf(p), p).toBeNull();
    }
  });

  it('con la plantilla, el selector lleva al slug del otro idioma también en el prerender', async () => {
    const { lookupFromPairs, templateOf } = await import('@/i18n/alternate');
    const { slugPairs } = await import('@/lib/content');
    const pathname = templateOf('/services/apis-y-automatizacion')!;
    expect(resolveAlternate({ pathname, params: { slug: 'apis-y-automatizacion' } }, 'es', 'en', lookupFromPairs(slugPairs()))).toEqual({
      pathname: '/services/[slug]',
      params: { slug: 'apis-and-automation' },
    });
  });
});
