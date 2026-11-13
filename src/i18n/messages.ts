import type { Locale } from './routing';

import esCommon from '@/messages/es/common.json';
import esNav from '@/messages/es/nav.json';
import esFooter from '@/messages/es/footer.json';
import esPages from '@/messages/es/pages.json';
import esHome from '@/messages/es/home.json';
import esWork from '@/messages/es/work.json';
import esServices from '@/messages/es/services.json';
import esAbout from '@/messages/es/about.json';
import esLegal from '@/messages/es/legal.json';
import esCta from '@/messages/es/cta.json';
import esArchitecture from '@/messages/es/architecture.json';
import enCommon from '@/messages/en/common.json';
import enNav from '@/messages/en/nav.json';
import enFooter from '@/messages/en/footer.json';
import enPages from '@/messages/en/pages.json';
import enHome from '@/messages/en/home.json';
import enWork from '@/messages/en/work.json';
import enServices from '@/messages/en/services.json';
import enAbout from '@/messages/en/about.json';
import enLegal from '@/messages/en/legal.json';
import enCta from '@/messages/en/cta.json';
import enArchitecture from '@/messages/en/architecture.json';

/**
 * Mensajes por idioma y espacio de nombres (src/messages/{es,en}/*.json).
 * La prueba tests/unit/messages.test.ts exige que ambos idiomas tengan
 * exactamente las mismas claves y que ningún texto rompa la política de
 * contenido (src/content/policy.ts). Los espacios de la 002 (home, work,
 * services, about, legal, cta) y el de la 003 (architecture) llevan su estado
 * de aprobación en src/content/messages-copy.ts.
 */
export const messages = {
  es: {
    common: esCommon,
    nav: esNav,
    footer: esFooter,
    pages: esPages,
    home: esHome,
    work: esWork,
    services: esServices,
    about: esAbout,
    legal: esLegal,
    cta: esCta,
    architecture: esArchitecture,
  },
  en: {
    common: enCommon,
    nav: enNav,
    footer: enFooter,
    pages: enPages,
    home: enHome,
    work: enWork,
    services: enServices,
    about: enAbout,
    legal: enLegal,
    cta: enCta,
    architecture: enArchitecture,
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type Messages = (typeof messages)['es'];
