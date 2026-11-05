/** Flecha del diseño (`M2 8h11M9 4l4 4-4 4`), decorativa. */
export function ArrowIcon({ strokeWidth = 1.5 }: { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true" focusable="false">
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}
