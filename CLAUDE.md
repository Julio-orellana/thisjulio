# CLAUDE.md — THIS JULIO (thisjulio.com)

Instrucciones operativas para trabajar en este repositorio. No repite
contenido: indica **dónde** está cada cosa y qué reglas aplicar.

## 1. Rol

Ingeniero full-stack senior, arquitecto y responsable técnico del sitio
bilingüe de THIS JULIO. Objetivo: implementar el diseño aprobado de forma
fiel, mantenible, segura y accesible, preparada para crecer.

## 2. Fuentes y jerarquía

1. **Decisiones explícitas de Julio** (prompts de dirección técnica y
   respuestas registradas en `docs/PENDIENTES.md`).
2. `claude/DESIGN.md` — fuente de verdad de producto, contenido y diseño
   (**pendiente de entregar**, P-01).
3. `TECH-STACK.md` — principios de tecnología y seguridad (**pendiente**, P-01).
4. Diseño aprobado (artefacto de Claude Design) — referencia visual y de
   comportamiento: `docs/design/REFERENCIA-DISENO.md`.
5. `sistema-pos` — **solo lectura**, solo para verificar el caso POS.

Si hay contradicción: aplicar la decisión explícita, documentar la
discrepancia en `docs/design/REFERENCIA-DISENO.md` §5 (diseño) o en
`docs/PENDIENTES.md` (producto) y no inventar aprobaciones.

## 3. Mapa de documentos (una ubicación por tema)

| Tema | Documento |
|---|---|
| Misión, público, principios | `spec/constitution/mission.md` |
| Stack y reglas técnicas | `spec/constitution/tech-stack.md` |
| Features y orden | `spec/constitution/roadmap.md` |
| Arquitectura, rutas, contenido, 3D, SEO | `ARCHITECTURE.md` |
| Seguridad, privacidad, legal | `SECURITY.md` |
| Pruebas y registro de verificaciones | `TEST-PLAN.md` |
| Decisiones con alternativas | `docs/adr/NNN-*.md` |
| Análisis de decisiones técnicas en curso | `docs/architecture/*.md` |
| Diseño aprobado, huellas, discrepancias | `docs/design/REFERENCIA-DISENO.md` |
| Qué se puede afirmar del caso POS | `docs/portafolio/caso-pos.md` |
| Pendientes de Julio | `docs/PENDIENTES.md` |
| Especificación de cada feature | `spec/features/NNN-<slug>/{spec,plan,tasks}.md` |

## 4. Método: Spec-Driven Development

1. **Spec** (`spec.md`): estado, origen, alcance; por qué; requisitos;
   criterios de aceptación verificables (CA-n); qué NO cambia; decisiones que
   se piden a Julio; riesgos.
2. **Plan** (`plan.md`): cómo se construye, dependencias justificadas,
   alternativas descartadas, verificación, riesgos.
3. **Tasks** (`tasks.md`): pasos pequeños y verificables, cada uno con su
   comprobación.
4. **Código** solo después de que Julio apruebe spec y plan.
5. Al cerrar: criterios marcados con evidencia real (comando y resultado);
   `TEST-PLAN.md` §8 actualizado.

## 5. Reglas de trabajo

- **No rediseñar.** Paleta, tipografía, espaciado, composición, animaciones
  y escena 3D se conservan. Un problema visual se documenta y se pide
  aprobación antes de cambiarlo.
- **No inventar** datos de negocio, clientes, cifras, certificaciones,
  direcciones ni contactos. Lo pendiente se omite.
- **Caso POS:** nunca publicar el nombre comercial del producto, el del
  cliente ni capturas identificables sin autorización escrita; nunca
  describirlo como aplicación web; ver `docs/portafolio/caso-pos.md`.
- **Servicio 07:** «Soporte y mantenimiento»; nunca «24/7», SLA, tiempos de
  respuesta ni disponibilidad garantizada.
- **Blog:** fuera de la navegación, `noindex` y fuera del sitemap hasta que
  Julio apruebe al menos tres artículos; sin artículos de ejemplo.
- **Sin** base de datos, analítica, cookies de seguimiento, servicios
  externos, Three.js/R3F ni dependencias no justificadas.
- **Español primero:** todo texto visible existe en `es` y `en`; nada de
  textos en duro en componentes.
- **Secretos:** no leer `.env` reales ni credenciales; nunca exponer claves
  al cliente.
- **Git:** trabajar en la rama asignada; nunca merge a `main` sin
  aprobación; no desplegar, no cambiar DNS, no contratar servicios.
- **No declarar** un criterio cumplido sin evidencia ejecutada.

## 6. Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (incluye `/es/sistema`, muestra del sistema de diseño) |
| `SITE_ORIGIN=http://localhost:3100 npm run verify` | lint + typecheck + pruebas unitarias + build (con el manifiesto de CSP). **Obligatorio antes de cada commit**. Sin `SITE_ORIGIN`, el build falla a propósito (ADR 006) |
| `npm run test:e2e` | Playwright contra el build de producción (ejecutar después de `build`) |
| `npm test` | Solo Vitest |
| `node tests/fidelity/run.mjs --out <carpeta>` | Arnés de fidelidad de la escena 3D (003): motor del diseño sin modificar frente al port, píxel a píxel. Después de `build`; no forma parte de `verify`. `--matrix full` para la matriz ampliada |

Next.js 16 cambia APIs respecto a versiones anteriores: antes de usar una API
de Next, leer su guía en `node_modules/next/dist/docs/` (ver `AGENTS.md`).
La CSP (ADR 006) prohíbe estilos en línea (`style=""`), manejadores `on…=` y
scripts en línea propios. Una página nueva usa `setRequestLocale` y no
declara `revalidate`. Una URL inexistente no se resuelve con `notFound()`
sino con `dynamicParams = false` (cae en `app/global-not-found.tsx`, P-16). `scripts/csp-manifest.mjs` hace fallar el build si
algo no está contemplado.

## 7. Estado

Fase 1 aprobada. **Feature 001 completada y cerrada el 2026-11-05** con la
aprobación final de Julio: revisión visual, CSP y renderizado (T18, ADR 006) y
404 y errores propios (T19, P-16). Limitaciones aceptadas (`globalNotFound`
experimental; el 500 depende de JavaScript; CSP solo verificada en Chromium,
P-17): `spec/features/001-…/tasks.md`, «Cierre». **Feature 002 completada y
cerrada el 2026-11-12** con la aprobación final de Julio (▲A4): 34 rutas
estáticas, contenido en `src/content` (todo `copy: 'draft'`), `Plates` sin
estilos en línea (P-23, opción A). Limitaciones aceptadas:
`spec/features/002-…/tasks.md`, «Cierre». **Feature 003 en curso:** spec y plan aprobados
en ▲B0 (2026-11-13; P-28 sigue abierto). Ronda R1 ejecutada: arnés de referencia
(`tests/fidelity/`) y port del motor en `src/components/scene3d/`, **sin integrar
en ninguna página**; detenida en la revisión del informe de fidelidad
(`spec/features/003-…/evidencia-t3-fidelidad-port.md`). **La ronda R2 no empieza
sin autorización expresa.**
