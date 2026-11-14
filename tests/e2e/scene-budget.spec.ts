import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

/**
 * Feature 003 · T9 — presupuesto de rendimiento de la escena (P-29, P-34; CA-11).
 *
 * Valores de laboratorio: build de producción servido en local, Chromium sin
 * cabeza con SwiftShader. No son los de una GPU real (P-12). Corre en los
 * proyectos `*-webgl`.
 */
const KB = 1024;
const isDesktop = (name: string) => name.startsWith('desktop');
const gzip = (body: Buffer) => gzipSync(body, { level: 9 }).length;

/** Suma, comprimida, de los `.js` de `/_next/static/chunks/` que descarga una ruta. */
async function scriptWeight(page: Page, path: string) {
  const bodies: Promise<Buffer>[] = [];
  page.on('response', (r) => {
    if (/\/_next\/static\/chunks\/[^/]+\.js$/.test(new URL(r.url()).pathname)) bodies.push(r.body());
  });
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  return (await Promise.all(bodies)).reduce((sum, b) => sum + gzip(b), 0);
}

test.describe('CA-11: presupuesto de la escena (P-29)', () => {
  test('el chunk del motor pesa ≤ 25 KB gzip', () => {
    const dir = '.next/static/chunks';
    const engine = readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${dir}/${f}`)).filter((b) => b.includes('OES_standard_derivatives'));
    expect(engine).toHaveLength(1);
    test.info().annotations.push({ type: 'medida', description: `motor: ${engine[0].length} B, ${gzip(engine[0])} B gzip` });
    expect(gzip(engine[0])).toBeLessThanOrEqual(25 * KB);
  });

  test('una ruta sin escena no descarga el motor y carga ≤ 1,5 KB gzip más que antes de la escena (P-34)', async ({ page }, info) => {
    test.skip(!isDesktop(info.project.name)); // el peso no depende del ancho
    // Línea base: JavaScript de cualquier ruta antes de la escena (commit f0517f6, misma medida): 156 566 B gzip.
    // Si otra feature añade JavaScript común a propósito, este número se actualiza con ella.
    const BASELINE = 156_566;
    const about = await scriptWeight(page, '/es/acerca-de');
    info.annotations.push({ type: 'medida', description: `ruta sin escena: ${about} B gzip (+${about - BASELINE} B sobre la línea base)` });
    expect(about - BASELINE).toBeLessThanOrEqual(1.5 * KB);
    expect(about - BASELINE).toBeGreaterThanOrEqual(0); // si baja, la línea base está vieja
  });

  test('Inicio solo añade el motor a lo que carga cualquier otra ruta', async ({ browser, baseURL }, info) => {
    test.skip(!isDesktop(info.project.name));
    const weigh = async (path: string) => {
      const context = await browser.newContext({ baseURL });
      const weight = await scriptWeight(await context.newPage(), path);
      await context.close();
      return weight;
    };
    const [home, about] = [await weigh('/es'), await weigh('/es/acerca-de')];
    info.annotations.push({ type: 'medida', description: `Inicio: ${home} B gzip; otra ruta: ${about} B gzip; diferencia: ${home - about} B` });
    expect(home - about).toBeGreaterThan(0);
    expect(home - about).toBeLessThanOrEqual(25 * KB);
  });

  test('LCP de Inicio en móvil emulado (4× CPU, 4G rápida): es el titular y llega en ≤ 2,5 s', async ({ page, context }, info) => {
    test.skip(isDesktop(info.project.name));
    test.slow();
    await page.addInitScript(() => {
      const w = window as unknown as { __lcp: { time: number; tag: string; cls: string }[] };
      w.__lcp = [];
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { element?: Element })[]) {
          w.__lcp.push({ time: e.startTime, tag: e.element?.tagName ?? '', cls: e.element?.className ?? '' });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    // «Fast 4G» de las herramientas de Chrome: 9 Mbps de bajada, 1,5 Mbps de subida, 165 ms de latencia.
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 165, downloadThroughput: (9e6 / 8) * 0.9, uploadThroughput: (1.5e6 / 8) * 0.9 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto('/es', { waitUntil: 'load' });
    await expect(page.locator('canvas#a3-hero')).toHaveAttribute('data-quality', /^low /, { timeout: 30_000 });
    await page.waitForTimeout(1500);
    const lcp = (await page.evaluate(() => (window as unknown as { __lcp: { time: number; tag: string; cls: string }[] }).__lcp)).at(-1)!;
    info.annotations.push({ type: 'medida', description: `LCP: ${Math.round(lcp.time)} ms, <${lcp.tag.toLowerCase()} class="${lcp.cls}">` });
    expect(lcp.tag).toBe('H1'); // el texto del hero, no la escena (el lienzo no es candidato a LCP)
    expect(lcp.cls).toContain('hero-title');
    expect(lcp.time).toBeLessThanOrEqual(2500);
  });

  test('arranque del motor: su JavaScript cuesta ≤ 200 ms; se anota la tarea larga de laboratorio', async ({ browser, baseURL }, info) => {
    test.skip(!isDesktop(info.project.name));
    test.slow();
    // CA-11 tras P-37 (decisión de Julio, ▲B3): el JavaScript de arranque del motor cuesta ≤ 200 ms en el
    // laboratorio (`data-start`, lo que tarda `createEngine`). La tarea larga que mide el navegador se anota
    // sin exigirla: con SwiftShader la domina el pintado por software del primer cuadro; en GPU real, P-12.
    const runs: { start: number; longest: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();
      await page.addInitScript(() => {
        const w = window as unknown as { __long: number[] };
        w.__long = [];
        new PerformanceObserver((list) => { for (const e of list.getEntries()) w.__long.push(e.duration); }).observe({ type: 'longtask', buffered: true });
      });
      await page.goto('/es', { waitUntil: 'load' });
      const canvas = page.locator('canvas#a3-hero');
      await expect(canvas).toHaveAttribute('data-start', /^\d/, { timeout: 30_000 });
      await page.waitForTimeout(2500);
      runs.push({
        start: Number(await canvas.getAttribute('data-start')),
        longest: Math.round(Math.max(0, ...(await page.evaluate(() => (window as unknown as { __long: number[] }).__long)))),
      });
      await context.close();
    }
    info.annotations.push({ type: 'medida', description: `arranque (JavaScript): ${runs.map((r) => r.start).join(', ')} ms; tarea más larga: ${runs.map((r) => r.longest).join(', ')} ms` });
    // La mejor de tres: la suite corre en paralelo y el reloj incluye lo que hagan las demás pruebas.
    expect(Math.min(...runs.map((r) => r.start))).toBeLessThanOrEqual(200);
  });
});
