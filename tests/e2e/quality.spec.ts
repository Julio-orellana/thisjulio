import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { sitePaths } from './routes';

test.describe('CA-9: accesibilidad (axe, WCAG 2.2 AA)', () => {
  for (const { path } of sitePaths) {
    test(path, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }

  test('hoja móvil abierta', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    await page.goto('/en');
    await page.getByRole('button', { name: 'Menu' }).click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
    expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });
});

test.describe('CA-10: encabezados de seguridad', () => {
  // T18 cambió la CSP (ADR 006): las rutas estáticas ya no llevan nonce, solo la dinámica.
  test('presentes en páginas de ambos idiomas', async ({ request }) => {
    const nonces = new Set<string>();
    for (const path of ['/es', '/en/work', '/es/no-existe']) {
      const h = (await request.get(path)).headers();
      const csp = h['content-security-policy'];
      // ADR 006: páginas estáticas con hashes; rutas dinámicas con nonce. Detalle en csp.spec.ts.
      expect(csp, path).toMatch(/script-src \S+\/_next\/static\/chunks\/ '(sha256|nonce)-/);
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|strict-dynamic/);
      if (path === '/es/no-existe') nonces.add(csp.match(/'nonce-([^']+)'/)![1]);
      expect(h['strict-transport-security']).toBe('max-age=63072000; includeSubDomains');
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(h['permissions-policy']).toContain('camera=()');
      expect(h['x-powered-by']).toBeUndefined();
    }
    expect(nonces.size).toBe(1);
  });
});

test.describe('CA-11: sin orígenes externos ni errores de consola', () => {
  for (const { path } of sitePaths) {
    test(path, async ({ page, baseURL }) => {
      const external: string[] = [];
      const problems: string[] = [];
      page.on('request', (r) => {
        const origin = new URL(r.url()).origin;
        if (origin !== new URL(baseURL!).origin && !r.url().startsWith('data:')) external.push(r.url());
      });
      page.on('console', (m) => {
        // Único aviso admitido (003): el controlador de gráficos de Chromium avisa de que `readPixels` espera a
        // la GPU. Es justo lo que hace la medición temporizada del motor de la escena (1 píxel cada 1,2 s, del
        // diseño) para ajustar la resolución. No es un error ni llega al usuario; solo sale en Inicio.
        if (m.type() === 'warning' && /GL Driver Message .*GPU stall due to ReadPixels/.test(m.text())) return;
        if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
      });
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(external).toEqual([]);
      expect(problems).toEqual([]);
    });
  }
});

test.describe('CA-12 / CA-13: blog oculto y textos prohibidos', () => {
  test('el blog lleva noindex y no aparece en la navegación', async ({ page }) => {
    for (const path of ['/es/blog', '/en/blog']) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    }
    for (const path of ['/es', '/en']) {
      await page.goto(path);
      await expect(page.locator('a[href$="/blog"]')).toHaveCount(0);
    }
  });

  for (const { path } of sitePaths) {
    test(`sin «24/7» ni enlaces al blog: ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await page.locator('body').innerText()).not.toMatch(/24\s*\/\s*7/);
      if (!path.endsWith('/blog')) await expect(page.locator('a[href*="/blog"]')).toHaveCount(0);
    });
  }
});
