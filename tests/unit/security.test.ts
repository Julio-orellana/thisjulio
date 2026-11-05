import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SCRIPT_PATH as SCAN_SCRIPT_PATH } from '../../scripts/lib/csp-scan.mjs';
import { CspManifestError, loadCspManifest, routeKey } from '@/lib/security/csp-manifest';
import { buildCsp, createNonce, SCRIPT_PATH, staticSecurityHeaders } from '@/lib/security/headers';
import { InvalidSiteOriginError, parseSiteOrigin } from '@/lib/security/origin';

const ORIGIN = 'https://thisjulio.com';
const H1 = 'sha256-' + 'A'.repeat(43) + '=';
const H2 = 'sha256-' + 'B'.repeat(43) + '=';
const scriptSrc = (csp: string) => csp.split('; ').find((d) => d.startsWith('script-src '))!;

describe('CSP (ADR 006)', () => {
  it('genera nonces distintos en cada llamada', () => {
    const a = createNonce();
    expect(a).not.toBe(createNonce());
    expect(a.length).toBeGreaterThanOrEqual(22);
  });

  it('modo hash (páginas estáticas): ruta de chunks + hashes, sin self, strict-dynamic ni unsafe-*', () => {
    const csp = buildCsp({ origin: ORIGIN, mode: { kind: 'hash', hashes: [H1, H2] }, isDev: false });
    expect(scriptSrc(csp)).toBe(`script-src https://thisjulio.com/_next/static/chunks/ '${H1}' '${H2}'`);
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain('nonce-');
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|strict-dynamic/);
    expect(scriptSrc(csp)).not.toContain("'self'");
    for (const d of ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'", 'upgrade-insecure-requests']) {
      expect(csp).toContain(d);
    }
  });

  it('modo nonce (rutas dinámicas): ruta de chunks + nonce, sin self ni strict-dynamic', () => {
    const csp = buildCsp({ origin: ORIGIN, mode: { kind: 'nonce', nonce: 'YWJjZGVmZ2hpamtsbW5vcA==' }, isDev: false });
    expect(scriptSrc(csp)).toBe("script-src https://thisjulio.com/_next/static/chunks/ 'nonce-YWJjZGVmZ2hpamtsbW5vcA=='");
    expect(csp).toContain("style-src 'self' 'nonce-YWJjZGVmZ2hpamtsbW5vcA=='");
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|strict-dynamic/);
  });

  it('redirecciones: modo hash sin hashes (ningún script en línea)', () => {
    expect(scriptSrc(buildCsp({ origin: ORIGIN, mode: { kind: 'hash', hashes: [] }, isDev: false }))).toBe(
      'script-src https://thisjulio.com/_next/static/chunks/',
    );
  });

  it('rechaza hashes o nonces mal formados (no se puede inyectar texto en el encabezado)', () => {
    expect(() => buildCsp({ origin: ORIGIN, mode: { kind: 'hash', hashes: ["sha256-x'; script-src *"] }, isDev: false })).toThrow();
    expect(() => buildCsp({ origin: ORIGIN, mode: { kind: 'nonce', nonce: "abc'; script-src *" }, isDev: false })).toThrow();
  });

  it('desarrollo: unsafe-eval (trazas de React) y estilos en línea (HMR), nunca en producción', () => {
    const dev = buildCsp({ origin: 'http://localhost:3000', mode: { kind: 'nonce', nonce: createNonce() }, isDev: true });
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).toContain("style-src 'self' 'unsafe-inline'");
    expect(scriptSrc(dev)).not.toMatch(/'self'|strict-dynamic/);
  });

  it('la ruta de scripts es la misma en el proxy y en el generador del manifiesto', () => {
    expect(SCRIPT_PATH).toBe('/_next/static/chunks/');
    expect(SCAN_SCRIPT_PATH).toBe(SCRIPT_PATH);
  });

  it('HSTS sin preload (requiere aprobación) y nosniff presente', () => {
    expect(staticSecurityHeaders.find((h) => h.key === 'Strict-Transport-Security')?.value).not.toContain('preload');
    expect(staticSecurityHeaders.find((h) => h.key === 'X-Content-Type-Options')?.value).toBe('nosniff');
  });
});

describe('SITE_ORIGIN (decisión 8)', () => {
  it('acepta https://<host> y http://localhost[:puerto]', () => {
    for (const ok of ['https://thisjulio.com', 'https://preview.thisjulio.com', 'http://localhost:3100', 'http://127.0.0.1:8080', 'http://localhost']) {
      expect(parseSiteOrigin(ok)).toBe(ok);
    }
  });

  it('rechaza ausencia, barra final, ruta, mayúsculas, http público, credenciales, comodines e inyección', () => {
    for (const bad of [
      undefined,
      '',
      'https://thisjulio.com/',
      'https://thisjulio.com/_next',
      'https://ThisJulio.com',
      'http://thisjulio.com',
      'https://user@thisjulio.com',
      'https://*.thisjulio.com',
      'https://thisjulio.com:443',
      "https://thisjulio.com 'unsafe-inline'",
      'https://thisjulio.com;script-src *',
      'thisjulio.com',
      'https://localhost',
      'http://localhost:99999',
    ]) {
      expect(() => parseSiteOrigin(bad), String(bad)).toThrow(InvalidSiteOriginError);
    }
  });
});

describe('carga del manifiesto en el proxy', () => {
  function dist(manifest: object | null, buildId = 'BUILD1234') {
    const d = mkdtempSync(join(tmpdir(), 'csp-'));
    writeFileSync(join(d, 'BUILD_ID'), buildId);
    if (manifest) writeFileSync(join(d, 'csp-manifest.json'), JSON.stringify(manifest));
    return d;
  }
  const good = { schema: 1, nextVersion: '16.4.5', buildId: 'BUILD1234', scriptPath: SCRIPT_PATH, routes: { '/es': { hashes: [H1] } } };

  it('lee un manifiesto válido', () => {
    expect(loadCspManifest(SCRIPT_PATH, dist(good)).routes['/es'].hashes).toEqual([H1]);
  });

  it('falla si falta, si es de otro build, si la ruta cambió o si un hash es inválido', () => {
    expect(() => loadCspManifest(SCRIPT_PATH, dist(null))).toThrow(CspManifestError);
    expect(() => loadCspManifest(SCRIPT_PATH, dist(good, 'OTROBUILD99'))).toThrow(/otro build/);
    expect(() => loadCspManifest(SCRIPT_PATH, dist({ ...good, scriptPath: '/_next/static/' }))).toThrow(/ruta/);
    expect(() => loadCspManifest(SCRIPT_PATH, dist({ ...good, routes: { '/es': { hashes: ['x'] } } }))).toThrow(/hashes/);
    expect(() => loadCspManifest(SCRIPT_PATH, dist({ ...good, routes: { '/es': { hashes: [] } } }))).toThrow(/hashes/);
  });

  it('normaliza la clave de ruta', () => {
    expect(routeKey('/es/work/')).toBe('/es/work');
    expect(routeKey('/')).toBe('/');
  });
});
