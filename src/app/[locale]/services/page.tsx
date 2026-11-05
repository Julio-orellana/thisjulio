import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PageSkeleton, pageTitle } from '@/components/sections/PageSkeleton';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: await pageTitle(locale, 'services') };
}

export default async function Page({ params }: PageProps<'/[locale]/services'>) {
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale((await params).locale);
  return <PageSkeleton page="services" />;
}
