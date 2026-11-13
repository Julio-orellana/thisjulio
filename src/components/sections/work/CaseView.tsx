import { getTranslations } from 'next-intl/server';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { Plates } from '@/components/plates/Plates';
import { Link } from '@/i18n/navigation';
import type { getProject } from '@/lib/content';

type Project = NonNullable<ReturnType<typeof getProject>>;

/**
 * Plantilla de caso de estudio (`CaseStudy.dc.html`), con SOLO los bloques que
 * tienen dato verificado (spec 002 §3.3). Para el caso POS (P-19, alternativa
 * A; fuente única `docs/portafolio/caso-pos.md`) se omiten, sin marcador
 * visible: año, rol y enlace (D-12); problema y solución (P-19); stack (P-19);
 * arquitecturas/`Deploy` (D-14); pantallas (P-03); resultados (sin cifras) y
 * «siguiente proyecto» (hay un solo caso).
 */
export async function CaseView({ project }: { project: Project }) {
  const t = await getTranslations('work.case');
  const pages = await getTranslations('pages');
  const cta = await getTranslations('cta');
  return (
    <>
      <header className="wrap page-head page-head-tight">
        <nav className="mono crumbs" aria-label={t('breadcrumb')}>
          <Link href="/work">{pages('work')}</Link> / <span className="ink">{project.short}</span>
        </nav>
        <h1 className="h1 case-title">{project.title}</h1>
        <p className="lead prose case-line">{project.description}</p>
        <dl className="case-meta">
          <div className="stack-1">
            <dt className="mono">{t('type')}</dt>
            <dd>{project.type}</dd>
          </div>
        </dl>
      </header>

      <div className="case-hero">
        <div className="wrap">
          <Plates kind={project.plates} wide />
        </div>
      </div>

      <section className="section wrap" aria-label={t('overview')}>
        <div className="case-trio">
          <div className="stack-2 rv">
            <h2 className="mono">{t('overview')}</h2>
            <p className="lead">{project.overview}</p>
          </div>
        </div>
      </section>

      <section className="wrap section-bottom" aria-labelledby="h-feat">
        <div className="split">
          <div className="stack-3">
            <h2 id="h-feat" className="h2">
              {t('features')}
            </h2>
            <p className="muted small">{project.features.note}</p>
          </div>
          <ol className="rv rule-bottom">
            {project.features.items.map((text, i) => (
              <li key={text} className="feature">
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="h3">{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rule" aria-labelledby="h-cta">
        <div className="wrap section final">
          <h2 id="h-cta" className="h1">
            {project.cta}
          </h2>
          <div className="actions">
            <Link className="btn btn-primary" href="/estimate">
              {cta('startProject')} <ArrowIcon />
            </Link>
            <Link className="btn btn-ghost" href="/contact">
              {cta('askQuestion')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
