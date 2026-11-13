import { expect, test } from '@playwright/test';
import { casePair, routePairs, servicePairs, sitePaths } from './routes';

/**
 * Feature 006 · T5 (CA-5 a CA-8): metadatos, canonical, hreflang, sitemap, robots, JSON-LD y Open Graph sobre
 * el HTML real del build. El build de las e2e usa el origen de pruebas, así que aquí se comprueba además que un
 * origen que no es el de producción sigue `noindex` y con `robots.txt` cerrado. El caso de producción lo cubren
 * tests/unit/seo.test.ts y tests/unit/seo-origin.test.ts.
 */
type Pair = { es: string; en: string };
/** El servicio 01 es el que muestra `/servicios`: su ruta con slug es un duplicado con canonical a `/servicios`. */
const duplicate: Pair = { es: servicePairs[0].es, en: servicePairs[0].en };
const servicesHub: Pair = { es: '/es/servicios', en: '/en/services' };
const indexablePairs: Pair[] = [
  ...routePairs.filter((r) => r.key !== 'blog').map(({ es, en }) => ({ es, en })),
  ...servicePairs.slice(1).map(({ es, en }) => ({ es, en })),
  { ...casePair },
];
const OG_LOCALE = { es: 'es_GT', en: 'en_US' } as const;

async function head(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const attr = (sel: string, name: string) => document.querySelector(sel)?.getAttribute(name) ?? null;
    return {
      title: document.title,
      description: attr('meta[name="description"]', 'content'),
      robots: attr('meta[name="robots"]', 'content'),
      canonical: [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.getAttribute('href')),
      alternates: Object.fromEntries(
        [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]),
      ),
      og: Object.fromEntries([...document.querySelectorAll('meta[property^="og:"]')].map((m) => [m.getAttribute('property'), m.getAttribute('content')])),
      ogAlternate: [...document.querySelectorAll('meta[property="og:locale:alternate"]')].map((m) => m.getAttribute('content')),
      twitterCard: attr('meta[name="twitter:card"]', 'content'),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ''),
    };
  });
}

test.describe('CA-5 / CA-8: canonical, hreflang y Open Graph por página', () => {
  for (const pair of indexablePairs) {
    for (const locale of ['es', 'en'] as const) {
      test(pair[locale], async ({ page, baseURL }) => {
        await page.goto(pair[locale]);
        const h = await head(page);
        const self = baseURL + pair[locale];
        expect(h.canonical).toEqual([self]);
        expect(h.alternates).toEqual({ es: baseURL + pair.es, en: baseURL + pair.en, 'x-default': baseURL + pair.es });
        expect(h.title.endsWith('THIS JULIO')).toBe(true);
        expect((h.description ?? '').length).toBeGreaterThan(20);
        expect(h.og).toMatchObject({
          'og:type': 'website',
          'og:site_name': 'THIS JULIO',
          'og:title': h.title,
          'og:description': h.description,
          'og:url': self,
          'og:locale': OG_LOCALE[locale],
        });
        expect(h.ogAlternate).toEqual([OG_LOCALE[locale === 'es' ? 'en' : 'es']]);
        // P-48: sin imagen de Open Graph mientras Julio no entregue una.
        expect(Object.keys(h.og).filter((k) => k.startsWith('og:image'))).toEqual([]);
        expect(h.twitterCard).toBe('summary');
      });
    }
  }

  test('el duplicado del servicio 01 apunta a /servicios y no declara hreflang', async ({ page, baseURL }) => {
    for (const locale of ['es', 'en'] as const) {
      await page.goto(duplicate[locale]);
      const h = await head(page);
      expect(h.canonical).toEqual([baseURL + servicesHub[locale]]);
      expect(h.alternates).toEqual({});
    }
  });

  test('títulos y descripciones únicos por idioma entre las páginas indexables', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    for (const locale of ['es', 'en'] as const) {
      const titles: string[] = [];
      const descriptions: string[] = [];
      for (const pair of indexablePairs) {
        await page.goto(pair[locale]);
        const h = await head(page);
        titles.push(h.title);
        descriptions.push(h.description ?? '');
      }
      expect(new Set(titles).size, `títulos ${locale}`).toBe(indexablePairs.length);
      expect(new Set(descriptions).size, `descripciones ${locale}`).toBe(indexablePairs.length);
    }
  });
});

