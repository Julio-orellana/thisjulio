import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageTitle } from '@/components/sections/PageSkeleton';
import { LegalView } from '@/components/sections/legal/LegalView';
import { isLocale, routing } from '@/i18n/routing';

export async function generateMetadata({ params }: PageProps<'/[locale]/legal'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  return { title: await pageTitle(locale, 'legal'), description: t('meta.description') };
}

export default async function Page({ params }: PageProps<'/[locale]/legal'>) {
  const { locale } = await params;
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale(locale);
  return <LegalView locale={isLocale(locale) ? locale : routing.defaultLocale} />;
}
