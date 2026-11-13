import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { fontVariables } from '@/app/fonts';
import { clientMessages } from '@/i18n/client-messages';
import { messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/routing';
import { Footer } from './Footer';
import { Nav } from './Nav';

/**
 * Documento del sitio: `<html>`, fuentes, salto al contenido, Nav, `<main>` y
 * Footer. Lo usan el layout de idioma y el 404 global (P-16), para que el 404
 * tenga exactamente la misma estructura que cualquier página. Quien lo usa
 * fija antes el idioma de la petición (`setRequestLocale`).
 */
export async function SiteDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = await getTranslations({ locale, namespace: 'common' });
  return (
    <html lang={locale} className={fontVariables}>
      <body className="site">
        {/* Solo los espacios que usan las islas (P-45): el resto no viaja al navegador. */}
        <NextIntlClientProvider messages={clientMessages(messages[locale])}>
          <a className="btn btn-primary btn-sm skip-link" href="#contenido">
            {t('skipToContent')}
          </a>
          <Nav />
          <main id="contenido" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