test.describe('CA-6: indexación, robots.txt y sitemap.xml', () => {
  test('con un origen que no es el de producción, todas las páginas siguen noindex', async ({ page, baseURL }, info) => {
    test.skip(info.project.name !== 'desktop');
    expect(baseURL).not.toBe('https://thisjulio.com');
    for (const { path } of sitePaths) {
      await page.goto(path);
      expect((await head(page)).robots, path).toMatch(/noindex/);
    }
  });

  test('robots.txt de un origen de pruebas lo prohíbe todo y no anuncia sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/plain');
    const text = await res.text();
    expect(text).toMatch(/User-Agent: \*\s+Disallow: \/\s*$/i);
    expect(text).not.toMatch(/^Allow:|^Sitemap:/im);
  });

  test('sitemap.xml lista exactamente las páginas indexables, con sus alternates', async ({ request, baseURL }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('xml');
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    const expected = indexablePairs.flatMap((p) => [baseURL + p.es, baseURL + p.en]).sort();
    expect(locs).toEqual(expected);
    expect(locs).toHaveLength(28);
    expect(xml).not.toMatch(/blog|estimad|estimate|lastmod/i);
    expect(xml).not.toContain(duplicate.es);
    expect(xml).not.toContain(duplicate.en);
    // Cada <url> declara es, en y x-default.
    for (const block of xml.split('<url>').slice(1)) {
      const langs = [...block.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]).sort();
      expect(langs).toEqual(['en', 'es', 'x-default']);
    }
  });

  test('robots.txt y sitemap.xml no son páginas: sin redirección de idioma y con los encabezados de seguridad', async ({ request }) => {
    for (const path of ['/robots.txt', '/sitemap.xml']) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(200);
      const h = res.headers();
      expect(h['x-content-type-options'], path).toBe('nosniff');
      expect(h['set-cookie'], path).toBeUndefined();
    }
  });

  test('el blog sigue noindex, sin canonical, y fuera del sitemap', async ({ page, request }) => {
    for (const path of ['/es/blog', '/en/blog']) {
      await page.goto(path);
      const h = await head(page);
      expect(h.robots).toMatch(/noindex/);
      expect(h.canonical).toEqual([]);
    }
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/blog');
  });
});

test.describe('CA-7: datos estructurados (P-47)', () => {
  test('Inicio lleva un solo bloque JSON-LD con WebSite y Person, sin datos de contacto', async ({ page, baseURL }) => {
    for (const locale of ['es', 'en'] as const) {
      await page.goto(`/${locale}`);
      const { jsonLd } = await head(page);
      expect(jsonLd).toHaveLength(1);
      const data = JSON.parse(jsonLd[0]);
      expect(data['@context']).toBe('https://schema.org');
      expect(data['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual(['WebSite', 'Person']);
      expect(data['@graph'][0]).toMatchObject({ name: 'THIS JULIO', url: `${baseURL}/${locale}`, inLanguage: locale });
      expect(data['@graph'][1]).toMatchObject({ name: 'Julio Orellana', sameAs: ['https://github.com/Julio-orellana'] });
      expect(jsonLd[0]).not.toMatch(/email|telephone|address|jobTitle|mailto|@thisjulio/i);
    }
  });

  test('las demás páginas no llevan JSON-LD', async ({ page }) => {
    for (const path of ['/es/trabajo', '/en/services', '/es/acerca-de', '/en/contact', '/es/legal']) {
      await page.goto(path);
      expect((await head(page)).jsonLd, path).toEqual([]);
    }
  });
});
