import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageTitle } from '@/components/sections/PageSkeleton';
import { ArchitectureView } from '@/components/sections/architecture/ArchitectureView';
import { isLocale, routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/architecture'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'architecture' });
  return pageMetadata({ locale, route: { pathname: '/architecture' }, title: await pageTitle(locale, 'architecture'), description: t('lead') });
}

export default async function Page({ params }: PageProps<'/[locale]/architecture'>) {
  const { locale } = await params;
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale(locale);
  return <ArchitectureView locale={isLocale(locale) ? locale : routing.defaultLocale} />;
}
