import { readdirSync } from 'node:fs';
import { expect, test, type APIResponse } from '@playwright/test';

/**
 * Feature 006 · T14 (ASVS 5.0, P-49 = A; CA-10 y CA-12 f en su parte local): encabezados por tipo de respuesta
 * contra `next start`. Detrás del CDN del hosting se repite en la T10. Solo peticiones HTTP: basta un proyecto.
 *
 * Dos brechas conocidas quedan fijadas aquí para que no se olviden ni crezcan (`auditoria-seguridad.md` §4):
 * - T14-1 (P-59): las rutas que empiezan por `/api`, `/_vercel` o `/_next/` no pasan por el proxy, y su 404 en HTML
 *   (con los scripts del sitio) sale sin CSP;
 * - T14-2: la redirección de barra final que hace Next sale sin los encabezados de `next.config.ts`.
 */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'peticiones HTTP: un solo proyecto'));

const STATIC_HEADERS = {
  'strict-transport-security': 'max-age=63072000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'cross-origin-opener-policy': 'same-origin',
  'x-frame-options': 'DENY',
};

const chunk = `/_next/static/chunks/${readdirSync('.next/static/chunks').find((f) => f.endsWith('.js'))}`;
const font = `/_next/static/media/${readdirSync('.next/static/media').find((f) => f.endsWith('.woff2'))}`;

const RESPONSES = [
  { name: 'página estática', path: '/es', status: 200, csp: 'hash' },
  { name: 'página estática en inglés', path: '/en/work', status: 200, csp: 'hash' },
  { name: '404 propio', path: '/es/no-existe', status: 404, csp: 'nonce' },
  { name: '404 con extensión', path: '/foto.png', status: 404, csp: 'nonce' },
  { name: 'redirección de idioma', path: '/', status: 307, csp: 'sin-scripts' },
  { name: 'robots.txt', path: '/robots.txt', status: 200, csp: 'nonce' },
  { name: 'sitemap.xml', path: '/sitemap.xml', status: 200, csp: 'nonce' },
  { name: 'chunk de JavaScript', path: chunk, status: 200, csp: 'ninguna' },
  { name: 'fuente', path: font, status: 200, csp: 'ninguna' },
  { name: 'página solo de desarrollo', path: '/es/sistema', status: 404, csp: 'nonce' },
  { name: 'carpeta .git', path: '/.git/config', status: 307, csp: 'sin-scripts' },
  { name: 'listado de estáticos (ASVS 13.4.3)', path: '/_next/static', status: 404, csp: 'ninguna' },
  // T14-1 (P-59): sin proxy, sin CSP. Si se corrige el matcher, pasan a 'nonce' y esta lista se actualiza.
  { name: 'ruta /api (brecha T14-1)', path: '/api/x', status: 404, csp: 'ninguna' },
  { name: 'ruta /_vercel (brecha T14-1)', path: '/_vercel/x', status: 404, csp: 'ninguna' },
  { name: 'ruta /_next/ que no es un archivo (brecha T14-1)', path: '/_next/zz', status: 404, csp: 'ninguna' },
] as const;

