import { expect, test, type Page } from '@playwright/test';
import { settle } from './a11y-helpers';
import { sitePaths } from './routes';

/**
 * Feature 006 · T12 (CA-15): lo que axe no ve (`plan.md` §4.4), parte local. Corre en `desktop` (1440) y
 * `mobile` (390), sin WebGL; la escena con WebGL se revisa en `scene.spec.ts` (CA-5, CA-8). VoiceOver y Safari
 * real quedan para el preview (Safari no hidrata sobre `http://localhost`, ver `playwright.config.ts`).
 */
const ROUTES = [...sitePaths.map((p) => p.path), '/es/no-existe', '/en/no-existe'];

/** Ayudantes que se instalan en la página antes de cargarla (los scripts de Playwright no pasan por la CSP). */
function install() {
  type RGBA = [number, number, number, number];
  const parse = (c: string): RGBA | null => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const over = (top: RGBA, bottom: RGBA): RGBA => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat(a) as RGBA;
  };
  const lum = ([r, g, b]: RGBA) => {
    const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a: RGBA, b: RGBA) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  /** Fondo efectivo bajo `el`, o `null` si hay una imagen o un degradado en el camino (no medible así). */
  const background = (el: Element): RGBA | null => {
    const layers: RGBA[] = [];
    for (let n: Element | null = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none') return null;
      const c = parse(cs.backgroundColor);
      if (c && c[3] > 0) layers.push(c);
      if (c && c[3] === 1) break;
    }
    return layers.reduceRight<RGBA>((acc, c) => over(c, acc), [255, 255, 255, 1]);
  };
  const opacity = (el: Element) => { let o = 1; for (let n: Element | null = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o; };
  const ownText = (el: Element) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
  const isLarge = (el: Element) => { const cs = getComputedStyle(el); const px = parseFloat(cs.fontSize); return px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700); };
  /**
   * Peor contraste entre los textos de `el` (él y sus descendientes con texto propio), frente al umbral de cada
   * uno (3:1 si es texto grande, 4,5:1 si no). `null` si alguno no se puede medir así (imagen o degradado detrás).
   */
  const textContrast = (el: Element) => {
    let worst: { ratio: number; need: number; what: string; opacity: number } | null = null;
    for (const t of [el, ...el.querySelectorAll('*')]) {
      if (!ownText(t) || !visible(t)) continue;
      const bg = background(t);
      const fg = parse(getComputedStyle(t).color);
      if (!bg || !fg) return null;
      fg[3] *= opacity(t);
      const r = ratio(over(fg, bg), bg);
      const need = isLarge(t) ? 3 : 4.5;
      if (!worst || r / need < worst.ratio / worst.need) worst = { ratio: r, need, what: describe(t), opacity: opacity(t) };
    }
    return worst;
  };
  const describe = (el: Element) => {
    const name = (el.getAttribute('aria-label') ?? (el as HTMLElement).innerText ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${[...el.classList].map((c) => '.' + c).join('')} «${name}»`;
  };
  const visible = (el: Element) => (el as HTMLElement).checkVisibility?.({ visibilityProperty: true }) ?? true;
  const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]';
  const tabbables = () => [...document.querySelectorAll(TABBABLE)].filter((e) => (e as HTMLElement).tabIndex >= 0 && visible(e) && !e.closest('[inert]'));
  /** 2.4.11: el elemento enfocado queda tapado por completo si ningún punto de muestra visible cae en él. */
  const obscured = (el: Element) => {
    const r = el.getBoundingClientRect();
    const points = [[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]].map(([x, y]) => [r.left + r.width * x, r.top + r.height * y]);
    const inside = points.filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight);
    if (inside.length === 0) return 'fuera de la ventana';
    return inside.some(([x, y]) => { const hit = document.elementFromPoint(x, y); return !!hit && (el === hit || el.contains(hit)); }) ? null : describe(document.elementFromPoint(inside[0][0], inside[0][1])!);
  };
  const focusIndicator = (el: Element) => {
    const cs = getComputedStyle(el);
    const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
    if (!outline && cs.boxShadow === 'none') return { visible: false, contrast: null as number | null };
    const color = parse(outline ? cs.outlineColor : cs.boxShadow) ;
    const bg = el.parentElement ? background(el.parentElement) : null;
    return { visible: true, contrast: color && bg ? ratio(over(color, bg), bg) : null };
  };
  const inScroller = (el: Element) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const o = getComputedStyle(n).overflowX;
      if (o === 'auto' || o === 'scroll') return true;
    }
    return false;
  };
  /** Textos recortados o fuera de la página: desborde con `overflow` oculto, o caja fuera de la ventana. */
  const clipped = () => {
    const out: string[] = [];
    const vw = document.documentElement.clientWidth;
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el) || el.closest('[aria-hidden="true"], .skip-link')) continue;
      if (!ownText(el)) continue;
      // Dentro de una región con desplazamiento propio (la fila de pestañas de Servicios) el texto se alcanza
      // desplazando esa región o con el tabulador: no se cuenta como fuera de la página.
      if (inScroller(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 && r.height <= 1) continue; // solo para lectores de pantalla
      const cs = getComputedStyle(el);
      const hides = (v: string) => v === 'hidden' || v === 'clip';
      if ((hides(cs.overflowX) && el.scrollWidth > el.clientWidth + 1) || (hides(cs.overflowY) && el.scrollHeight > el.clientHeight + 1)) out.push(`recortado: ${describe(el)}`);
      if (r.right > vw + 1 || r.left < -1) out.push(`fuera de la página: ${describe(el)}`);
    }
    return out;
  };
  Object.assign(window, { __a11y: { textContrast, isLarge, describe, tabbables, obscured, focusIndicator, clipped, background } });
}

type Helpers = {
  textContrast(el: Element): { ratio: number; need: number; what: string; opacity: number } | null;
  isLarge(el: Element): boolean;
  describe(el: Element): string;
  tabbables(): Element[];
  obscured(el: Element): string | null;
  focusIndicator(el: Element): { visible: boolean; contrast: number | null };
  clipped(): string[];
};
declare global { interface Window { __a11y: Helpers } }

async function open(page: Page, path: string) {
  await page.addInitScript(install);
  await page.goto(path, { waitUntil: 'networkidle' });
  await settle(page);
}

test.describe('T12 · teclado y foco (2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 1.4.11)', () => {
  for (const path of ROUTES) {
    test(path, async ({ page }) => {
      await open(page, path);
      const expected = await page.evaluate(() => window.__a11y.tabbables().map((e, i) => { e.setAttribute('data-a11y-i', String(i)); return window.__a11y.describe(e); }));
      expect(expected.length).toBeGreaterThan(0);

      const seen: number[] = [];
      const problems: string[] = [];
      const faded: string[] = [];
      for (let step = 0; step <= expected.length + 2; step++) {
        await page.keyboard.press('Tab');
        await settle(page); // «Saltar al contenido» entra con una transición
        const stop = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const a = window.__a11y;
          const fi = a.focusIndicator(el);
          return {
            i: Number(el.getAttribute('data-a11y-i') ?? -1), what: a.describe(el), focusVisible: el.matches(':focus-visible'),
            indicator: fi, obscuredBy: a.obscured(el), text: a.textContrast(el),
          };
        });
        if (!stop) break; // fin del documento: el foco sale de la página, no hay trampa
        if (seen.includes(stop.i)) { problems.push(`el foco vuelve a ${stop.what} (posible trampa)`); break; }
        seen.push(stop.i);
        if (stop.i < 0) problems.push(`foco en un elemento no previsto: ${stop.what}`);
        if (!stop.focusVisible || !stop.indicator.visible) problems.push(`sin indicador de foco: ${stop.what}`);
        if (stop.indicator.contrast !== null && stop.indicator.contrast < 3) problems.push(`indicador de foco ${stop.indicator.contrast.toFixed(2)}:1 < 3:1: ${stop.what}`);
        if (stop.obscuredBy) problems.push(`foco tapado (${stop.obscuredBy}): ${stop.what}`);
        if (stop.text && stop.text.opacity < 0.99) faded.push(`${stop.text.ratio.toFixed(2)}:1 con opacidad ${stop.text.opacity.toFixed(2)}: ${stop.what}`);
        if (stop.text && stop.text.ratio < stop.text.need) problems.push(`texto enfocado ${stop.text.ratio.toFixed(2)}:1 < ${stop.text.need}:1 (opacidad efectiva ${stop.text.opacity.toFixed(2)}): ${stop.text.what} en ${stop.what}`);
      }
      await test.info().attach('paradas-con-opacidad-parcial.txt', { body: faded.join('\n') || '(ninguna)' });
      expect(problems).toEqual([]);
      // Orden del recorrido = orden del documento, y se recorren todos (sin tabindex positivos ni saltos).
      expect(seen).toEqual(expected.map((_, i) => i));

      // Y de vuelta con Mayús+Tab, desde el final.
      const back: number[] = [];
      for (let step = 0; step <= expected.length + 2; step++) {
        await page.keyboard.press('Shift+Tab');
        const i = await page.evaluate(() => (document.activeElement === document.body ? null : Number(document.activeElement?.getAttribute('data-a11y-i') ?? -1)));
        if (i === null || back.includes(i)) break;
        back.push(i);
      }
      expect(back).toEqual(expected.map((_, i) => i).reverse());
    });
  }
});

test.describe('T12 · contraste al pasar el puntero (1.4.3, 1.4.11)', () => {
  test('cada tipo de enlace y botón, en todas las rutas', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'el puntero fino es de escritorio');
    test.setTimeout(240_000);
    const signatures = new Set<string>();
    const problems: string[] = [];
    const unmeasured: string[] = [];
    for (const path of ROUTES) {
      await open(page, path);
      const targets = await page.evaluate(() => window.__a11y.tabbables().map((e, i) => {
        e.setAttribute('data-a11y-i', String(i));
        return { i, sig: `${e.tagName}.${[...e.classList].sort().join('.')}`, text: !!(e as HTMLElement).innerText?.trim() };
      }));
      for (const t of targets) {
        if (!t.text || signatures.has(t.sig) || t.sig.includes('skip-link')) continue; // el salto solo aparece con el teclado
        signatures.add(t.sig);
        const el = page.locator(`[data-a11y-i="${t.i}"]`);
        await el.scrollIntoViewIfNeeded();
        await el.hover({ timeout: 5000 });
        await settle(page);
        const r = await el.evaluate((e) => ({ c: window.__a11y.textContrast(e), what: window.__a11y.describe(e) }));
        if (r.c === null) unmeasured.push(`${path}: ${r.what}`);
        else if (r.c.ratio < r.c.need) problems.push(`${path}: ${r.c.ratio.toFixed(2)}:1 < ${r.c.need}:1: ${r.c.what} en ${r.what}`);
      }
      await page.mouse.move(0, 0);
    }
    await info.attach('hover-no-medibles.txt', { body: unmeasured.join('\n') || '(ninguno)' });
    expect(problems).toEqual([]);
    expect(signatures.size).toBeGreaterThan(5);
  });
});

test.describe('T12 · reflujo a 320 px y zoom al 200 % (1.4.10, 1.4.4)', () => {
  for (const viewport of [{ width: 320, height: 640, name: '320 px' }, { width: 640, height: 450, name: '200 % de 1280×900' }]) {
    test(viewport.name, async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'el ancho se fija aquí; basta un proyecto');
      test.setTimeout(240_000);
      await page.setViewportSize(viewport);
      const problems: string[] = [];
      for (const path of ROUTES) {
        await open(page, path);
        const r = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth, clipped: window.__a11y.clipped() }));
        if (r.scroll > 1) problems.push(`${path}: desplazamiento horizontal de ${r.scroll} px`);
        problems.push(...r.clipped.map((c) => `${path}: ${c}`));
      }
      expect(problems).toEqual([]);
    });
  }
});

test.describe('T12 · espaciado de texto (1.4.12)', () => {
  // La hoja de prueba de WCAG se inyecta con <style>, que la CSP del sitio bloquea (ADR 006). Solo este
  // navegador de prueba ignora la CSP; el sitio y su política no cambian.
  test.use({ bypassCSP: true });
  test('todas las rutas con interlineado 1,5, letras 0,12 em, palabras 0,16 em y párrafos 2 em', async ({ page }) => {
    test.setTimeout(240_000);
    const problems: string[] = [];
    for (const path of ROUTES) {
      await open(page, path);
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' });
      await settle(page);
      const r = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth, clipped: window.__a11y.clipped() }));
      if (r.scroll > 1) problems.push(`${path}: desplazamiento horizontal de ${r.scroll} px`);
      problems.push(...r.clipped.map((c) => `${path}: ${c}`));
    }
    expect(problems).toEqual([]);
  });
});

test.describe('T12 · movimiento (2.2.2, 2.3.3; P-58 = B)', () => {
  /** Animaciones del reloj del documento: las ligadas al desplazamiento solo se mueven si la persona desplaza. */
  const timed = (page: Page) => page.evaluate(() => document.getAnimations()
    .filter((a) => a.timeline === document.timeline && a.playState !== 'finished' && a.playState !== 'idle')
    .map((a) => {
      const e = a.effect as KeyframeEffect;
      const t = e.target as Element;
      const timing = e.getComputedTiming();
      return {
        what: `${(a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? 'animación'} en .${[...t.classList].join('.')}${e.pseudoElement ?? ''}`,
        // Fin en ms desde el arranque de la animación (incluye el desfase, que puede ser negativo).
        end: timing.endTime === Infinity ? Infinity : Number(timing.endTime),
      };
    }));

  test('con prefers-reduced-motion no queda ninguna animación en marcha', async ({ page }) => {
    test.setTimeout(240_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const problems: string[] = [];
    for (const path of ROUTES) {
      await open(page, path);
      const list = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => (a as CSSAnimation).animationName ?? 'animación'));
      if (list.length) problems.push(`${path}: ${list.join(', ')}`);
    }
    expect(problems).toEqual([]);
  });

  test('sin esa preferencia, nada que arranque solo dura más de 5 s (WCAG 2.2.2)', async ({ page }) => {
    test.setTimeout(240_000);
    // P-58 = B: `flow` y `dash` tienen un número fijo de ciclos. La escena 3D (con WebGL) se comprueba en
    // scene.spec.ts («P-58»): aquí no hay WebGL.
    const problems: string[] = [];
    const seen: string[] = [];
    for (const path of ROUTES) {
      await open(page, path);
      for (const a of await timed(page)) {
        seen.push(`${path}: ${a.what} (${a.end === Infinity ? '∞' : Math.round(a.end) + ' ms'})`);
        if (!(a.end <= 5000)) problems.push(`${path}: ${a.what} termina en ${a.end === Infinity ? '∞ (infinita)' : Math.round(a.end) + ' ms'}`);
      }
    }
    await test.info().attach('animaciones-medidas.txt', { body: seen.join('\n') || '(ninguna)' });
    expect(problems).toEqual([]);
    // Las que eran continuas siguen existiendo (no se quitaron: solo cambia cuánto duran).
    expect(seen.some((s) => s.includes('flow en .arch-link'))).toBe(true);
    expect(seen.some((s) => s.includes('dash en .f'))).toBe(true);
  });

  test('a los 5 s de cargar, Arquitectura y el servicio POS están quietos', async ({ page }) => {
    for (const path of ['/es/arquitectura', '/en/services/pos-systems']) {
      await open(page, path);
      expect((await timed(page)).length, path).toBeGreaterThan(0);
      await page.waitForTimeout(5_000);
      expect(await page.evaluate(() => document.getAnimations().filter((a) => a.timeline === document.timeline && a.playState === 'running').map((a) => (a as CSSAnimation).animationName)), path).toEqual([]);
    }
  });
});

test.describe('T12 · idioma, títulos, encabezados, regiones y consistencia (3.1.1, 3.1.2, 2.4.2, 1.3.1, 2.4.6, 3.2.3, 3.2.6, 2.5.3)', () => {
  test('cada ruta', async ({ page }, info) => {
    test.setTimeout(240_000);
    const problems: string[] = [];
    const titles = new Map<string, string>();
    const navs: Record<string, string> = {};
    const footers: Record<string, string> = {};
    for (const { path, locale } of sitePaths) {
      await open(page, path);
      const r = await page.evaluate(() => {
        const text = (e: Element) => (e as HTMLElement).innerText.trim().replace(/\s+/g, ' ');
        const levels = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter((h) => (h as HTMLElement).checkVisibility()).map((h) => Number(h.tagName[1]));
        const skips = levels.filter((l, i) => i > 0 && l > levels[i - 1] + 1).length;
        const mismatched = [...document.querySelectorAll('a[aria-label], button[aria-label]')]
          .filter((e) => (e as HTMLElement).checkVisibility() && text(e) && !e.getAttribute('aria-label')!.toLowerCase().replace(/\s+/g, ' ').includes(text(e).toLowerCase()))
          .map((e) => `«${e.getAttribute('aria-label')}» no contiene «${text(e)}»`);
        const linkList = (sel: string) => [...document.querySelectorAll(`${sel} a`)].filter((a) => (a as HTMLElement).checkVisibility()).map((a) => `${text(a)}→${a.getAttribute('href')}`).join(' | ');
        // Cabecera del sitio: navegación principal y CTA con destino; el selector de idioma, solo por su texto
        // (su destino es la misma página en el otro idioma, distinto en cada ruta).
        const header = document.querySelector('header.nav');
        const headerList = header ? [...header.querySelectorAll('a, button')].filter((a) => (a as HTMLElement).checkVisibility())
          .map((a) => (a.closest('[class*="locale"], [class*="lang"]') ? text(a) : `${text(a)}→${a.getAttribute('href') ?? 'botón'}`)).join(' | ') : 'sin cabecera';
        return {
          lang: document.documentElement.lang, title: document.title, h1: document.querySelectorAll('h1').length, skips,
          mains: document.querySelectorAll('main').length, banner: document.querySelectorAll('header').length, footer: document.querySelectorAll('footer').length,
          mismatched, nav: headerList, footerLinks: linkList('footer'),
        };
      });
      if (r.lang !== locale) problems.push(`${path}: lang=${r.lang}`);
      // Títulos únicos dentro de cada idioma («THIS JULIO» es el mismo en Inicio es y en, y es correcto).
      const key = `${locale} ${r.title}`;
      if (titles.has(key)) problems.push(`${path}: título repetido con ${titles.get(key)} («${r.title}»)`);
      titles.set(key, path);
      if (r.h1 !== 1) problems.push(`${path}: ${r.h1} h1`);
      if (r.skips) problems.push(`${path}: ${r.skips} saltos de nivel de encabezado`);
      if (r.mains !== 1 || r.banner < 1 || r.footer < 1) problems.push(`${path}: regiones main=${r.mains} header=${r.banner} footer=${r.footer}`);
      problems.push(...r.mismatched.map((m) => `${path}: nombre accesible ${m} (2.5.3)`));
      // 3.2.3 y 3.2.6: misma navegación y mismo acceso a Contacto, en el mismo orden, en todas las rutas del idioma.
      const nav = r.nav.replace(/\s*\(actual\)|\s*\(current\)/g, '');
      if (navs[locale] === undefined) navs[locale] = nav; else if (navs[locale] !== nav) problems.push(`${path}: navegación distinta: ${nav}`);
      const footer = r.footerLinks.replace(/→\/(es|en)\/[^ |]*/g, (m) => m); // los destinos dependen del idioma, no de la ruta
      if (footers[locale] === undefined) footers[locale] = footer; else if (footers[locale] !== footer) problems.push(`${path}: pie distinto`);
    }
    await info.attach('navegacion.txt', { body: JSON.stringify({ navs, footers }, null, 2) });
    expect(problems).toEqual([]);
  });

  test('el 404 sin idioma en la URL marca cada parte con su idioma (3.1.2)', async ({ page }) => {
    await page.goto('/foto.png');
    const langs = await page.evaluate(() => [...new Set([...document.querySelectorAll('[lang]')].map((e) => e.getAttribute('lang')))].sort());
    expect(langs).toEqual(['en', 'es']);
  });
});
