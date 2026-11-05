import { setRequestLocale } from 'next-intl/server';
import { PageSkeleton } from '@/components/sections/PageSkeleton';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale((await params).locale);
  return <PageSkeleton page="home" />;
}
