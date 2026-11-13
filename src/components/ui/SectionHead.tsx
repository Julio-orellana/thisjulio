import type { ReactNode } from 'react';

/**
 * Encabezado de sección (`.sec-head` de `Main.dc.html`): título h2 con id para
 * `aria-labelledby` y, opcionalmente, una acción a la derecha (p. ej. `ArrowLink`).
 * `reveal` añade el revelado al desplazar (`.rv`, solo CSS).
 */
export function SectionHead({
  id,
  title,
  action,
  reveal = false,
}: {
  id: string;
  title: ReactNode;
  action?: ReactNode;
  reveal?: boolean;
}) {
  return (
    <div className={reveal ? 'sec-head rv' : 'sec-head'}>
      <h2 id={id} className="h2">
        {title}
      </h2>
      {action}
    </div>
  );
}
