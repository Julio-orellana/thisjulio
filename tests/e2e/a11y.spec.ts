import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { settle } from './a11y-helpers';
import { sitePaths } from './routes';

/**
 * Feature 006 · T12 (CA-15): auditoría WCAG 2.2 AA, parte local.
 *
 * A diferencia de las pruebas de axe anteriores (`quality.spec.ts` y otras), que solo fallan con violaciones
 * `serious` o `critical`, aquí **cualquier** violación de las reglas A y AA de WCAG 2.0, 2.1 y 2.2 hace fallar
 * la prueba, como pide CA-15. Corre en `desktop` (1440) y `mobile` (390).
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const notFoundPaths = ['/es/no-existe', '/en/no-existe', '/foto.png'] as const;

async function axeViolations(page: Page) {
  await settle(page);
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map((v) => `${v.id} [${v.impact}]: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('T12 · axe sin ninguna violación (A y AA de WCAG 2.0, 2.1 y 2.2)', () => {
  for (const { path } of sitePaths) {
    test(path, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  for (const path of notFoundPaths) {
    test(`404: ${path}`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(404);
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  test('hoja móvil abierta', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'la hoja solo existe a 390 px');
    for (const path of ['/es', '/en']) {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: /^(Menú|Menu)$/ }).click();
      await expect(page.getByRole('navigation', { name: /^(Menú móvil|Mobile)$/ })).toBeVisible();
      expect(await axeViolations(page)).toEqual([]);
    }
  });

  test('Inicio con cada capa del selector elegida', async ({ page }) => {
    for (const path of ['/es', '/en']) {
      await page.goto(path, { waitUntil: 'networkidle' });
      // Sin WebGL (proyectos desktop y mobile) el selector maneja el respaldo `Plates stack`.
      const layers = page.getByRole('group', { name: /^(Capas de la arquitectura|Architecture layers)$/ }).getByRole('button');
      const count = await layers.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await layers.nth(i).click();
        expect(await axeViolations(page), `${path}, capa ${i}`).toEqual([]);
      }
    }
  });

  test('Arquitectura con cada pestaña elegida', async ({ page }) => {
    for (const path of ['/es/arquitectura', '/en/architecture']) {
      await page.goto(path, { waitUntil: 'networkidle' });
      // Las 7 «pestañas» del diseño son botones conmutables (aria-pressed) dentro de un grupo.
      const tabs = page.getByRole('group', { name: /^(Tipo de sistema|Type of system)$/ }).getByRole('button');
      const count = await tabs.count();
      expect(count).toBe(7);
      for (let i = 0; i < count; i++) {
        await tabs.nth(i).click();
        expect(await axeViolations(page), `${path}, pestaña ${i}`).toEqual([]);
      }
    }
  });
});
