# R2 — Isla `Scene3D`, textos, CSP e Inicio con la escena (T4–T7)

**Fecha:** 2026-11-13. **Rama:** `claude/admiring-babbage-bjvbo8`.
**Estado:** ronda R2 ejecutada y **▲B1 aprobada por Julio (2026-11-13)**, con
P-34 = A, P-35 = B y P-36 = A (§6). Lo que sigue es el informe tal como se
presentó. La CSP, el proxy,
`scripts/csp-manifest.mjs`, `scripts/lib/csp-scan.mjs`, `next.config.ts` y
`package.json` **no se tocaron**. La página Arquitectura sigue siendo el
esqueleto de la 002: su contenido ya está en `src/content` (T5), la página es de
la R3 (T8).

## 1. Qué hay ahora

| Pieza | Archivo | Qué hace |
|---|---|---|
| Isla | `src/components/scene3d/Scene3D.tsx` | Importa el motor y crea el `<canvas>` solo al acercarse al viewport (200 px); respaldo `Plates stack` sin WebGL, sin la extensión, con el contexto perdido o sin JavaScript; 4 etiquetas DOM (`<button aria-pressed>`); `dispose()` al desmontar. |
| Hero | `src/components/sections/home/HeroScene.tsx`, `hero-tour.ts` | `.hero-pin` + `.hero` fijado; el desplazamiento recorre las 4 capas y cambia el rótulo `.hero-hint` (lógica de `Main.dc.html` sin cambios). Sin fijar a ≤ 1040 px, en pantallas muy altas y con `reduced-motion` (CSS del diseño). |
| Diagrama | `LayerPicker.tsx` | Escena `mode="diagram"` sincronizada con el selector: elegir en el selector, en una etiqueta o en una bandeja del lienzo es lo mismo. |
| Motor | `engine.ts` | Un rótulo vacío deja su celda transparente, sin recuadro (decisión de Julio); no vuelve a soltar un contexto ya perdido. |
| Textos | `src/messages/{es,en}/home.json` | 15 rótulos del atlas, rótulo y 4 pasos del recorrido; vuelve la frase «The moving lights show data travelling between them». EN del diseño; ES en borrador. |
| Arquitectura (contenido) | `src/content/architecture.ts`, `schema.ts`, `policy.ts`, `src/messages/{es,en}/architecture.json` | 7 tipos de sistema, 17 bandas y 42 piezas del artboard, con las condiciones de P-28 dentro del esquema. Todo `draft`. |
| CSS | `src/styles/design.css` | Reglas de `site.css` 270, 278, 299, 306, 486–487 y 498–505, literales; se retira `.hero-static` (DA-2). |

## 2. Criterios de aceptación de la ronda

Todas las pruebas corren contra el build de producción, en Chromium sin cabeza
(SwiftShader, perfil `low`), a 1440×900 y 390×844.

