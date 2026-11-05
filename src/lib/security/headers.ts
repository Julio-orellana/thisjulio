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

/** Única ruta desde la que se aceptan scripts externos (DECISION-CSP-RENDERING §11.2). */
export const SCRIPT_PATH = '/_next/static/chunks/';

const HASH = /^sha256-[A-Za-z0-9+/]{43}=$/;
const NONCE = /^[A-Za-z0-9+/]{22,}={0,2}$/;

/**
 * Modo de la CSP:
 * - `hash`: páginas generadas en el build. Los scripts en línea se autorizan por
 *   su SHA-256 (calculado del HTML real del build, scripts/csp-manifest.mjs).
 * - `nonce`: rutas dinámicas. Un nonce nuevo por respuesta; Next.js lo lee de la
 *   CSP de la petición y lo aplica a sus scripts y estilos.
 */
export type CspMode = { kind: 'hash'; hashes: readonly string[] } | { kind: 'nonce'; nonce: string };

/**
 * CSP de THIS JULIO (ADR 006). En las dos modalidades:
 * - scripts externos solo desde `<origen>/_next/static/chunks/`;
 * - sin `'self'` en `script-src` (permitiría cualquier JS del origen);
 * - sin `'strict-dynamic'` (confiaría en cualquier script creado por un script
 *   autorizado, hacia cualquier origen);
 * - sin `'unsafe-inline'` ni `'unsafe-eval'` fuera de `next dev`.
 * `unsafe-eval` (trazas de React) y estilos en línea (HMR de Turbopack) solo en
 * desarrollo (plan 001 §6.4).
 */
export function buildCsp({ origin, mode, isDev }: { origin: string; mode: CspMode; isDev: boolean }): string {
  if (mode.kind === 'hash') {
    for (const h of mode.hashes) if (!HASH.test(h)) throw new Error(`Hash de CSP inválido: ${h.slice(0, 20)}`);
  } else if (!NONCE.test(mode.nonce)) {
    throw new Error('Nonce de CSP inválido');
  }
  const scriptSources = [
    `${origin}${SCRIPT_PATH}`,
    ...(mode.kind === 'hash' ? mode.hashes.map((h) => `'${h}'`) : [`'nonce-${mode.nonce}'`]),
    ...(isDev ? [`'unsafe-eval'`] : []),
  ];
  const styleSrc = isDev
    ? // En desarrollo, Turbopack/HMR inyecta estilos en línea sin nonce. Un nonce
      // anula 'unsafe-inline', así que en desarrollo se usa solo 'unsafe-inline'.
      `style-src 'self' 'unsafe-inline'`
    : mode.kind === 'nonce'
      ? `style-src 'self' 'nonce-${mode.nonce}'`
      : // Las páginas estáticas no emiten estilos en línea (lo comprueba el manifiesto).
        `style-src 'self'`;
  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSources.join(' ')}`,
    styleSrc,
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
