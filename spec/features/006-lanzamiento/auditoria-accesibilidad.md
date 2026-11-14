# 006 · T12 — Auditoría de accesibilidad WCAG 2.2 AA

**Estado: parte local ejecutada (2026-11-13, R3-local).** La parte que necesita
el preview queda para después de la T10 (§5). Ningún hallazgo se corrigió en
el código de la aplicación: el único que incumple un criterio cambia
animaciones aprobadas y espera la decisión de Julio (**P-58**).

## 1. Base y método

| Dato | Valor |
|---|---|
| Base | `6029715` (rama `claude/admiring-babbage-bjvbo8`) más las pruebas de esta tarea |
| Build | `SITE_ORIGIN=http://localhost:3100 npm run build`, `next start` en el puerto 3100 (`BUILD_ID` `inSlECV2KH37Wgh-qSmb2`) |
| Herramientas | Playwright 1.63.0 (Chromium sin cabeza), `@axe-core/playwright` 4.14.0 con axe-core 4.14.0. Sin dependencias nuevas |
| Anchos | 1440 × 900 (`desktop`) y 390 × 844 (`mobile`); además 320 px y 640 px (zoom al 200 % de 1280) |
| Rutas | Las 32 de `tests/e2e/routes.ts` (es y en) y el 404 (`/es/no-existe`, `/en/no-existe`, `/foto.png`) |
| Escena 3D | Proyectos `desktop-webgl` y `mobile-webgl` (WebGL por software, P-12) |

Pruebas nuevas, que quedan en la suite:

- `tests/e2e/a11y.spec.ts`: axe con las reglas A y AA de WCAG 2.0, 2.1 y 2.2
  (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) y **cualquier
  severidad**. Las pruebas anteriores solo fallaban con `serious` o
  `critical`. Cubre las rutas, el 404 y estados abiertos: hoja móvil, cada capa
  del selector de Inicio y cada una de las 7 pestañas de Arquitectura.
- `tests/e2e/a11y-review.spec.ts`: lo que axe no ve (`plan.md` §4.4).
- `tests/e2e/a11y-helpers.ts`: `settle()`, que espera a que terminen las
  transiciones antes de medir.
- `tests/e2e/scene.spec.ts`, CA-8: axe con la escena en marcha pasa a exigir 0
  violaciones de cualquier severidad.

## 2. Resultado por criterio

