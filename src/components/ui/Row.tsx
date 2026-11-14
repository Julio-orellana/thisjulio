import type { ReactNode } from 'react';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { Link } from '@/i18n/navigation';
import type { AppHref } from './types';

/** Contenedor de filas (`.rows`). `reveal` añade `.rv`. */
export function Rows({ children, reveal = false }: { children: ReactNode; reveal?: boolean }) {
  return <div className={reveal ? 'rows rv' : 'rows'}>{children}</div>;
}

/** Fila numerada con enlace (`a.row` de `Main.dc.html`: servicios en Inicio). */
export function Row({ href, n, title, line }: { href: AppHref; n: string; title: string; line?: string }) {
  return (
    <Link className="row" href={href}>
      <span className="mono">{n}</span>
      <span className="h3">{title}</span>
      {line ? <span className="muted row-d">{line}</span> : null}
      <ArrowIcon />
    </Link>
  );
}
