import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { type CspManifest, loadCspManifest, routeKey } from './lib/security/csp-manifest';
import { buildCsp, createNonce, SCRIPT_PATH } from './lib/security/headers';
import { parseSiteOrigin } from './lib/security/origin';

const handleI18nRouting = createMiddleware(routing);
const isDev = process.env.NODE_ENV === 'development';

// Origen fijado al construir (next.config.ts, `env`), nunca del encabezado Host.
const origin = parseSiteOrigin(process.env.SITE_ORIGIN);

let manifest: CspManifest | undefined;
/** El manifiesto se lee una vez. Si falta o es de otro build, la petición falla (500): no hay CSP de repuesto. */
function cspManifest(): CspManifest {
  manifest ??= loadCspManifest(SCRIPT_PATH);
  return manifest;
}

/** CSP de hashes para una ruta prerenderizada, o `null` si la ruta no está en el manifiesto. */
function hashCspFor(key: string): string | null {
  if (isDev) return null; // `next dev` no prerenderiza: siempre nonce (plan 001 §6.4).
  const entry = cspManifest().routes[key];
  return entry ? buildCsp({ origin, mode: { kind: 'hash', hashes: entry.hashes }, isDev }) : null;
}

/**
 * Proxy (Next 16; antes «middleware»). ADR 006:
 * - páginas prerenderizadas → CSP de hashes de esa página (fija por build, cacheable);
 * - rutas dinámicas → CSP con nonce nuevo, que Next aplica a sus scripts;
 * - redirecciones → CSP de hashes sin ningún hash (la más estricta);
 * - rutas con extensión (archivos públicos o el 404 interno de Next) → la CSP
 *   sin hashes, sin pasar por el enrutamiento de idioma. Ese 404 interno usa
 *   estilos en línea que no se autorizan: se ve sin estilos, pero no ejecuta
 *   nada (antes se servía sin ninguna CSP).
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (/\.[^/]+$/.test(pathname)) {
    const response = NextResponse.next();
    // Archivo público o el 404 interno de Next: ningún script ni estilo en línea se autoriza.
    response.headers.set('Content-Security-Policy', noScriptCsp());
    return response;
  }

  const nonce = createNonce();
  const nonceCsp = buildCsp({ origin, mode: { kind: 'nonce', nonce }, isDev });
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  // Si la ruta se renderiza en esta petición, Next lee el nonce de aquí.
  headers.set('Content-Security-Policy', nonceCsp);

  const response = handleI18nRouting(new NextRequest(request, { headers }));

  if (response.status >= 300 && response.status < 400) {
    response.headers.set('Content-Security-Policy', noScriptCsp());
    return response;
  }
  // next-intl reescribe la ruta pública a la interna (/es/trabajo → /es/work), que es la clave del build.
  const rewrite = response.headers.get('x-middleware-rewrite');
  const internal = rewrite ? new URL(rewrite).pathname : pathname;
  response.headers.set('Content-Security-Policy', hashCspFor(routeKey(internal)) ?? nonceCsp);
  return response;
}

function noScriptCsp(): string {
  return buildCsp({ origin, mode: { kind: 'hash', hashes: [] }, isDev });
}

export const config = {
  // Todo excepto los archivos internos de Next y la API. Las rutas con extensión
  // entran para que también el 404 estático lleve CSP (antes quedaba sin ella).
  matcher: [
    {
      source: '/((?!api|_next/|_vercel).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
