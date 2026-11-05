import type { Locale } from './routing';

import esCommon from '@/messages/es/common.json';
import esNav from '@/messages/es/nav.json';
import esFooter from '@/messages/es/footer.json';
import esPages from '@/messages/es/pages.json';
import enCommon from '@/messages/en/common.json';
import enNav from '@/messages/en/nav.json';
import enFooter from '@/messages/en/footer.json';
import enPages from '@/messages/en/pages.json';

/**
 * Mensajes por idioma y espacio de nombres (src/messages/{es,en}/*.json).
 * La prueba tests/unit/messages.test.ts exige que ambos idiomas tengan
 * exactamente las mismas claves.
 */
export const messages = {
  es: { common: esCommon, nav: esNav, footer: esFooter, pages: esPages },
  en: { common: enCommon, nav: enNav, footer: enFooter, pages: enPages },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type Messages = (typeof messages)['es'];
