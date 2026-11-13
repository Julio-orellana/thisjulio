import { readdirSync, readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { sitePaths } from './routes';

/**
 * Feature 003 · T4 y T7 — la escena 3D en Inicio (CA-3 a CA-9).
 *
 * Chromium sin cabeza pinta WebGL con SwiftShader (perfil `low`): aquí se
 * prueba el comportamiento, no el rendimiento en una GPU real (P-12). Solo
 * Chromium (P-17). Pintar por software es caro y la suite corre en paralelo:
 * las pruebas que no necesitan la animación usan `prefers-reduced-motion`
 * (cuadros fijos) y las largas llevan `test.slow()`.
 */

// El chunk del motor es el único archivo del build que contiene este texto.
const ENGINE_CHUNKS = readdirSync('.next/static/chunks')
  .filter((f) => f.endsWith('.js') && readFileSync(`.next/static/chunks/${f}`, 'utf8').includes('OES_standard_derivatives'));

type Probe = { contexts: WebGLRenderingContext[]; getContext: number; draws: number; deletes: number; texts: string[] };

/** Cuenta, sin cambiar nada, lo que la página hace con WebGL y con el atlas de texto. */
function instrument() {
  const S: Probe = { contexts: [], getContext: 0, draws: 0, deletes: 0, texts: [] };
  (window as unknown as { __scene: Probe }).__scene = S;
  const getContext = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, ...a: unknown[]) => unknown;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
    const ctx = getContext.apply(this, args);
    if (args[0] === 'webgl') {
      S.getContext++;
      if (ctx && !S.contexts.includes(ctx as WebGLRenderingContext)) S.contexts.push(ctx as WebGLRenderingContext);
    }
    return ctx;
  } as typeof HTMLCanvasElement.prototype.getContext;
  const P = WebGLRenderingContext.prototype as unknown as Record<string, (...a: unknown[]) => unknown>;
  const drawArrays = P.drawArrays;
  P.drawArrays = function (...a) { S.draws++; return drawArrays.apply(this, a); };
  for (const k of ['deleteBuffer', 'deleteTexture', 'deleteFramebuffer', 'deleteRenderbuffer', 'deleteProgram', 'deleteShader']) {
    const original = P[k];
    P[k] = function (...a) { S.deletes++; return original.apply(this, a); };
  }
  const fillText = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (text: string, x: number, y: number, max?: number) {
    S.texts.push(text);
    return max === undefined ? fillText.call(this, text, x, y) : fillText.call(this, text, x, y, max);
  };
}
const probe = (page: Page) =>
  page.evaluate(() => {
    const S = (window as unknown as { __scene: Probe }).__scene;
    return { getContext: S.getContext, created: S.contexts.length, alive: S.contexts.filter((c) => !c.isContextLost()).length, draws: S.draws, deletes: S.deletes, texts: S.texts };
  });

/** Sin WebGL: `getContext('webgl')` devuelve `null`. */
function noWebGL() {
  const getContext = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, ...a: unknown[]) => unknown;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: unknown[]) {
    return String(args[0]).includes('webgl') ? null : getContext.apply(this, args);
  } as typeof HTMLCanvasElement.prototype.getContext;
}
/** WebGL sin la extensión que el motor necesita. */
function noDerivatives() {
  const getExtension = WebGLRenderingContext.prototype.getExtension;
  WebGLRenderingContext.prototype.getExtension = function (this: WebGLRenderingContext, name: string) {
    return name === 'OES_standard_derivatives' ? null : getExtension.call(this, name);
  } as typeof WebGLRenderingContext.prototype.getExtension;
}

/** Errores de consola y de página (los avisos no: ver quality.spec.ts). */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}
const engineRequests = (page: Page) => {
  const hits: string[] = [];
  page.on('request', (r) => { if (ENGINE_CHUNKS.some((f) => r.url().endsWith(`/${f}`))) hits.push(r.url()); });
  return hits;
};
const hero = (page: Page) => page.locator('canvas#a3-hero');
const diagram = (page: Page) => page.locator('canvas#a3-dia');
// El motor ya pintó: anota perfil, tamaño y peldaño de resolución (con carga baja al segundo, como el diseño).
const ready = (page: Page, canvas = hero(page)) => expect(canvas).toHaveAttribute('data-quality', /^low \d+x\d+ step[01]$/);
const toDiagram = (page: Page) => page.locator('.built-stage').scrollIntoViewIfNeeded();

