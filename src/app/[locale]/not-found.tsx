import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowIcon } from '@/components/layout/ArrowIcon';

export default async function NotFound() {
  const t = await getTranslations('common');
  return (
    <header className="wrap page-head stack-3">
      <h1 className="h1">{t('notFoundTitle')}</h1>
      <div>
        <Link className="link" href="/">
          <span>{t('notFoundBack')}</span> <ArrowIcon />
        </Link>
      </div>
    </header>
  );
}
