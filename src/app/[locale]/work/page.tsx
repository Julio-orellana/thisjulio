import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageTitle } from '@/components/sections/PageSkeleton';
import { WorkView } from '@/components/sections/work/WorkView';
import { isLocale, routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/work'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'work' });
  return pageMetadata({ locale, route: { pathname: '/work' }, title: await pageTitle(locale, 'work'), description: t('meta.description') });
}

export default async function Page({ params }: PageProps<'/[locale]/work'>) {
  const { locale } = await params;
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale(locale);
  return <WorkView locale={isLocale(locale) ? locale : routing.defaultLocale} />;
}