test.describe('CA-3: carga diferida', () => {
  test('el motor es un solo chunk del build', () => {
    expect(ENGINE_CHUNKS).toHaveLength(1);
  });

  test('con las escenas fuera del viewport: 0 peticiones del motor, 0 contextos y 0 lienzos', async ({ page }) => {
    await page.addInitScript(instrument);
    const hits = engineRequests(page);
    // El ancla lleva al cierre de la página: ni el hero ni el diagrama quedan a menos de 200 px.
    await page.goto('/es#h-go', { waitUntil: 'networkidle' });
    await expect(page.locator('#h-go')).toBeInViewport();
    expect(hits).toEqual([]);
    expect((await probe(page)).getContext).toBe(0);
    await expect(page.locator('canvas')).toHaveCount(0);

    // Al acercarse el diagrama, se pide el motor una vez y se crea solo ese contexto.
    await toDiagram(page);
    await ready(page, diagram(page));
    expect(hits).toHaveLength(1);
    expect((await probe(page)).getContext).toBe(1);
    await expect(hero(page)).toHaveCount(0);
  });

  test('al cargar Inicio: solo la escena del hero; el diagrama espera a acercarse', async ({ page }) => {
    await page.addInitScript(instrument);
    const hits = engineRequests(page);
    await page.goto('/es', { waitUntil: 'networkidle' });
    await ready(page);
    await expect(diagram(page)).toHaveCount(0);
    expect((await probe(page)).getContext).toBe(1);

    await toDiagram(page);
    await ready(page, diagram(page));
    expect((await probe(page)).getContext).toBe(2);
    expect(hits).toHaveLength(1); // las dos escenas comparten el chunk
  });

  for (const { path } of sitePaths.filter((p) => !/^\/(es|en)$/.test(p.path))) {
    test(`${path}: sin escena → 0 peticiones del motor, 0 contextos, 0 lienzos`, async ({ page }) => {
      await page.addInitScript(instrument);
      const hits = engineRequests(page);
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(150);
      expect(hits).toEqual([]);
      expect((await probe(page)).getContext).toBe(0);
      await expect(page.locator('canvas')).toHaveCount(0);
    });
  }
});

test.describe('CA-4: respaldo `Plates stack`', () => {
  for (const [name, init] of [['sin WebGL', noWebGL], ['sin OES_standard_derivatives', noDerivatives]] as const) {
    test(`${name}: respaldo en el hero y en el diagrama, sin lienzo, sin etiquetas y sin errores`, async ({ page }) => {
      const errors = watchErrors(page);
      await page.addInitScript(init);
      await page.goto('/es', { waitUntil: 'networkidle' });
      await expect(page.locator('.hero-3d .a3.hero .a3-fallback .xv.tall')).toBeVisible();
      await toDiagram(page);
      await expect(page.locator('.built-stage .a3.diagram .a3-fallback .xv.tall')).toBeVisible();
      await expect(page.locator('canvas')).toHaveCount(0);
      await expect(page.locator('.a3-tag')).toHaveCount(0);
      // El respaldo sigue al selector de capas, como en la 002.
      await expect(page.locator('.built-stage .plate.is-on')).toHaveClass(/\bl0\b/);
      await page.getByRole('group', { name: 'Capas de la arquitectura' }).getByRole('button', { name: 'Datos' }).click();
      await expect(page.locator('.built-stage .plate.is-on')).toHaveClass(/\bl2\b/);
      expect(errors).toEqual([]);
    });
  }

  test('pérdida de contexto: la escena deja paso al respaldo, sin errores', async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript(instrument);
    await page.goto('/es', { waitUntil: 'networkidle' });
    await ready(page);
    await expect(page.locator('.hero-3d .a3-fallback')).toHaveCount(0);
    await page.evaluate(() => (window as unknown as { __scene: Probe }).__scene.contexts[0].getExtension('WEBGL_lose_context')!.loseContext());
    await expect(page.locator('.hero-3d .a3-fallback .xv.tall')).toBeVisible();
    await expect(hero(page)).toHaveCount(0);
    await expect(page.locator('.hero-3d .a3-tag')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('sin JavaScript: se ve el respaldo, sin lienzo', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto('/es');
    await expect(page.locator('.hero-3d .a3-fallback .xv.tall')).toBeVisible();
    await expect(page.locator('.built-stage .a3-fallback .plate.is-on')).toHaveClass(/\bl0\b/);
    await expect(page.locator('canvas')).toHaveCount(0);
    await context.close();
  });
});

test.describe('CA-5: prefers-reduced-motion', () => {
  test('un cuadro fijo: 0 cuadros nuevos en 2 s; hero sin fijar y sin rótulo de recorrido', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(instrument);
    await page.goto('/es', { waitUntil: 'networkidle' });
    await ready(page);
    await page.waitForTimeout(600); // llegan el ResizeObserver y la fuente del atlas
    const before = await probe(page);
    expect(before.draws).toBeGreaterThan(0);
    await page.waitForTimeout(2000);
    expect((await probe(page)).draws).toBe(before.draws);

    expect(await page.locator('section.hero').evaluate((e) => getComputedStyle(e).position)).toBe('relative');
    const [pin, section] = await Promise.all([page.locator('.hero-pin').boundingBox(), page.locator('section.hero').boundingBox()]);
    expect(pin!.height).toBe(section!.height);
    await expect(page.locator('.hero-hint')).toBeHidden();
  });

  test('elegir una capa pinta un cuadro más, no un bucle', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(instrument);
    await page.goto('/es', { waitUntil: 'networkidle' });
    await toDiagram(page);
    await ready(page, diagram(page));
    await page.waitForTimeout(600);
    const before = (await probe(page)).draws;
    await page.getByRole('group', { name: 'Capas de la arquitectura' }).getByRole('button', { name: 'Datos' }).click();
    await page.waitForTimeout(500);
    // Un cuadro = suelo + 7 grupos + pulsos = 9 llamadas a drawArrays.
    expect((await probe(page)).draws - before).toBe(9);
  });
});

