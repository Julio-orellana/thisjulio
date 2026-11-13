# 003 — Plan

**Estado:** **aprobado por Julio en ▲B0 (2026-11-13)**: P-26 A, P-27 A, P-29 tal
cual, P-30 A, P-31 A, P-32 A, P-33 tal cual. **P-28 sin respuesta** (sigue abierto;
bloquea T5, T7 y T8). La §2 es la arquitectura vigente (P-26 = A y P-27 = A).

## 0. Lo que se leyó antes de planear

- `CLAUDE.md`, `docs/PENDIENTES.md`, `spec/constitution/*`, `ARCHITECTURE.md`
  (§2, §6), `SECURITY.md` (§3), `TEST-PLAN.md` (§5, §6), ADR 006,
  `docs/design/REFERENCIA-DISENO.md` (§2, §4.1, §5) y el cierre de la 002
  (`spec/features/002-…/tasks.md`).
- Fuentes del diseño versionadas en `fc3af9e` (`docs/design/fuente/`):
  `Arch3D.dc.html`, `Technology.dc.html`, `MobileTech.dc.html`, `Main.dc.html` y
  `site.css` (reglas `.a3*`, `.hero*`, `.tech`, `.inspector*`, `.arch*`).
- Código actual: `HomeView`, `LayerPicker`, `Plates` (P-23), `PageSkeleton`,
  pruebas e2e de la 002.

## 1. Decisiones que se piden a Julio (con recomendación)

| ID | Decisión | Opciones | Recomendación y por qué |
|---|---|---|---|
| **P-26** | Motor 3D | **A.** Portar el motor propio del diseño a TypeScript. **B.** Reescribir la escena con three.js. **C.** Otra librería ligera (regl, OGL). | **A.** Es un *port*, no una reescritura: mismos *shaders*, misma geometría, mismo resultado (la fidelidad se mide contra el motor original). Sin dependencias ni licencias nuevas. Peso: el JavaScript del motor ocupa 42,8 KB sin minificar y **14,1 KB con gzip** (medido sobre la fuente); minificado, menos **[Inferencia]**. three.js `0.187.0` (MIT, hoy en el registro) obligaría a rehacer la escena con otros materiales y otra iluminación (riesgo visual alto) y añadiría del orden de 100–150 KB gzip **[Inferencia, se mediría si se elige B]**. Ninguna opción choca con la CSP: ni el motor propio ni three.js usan `eval`, *workers* ni `blob:` en su ruta normal (para B habría que verificarlo en la versión exacta). |
| **P-27** | Página Arquitectura frente al roadmap | **A.** Hacerla como el artboard `Technology.dc.html`: diagrama HTML de bandas y nodos + inspector `Plates stack`, **sin escena 3D**. **B.** Añadirle la escena 3D (`mode="diagram"`), que el diseño no pone ahí. **C.** Sacarla de la 003 a una feature propia. | **A.** Es lo que el diseño aprobado dibuja; el roadmap agrupó Arquitectura con la 3D por suposición, no por diseño. B es un rediseño. C es válida si Julio prefiere cerrar primero la escena (la 003 quedaría solo con Inicio). |
| **P-28** | Contenido técnico del diagrama y del atlas | **A.** Julio confirma la lista de tecnologías (extiende P-20) y cada descripción de nodo; se publica lo confirmado. **B.** Mientras no confirme, se ocultan los 12 nodos con nombre de tecnología y el nodo «Monitoring» (P-22); una banda que quede vacía no se muestra. **C.** Sustituir nombres por categorías genéricas (texto nuevo, no del diseño). | **A para lo que confirme y B para el resto.** Respeta «lo no verificado se omite» sin inventar texto. Con B, varias pestañas pierden bandas enteras (p. ej. «Frontend» en Web applications): Julio debe ver el resultado antes de publicarlo. Rótulos del atlas `POSTGRESQL` y `MONGODB`: mismo criterio (con B, la celda queda vacía; el atlas tiene 15 celdas fijas, sin cambiar la geometría). |
| **P-29** | Presupuesto de rendimiento y carga diferida | Límites concretos o sin límites. | **Propuesta:** *chunk* del motor ≤ **25 KB gzip**; rutas sin escena **+0 B** de JavaScript; ningún contexto ni *chunk* antes del viewport (margen 200 px); tarea larga de arranque ≤ **200 ms** en escritorio de laboratorio; LCP de laboratorio de Inicio ≤ **2,5 s** en móvil emulado (4× CPU, red rápida 4G); perfil `balanced` en móvil y `low` con GPU por software (lo que ya hace el motor). Los valores son de laboratorio; la GPU real queda en P-12. |
| **P-30** | Recorrido del hero | **A.** Restaurar el diseño: hero fijado con recorrido por capas al desplazar (escritorio, sin `reduced-motion`). **B.** Mantener el hero sin fijar de la 002 con la escena estática. | **A.** Es el diseño aprobado; DA-2 fue temporal «hasta la 003». Con `reduced-motion` y a ≤ 1040 px el propio diseño no fija el hero. |
| **P-31** | Accesibilidad del diagrama | **A.** Lo que define el diseño: lienzo `aria-hidden`, etiquetas DOM con `aria-pressed`, panel `aria-live` (Inicio) y diagrama HTML (Arquitectura). **B.** Además, una lista textual oculta visualmente con las 4 capas y sus descripciones junto al hero. | **A.** El selector de capas de Inicio ya es el equivalente textual completo del diagrama (título, texto, partes y relación de cada capa), y Arquitectura es HTML navegable. B duplicaría contenido para lectores de pantalla. Se verifica con axe y teclado. |
| **P-32** | Inicio y Arquitectura: estáticas con hashes o con nonce | **A.** Estáticas con hashes (como hoy). **B.** Dinámicas con nonce. | **A.** El motor llega como *chunk* de `/_next/static/chunks/` (permitido por `script-src`), sin scripts en línea propios ni atributos `style` en el HTML; las etiquetas se mueven por CSSOM. Se verifica con `csp-scan`, el manifiesto y `csp.spec.ts`; si fallara, se detiene y se pide decisión. B perdería la caché del CDN sin ganar protección. |
| **P-33** | Cómo se prueba y qué queda para P-12 | — | **Propuesta (§4):** e2e con WebGL (SwiftShader de Chromium sin cabeza), sin WebGL, con pérdida de contexto, con `reduced-motion`, liberación, rutas sin escena y presupuesto; fidelidad contra el motor del diseño ejecutado en un arnés aislado con el mismo renderizador. **Para P-12:** GPU dedicada, integrada y teléfono reales, perfiles elegidos, `canvas.dataset.quality` y `canvas.dataset.ms`, temperatura y batería. |

