/**
 * Correo de contacto del sitio (P-42, P-43; puerta de publicación G4).
 *
 * Va en dos partes para que la dirección completa no exista como texto en
 * ningún archivo ni paquete: solo se arma en el navegador, dentro de la isla
 * `MailLink`. Este módulo lo importan únicamente esa isla y `ContactView`
 * (para el texto sin JavaScript); no debe pasar por `src/messages`, que viaja
 * en el HTML, ni por las *props* de una isla, que viajan en la carga RSC.
 *
 * `null` hasta que Julio elija la dirección y confirme que recibe correo
 * (P-11). Con `null` no se pinta ningún enlace de correo y el build de
 * producción falla (`scripts/release-gates.mjs`). No se inventa una dirección.
 *
 * `scripts/lib/release-gates.mjs` lee esta declaración como texto: conservar la
 * forma `{ user: '…', domain: '…' }` en una sola línea.
 */
export type ContactEmail = { user: string; domain: string };

export const contactEmail: ContactEmail | null = null;

/** Dirección completa. Solo se llama en el navegador (isla `MailLink`). */
export function contactAddress({ user, domain }: ContactEmail): string {
  return `${user}@${domain}`;
}

/** La dirección dicha en palabras («nombre arroba dominio punto com»), para leerla sin JavaScript. */
export function spokenAddress({ user, domain }: ContactEmail, at: string, dot: string): string {
  return `${user} ${at} ${domain.split('.').join(` ${dot} `)}`;
}
