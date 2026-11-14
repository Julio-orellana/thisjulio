import { describe, expect, it } from 'vitest';
import { routing, staticPathnames } from '@/i18n/routing';
import { getServices, slugPairs } from '@/lib/content';
import { buildPageMetadata, firstServiceRoute, sitemapRoutes, slugRoute } from '@/lib/seo/metadata';
import {
  absoluteUrl,
  alternatesFor,
  indexableRoutes,
  isIndexable,
  languageAlternates,
  NOINDEX_PATHNAMES,
  PRODUCTION_ORIGIN,
  publicPath,
  serializeJsonLd,
  sitemapEntries,
  structuredData,
  type SeoRoute,
} from '@/lib/seo/routes';

// Feature 006 · T5 (CA-5 a CA-8): SEO internacional. Funciones puras, sin build.
const ORIGIN = 'https://thisjulio.com';
const pos: SeoRoute = { pathname: '/work/[slug]', slugs: { es: 'sistema-pos-de-escritorio', en: 'desktop-pos-system' } };

describe('origen e indexación', () => {
  it('el único origen indexable es el de producción (P-39)', () => {
    expect(PRODUCTION_ORIGIN).toBe('https://thisjulio.com');
    expect(isIndexable('https://thisjulio.com')).toBe(true);
    for (const o of ['http://localhost:3100', 'https://www.thisjulio.com', 'https://preview.thisjulio.com', 'https://thisjulio.vercel.app', 'http://thisjulio.com']) {
      expect(isIndexable(o), o).toBe(false);
    }
  });
});

describe('URL públicas', () => {
  it('Inicio es /es y /en; las demás llevan su ruta localizada', () => {
    expect(publicPath({ pathname: '/' }, 'es')).toBe('/es');
    expect(publicPath({ pathname: '/' }, 'en')).toBe('/en');
    expect(publicPath({ pathname: '/work' }, 'es')).toBe('/es/trabajo');
    expect(publicPath({ pathname: '/about' }, 'es')).toBe('/es/acerca-de');
    expect(publicPath({ pathname: '/about' }, 'en')).toBe('/en/about');
    expect(publicPath({ pathname: '/legal' }, 'en')).toBe('/en/legal');
  });

  it('una ruta con slug usa el slug de cada idioma', () => {
    expect(absoluteUrl(ORIGIN, pos, 'es')).toBe('https://thisjulio.com/es/trabajo/sistema-pos-de-escritorio');
    expect(absoluteUrl(ORIGIN, pos, 'en')).toBe('https://thisjulio.com/en/work/desktop-pos-system');
  });
});

describe('canonical y hreflang', () => {
  it('canonical absoluto y autorreferenciado; es, en y x-default → español', () => {
    expect(alternatesFor(ORIGIN, { pathname: '/services' }, 'en')).toEqual({
      canonical: 'https://thisjulio.com/en/services',
      languages: {
        es: 'https://thisjulio.com/es/servicios',
        en: 'https://thisjulio.com/en/services',
        'x-default': 'https://thisjulio.com/es/servicios',
      },
    });
  });

  it('los alternates son recíprocos: las dos versiones declaran exactamente lo mismo', () => {
    for (const route of sitemapRoutes()) {
      const es = alternatesFor(ORIGIN, route, 'es');
      const en = alternatesFor(ORIGIN, route, 'en');
      expect(es.languages).toEqual(en.languages);
      expect(es.languages?.es).toBe(es.canonical);
      expect(en.languages?.en).toBe(en.canonical);
      expect(es.languages?.['x-default']).toBe(es.canonical);
    }
  });

  it('todas las URL son absolutas, del origen, sin barra final ni doble barra', () => {
    for (const route of sitemapRoutes()) {
      for (const url of Object.values(languageAlternates(ORIGIN, route))) {
        expect(url).toMatch(/^https:\/\/thisjulio\.com\/(es|en)(\/[a-z0-9-]+)*$/);
      }
    }
  });

  it('una página duplicada apunta a la canónica y no declara hreflang', () => {
    const first = firstServiceRoute();
    expect(alternatesFor(ORIGIN, first, 'es', { pathname: '/services' })).toEqual({ canonical: 'https://thisjulio.com/es/servicios' });
  });

  it('slugRoute encuentra el par de slugs desde cualquiera de los dos idiomas, y nada para un slug ajeno', () => {
    expect(slugRoute('/work/[slug]', 'es', 'sistema-pos-de-escritorio')).toEqual(pos);
    expect(slugRoute('/work/[slug]', 'en', 'desktop-pos-system')).toEqual(pos);
    expect(slugRoute('/work/[slug]', 'en', 'sistema-pos-de-escritorio')).toBeNull();
    expect(slugRoute('/services/[slug]', 'es', 'no-existe')).toBeNull();
  });
});