## 2. Arquitectura de implementación (si P-26 = A y P-27 = A)

```
src/components/scene3d/
  engine.ts          port del motor: createEngine(canvas, opts) → { setActive, setLabels, dispose }
  engine-shaders.ts  los 6 shaders del diseño (cadenas literales, sin cambios)
  engine-profile.ts  elección de perfil y escalera de resolución (puro, con pruebas)
  Scene3D.tsx        isla: IntersectionObserver → import('./engine'); respaldo Plates; etiquetas DOM
src/components/sections/home/   HomeView con Scene3D (hero y diagrama); LayerPicker sincronizado
src/components/sections/architecture/   ArchitectureView (diagrama HTML, isla del selector de tipo y nodo)
src/content/architecture.ts     bandas y nodos verificados (P-28), con copy: 'draft'
src/messages/{es,en}/           home (recorrido del hero, rótulos del atlas), architecture
```

- El motor no importa React; `Scene3D` es la única isla que lo carga, con
  `import()` dentro del efecto que observa el viewport (no `next/dynamic` en un
  componente de servidor: en la 002 se midió que Next envía el envoltorio igual).
- `dispose()`: `cancelAnimationFrame`, desconectar `ResizeObserver` e
  `IntersectionObserver`, quitar escuchas, `deleteBuffer/Texture/Framebuffer/
  Program/Shader`, `getExtension('WEBGL_lose_context').loseContext()`.
- Los rótulos del atlas llegan como *props* desde los mensajes del idioma; el
  atlas se redibuja cuando cambian, tras `document.fonts.load('500 38px
  "JetBrains Mono"')`.
- Arquitectura reutiliza `.arch*`, `.tech`, `.inspector*`, chips y `Plates`
  ya portados; su isla solo guarda la pestaña y el nodo.

## 3. Orden de construcción

1. Preflight y **arnés de referencia**: ejecutar el motor del diseño tal cual en
   una página aislada (con un *shim* de `DCLogic`) para obtener cuadros de
   referencia con el mismo renderizador (SwiftShader). Sin esto no hay forma de
   medir la fidelidad del *port*.
