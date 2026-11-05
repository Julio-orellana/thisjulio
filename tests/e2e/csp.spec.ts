import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { hashScript } from '../../scripts/lib/csp-scan.mjs';
import { allPaths } from './routes';

/**
 * T18 — CSP y renderizado (ADR 006, docs/architecture/DECISION-CSP-RENDERING.md §7 y §11.4).
 * Pruebas P1–P14 contra el build de producción. Solo Chromium: Firefox, Safari y
 * un CDN real quedan pendientes (no se presentan como superados).
 */

const internalOf: Record<string, string> = {
  '/es': '/es', '/en': '/en', '/es/trabajo': '/es/work', '/en/work': '/en/work', '/es/servicios': '/es/services',
  '/en/services': '/en/services', '/es/acerca-de': '/es/about', '/en/about': '/en/about', '/es/contacto': '/es/contact',
  '/en/contact': '/en/contact', '/es/arquitectura': '/es/architecture', '/en/architecture': '/en/architecture',
  '/es/estimador': '/es/estimate', '/en/estimate': '/en/estimate', '/es/blog': '/es/blog', '/en/blog': '/en/blog',
  '/es/legal': '/es/legal', '/en/legal': '/en/legal',
};
const nextDir = join(process.cwd(), '.next');
const readJson = (f: string) => JSON.parse(readFileSync(join(nextDir, f), 'utf8'));
const scriptSrc = (csp: string) => csp.split('; ').find((d) => d.startsWith('script-src ')) ?? '';