describe('sitemap', () => {
  const routes = sitemapRoutes();
  const urls = sitemapEntries(ORIGIN, routes).map((e) => e.url);

  it('contiene las páginas indexables: 7 sin slug, el caso y 6 servicios, en los dos idiomas', () => {
    expect(routes).toHaveLength(7 + 1 + 6);
    expect(urls).toHaveLength(28);
    expect(new Set(urls).size).toBe(28);
    for (const expected of ['/es', '/en', '/es/trabajo', '/en/work', '/es/servicios', '/es/acerca-de', '/es/contacto', '/en/contact', '/es/arquitectura', '/es/legal', '/es/trabajo/sistema-pos-de-escritorio', '/en/services/pos-systems']) {
      expect(urls, expected).toContain(ORIGIN + expected);
    }
  });

  it('no contiene el blog, el estimador ni el duplicado del servicio 01', () => {
    expect(urls.filter((u) => /blog|estimad|estimate/.test(u))).toEqual([]);
    const first = getServices('es')[0].slug;
    expect(urls.filter((u) => u.endsWith(`/${first}`))).toEqual([]);
    expect(NOINDEX_PATHNAMES).toContain('/blog');
  });

  it('toda ruta sin slug que no sea del blog entra sola (una página nueva no se olvida)', () => {
    const plain = indexableRoutes({}).map((r) => r.pathname);
    expect(plain).toEqual(staticPathnames.filter((p) => p !== '/blog'));
  });

  it('cada entrada lleva sus tres alternates y se incluye a sí misma', () => {
    for (const entry of sitemapEntries(ORIGIN, routes)) {
      expect(Object.keys(entry.alternates.languages).sort()).toEqual(['en', 'es', 'x-default']);
      expect(Object.values(entry.alternates.languages)).toContain(entry.url);
    }
  });

  it('las rutas con slug salen del contenido: un par por caso y por servicio', () => {
    const pairs = slugPairs();
    expect(pairs['/work/[slug]']).toHaveLength(1);
    expect(pairs['/services/[slug]']).toHaveLength(7);
  });
});

describe('metadatos de página', () => {
  it('Open Graph por idioma, con la URL canónica y la marca', () => {
    const m = buildPageMetadata({ origin: ORIGIN, locale: 'es', route: { pathname: '/work' }, title: 'Trabajo', description: 'Proyectos.' });
    expect(m.title).toBe('Trabajo');
    expect(m.description).toBe('Proyectos.');
    expect(m.openGraph).toMatchObject({
      type: 'website',
      siteName: 'THIS JULIO',
      title: 'Trabajo · THIS JULIO',
      description: 'Proyectos.',
      url: 'https://thisjulio.com/es/trabajo',
      locale: 'es_GT',
      alternateLocale: ['en_US'],
    });
  });

  it('Inicio no fija título (lo pone el layout) y su Open Graph lleva la marca', () => {
    const m = buildPageMetadata({ origin: ORIGIN, locale: 'en', route: { pathname: '/' }, description: 'x' });
    expect('title' in m).toBe(false);
    expect(m.openGraph).toMatchObject({ title: 'THIS JULIO', url: 'https://thisjulio.com/en', locale: 'en_US', alternateLocale: ['es_GT'] });
  });

  it('sin imagen de Open Graph mientras no haya una aprobada (P-48)', () => {
    const m = buildPageMetadata({ origin: ORIGIN, locale: 'es', route: { pathname: '/' }, description: 'x' });
    expect(JSON.stringify(m)).not.toMatch(/image/i);
    expect(m.twitter).toMatchObject({ card: 'summary' });
  });
});

describe('datos estructurados (P-47, opción A)', () => {
  const data = structuredData(ORIGIN, 'es');
  const [website, person] = data['@graph'];

  it('solo WebSite y Person, con datos reales', () => {
    expect(data['@graph'].map((n) => n['@type'])).toEqual(['WebSite', 'Person']);
    expect(website).toMatchObject({ name: 'THIS JULIO', url: 'https://thisjulio.com/es', inLanguage: 'es' });
    expect(person).toMatchObject({ name: 'Julio Orellana', url: 'https://thisjulio.com/es/acerca-de', sameAs: ['https://github.com/Julio-orellana'] });
  });

  it('sin correo, teléfono, dirección, cargo, organización ni valoraciones', () => {
    const text = JSON.stringify(data);
    expect(text).not.toMatch(/email|telephone|address|jobTitle|Organization|rating|review|@thisjulio|mailto/i);
    expect(Object.keys(website).sort()).toEqual(['@id', '@type', 'inLanguage', 'name', 'url']);
    expect(Object.keys(person).sort()).toEqual(['@id', '@type', 'name', 'sameAs', 'url']);
  });

  it('se serializa como JSON válido con «<» escapado', () => {
    const out = serializeJsonLd({ a: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ a: '</script><script>alert(1)</script>' });
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it('en inglés apunta a las URL en inglés', () => {
    const en = structuredData(ORIGIN, 'en')['@graph'];
    expect(en[0].url).toBe('https://thisjulio.com/en');
    expect(en[1].url).toBe('https://thisjulio.com/en/about');
    expect(routing.locales).toEqual(['es', 'en']);
  });
});