| CA | Qué se comprobó | Resultado |
|---|---|---|
| **CA-3** carga diferida | Con las dos escenas fuera del viewport (`/es#h-go`): 0 peticiones del *chunk* del motor, 0 `getContext('webgl')`, 0 `<canvas>`. Al acercarse el diagrama: 1 petición, 1 contexto. Al cargar Inicio: solo el hero; el diagrama espera. Las **32 rutas sin escena**, una a una: 0 peticiones, 0 contextos, 0 lienzos tras hidratar y desplazar. | Superado |
| **CA-4** respaldo | Sin WebGL y sin `OES_standard_derivatives`: `Plates stack` en el hero y en el diagrama, sin lienzo ni etiquetas, sigue al selector de capas, 0 errores de consola. Pérdida de contexto (`WEBGL_lose_context`): la escena deja paso al respaldo, 0 errores. Sin JavaScript: se ve el respaldo. | Superado |
| **CA-5** `reduced-motion` | 0 cuadros nuevos en 2 s; elegir una capa pinta exactamente un cuadro (9 `drawArrays`); hero sin fijar (`.hero-pin` mide lo que `.hero`); rótulo de recorrido oculto. | Superado |
| **CA-6** liberación | 10 idas y vueltas Inicio ⇄ Trabajo por la navegación, sin recargar: 11 contextos creados, **1 vivo** al volver y **0** al salir; 16 objetos borrados por visita (160 en total); sin el aviso «Too many active WebGL contexts»; 0 errores. | Superado |
| **CA-7** pausa | 0 cuadros con `document.hidden` y 0 con las dos escenas fuera de pantalla (en pantalla, el bucle pinta). | Superado |
| **CA-8** accesibilidad | Lienzos `aria-hidden`; panel `aria-live`; 4 etiquetas con nombre localizado y `aria-pressed`; con teclado: orden de tabulación, `:focus-visible` con contorno, Enter elige la capa y el panel la anuncia; axe (WCAG 2.2 AA) sin violaciones serias en `/es` y `/en` con la escena en marcha, a 1440 y 390. A 390 el motor oculta las etiquetas (como el diseño) y no reciben foco. | Superado en Inicio. Arquitectura: T8 |
| **CA-9** idioma | El atlas se pinta con los 15 rótulos de `es`; al cambiar a EN con el selector, sin recargar el documento, se repinta con los de `en` y cambian las etiquetas. Cada rótulo, medido con la fuente del sitio a 38 px, cabe en su celda con 12 unidades de aire por lado (el más ancho, 14 caracteres: 319 de 390). | Superado |
| **CA-10** CSP (T6) | Build: manifiesto de 34 rutas con hashes, sin cambios en el generador. `/es` y `/en`: encabezado en modo hash, HTML sin `style=` ni `<canvas>`, **0 violaciones** de CSP recorriendo el hero, usando el diagrama y pasando una medición del motor. `csp.spec.ts` P1–P14 sin cambios y en verde. | Superado en Inicio |
| **CA-12** fidelidad | Arnés repetido con el motor ajustado: 124 de 124 cuadros idénticos y trazas iguales. Rótulo oculto: solo cambian las 2 subidas del atlas; 1 063 píxeles (el recuadro). Lienzos en la página: 1440×824, 845×638, 390×360 y 348×378, los del arnés. | Motor: superado. Página frente a la réplica de `Main`: T10 |
| **CA-13** contenido | Vitest: política de contenido completa en mensajes y contenido; excepción de P-28 acotada a los nombres de nodo de Arquitectura y vigilada (§4). | Superado |
| **CA-14** dependencias | `package.json` y `package-lock.json` sin cambios; `npm audit --omit=dev`: 0. | Superado |
| **CA-11** presupuesto | Ver §3. **Un punto no se cumple al pie de la letra** y necesita decisión (P-34). | Parcial |

Pruebas: `tests/e2e/scene.spec.ts` (nueva), `pages.spec.ts` y `quality.spec.ts`
(ajustadas), `tests/unit/{architecture,hero-tour,messages,content,content-schema}.test.ts`.

**Totales (árbol final):** `verify` código 0 (19 archivos y 232 pruebas unitarias; manifiesto de 34
rutas); e2e **947 superadas, 47 omitidas a propósito, 0 fallidas** (solo Chromium,
P-17); `npm audit --omit=dev`: 0. La línea base de la ronda era 205 unitarias y
844 e2e.

## 3. Peso (P-29)

Medido en el build de producción, sumando los `.js` de `/_next/static/chunks/`
que cada ruta descarga (gzip -9 de cada archivo). Línea base: el commit anterior
a la R2 (`f0517f6`), construido en una copia desechable.

| Medida | Antes de R2 | Con R2 | Presupuesto (P-29) | |
|---|---|---|---|---|
| *Chunk* del motor | — | 29 238 B · **11 428 B gzip** | ≤ 25 KB gzip | Cumple (45 %) |
| JavaScript de Inicio | 520 947 B · 156 566 gzip | 553 101 B · 169 182 gzip | — | + el motor y la isla |
| JavaScript de una ruta **sin** escena | 520 947 B · 156 566 gzip | 523 863 B · 157 684 gzip | **+0 B** | **+2 916 B (+1 118 B gzip): no cumple** |
| Motor en rutas sin escena | — | 0 peticiones (32 rutas) | nada | Cumple |
| Nada antes del viewport (200 px) | — | 0 peticiones, 0 contextos | nada | Cumple |
| Tarea larga de arranque, LCP de Inicio | — | sin medir | ≤ 200 ms, ≤ 2,5 s | T9 (R4) |

**Por qué +2 916 B.** No es el motor: es el código de las islas (`Scene3D`,
`HeroScene`, el recorrido). El empaquetador de Next (Turbopack) junta los
componentes de cliente pequeños en *chunks* que cargan todas las rutas: antes de
la R2 ya ocurría (las 34 rutas descargan los mismos 11 scripts, incluido el
selector de capas de Inicio). **Alternativa medida y descartada:** cargar la isla
con `React.lazy` + `Suspense` la sacaría del *chunk* común, pero React emite
entonces scripts en línea (`$RC`…) que el manifiesto de CSP no contempla y el
build falla, como debe. No se tocó la CSP. → **P-34** (§6).

