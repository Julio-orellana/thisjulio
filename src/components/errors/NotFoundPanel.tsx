import { getTranslations } from 'next-intl/server';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { BackButton } from './BackButton';
import { ErrorPanel } from './ErrorPanel';

/** Bloque del 404 en un idioma (P-16): título, frase, «volver al inicio» y «regresar». */
export async function NotFoundPanel({ locale, level = 1, lang }: { locale: Locale; level?: 1 | 2; lang?: string }) {
  const t = await getTranslations({ locale, namespace: 'common.notFound' });
  return (
    <ErrorPanel
      lang={lang}
      level={level}
      eyebrow={t('eyebrow')}
      title={t('title')}
      text={t('text')}
      actions={
        <>
          <Link className="link" href="/" locale={locale} hrefLang={locale}>
            <span>{t('home')}</span> <ArrowIcon />
          </Link>
          <BackButton label={t('back')} />
        </>
      }
    />
  );
}
