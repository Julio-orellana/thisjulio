import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * P-16 — 404 propio (app/global-not-found.tsx). Toda URL que no es una ruta,
 * con o sin extensión, responde 404 con el documento del sitio, renderizado
 * en el servidor (se lee sin JavaScript), en el idioma de la URL y con la
 * CSP de nonce (ADR 006). Sin idioma en la URL, va en los dos.
 */
const cases = [
  { path: '/es/no-existe', lang: 'es', h1: 'Página no encontrada', en: false, home: '/es' },
  { path: '/en/no-existe', lang: 'en', h1: 'Page not found', en: false, home: '/en' },
  { path: '/es/a/b/c', lang: 'es', h1: 'Página no encontrada', en: false, home: '/es' },
  { path: '/es/foto.png', lang: 'es', h1: 'Página no encontrada', en: false, home: '/es' },
  { path: '/en/foto.png', lang: 'en', h1: 'Page not found', en: false, home: '/en' },
  { path: '/foto.png', lang: 'es', h1: 'Página no encontrada', en: true, home: '/es' },
] as const;

/** El documento sin el contenido de los scripts (la carga RSC es texto). */
const markup = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '<script></script>');

test.describe('P-16: el HTML del 404 viene del servidor, completo y compatible con la CSP', () => {
  for (const c of cases) {
    test(c.path, async ({ request }) => {
      const res = await request.get(c.path, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
      expect(res.headers()['cache-control']).toContain('no-store');
      const nonce = res.headers()['content-security-policy'].match(/'nonce-([A-Za-z0-9+/=]+)'/)![1];
      const html = await res.text();
      // Renderizado en el servidor: no es la carcasa de error que Next completa en el cliente.
      expect(html).not.toContain('__next_error__');
      expect(html).toContain(`<html lang="${c.lang}"`);
      expect(html).toMatch(new RegExp(`<h1 class="h1">${c.h1}</h1>`));
      expect(html).toContain('<header class="nav">');
      expect(html).toContain('<footer class="footer">');
      expect(html).toMatch(/<meta name="robots" content="noindex/);
      if (c.en) expect(html).toMatch(/<section class="stack-3" lang="en">[\s\S]*<h2 class="h2">Page not found<\/h2>/);
      else expect(html).not.toContain('<h2 class="h2">');
      // Sin estilos ni manejadores en línea; cada script en línea lleva el nonce de ESTA respuesta.
      expect(markup(html)).not.toMatch(/<style\b|\sstyle\s*=|\son[a-z]+\s*=/i);
      const inline = [...html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>/gi)].map((m) => m[1]);
      expect(inline.length).toBeGreaterThan(0);
      for (const attrs of inline) expect(attrs).toContain(`nonce="${nonce}"`);
    });
  }

  test('el idioma no se puede forzar desde el navegador (el proxy sobrescribe el encabezado)', async ({ request }) => {
    const sinIdioma = await (await request.get('/foto.png', { headers: { 'x-thisjulio-locale': 'en' } })).text();
    expect(sinIdioma).toContain('<html lang="es"');
    expect(sinIdioma).toContain('<h1 class="h1">Página no encontrada</h1>');
    const es = await (await request.get('/es/no-existe', { headers: { 'x-thisjulio-locale': 'en' } })).text();
    expect(es).toContain('<html lang="es"');
  });
});

test.describe('P-16: acciones del 404', () => {
  test('«Volver al inicio» lleva al inicio del idioma de la URL', async ({ page }) => {
    for (const c of cases) {
      await page.goto(c.path);
      const home = page.locator('main a.link').first();
      await expect(home, c.path).toHaveAttribute('href', c.home);
    }
    await page.goto('/en/no-existe');
    await page.getByRole('link', { name: 'Back to home' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home');
  });

  test('«Regresar» vuelve a la página anterior', async ({ page }) => {
    await page.goto('/es/servicios');
    await page.goto('/es/no-existe');
    await page.getByRole('button', { name: 'Regresar a la página anterior' }).click();
    await expect(page).toHaveURL(/\/es\/servicios$/);
    await page.goto('/en/work');
    await page.goto('/foto.png');
    await page.getByRole('button', { name: 'Go back to the previous page' }).click();
    await expect(page).toHaveURL(/\/en\/work$/);
  });

  test('sin JavaScript se lee igual y no muestra un botón que no funcionaría', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await ctx.newPage();
    for (const c of cases) {
      const res = await page.goto(c.path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(c.h1);
      await expect(page.locator('main a.link').first()).toBeVisible();
      await expect(page.locator('main button')).toHaveCount(0);
    }
    await ctx.close();
  });
});

test.describe('P-16: accesibilidad del 404 (axe, WCAG 2.2 AA)', () => {
  for (const c of cases) {
    test(c.path, async ({ page }) => {
      await page.goto('/es');
      await page.goto(c.path);
      await expect(page.locator('main button').first()).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
});

test.describe('P-16: el 404 no pide nada fuera del sitio ni deja errores (salvo su propio 404)', () => {
  for (const c of cases) {
    test(c.path, async ({ page, baseURL }) => {
      const external: string[] = [];
      const problems: string[] = [];
      page.on('request', (r) => {
        if (new URL(r.url()).origin !== new URL(baseURL!).origin && !r.url().startsWith('data:')) external.push(r.url());
      });
      page.on('console', (m) => {
        // El navegador anota el 404 del propio documento; es la respuesta esperada.
        if ((m.type() === 'error' || m.type() === 'warning') && !/status of 404/.test(m.text())) problems.push(`${m.type()}: ${m.text()}`);
      });
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      await page.goto(c.path, { waitUntil: 'networkidle' });
      expect(external).toEqual([]);
      expect(problems).toEqual([]);
    });
  }
});
