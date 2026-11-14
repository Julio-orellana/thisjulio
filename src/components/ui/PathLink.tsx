import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { Link } from '@/i18n/navigation';
import type { AppHref } from './types';

/** Camino de cierre (`.path-link` de `Main.dc.html`: «Get a quick estimate», «Talk to me directly»). */
export function PathLink({ href, title, text }: { href: AppHref; title: string; text: string }) {
  return (
    <Link className="path-link" href={href}>
      <span className="h3">{title}</span>
      <span className="muted small">{text}</span>
      <ArrowIcon />
    </Link>
  );
}
