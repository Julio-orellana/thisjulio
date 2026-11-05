'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { isActive, primaryNav } from './nav-items';

/** Enlaces del menú principal en escritorio (`.nav-links`). */
export function NavLinks() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  return (
    <nav className="nav-links" aria-label={t('primaryLabel')}>
      {primaryNav.map(({ key, href }) => {
        const on = isActive(pathname, href);
        return (
          <Link key={key} href={href} className={`nav-link${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
