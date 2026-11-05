# ADR 003 — Contenido en archivos, sin base de datos

- **Estado:** Aceptada (decisión de Julio: sin persistencia propia en v1)
- **Fecha:** 2026-11-05

## Contexto

La v1 publica contenido que cambia poco (proyectos, servicios, legal, blog
futuro) y recibe mensajes de contacto que no necesitan guardarse. PostgreSQL
y Prisma quedan fuera de la primera versión.

## Decisión

1. **El contenido vive en el repositorio**, versionado con Git:
   - `src/content/` — módulos TypeScript tipados: proyectos, servicios,
     legal, navegación. Separan **datos estructurales** (id, slugs por idioma,
     orden, estado, stack, tipo de vista, imágenes) de **textos por idioma**.
   - `content/blog/{es,en}/*.mdx` — artículos con *frontmatter* (feature 005).
2. **Zod valida el contenido en compilación**: una entrada incompleta, un
   slug duplicado o un idioma faltante rompen el build, no la página en
   producción.
3. Estado de publicación por entrada (`borrador` | `aprobado`): solo lo
   `aprobado` se genera como página. Así los proyectos sin verificar (P-08)
   pueden quedar documentados sin publicarse.
4. **Formularios sin almacenamiento:** el mensaje se valida en servidor y se
   envía por correo (ADR 005); no se guarda en el servidor.

## Alternativas consideradas

| Alternativa | Por qué no |
|---|---|
| PostgreSQL + Prisma desde ya | Sin un caso de uso que lo necesite; añade costo, migraciones y superficie de ataque. Se incorpora cuando llegue el panel administrativo. |
| CMS externo (headless) | Servicio externo sin autorización, datos fuera del repositorio, y una sola persona edita el contenido. |
| JSON / YAML sin tipos | Pierde la verificación en compilación. |

## Consecuencias

- Publicar contenido = commit + revisión + despliegue (trazable).
- Las interfaces de acceso al contenido (`src/lib/content/`) se escriben como
  funciones (`getProjects(locale)`), de modo que un CMS o base de datos futura
  pueda sustituir la fuente sin tocar los componentes.