| Criterio WCAG 2.2 | Cómo se comprobó | Resultado |
|---|---|---|
| Reglas automáticas A y AA (1.1.1, 1.3.1, 1.4.3, 2.4.2, 2.5.8, 4.1.2, …) | axe en 32 rutas + 3 del 404, a 1440 y 390; estados abiertos; escena con WebGL | **0 violaciones** de cualquier severidad (§3) |
| 2.1.1, 2.1.2, 2.4.3 Teclado, sin trampas, orden | Tab desde el principio hasta salir del documento y Mayús+Tab de vuelta, en 34 rutas y 2 anchos. Se compara con la lista de elementos tabulables visibles del DOM | **Cumple**: se recorren todos en el orden del documento, sin tabindex positivos y sin trampas. La hoja móvil, las pestañas y las etiquetas de la escena ya tenían sus pruebas (`navigation.spec.ts`, `architecture.spec.ts`, `scene.spec.ts`) |
| 2.4.7 Foco visible | En cada parada: `:focus-visible` y contorno o sombra calculados | **Cumple** en todas las paradas |
| 2.4.11 Foco no tapado | En cada parada, cinco puntos del elemento con `elementFromPoint`: falla si la navegación fija u otro elemento lo tapa por completo | **Cumple** |
| 1.4.11 Contraste del indicador de foco | Color del contorno frente al fondo | **Cumple** (≥ 3:1 en todas las paradas) |
| 1.4.3 Contraste en foco y al pasar el puntero | Peor contraste entre los textos del elemento, con la opacidad acumulada; puntero sobre cada tipo de enlace y botón (en escritorio) | **Cumple**. Al pasar el puntero, 0 elementos sin poder medir. En foco: observación O-1 |
| 2.5.8 Tamaño del objetivo | Regla `target-size` de axe, más medición | **Cumple**. El más chico es el selector ES \| EN (32 × 44 px); los chips de Arquitectura miden 44 px de alto y los enlaces del pie 32–34 px |
| 1.4.10 Reflujo | 320 px: sin desplazamiento horizontal y sin texto recortado ni fuera de la página | **Cumple**. La fila de pestañas de Servicios se desplaza en horizontal **dentro de su región**, como en el diseño; sus pestañas se alcanzan con el tabulador |
| 1.4.4 Cambio de tamaño del texto | 640 px de ancho (equivale al zoom del 200 % en 1280 × 900), mismas comprobaciones | **Cumple** |
| 1.4.12 Espaciado del texto | Hoja de prueba de WCAG (interlineado 1,5; letras 0,12 em; palabras 0,16 em; párrafos 2 em) en las 34 rutas, a 1440 y 390 | **Cumple**: sin texto recortado ni desplazamiento horizontal. La hoja se inyecta con `<style>`, que la CSP bloquea: **solo ese navegador de prueba** ignora la CSP (`bypassCSP`); el sitio no cambia |
| 2.3.3 / C39 `prefers-reduced-motion` | Animaciones en marcha con esa preferencia, en 34 rutas; escena con WebGL (`scene.spec.ts` CA-5) | **Cumple**: 0 animaciones en marcha; la escena pinta un cuadro fijo |
| **2.2.2 Poner en pausa, detener, ocultar (A)** | Inventario de animaciones infinitas sin esa preferencia; cuadros de la escena en reposo | **Hallazgo T12-1** (§4) |
| 3.1.1 Idioma de la página | `lang` del documento en 32 rutas | **Cumple** (`es` y `en`) |
| 3.1.2 Idioma de las partes | 404 sin idioma en la URL (`/foto.png`) | **Cumple**: cada mitad lleva su `lang`. Observación O-2 sobre «This» |
| 2.4.2 Página titulada | Título único dentro de cada idioma | **Cumple**. Inicio se titula «THIS JULIO» en los dos idiomas: es el nombre, y está bien |
| 1.3.1, 2.4.6 Encabezados y regiones | Un `h1`, sin saltos de nivel, un `main`, `header` y `footer` | **Cumple** en 32 rutas |
| 2.5.3 Etiqueta en el nombre | Cada `aria-label` contiene el texto visible | **Cumple** |
| 3.2.3 Navegación consistente, 3.2.6 Ayuda consistente | Cabecera (navegación, CTA, selector) y pie iguales y en el mismo orden en todas las rutas de cada idioma; Contacto en el mismo lugar | **Cumple** |
| 2.1.4 Atajos de una tecla | Revisión del código: el único manejador de teclado global es `Escape` en la hoja móvil | **No aplica** |
| 1.2.x Multimedia, 3.3.x Formularios, 1.3.5 Propósito de las entradas | El lanzamiento no tiene audio, vídeo ni formularios (la 004 los traerá) | **No aplica** |
| 1.3.1, 4.1.2 con lector de pantalla (VoiceOver) | — | **Pendiente: preview** (§5) |

## 3. Comandos y resultados

| Comando | Resultado |
|---|---|
| `npx playwright test tests/e2e/a11y.spec.ts --project=desktop --project=mobile` | 75 superadas, 1 omitida a propósito (la hoja móvil no existe a 1440). Las pruebas de estados se repitieron 3 veces (`--repeat-each=3`): 15 de 15 |
| `npx playwright test tests/e2e/a11y-review.spec.ts --project=desktop --project=mobile` | 81 superadas, 3 omitidas a propósito (puntero y anchos fijos: basta un proyecto) |
| `npx playwright test tests/e2e/scene.spec.ts --project=desktop-webgl --project=mobile-webgl -g CA-8` | 5 superadas, 1 omitida a propósito (las etiquetas no existen a 390) |
| `npx playwright test` (suite completa, con las pruebas nuevas) | 1 345 superadas, 135 omitidas a propósito, 0 fallidas, 9,5 min. Una inestable en Firefox (`locale-switcher.spec.ts`, `/es/blog ⇄ /en/blog`), que pasó en el reintento: es la pérdida del aviso de carga de Playwright descrita en la T8 |

Dos falsos positivos del instrumento, resueltos sin tocar el sitio:

