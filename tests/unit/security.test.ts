import { describe, expect, it } from 'vitest';
import { buildCsp, createNonce, staticSecurityHeaders } from '@/lib/security/headers';

describe('CSP', () => {
  it('genera nonces distintos en cada llamada', () => {
    const a = createNonce();
    expect(a).not.toBe(createNonce());
    expect(a.length).toBeGreaterThanOrEqual(22);
  });

  it('producción: sin unsafe-inline ni unsafe-eval, con nonce y frame-ancestors none', () => {
    const csp = buildCsp('abc', false);
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).toContain("style-src 'self' 'nonce-abc'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('upgrade-insecure-requests');
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/);
  });

  it('desarrollo: unsafe-eval (trazas de React) y estilos en línea (HMR), nunca en producción', () => {
    const dev = buildCsp('abc', true);
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('HSTS sin preload (requiere aprobación)', () => {
    const hsts = staticSecurityHeaders.find((h) => h.key === 'Strict-Transport-Security');
    expect(hsts?.value).not.toContain('preload');
  });
});
