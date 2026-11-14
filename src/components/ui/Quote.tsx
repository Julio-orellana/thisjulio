import type { ReactNode } from 'react';

/** Frase destacada (`.quote` de `About.dc.html`: «How I think about software»). */
export function Quote({ children }: { children: ReactNode }) {
  return <p className="quote">{children}</p>;
}
