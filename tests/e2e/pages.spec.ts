import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { workGridClass } from '../../src/components/sections/home/work-grid';
import { casePair, servicePairs } from './routes';

/**
 * Feature 002 · T11–T13 — Inicio, Acerca de y Legal (spec 002 §3.1, §3.5,
 * §3.6; CA-2, CA-7, CA-9, CA-11, CA-13, CA-14). Build de producción, desktop
 * (1440) y mobile (390). Solo Chromium (P-17).
 */

async function axeSerious(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('T11 · Inicio', () => {
  for (const locale of ['es', 'en'] as const) {
    test(`/${locale}: las 6 secciones en orden; hero con su recorrido y la escena 3D (003 · T7)`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator('h1')).toHaveCount(1);
      // El hero va dentro de .hero-pin (el tramo del recorrido, P-30); las otras cinco, directas en <main>.
      const order = await page.locator('main > .hero-pin > section, main > section').evaluateAll((els) =>
        els.map((e) => (e.classList.contains('hero') ? 'hero' : e.getAttribute('aria-labelledby'))),
      );
      expect(order).toEqual(['hero', 'h-work', 'h-serv', 'h-tech', 'h-me', 'h-go']);
      await expect(page.locator('main > .hero-pin')).toHaveCount(1);
      await expect(page.locator('section.hero .hero-3d .a3.hero')).toHaveCount(1);
      await expect(page.locator('section.hero .hero-hint')).toHaveCount(1);
      // Este proyecto corre con WebGL desactivado (playwright.config.ts): la isla muestra el respaldo del diseño.
      // La escena en sí (carga diferida, recorrido, sincronía, liberación) se prueba en scene.spec.ts.
      await expect(page.locator('section.hero .a3-fallback .xv.tall')).toHaveCount(1);
      await expect(page.locator('canvas')).toHaveCount(0);
      await expect(page.locator('.portrait')).toHaveCount(0);
    });

    test(`/${locale}: los rótulos del selector de capas caben en su columna de 30 px`, async ({ page }) => {
      await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
      const widths = await page.locator('.lp .mono').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
      expect(widths).toHaveLength(5);
      for (const w of widths) expect(w).toBeLessThanOrEqual(30);
    });

    test(`/${locale}: trabajo, servicios y cierre enlazan a sus rutas`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const cards = page.locator('.work-grid .proj');
      await expect(cards).toHaveCount(1);
      await expect(cards.first()).toHaveAttribute('href', casePair[locale]);
      const rows = page.locator('.rows a.row');
      await expect(rows).toHaveCount(7);
      expect(await rows.evaluateAll((els) => els.map((e) => e.getAttribute('href')))).toEqual(servicePairs.map((s) => s[locale]));
      // P-44 (006): sin «Obtén un estimado rápido» mientras no exista el estimador; queda el camino a Contacto.
      await expect(page.locator('.path-link')).toHaveCount(1);
      await expect(page.locator('.path-link')).toHaveAttribute('href', locale === 'es' ? '/es/contacto' : '/en/contact');
      const text = await page.locator('main').innerText();
      expect(text).not.toMatch(/PostgreSQL|MongoDB|24\s*\/\s*7|\bSLA\b|moving lights|luces|\[[^\]]+\]|AY LUPITA|Kinderland|ATRIO/i);
    });
  }

  test('▲A4: con un solo proyecto, la tarjeta ocupa el ancho completo de la rejilla', async ({ page }) => {
    for (const locale of ['es', 'en']) {
      await page.goto(`/${locale}`);
      const grid = page.locator('.work-grid');
      await expect(grid).toHaveClass('work-grid single');
      const [g, c] = await Promise.all([grid.boundingBox(), grid.locator('.proj').boundingBox()]);
      expect(Math.abs(g!.width - c!.width), locale).toBeLessThanOrEqual(1);
    }
  });

  test('▲A4: con datos de prueba de 3 proyectos, vuelven las 3 columnas (1 en móvil)', async ({ page }, info) => {
    await page.goto('/en');
    // Datos de prueba: la misma tarjeta tres veces, con la clase que la página daría a 3 proyectos.
    await page.locator('.work-grid').evaluate((grid, cls) => {
      const card = grid.querySelector('.proj')!;
      grid.append(card.cloneNode(true), card.cloneNode(true));
      grid.setAttribute('class', cls);
    }, workGridClass(3));
    const boxes = await page.locator('.work-grid .proj').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: Math.round(r.x), w: r.width })));
    const gridW = await page.locator('.work-grid').evaluate((e) => e.getBoundingClientRect().width);
    expect(boxes).toHaveLength(3);
    if (info.project.name === 'desktop') {
      expect(new Set(boxes.map((b) => b.x)).size).toBe(3); // tres columnas
      for (const b of boxes) expect(b.w).toBeLessThan(gridW / 3);
    } else {
      expect(new Set(boxes.map((b) => b.x)).size).toBe(1); // ≤ 1040 px: una columna, como el diseño
    }
  });

  test('selector de capas: aria-pressed, panel aria-live y vista resaltada del respaldo sin WebGL (CA-11)', async ({ page }) => {
    // Sin WebGL la vista es el `Plates stack` de la 002; con la escena, la sincronía se prueba en scene.spec.ts.
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, ...a: unknown[]) => unknown;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
        return String(args[0]).includes('webgl') ? null : getContext.apply(this, args);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto('/es', { waitUntil: 'networkidle' });
    await page.locator('.built-stage').scrollIntoViewIfNeeded();
    const group = page.getByRole('group', { name: 'Capas de la arquitectura' });
    const buttons = group.getByRole('button');
    await expect(buttons).toHaveCount(5);
    const pressed = () => buttons.evaluateAll((els) => els.map((e) => e.getAttribute('aria-pressed')).join(''));
    const panel = page.locator('.built-info');
    await expect(panel).toHaveAttribute('aria-live', 'polite');
    expect(await pressed()).toBe('truefalsefalsefalsefalse');
    await expect(panel.locator('h3')).toHaveText('Interfaz');
    await expect(page.locator('.built-stage .plate.is-on')).toHaveClass(/\bl0\b/);

    await buttons.filter({ hasText: 'Datos' }).click();
    expect(await pressed()).toBe('falsefalsetruefalsefalse');
    await expect(panel.locator('h3')).toHaveText('Datos');
    await expect(panel).toHaveClass(/\bl2\b/);
    await expect(page.locator('.built-stage .plate.is-on')).toHaveClass(/\bl2\b/);

    await buttons.filter({ hasText: 'Ver el sistema completo' }).focus();
    await page.keyboard.press('Enter');
    expect(await pressed()).toBe('falsefalsefalsefalsetrue');
    await expect(panel.locator('h3')).toHaveText('El sistema completo');
    await expect(page.locator('.built-stage .plate.is-on')).toHaveCount(0);
  });
});

