/**
 * Encabezados de seguridad (SECURITY.md §3, spec 001 R6).
 * Funciones puras para poder probarlas sin servidor.
 */

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/**
 * CSP con nonce por petición. Next.js lee el nonce de este encabezado y lo
 * aplica a sus propios scripts y estilos (requiere renderizado dinámico).
 * `unsafe-eval` y estilos en línea solo en desarrollo (React y HMR).
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? ` 'unsafe-eval'` : ''}`,
    // En desarrollo, Turbopack/HMR inyecta estilos en línea sin nonce. Un nonce
    // anula 'unsafe-inline', así que en desarrollo se usa solo 'unsafe-inline'.
    // Producción: únicamente nonce (verificado sin errores de CSP, CA-11).
    isDev ? `style-src 'self' 'unsafe-inline'` : `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `connect-src 'self'${isDev ? ' ws:' : ''}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,
  ];
  if (!isDev) directives.push('upgrade-insecure-requests');
  return directives.join('; ');
}

/** Encabezados estáticos, aplicados a todas las rutas desde next.config.ts. */
export const staticSecurityHeaders: { key: string; value: string }[] = [
  // Sin `preload`: comprometería el dominio entero (SECURITY.md §3).
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), midi=(), interest-cohort=(), browsing-topics=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
];