function check(r: APIResponse, expected: (typeof RESPONSES)[number]) {
  const h = r.headers();
  const problems: string[] = [];
  if (r.status() !== expected.status) problems.push(`estado ${r.status()}`);
  for (const [k, v] of Object.entries(STATIC_HEADERS)) if (h[k] !== v) problems.push(`${k}: ${h[k] ?? 'ausente'}`);
  if (!/camera=\(\)/.test(h['permissions-policy'] ?? '')) problems.push('permissions-policy');
  for (const k of ['set-cookie', 'x-powered-by', 'access-control-allow-origin']) if (h[k] !== undefined) problems.push(`${k} presente`);
  const csp = h['content-security-policy'];
  if (expected.csp === 'ninguna') {
    if (csp !== undefined) problems.push('CSP inesperada (¿se corrigió T14-1? actualizar la lista)');
  } else if (!csp) {
    problems.push('sin CSP');
  } else {
    for (const d of ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'"]) if (!csp.includes(d)) problems.push(`CSP sin ${d}`);
    if (/unsafe-inline|unsafe-eval|strict-dynamic/.test(csp)) problems.push('CSP con unsafe-* o strict-dynamic');
    const script = csp.match(/script-src ([^;]+)/)![1];
    if (expected.csp === 'hash' && !/'sha256-/.test(script)) problems.push('sin hashes');
    if (expected.csp === 'nonce' && !/'nonce-/.test(script)) problems.push('sin nonce');
    if (expected.csp === 'sin-scripts' && /'sha256-|'nonce-/.test(script)) problems.push('la redirección autoriza scripts');
  }
  return problems;
}

test.describe('T14 · encabezados por tipo de respuesta', () => {
  for (const expected of RESPONSES) {
    test(`${expected.name}: ${expected.path}`, async ({ request }) => {
      const r = await request.get(expected.path, { maxRedirects: 0 });
      expect(check(r, expected)).toEqual([]);
    });
  }

  test('las respuestas con nonce no se cachean y cada una trae uno nuevo (parte local de CA-12 b)', async ({ request }) => {
    const nonces = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const h = (await request.get('/es/no-existe')).headers();
      expect(h['cache-control']).toMatch(/no-store/);
      nonces.add(h['content-security-policy'].match(/'nonce-([^']+)'/)![1]);
    }
    expect(nonces.size).toBe(3);
  });

  test('T14-2 (conocida): la redirección de barra final sale sin encabezados de seguridad', async ({ request }) => {
    const r = await request.get('/es/', { maxRedirects: 0 });
    expect(r.status()).toBe(308);
    expect(r.headers()['location']).toBe('/es');
    // Si Next o el hosting empiezan a ponerlos, esta prueba avisa para cerrar T14-2.
    expect(r.headers()['strict-transport-security']).toBeUndefined();
  });
});

test.describe('T14 · redirecciones y origen (ASVS 3.7.2; parte local de CA-12 f)', () => {
  const tricks = ['//evil.example', '//evil.example/', '/%2F%2Fevil.example/', '/\\evil.example', '/%5Cevil.example/', '/es//evil.example/', '/https:evil.example/'];
  for (const path of tricks) {
    test(`ninguna redirección sale del sitio: ${path}`, async ({ request, baseURL }) => {
      // URL completa: con una ruta como `//evil.example`, Playwright la leería como otro host y saldría del sitio.
      const r = await request.get(`${new URL(baseURL!).origin}${path}`, { maxRedirects: 0 });
      const location = r.headers()['location'];
      if (location !== undefined) {
        // Relativa y de una sola barra: el navegador no puede leerla como otro host.
        expect(location).toMatch(/^\/(?![/\\])/);
        expect(new URL(location, 'http://localhost:3100').host).toBe('localhost:3100');
      }
    });
  }

  test('un Host o X-Forwarded-Host falso no cambia la CSP ni el destino', async ({ request }) => {
    for (const headers of [{ host: 'evil.example' }, { 'x-forwarded-host': 'evil.example' }] as Record<string, string>[]) {
      for (const path of ['/', '/es', '/es/no-existe']) {
        const r = await request.get(path, { headers, maxRedirects: 0 });
        const h = r.headers();
        expect(h['content-security-policy']).toContain('script-src http://localhost:3100/_next/static/chunks/');
        expect(h['content-security-policy']).not.toContain('evil.example');
        if (h['location']) expect(h['location']).not.toContain('evil.example');
      }
    }
  });

  test('sin CORS: un Origin ajeno no recibe Access-Control-Allow-Origin', async ({ request }) => {
    const r = await request.get('/es', { headers: { origin: 'https://evil.example' } });
    expect(r.headers()['access-control-allow-origin']).toBeUndefined();
  });
});

test.describe('T14 · errores sin información interna (ASVS 16.5.1, 13.4.4)', () => {
  test('el 404 refleja la ruta solo codificada (ASVS 1.2.1, 1.2.3)', async ({ request, baseURL }) => {
    // El selector de idioma del 404 enlaza a la misma ruta en el otro idioma, y la carga RSC la lleva: se comprueba
    // que una ruta con HTML o JavaScript nunca sale como marcado.
    const payloads = [
      '/es/%3Cscript%3Ealert(1)%3C%2Fscript%3E',
      '/es/%22%3E%3Csvg%20onload%3Dalert(1)%3E',
      "/es/'%20onmouseover='alert(1)",
      '/es/x%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E.png',
      '/api/%3Cscript%3Ealert(1)%3C%2Fscript%3E',
    ];
    for (const path of payloads) {
      const r = await request.get(`${new URL(baseURL!).origin}${path}`);
      expect(r.status(), path).toBe(404);
      const body = await r.text();
      expect(body, path).not.toMatch(/<script>alert|<svg[^>]*onload|<img[^>]*onerror|\sonmouseover=/i);
    }
  });

  test('TRACE no devuelve eco ni trazas', async ({ request }) => {
    const r = await request.fetch('/es', { method: 'TRACE', headers: { 'x-zz-marca': 'eco' } });
    const body = await r.text();
    expect(r.status()).toBeGreaterThanOrEqual(400);
    expect(body).not.toMatch(/x-zz-marca|eco|\bat \w+ \(|node_modules|\/Users\//);
  });

  test('sin mapas de código fuente publicados', async ({ request }) => {
    expect(readdirSync('.next/static/chunks').filter((f) => f.endsWith('.map'))).toEqual([]);
    expect((await request.get(`${chunk}.map`)).status()).toBe(404);
  });
});
