import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site } from '@/config/site';
import { slugPairs } from '@/lib/content';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';

/** Navegación fiel a `Nav.dc.html` + selector ES | EN (D-05). */
export async function Nav() {
  const t = await getTranslations('nav');
  const common = await getTranslations('common');
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link className="wordmark" href="/" aria-label={common('brandHome')}>
          {common('brand')}
        </Link>
        <NavLinks />
        <div className="nav-right">
          {site.showAvailabilityStatus && (
            <span className="status nav-status mono">
              <span className="status-dot" aria-hidden="true" />
              {t('status')}
            </span>
          )}
          <LocaleSwitcher slugPairs={slugPairs()} />
          <Link className="btn btn-primary btn-sm nav-cta" href="/estimate">
            {t('cta')}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