test.describe('CA-6: liberación de recursos', () => {
  test('10 idas y vueltas Inicio ⇄ Trabajo: 1 contexto vivo como máximo, recursos borrados y sin avisos de Chromium', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop'); // en móvil la navegación va en el menú; lo que se prueba no depende del ancho
    test.slow();
    const warnings: string[] = [];
    page.on('console', (m) => { if (/Too many active WebGL contexts/.test(m.text())) warnings.push(m.text()); });
    const errors = watchErrors(page);
    await page.addInitScript(instrument);
    await page.goto('/es', { waitUntil: 'networkidle' });
    await page.evaluate(() => { (window as unknown as { __doc: number }).__doc = 1; });
    const nav = page.getByRole('navigation').first();
    for (let i = 0; i < 10; i++) {
      await ready(page);
      expect((await probe(page)).alive).toBe(1);
      await nav.getByRole('link', { name: 'Trabajo' }).click();
      await expect(page).toHaveURL(/\/es\/trabajo$/);
      await expect(page.locator('canvas')).toHaveCount(0);
      const away = await probe(page);
      expect(away.alive).toBe(0);
      // 16 objetos por escena: 2 buffers, 3 texturas, 1 framebuffer, 1 renderbuffer, 3 programas y 6 shaders.
      expect(away.deletes).toBe(16 * (i + 1));
      await nav.getByRole('link', { name: 'Inicio' }).click();
      await expect(page).toHaveURL(/\/es$/);
    }
    await ready(page);
    const end = await probe(page);
    expect(end.created).toBe(11);
    expect(end.alive).toBe(1);
    expect(await page.evaluate(() => (window as unknown as { __doc: number }).__doc)).toBe(1); // sin recargar el documento
    expect(warnings).toEqual([]);
    expect(errors).toEqual([]);
  });
});

test.describe('CA-7: pausa', () => {
  test('0 cuadros con las escenas fuera de pantalla o la pestaña oculta', async ({ page }) => {
    await page.addInitScript(instrument);
    await page.goto('/es', { waitUntil: 'networkidle' });
    await ready(page);
    const moving = await probe(page);
    await page.waitForTimeout(400);
    expect((await probe(page)).draws).toBeGreaterThan(moving.draws); // en pantalla, el bucle pinta

    // Pestaña oculta.
    await page.evaluate(() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }));
    await page.waitForTimeout(200);
    const hidden = (await probe(page)).draws;
    await page.waitForTimeout(800);
    expect((await probe(page)).draws).toBe(hidden);
    await page.evaluate(() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }));

    // Fuera de pantalla: al final de la página no se ve ninguna de las dos escenas.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(hero(page)).not.toBeInViewport();
    await page.waitForTimeout(400);
    const off = (await probe(page)).draws;
    await page.waitForTimeout(800);
    expect((await probe(page)).draws).toBe(off);
  });
});