1. **Contraste a mitad de una transición.** axe midió un chip de Arquitectura
   durante su cambio de color (160 ms) y dio `color-contrast`. Aislado y al
   terminar la transición no hay violación. `settle()` espera a que termine.
2. **Revelado al desplazar.** Medido un cuadro antes de que la animación
   ligada al desplazamiento se actualizara, un texto salía a opacidad 0
   (1,00:1). `settle()` espera dos cuadros.

## 4. Hallazgos

| Id | Severidad | Criterio | Ruta | Qué pasa | Corrección | Prueba que lo fija |
|---|---|---|---|---|---|---|
| **T12-1** | **Media**: incumple un criterio de nivel A | 2.2.2 | `/es` y `/en` (escena 3D del hero, con WebGL); `/es/arquitectura` y `/en/architecture` (`flow` en `.arch-link::after`); `/es/servicios/sistemas-pos` y `/en/services/pos-systems` (`dash` en el esquema de `Deploy`) | Se mueven solas más de 5 s, junto a otro contenido, y la página no ofrece cómo detenerlas. Medido: la escena en reposo dibuja unas 300 veces cada 2 s (631 → 1 243 → 1 819 → 2 404 → 2 935 `drawArrays`). Con `prefers-reduced-motion` todas se detienen, y la escena se pausa fuera de la pantalla y con la pestaña oculta (CA-7). Pero la preferencia del sistema no es, según las técnicas de W3C, un mecanismo suficiente para 2.2.2 (C39 es técnica de 2.3.3, AAA) | **Sin aplicar**: cambia animaciones aprobadas (CLAUDE.md §5). Opciones en **P-58** | `a11y-review.spec.ts`, «movimiento»: el inventario actual queda fijado (aparece una animación continua nueva → falla) y con movimiento reducido no puede quedar ninguna |
| O-1 | Observación | 1.4.3 | Filas de servicio en Inicio (`a.row`) | El revelado al desplazar (`.rv`, `animation-range: entry 0% entry 42%`) deja a opacidad parcial un elemento que asoma por el borde inferior. Si alguien desplaza la página hasta dejar la fila en el borde y la enfoca, su texto baja a unos 2,6:1 (opacidad 0,53, medido) hasta que se desplaza más. En el recorrido normal con el tabulador **ninguna** parada queda con opacidad parcial (68 de 68 recorridos) | Ninguna: es el efecto aprobado y afecta igual con el ratón. Si Julio quiere, un cambio mínimo sería `.rv:focus-within { animation: none }` | El recorrido con teclado registra las paradas con opacidad parcial (adjunto de la prueba) |
| O-2 | Observación | 3.1.2 | Títulos con la firma «This» en español («This es cómo se construye.») | `<span class="this">` no lleva `lang="en"`. No incumple: 3.1.2 exceptúa los nombres propios y «This» es parte de la marca. Un lector en español lo pronuncia con fonética española | Ninguna. Opcional: `lang="en"` en el `span` de las páginas en español, que no cambia el aspecto | — |
| O-3 | Observación (texto, G1) | 2.4.6 | Hoja móvil en inglés | La región se llama «Mobile» en inglés y «Menú móvil» en español (`nav.json`, `mobileLabel`). Un lector dice «Mobile, navigation». Se entiende, pero es menos claro que en español | Ninguna: es un texto en borrador; se revisa con G1 | — |

## 5. Lo que queda para el preview (después de la T10)

| Qué | Por qué no en local | Quién |
|---|---|---|
| VoiceOver en Safari de macOS e iOS: encabezados, regiones, nombres, hoja móvil, pestañas, selector de capas, 404 | Safari no hidrata sobre `http://localhost`: `upgrade-insecure-requests` sube los scripts a HTTPS. El arnés HTTPS usa un certificado de prueba que Safari real no acepta sin cambiar la configuración del sistema | Julio, con la lista de la T11 |
| Una muestra de axe (Inicio, Arquitectura, un servicio, el 404) contra el preview | Confirmar que el CDN no altera el DOM | Agente, en la ventana de P-56 |
| Escena 3D en una GPU real (2.2.2, 2.3.3) | Aquí solo hay WebGL por software (P-12) | Julio, a mano |

**Límite declarado** (`plan.md` §4.4): no hay lector de pantalla de Windows
disponible.
