import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SiteDocument } from '@/components/layout/SiteDocument';
import { routing } from '@/i18n/routing';
import '../globals.css';

// Páginas públicas estáticas (T18, ADR 006): se generan en el build para los
// dos idiomas. Su CSP es de hashes por página (scripts/csp-manifest.mjs); las
// rutas que no se generan aquí (el 404 y futuras rutas con datos) son
// dinámicas y con nonce. Sin ISR: `revalidate` no se declara en ninguna ruta.
//
// Un idioma que no está en la lista no existe como ruta (P-16): `/foto.png`
// no se renderiza como `[locale]=foto.png` (que además se guardaba en la
// caché del build, una entrada por URL inventada) sino que cae en el 404
// global. El `notFound()` de abajo queda como defensa.
export const dynamicParams = false;

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
  return <SiteDocument locale={locale}>{children}</SiteDocument>;
}
