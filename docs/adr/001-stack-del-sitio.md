# ADR 001 — Stack del sitio

- **Estado:** Aceptada (decisión de Julio en el prompt de dirección técnica, Fase 1)
- **Fecha:** 2026-11-05

## Contexto

El sitio es bilingüe, de contenido, con una escena WebGL interactiva,
formularios y un blog futuro. Debe poder crecer hacia herramientas internas
(panel, clientes, cotizaciones) sin reescribirse, y lo mantiene una sola
persona.

## Decisión

Next.js con **App Router**, React, TypeScript (`strict`) y Tailwind CSS, en
**un único repositorio y una única aplicación**. Server Components por
defecto; componentes de cliente solo donde haya interacción. Versiones
fijadas en la feature 001 (`spec/constitution/tech-stack.md` §1).

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| Astro / sitio estático | Bueno para contenido, pero el crecimiento previsto (panel, formularios con lógica de servidor, autenticación futura) encaja mejor en Next.js; además Julio ya trabaja con React/Next. |
| Monorepo (app + paquetes) | Sin un segundo consumidor de código no aporta; añade herramientas y mantenimiento. |
| Microservicios / backend separado | Desproporcionado para un sitio sin datos propios. |

## Consecuencias

- Rendimiento y SEO con renderizado en servidor (por petición mientras se use CSP con nonce; ver abajo).
- El motor 3D se carga solo en cliente y de forma diferida (`ARCHITECTURE.md` §6).
- Algunas capacidades (proxy de i18n, handlers de formularios) requieren un
  hosting con runtime de Next.js, no una exportación estática pura (ADR 004).
- TypeScript 7 (registro, 2026-11) no se adopta hasta confirmar soporte
  oficial de Next.js; se usa 5.9.3 (Feature 001).
- La CSP con nonce obliga a renderizado dinámico en Next 16 (plan 001 §6.1;
  P-14).