2. Port del motor y pruebas de sus partes puras.
3. Envoltorio con carga diferida, pausa, respaldo, `reduced-motion` y liberación.
4. CSP y estático (P-32) verificados con el motor ya cargando.
5. Inicio (hero y diagrama) — ▲ revisión visual.
6. Arquitectura según P-27/P-28 — ▲ revisión de contenido.
7. Pruebas transversales, presupuesto y fidelidad — ▲ revisión final; cierre.

## 4. Verificación (P-33)

| Qué | Cómo |
|---|---|
| Con WebGL | Chromium sin cabeza usa SwiftShader (perfil `low`): se comprueba arranque diferido, cuadros, etiquetas, selección de capa, cambio de idioma. |
| Sin WebGL | `addInitScript` que hace devolver `null` a `getContext('webgl')`, y otra variante sin `OES_standard_derivatives`: respaldo `Plates stack`, sin errores. |
| Pérdida de contexto | `WEBGL_lose_context.loseContext()` desde la prueba: respaldo en el siguiente cuadro. |
| `reduced-motion` | `emulateMedia`: contador de `requestAnimationFrame` del motor estable, hero sin fijar. |
| Liberación | Instrumentar `getContext`, `delete*` y `loseContext`; 10 navegaciones; contextos vivos ≤ 1. |
| Rutas sin escena | En las 32 restantes: 0 peticiones al *chunk* del motor y 0 `<canvas>` tras hidratar. |
| CSP | `csp.spec.ts` P1–P14 sin cambios de política; 0 violaciones con la escena funcionando. |
| Presupuesto | Tamaño del *chunk* en el build; Long Tasks y LCP con Playwright (laboratorio). |
| Fidelidad | Cuadros fijos (`reduced-motion`) del *port* contra el arnés de referencia, mismo navegador y tamaño; tolerancia **[Propuesta]**: 0 píxeles distintos, o ≤ 0,5 % con diferencia máxima ≤ 16/255 si el orden de dibujo cambia el redondeo, cada diferencia explicada. |
| GPU real | **No** en la 003: P-12. |

## 5. Riesgos

| Riesgo | Efecto | Mitigación |
|---|---|---|
| El *port* no reproduce el motor | La escena se ve distinta | Arnés de referencia con el motor original y comparación píxel a píxel (§4) |
| SwiftShader no es una GPU real | Pruebas verdes que no garantizan rendimiento real | Se declara; P-12 mide en dispositivos |
| Rótulos en español no caben en las celdas del atlas (p. ej. «AUTOMATIZACIÓN» frente a «AUTOMATION») | Texto cortado en la escena | Medición por celda (CA-9); textos en borrador; ajustar la redacción, no la geometría |
| Contradicción roadmap ↔ diseño en Arquitectura | Trabajo desechable o rediseño | P-27 antes de empezar |
| Contenido técnico no verificado (P-20, P-22) | Afirmar lo que Julio no confirmó | P-28; política de contenido aplicada también al atlas |
| Contextos WebGL acumulados al navegar | El navegador destruye el más viejo, avisos en consola | `dispose()` completo y prueba CA-6 |
| `IntersectionObserver` y el recorrido fijado del hero | Saltos de cuadro o cálculo de paso erróneo | Lógica de pasos de `Main.dc.html` portada tal cual; prueba de pasos por desplazamiento |
| Next envía JavaScript del motor a rutas que no lo usan | Peso extra en todo el sitio | `import()` dentro de la isla; prueba de bytes por ruta (CA-11) |
| Fuentes no cargadas al dibujar el atlas | Rótulos con fuente de respaldo | `document.fonts.load` antes de dibujar |
| `WEBGL_debug_renderer_info` retirado en algún navegador | El perfil no detecta GPU por software | El motor ya tolera su ausencia (cadena vacía) |

## 6. Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Relajar la CSP (`unsafe-eval`, `blob:`, *workers*) | ADR 006; el motor no lo necesita |
| Cargar el motor en todas las páginas | Peso innecesario (R4) |
| Imagen o vídeo de la escena en lugar del motor | Activo nuevo, no es el diseño |
| Renderizar en el servidor | WebGL es de cliente |

## 7. Modelo y esfuerzo recomendados

Ver `tasks.md`. **Opus, esfuerzo alto** para el *port*, el envoltorio, el
recorrido del hero y el contenido de Arquitectura; **Sonnet, esfuerzo medio**
para preflight, CSP, pruebas derivadas y documentación.
