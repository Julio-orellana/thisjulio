import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NotFoundPanel } from '@/components/errors/NotFoundPanel';
import { SiteDocument } from '@/components/layout/SiteDocument';
import { LOCALE_HINT_HEADER } from '@/i18n/locale-hint';
import { isLocale, routing, type Locale } from '@/i18n/routing';
import './globals.css';

/**
 * 404 propio (P-16) para toda URL que no corresponde a una ruta: `/es/no-existe`,
 * `/en/a/b`, `/foto.png`. Next lo devuelve sin pasar por los layouts
 * (`experimental.globalNotFound`), así que arma el documento del sitio con
 * `SiteDocument`: la misma Nav, Footer, fuentes y estilos que cualquier página.
 *
 * Con idioma en la URL, la página va en ese idioma. Sin idioma (`/foto.png`),
 * va en español (idioma por omisión) con el bloque en inglés debajo.
 * Se renderiza por petición (lee el encabezado del proxy), así que su CSP es
 * la de nonce (ADR 006); no tiene scripts ni estilos en línea propios.
 */
async function urlLocale(): Promise<Locale | null> {
  const hint = (await headers()).get(LOCALE_HINT_HEADER);
  return isLocale(hint) ? hint : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const fromUrl = await urlLocale();
  const titles = await Promise.all(
    (fromUrl ? [fromUrl] : routing.locales).map(async (locale) => (await getTranslations({ locale, namespace: 'common' }))('notFound.title')),
  );
  const brand = (await getTranslations({ locale: fromUrl ?? routing.defaultLocale, namespace: 'common' }))('brand');
  return {
    title: [...titles, brand].join(' · '),
    robots: { index: false, follow: false },
  };
}

export default async function GlobalNotFound() {
  const fromUrl = await urlLocale();
  const locale = fromUrl ?? routing.defaultLocale;
  setRequestLocale(locale);
  const shown = fromUrl ? [fromUrl] : routing.locales;

  const panels = shown.map((panelLocale, i) => (
    <NotFoundPanel key={panelLocale} locale={panelLocale} level={i === 0 ? 1 : 2} lang={panelLocale === locale ? undefined : panelLocale} />
  ));

  return (
    <SiteDocument locale={locale}>
      <header className={shown.length > 1 ? 'wrap page-head stack-4' : 'wrap page-head'}>{panels}</header>
    </SiteDocument>
  );
}