test.describe('CA-8: accesibilidad de la escena', () => {
  for (const locale of ['es', 'en'] as const) {
    test(`/${locale}: lienzo decorativo, etiquetas con nombre, axe sin violaciones serias con la escena en marcha`, async ({ page }, info) => {
      await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
      await ready(page);
      await toDiagram(page);
      await ready(page, diagram(page));
      for (const canvas of [hero(page), diagram(page)]) await expect(canvas).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('.built-info')).toHaveAttribute('aria-live', 'polite');

      const names = locale === 'es' ? ['Interfaz', 'Lógica', 'Datos', 'Infraestructura'] : ['Interface', 'Logic', 'Data', 'Infrastructure'];
      const tags = page.locator('.built-stage .a3-tag');
      await expect(tags).toHaveCount(4);
      if (info.project.name === 'desktop') {
        // Desde 560 px de lienzo el motor muestra las etiquetas: son botones con nombre y estado.
        for (const [i, name] of names.entries()) {
          await expect(page.locator('.built-stage').getByRole('button', { name, exact: true })).toBeVisible();
          await expect(tags.nth(i)).toHaveAttribute('aria-pressed', String(i === 0));
        }
      } else {
        // Por debajo las oculta (como el diseño): no reciben foco ni se anuncian.
        for (const i of [0, 1, 2, 3]) await expect(tags.nth(i)).toBeHidden();
      }

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }

  test('etiquetas con teclado: foco visible, Enter elige la capa y el panel la anuncia', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/es', { waitUntil: 'networkidle' });
    await toDiagram(page);
    await ready(page, diagram(page));
    const stage = page.locator('.built-stage');
    const tag = stage.getByRole('button', { name: 'Datos', exact: true });
    await expect(tag).toBeVisible();
    // Llegar con el tabulador desde el último botón del selector: las etiquetas siguen en el orden del documento.
    await page.getByRole('button', { name: 'Ver el sistema completo' }).focus();
    await page.keyboard.press('Tab');
    await expect(stage.getByRole('button', { name: 'Interfaz', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(tag).toBeFocused();
    expect(await tag.evaluate((e) => e.matches(':focus-visible'))).toBe(true);
    expect(await tag.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(tag).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.built-info h3')).toHaveText('Datos');
    await expect(page.locator('.built-info')).toHaveClass(/\bl2\b/);
  });
});

test.describe('CA-9: idioma', () => {
  const ES = ['WEB', 'ESCRITORIO', 'MÓVIL', 'SERVICIOS', 'API', 'REGLAS', 'AUTOMATIZACIÓN', 'POSTGRESQL', 'MONGODB', 'ALMACENAMIENTO', 'SINCRONIZACIÓN', 'NUBE', 'SERVIDOR LOCAL', 'RED', 'SEGURIDAD'];
  const EN = ['WEB', 'DESKTOP', 'MOBILE', 'SERVICES', 'API', 'RULES', 'AUTOMATION', 'POSTGRESQL', 'MONGODB', 'STORAGE', 'SYNC', 'CLOUD', 'LOCAL SERVER', 'NETWORK', 'SECURITY'];

  test('el atlas se pinta con los rótulos del idioma y cambia al cambiar de idioma sin recargar', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop'); // en móvil el selector va dentro del menú (locale-switcher.spec.ts)
    await page.addInitScript(instrument);
    await page.goto('/es', { waitUntil: 'networkidle' });
    await ready(page);
    await page.evaluate(() => { (window as unknown as { __doc: number }).__doc = 1; });
    expect((await probe(page)).texts.slice(0, 15)).toEqual(ES);
    await expect(page.locator('.hero-3d .a3-tag').first()).toHaveText('Interfaz');

    const before = (await probe(page)).texts.length;
    await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /English/ }).click();
    await expect(page).toHaveURL(/\/en$/);
    await ready(page);
    await expect(page.locator('.hero-3d .a3-tag').first()).toHaveText('Interface');
    await expect.poll(async () => (await probe(page)).texts.slice(before, before + 15)).toEqual(EN);
    expect(await page.evaluate(() => (window as unknown as { __doc: number }).__doc)).toBe(1);
  });

  for (const [locale, labels] of [['es', ES], ['en', EN]] as const) {
    test(`/${locale}: cada rótulo cabe en su celda del atlas con la fuente del sitio`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
      await ready(page);
      const widths = await page.evaluate(async (texts) => {
        const font = '500 38px "JetBrains Mono", ui-monospace, Menlo, monospace';
        await document.fonts.load(font, texts.join(''));
        const c = document.createElement('canvas').getContext('2d')!;
        c.font = font;
        return { loaded: document.fonts.check(font, texts.join('')), widths: texts.map((t) => c.measureText(t).width) };
      }, labels as readonly string[]);
      expect(widths.loaded).toBe(true);
      // Celda de 390 unidades con un borde de 2 a 1 de la orilla; se exige además 12 de aire a cada lado.
      for (const [i, w] of widths.widths.entries()) expect(w, labels[i]).toBeLessThanOrEqual(390 - 2 * (3 + 12));
    });
  }
});

