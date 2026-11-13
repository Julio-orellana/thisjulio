import { expect, test } from '@playwright/test';
import { sitePaths } from './routes';

/**
 * Feature 002 · T14 — comprobaciones transversales sobre las rutas públicas (32 desde la 006)
 * (CA-2, CA-4, CA-7, CA-9, CA-10). El resto (CSP P1–P14, axe, red y consola)
 * ya recorre todas en csp.spec.ts y quality.spec.ts. Solo Chromium (P-17).
 */

// Política de contenido (src/content/policy.ts) aplicada al texto visible.
const FORBIDDEN = [
  /24\s*\/\s*7/, /\bSLAs?\b/i, /tiempos?\s+de\s+respuesta|response[\s-]+times?/i, /disponibilidad|availability/i,
  /monitore|monitoriz|monitoring/i, /cobertura|coverage/i, /\[[^\]]*\]/,
  /\bAY\s*LUPITA\b|\bLupita\b|\bKinderland\b|\bATRIO\b|Order\s+Processing\s+API|API\s+de\s+pedidos/i,
  /\b(?:Electron|SQLite|TypeScript|React|Next\.js|Tailwind|Express|NestJS|Expo|PostgreSQL|Prisma|MongoDB)\b/,
];

// Lo único que la página Arquitectura puede nombrar de la lista vedada (P-28, decisión de Julio del 2026-11-13).
const ARCHITECTURE_NAMES = ['React Native', 'Server Actions', 'TypeScript', 'PostgreSQL', 'Next.js', 'Electron', 'Express', 'NestJS', 'Prisma', 'React', 'Redis', 'Expo', 'Monitoring', 'Monitoreo'];

test.describe('T14: las rutas públicas', () => {
  for (const { path } of sitePaths) {
    test(`${path}: HTML sin estilos ni manejadores en línea, sin Set-Cookie`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['set-cookie']).toBeUndefined();
      const html = await res.text();
      expect(html).not.toMatch(/<[a-zA-Z][^>]*\sstyle\s*=/);
      expect(html).not.toMatch(/<[a-zA-Z][^>]*\son[a-z]+\s*=/i);
      expect(html).not.toMatch(/<canvas\b/i);
      // 006 · CA-3: ninguna página lleva el correo de contacto ni un mailto en el HTML del servidor.
      expect(html).not.toMatch(/mailto:|[A-Za-z0-9._-]+@thisjulio\.com/i);
      // 006 · P-45 (cierra P-24): los mensajes de otras páginas ya no viajan en el HTML. Antes, las palabras del
      // panel «Datos» de Inicio iban en las 34 rutas; ahora solo en Inicio (y Arquitectura las nombra por P-28).
      if (!/^\/(es|en)$/.test(path) && !/\/(arquitectura|architecture)$/.test(path)) expect(html).not.toMatch(/PostgreSQL|MongoDB/);
    });

    test(`${path}: texto visible dentro de la política de contenido, sin blog, sin localStorage`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      let text = await page.locator('body').innerText();
      // Arquitectura (003, P-28): puede nombrar sus 12 tecnologías confirmadas y la capa de monitoreo, y nada
      // más. Todas las pestañas y piezas se recorren en architecture.spec.ts.
      if (/\/(arquitectura|architecture)$/.test(path)) {
        for (const name of ARCHITECTURE_NAMES) text = text.replaceAll(name, '·');
      }
      expect(FORBIDDEN.filter((re) => re.test(text)).map(String)).toEqual([]);
      if (!path.endsWith('/blog')) await expect(page.locator('a[href*="/blog"]')).toHaveCount(0);
      expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
    });
  }

  test('ninguna ruta en español desborda en horizontal a 1440, 1024, 768 y 390', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    test.setTimeout(180_000);
    const es = sitePaths.filter((p) => p.locale === 'es');
    expect(es).toHaveLength(16);
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
