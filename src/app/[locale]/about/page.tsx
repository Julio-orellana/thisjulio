import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageTitle } from '@/components/sections/PageSkeleton';
import { AboutView } from '@/components/sections/about/AboutView';
import { isLocale, routing } from '@/i18n/routing';

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: await pageTitle(locale, 'about'), description: t('meta.description') };
}

export default async function Page({ params }: PageProps<'/[locale]/about'>) {
  const { locale } = await params;
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale(locale);
  return <AboutView locale={isLocale(locale) ? locale : routing.defaultLocale} />;
}
