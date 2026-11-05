# ADR 002 — Internacionalización

- **Estado:** Aceptada en lo funcional (decisión de Julio). La librería
  `next-intl` queda **aceptada con verificación** en la feature 001.
- **Fecha:** 2026-11-05
- **Actualización (Feature 001, 2026-11-05):** Julio decidió `/` → `/es`
  siempre. `next-intl` 4.14.9 verificado con Next 16.4.5 y `proxy.ts`
  (pruebas e2e). Configuración: `localePrefix: 'always'`,
  `localeDetection: false`, `localeCookie: false`, `alternateLinks: false`
  (los alternates se implementan en la 006).

## Contexto

Español es el idioma principal y predeterminado; inglés es secundario. Una
sola aplicación y un solo dominio, sin traducción automática. Las rutas se
localizan (`/es/trabajo` ↔ `/en/work`) y el selector ES | EN debe conservar la
página equivalente o, si no existe traducción, ir a la página padre.

## Decisión

1. **Prefijo de idioma siempre visible** (`/es/…`, `/en/…`). La raíz `/`
   redirige a `/es` (predeterminado). Sin detección automática que cambie el
   idioma a quien no lo pidió. **Decidido:** sin negociación por
   `Accept-Language` ni cookie; `/` siempre lleva a `/es`.
2. **`next-intl`** para mensajes, formato y rutas localizadas (`pathnames`).
   Compatibilidad comprobada en el registro: `next-intl@4.14.9` declara
   `next ^16`. Se confirma en la 001 con una prueba real de enrutamiento antes
   de construir páginas.
3. **Tabla de rutas única** (`src/i18n/routing.ts`) con los pares aprobados.
   Los slugs de contenido (casos, servicios, artículos) se declaran por idioma
   en el propio contenido, con un **identificador estable** común que permite
   encontrar la página equivalente.
4. **Selector ES | EN:** calcula el destino desde el identificador estable;
   si la página no existe en el otro idioma, enlaza a la página padre
   localizada. Es un enlace (`<a hreflang lang>`), no un botón con estado.
5. **Mensajes** por idioma y por espacio de nombres en
   `src/messages/{es,en}/*.json`, con tipos generados para detectar claves
   faltantes en compilación.
6. **Sin traducción automática** ni en ejecución ni como relleno: una clave
   faltante falla la verificación.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| i18n propio con diccionarios y `[locale]` | Repite lo que `next-intl` resuelve (rutas localizadas, formato, tipos); más código propio que mantener. |
| Subdominios (`en.thisjulio.com`) o dominios por idioma | Rechazado por decisión: un solo dominio. |
| Español sin prefijo y `/en/…` para inglés | Complica `hreflang`, el proxy y el selector; el prefijo explícito para ambos idiomas es simétrico y fue el aprobado. |

## Consecuencias

- `<html lang>` correcto por ruta, `hreflang` recíproco y `x-default` → `/es`
  (feature 006).
- Cada página nueva exige textos en ambos idiomas para pasar la verificación,
  salvo artículos del blog sin traducción.
- Los textos del diseño (en inglés) son la base de `en`; el español requiere
  redacción y aprobación (P-04).
