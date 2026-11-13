import { expect, test } from '@playwright/test';
import { sitePaths } from './routes';

/**
 * Feature 002 · T14 — comprobaciones transversales sobre las 34 rutas públicas
 * (CA-2, CA-4, CA-7, CA-9, CA-10). El resto (CSP P1–P14, axe, red y consola)
 * ya recorre las 34 en csp.spec.ts y quality.spec.ts. Solo Chromium (P-17).
 */

// Política de contenido (src/content/policy.ts) aplicada al texto visible.
const FORBIDDEN = [
  /24\s*\/\s*7/, /\bSLAs?\b/i, /tiempos?\s+de\s+respuesta|response[\s-]+times?/i, /disponibilidad|availability/i,
  /monitore|monitoriz|monitoring/i, /cobertura|coverage/i, /\[[^\]]*\]/,
  /\bAY\s*LUPITA\b|\bLupita\b|\bKinderland\b|\bATRIO\b|Order\s+Processing\s+API|API\s+de\s+pedidos/i,
  /\b(?:Electron|SQLite|TypeScript|React|Next\.js|Tailwind|Express|NestJS|Expo|PostgreSQL|Prisma|MongoDB)\b/,
];

test.describe('T14: las 34 rutas públicas', () => {
  for (const { path } of sitePaths) {
    test(`${path}: HTML sin estilos ni manejadores en línea, sin Set-Cookie`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['set-cookie']).toBeUndefined();
      const html = await res.text();
      expect(html).not.toMatch(/<[a-zA-Z][^>]*\sstyle\s*=/);
      expect(html).not.toMatch(/<[a-zA-Z][^>]*\son[a-z]+\s*=/i);
      expect(html).not.toMatch(/<canvas\b/i);
    });

    test(`${path}: texto visible dentro de la política de contenido, sin blog, sin localStorage`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const text = await page.locator('body').innerText();
      expect(FORBIDDEN.filter((re) => re.test(text)).map(String)).toEqual([]);
      if (!path.endsWith('/blog')) await expect(page.locator('a[href*="/blog"]')).toHaveCount(0);
      expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
    });
  }

  test('ninguna ruta en español desborda en horizontal a 1440, 1024, 768 y 390', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    test.setTimeout(180_000);
    const es = sitePaths.filter((p) => p.locale === 'es');
    expect(es).toHaveLength(17);
    const overflow: string[] = [];
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const { path } of es) {
        await page.goto(path);
        const extra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (extra > 0) overflow.push(`${path} @${width}: +${extra}px`);
      }
    }
    expect(overflow).toEqual([]);
  });
});
