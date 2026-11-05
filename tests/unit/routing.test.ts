import { describe, expect, it } from 'vitest';
import { resolveAlternate } from '@/i18n/alternate';
import { routing, staticPathnames } from '@/i18n/routing';

// Tabla aprobada (prompt §4.1, ARCHITECTURE.md §3).
const approved = {
  '/': ['/', '/'],
  '/work': ['/trabajo', '/work'],
  '/services': ['/servicios', '/services'],
  '/about': ['/acerca-de', '/about'],
  '/contact': ['/contacto', '/contact'],
  '/architecture': ['/arquitectura', '/architecture'],
  '/estimate': ['/estimador', '/estimate'],
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
