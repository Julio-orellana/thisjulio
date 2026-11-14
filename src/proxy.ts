import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { LOCALE_HINT_HEADER, localeFromPathname } from './i18n/locale-hint';
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
 * - todo lo demás → CSP con nonce nuevo, que Next aplica a sus scripts. Incluye
 *   el 404 global (P-16), que se renderiza por petición para cualquier URL que
 *   no es una ruta, tenga extensión o no (`/es/no-existe`, `/foto.png`);
 * - redirecciones → CSP de hashes sin ningún hash (la más estricta).
 * Las rutas con extensión no pasan por el enrutamiento de idioma: `/foto.png`
 * es un 404, no una redirección a `/es/foto.png`.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = createNonce();
  const nonceCsp = buildCsp({ origin, mode: { kind: 'nonce', nonce }, isDev });
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  // Si la ruta se renderiza en esta petición, Next lee el nonce de aquí.
  headers.set('Content-Security-Policy', nonceCsp);
  // Idioma de la URL para el 404 global; nunca el que mande el navegador.
  const locale = localeFromPathname(pathname);
  if (locale) headers.set(LOCALE_HINT_HEADER, locale);
  else headers.delete(LOCALE_HINT_HEADER);

  if (/\.[^/]+$/.test(pathname)) {
    // Archivo público o 404 global: sin enrutamiento de idioma.
    const response = NextResponse.next({ request: { headers } });
    response.headers.set('Content-Security-Policy', nonceCsp);
    return response;
  }

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
  // Todo excepto los archivos reales de Next (`/_next/static/`) y su optimizador de
  // imágenes (`/_next/image`), que no son documentos. P-59 = A (feature 006, T14-1): antes
  // quedaban fuera también `/api*`, `/_vercel*` y el resto de `/_next/*`, y su 404 en HTML
  // salía sin CSP. Las rutas con extensión entran para que también su 404 lleve CSP con
  // nonce (P-16).
  // Las precargas (prefetch) también entran (P-16): sin el proxy, next-intl no
  // reescribe `/es/trabajo` → `/es/work` y la precarga de toda ruta en español
  // respondía 404. Con el 404 global, esas respuestas quedaban abiertas en el
  // navegador. Pasar por el proxy solo agrega encabezados: no relaja nada.
  matcher: ['/((?!_next/static/|_next/image).*)'],
};
