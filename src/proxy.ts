import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { buildCsp, createNonce } from './lib/security/headers';

const handleI18nRouting = createMiddleware(routing);

/**
 * Proxy (Next 16; antes «middleware»):
 * 1. genera un nonce y la CSP para esta petición;
 * 2. entrega la CSP a Next.js en los encabezados de la petición, para que
 *    aplique el nonce a sus scripts;
 * 3. delega el enrutamiento de idioma en next-intl (/ → /es, rutas localizadas);
 * 4. devuelve la CSP en la respuesta.
 */
export default function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp(nonce, process.env.NODE_ENV === 'development');

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);

  const response = handleI18nRouting(new NextRequest(request, { headers }));
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  // Todo excepto archivos internos de Next, la API y archivos con extensión.
  matcher: [
    {
      source: '/((?!api|_next|_vercel|.*\\..*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
