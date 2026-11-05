import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants';
import createNextIntlPlugin from 'next-intl/plugin';
import { staticSecurityHeaders } from './src/lib/security/headers';
import { parseSiteOrigin } from './src/lib/security/origin';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Páginas públicas estáticas con CSP de hashes y rutas dinámicas con nonce
  // (ADR 006). Cache Components/PPR es incompatible con nonces según la guía de
  // CSP de Next 16, y las rutas con hashes no admiten ISR: se deja apagado.
  cacheComponents: false,
  // 404 propio para URL que no corresponden a ninguna ruta (P-16): el layout
  // raíz está bajo `[locale]`, que es el caso para el que Next documenta
  // `app/global-not-found.tsx`. Bandera experimental (ver ADR 006, P-16).
  experimental: { globalNotFound: true },
  // Página de muestra del sistema de diseño solo en desarrollo
  // (archivos `page.dev.tsx`); no existe en el build de producción.
  pageExtensions: isDev ? ['dev.tsx', 'tsx', 'ts'] : ['tsx', 'ts'],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: staticSecurityHeaders }];
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Origen del sitio para la CSP (ADR 006, decisión 8). Se valida al construir y
 * se fija en el build con `env`: el proxy lo recibe como constante y nunca lo
 * deduce del encabezado Host. Sin un valor válido, `next build` falla; no hay
 * valor por omisión que pudiera llegar a producción. En `next dev` se usa
 * http://localhost:3000 si no se define. `next start` usa lo fijado en el build.
 */
export default function config(phase: string): NextConfig {
  let siteOrigin: string | undefined;
  if (phase === PHASE_PRODUCTION_BUILD) siteOrigin = parseSiteOrigin(process.env.SITE_ORIGIN);
  if (phase === PHASE_DEVELOPMENT_SERVER) siteOrigin = parseSiteOrigin(process.env.SITE_ORIGIN ?? 'http://localhost:3000');
  return withNextIntl(siteOrigin ? { ...nextConfig, env: { SITE_ORIGIN: siteOrigin } } : nextConfig);
}
