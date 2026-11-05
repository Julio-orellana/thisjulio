import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site } from '@/config/site';

/**
 * Footer fiel a `Footer.dc.html`. LinkedIn y correo se omiten hasta tener
 * datos reales (P-11, D-12). Sin enlace al blog (prompt §4.4).
 */
export async function Footer() {
  const t = await getTranslations('footer');
  const common = await getTranslations('common');
  const legal = [
    { key: 'top', hash: undefined },
    { key: 'licensing', hash: t('anchors.licensing') },
    { key: 'ip', hash: t('anchors.ip') },
    { key: 'privacy', hash: t('anchors.privacy') },
  ] as const;

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <Link className="wordmark" href="/">
            {common('brand')}
          </Link>
          <div className="footer-cols">
            <nav className="footer-col" aria-label={t('siteLabel')}>
              <Link href="/work">{t('work')}</Link>
              <Link href="/services">{t('services')}</Link>
              <Link href="/architecture">{t('architecture')}</Link>
            </nav>
            <nav className="footer-col" aria-label={t('startLabel')}>
              <Link href="/estimate">{t('estimate')}</Link>
              <Link href="/contact">{t('contact')}</Link>
              <Link href="/about">{t('about')}</Link>
            </nav>
            <nav className="footer-col" aria-label={t('elsewhereLabel')}>
              <a href={site.githubUrl} rel="noopener noreferrer">
                {t('github')}
              </a>
            </nav>
          </div>
        </div>
        <div className="footer-base mono">
          <span>{t('copyright', { year: new Date().getFullYear() })}</span>
          <nav className="footer-legal" aria-label={t('legalLabel')}>
            {legal.map(({ key, hash }) => (
              <Link key={key} href={hash ? { pathname: '/legal', hash } : '/legal'}>
                {t(`legal.${key}`)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
