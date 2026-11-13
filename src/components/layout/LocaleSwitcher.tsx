'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { lookupFromPairs, resolveAlternate, templateOf, type SlugPairs } from '@/i18n/alternate';
import { routing, type AppPathname, type Locale } from '@/i18n/routing';

/**
 * Selector ES | EN (D-05; aspecto pendiente de visto bueno, P-05).
 * Lleva a la página equivalente en el otro idioma o, si no hay traducción,
 * a su página padre (ADR 002 §4). Son enlaces, no un control con estado.
 * `slugPairs` (de la capa de contenido, vía `Nav`) traduce los slugs de caso y
 * de servicio (spec 002 §4.6).
 */
export function LocaleSwitcher({ slugPairs = {} }: { slugPairs?: SlugPairs }) {
  const t = useTranslations('common.locale');
  const locale = useLocale() as Locale;
  const current = usePathname();
  // En el prerender de una página con slug en español la ruta llega sin resolver a su plantilla (ver `templateOf`).
  const template = templateOf(current);
  const pathname = (template ?? current) as AppPathname;
  const params = useParams<Record<string, string | string[]>>();
  // En el 404 (P-16) la ruta no es del sitio y el enlace lleva al 404 del otro
  // idioma: no se precarga (Next deja abierta en el navegador la precarga de un 404).
  const isSiteRoute = template !== null;

  return (
    <div className="lang mono" role="group" aria-label={t('groupLabel')}>
      {routing.locales.map((target, i) => {
        const current = target === locale;
        const route = resolveAlternate({ pathname, params }, locale, target, lookupFromPairs(slugPairs));
        return (
          <span key={target} className="lang-item">
            {i > 0 && (
              <span className="lang-sep" aria-hidden="true">
                |
              </span>
            )}
            <Link
              // El tipo de `href` exige la unión exacta de rutas tipadas.
              href={route as Parameters<typeof Link>[0]['href']}
              locale={target}
              prefetch={isSiteRoute ? undefined : false}
              className="lang-link"
              hrefLang={target}
              lang={target}
              aria-current={current ? 'true' : undefined}
            >
              {/* Nombre accesible «ES Español»: incluye el texto visible (WCAG 2.5.3). */}
              {target.toUpperCase()}
              <span className="sr-only"> {t(target)}</span>
            </Link>
          </span>
        );
      })}
    </div>
  );
}
