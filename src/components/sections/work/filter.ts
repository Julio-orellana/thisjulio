/** Proyectos visibles con un filtro ('all' = todos), en su orden. Pura: la usa la isla y la prueba unitaria. */
export function filterItems<T extends { categories: readonly string[] }>(items: readonly T[], filter: string): T[] {
  return filter === 'all' ? [...items] : items.filter((p) => p.categories.includes(filter));
}
