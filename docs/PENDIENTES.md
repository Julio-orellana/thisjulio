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
| P-04 | Aprobación de **textos comerciales** en español e inglés: titulares, firma «This» (D-13), estado «Taking projects» (D-09), descripciones de servicios. | Publicación (006); redacción en 002. | Se entregan borradores marcados como tales. | Abierto **Feature 002 (▲A4, 2026-11-12):** los 34 bloques de texto de la 002 siguen en `copy: 'draft'` (`spec/features/002-…/textos-borrador.md`) y se aprueban antes de la 006. |
| P-05 | Visto bueno al **selector ES \| EN** (D-05): posición y aspecto dentro de la navegación aprobada. | Cierre visual de la 001. | Capturas en `spec/features/001-…/capturas/`. | **Resuelto (2026-11-05):** aprobado por Julio junto con toda la revisión visual de la 001. |
| P-06 | **Tarifas del estimador** (tarifa por unidad, moneda Q/USD) y si el formulario a medida admite **archivos adjuntos** (D-11). | 004. | Sin tarifa, el estimador muestra complejidad y no precio (comportamiento del diseño). | Abierto **▲A4 (2026-11-12):** aprobado quitar «An indicative range at the end» del cierre de Inicio mientras no haya tarifas. |
| P-07 | **Proveedores**: hosting, DNS/dominio, correo transaccional, antiabuso. | 004 (correo) y 006 (despliegue). | Alternativas y criterios en `docs/adr/004` y `005`. | Abierto |
| P-08 | **Verificación de los demás proyectos** del portafolio (AY LUPITA web y dashboard, Kinderland, ATRIO, API de pedidos): existencia, permiso de publicación, stack, año, rol, enlace, funciones confirmadas. | 002. | Lo no verificado no se publica (D-08). | Abierto |
| P-09 | **Revisión jurídica** del contenido de Legal y Privacidad (Decreto 33-98 y reformas, vigencia y aplicabilidad; Convenio de Berna; Tratado OMPI; ADPIC; Decreto 57-2008). | Publicación de `/legal` (006). | Hasta entonces se publica marcado «Borrador pendiente de revisión legal». | Abierto |
| P-10 | **Verificación física del POS** (impresión, hardware real). No es tarea de THIS JULIO web; condiciona lo que el caso puede afirmar. | Nada; el caso se redacta sin afirmarlo. | — | Abierto |
| P-11 | **Datos de contacto reales**: correo `@thisjulio.com`, LinkedIn, WhatsApp (si se publica), retrato, CV en PDF (D-12). | 002 y 004. | Lo ausente no se muestra. | Abierto |
| P-12 | **Medición de GPU real** de la escena 3D en dispositivos de referencia. Independiente, no bloquea. | Nada. | Se hace fuera de las features, con el plan de `TEST-PLAN.md` §6. | Abierto |
| P-13 | Visibilidad del repositorio `thisjulio` (público o privado). Los documentos internos citan nombres de proyectos del portafolio aún no verificados. | Nada técnico. | Si será público, revisar `docs/` antes. | Abierto |
| P-14 | **CSP con nonce vs. páginas estáticas.** La CSP con nonce (aprobada en la 001) obliga a renderizar cada página por petición: sin caché de CDN por defecto, más carga de servidor. | Decisión de la 006 (hosting y rendimiento). | A) mantener nonce (máxima protección, dinámico); B) CSP sin nonce con `'unsafe-inline'` en scripts (estático, menos protección); C) SRI experimental de Next (estático; madurez a evaluar). Detalle: plan 001 §6.1. | **Resuelto (2026-11-05):** alternativa C con `script-src` limitada a `<origen>/_next/static/chunks/`, sin `strict-dynamic` ni `'self'` (ADR 006). Implementada en la T18 de la 001 y **aprobada por Julio (2026-11-05)**. |
| P-15 | **Favicon e iconos** de la marca. | Nada (la 006 los necesita para el lanzamiento). | Entregar el archivo aprobado; no se crea uno nuevo. | Abierto |
| P-16 | **404 de URLs con extensión** (p. ej. `/foto.png` inexistente). Era la página interna de Next, sin el layout del sitio y, medido, en blanco: Next enviaba su carcasa de error vacía y la CSP impedía completarla. | Nada técnico; es una cuestión de diseño. | A) dejarla así; B) un 404 propio, bilingüe e integrado al sitio. | **Resuelto (2026-11-05):** opción B. `app/global-not-found.tsx` (bandera `experimental.globalNotFound`) atiende toda URL que no es una ruta, con o sin extensión: documento del sitio (Nav, Footer), en el idioma de la URL o en los dos si no lo tiene, «Volver al inicio» y «Regresar». Se renderiza en el servidor con nonce. `app/global-error.tsx` propio para los errores. Detalle y límites: ADR 006 §P-16. **Aprobado por Julio (2026-11-05)**, con los límites aceptados (`globalNotFound` experimental; el 500 depende de JavaScript). |
| P-17 | **Verificar la CSP en Firefox, Safari y detrás del CDN real.** T18 se midió solo en Chromium y con `next start`, sin CDN. | 006 (lanzamiento). | Correr `tests/e2e/csp.spec.ts` con los proyectos `firefox` y `webkit` de Playwright, y en Safari real. Con el hosting elegido, comprobar que el CDN cachea el HTML junto con su CSP, que nunca cachea respuestas con nonce y que incluye `.next/csp-manifest.json`. | Abierto — **no se presenta como superado** |
| P-18 | **Alcance de la 002.** (a) La página Arquitectura queda en la 003 como dice el roadmap (el encargo de planificación la listaba en la 002). (b) Home sin escena 3D: hero sin recorrido por capas y «How it's built» sobre `Plates stack`, el respaldo sin WebGL del diseño (DA-2). (c) En Trabajo, con un solo proyecto aprobado, no se muestran filtros (DA-4). | Inicio de la 002 (R1). | Recomendado: a) 003, b) `Plates stack`, c) ocultar filtros. Alternativas: adelantar Arquitectura (cambia el alcance y obliga a rehacerla en la 003); omitir «How it's built» hasta la 003. Detalle: `spec/features/002-…/spec.md` §3.1, §3.2, §6. | **Resuelto (2026-11-05):** alternativa A. Arquitectura permanece en la 003; Inicio usa el respaldo visual `Plates stack` hasta la integración 3D; se ocultan los filtros sin utilidad. |
| P-19 | **Caso POS en la 002.** Confirmar: (a) publicar el stack (Electron, React, TypeScript, SQLite); (b) la lista de funcionalidades y su redacción (p. ej. cómo nombrar la autorización remota); (c) quién cuenta «problema y solución» del cliente: el repositorio dice *qué hace* el sistema, no *por qué se pidió*; (d) caso sin `Deploy`, sin pantallas (P-03) y sin resultados (DA-5, D-14). | T3 y T10 de la 002. | Sin respuesta se publica solo la descripción autorizada y las funcionalidades documentadas; «problema y solución» se omite. | **Resuelto (2026-11-05):** alternativa A. Caso POS anonimizado con información estrictamente verificable: sin métricas, capturas ni datos del cliente no autorizados; sin stack, sin «problema y solución», sin `Deploy`. Ampliable solo con datos que Julio confirme. |
| P-20 | **Acerca de.** Confirmar cada especialidad y cada una de las 14 tecnologías que lista el diseño (no están verificadas en el repositorio); aprobar la composición sin retrato (DA-7); entregar retrato, CV en PDF y LinkedIn cuando existan (P-11). | T12 de la 002. | Lo no confirmado se omite. | **Parcial (2026-11-05):** aprobado el principio de mostrar solo información confirmada; no se publica ninguna tecnología ni especialidad sin verificación. **Siguen abiertos:** la lista definitiva de especialidades y tecnologías, los datos personales y profesionales (retrato, CV, LinkedIn: P-11) y la composición sin retrato (DA-7). Hasta entonces esas secciones no se publican. **DA-7 aprobada (2026-11-12):** sin retrato, `.about-top` (Acerca de) y `.me` (Inicio, «This is Julio») pasan a una sola columna; vuelven a las dos columnas del diseño cuando haya retrato. Siguen abiertas la lista de especialidades y tecnologías y los datos personales (P-11). |
| P-21 | **Rutas con slug.** Aprobar `/servicios/<slug>` como una página estática por servicio y los slugs propuestos de servicios y del caso (`plan.md` §3). Cambiarlos tras publicar rompe URLs. | T8 y T10 de la 002. | Alternativa: una sola página `/servicios` con estado en el cliente (pierde enlace profundo). | **Resuelto (2026-11-05):** alternativa A. Una ruta por servicio con equivalencia ES/EN. Los slugs de `plan.md` §3 quedan documentados como propuesta; se verifican el selector de idioma y las URL inexistentes (404 propio) en la T8. |
| P-22 | **Textos ES/EN de la 002** (extiende P-04): firma «This» (D-13), nota del servicio 07 sin «availability» ni «response times» (DA-6), renglón «Monitoreo, según el plan de servicio», campo `copy: draft/approved` en el contenido (DA-8). | Publicación (006); redacción en 002. | Se entregan borradores marcados `draft`; el cierre de la 002 informa cuántos quedan. | **Resuelto (2026-11-05):** alternativa A. Se conserva «This»; los textos no aprobados quedan `copy: 'draft'`. Se omite toda afirmación de monitoreo, cobertura o tiempos de respuesta no confirmada (el renglón «Monitoreo» y la nota de cobertura del servicio 07 no se publican). |
| P-23 | **`Plates` sin estilos en línea.** La CSP (ADR 006) prohíbe `style=""` y el componente del diseño lo usa en cada bloque. Aprobar la técnica elegida tras la comparación píxel a píxel de la T6 (CSS generado, SVG o clases). | Resto de la 002 desde T9 y T11. | Si ninguna iguala el diseño, se detiene y se pide decisión; no se relaja la CSP. | **Resuelto (2026-11-12): opción A** (CSS generado: una clase por valor distinto de `Plates`), elegida por Julio en ▲A1 con el informe de la T6a (`spec/features/002-…/evidencia-t6-plates.md`: 140/140 y 28/28 capturas idénticas a la réplica; CSP intacta). La T6b la implementa con su generador y una prueba de que la hoja generada está al día, sin tocar `scripts/csp-manifest.mjs`. |
| P-24 | **Mensajes enviados al navegador.** `NextIntlClientProvider` (en `SiteDocument`) envía al cliente todos los mensajes del idioma: con la 002, ~5,4 KB más de HTML por página. | Nada; rendimiento (006). | Propuesta: pasar al proveedor solo los espacios que usan las islas (`common`, `nav`, `work`). Cambia `SiteDocument` (001). | Abierto (propuesta, 2026-11-12) |
| P-25 | **CI de GitHub Actions de la 002.** Los commits de la 002 estaban solo en local. | Nada técnico; registro de CI. | Subir la rama y anotar la ejecución. | **Resuelto (2026-11-12):** Julio autorizó el push (sin force); [ejecución 43364128117](https://github.com/Julio-orellana/thisjulio/actions/runs/43364128117) sobre `75bb37a`: success. La del commit de cierre se registra en `spec/features/002-…/tasks.md`. |

## Decisiones registradas en la Feature 001 (2026-11-05)

- CSP y renderizado (P-14): **alternativa C**, ADR 006. Páginas estáticas con
  hashes, nonce en lo dinámico, `script-src` solo `<origen>/_next/static/chunks/`,
  sin `strict-dynamic` ni `'self'`, sin `unsafe-*`, sin ISR en rutas con
  hashes, y origen desde `SITE_ORIGIN`, nunca desde `Host`.
- Revisión visual de la 001 **aprobada**: capturas ES/EN, selector ES | EN,
  navegación, footer, adaptaciones y fidelidad al diseño.
- T18 **aprobada** (ADR 006). P-17 aceptado como pendiente de la 006: Firefox,
  Safari y CDN real no se presentan como comprobados.
- P-16: **opción B**, 404 propio bilingüe integrado al sitio (ADR 006 §P-16).
  Implementada en la T19 y **aprobada**.
- **Cierre de la Feature 001 aprobado por Julio (2026-11-05).** La 002 no
  empieza sin su autorización expresa.

- `/` redirige siempre a `/es`; inglés en `/en` (sin detección automática).
- GitHub Actions solo para verificaciones, sin despliegues.
- Revisión de capturas (ES/EN, navegación, responsive) antes de cerrar cada
  feature con interfaz.

## Decisiones registradas en la Feature 002 (2026-11-05 a 2026-11-12)

- P-18, P-19, P-21, P-22: alternativa A (2026-11-05). P-20: solo el principio;
  DA-7 aprobada el 2026-11-12 (una columna sin retrato, también en Inicio).
- P-23: opción A, CSS generado para `Plates` (▲A1, 2026-11-12).
- ▲A2 (Servicios) y ▲A3 (caso POS) aprobadas el 2026-11-12.
- **▲A4, revisión final aprobada (2026-11-12):** con un solo proyecto publicado,
  la tarjeta de Inicio ocupa el ancho completo de la rejilla (con 2 o más, 3
  columnas; D-15); aprobado quitar «An indicative range at the end» (P-06); los
  34 bloques de texto siguen en `draft` y se aprueban antes de la 006 (P-04).
- **Cierre de la Feature 002 (2026-11-12).** La 003 no empieza sin su
  autorización expresa.

## Decisiones ya aprobadas (no se vuelven a preguntar)

Idiomas y rutas, stack (Next.js + React + TypeScript + Tailwind, App Router,
repositorio único), sin base de datos en v1, navegación, blog oculto y
`noindex` hasta tener tres artículos aprobados, los siete servicios, sin
«24/7», reglas del caso POS, diseño visual y escena 3D sin cambios, sin
analítica ni cookies de seguimiento. Fuente: prompt de dirección técnica de
la Fase 1, resumido en `spec/constitution/`.
