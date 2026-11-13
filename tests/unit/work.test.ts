import { describe, expect, it } from 'vitest';
import { filterItems } from '@/components/sections/work/filter';
import { getProjectCategories, getProjects } from '@/lib/content';

// T9: filtro de Trabajo (CA-11) con datos de prueba de ≥ 2 categorías, y
// regla DA-4 (sin filtro con < 2 categorías aprobadas) con el contenido real.
const fixture = [
  { id: 'a', categories: ['pos'] },
  { id: 'b', categories: ['web'] },
  { id: 'c', categories: ['web', 'dashboard'] },
];

describe('filterItems', () => {
  it('«todos» devuelve todo, en orden', () => {
    expect(filterItems(fixture, 'all').map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });
  it('una categoría devuelve solo sus proyectos (también los de varias categorías)', () => {
    expect(filterItems(fixture, 'web').map((x) => x.id)).toEqual(['b', 'c']);
    expect(filterItems(fixture, 'dashboard').map((x) => x.id)).toEqual(['c']);
  });
  it('una categoría sin proyectos devuelve vacío', () => {
    expect(filterItems(fixture, 'api')).toEqual([]);
  });
});

describe('Trabajo con el contenido real (DA-4)', () => {
  it('hay una sola categoría aprobada: la página no muestra filtro', () => {
    // Si esto falla porque Julio aprobó otra categoría: conectar la isla
    // `WorkGallery` en `WorkView` (ver su comentario) y actualizar esta prueba.
    expect(getProjectCategories(), 'conectar WorkGallery en WorkView (DA-4)').toEqual(['pos']);
    expect(getProjects('es')).toHaveLength(1);
  });
});
