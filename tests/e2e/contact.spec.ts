import { expect, test } from '@playwright/test';
import { contactAddress, contactEmail, spokenAddress } from '../../src/config/contact';
import { sitePaths } from './routes';

/**
 * Feature 006 · T3 (CA-3, P-42, P-43): Contacto provisional. El contacto es un enlace `mailto:` que arma una
 * isla en el navegador; la dirección no viaja en el HTML ni en la carga RSC. Mientras Julio no elija la
 * dirección (`contactEmail` nulo, puerta G4 abierta) no se pinta nada de correo: las pruebas del enlace se
 * omiten y lo dicen.
 */
const GATE_OPEN = 'Puerta G4 abierta: todavía no hay dirección de contacto (src/config/contact.ts)';
const pages = [
  { path: '/es/contacto', lang: 'es', h1: 'Contacto', heading: 'Cómo escribirme', lead: 'Cuéntame qué quieres construir o qué problema quieres resolver.', mail: 'Escríbeme por correo', at: 'arroba', dot: 'punto' },
  { path: '/en/contact', lang: 'en', h1: 'Contact', heading: 'How to reach me', lead: 'Tell me what you want to build or what problem you want to solve.', mail: 'Email me', at: 'at', dot: 'dot' },
] as const;

for (const c of pages) {
  test.describe(`Contacto provisional: ${c.path}`, () => {
    test('título, texto de apoyo y GitHub; sin formulario', async ({ page }) => {
      await page.goto(c.path);
      await expect(page.locator('html')).toHaveAttribute('lang', c.lang);
      await expect(page.locator('h1')).toHaveText(c.h1);
      await expect(page.getByRole('heading', { level: 2, name: c.heading })).toBeVisible();
      await expect(page.locator('main .lead')).toHaveText(c.lead);
      const github = page.locator('main a.path-link[href^="https://github.com/"]');
      await expect(github).toHaveAttribute('href', 'https://github.com/Julio-orellana');
      await expect(github).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(page.locator('main a.path-link')).toHaveCount(contactEmail ? 2 : 1);
      await expect(page.locator('main form, main input, main textarea, main select')).toHaveCount(0);
      // Sin promesas de plazo (CLAUDE.md §5).
      expect(await page.locator('main').innerText()).not.toMatch(/24\s*\/\s*7|\bhoras?\b|\bhours?\b|respuesta en|within/i);
    });

    test('sin dirección configurada no hay enlace de correo ni texto de respaldo', async ({ page, request }) => {
      test.skip(!!contactEmail, 'Hay dirección configurada');
      await page.goto(c.path);
      await expect(page.locator('[data-mail]')).toHaveCount(0);
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
      expect(await (await request.get(c.path)).text()).not.toMatch(/<noscript/i);
    });

    test('el enlace de correo se arma al hidratar y es operable con teclado', async ({ page }) => {
      test.skip(!contactEmail, GATE_OPEN);
      const address = contactAddress(contactEmail!);
      await page.goto(c.path, { waitUntil: 'networkidle' });
      const link = page.locator('main a[data-mail="ready"]');
      await expect(link).toHaveAttribute('href', `mailto:${address}`);
      await expect(link).toHaveAccessibleName(new RegExp(`^${c.mail}`));
      await expect(link).toContainText(address);
      await link.focus();
      await expect(link).toBeFocused();
    });

    test('el HTML del servidor y la carga RSC no llevan la dirección', async ({ request }) => {
      test.skip(!contactEmail, GATE_OPEN);
      const address = contactAddress(contactEmail!);
      const html = await (await request.get(c.path)).text();
      expect(html).toContain('data-mail="pending"');
      expect(html).not.toContain(address);
      expect(html).not.toMatch(/mailto:/);
      const rsc = await (await request.get(c.path, { headers: { rsc: '1' } })).text();
      expect(rsc).not.toContain(address);
      expect(rsc).not.toMatch(/mailto:/);
    });

    test('sin JavaScript, la dirección se lee escrita en palabras', async ({ browser }) => {
      test.skip(!contactEmail, GATE_OPEN);
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(c.path);
      // `innerText` y no `toContainText`: Playwright no cuenta el texto de `<noscript>`, aunque sin JavaScript se pinta.
      const text = await page.locator('main').innerText();
      expect(text).toContain(spokenAddress(contactEmail!, c.at, c.dot));
      expect(text).not.toContain('@');
      await expect(page.locator('main a[data-mail]')).not.toHaveAttribute('href', /.*/);
      await context.close();
    });
  });
}

test.describe('CA-3: la dirección no aparece en ninguna otra página', () => {
  test('ninguna ruta lleva la dirección ni un mailto en su HTML', async ({ request }, info) => {
    test.skip(info.project.name !== 'desktop');
    test.skip(!contactEmail, GATE_OPEN);
    const address = contactAddress(contactEmail!);
    for (const { path } of sitePaths) {
      const html = await (await request.get(path)).text();
      expect(html.includes(address), path).toBe(false);
      expect(/mailto:/.test(html), path).toBe(false);
    }
  });
});
