import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PageSkeleton, pageTitle } from '@/components/sections/PageSkeleton';

export async function generateMetadata({ params }: PageProps<'/[locale]/work'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: await pageTitle(locale, 'work') };
}

export default async function Page({ params }: PageProps<'/[locale]/work'>) {
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale((await params).locale);
  return <PageSkeleton page="work" />;
}
