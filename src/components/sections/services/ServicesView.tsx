import { getTranslations } from 'next-intl/server';
import { Deploy } from '@/components/deploy/Deploy';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { SectionHead, signature } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getProcess, getServices } from '@/lib/content';
import { ServiceScroll } from './ServiceScroll';

/**
 * Servicios (`Services.dc.html`). Un servicio visible a la vez; las pestañas y
 * «anterior/siguiente» son enlaces reales a `/servicios/<slug>` (DA-3, P-21):
 * funcionan sin JavaScript y el estado vive en la URL (sin `localStorage`).
 * `/servicios` muestra el 01. Servicio 07 sin monitoreo, cobertura ni tiempos
 * (P-22, DA-6). Todo el texto sale de `src/messages` y `src/content`.
 */
export async function ServicesView({ locale, slug }: { locale: Locale; slug?: string }) {
  const t = await getTranslations('services');
  const cta = await getTranslations('cta');
  const services = getServices(locale);
  const i = slug ? Math.max(0, services.findIndex((s) => s.slug === slug)) : 0;
  const s = services[i];
  const prev = i > 0 ? services[i - 1] : null;
  const next = services[(i + 1) % services.length];
  const href = (x: { slug: string }) => ({ pathname: '/services/[slug]' as const, params: { slug: x.slug } });

  return (
    <>
      <header className="wrap page-head page-head-tight">
        <h1 className="h1">{t.rich('title', signature)}</h1>
        <p className="lead prose head-lead">{t('lead')}</p>
      </header>

      <div id="sv-top" className="wrap sv">
        <nav id="sv-index" className="sv-index" aria-label={t('indexLabel')}>
          {services.map((x) => (
            <Link
              key={x.id}
              id={`sv-tab-${x.id}`}
              className={x.id === s.id ? 'sv-tab on' : 'sv-tab'}
              aria-current={x.id === s.id ? 'true' : undefined}
              href={href(x)}
              scroll={false}
            >
              <span className="mono">{x.n}</span>
              {x.short}
            </Link>
          ))}
        </nav>
        <section id="sv-panel" key={s.id} className="sv-panel" aria-labelledby="sv-title" tabIndex={-1}>
          <span className="sv-num">{s.n}</span>
          <h2 id="sv-title" className="h2 sv-title">
            {s.title}
          </h2>
          <div className="sv-body">
            <div className="stack-3">
              <p className="lead prose">{s.value}</p>
              <p className="muted">
                <span className="ink">{t('fit')}</span> {s.fit}
              </p>
              <div>
                <Link className="btn btn-primary" href="/estimate">
                  {cta('estimateThis')} <ArrowIcon />
                </Link>
              </div>
            </div>
            <div className="stack-2">
              <h3 className="mono">{t('gets')}</h3>
              <ul className="serv-list rule-bottom">
                {s.gets.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          </div>
          {s.deploy ? (
            <div className="stack-2 sv-deploy">
              <h3 className="h3">{t('deployTitle')}</h3>
              <Deploy />
            </div>
          ) : null}
          <div className="sv-nav">
            {prev ? (
              <Link className="link" href={href(prev)} scroll={false}>
                <span>{t('previous', { name: prev.short })}</span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            <Link className="link" href={href(next)} scroll={false}>
              <span>{t('next', { name: next.short })}</span> <ArrowIcon />
            </Link>
          </div>
        </section>
        <ServiceScroll id={s.id} deepLink={!!slug} />
      </div>

      <section className="section band" aria-labelledby="h-process">
        <div className="wrap">
          <SectionHead id="h-process" title={t.rich('process.title', signature)} />
          <ol className="process">
            {getProcess(locale).map((step) => (
              <li key={step.id} className="step stack-1">
                <span className="mono">{step.n}</span>
                <h3 className="h3">{step.title}</h3>
                <p className="muted small step-text">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="h-own">
        <div className="own">
          <h2 id="h-own" className="h2">
            {t('own.title')}
          </h2>
          <p className="lead">{t('own.text')}</p>
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
            <Link className="btn btn-ghost" href="/architecture">
              {cta('seeHowBuilt')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
