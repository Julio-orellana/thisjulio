import type { Metadata } from 'next';
import { PageSkeleton, pageTitle } from '@/components/sections/PageSkeleton';

export async function generateMetadata({ params }: PageProps<'/[locale]/legal'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: await pageTitle(locale, 'legal') };
}

export default function Page() {
  return <PageSkeleton page="legal" />;
}
