import { getTranslations } from 'next-intl/server';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { contactEmail, spokenAddress } from '@/config/contact';
import { site } from '@/config/site';
import { MailLink } from './MailLink';

/**
 * Contacto provisional (feature 006, P-43): mientras no exista la 004, el
 * contacto es un enlace `mailto:`. Sin formulario, sin promesas de plazo y sin
 * canales no confirmados (P-11): correo y GitHub (`site.ts`).
 *
 * Se arma con piezas que ya existen del diseño (`page-head`, `.final`,
 * `.path-link`, `.lead`): no añade CSS. Adaptación temporal, anotada en
 * `docs/design/REFERENCIA-DISENO.md` §5; la 004 la sustituye por el artboard
 * `Contact.dc.html`.
 *
 * El correo no se escribe aquí: lo arma la isla `MailLink` en el navegador.
 * Sin JavaScript se muestra dicho en palabras, nunca la dirección literal.
 * Mientras no haya dirección (`contactEmail` nulo) no se pinta nada de correo.
 */
export async function ContactView() {
  const t = await getTranslations('contact');
  const pages = await getTranslations('pages');
  return (
    <>
      <div className="wrap">
        <header className="page-head page-head-tight">
          <h1 className="h1">{pages('contact')}</h1>
        </header>
      </div>
      <section className="section wrap rule" aria-labelledby="h-channels">
        <div className="final">
          <div className="stack-2">
            <h2 id="h-channels" className="mono">
              {t('channels')}
            </h2>
            <p className="lead prose">{t('lead')}</p>
            {contactEmail && (
              <noscript>
                <p className="muted">{t('email.noscript', { address: spokenAddress(contactEmail, t('email.at'), t('email.dot')) })}</p>
              </noscript>
            )}
          </div>
          <div>
            {contactEmail && <MailLink title={t('email.title')} text={t('email.text')} />}
            <a className="path-link" href={site.githubUrl} rel="noopener noreferrer">
              <span className="h3">{t('github.title')}</span>
              <span className="muted small">{t('github.text')}</span>
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
