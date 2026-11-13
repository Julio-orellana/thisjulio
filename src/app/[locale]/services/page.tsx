import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageTitle } from '@/components/sections/PageSkeleton';
import { ServicesView } from '@/components/sections/services/ServicesView';
import { isLocale, routing } from '@/i18n/routing';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });
  return { title: await pageTitle(locale, 'services'), description: t('meta.description') };
}

/** `/servicios` · `/services`: la página con el servicio 01 (spec 002 §3.4). */
export default async function Page({ params }: PageProps<'/[locale]/services'>) {
  const { locale } = await params;
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale(locale);
  return <ServicesView locale={isLocale(locale) ? locale : routing.defaultLocale} />;
}
