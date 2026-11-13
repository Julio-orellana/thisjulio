import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CaseView } from '@/components/sections/work/CaseView';
import { isLocale, routing } from '@/i18n/routing';
import { getProject, listStaticParams } from '@/lib/content';

// Una página estática por caso aprobado e idioma (hoy: el POS, 2 rutas) con
// CSP de hashes (ADR 006). Un slug de otro idioma, de un proyecto en borrador
// o inexistente no es una ruta: cae en el 404 global, renderizado en el
// servidor (P-16). Sin `revalidate`.
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { locale: string } }) {
  return listStaticParams('work')
    .filter((p) => p.locale === params.locale)
    .map(({ slug }) => ({ slug }));
}

function projectOf(locale: string, slug: string) {
  return getProject(isLocale(locale) ? locale : routing.defaultLocale, slug);
}

export async function generateMetadata({ params }: PageProps<'/[locale]/work/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = projectOf(locale, slug);
  return p ? { title: p.title, description: p.description } : {};
}

export default async function Page({ params }: PageProps<'/[locale]/work/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = projectOf(locale, slug);
  // Defensa: con `dynamicParams = false` un slug desconocido nunca llega aquí.
  if (!project) notFound();
  return <CaseView project={project} />;
}
