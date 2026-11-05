import { getLocale } from 'next-intl/server';
import { NotFoundPanel } from '@/components/errors/NotFoundPanel';
import type { Locale } from '@/i18n/routing';

/**
 * 404 de `notFound()` llamado desde una página de un idioma. Hoy ninguna
 * página lo llama: las URL inexistentes las atiende `app/global-not-found.tsx`
 * (P-16). Queda para las páginas futuras, con el mismo bloque. Next 16 no lo
 * renderiza en el servidor con este layout raíz (lo pinta en el cliente),
 * por eso las rutas nuevas deben preferir `dynamicParams = false`.
 */
export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  return (
    <header className="wrap page-head">
      <NotFoundPanel locale={locale} />
    </header>
  );
}
