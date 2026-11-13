import type { ReactNode } from 'react';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { Link } from '@/i18n/navigation';
import type { AppHref } from './types';

/** Enlace de texto con flecha (`.link` del diseño: «More about me», «Explore the architectures»). */
export function ArrowLink({ href, children }: { href: AppHref; children: ReactNode }) {
  return (
    <Link className="link" href={href}>
      <span>{children}</span> <ArrowIcon />
    </Link>
  );
}
