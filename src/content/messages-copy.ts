import type { ContentInput } from './schema';

/**
 * Estado de aprobación de los textos de `src/messages/{es,en}/*.json` creados
 * en la 002, la 003 y la 006 (DA-8). Un archivo JSON de mensajes no puede llevar un campo
 * `copy` por texto sin ensuciar las claves, así que el bloque es el espacio de
 * nombres completo: pasa a `approved` cuando Julio aprueba todos sus textos.
 */
export const messagesCopy = {
  home: 'draft',
  work: 'draft',
  services: 'draft',
  about: 'draft',
  legal: 'draft',
  cta: 'draft',
  architecture: 'draft',
  contact: 'draft',
} satisfies ContentInput['messagesCopy'];
