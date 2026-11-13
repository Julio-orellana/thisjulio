import { getTranslations } from 'next-intl/server';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { Quote, signature } from '@/components/ui';
import { site } from '@/config/site';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getAbout } from '@/lib/content';

/**
 * Acerca de (`About.dc.html`). Se muestra solo lo confirmado (P-20): quién
 * soy, qué construyo, filosofía, método de trabajo y GitHub (`site.ts`).
 * Omitido sin marcador visible hasta que Julio lo entregue o apruebe: retrato,
 * CV en PDF y LinkedIn (P-11, D-12); especialidades técnicas y tecnologías
 * (P-20). Sin retrato, el bloque superior va en una columna (DA-7).
 */
export async function AboutView({ locale }: { locale: Locale }) {
  const t = await getTranslations('about');
  const cta = await getTranslations('cta');
  const about = getAbout(locale);
  return (
    <>
      <div className="wrap">
        <header className="page-head page-head-tight">
          <h1 className="h1">{t.rich('title', signature)}</h1>
        </header>
        <div className="about-top solo">
          <div className="stack-4">
            <div className="stack-2">
              <h2 className="mono">{t('who')}</h2>
              <p className="lead prose">{about.who}</p>
            </div>
            <div className="stack-2">
              <h2 className="mono">{t('what')}</h2>
              <p className="lead prose">{about.what}</p>
            </div>
            <div className="actions">
              <a className="btn btn-ghost" href={site.githubUrl} rel="noopener noreferrer">
                {t('github')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="section band" aria-labelledby="h-phil">
        <div className="wrap stack-3">
          <h2 id="h-phil" className="mono">
            {t('philosophy')}
          </h2>
          <Quote>{about.philosophy}</Quote>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="h-method">
        <div className="grid-2">
          <div className="stack-3">
            <h2 id="h-method" className="h2">
              {t('method')}
            </h2>
            <ol className="spec-list">
              {about.method.map((m) => (
                <li key={m.id} className="method-item">
                  <span className="mono method-n">{m.n}</span>
                  <span>
                    <span className="method-title">{m.title}</span>
                    <span className="muted small">{m.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="rule" aria-labelledby="h-cta">
        <div className="wrap section final">
          <h2 id="h-cta" className="h1">
            {t('final.title')}
          </h2>
          <div className="actions">
            <Link className="btn btn-primary" href="/estimate">
              {cta('startProject')} <ArrowIcon />
            </Link>
            <Link className="btn btn-ghost" href="/contact">
              {cta('contactMe')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
