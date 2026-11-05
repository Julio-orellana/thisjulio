import { isLocale, type Locale } from './routing';

/**
 * Idioma de la URL para el 404 global (P-16). El 404 global no recibe
 * parámetros de ruta: el proxy le pasa el primer segmento de la URL en este
 * encabezado de petición, que siempre sobrescribe (nunca se toma el que mande
 * el navegador). Si la URL no empieza con un idioma (`/foto.png`), no hay
 * encabezado y el 404 va en los dos idiomas.
 */
export const LOCALE_HINT_HEADER = 'x-thisjulio-locale';

export function localeFromPathname(pathname: string): Locale | null {
  const first = pathname.split('/')[1];
  return isLocale(first) ? first : null;
}
