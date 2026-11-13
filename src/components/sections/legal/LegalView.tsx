import { getFormatter, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getLegal } from '@/lib/content';

/**
 * Legal y privacidad (`Legal.dc.html`). Informativa y rotulada «Borrador
 * pendiente de revisión legal» (P-09, SECURITY.md §6), con la fecha del commit
 * del contenido (spec §3.6). Índice con anclas reales (las del Footer y
 * «marco legal»); `scroll-margin-top` del diseño deja la sección bajo el
 * encabezado, sin `localStorage` (T-a). Correo omitido (P-11): remite a Contacto.
 */
export async function LegalView({ locale }: { locale: Locale }) {
  const t = await getTranslations('legal');
  const format = await getFormatter();
  const legal = getLegal(locale);
  const date = format.dateTime(new Date(`${legal.updated}T12:00:00Z`), { dateStyle: 'long' });
  return (
    <div className="wrap">
      <header className="page-head page-head-legal">
        <h1 className="h2">{t('title')}</h1>
        <p className="muted legal-draft">{t('status', { date })}</p>
      </header>
      <div className="legal">
        <nav className="legal-index" aria-label={t('indexLabel')}>
          {legal.sections.map((s) => (
            <a key={s.id} href={`#${s.anchor}`}>
              {s.title}
            </a>
          ))}
        </nav>
        <div>
          <div className="legal-notice">
            <p className="small">{legal.notice}</p>
          </div>
          {legal.sections.map((s) => (
            <section key={s.id} id={s.anchor} className="legal-sec" aria-labelledby={`h-${s.anchor}`}>
              <h2 id={`h-${s.anchor}`} className="h3">
                {s.title}
              </h2>
              {s.body.map((b, i) =>
                b.type === 'p' ? (
                  <p key={i}>{b.text}</p>
                ) : (
                  <ul key={i} className="rule-bottom">
                    {b.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
          <section className="legal-sec" aria-labelledby="h-questions">
            <h2 id="h-questions" className="h3">
              {t('questions.title')}
            </h2>
            <p>{t.rich('questions.text', { contact: (c) => <Link href="/contact">{c}</Link> })}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
