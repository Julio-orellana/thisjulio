import { afterEach, describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { siteOrigin, siteRobots } from '@/lib/seo/metadata';

// Feature 006 · T5 (CA-6): la indexación depende del origen del build. En el build el origen queda fijado por
// next.config.ts; aquí se cambia la variable para probar los dos casos sin construir dos veces.
const original = process.env.SITE_ORIGIN;
afterEach(() => {
  if (original === undefined) delete process.env.SITE_ORIGIN;
  else process.env.SITE_ORIGIN = original;
});

describe('con el origen de producción', () => {
  it('las páginas se indexan, robots.txt lo permite todo y anuncia el sitemap', () => {
    process.env.SITE_ORIGIN = 'https://thisjulio.com';
    expect(siteRobots()).toEqual({ index: true, follow: true });
    expect(robots()).toEqual({ rules: { userAgent: '*', allow: '/' }, sitemap: 'https://thisjulio.com/sitemap.xml' });
  });

  it('el sitemap lleva URL absolutas del dominio: 28 entradas, sin blog ni estimador', () => {
    process.env.SITE_ORIGIN = 'https://thisjulio.com';
    const entries = sitemap();
    expect(entries).toHaveLength(28);
    for (const e of entries) expect(e.url).toMatch(/^https:\/\/thisjulio\.com\/(es|en)(\/|$)/);
    expect(entries.filter((e) => /blog|estim/.test(e.url))).toEqual([]);
    expect(entries.every((e) => !('lastModified' in e))).toBe(true);
  });
});

describe('con cualquier otro origen (preview, pruebas)', () => {
  for (const origin of ['http://localhost:3100', 'https://thisjulio-git-rama.vercel.app', 'https://preview.thisjulio.com', 'https://www.thisjulio.com']) {
    it(`${origin}: noindex y robots.txt cerrado, sin sitemap anunciado`, () => {
      process.env.SITE_ORIGIN = origin;
      expect(siteRobots()).toEqual({ index: false, follow: false });
      expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } });
    });
  }
});

describe('sin origen válido', () => {
  it('falla en lugar de inventar uno', () => {
    delete process.env.SITE_ORIGIN;
    expect(() => siteOrigin()).toThrow(/SITE_ORIGIN/);
    process.env.SITE_ORIGIN = 'https://thisjulio.com/';
    expect(() => siteOrigin()).toThrow(/SITE_ORIGIN/);
  });
});
