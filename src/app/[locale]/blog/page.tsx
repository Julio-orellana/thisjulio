import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PageSkeleton, pageTitle } from '@/components/sections/PageSkeleton';

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params;
  // El blog no se indexa hasta tener tres artículos aprobados (prompt §4.4).
  return { title: await pageTitle(locale, 'blog'), robots: { index: false, follow: false } };
}

export default async function Page({ params }: PageProps<'/[locale]/blog'>) {
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale((await params).locale);
  return <PageSkeleton page="blog" />;
}
