# Hoja de ruta

> Parte de la constitución. Cada feature tiene su propia carpeta
> `spec/features/NNN-<slug>/` con `spec.md`, `plan.md` y `tasks.md`, y **se
> especifica cuando llega su turno**, no antes. Ninguna feature empieza sin la
> aprobación expresa de Julio.

## 1. Dónde está hoy (2026-11-12)

- Repositorio `thisjulio`: documentación SDD y la fundación técnica (001).
- Diseño aprobado inspeccionado y referenciado (`docs/design/`).
- Caso POS revisado en modo lectura (`docs/portafolio/caso-pos.md`).
- Fase 1 (documentación y planificación SDD): aprobada el 2026-11-05.
- **Feature 001: completada y cerrada el 2026-11-05**, con la aprobación final
  de Julio: revisión visual, CSP y renderizado (T18, ADR 006) y 404 y errores
  propios (T19, P-16). Limitaciones aceptadas: `spec/features/001-…/tasks.md`,
  «Cierre de la Feature 001».
- **Feature 002: completada y cerrada el 2026-11-12**, con la aprobación final
  de Julio (▲A4): Inicio sin 3D, Trabajo, caso POS, Servicios (14 rutas),
  Acerca de y Legal; capa de contenido validada; 34 rutas estáticas con CSP de
  hashes. Textos en borrador (P-04, P-22) y limitaciones aceptadas:
  `spec/features/002-…/tasks.md`, «Cierre de la Feature 002».
- **Siguiente:** Feature 003 (escena 3D y página Arquitectura). **No empieza sin
  la autorización expresa de Julio.** `spec/features/003-escena-3d-y-arquitectura/`
  redactada el 2026-11-12, **pendiente de aprobación** (▲B0) y de P-26 a P-33.
  Señalado: el artboard de Arquitectura (`Technology.dc.html`) no usa la escena
  3D, aunque la fila de abajo la agrupa con ella (P-27).

## 2. Features

| Feature | Objetivo | Depende de | Pendientes que la condicionan |
|---|---|---|---|
| **001** Fundación, i18n y sistema de diseño | Proyecto Next.js, rutas localizadas ES/EN, tokens, tipografía, layout, Nav y Footer, encabezados de seguridad base, CI de verificación. | Aprobación de la Fase 1 | P-05 (selector) |
| **002** Páginas de contenido y portafolio | Home (sin 3D), Trabajo, casos, Servicios, Acerca de, Legal; capa de contenido tipada y validada. | 001 | P-02, P-03, P-04, P-08, P-09, P-11 |
| **003** Escena 3D y arquitectura interactiva | Port del motor WebGL a TypeScript (hero + diagrama), carga diferida, liberación de recursos, textos localizados, página Arquitectura. | 001; 002 para integrarla en Home | P-12 (no bloquea) |
| **004** Contacto y estimador | Formularios con validación en servidor, envío por correo sin almacenamiento, antiabuso, estimador con tarifas configurables. | 001, 002 | P-06, P-07, P-11 |
| **005** Base técnica del blog | MDX por idioma, esquema de metadatos, rutas, `noindex` y fuera de navegación y sitemap hasta su habilitación. | 001 | Tres artículos aprobados para publicar |
| **006** Seguridad, SEO, accesibilidad y lanzamiento | CSP final, sitemap y `hreflang`, datos estructurados reales, auditoría de accesibilidad, rendimiento, hosting, dominio y despliegue. | 001–004 | P-04, P-07, P-09, P-13 |

## 3. Reglas que atraviesan las features

1. **Spec → plan → tasks → código.** Cada uno se aprueba antes del siguiente.
2. **Una feature, una rama**, desde la rama por defecto; merge solo con
   aprobación de Julio. Nunca commits directos a `main`.
3. **Fidelidad visual verificada:** cada página nueva se compara con su
   artboard en 1440 px y 390 px antes de cerrar la feature.
4. **Ninguna feature cambia el diseño aprobado** sin una entrada en
   `docs/design/REFERENCIA-DISENO.md` §5 aprobada por Julio.
5. **Nada se publica** (DNS, despliegue, indexación) antes de la 006.
6. Los pendientes se registran en `docs/PENDIENTES.md`, no en cada spec.
