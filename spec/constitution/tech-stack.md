# Stack técnico

> Parte de la constitución. Resume **qué** se usa y **por qué**; el detalle de
> cada decisión vive en su ADR (`docs/adr/`), la estructura en
> `ARCHITECTURE.md` y la seguridad en `SECURITY.md`. Los principios generales
> de tecnología y seguridad de Julio están en `TECH-STACK.md`, **que no
> estuvo disponible en la Fase 1** (P-01): cuando llegue, esta página se
> revisa contra él y prevalece lo que diga, salvo que contradiga una decisión
> explícita del prompt de dirección técnica.

## 1. Base aprobada

| Pieza | Elección | Versión de referencia (npm, 2026-11-05) | ADR |
|---|---|---|---|
| Framework | Next.js, **App Router** | 16.4.x | 001 |
| UI | React | 19.x | 001 |
| Lenguaje | TypeScript en modo `strict` | La línea que Next.js soporte oficialmente al iniciar la 001 (la 7.0 es reciente: no se adopta sin confirmar compatibilidad) | 001 |
| Estilos | Tailwind CSS con los tokens del diseño como fuente | 4.x | 001 |
| i18n | `next-intl` | 4.x (peer `next ^16` confirmado en el registro) | 002 |
| Validación | Zod (contenido en build, entradas en servidor) | 4.x | 003 |
| Contenido | Archivos tipados en el repositorio; MDX para el blog | — | 003 |
| 3D | **Motor WebGL propio del diseño**, portado a TypeScript; sin Three.js ni R3F | — | `ARCHITECTURE.md` §6 |
| Fuentes | Space Grotesk, Inter, JetBrains Mono autoalojadas con `next/font` | — | D-10 |
| Runtime | Node.js ≥ 20.9 (requisito de Next 16); entorno de trabajo actual: Node 22 | — | 001 |

Las versiones exactas se fijan (`package-lock.json`, sin rangos amplios) al
crear el proyecto en la feature 001. Las versiones de esta tabla son las
publicadas en el registro el día de la Fase 1, no una instalación.

## 2. Lo que NO forma parte de la v1

PostgreSQL, Prisma o cualquier base de datos; autenticación de usuarios;
monorepo; microservicios; CMS externo; analítica; cookies de seguimiento;
Three.js / React Three Fiber; servicios externos sin autorización.

## 3. Reglas que atraviesan todo

- **Server Components por defecto.** Un componente es de cliente solo si
  necesita estado, eventos o APIs del navegador (escena 3D, selector de
  capas, filtros, formularios).
- **Contenido desacoplado de componentes:** los componentes reciben datos
  tipados; no contienen textos visibles en duro.
- **Datos no localizables separados de los textos** (identificadores, stack,
  estado, imágenes, orden) — `ARCHITECTURE.md` §4.
- **Tokens únicos:** colores, tipografía, espaciado y movimiento salen de una
  sola definición (`src/styles/tokens.css`), consumida por Tailwind.
- **Sin dependencias por comodidad:** cada dependencia nueva se justifica en
  el plan de la feature que la introduce.
- **Seguridad desde el diseño:** OWASP como referencia (`SECURITY.md`).

## 4. Cómo se verifica

`lint` (ESLint), `typecheck` (`tsc --noEmit`), pruebas unitarias (Vitest),
pruebas de extremo a extremo y accesibilidad (Playwright + axe),
comparación visual contra el diseño aprobado, `npm audit`. Detalle y
criterios en `TEST-PLAN.md`.
