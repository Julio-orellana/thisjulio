import { Plates, type PlateKind } from '@/components/plates/Plates';
import { Link } from '@/i18n/navigation';

export type WorkItemData = {
  id: string;
  slug: string;
  n: string;
  tag: string;
  title: string;
  description: string;
  plates: PlateKind;
  categories: readonly string[];
};

/**
 * Tarjeta de la galería de Trabajo (`Work.dc.html` → `.gal-item`): vista
 * `Plates` ancha y metadatos. `flip` alterna el lado (2.ª, 4.ª…). No usa
 * hooks: la pinta el servidor y, cuando hay filtro, la isla `WorkGallery`.
 */
export function WorkItem({ item, meta, flip }: { item: WorkItemData; meta: string; flip: boolean }) {
  return (
    <Link
      className={flip ? 'gal-item hover-depth flip' : 'gal-item hover-depth'}
      href={{ pathname: '/work/[slug]', params: { slug: item.slug } }}
    >
      <div className="gal-view proj-view">
        <Plates kind={item.plates} wide />
      </div>
      <div className="gal-meta">
        <span className="mono">{meta}</span>
        <h2 className="proj-name">{item.title}</h2>
        <p className="muted small">{item.description}</p>
      </div>
    </Link>
  );
}
