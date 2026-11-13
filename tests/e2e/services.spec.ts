import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { servicePairs, servicePaths } from './routes';

/**
 * Feature 002 · T8 — Servicios y sus 14 rutas (spec 002 §3.4; CA-2, CA-5,
 * CA-6, CA-7, CA-9, CA-10). Contra el build de producción, desktop (1440) y
 * mobile (390). Solo Chromium (P-17).
 */

const parents = [
  { path: '/es/servicios', locale: 'es', title: servicePairs[0].titleEs, id: 'custom' },
  { path: '/en/services', locale: 'en', title: servicePairs[0].titleEn, id: 'custom' },
];
const all = [
  ...parents,
  ...servicePairs.flatMap((s) => [
    { path: s.es, locale: 'es', title: s.titleEs, id: s.id },
    { path: s.en, locale: 'en', title: s.titleEn, id: s.id },
  ]),
];

/** Distancia entre el panel y su posición objetivo (misma cuenta que el diseño). */
function panelGap(page: Page) {
  return page.evaluate(() => {
    const panel = document.getElementById('sv-panel')!;
    const bar = document.getElementById('sv-index')!;
    const stacked = getComputedStyle(bar).flexDirection === 'row';
    const head = (window.innerWidth <= 640 ? 64 : 76) + (stacked ? bar.offsetHeight : 0) + 20;
    return Math.round((panel.getBoundingClientRect().top - head) * 10) / 10;
  });
}

/** Espera a que el desplazamiento termine (dos lecturas iguales seguidas). */
async function settled(page: Page) {
  let last = -1;
  await expect
    .poll(async () => {
      const y = await page.evaluate(() => window.scrollY);
      const same = y === last;
      last = y;
      return same;
    }, { intervals: [120] })
    .toBe(true);
}

const tabs = (page: Page, locale: string) =>
  page.getByRole('navigation', { name: locale === 'es' ? 'Elige un servicio' : 'Choose a service' });

test.describe('CA-2 / CA-10: las 16 páginas de Servicios', () => {
  for (const r of all) {
    test(`${r.path}: 200, contenido real, pestaña activa y CSP de hashes`, async ({ page, request }) => {
      const res = await request.get(r.path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).not.toMatch(/\sstyle=/);
      const csp = res.headers()['content-security-policy'];
      expect(csp).toMatch(/script-src \S+\/_next\/static\/chunks\/ 'sha256-/);
      expect(csp).not.toContain("'nonce-");

      await page.goto(r.path);
      await expect(page.locator('html')).toHaveAttribute('lang', r.locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('#sv-title')).toHaveText(r.title);
      const current = tabs(page, r.locale).locator('[aria-current="true"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute('id', `sv-tab-${r.id}`);
      await expect(page.locator('.sv-panel')).toHaveCount(1);
      await expect(page.locator('.dep-grid')).toHaveCount(r.id === 'pos' ? 1 : 0);
    });
  }

  for (const path of ['/es/servicios/custom-software', '/en/services/desarrollo-a-la-medida', '/es/servicios/no-existe', '/en/services/no-existe']) {
    test(`${path}: 404 propio renderizado en el servidor, nunca 200 duplicado`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(404);
      expect(await res.text()).toMatch(/<h1 class="h1">(Página no encontrada|Page not found)<\/h1>/);
    });
  }
});

test.describe('CA-6: pestañas sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('cada pestaña es un enlace que carga su servicio', async ({ page }) => {
    await page.goto('/es/servicios');
    // Sin JavaScript, la espera de «elemento estable» de Playwright no termina
    // (usa requestAnimationFrame); el clic es igual de real con `force`.
    await tabs(page, 'es').getByRole('link', { name: /APIs y automatización/ }).click({ force: true });
    await expect(page).toHaveURL(/\/es\/servicios\/apis-y-automatizacion$/);
    await expect(page.locator('#sv-title')).toHaveText('APIs y automatización de procesos');
    await page.getByRole('link', { name: /^Siguiente: / }).click({ force: true });
    await expect(page).toHaveURL(/\/es\/servicios\/sistemas-pos$/);
    await expect(page.locator('.dep-grid')).toHaveCount(1);
  });
});