El HTML de cada página crece además unos 1 100 B (≈ 450 B gzip): son los
mensajes nuevos, que `NextIntlClientProvider` envía enteros a todas las páginas
(P-24, ya abierto).

## 4. Contenido de Arquitectura y P-28

`src/content/architecture.ts` sale del artboard: los 7 tipos de sistema en su
orden, sus 33 bandas (17 rótulos distintos) y las 42 piezas que alguna pestaña
usa. El inglés es el del artboard, comprobado por prueba cadena a cadena; el
español es borrador. El artboard define una pieza más, «Browser», que ninguna
pestaña usa: no se traslada.

| Condición de Julio (P-28) | Cómo queda | Lo vigila |
|---|---|---|
| Se muestran las 12 tecnologías y «Monitoring» | 12 nodos `technology: true` con el nombre igual en los dos idiomas; el nodo `monitor` | `ARCHITECTURE_TECHNOLOGIES` (lista cerrada en el esquema): otra tecnología rompe el build |
| «Monitoring» como capa, sin promesas | El texto del artboard («…so problems get noticed before customers report them») **se sustituyó**: «A layer of the architecture that records errors and performance data. It is added when a system needs it.» / «Capa de la arquitectura que registra errores y datos de rendimiento. Se agrega cuando un sistema la necesita.» | Prueba: sin «continuo», alertas, cobertura, tiempos ni «antes de que» |
| Redis opcional, «cuando el proyecto lo requiere» | ES: «Es opcional: se agrega solo cuando el proyecto lo requiere.» EN, el del artboard: «…added only when speed or background work calls for it.» Solo aparece en bandas punteadas. No se tocó `TECH-STACK.md` (no existe aún, P-01) | Prueba |
| Electron general, sin cliente ni caso POS | «Packages the software as a desktop program when a project needs one.» | Prueba: sin «POS», «cliente», «caso» |
| Descripciones en `draft` | 67 bloques nuevos en borrador (42 piezas, 17 bandas, 7 sistemas y los textos de la página) | Prueba |
| La lista vive en `src/content/architecture.ts` con su esquema | `architectureSchema` dentro de `contentSchema`: un contenido inválido rompe `next build` y Vitest | 7 pruebas de rechazo |

**La excepción no se extiende.** La política de contenido sigue vedando esos
nombres en todo lo demás (caso POS, Servicios, Acerca de, mensajes): la exención
solo existe para el nombre de un nodo de Arquitectura, y solo si está en la
lista cerrada. Los rótulos `POSTGRESQL` y `MONGODB` del atlas van en mayúsculas,
como en el diseño.

## 5. Diferencias respecto al diseño (para revisar en ▲B1)

| # | Diferencia | Motivo |
|---|---|---|
| 1 | Las etiquetas de capa no se ven hasta que el motor las coloca (`[app] .a3-tag { visibility: hidden }`). En el diseño asoman un instante en la esquina del lienzo. | Evitar el parpadeo al cargar; el estado final es el del diseño. |
| 2 | Antes de que cargue el motor, el hueco de la escena está vacío (fondo de la página); en el diseño el lienzo ya existe, también vacío. | Carga diferida (spec §3.1): el servidor no pinta `<canvas>`. |
| 3 | Sin JavaScript se ve el respaldo `Plates stack` (`<noscript>`). El diseño no funciona sin JavaScript. | Conservar lo que ya hacía la 002. |
| 4 | Con el respaldo (sin WebGL) el rótulo «Scroll to follow…» y el recorrido siguen activos y resaltan la placa de la capa. | Así lo hace el diseño (`Plates active`). |
| 5 | Chromium escribe un **aviso** (no error) en consola, «GPU stall due to ReadPixels», hasta 4 veces: es la medición temporizada del motor (1 píxel cada 1,2 s, del diseño). `quality.spec.ts` lo admite expresamente; cualquier otro aviso o error sigue fallando. | Comportamiento del diseño; no llega al usuario. |
| 6 | El panel de la capa «Datos» sigue sin nombrar PostgreSQL ni MongoDB (texto y etiquetas de la 002), mientras el atlas sí los rotula. | P-28 cubre el atlas; el panel no entró en la decisión → P-35. |

## 6. Decisiones que se piden a Julio

