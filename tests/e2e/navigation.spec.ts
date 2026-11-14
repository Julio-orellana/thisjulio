import { expect, test } from '@playwright/test';

test.describe('navegación principal', () => {
  test('escritorio: menú aprobado, página activa y CTA', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.goto('/es/servicios');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link')).toHaveText(['Inicio', 'Trabajo', 'Servicios', 'Acerca de', 'Contacto']);
    await expect(nav.getByRole('link', { name: 'Servicios' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Iniciar un proyecto' })).toHaveAttribute('href', '/es/contacto'); // P-44: sin estimador hasta la 004
    await expect(page.getByRole('button', { name: 'Menú' })).toBeHidden();
  });

  test('inglés: mismas entradas traducidas', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link')).toHaveText(['Home', 'Work', 'Services', 'About', 'Contact']);
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  test('CA-8: hoja móvil operable con teclado, sin Arquitectura', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    await page.goto('/es');
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden();
    const button = page.getByRole('button', { name: 'Menú' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.focus();
    await page.keyboard.press('Enter');
    const close = page.getByRole('button', { name: 'Cerrar' });
    await expect(close).toHaveAttribute('aria-expanded', 'true');
    const sheet = page.getByRole('navigation', { name: 'Menú móvil' });
    await expect(sheet.getByRole('link')).toHaveText(['Inicio', 'Trabajo', 'Servicios', 'Acerca de', 'Contacto']);
    await expect(sheet.getByRole('link', { name: /Arquitectura|Architecture|Technology/ })).toHaveCount(0);

    await page.keyboard.press('Tab');
    await expect(sheet.getByRole('link', { name: 'Inicio' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Menú' })).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('button', { name: 'Menú' })).toBeFocused();
    await expect(sheet).toBeHidden();
  });

  test('CA-8: elegir un enlace de la hoja navega y la cierra', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    await page.goto('/es');
    await page.getByRole('button', { name: 'Menú' }).click();
    await page.getByRole('navigation', { name: 'Menú móvil' }).getByRole('link', { name: 'Trabajo' }).click();
    await expect(page).toHaveURL(/\/es\/trabajo$/);
    await expect(page.getByRole('button', { name: 'Menú' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('saltar al contenido mueve el foco a <main>', async ({ page, browserName }) => {
    await page.goto('/es');
    // Safari (WebKit) no enfoca enlaces con Tab salvo que se active en sus ajustes: se recorren con Opción+Tab.
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    const skip = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#contenido')).toBeFocused();
  });

  test('footer: enlaces aprobados, Arquitectura disponible y sin blog', async ({ page }) => {
    await page.goto('/es');
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: 'Arquitectura' })).toHaveAttribute('href', '/es/arquitectura');
    await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/Julio-orellana');
    await expect(footer.getByRole('link', { name: 'Principios de privacidad' })).toHaveAttribute('href', '/es/legal#privacidad');
    await expect(footer.getByRole('link', { name: /blog/i })).toHaveCount(0);
  });
});