test.describe('CA-6: el servicio elegido queda bajo el encabezado fijo (±8 px)', () => {
  test('/servicios cargado directamente no se desplaza', async ({ page }) => {
    await page.goto('/es/servicios', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('enlace directo a un servicio: salto alineado, sin robar el foco', async ({ page }) => {
    await page.goto('/es/servicios/apis-y-automatizacion', { waitUntil: 'networkidle' });
    await settled(page);
    expect(Math.abs(await panelGap(page))).toBeLessThanOrEqual(8);
    expect(await page.evaluate(() => document.activeElement?.id)).not.toBe('sv-panel');
  });

  test('pestañas y «siguiente»: alineado, sin moverse si ya está, foco en el panel', async ({ page }) => {
    await page.goto('/es/servicios', { waitUntil: 'networkidle' });
    await tabs(page, 'es').getByRole('link', { name: /APIs y automatización/ }).click();
    await expect(page.locator('#sv-title')).toHaveText('APIs y automatización de procesos');
    await settled(page);
    expect(Math.abs(await panelGap(page))).toBeLessThanOrEqual(8);
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('sv-panel');

    const before = await page.evaluate(() => window.scrollY);
    await tabs(page, 'es').getByRole('link', { name: /Aplicaciones web/ }).click();
    await expect(page.locator('#sv-title')).toHaveText('Aplicaciones web y plataformas');
    await settled(page);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(1);
    expect(Math.abs(await panelGap(page))).toBeLessThanOrEqual(8);

    await page.getByRole('link', { name: /^Siguiente: / }).click();
    await expect(page.locator('#sv-title')).toHaveText('Aplicaciones móviles y de escritorio');
    await settled(page);
    expect(Math.abs(await panelGap(page))).toBeLessThanOrEqual(8);
  });

  for (const motion of ['reduce', 'no-preference'] as const) {
    test(`desplazamiento ${motion === 'reduce' ? 'instantáneo con reduced-motion' : 'suave sin reduced-motion'}`, async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop');
      await page.emulateMedia({ reducedMotion: motion });
      await page.goto('/en/services', { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        const w = window as unknown as { __ys: number[] };
        w.__ys = [];
        window.addEventListener('scroll', () => w.__ys.push(window.scrollY));
      });
      await tabs(page, 'en').getByRole('link', { name: /POS & Business/ }).click();
      await expect(page.locator('#sv-title')).toHaveText('POS & Business Management Systems');
      await settled(page);
      expect(Math.abs(await panelGap(page))).toBeLessThanOrEqual(8);
      const ys = await page.evaluate(() => (window as unknown as { __ys: number[] }).__ys);
      const distinct = new Set(ys).size;
      if (motion === 'reduce') expect(distinct).toBe(1);
      else expect(distinct).toBeGreaterThan(2);
    });
  }
});

test.describe('CA-5: selector ES | EN en los 7 servicios', () => {
  for (const s of servicePairs) {
    test(`${s.es} ⇄ ${s.en}`, async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop');
      await page.goto(s.es);
      await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /English/ }).click();
      await expect(page).toHaveURL(new RegExp(`${s.en}$`));
      await expect(page.locator('#sv-title')).toHaveText(s.titleEn);
      await page.getByRole('group', { name: 'Language' }).getByRole('link', { name: /Español/ }).click();
      await expect(page).toHaveURL(new RegExp(`${s.es}$`));
      await expect(page.locator('#sv-title')).toHaveText(s.titleEs);
    });
  }
});

test.describe('CA-7 / CA-9 / CA-10: contenido, accesibilidad y red', () => {
  for (const r of all) {
    test(`${r.path}: sin textos vedados, sin blog, axe sin violaciones serias`, async ({ page }) => {
      await page.goto(r.path, { waitUntil: 'networkidle' });
      const text = await page.locator('body').innerText();
      expect(text).not.toMatch(/24\s*\/\s*7|\bSLA\b|tiempos? de respuesta|response times?|monitore|monitoring|cobertura|coverage|availability|disponibilidad|\[[^\]]+\]/i);
      await expect(page.locator('a[href*="/blog"]')).toHaveCount(0);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }

  test('navegar entre servicios: sin orígenes externos, sin errores de consola, sin localStorage ni cookies', async ({ page, baseURL, context }) => {
    const external: string[] = [];
    const problems: string[] = [];
    page.on('request', (r) => new URL(r.url()).origin !== new URL(baseURL!).origin && external.push(r.url()));
    page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && problems.push(m.text()));
    page.on('pageerror', (e) => problems.push(e.message));
    await page.goto('/en/services', { waitUntil: 'networkidle' });
    for (const name of [/Custom Software/, /POS & Business/, /Support and Maintenance/]) {
      await tabs(page, 'en').getByRole('link', { name }).click();
      await page.waitForLoadState('networkidle');
    }
    expect(external).toEqual([]);
    expect(problems).toEqual([]);
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    expect(await context.cookies()).toEqual([]);
  });

  test('español sin desborde horizontal a 1440, 1024, 768 y 390', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const { path } of servicePaths.filter((p) => p.locale === 'es')) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} @${width}`).toBeLessThanOrEqual(0);
      }
    }
  });
});