| ID | Decisión | Opciones | Recomendación |
|---|---|---|---|
| **▲B1** | Revisión visual de Inicio con la escena. | Capturas en `capturas/b1-*.png` (ES/EN, 1440/390, con y sin WebGL, `reduced-motion`, un paso del recorrido). | — |
| **P-34** | CA-11 pide «±0 B» de JavaScript en las rutas sin escena y hay +2 916 B (+1 118 B gzip) del código de la isla. | **A.** Aceptarlo y precisar el criterio: «el motor no se carga en rutas sin escena; el envoltorio de la isla, ≤ 1,5 KB gzip». **B.** Estudiar el troceado del empaquetador en `next.config.ts` (fuera del alcance de la 003; habría que autorizar tocarlo y medir). **C.** Quitar el recorrido del hero o partes de la isla para adelgazarla (cambia P-30). | **A.** El motor (11,4 KB) no viaja a ninguna otra ruta; 1,1 KB es el coste del envoltorio con este empaquetador, y la vía para evitarlo choca con la CSP. |
| **P-35** | Panel de la capa «Datos» en Inicio. | **A.** Dejarlo como en la 002 (sin tecnologías). **B.** Volver al texto del diseño («…PostgreSQL, MongoDB, data storage…» y las etiquetas `PostgreSQL`, `MongoDB`), ahora que el atlas los rotula. | Sin recomendación: es contenido (P-20). Con A, escena y panel no dicen lo mismo. |
| **P-36** | Electron en las pestañas «POS: local» y «POS: híbrido» del artboard (para la R3). | **A.** Como el artboard. **B.** Mostrar Electron solo en «Mobile & desktop». | Es para ▲B2; lo adelanto porque la condición «sin el caso POS» y `caso-pos.md` §5 pueden chocar con A. El contenido ya permite cualquiera de las dos. |
| Textos | Borradores nuevos en español: 13 rótulos del atlas, rótulo y 4 pasos del recorrido, y los de Arquitectura. | — | Se revisan con el resto de borradores (P-04, P-22). |

## 7. Capturas para ▲B1 (`capturas/b1-*.png`)

| Captura | Qué muestra |
|---|---|
| `b1-es-1440-hero.png`, `b1-en-1440-hero.png` | Hero a 1440×900 con la escena, las 4 etiquetas y el rótulo de recorrido |
| `b1-es-1440-recorrido-datos.png` | El hero fijado a mitad del recorrido: capa «Datos» resaltada y su rótulo |
| `b1-es-1440-construccion-datos.png`, `b1-en-1440-construccion-sistema.png` | «How it's built» con la capa Datos y con el sistema completo |
| `b1-es-390-hero.png`, `b1-en-390-hero.png`, `b1-es-390-construccion.png` | Lo mismo a 390×844 (sin etiquetas ni recorrido, como el diseño) |
| `b1-es-1440-hero-sin-webgl.png`, `b1-es-1440-construccion-sin-webgl.png`, `b1-es-390-hero-sin-webgl.png` | Respaldo `Plates stack` |
| `b1-es-1440-hero-reduced-motion.png` | `prefers-reduced-motion`: un cuadro fijo, hero sin fijar y sin rótulo |

Las capturas del hero animado a 1440 salen al 80 % de resolución
(`low 1152x659 step1`): con SwiftShader cada cuadro cuesta más de 24 ms y el motor
baja un peldaño tras su primera medición, como manda el diseño con una GPU lenta.
La de `reduced-motion` y las de «How it's built» están a resolución completa. En
una GPU real el perfil es `high` (P-12).

## 8. Límites y riesgos

- **GPU real, otros navegadores:** igual que en R1 (P-12, P-17). Todo lo medido
  es SwiftShader en Chromium.
- **Carga de las pruebas:** con muchas páginas pintando a la vez, el motor baja
  su resolución un peldaño (lo hace el diseño cuando un cuadro cuesta más de
  24 ms). Las pruebas lo admiten; en un equipo real no ocurre por eso.
- **`prefers-reduced-motion` y el recorrido** se leen al montar: si la
  preferencia cambia con la página abierta, el CSS suelta el hero al momento,
  pero la escena sigue animada hasta recargar.
- **Recorrido al cargar a media página:** el paso solo se calcula al desplazar
  (como el diseño); si el navegador restaura el desplazamiento dentro del tramo,
  el rótulo no cambia hasta el primer movimiento.
- **Duración de la suite e2e:** de 2,9 a 7,8 minutos en local (103 pruebas
  nuevas y, sobre todo, cada prueba que abre Inicio pinta ahora el hero por
  software). La CI tiene un tope de 20 minutos por ejecución: se confirma con
  la primera ejecución tras el push.
- **Tarea larga y LCP** de Inicio: sin medir todavía (T9).
- **Página real frente a la réplica de `Main.dc.html`:** T10.
