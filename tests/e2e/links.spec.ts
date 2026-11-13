import { expect, test } from '@playwright/test';
import { retiredPaths, sitePaths } from './routes';

/**
 * Feature 006 · T4 (CA-4, P-44): ningún enlace interno lleva a una página que no existe, a una vacía (el blog
 * sigue siendo un esqueleto sin enlazar) ni al estimador, que no es una ruta hasta la feature 004.
 */
test.describe('CA-4: enlaces internos', () => {
  test('todos los enlaces internos del HTML del servidor llevan a una ruta pública que responde', async ({ request }, info) => {
    test.skip(info.project.name !== 'desktop');
    test.setTimeout(180_000);
    const known = new Set<string>(sitePaths.map((p) => p.path));
    const found = new Map<string, string>();
    // El blog es un esqueleto oculto: nadie lo enlaza, y sus propios enlaces (selector de idioma) no cuentan.
    for (const { path } of sitePaths.filter((p) => p.key !== 'blog')) {
      // HTML tal como lo sirve el servidor, sin JavaScript: es lo que lee un buscador.
      const html = await (await request.get(path)).text();
      const hrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1]);
      expect(hrefs.length, path).toBeGreaterThan(10);
      for (const href of hrefs) {
        if (!href.startsWith('/')) continue; // externos (GitHub) y mailto
        const target = href.split('#')[0];
        if (!found.has(target)) found.set(target, path);
      }
    }
    const targets = [...found.keys()].sort();
    expect(targets.length).toBeGreaterThan(20);
    expect(targets.filter((t) => !known.has(t)).map((t) => `${t} (en ${found.get(t)})`)).toEqual([]);
    expect(targets.filter((t) => /estimad|estimate|\/blog/.test(t))).toEqual([]);
    for (const target of targets) expect((await request.get(target)).status(), target).toBe(200);
  });

  test('las URL del estimador no existen: 404 propio, sin redirección', async ({ request }) => {
    for (const path of retiredPaths) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(404);
      expect(res.headers()['cache-control'], path).toContain('no-store');
    }
  });

  test('el CTA «Iniciar un proyecto» lleva a Contacto en la navegación, el menú móvil y las páginas', async ({ page }) => {
    const cases = [
      { locale: 'es', label: 'Iniciar un proyecto', contact: '/es/contacto', paths: ['/es', '/es/arquitectura', '/es/acerca-de', '/es/servicios', '/es/trabajo/sistema-pos-de-escritorio'] },
      { locale: 'en', label: 'Start a project', contact: '/en/contact', paths: ['/en', '/en/architecture', '/en/about', '/en/services', '/en/work/desktop-pos-system'] },
    ];
    for (const c of cases) {
      for (const path of c.paths) {
        await page.goto(path);
        const links = page.getByRole('link', { name: c.label });
        expect(await links.count(), path).toBeGreaterThan(0);
        for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute('href')))) expect(href, path).toBe(c.contact);
      }
    }
  });

  test('ningún texto visible nombra el estimador', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    test.setTimeout(120_000);
    for (const { path } of sitePaths) {
      await page.goto(path);
      expect(await page.locator('body').innerText(), path).not.toMatch(/estimador|estimado rápido|estimar esto|estimator|quick estimate|estimate this/i);
    }
  });
});
