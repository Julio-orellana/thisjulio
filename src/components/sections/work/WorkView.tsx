import { getTranslations } from 'next-intl/server';
import { signature } from '@/components/ui';
import type { Locale } from '@/i18n/routing';
import { getProjects } from '@/lib/content';
import { WorkItem, type WorkItemData } from './WorkItem';

/**
 * Trabajo (`Work.dc.html`). Solo proyectos `approved` (ADR 003, D-08): hoy, el
 * caso POS. Con menos de dos categorías aprobadas no hay filtro (DA-4, P-18):
 * la galería es HTML del servidor y el contador queda.
 *
 * La isla del filtro (`WorkGallery`, probada en `/sistema/trabajo` con datos de
 * prueba) NO se importa aquí: Next envía al navegador toda isla importada por
 * la página aunque no se pinte (medido: 4,9 KB, o 8,1 KB con `next/dynamic`).
 * Cuando Julio apruebe una segunda categoría, `tests/unit/work.test.ts` falla
 * y pide conectarla: `{categories.length >= 2 ? <WorkGallery … /> : …}`.
 */
export async function WorkView({ locale }: { locale: Locale }) {
  const t = await getTranslations('work');
  const items: WorkItemData[] = getProjects(locale).map((p) => ({
    id: p.id,
    slug: p.slug,
    n: p.n,
    tag: p.tag,
    title: p.title,
    description: p.description,
    plates: p.plates,
    categories: p.categories,
  }));

  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="h1">{t.rich('title', signature)}</h1>
      </header>
      <div className="gal-tools">
        <span className="mono" aria-live="polite">
          {t('count', { count: items.length })}
        </span>
      </div>
      <div className="gal">
        {items.map((item, i) => (
          <WorkItem key={item.id} item={item} flip={i % 2 === 1} meta={t('itemMeta', { n: item.n, tag: item.tag })} />
        ))}
      </div>
    </div>
  );
}
