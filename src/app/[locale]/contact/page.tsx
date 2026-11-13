import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageTitle } from '@/components/sections/PageSkeleton';
import { ContactView } from '@/components/sections/contact/ContactView';
import { pageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return pageMetadata({ locale, route: { pathname: '/contact' }, title: await pageTitle(locale, 'contact'), description: t('meta.description') });
}

export default async function Page({ params }: PageProps<'/[locale]/contact'>) {
  // Renderizado estático con next-intl (T18): fija el idioma de esta petición.
  setRequestLocale((await params).locale);
  return <ContactView />;
}
