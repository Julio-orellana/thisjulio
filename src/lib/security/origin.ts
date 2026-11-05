/**
 * Origen del sitio para la CSP (T18, ADR 006, decisión 8).
 *
 * La fuente de scripts de la CSP es `<ORIGEN>/_next/static/chunks/`. El origen
 * sale SIEMPRE de la configuración (`SITE_ORIGIN`, validada al construir) y
 * nunca del encabezado `Host` de la petición. Si saliera del `Host`, una CSP
 * armada con un valor manipulado podría quedar en la caché de un CDN y servirse
 * a otros visitantes, y además metería texto del cliente en un encabezado de
 * seguridad.
 */

/** Producción y vistas previas: solo https, sin puerto, ruta ni credenciales. */
const HTTPS_ORIGIN = /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
/** Pruebas locales (e2e): http solo para localhost o 127.0.0.1, con puerto opcional. */
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

export class InvalidSiteOriginError extends Error {}

/**
 * Valida y devuelve el origen. Lanza si falta o no tiene exactamente la forma
 * `https://<host>` (o `http://localhost[:puerto]` para pruebas locales).
 */
export function parseSiteOrigin(value: string | undefined): string {
  if (value === undefined || value === '') {
    throw new InvalidSiteOriginError(
      'SITE_ORIGIN no está definida. Ejemplos: https://thisjulio.com (producción) o http://localhost:3100 (e2e). Ver .env.example.',
    );
  }
  if (!HTTPS_ORIGIN.test(value) && !LOCAL_ORIGIN.test(value)) {
    throw new InvalidSiteOriginError(
      `SITE_ORIGIN inválida: «${value.slice(0, 80)}». Debe ser https://<host> en minúsculas, sin barra final, ruta ni puerto; o http://localhost[:puerto] para pruebas locales.`,
    );
  }
  if (LOCAL_ORIGIN.test(value)) {
    const port = Number(value.split(':')[2] ?? '80');
    if (port < 1 || port > 65535) throw new InvalidSiteOriginError(`SITE_ORIGIN con puerto inválido: «${value}».`);
  }
  return value;
}
