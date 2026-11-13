# T15 — Fidelidad visual de la Feature 002

**Fecha:** 2026-11-12. **Rama:** `claude/admiring-babbage-bjvbo8`, sobre `fbe049e`.
Solo Chromium (Playwright 1.63.0), densidad 1, `prefers-reduced-motion: reduce`
para fijar las transiciones. Diseño: artefacto con huellas de `REFERENCIA-DISENO.md`
§2 (verificadas en T1; el artefacto informa la versión `1794534219-8ae2`).

## 1. Qué se midió y cómo

| Medición | Método | Resultado |
|---|---|---|
| **CSS** de las 7 páginas | El `<main>` de cada página de la app se devuelve a la forma del diseño (clases `[app]` y de `Plates` → estilos en línea equivalentes) y se pinta solo con `site.css` del diseño; se compara píxel a píxel con la app (R4) | Inicio, Acerca de, Legal (ES y EN), Servicios, Trabajo y caso (EN), 1440 y 390: **0 píxeles distintos** (salvo la fila de 1 px del borde del pie) |
| Componentes contra réplicas independientes del diseño | Réplicas estáticas escritas desde los `.dc.html` con `site.css` y las mismas fuentes | Primitivas `ui/` (T5): 14/14 idénticas. `Plates` (T6b): 100/100 a 1× y 100/100 a 2×. `Deploy` EN (T7): idéntico a 1440, 1040 y 390. Servicios 01 EN (T8): cajas idénticas en 6 secciones; píxeles idénticos salvo las pestañas 05/07 (D-02, D-03) |
| **Páginas completas contra su artboard** | Réplicas estáticas de `Main`, `Work`, `CaseStudy` (POS), `Services`, `About` y `Legal.dc.html` con el marcado, los datos y el texto del diseño (sin WebGL: el respaldo `Plates stack` del propio diseño); capturas réplica \| app EN \| app ES y alto de cada sección | Capturas `capturas/t15-{inicio,trabajo,caso-pos,servicios,acerca-de,legal}-{1440,390}.png`; diferencias en §3 |

Las réplicas de §1, fila 3, llevan el contenido del diseño (seis proyectos,
«24/7», marcadores `[…]`…), así que la comparación de páginas completas es
visual y por geometría, no píxel a píxel: lo que difiere es contenido o
composición, y cada diferencia se clasifica abajo.

## 2. Geometría por sección (alto en px, EN)

| Página | Sección | Artboard 1440 | App 1440 | Artboard 390 | App 390 | Causa |
|---|---|---|---|---|---|---|
| Inicio | Hero | 824 (fijado, `hero-pin`) | 824 (sin fijar) | 792 | 792 | DA-2 |
| Inicio | Trabajo | 899 | 867 | 1 317 | 605 | D-08: 1 tarjeta en lugar de 3 |
| Inicio | Servicios | 1 156 | 1 121 | 1 402 | 1 402 | D-02: el 07 ya no ocupa dos líneas |
| Inicio | How it's built | 1 052 | 1 052 | 1 177 | 1 177 | Igual (DA-2: misma vista de respaldo) |
| Inicio | This is Julio | 846 | 576 | 930 | 473 | DA-7 (sin retrato, una columna) |
| Inicio | Cierre | 500 | 500 | 480 | 459 | Texto: «An indicative range at the end» omitido (P-06) |
| Trabajo | Barra | 74 | 47 | 157 | 47 | DA-4 (sin filtros) |
| Trabajo | Galería | 3 953 | 767 | 2 282 | 433 | D-08: 1 proyecto en lugar de 6 |
| Caso POS | Encabezado | 602 | 484 | 806 | 406 | D-12 (sin año, rol, enlace) y título genérico (P-02) |
| Caso POS | Vista | 632 | 632 | 199 | 199 | Igual |
| Caso POS | Resumen / trío | 477 | 446 | 577 | 281 | P-19 (sin problema ni solución) |
| Caso POS | Funcionalidades | 433 | 866 | 591 | 922 | 10 funcionalidades documentadas (caso-pos.md §3) y aviso, sin stack (P-19) |
| Caso POS | Arquitecturas, pantallas, resultados, siguiente | 858 + 1 192 + 227 + 272 | — | 1 675 + 1 018 + 270 + 150 | — | D-14, P-03, sin cifras, un solo caso |
| Servicios | Encabezado / índice y panel / proceso / cuentas / cierre | 330 / 720 / 563 / 382 / 462 | idénticas | 270 / 819 / 953 / 340 / 381 | idénticas | — |
| Acerca de | Bloque superior | 783 | 498 | 1 063 | 478 | DA-7; sin CV ni LinkedIn (P-11) |
| Acerca de | Especialidades + método | 775 | 775 | 1 230 | 730 | Sin especialidades (P-20); el método ocupa la fila |
| Acerca de | Tecnologías | 286 | — | 400 | — | P-20 |
| Legal | Encabezado / cuerpo | 243 / 1 842 | 243 / 1 842 | 174 / 2 694 | 174 / 2 694 | Idénticos |

