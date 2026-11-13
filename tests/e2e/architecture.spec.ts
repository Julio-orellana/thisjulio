import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ARCHITECTURE_TECHNOLOGIES } from '../../src/content/schema';
import { getArchitecture } from '../../src/lib/content';

/**
 * Feature 003 · T8 — Arquitectura (`Technology.dc.html`; P-27 = A, sin escena
 * 3D): pestañas de tipo de sistema, diagrama de bandas y piezas, inspector.
 * Lo esperado sale de `src/content/architecture.ts`, la misma fuente que pinta
 * la página. Solo Chromium (P-17).
 */
const PATHS = { es: '/es/arquitectura', en: '/en/architecture' } as const;
const UI = {
  es: { systems: 'Tipo de sistema', inspector: 'Pieza seleccionada', h1: 'This es cómo se construye.', note: 'Las capas punteadas se agregan solo cuando un proyecto las necesita', monitoring: 'Monitoreo', cta: 'Iniciar un proyecto', estimate: '/es/contacto' },
  en: { systems: 'Type of system', inspector: 'Selected part', h1: "This is how it's built.", note: 'Dashed layers are added only when a project needs them', monitoring: 'Monitoring', cta: 'Start a project', estimate: '/en/contact' },
} as const;

// La política de contenido (src/content/policy.ts) sobre el texto visible, como en transversal.spec.ts.
const FORBIDDEN = [
  /24\s*\/\s*7/, /\bSLAs?\b/i, /tiempos?\s+de\s+respuesta|response[\s-]+times?/i, /disponibilidad|availability/i,
  /monitore|monitoriz|monitoring/i, /cobertura|coverage/i, /\[[^\]]*\]/,
  /\bAY\s*LUPITA\b|\bLupita\b|\bKinderland\b|\bATRIO\b|Order\s+Processing\s+API|API\s+de\s+pedidos/i,
  /\b(?:Electron|SQLite|TypeScript|React|Next\.js|Tailwind|Express|NestJS|Expo|PostgreSQL|Prisma|MongoDB)\b/,
];
/** Quita del texto visible lo único que P-28 autoriza a nombrar aquí: las 12 tecnologías y el nombre de la capa de monitoreo. */
const withoutConfirmed = (text: string, monitoring: string) =>
  [...ARCHITECTURE_TECHNOLOGIES].sort((a, b) => b.length - a.length).reduce((t, name) => t.replaceAll(name, '·'), text).replaceAll(monitoring, '·');

const chips = (page: Page, locale: 'es' | 'en') => page.getByRole('group', { name: UI[locale].systems }).getByRole('button');
const inspector = (page: Page) => page.locator('aside.inspector');
const pressed = (page: Page, selector: string) => page.locator(selector).evaluateAll((els) => els.filter((e) => e.getAttribute('aria-pressed') === 'true').map((e) => e.textContent));

