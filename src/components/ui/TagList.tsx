/**
 * Lista de etiquetas (`.tags`). Dos variantes del diseño:
 * - `tag`: `.tag`, mono con borde (stack de un caso, tecnologías);
 * - `chip`: `.chip-s` (partes de una capa en Inicio, `Deploy`).
 */
export function TagList({ items, variant = 'tag' }: { items: readonly string[]; variant?: 'tag' | 'chip' }) {
  const cls = variant === 'chip' ? 'chip-s' : 'tag';
  return (
    <div className="tags">
      {items.map((item) => (
        <span key={item} className={cls}>
          {item}
        </span>
      ))}
    </div>
  );
}
