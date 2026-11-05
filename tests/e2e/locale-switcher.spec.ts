import { expect, test } from '@playwright/test';
import { routePairs } from './routes';

test.describe('CA-5: selector ES | EN', () => {
  for (const r of routePairs) {
    test(`${r.es} ⇄ ${r.en}`, async ({ page }) => {
      await page.goto(r.es);
      const group = page.getByRole('group', { name: 'Idioma' });
      await expect(group.getByRole('link', { name: /Español/ })).toHaveAttribute('aria-current', 'true');
      await group.getByRole('link', { name: /English/ }).click();
      await expect(page).toHaveURL(new RegExp(`${r.en}$`));
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');

      const groupEn = page.getByRole('group', { name: 'Language' });
      await expect(groupEn.getByRole('link', { name: /English/ })).toHaveAttribute('aria-current', 'true');
      await groupEn.getByRole('link', { name: /Español/ }).click();
      await expect(page).toHaveURL(new RegExp(`${r.es}$`));
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    });
  }

  test('los enlaces declaran hreflang y lang', async ({ page }) => {
    await page.goto('/es/servicios');
    const en = page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /English/ });
    await expect(en).toHaveAttribute('hreflang', 'en');
    await expect(en).toHaveAttribute('lang', 'en');
    await expect(en).toHaveAttribute('href', '/en/services');
  });
});
