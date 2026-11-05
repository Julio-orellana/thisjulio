import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PageSkeleton, pageTitle } from '@/components/sections/PageSkeleton';

export async function generateMetadata({ params }: PageProps<'/[locale]/estimate'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: await pageTitle(locale, 'estimate') };
}

export default async function Page({ params }: PageProps<'/[locale]/estimate'>) {
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale((await params).locale);
  return <PageSkeleton page="estimate" />;
}
