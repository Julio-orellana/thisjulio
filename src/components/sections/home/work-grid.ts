/**
 * Clase de la rejilla de trabajo de Inicio (decisión de Julio en ▲A4,
 * 2026-11-12): con un solo proyecto publicado, su tarjeta ocupa el ancho
 * completo (`.work-grid.single`); con 2 o más, las 3 columnas del diseño.
 * Pura: la usan `HomeView` y las pruebas (unitaria y e2e con datos de prueba).
 */
export function workGridClass(projects: number): string {
  return projects === 1 ? 'work-grid single' : 'work-grid';
}
