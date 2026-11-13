'use client';

import { useSyncExternalStore } from 'react';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { contactAddress, contactEmail } from '@/config/contact';

const subscribe = () => () => {};
const addressOnClient = () => (contactEmail ? contactAddress(contactEmail) : null);
const addressOnServer = () => null;

/**
 * Enlace de correo de Contacto (P-43). El servidor pinta el enlace sin `href`
 * y sin la dirección; la dirección se arma aquí, en el navegador, a partir de
 * las dos partes de `src/config/contact.ts`. Así no aparece en el HTML ni en la
 * carga RSC de ninguna página (este componente no recibe el correo por *props*).
 *
 * Sin estilos ni manejadores en línea: es un *chunk* de `/_next/static/chunks/`.
 * Sin JavaScript el enlace no se puede abrir; `ContactView` muestra entonces la
 * dirección escrita en palabras dentro de un `<noscript>`.
 */
export function MailLink({ title, text }: { title: string; text: string }) {
  // Nulo en el servidor y durante la hidratación; la dirección, después.
  const address = useSyncExternalStore(subscribe, addressOnClient, addressOnServer);
  return (
    <a className="path-link" href={address ? `mailto:${address}` : undefined} data-mail={address ? 'ready' : 'pending'}>
      <span className="h3">{title}</span>
      <span className="muted small">{address ?? text}</span>
      <ArrowIcon />
    </a>
  );
}