test.describe('T7: Inicio con la escena', () => {
  test('recorrido del hero: al desplazar, el paso resalta una capa y cambia el rótulo', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    test.slow();
    await page.goto('/es', { waitUntil: 'networkidle' });
    await ready(page);
    expect(await page.locator('section.hero').evaluate((e) => getComputedStyle(e).position)).toBe('sticky');
    const [pin, section] = await Promise.all([page.locator('.hero-pin').boundingBox(), page.locator('section.hero').boundingBox()]);
    expect(pin!.height - section!.height).toBe(420); // tramo de recorrido del diseño
    const hint = page.locator('.hero-hint');
    const tags = page.locator('.hero-3d .a3-tag');
    const pressed = () => tags.evaluateAll((els) => els.map((e) => e.getAttribute('aria-pressed')).join(' '));
    await expect(hint).toHaveText('Desplázate para seguir una solicitud por el sistema');
    await expect(hint).toHaveAttribute('aria-hidden', 'true');
    expect(await pressed()).toBe('false false false false');

    // p = desplazamiento / 420: < 8 % ninguna; después, cuatro tramos iguales.
    const steps = [
      [0.04, 'Desplázate para seguir una solicitud por el sistema', 'false false false false'],
      [0.2, 'Una solicitud empieza en la Interfaz', 'true false false false'],
      [0.42, 'La Lógica aplica las reglas de negocio', 'false true false false'],
      [0.65, 'Los Datos guardan el resultado', 'false false true false'],
      [0.9, 'La Infraestructura lo mantiene todo en marcha', 'false false false true'],
    ] as const;
    for (const [p, text, state] of steps) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(420 * p));
      await expect(hint).toHaveText(text);
      expect(await pressed()).toBe(state);
      await expect(page.locator('section.hero')).toBeInViewport(); // sigue fijado
      expect((await page.locator('section.hero').boundingBox())!.y).toBe(76);
    }
    // Pasado el tramo, el hero se suelta y ninguna capa queda resaltada.
    await page.evaluate(() => window.scrollTo(0, 420 + 300));
    await expect(hint).toHaveText('Desplázate para seguir una solicitud por el sistema');
    expect(await pressed()).toBe('false false false false');
  });

  test('a 390 px el hero no se fija ni muestra el rótulo de recorrido', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    await page.goto('/es', { waitUntil: 'networkidle' });
    await ready(page);
    expect(await page.locator('section.hero').evaluate((e) => getComputedStyle(e).position)).toBe('relative');
    const [pin, section] = await Promise.all([page.locator('.hero-pin').boundingBox(), page.locator('section.hero').boundingBox()]);
    expect(pin!.height).toBe(section!.height);
    await expect(page.locator('.hero-hint')).toBeHidden();
    expect(await hero(page).evaluate((c) => `${c.clientWidth}x${c.clientHeight}`)).toBe('390x360');
  });

  test('«How it\'s built»: selector, etiquetas y escena van sincronizados', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    test.slow();
    await page.emulateMedia({ reducedMotion: 'reduce' }); // cuadros fijos: lo que se prueba es la sincronía, no la animación
    await page.goto('/es', { waitUntil: 'networkidle' });
    await toDiagram(page);
    await ready(page, diagram(page));
    const group = page.getByRole('group', { name: 'Capas de la arquitectura' }).getByRole('button');
    const picker = () => group.evaluateAll((els) => els.map((e) => e.getAttribute('aria-pressed')).join(' '));
    const tags = page.locator('.built-stage .a3-tag');
    const tagState = () => tags.evaluateAll((els) => els.map((e) => `${e.getAttribute('aria-pressed')}${e.classList.contains('on') ? '+on' : ''}`).join(' '));
    const title = page.locator('.built-info h3');
    expect(await picker()).toBe('true false false false false');
    expect(await tagState()).toBe('true+on false false false');

    // Del selector a la escena.
    await group.filter({ hasText: 'Datos' }).click();
    expect(await tagState()).toBe('false false true+on false');
    await expect(title).toHaveText('Datos');

    // De una etiqueta de la escena al selector.
    await tags.filter({ hasText: 'Lógica' }).click();
    expect(await picker()).toBe('false true false false false');
    await expect(title).toHaveText('Lógica');

    // «Ver el sistema completo»: ninguna capa resaltada.
    await group.filter({ hasText: 'Ver el sistema completo' }).click();
    expect(await tagState()).toBe('false false false false');
    await expect(title).toHaveText('El sistema completo');
    await expect(page.locator('.built-info')).toContainText('Las luces en movimiento muestran los datos viajando entre ellas.');

    // De un clic sobre una bandeja del lienzo al selector (la de Lógica, en el centro de la escena).
    const box = (await diagram(page).boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.62, box.y + box.height * 0.55);
    expect(await picker()).toBe('false true false false false');
    await expect(title).toHaveText('Lógica');
  });

  test('el lienzo llena su contenedor y las etiquetas no desbordan la página', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/es', { waitUntil: 'networkidle' });
    await ready(page);
    await toDiagram(page);
    await ready(page, diagram(page));
    for (const [canvas, parent] of [[hero(page), '.hero-3d'], [diagram(page), '.built-stage']] as const) {
      const size = await canvas.evaluate((c) => [c.clientWidth, c.clientHeight]);
      const outer = await page.locator(parent).evaluate((e) => [e.clientWidth, e.clientHeight]);
      expect(size).toEqual(outer);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});

