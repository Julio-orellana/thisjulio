import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ServicesView } from '@/components/sections/services/ServicesView';
import { isLocale, routing } from '@/i18n/routing';
import { getService, listStaticParams } from '@/lib/content';
import { firstServiceRoute, pageMetadata, slugRoute } from '@/lib/seo/metadata';

// Una página estática por servicio e idioma (DA-3, P-21): 7 × 2 = 14 rutas con
// CSP de hashes (ADR 006). Un slug que no es de ese idioma (o no existe) no es
// una ruta: cae en el 404 global, renderizado en el servidor (P-16). Sin
// `revalidate`.
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { locale: string } }) {
  return listStaticParams('services')
    .filter((p) => p.locale === params.locale)
    .map(({ slug }) => ({ slug }));
}

function serviceOf(locale: string, slug: string) {
  return getService(isLocale(locale) ? locale : routing.defaultLocale, slug);
}

export async function generateMetadata({ params }: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = serviceOf(locale, slug);
  const route = slugRoute('/services/[slug]', locale, slug);
  if (!s || !route) return {};
  // El servicio 01 es el que muestra `/servicios`: su canonical apunta allí (002, limitación 6).
  const first = firstServiceRoute();
  const duplicate = 'slugs' in first && 'slugs' in route && first.slugs.es === route.slugs.es;
  return pageMetadata({ locale, route, title: s.title, description: s.value, canonical: duplicate ? { pathname: '/services' } : undefined });
}

export default async function Page({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  // Defensa: con `dynamicParams = false` un slug desconocido nunca llega aquí.
  if (!serviceOf(locale, slug)) notFound();
  return <ServicesView locale={isLocale(locale) ? locale : routing.defaultLocale} slug={slug} />;
}
