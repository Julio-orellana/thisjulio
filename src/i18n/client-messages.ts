import type { Messages } from './messages';

/**
 * Espacios de mensajes que usan las islas de cliente (P-45, cierra P-24):
 * `common` (selector de idioma), `nav` (enlaces y menú móvil) y `work` (filtro
 * de la galería). Solo estos viajan al navegador; el resto de los textos lo
 * pinta el servidor. `tests/unit/client-messages.test.ts` falla si una isla
 * usa un espacio que no está aquí, o si aquí sobra uno.
 */
export const CLIENT_NAMESPACES = ['common', 'nav', 'work'] as const satisfies readonly (keyof Messages)[];

export type ClientMessages = Pick<Messages, (typeof CLIENT_NAMESPACES)[number]>;

/** Mensajes que recibe `NextIntlClientProvider`: solo los espacios de las islas. */
export function clientMessages<M extends Record<(typeof CLIENT_NAMESPACES)[number], unknown>>(
  all: M,
): Pick<M, (typeof CLIENT_NAMESPACES)[number]> {
  return { common: all.common, nav: all.nav, work: all.work };
}
