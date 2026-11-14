# Hoja de ruta

> Parte de la constitución. Cada feature tiene su propia carpeta
> `spec/features/NNN-<slug>/` con `spec.md`, `plan.md` y `tasks.md`, y **se
> especifica cuando llega su turno**, no antes. Ninguna feature empieza sin la
> aprobación expresa de Julio.

## 1. Dónde está hoy (2026-11-13)

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
- **Feature 003: completada y cerrada el 2026-11-13**, con la aprobación final
  de Julio (▲B3): port del motor 3D del diseño a TypeScript (píxeles idénticos
  al original), escena en el hero de Inicio con su recorrido y en «How it's
  built», carga diferida, liberación de recursos y rótulos por idioma; página
  Arquitectura como el artboard, sin escena 3D (P-27), con las tecnologías que
  Julio confirmó (P-28). Sin dependencias nuevas; CSP sin cambios; 34 rutas
  estáticas. Limitaciones aceptadas: `spec/features/003-…/tasks.md`, «Cierre de
  la Feature 003».
- **Siguiente: Feature 006 (lanzamiento), adelantada a la 004** por decisión de
  Julio del 2026-11-13 (§2.1). Planificada en `spec/features/006-lanzamiento/`;
  **spec y plan aprobados por Julio en ▲C0 (2026-11-13)**, con las opciones
  recomendadas en P-38 a P-52. **Ronda R1 (T1–T8) ejecutada y aprobada en ▲C1
  (2026-11-13)**: 32 rutas, Contacto provisional, SEO, puertas de publicación,
  presupuesto por ruta y CSP en tres motores. **Orden de rondas cambiado por
  Julio (2026-11-13):** la R2 (hosting y preview, T9–T11) se difiere hasta que
  G1–G4 y P-13 estén casi cerrados; antes va la R3-local (partes locales de
  T12, T14 y T15), y después de ▲C2 se cierra la R3. Hosting sin cambios
  (P-38 = A). Detalle: `spec/features/006-lanzamiento/tasks.md`, «Cambio de
  orden del 2026-11-13». Nada contratado ni desplegado. La 004 queda para después del lanzamiento y no empieza sin su
  autorización expresa.

## 2. Features

En orden de ejecución. Los números no se renombran: son identificadores, no
posiciones.

| Orden | Feature | Objetivo | Depende de | Pendientes que la condicionan |
|---|---|---|---|---|
| 1 ✔ | **001** Fundación, i18n y sistema de diseño | Proyecto Next.js, rutas localizadas ES/EN, tokens, tipografía, layout, Nav y Footer, encabezados de seguridad base, CI de verificación. | Aprobación de la Fase 1 | P-05 (selector) |
| 2 ✔ | **002** Páginas de contenido y portafolio | Home (sin 3D), Trabajo, casos, Servicios, Acerca de, Legal; capa de contenido tipada y validada. | 001 | P-02, P-03, P-04, P-08, P-09, P-11 |
| 3 ✔ | **003** Escena 3D y arquitectura interactiva | Port del motor WebGL a TypeScript (hero + diagrama), carga diferida, liberación de recursos, textos localizados, página Arquitectura (diagrama HTML, sin 3D: P-27). | 001; 002 para integrarla en Home | P-12 (no bloquea) |
| **4** | **006** Lanzamiento mínimo: seguridad, SEO, accesibilidad y despliegue | Hosting, dominio y DNS; contacto provisional por `mailto:`; `hreflang`, sitemap, robots, datos estructurados reales y Open Graph; presupuesto de rendimiento; CSP verificada en Firefox, Safari y detrás del CDN; revisión OWASP ASVS; auditoría WCAG 2.2 AA; puertas de publicación; despliegue con preview y reversión. | 001–003 | P-04/P-22, P-07, P-09, P-11, P-13, P-15, P-17, P-24, P-34; P-38 en adelante. P-12 no bloquea |
| 5 | **004** Contacto y estimador | Formularios con validación en servidor, envío por correo sin almacenamiento, antiabuso, estimador con tarifas configurables. Sustituye al contacto provisional de la 006. | 001, 002; **después del lanzamiento** | P-06, P-07 (correo de envío y antiabuso), P-11 |
| 6 | **005** Base técnica del blog | MDX por idioma, esquema de metadatos, rutas, `noindex` y fuera de navegación y sitemap hasta su habilitación. | 001 | Tres artículos aprobados para publicar |

### 2.1 Cambio de orden del 2026-11-13: la 006 se adelanta a la 004

**Decisión de Julio (2026-11-13): camino B, «lanzamiento mínimo».**

- **Qué cambia.** El sitio se publica **sin formulario ni estimador**. Mientras
  no exista la 004, el contacto es un enlace `mailto:`. La 006 deja de depender
  de la 004 y pasa a ser la siguiente; la 004 se hace después, sobre el sitio
  ya publicado.
- **Motivo.** El contenido (002) y la escena (003) están cerrados y aprobados;
  lo que falta para publicar es infraestructura y verificación, no formularios.
  La 004 depende además de decisiones todavía abiertas que no deben frenar el
  lanzamiento: tarifas del estimador (P-06) y proveedor de correo de envío y
  antiabuso (P-07, ADR 005).
- **Qué no cambia.** Sin analítica ni cookies; el blog sigue oculto, `noindex` y
  fuera del sitemap; el diseño aprobado; la CSP (ADR 006); y la regla 5 de §3:
  nada se publica antes de la 006.
- **Qué arrastra.** Los enlaces que hoy llevan al estimador (el CTA «Iniciar un
  proyecto», entre otros) y la página Contacto necesitan un destino provisional:
  se decide en P-43 y P-44, no aquí. Lo provisional se retira en la 004.
- **Lo que la 006 no adelanta:** formularios, estimador, correo de envío y
  antiabuso siguen siendo de la 004.

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
