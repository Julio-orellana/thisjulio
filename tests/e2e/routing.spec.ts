import { expect, test } from '@playwright/test';
import { routePairs, sitePaths } from './routes';

test.describe('enrutamiento bilingüe', () => {
  test('CA-3: «/» redirige siempre a «/es», aunque el navegador prefiera inglés', async ({ request }) => {
    for (const lang of ['es', 'en-US,en;q=0.9', 'fr']) {
      const res = await request.get('/', { maxRedirects: 0, headers: { 'accept-language': lang } });
      expect(res.status(), lang).toBe(307);
      expect(new URL(res.headers()['location'], 'http://x').pathname).toBe('/es');
    }
  });

  test('CA-3: no se envían cookies (sin cookie de idioma)', async ({ request }) => {
    for (const path of ['/', '/es', '/en/work']) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.headers()['set-cookie'], path).toBeUndefined();
    }
  });

  for (const { locale, path, key } of sitePaths) {
    test(`CA-3/CA-4: ${path} responde 200 con lang="${locale}" y un solo h1`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main#contenido')).toHaveCount(1);
      expect(key).toBeTruthy();
    });
  }

  test('CA-4: el slug del otro idioma redirige a la ruta correcta, nunca 200 duplicado', async ({ request }) => {
    for (const r of routePairs) {
      if (r.es.slice(3) === r.en.slice(3)) continue; // misma ruta en ambos idiomas
      const wrongEs = '/es' + r.en.slice(3);
      const wrongEn = '/en' + r.es.slice(3);
      for (const [wrong, right] of [[wrongEs, r.es], [wrongEn, r.en]]) {
        const res = await request.get(wrong, { maxRedirects: 0 });
        expect([301, 302, 307, 308, 404], wrong).toContain(res.status());
        if (res.status() !== 404) expect(new URL(res.headers()['location'], 'http://x').pathname, wrong).toBe(right);
      }
    }
  });

  test('rutas inexistentes responden 404 con el layout del sitio', async ({ page }) => {
    const res = await page.goto('/es/no-existe');
    expect(res?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página no encontrada');
  });

  test('las páginas de muestra del sistema no existen en producción', async ({ request }) => {
    for (const path of ['/es/sistema', '/es/sistema/plates', '/es/sistema/trabajo']) expect((await request.get(path)).status(), path).toBe(404);
  });
});
