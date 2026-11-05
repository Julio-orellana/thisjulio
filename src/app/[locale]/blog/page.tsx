import type { Metadata } from 'next';
import { PageSkeleton, pageTitle } from '@/components/sections/PageSkeleton';

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params;
  // El blog no se indexa hasta tener tres artículos aprobados (prompt §4.4).
  return { title: await pageTitle(locale, 'blog'), robots: { index: false, follow: false } };
}

export default function Page() {
  return <PageSkeleton page="blog" />;
}
