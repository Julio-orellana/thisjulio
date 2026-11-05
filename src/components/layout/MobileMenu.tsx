'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { site } from '@/config/site';
import { isActive, primaryNav } from './nav-items';

/**
 * Botón Menú/Cerrar y hoja móvil (`.nav-menu-btn`, `.nav-sheet`), visibles
 * por debajo de 1040 px. Sin enlace a Arquitectura (D-04).
 */
export function MobileMenu() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetId = useId();

  // Cerrar al navegar a otra ruta.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        className="btn btn-ghost btn-sm nav-menu-btn"
        type="button"
        aria-expanded={open}
        aria-controls={sheetId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? t('menuClose') : t('menuOpen')}
      </button>
      <div id={sheetId} className={`nav-sheet${open ? ' open' : ''}`} hidden={!open}>
        <nav aria-label={t('mobileLabel')}>
          {primaryNav.map(({ key, href }) => {
            const on = isActive(pathname, href);
            return (
              <Link
                key={key}
                href={href}
                className={`nav-sheet-link${on ? ' on' : ''}`}
                aria-current={on ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>
        <div className="stack-2 nav-sheet-foot">
          <Link className="btn btn-primary" href="/estimate" onClick={() => setOpen(false)}>
            {t('cta')}
          </Link>
          {site.showAvailabilityStatus && (
            <span className="status mono">
              <span className="status-dot" aria-hidden="true" />
              {t('status')}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
