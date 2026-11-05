import type { Metadata } from 'next';
import { PageSkeleton, pageTitle } from '@/components/sections/PageSkeleton';

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: await pageTitle(locale, 'about') };
}

export default function Page() {
  return <PageSkeleton page="about" />;
}
