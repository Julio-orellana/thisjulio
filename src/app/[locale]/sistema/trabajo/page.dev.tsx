import { WorkGallery } from '@/components/sections/work/WorkGallery';
import type { WorkItemData } from '@/components/sections/work/WorkItem';

/**
 * Filtro de Trabajo con DATOS DE PRUEBA — SOLO DESARROLLO (spec 002 T9). No
 * existe en el build de producción ni sale de `src/content`: sirve para probar
 * la isla `WorkGallery` con ≥ 2 categorías mientras solo hay un proyecto
 * aprobado. Los nombres son genéricos a propósito (ningún proyecto real).
 */
const FIXTURE: WorkItemData[] = [
  { id: 'prueba-1', slug: 'sistema-pos-de-escritorio', n: '01', tag: 'POS', title: 'Prueba A', description: 'Datos de prueba.', plates: 'pos', categories: ['pos'] },
  { id: 'prueba-2', slug: 'sistema-pos-de-escritorio', n: '02', tag: 'Web', title: 'Prueba B', description: 'Datos de prueba.', plates: 'site', categories: ['web'] },
  { id: 'prueba-3', slug: 'sistema-pos-de-escritorio', n: '03', tag: 'Web + Panel', title: 'Prueba C', description: 'Datos de prueba.', plates: 'inst', categories: ['web', 'dashboard'] },
];

export default function WorkFilterLab() {
  return (
    <div className="wrap" data-lab="work-filter">
      <WorkGallery items={FIXTURE} categories={['web', 'dashboard', 'pos']} />
    </div>
  );
}