test.describe('T12 · Acerca de', () => {
  for (const [path, who] of [['/es/acerca-de', 'Soy Julio Orellana'], ['/en/about', "I'm Julio Orellana"]] as const) {
    test(`${path}: solo lo confirmado, una columna, GitHub (P-20, DA-7)`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('.about-top')).toContainText(who);
      expect(await page.locator('.about-top').evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(' ').length)).toBe(1);
      const gh = page.locator('a[href="https://github.com/Julio-orellana"]');
      await expect(gh.first()).toBeVisible();
      await expect(page.locator('main a[href*="linkedin"], main a[href$=".pdf"], main a[href="#cv"], .portrait')).toHaveCount(0);
      await expect(page.locator('.spec-list li')).toHaveCount(5);
      const text = await page.locator('main').innerText();
      expect(text).not.toMatch(/Especialidades|Tecnolog[ií]as|Technical specialties|Technologies|TypeScript|Next\.js|React|NestJS|PostgreSQL|CV|LinkedIn|\[[^\]]+\]/);
    });
  }
});

test.describe('T13 · Legal', () => {
  const cases = [
    { path: '/es/legal', banner: 'Borrador pendiente de revisión legal. Última actualización: 12 de noviembre de 2026.', anchors: ['licenciamiento', 'propiedad-intelectual', 'privacidad', 'marco-legal'] },
    { path: '/en/legal', banner: 'Draft pending legal review. Last updated: November 12, 2026.', anchors: ['licensing', 'intellectual-property', 'privacy', 'legal-framework'] },
  ];
  for (const c of cases) {
    test(`${c.path}: rótulo de borrador con fecha del commit, 4 secciones, sin correo (CA-14)`, async ({ page }) => {
      await page.goto(c.path);
      await expect(page.locator('.legal-draft')).toHaveText(c.banner);
      expect(await page.locator('.legal-sec[id]').evaluateAll((els) => els.map((e) => e.id))).toEqual(c.anchors);
      await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
      await expect(page.locator('.legal-sec').last().locator('a')).toHaveAttribute('href', c.path.startsWith('/es') ? '/es/contacto' : '/en/contact');
      const text = await page.locator('main').innerText();
      expect(text).not.toMatch(/@thisjulio|\[[^\]]+\]/);
      expect(text).toMatch(c.path.startsWith('/es') ? /no de una sola ley integral de protección de datos/ : /rather than from a single comprehensive data protection law/);
      expect(text).toMatch(c.path.startsWith('/es') ? /RGPD, no aplican automáticamente/ : /GDPR do not automatically apply/);
    });

    test(`${c.path}: cada enlace del índice deja su sección bajo el encabezado fijo`, async ({ page }) => {
      await page.goto(c.path, { waitUntil: 'networkidle' });
      const navH = await page.locator('header.nav').evaluate((e) => e.getBoundingClientRect().height);
      for (const a of c.anchors) {
        await page.locator(`.legal-index a[href="#${a}"]`).click();
        await expect(page).toHaveURL(new RegExp(`#${a}$`));
        await expect.poll(() => page.locator(`#${a}`).evaluate((e) => Math.round(e.getBoundingClientRect().top))).toBe(92);
        expect(92).toBeGreaterThan(navH);
      }
    });
  }

  test('los 3 enlaces legales del Footer llevan a su sección bajo el encabezado', async ({ page }) => {
    for (const [label, id] of [['Licenciamiento de software', 'licenciamiento'], ['Propiedad intelectual', 'propiedad-intelectual'], ['Principios de privacidad', 'privacidad']]) {
      await page.goto('/es', { waitUntil: 'networkidle' });
      await page.locator('footer').getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`/es/legal#${id}$`));
      await expect.poll(() => page.locator(`#${id}`).evaluate((e) => Math.round(e.getBoundingClientRect().top))).toBe(92);
    }
  });
});

test.describe('CA-9 / CA-10: accesibilidad, red y desborde de Inicio, Acerca de y Legal', () => {
  for (const path of ['/es', '/en', '/es/acerca-de', '/en/about', '/es/legal', '/en/legal']) {
    test(`${path}: axe sin violaciones serias, sin orígenes externos, errores ni localStorage`, async ({ page, baseURL }) => {
      const external: string[] = [];
      const problems: string[] = [];
      page.on('request', (r) => new URL(r.url()).origin !== new URL(baseURL!).origin && external.push(r.url()));
      page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && problems.push(m.text()));
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await axeSerious(page)).toEqual([]);
      expect(external).toEqual([]);
      expect(problems).toEqual([]);
      expect(await page.evaluate(() => localStorage.length)).toBe(0);
    });
  }

  test('español sin desborde horizontal a 1440, 1024, 768 y 390', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/es', '/es/acerca-de', '/es/legal']) {
        await page.goto(path);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${path} @${width}`).toBeLessThanOrEqual(0);
      }
    }
  });
});