En español, los títulos más largos suben algunas secciones (p. ej. Servicios
1440: encabezado 416 frente a 330, por dos líneas); ninguna ruta desborda en
horizontal a 1440, 1024, 768 ni 390 (`transversal.spec.ts`).

## 3. Diferencias con el diseño

### 3.1 Aprobadas (decisión registrada)

| ID | Diferencia | Páginas |
|---|---|---|
| DA-2 (P-18) | Sin escena 3D: hero y «How it's built» con el respaldo sin WebGL del diseño; hero sin fijar ni recorrido; sin rótulo «Scroll to follow…» | Inicio |
| DA-3 (P-21) | Pestañas como enlaces a `/servicios/<slug>` (mismo aspecto) | Servicios |
| DA-4 (P-18) | Trabajo sin filtros con una sola categoría; la barra queda solo con el contador y es más baja | Trabajo |
| DA-5, D-14 (P-19) | Caso POS sin `Deploy`, pantallas, resultados ni siguiente proyecto; sin stack, problema ni solución | Caso |
| DA-6 (P-22) | Servicio 07 sin «Monitoring…» ni la nota de cobertura | Servicios 07 |
| DA-7 (P-20) | Sin retrato: «This is Julio» y «Quién soy» en una columna | Inicio, Acerca de |
| DA-8 (P-22) | Textos en borrador (34/34) | Todas |
| D-01, D-13 (P-04, P-22) | Español redactado; firma «This» conservada | Todas |
| D-02, D-03 | Nombres oficiales de los servicios (05 «Process Automation», 07 «Support and Maintenance») | Inicio, Servicios |
| D-08 (P-08) | Solo el proyecto verificado; «Explore all projects» sin número | Inicio, Trabajo |
| D-12 (P-11) | Sin retrato, CV, LinkedIn, año, rol, enlace ni correo; sin marcadores visibles | Inicio, Acerca de, caso, Legal |
| P-09 | Legal con «Borrador pendiente de revisión legal» y fecha real, en lugar del marcador | Legal |
| P-20 | Sin especialidades técnicas ni tecnologías | Acerca de |
| P-23 | `Plates` sin estilos en línea (opción A): render idéntico | Todas las que la usan |
| T-a | Selección por URL y anclas en lugar de `localStorage` | Servicios, Legal, caso |
| ▲A3 | Caso POS aprobado tal como está (aviso «No son resultados medidos» en el lugar del stack) | Caso |

### 3.2 No previstas, encontradas durante la 002

| # | Diferencia | Estado |
|---|---|---|
| 1 | Títulos `.mono` sin negrita: el preflight de Tailwind la quitaba | **Corregida** en T8 (`[app]` con especificidad cero) |
| 2 | Panel de Servicios 8,2 px fuera de su sitio con desplazamiento suave (medido durante la animación `svIn`) | **Corregida** en T8 (el diseño tiene el mismo desvío, dentro de su tolerancia) |
| 3 | «SERVIDOR LOCAL» sobresalía de su rectángulo en `Deploy` (ES) | **Corregida**: «SERV. LOCAL» (borrador) |
| 4 | «TODO» no cabía en la columna de 30 px del selector de capas (ES) | **Corregida**: «1–4» (borrador) |
| 5 | «An indicative range at the end» omitido en el cierre de Inicio: sin tarifas (P-06) no hay rango de precio | **Para revisión de textos** (P-04/P-06) |
| 6 | Inicio con una tarjeta en la rejilla de tres columnas | Consecuencia de D-08; no se rellenó el espacio |

No queda ninguna diferencia sin explicar ni corregir.

## 4. Límites

- Solo Chromium y densidad 1 en las páginas completas (P-17). `Plates` también
  a 2×.
- Las réplicas de §1, fila 3, se escribieron a mano desde los `.dc.html`: sin el
  motor de Claude Design no se pueden pintar los artboards originales. La
  escena 3D no se compara (003).
- Hover y foco: medidos en `Plates` (T6a/T6b) y en las primitivas; en las
  páginas completas solo el estado de reposo.
