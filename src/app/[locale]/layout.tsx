import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { routing } from '@/i18n/routing';
import '../globals.css';

// Fuentes del diseño, autoalojadas (D-10). Pesos de site.css / DesignSystem.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Páginas públicas estáticas (T18, ADR 006): se generan en el build para los
// dos idiomas. Su CSP es de hashes por página (scripts/csp-manifest.mjs); las
// rutas que no se generan aquí (404, futuras rutas con datos) siguen
// dinámicas y con nonce. Sin ISR: `revalidate` no se declara en ninguna ruta.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale, namespace: 'common' });
  return {
    title: { template: `%s · ${t('brand')}`, default: t('brand') },
    // Prelanzamiento: nada se indexa hasta la feature 006.
    robots: { index: false, follow: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <html lang={locale} className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="site">
        <NextIntlClientProvider>
          <a className="btn btn-primary btn-sm skip-link" href="#contenido">
            {t('skipToContent')}
          </a>
          <Nav />
          <main id="contenido" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
