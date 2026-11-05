import type { Metadata } from 'next';
import { PageSkeleton, pageTitle } from '@/components/sections/PageSkeleton';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: await pageTitle(locale, 'services') };
}

export default function Page() {
  return <PageSkeleton page="services" />;
}
