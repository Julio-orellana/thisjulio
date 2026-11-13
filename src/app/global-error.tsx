'use client';

import { BackButton } from '@/components/errors/BackButton';
import { ErrorPanel } from '@/components/errors/ErrorPanel';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
// Solo `common` (no el registro completo de mensajes): este componente de
// cliente viaja en el paquete de todas las páginas (Feature 002, R3).
import esCommon from '@/messages/es/common.json';
import enCommon from '@/messages/en/common.json';
import { fontVariables } from './fonts';
import './globals.css';

/**
 * Error global (P-16): reemplaza al layout raíz cuando este falla, así que
 * arma su propio documento con las fuentes y estilos del sitio. Sin acceso
 * al idioma de la petición: va en los dos, español primero. Es un componente
 * de cliente (exigido por Next); sus textos salen de los mensajes, no del código.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  const blocks = [
    { locale: 'es', c: esCommon, level: 1 as const },
    { locale: 'en', c: enCommon, level: 2 as const },
  ];
  return (
    <html lang="es" className={fontVariables}>
      <body className="site">
        <title>{`${esCommon.error.title} · ${enCommon.error.title} · ${esCommon.brand}`}</title>
        <header className="nav">
          <div className="wrap nav-in">
            {/* Navegación completa a propósito: tras un error global se recarga la app entera. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="wordmark" href="/es" aria-label={esCommon.brandHome}>
              {esCommon.brand}
            </a>
          </div>
        </header>
        <main id="contenido" tabIndex={-1}>
          <div className="wrap page-head stack-4">
            {blocks.map(({ locale, c, level }) => (
              <ErrorPanel
                key={locale}
                lang={locale === 'es' ? undefined : locale}
                level={level}
                eyebrow={c.error.eyebrow}
                title={c.error.title}
                text={c.error.text}
                actions={
                  <>
                    <button type="button" className="link" onClick={() => retry()}>
                      <span>{c.error.retry}</span>
                    </button>
                    {/* Navegación completa a propósito (ver arriba). */}
                    <a className="link" href={`/${locale}`} hrefLang={locale}>
                      <span>{c.error.home}</span> <ArrowIcon />
                    </a>
                    <BackButton label={c.notFound.back} />
                  </>
                }
              />
            ))}
          </div>
        </main>
      </body>
    </html>
  );
}
