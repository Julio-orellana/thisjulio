'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { filterItems } from './filter';
import { WorkItem, type WorkItemData } from './WorkItem';


/**
 * Isla de la galería de Trabajo con filtro por categoría (`Work.dc.html`):
 * chips con `aria-pressed` y contador `aria-live`. Solo se usa con ≥ 2
 * categorías aprobadas (DA-4); con menos, la página la pinta el servidor sin
 * JavaScript. La alternancia `flip` sigue el orden de lo visible, como el diseño.
 */
export function WorkGallery({ items, categories }: { items: WorkItemData[]; categories: string[] }) {
  const t = useTranslations('work');
  const [filter, setFilter] = useState('all');
  const shown = filterItems(items, filter);
  const options = ['all', ...categories];
  return (
    <>
      <div className="gal-tools">
        <div className="chips" role="group" aria-label={t('filterLabel')}>
          {options.map((id) => (
            <Chip key={id} pressed={filter === id} onClick={() => setFilter(id)}>
              {id === 'all' ? t('all') : t(`categories.${id}` as 'categories.pos')}
            </Chip>
          ))}
        </div>
        <span className="mono" aria-live="polite">
          {t('count', { count: shown.length })}
        </span>
      </div>
      <div className="gal">
        {shown.map((item, i) => (
          <WorkItem key={item.id} item={item} flip={i % 2 === 1} meta={t('itemMeta', { n: item.n, tag: item.tag })} />
        ))}
      </div>
    </>
  );
}
