import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

/**
 * Feature 006 · T15 (CA-13): `/.well-known/security.txt` servido como pide la RFC 9116 (texto UTF-8), con los
 * encabezados de seguridad del sitio. El contenido se valida en `tests/unit/security-txt.test.ts`. Detrás del CDN
 * se repite en la T10. Solo peticiones HTTP: basta un proyecto.
 */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'desktop', 'peticiones HTTP: un solo proyecto'));

test('se sirve como text/plain UTF-8, igual al archivo del repositorio', async ({ request }) => {
  const r = await request.get('/.well-known/security.txt');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toMatch(/^text\/plain; charset=utf-8$/i);
  expect(await r.text()).toBe(readFileSync('public/.well-known/security.txt', 'utf8'));
});

test('lleva los encabezados de seguridad y una CSP, sin cookies', async ({ request }) => {
  const h = (await request.get('/.well-known/security.txt')).headers();
  expect(h['strict-transport-security']).toBe('max-age=63072000; includeSubDomains');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['set-cookie']).toBeUndefined();
});

test('no entra en el sitemap ni cambia robots.txt', async ({ request }) => {
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('security.txt');
  expect(await (await request.get('/robots.txt')).text()).not.toContain('security.txt');
});
