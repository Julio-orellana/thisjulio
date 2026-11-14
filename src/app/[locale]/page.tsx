import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeView } from '@/components/sections/home/HomeView';
import { JsonLd } from '@/components/seo/JsonLd';
import { isLocale, routing } from '@/i18n/routing';
import { pageMetadata, siteOrigin } from '@/lib/seo/metadata';
import { structuredData } from '@/lib/seo/routes';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return pageMetadata({ locale, route: { pathname: '/' }, description: t('meta.description') });
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale(locale);
  const shown = isLocale(locale) ? locale : routing.defaultLocale;
  return (
    <>
      {/* Datos estructurados del sitio (P-47): solo en Inicio. */}
      <JsonLd data={structuredData(siteOrigin(), shown)} />
      <HomeView locale={shown} />
    </>
  );
}
