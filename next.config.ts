import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { staticSecurityHeaders } from './src/lib/security/headers';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // La CSP con nonce exige renderizado dinámico; Cache Components (PPR) es
  // incompatible con ella según la guía de CSP de Next 16. Ver plan 001 §6.
  cacheComponents: false,
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
export default withNextIntl(nextConfig);