/** Hashes de los scripts en línea del HTML tal como lo sirve el servidor. */
function inlineHashes(html: string) {
  return [...html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter((m) => !/type="application\/ld\+json"/.test(m[1]))
    .map((m) => hashScript(m[2]))
    .sort();
}

/** Registra violaciones de CSP desde antes de que corra cualquier script de la página. */
async function watchViolations(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI || 'inline'}`),
    );
  });
  return () => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
}

async function hydrated(page: Page) {
  return page.evaluate(() => {
    const b = document.querySelector('button');
    const w = window as unknown as { next?: { router?: unknown } };
    return !!w.next?.router && !!b && Object.keys(b).some((k) => k.startsWith('__reactFiber'));
  });
}

test.describe('P1 / P7: páginas públicas estáticas, sin ISR, y manifiesto completo', () => {
  test('las 18 rutas públicas están prerenderizadas sin revalidación y tienen hashes en el manifiesto', () => {
    const prerender = readJson('prerender-manifest.json');
    const csp = readJson('csp-manifest.json');
    const expected = Object.values(internalOf).sort();
    const publicRoutes = Object.keys(prerender.routes).filter((r) => /^\/(es|en)(\/|$)/.test(r)).sort();
    expect(publicRoutes).toEqual(expected);
    for (const r of publicRoutes) expect(prerender.routes[r].initialRevalidateSeconds, r).toBe(false);
    expect(Object.keys(csp.routes).sort()).toEqual(expected);
    expect(csp.buildId).toBe(readFileSync(join(nextDir, 'BUILD_ID'), 'utf8').trim());
  });

  test('la ruta dinámica (404 con layout) no está prerenderizada', async ({ request }) => {
    const res = await request.get('/es/no-existe');
    expect(res.status()).toBe(404);
    expect(res.headers()['cache-control']).toContain('no-store');
  });
});

test.describe('P2: los hashes de la CSP son exactamente los del HTML servido', () => {
  for (const { path } of allPaths) {
    test(path, async ({ request }) => {
      const res = await request.get(path);
      const csp = res.headers()['content-security-policy'];
      const fromHeader = [...scriptSrc(csp).matchAll(/'(sha256-[^']+)'/g)].map((m) => m[1]).sort();
      expect(fromHeader.length).toBeGreaterThan(0);
      expect(fromHeader).toEqual(inlineHashes(await res.text()));
    });
  }
});

test.describe('P3 / P10: hidratación, cero violaciones y scripts solo desde <origen>/_next/static/chunks/', () => {
  for (const { path } of allPaths) {
    test(path, async ({ page, baseURL }) => {
      const violations = await watchViolations(page);
      const scripts: string[] = [];
      page.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()));
      await page.goto(path, { waitUntil: 'networkidle' });
      expect(await hydrated(page)).toBe(true);
      expect(await violations()).toEqual([]);
      expect(scripts.length).toBeGreaterThan(0);
      expect(scripts.filter((u) => !u.startsWith(`${baseURL}/_next/static/chunks/`))).toEqual([]);
    });
  }

  test('ruta dinámica (404): hidrata con nonce y sin violaciones', async ({ page, baseURL }) => {
    const violations = await watchViolations(page);
    const scripts: string[] = [];
    page.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()));
    await page.goto('/es/no-existe', { waitUntil: 'networkidle' });
    expect(await hydrated(page)).toBe(true);
    expect(await violations()).toEqual([]);
    expect(scripts.filter((u) => !u.startsWith(`${baseURL}/_next/static/chunks/`))).toEqual([]);
  });
});

test.describe('P6 / P10: navegación de cliente, selector de idioma y menú móvil', () => {
  test('Inicio → Servicios → Acerca de → Contacto → English, sin recargar el documento', async ({ page, baseURL }, info) => {
    test.skip(info.project.name !== 'desktop');
    const violations = await watchViolations(page);
    const scripts: string[] = [];
    let documents = 0;
    page.on('request', (r) => {
      if (r.resourceType() === 'script') scripts.push(r.url());
      if (r.resourceType() === 'document') documents++;
    });
    await page.goto('/es', { waitUntil: 'networkidle' });
    const nav = page.getByRole('navigation', { name: 'Principal' });
    for (const name of ['Servicios', 'Acerca de', 'Contacto']) {
      await nav.getByRole('link', { name }).click();
      await expect(page.locator('h1')).toHaveText(name);
    }
    await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /English/ }).click();
    await expect(page).toHaveURL(/\/en\/contact$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(documents).toBe(1);
    expect(await violations()).toEqual([]);
    expect(scripts.filter((u) => !u.startsWith(`${baseURL}/_next/static/chunks/`))).toEqual([]);
  });

  test('el menú móvil abre, navega y se cierra sin violaciones', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile');
    const violations = await watchViolations(page);
    await page.goto('/es', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Menú' }).click();
    await expect(page.getByRole('button', { name: 'Cerrar' })).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('navigation', { name: 'Menú móvil' }).getByRole('link', { name: 'Trabajo' }).click();
    await expect(page).toHaveURL(/\/es\/trabajo$/);
    await expect(page.getByRole('button', { name: 'Menú' })).toHaveAttribute('aria-expanded', 'false');
    expect(await violations()).toEqual([]);
  });
});

test.describe('P5 / P8 / P14: encabezados de cada tipo de respuesta', () => {
  test('estáticas: hashes, sin nonce; dinámicas: nonce distinto por respuesta; nunca self, strict-dynamic ni unsafe-*', async ({ request, baseURL }) => {
    const chunks = `${baseURL}/_next/static/chunks/`;
    for (const { path } of allPaths) {
      const res = await request.get(path);
      const csp = res.headers()['content-security-policy'];
      expect(scriptSrc(csp), path).toMatch(new RegExp(`^script-src ${chunks.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}( 'sha256-[A-Za-z0-9+/]{43}=')+$`));
      expect(csp, path).toContain("style-src 'self';");
      expect(res.headers()['cache-control'], path).toBe('s-maxage=31536000');
    }
    const nonces = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const res = await request.get('/es/no-existe');
      const csp = res.headers()['content-security-policy'];
      const m = scriptSrc(csp).match(/^script-src (\S+) 'nonce-([A-Za-z0-9+/=]+)'$/);
      expect(m?.[1]).toBe(chunks);
      nonces.add(m![2]);
      expect(csp).toContain(`style-src 'self' 'nonce-${m![2]}'`);
      expect(res.headers()['cache-control']).toContain('no-store');
    }
    expect(nonces.size).toBe(3);
    for (const path of ['/', '/es/work', '/x.png', '/es/no-existe', '/es', '/en/about']) {
      const csp = (await request.get(path, { maxRedirects: 0 })).headers()['content-security-policy'];
      expect(csp, path).toBeTruthy();
      expect(scriptSrc(csp), path).not.toMatch(/'self'|strict-dynamic|unsafe-|\*/);
      expect(csp, path).not.toMatch(/unsafe-inline|unsafe-eval/);
      for (const d of ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'", 'upgrade-insecure-requests']) {
        expect(csp, `${path}: ${d}`).toContain(d);
      }
    }
  });

  test('redirecciones y archivos con extensión: CSP sin ningún hash ni nonce', async ({ request, baseURL }) => {
    for (const path of ['/', '/es/work', '/x.png', '/robots.txt']) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(scriptSrc(res.headers()['content-security-policy']), path).toBe(`script-src ${baseURL}/_next/static/chunks/`);
    }
  });

  test('P14: la CSP no depende del encabezado Host ni de X-Forwarded-Host', async ({ request, baseURL }) => {
    const variants: Record<string, string>[] = [{ host: 'evil.example' }, { 'x-forwarded-host': 'evil.example' }, { host: "evil.example 'unsafe-inline'" }];
    for (const headers of variants) {
      for (const path of ['/es', '/es/no-existe']) {
        const csp = (await request.get(path, { headers })).headers()['content-security-policy'] ?? '';
        expect(csp, `${path} ${JSON.stringify(headers)}`).toContain(`script-src ${baseURL}/_next/static/chunks/`);
        expect(csp).not.toContain('evil.example');
      }
    }
  });
});

/** HTML que simula una inyección de marcado. `/inyectado-*.js` se sirve como JS del MISMO origen fuera del build. */
const INJECTIONS: Record<string, string> = {
  'script en línea': '<script>window.__pwn="inline"</script>',
  'JS del mismo origen fuera de la ruta': '<script src="/inyectado-a.js"></script>',
  'traversal con ..': '<script src="/_next/static/chunks/../../../inyectado-b.js"></script>',
  'traversal con %2e%2e': '<script src="/_next/static/chunks/%2e%2e/%2e%2e/%2e%2e/inyectado-c.js"></script>',
  'traversal con barra invertida': '<script src="/_next/static/chunks/..\\..\\..\\inyectado-d.js"></script>',
  'traversal con barra final (308)': '<script src="/_next/static/chunks/.%2e/.%2e/.%2e/inyectado-e.js/"></script>',
  'data: URI': '<script src="data:text/javascript,window.__pwn=%22data%22"></script>',
  'origen externo': '<script src="https://evil.example/x.js"></script>',
  'manejador onerror': '<img src="/no-existe.png" onerror="window.__pwn=\'onerror\'">',
};

async function injected(page: Page, path: string, html: string, { gadget = false } = {}) {
  const violations = await watchViolations(page);
  await page.route(/\/inyectado-[a-z]\.js\/?$/, (r) => r.fulfill({ contentType: 'application/javascript', body: 'window.__pwn="mismo-origen";' }));
  await page.route(/^https:\/\/evil\.example\//, (r) => r.fulfill({ contentType: 'application/javascript', body: 'window.__pwn="externo";' }));
  await page.route((url) => url.pathname === new URL(path, 'http://x').pathname, async (r) => {
    if (r.request().resourceType() !== 'document') return r.fallback();
    const res = await r.fetch();
    const headers = res.headers();
    let extra = html;
    if (gadget) {
      // Un script confiable con un «gadget» de DOM: crea <script> hacia fuera de la ruta.
      const code = "for (const u of ['https://evil.example/g.js','/inyectado-g.js']) { const s = document.createElement('script'); s.src = u; document.head.append(s); } window.__gadget = 1;";
      const csp = headers['content-security-policy'];
      const nonce = csp.match(/'nonce-([^']+)'/)?.[1];
      if (nonce) extra = `<script nonce="${nonce}">${code}</script>`;
      else {
        // Modo hash: se autoriza el gadget agregando SOLO su hash (simula un script propio con un defecto).
        headers['content-security-policy'] = csp.replace(/(script-src [^;]+)/, `$1 '${hashScript(code)}'`);
        extra = `<script>${code}</script>`;
      }
    }
    await r.fulfill({ response: res, headers, body: (await res.text()).replace('</body>', `${extra}</body>`) });
  });
  await page.goto(path, { waitUntil: 'networkidle' });
  return {
    pwn: await page.evaluate(() => (window as unknown as { __pwn?: string }).__pwn ?? null),
    gadget: await page.evaluate(() => (window as unknown as { __gadget?: number }).__gadget ?? 0),
    violations: await violations(),
    hydrated: await hydrated(page),
  };
}

test.describe('P4 / P11: el código inyectado no se ejecuta (modo hash y modo nonce)', () => {
  for (const [path, mode] of [['/es', 'hash'], ['/es/no-existe', 'nonce']] as const) {
    for (const [name, html] of Object.entries(INJECTIONS)) {
      test(`${mode}: ${name}`, async ({ page }, info) => {
        test.skip(info.project.name !== 'desktop');
        const r = await injected(page, path, html);
        expect(r.pwn).toBeNull();
        expect(r.violations.length).toBeGreaterThan(0);
        expect(r.hydrated).toBe(true);
      });
    }
  }
});

test.describe('P12: un script confiable no puede cargar código fuera de la ruta (sin strict-dynamic)', () => {
  for (const [path, mode] of [['/es', 'hash'], ['/es/no-existe', 'nonce']] as const) {
    test(mode, async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop');
      const r = await injected(page, path, '', { gadget: true });
      expect(r.gadget).toBe(1); // el gadget sí corrió (está autorizado)…
      expect(r.pwn).toBeNull(); // …pero lo que intentó cargar no
      expect(r.violations.filter((v) => /evil\.example\/g\.js|inyectado-g\.js/.test(v))).toHaveLength(2);
    });
  }
});

test.describe('P13: ninguna URL bajo /_next/static/chunks/ redirige fuera del prefijo', () => {
  test('formas de URL que el navegador no normaliza', async ({ request }) => {
    const tails = ['', 'x/', 'x.js/', '/', '//evil.example/', '%2f%2fevil.example', '..%2f..%2f..%2fes', '..%2f..%2f..%2fes/', '..%5c..%5c..%5ces/', '..%252f..%252fes/', '%0d%0aLocation:%20/es', '\\\\evil.example/'];
    for (const t of tails) {
      const res = await request.get(`/_next/static/chunks/${t}`, { maxRedirects: 0 });
      const location = res.headers()['location'];
      if (location) expect(new URL(location, 'http://x').pathname, t).toMatch(/^\/_next\/static\/chunks(\/|$)/);
      expect([200, 308, 404], t).toContain(res.status());
    }
  });
});