for (const locale of ['es', 'en'] as const) {
  const systems = getArchitecture(locale);
  const ui = UI[locale];

  test.describe(`Arquitectura · ${locale}`, () => {
    test('estructura: un h1, 7 pestañas, primera pestaña y primera pieza elegidas, banda final', async ({ page }) => {
      await page.goto(PATHS[locale]);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(ui.h1);
      await expect(page.locator('h1 .this')).toHaveText('This');
      await expect(chips(page, locale)).toHaveText(systems.map((s) => s.label));
      expect(await pressed(page, '.chip')).toEqual([systems[0].label]);
      expect(await pressed(page, '.arch-node')).toEqual([systems[0].bands[0].nodes[0].label]);
      await expect(page.locator('.arch-note')).toHaveText(ui.note);
      await expect(inspector(page)).toHaveAttribute('aria-live', 'polite');
      await expect(inspector(page)).toHaveAttribute('aria-label', ui.inspector);
      await expect(page.locator('canvas')).toHaveCount(0); // P-27: sin escena 3D
      const cta = page.locator('section[aria-labelledby="h-simple"]').getByRole('link', { name: ui.cta });
      await expect(cta).toHaveAttribute('href', ui.estimate);
    });

    test('cada pestaña pinta sus bandas y cada pieza actualiza el inspector (aria-pressed, banda, capa resaltada, texto)', async ({ page }, info) => {
      test.slow();
      const desktop = info.project.name === 'desktop';
      await page.goto(PATHS[locale], { waitUntil: 'networkidle' });
      const seen: string[] = [];
      for (const system of systems) {
        await chips(page, locale).filter({ hasText: system.label }).click();
        expect(await pressed(page, '.chip')).toEqual([system.label]);
        // Bandas en orden, con sus piezas; la punteada es la última.
        await expect(page.locator('.arch-band > .mono')).toHaveText(system.bands.map((b) => b.label));
        expect(await page.locator('.arch-band').evaluateAll((els) => els.map((e) => e.classList.contains('opt')))).toEqual(system.bands.map((b) => b.optional));
        await expect(page.locator('.arch-link')).toHaveCount(system.bands.length - 1);
        for (const [i, band] of system.bands.entries()) {
          await expect(page.locator('.arch-band').nth(i).locator('.arch-node')).toHaveText(band.nodes.map((n) => n.label));
        }
        // Al cambiar de pestaña queda elegida su primera pieza.
        expect(await pressed(page, '.arch-node')).toEqual([system.bands[0].nodes[0].label]);

        for (const [i, band] of system.bands.entries()) {
          for (const node of band.nodes) {
            await page.locator('.arch-band').nth(i).getByRole('button', { name: node.label, exact: true }).click();
            expect(await pressed(page, '.arch-node')).toEqual([node.label]);
            await expect(inspector(page).locator('.mono')).toHaveText(band.label);
            await expect(inspector(page).locator('h2')).toHaveText(node.label);
            await expect(inspector(page).locator('p')).toHaveText(node.text);
            expect(await page.locator('.arch-band').evaluateAll((els) => els.map((e) => e.classList.contains('on')))).toEqual(system.bands.map((b) => b === band));
            if (desktop) await expect(inspector(page).locator('.plate.is-on')).toHaveClass(new RegExp(`\\bl${band.layer}\\b`));
            else await expect(inspector(page).locator('.inspector-plates')).toBeHidden(); // ≤ 1040 px: sin `Plates`, como el diseño
            seen.push(await page.locator('main').innerText());
          }
        }
      }
      // CA-13: en ningún estado hay texto vedado, fuera de los 12 nombres confirmados y la capa de monitoreo (P-28).
      const violations = seen.flatMap((text) => FORBIDDEN.filter((re) => re.test(withoutConfirmed(text, ui.monitoring))).map(String));
      expect([...new Set(violations)]).toEqual([]);
      expect(seen.length).toBe(systems.flatMap((s) => s.bands.flatMap((b) => b.nodes)).length);
    });

    test('P-28: las 12 tecnologías se ven con su nombre; «Monitoring» es una capa sin promesas; Electron, sin el caso POS', async ({ page }) => {
      await page.goto(PATHS[locale], { waitUntil: 'networkidle' });
      const shown = new Set<string>();
      for (const system of systems) {
        await chips(page, locale).filter({ hasText: system.label }).click();
        for (const label of await page.locator('.arch-node').allTextContents()) shown.add(label);
      }
      for (const name of ARCHITECTURE_TECHNOLOGIES) expect(shown, name).toContain(name);
      expect(shown).toContain(ui.monitoring);

      // Monitoreo: banda punteada, texto de capa, sin promesas.
      await chips(page, locale).first().click();
      await page.locator('.arch-band.opt').getByRole('button', { name: ui.monitoring, exact: true }).click();
      const text = (await inspector(page).locator('p').innerText()).trim();
      expect(text).toMatch(locale === 'es' ? /^Capa de la arquitectura/ : /^A layer of the architecture/);
      expect(text).not.toMatch(/continu|24|siempre|always|alert|aviso|cobertura|coverage|tiempo|response|antes de que|before |garant|guarant/i);

      // Electron (P-36 = A): en las dos pestañas POS y en la de móvil y escritorio, con texto general.
      const withElectron = systems.filter((s) => s.bands.some((b) => b.nodes.some((n) => n.id === 'electron'))).map((s) => s.id);
      expect(withElectron).toEqual(['pos-local', 'pos-hybrid', 'mobile']);
      await chips(page, locale).nth(3).click();
      await page.getByRole('button', { name: 'Electron', exact: true }).click();
      expect(await inspector(page).locator('p').innerText()).not.toMatch(/POS|punto de venta|point of sale|client|caso|case/i);
    });

    test('teclado: Tab recorre pestañas y piezas, Enter y Espacio eligen, foco visible', async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop');
      await page.goto(PATHS[locale], { waitUntil: 'networkidle' });
      await chips(page, locale).first().focus();
      await page.keyboard.press('Tab');
      await expect(chips(page, locale).nth(1)).toBeFocused();
      expect(await chips(page, locale).nth(1).evaluate((e) => e.matches(':focus-visible') && getComputedStyle(e).outlineStyle !== 'none')).toBe(true);
      await page.keyboard.press('Enter');
      expect(await pressed(page, '.chip')).toEqual([systems[1].label]);
      // De la última pestaña al diagrama: la primera pieza es el siguiente elemento con foco.
      await chips(page, locale).last().focus();
      await page.keyboard.press('Tab');
      const first = page.locator('.arch-node').first();
      await expect(first).toBeFocused();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
      const second = systems[1].bands.flatMap((b) => b.nodes)[1];
      expect(await pressed(page, '.arch-node')).toEqual([second.label]);
      await expect(inspector(page).locator('h2')).toHaveText(second.label);
    });

    test('axe sin violaciones serias con una pieza de una banda punteada elegida', async ({ page }) => {
      await page.goto(PATHS[locale], { waitUntil: 'networkidle' });
      const node = page.locator('.arch-band.opt .arch-node').first();
      await node.click();
      // La pieza cambia de color con una transición: se audita el estado final, no uno intermedio.
      await expect(node).toHaveCSS('background-color', 'rgb(120, 169, 255)');
      await expect(node).toHaveCSS('color', 'rgb(6, 16, 31)');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });

    test('ninguna pestaña desborda en horizontal; a 390 px el inspector va primero y queda fijado', async ({ page }, info) => {
      await page.goto(PATHS[locale], { waitUntil: 'networkidle' });
      for (const system of systems) {
        await chips(page, locale).filter({ hasText: system.label }).click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), system.label).toBe(true);
      }
      const [aside, arch] = await Promise.all([inspector(page).boundingBox(), page.locator('.arch').boundingBox()]);
      if (info.project.name === 'mobile') {
        expect(aside!.y).toBeLessThan(arch!.y);
        expect(await inspector(page).evaluate((e) => getComputedStyle(e).position)).toBe('sticky');
      } else {
        expect(aside!.x).toBeGreaterThan(arch!.x + arch!.width); // dos columnas: diagrama e inspector
      }
    });
  });
}

test('sin JavaScript se ve la primera pestaña con su primera pieza', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto(PATHS.es);
  const first = getArchitecture('es')[0];
  await expect(page.locator('.arch-band')).toHaveCount(first.bands.length);
  await expect(inspector(page).locator('h2')).toHaveText(first.bands[0].nodes[0].label);
  await expect(inspector(page).locator('p')).toHaveText(first.bands[0].nodes[0].text);
  await context.close();
});
