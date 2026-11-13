import type { ReactNode } from 'react';

/**
 * Firma de marca «This» (D-13, P-22): en los mensajes se escribe
 * `<this>This</this> is …` y se pinta con `t.rich(key, signature)`. Es la única
 * palabra con acento de color (`.this`, REFERENCIA-DISENO §3).
 */
export const signature = {
  this: (chunks: ReactNode) => <span className="this">{chunks}</span>,
};
