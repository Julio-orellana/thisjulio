import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { casePair } from './routes';

/**
 * Feature 002 · T9 y T10 — Trabajo y caso POS (spec 002 §3.2 y §3.3; CA-2,
 * CA-4, CA-5, CA-7, CA-9, CA-12). Contra el build de producción. Solo Chromium.
 */

const UNVERIFIED = /AY\s*LUPITA|Lupita|Kinderland|ATRIO|Order Processing API|API de pedidos/i;
const FORBIDDEN_POS =
  /aplicaci[oó]n web|web app|web application|Electron|SQLite|TypeScript|React|multi-?sucursal|multi-?branch|facturaci[oó]n|invoic|cr[eé]dito|credit|probad[oa] en producci[oó]n|\[[^\]]+\]|\b(19|20)\d{2}\b/i;
const work = [
  { path: '/es/trabajo', locale: 'es', count: '1 proyecto', title: 'Sistema POS de escritorio', h1: 'This es el trabajo.' },
  { path: '/en/work', locale: 'en', count: '1 project', title: 'Desktop POS System', h1: 'This is the work.' },
];
const cases = [
  {
    path: casePair.es, locale: 'es', title: 'Sistema POS de escritorio', crumb: 'Trabajo',
    line: 'Sistema POS de escritorio para un comercio de productos agrícolas en Guatemala.', note: /No son resultados medidos/,
  },
  {
    path: casePair.en, locale: 'en', title: 'Desktop POS System', crumb: 'Work',
    line: 'Desktop POS system for an agricultural products business in Guatemala.', note: /not measured results/,
  },
];

test.describe('T9 · Trabajo', () => {
  for (const r of work) {
    test(`${r.path}: una tarjeta, sin filtros (DA-4), contador y sin JavaScript propio`, async ({ page, request }) => {
      const res = await request.get(r.path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).not.toMatch(/\sstyle=/);
      expect(html).not.toMatch(UNVERIFIED);
      await page.goto(r.path);
      await expect(page.locator('h1')).toHaveText(r.h1);
      await expect(page.locator('.gal-item')).toHaveCount(1);
      await expect(page.locator('.chips, [role="group"] .chip')).toHaveCount(0);
      await expect(page.locator('.gal-tools [aria-live="polite"]')).toHaveText(r.count);
      const card = page.locator('.gal-item');
      await expect(card.locator('.proj-name')).toHaveText(r.title);
      await expect(card.locator('.gal-meta .mono')).toHaveText('01 / POS');
      await expect(card.locator('.xv')).toHaveAttribute('aria-hidden', 'true');
      await card.click();
      await expect(page).toHaveURL(new RegExp(`${r.locale === 'es' ? casePair.es : casePair.en}$`));
      await expect(page.locator('h1')).toHaveText(r.title);
    });
  }
});

test.describe('T10 · caso POS', () => {
  for (const r of cases) {
    test(`${r.path}: solo lo permitido por caso-pos.md (CA-12)`, async ({ page, request }) => {
      const res = await request.get(r.path);
      expect(res.status()).toBe(200);
      const csp = res.headers()['content-security-policy'];
      expect(csp).toMatch(/'sha256-/);
      expect(csp).not.toContain("'nonce-");
      expect(await res.text()).not.toMatch(/\sstyle=/);

      await page.goto(r.path);
      await expect(page.locator('html')).toHaveAttribute('lang', r.locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(r.title);
      await expect(page.locator('.crumbs a')).toHaveText(r.crumb);
      await expect(page.locator('.case-line')).toHaveText(r.line);
      await expect(page.locator('.case-meta > div')).toHaveCount(1); // solo «Tipo»: sin año, rol ni enlace
      await expect(page.locator('.case-trio > div')).toHaveCount(1); // solo «Resumen»: sin problema ni solución
      await expect(page.locator('.feature')).toHaveCount(10);
      await expect(page.locator('#h-feat + p')).toHaveText(r.note);
      // Sin Deploy (D-14), sin pantallas (P-03), sin resultados, sin stack ni siguiente proyecto.
      await expect(page.locator('.dep-grid, .shots, .shot, .results-empty, .tag, .next-link, .modal')).toHaveCount(0);
      const main = await page.locator('main').innerText();
      expect(main).not.toMatch(FORBIDDEN_POS);
      expect(main).not.toMatch(UNVERIFIED);
      expect(main).not.toMatch(/\d+\s*%/);
    });
  }

  for (const path of ['/es/trabajo/desktop-pos-system', '/en/work/sistema-pos-de-escritorio', '/es/trabajo/ay-lupita', '/en/work/atrio', '/en/work/no-existe']) {
    test(`${path}: 404 propio renderizado en el servidor`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(404);
      expect(await res.text()).toMatch(/<h1 class="h1">(Página no encontrada|Page not found)<\/h1>/);
    });
  }

  test('CA-5: selector ES ⇄ EN del caso', async ({ page }) => {
    await page.goto(casePair.es);
    await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /English/ }).click();
    await expect(page).toHaveURL(new RegExp(`${casePair.en}$`));
    await page.getByRole('group', { name: 'Language' }).getByRole('link', { name: /Español/ }).click();
    await expect(page).toHaveURL(new RegExp(`${casePair.es}$`));
  });
});

test.describe('CA-9 / CA-10: accesibilidad, red y desborde', () => {
  for (const path of [...work.map((w) => w.path), ...cases.map((c) => c.path)]) {
    test(`${path}: axe sin violaciones serias, sin orígenes externos ni errores`, async ({ page, baseURL }) => {
      const external: string[] = [];
      const problems: string[] = [];
      page.on('request', (r) => new URL(r.url()).origin !== new URL(baseURL!).origin && external.push(r.url()));
      page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && problems.push(m.text()));
      await page.goto(path, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
      expect(external).toEqual([]);
      expect(problems).toEqual([]);
      expect(await page.evaluate(() => localStorage.length)).toBe(0);
    });
  }

  test('español sin desborde horizontal a 1440, 1024, 768 y 390', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/es/trabajo', casePair.es]) {
        await page.goto(path);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${path} @${width}`).toBeLessThanOrEqual(0);
      }
    }
  });
});
