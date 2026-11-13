import type { ComponentProps } from 'react';

/**
 * Botón de filtro (`.chip` de `Work.dc.html`). Sin estado propio: quien lo usa
 * (la isla `WorkGallery`) decide `pressed`, que se expone con `aria-pressed`.
 * No usa hooks ni APIs del servidor, así que sirve en servidor y en cliente.
 */
export function Chip({ pressed = false, className, ...rest }: ComponentProps<'button'> & { pressed?: boolean }) {
  const cls = ['chip', pressed ? 'on' : '', className ?? ''].filter(Boolean).join(' ');
  return <button type="button" {...rest} className={cls} aria-pressed={pressed} />;
}
