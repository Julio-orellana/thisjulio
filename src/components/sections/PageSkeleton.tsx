import { getTranslations } from 'next-intl/server';

export type PageKey = 'home' | 'work' | 'services' | 'about' | 'contact' | 'architecture' | 'blog' | 'legal';

/**
 * Esqueleto de ruta de la Feature 001 (spec R5): solo el título localizado.
 * El contenido de cada página llega en las features 002–005.
 */
export async function PageSkeleton({ page }: { page: PageKey }) {
  const t = await getTranslations('pages');
  return (
    <header className="wrap page-head">
      <h1 className="h1">{t(page)}</h1>
    </header>
  );
}

export async function pageTitle(locale: string, page: PageKey) {
  const t = await getTranslations({ locale, namespace: 'pages' });
  return t(page);
}