test.describe('CA-10 (T6): la CSP con la escena en marcha', () => {
  for (const path of ['/es', '/en']) {
    test(`${path}: estática con hashes, sin estilos en línea en el HTML y 0 violaciones al usar la escena`, async ({ page, request }) => {
      test.slow();
      const res = await request.get(path);
      const csp = res.headers()['content-security-policy'];
      // Modo hash: página estática (P-32). El motor no necesita nada que la política no diera ya.
      const scriptSrc = csp.split('; ').find((d) => d.startsWith('script-src '))!;
      expect(scriptSrc).toMatch(/^script-src \S+\/_next\/static\/chunks\/ 'sha256-/);
      expect(scriptSrc).not.toMatch(/nonce-|unsafe-|strict-dynamic|blob:|data:|'self'|\*/);
      expect(csp).toContain("style-src 'self'");
      expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/);
      const html = await res.text();
      expect(html).not.toMatch(/<[a-zA-Z][^>]*\sstyle\s*=/);
      expect(html).not.toMatch(/<canvas\b/i);

      await page.addInitScript(() => {
        const w = window as unknown as { __csp: string[] };
        w.__csp = [];
        document.addEventListener('securitypolicyviolation', (e) => w.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
      });
      const errors = watchErrors(page);
      await page.goto(path, { waitUntil: 'networkidle' });
      await ready(page);
      // El motor posiciona las etiquetas por CSSOM (permitido); se recorre el hero y se usa el diagrama.
      await page.evaluate(() => window.scrollTo(0, 200));
      await toDiagram(page);
      await ready(page, diagram(page));
      await page.locator('.lp').nth(2).click();
      await page.locator('.lp-all').click();
      await page.waitForTimeout(1500); // pasa al menos una medición temporizada del motor
      expect(await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});
