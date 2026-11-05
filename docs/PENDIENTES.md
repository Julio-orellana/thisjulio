# Decisiones y verificaciones pendientes de Julio

> **Ubicación principal** de todo lo que requiere intervención de Julio. Los
> demás documentos citan el identificador (P-NN) en lugar de repetir el
> detalle. Ninguna se resuelve en silencio «con el mejor criterio técnico».
> Al resolver una, se anota la fecha, la respuesta y, si aplica, el ADR.

| ID | Pendiente | Bloquea | Opciones / qué se necesita | Estado |
|---|---|---|---|---|
| P-01 | Entregar `DESIGN.md`, `TECH-STACK.md` y `PROMPT-CLAUDE-CODE-001-sitio.md`. No estuvieron disponibles en la Fase 1. | Nada de la 001; la 002 lo necesita para los textos. | Subirlos a `claude/` (DESIGN y PROMPT) y a la raíz (`TECH-STACK.md`) sin editar. | Abierto |
| P-02 | Autorización **escrita** para identificar al cliente del POS y el nombre comercial del producto. | Solo el nombre en el caso POS. | Sin autorización se usa la descripción genérica (`docs/portafolio/caso-pos.md`). | Abierto |
| P-03 | Autorización para publicar **capturas** del POS. | Sección «Screens» del caso POS. | Sin autorización se usan las composiciones `Plates` del diseño. | Abierto |
| P-04 | Aprobación de **textos comerciales** en español e inglés: titulares, firma «This» (D-13), estado «Taking projects» (D-09), descripciones de servicios. | Publicación (006); redacción en 002. | Se entregan borradores marcados como tales. | Abierto |
| P-05 | Visto bueno al **selector ES \| EN** (D-05): posición y aspecto dentro de la navegación aprobada. | Cierre visual de la 001. | Capturas en `spec/features/001-…/capturas/`. | Abierto — en revisión |
| P-06 | **Tarifas del estimador** (tarifa por unidad, moneda Q/USD) y si el formulario a medida admite **archivos adjuntos** (D-11). | 004. | Sin tarifa, el estimador muestra complejidad y no precio (comportamiento del diseño). | Abierto |
| P-07 | **Proveedores**: hosting, DNS/dominio, correo transaccional, antiabuso. | 004 (correo) y 006 (despliegue). | Alternativas y criterios en `docs/adr/004` y `005`. | Abierto |
| P-08 | **Verificación de los demás proyectos** del portafolio (AY LUPITA web y dashboard, Kinderland, ATRIO, API de pedidos): existencia, permiso de publicación, stack, año, rol, enlace, funciones confirmadas. | 002. | Lo no verificado no se publica (D-08). | Abierto |
| P-09 | **Revisión jurídica** del contenido de Legal y Privacidad (Decreto 33-98 y reformas, vigencia y aplicabilidad; Convenio de Berna; Tratado OMPI; ADPIC; Decreto 57-2008). | Publicación de `/legal` (006). | Hasta entonces se publica marcado «Borrador pendiente de revisión legal». | Abierto |
| P-10 | **Verificación física del POS** (impresión, hardware real). No es tarea de THIS JULIO web; condiciona lo que el caso puede afirmar. | Nada; el caso se redacta sin afirmarlo. | — | Abierto |
| P-11 | **Datos de contacto reales**: correo `@thisjulio.com`, LinkedIn, WhatsApp (si se publica), retrato, CV en PDF (D-12). | 002 y 004. | Lo ausente no se muestra. | Abierto |
| P-12 | **Medición de GPU real** de la escena 3D en dispositivos de referencia. Independiente, no bloquea. | Nada. | Se hace fuera de las features, con el plan de `TEST-PLAN.md` §6. | Abierto |
| P-13 | Visibilidad del repositorio `thisjulio` (público o privado). Los documentos internos citan nombres de proyectos del portafolio aún no verificados. | Nada técnico. | Si será público, revisar `docs/` antes. | Abierto |
| P-14 | **CSP con nonce vs. páginas estáticas.** La CSP con nonce (aprobada en la 001) obliga a renderizar cada página por petición: sin caché de CDN por defecto, más carga de servidor. | Decisión de la 006 (hosting y rendimiento). | A) mantener nonce (máxima protección, dinámico); B) CSP sin nonce con `'unsafe-inline'` en scripts (estático, menos protección); C) SRI experimental de Next (estático; madurez a evaluar). Detalle: plan 001 §6.1. | Abierto |
| P-15 | **Favicon e iconos** de la marca. | Nada (la 006 los necesita para el lanzamiento). | Entregar el archivo aprobado; no se crea uno nuevo. | Abierto |

## Decisiones registradas en la Feature 001 (2026-11-05)

- `/` redirige siempre a `/es`; inglés en `/en` (sin detección automática).
- GitHub Actions solo para verificaciones, sin despliegues.
- Revisión de capturas (ES/EN, navegación, responsive) antes de cerrar cada
  feature con interfaz.

## Decisiones ya aprobadas (no se vuelven a preguntar)

Idiomas y rutas, stack (Next.js + React + TypeScript + Tailwind, App Router,
repositorio único), sin base de datos en v1, navegación, blog oculto y
`noindex` hasta tener tres artículos aprobados, los siete servicios, sin
«24/7», reglas del caso POS, diseño visual y escena 3D sin cambios, sin
analítica ni cookies de seguimiento. Fuente: prompt de dirección técnica de
la Fase 1, resumido en `spec/constitution/`.
