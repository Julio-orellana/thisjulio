# 006 — Evidencia de la ronda R1 (T1–T8)

**Fecha:** 2026-11-13. **Sobre:** `0b58658` (▲C0). **Para:** la revisión de ▲C1.

Todo se midió con el build de producción servido en local. **Nada se contrató,
conectó ni desplegó.** Lo que depende del hosting (preview, CDN) es de la R2.

## 1. Resumen

| Tarea | Resultado |
|---|---|
| T1 Preflight | Línea base: `verify` código 0 (233 unitarias, 34 rutas) y e2e 981 superadas, 53 omitidas, 0 fallidas |
| T2 Puertas de publicación | Último paso del build. Hoy las cuatro están abiertas; un build con el origen de producción **falla** y queda sin manifiesto de CSP (§5) |
| T3 Contacto provisional | Página con piezas del diseño. El correo lo arma una isla; **no aparece en el HTML ni en la carga RSC** (§3). Sin dirección todavía no se pinta el enlace |
| T4 Enlaces al estimador | 32 rutas. El CTA lleva a Contacto; `/estimador` responde el 404 propio (§2) |
| T5 SEO | Canonical, `hreflang`, Open Graph, `robots.txt`, `sitemap.xml` (28 URL) y JSON-LD (§4) |
| T6 Mensajes al navegador | HTML entre un 13 % y un 37 % más ligero (§6) |
| T7 Presupuesto por ruta | Las 32 rutas dentro de los límites de P-46 en las condiciones aprobadas. **Hallazgo:** con red más lenta, una página pasa del límite de CLS (§6, P-55) |
| T8 Firefox y WebKit | CSP, 404 y navegación en verde en los tres motores bajo HTTPS (§7) |

**Encontrado y corregido en esta ronda** (no estaba en el plan): el selector
ES | EN traía enlaces rotos en el HTML del servidor de las páginas con slug en
español (§2.2).

**Para decidir en ▲C1:** P-54 (§2.3), P-55 (§6) y lo que se lista en §9.

## 2. Enlaces y rutas (T4)

### 2.1 Qué cambió

| Sitio | Antes | Ahora |
|---|---|---|
| CTA de la navegación y del menú móvil | → `/estimador` | → `/contacto` |
| Botón del hero de Inicio («Iniciar un proyecto») | → `/estimador` | → `/contacto` |
| Cierre de Inicio | dos caminos: «Obtén un estimado rápido» y «Habla directamente conmigo» | solo «Habla directamente conmigo» |
| Footer | enlace «Estimador de proyectos» | omitido |
| Cierre de Arquitectura, Acerca de, Servicios y el caso | → `/estimador` | → `/contacto` |
| `/es/estimador`, `/en/estimate` | esqueleto con un título | no son rutas: 404 propio, sin redirección |

Los textos del estimador siguen en `src/messages` sin usarse (`footer.estimate`,
`home.final.estimate`, `home.final.estimateText`, `cta.estimateThis`,
`pages.estimate`): la 004 los vuelve a conectar. Ya no viajan al navegador (§6).

Comprobado (`tests/e2e/links.spec.ts`, `not-found.spec.ts`): todos los enlaces
internos del HTML del servidor llevan a una ruta pública que responde 200;
ninguno apunta al estimador ni al blog; ningún texto visible nombra el
estimador.

### 2.2 Defecto encontrado: el selector de idioma en el HTML del servidor

El rastreo de enlaces lee el HTML tal como lo sirve el servidor, que es lo que
ve un buscador. En las páginas con slug **en español** (los 7 servicios y el
caso), el selector ES | EN traía dos enlaces que no existen:

| Página | Enlaces del selector en el HTML (antes) | Ahora |
|---|---|---|
| `/es/servicios/apis-y-automatizacion` | `/es/services/apis-y-automatizacion`, `/en/services/apis-y-automatizacion` | `/es/servicios/apis-y-automatizacion`, `/en/services/apis-and-automation` |
| `/es/trabajo/sistema-pos-de-escritorio` | `/es/work/sistema-pos-de-escritorio`, `/en/work/sistema-pos-de-escritorio` | `/es/trabajo/sistema-pos-de-escritorio`, `/en/work/desktop-pos-system` |

Venía de la 002 y no se veía porque al hidratar se corregía (las pruebas del
selector pulsan el enlace con JavaScript). Causa: al prerenderizar, la ruta de
esas páginas llega como ruta interna y no como plantilla. Arreglo:
`templateOf` en `src/i18n/alternate.ts`, con sus pruebas. Sin él, un buscador
habría encontrado 16 URL rotas en 8 páginas.

### 2.3 Decisión pendiente: P-54

- **(a) Botón de cada servicio.** El diseño dice «Estimate this». La
  planificación no lo listó. Ahora dice «Iniciar un proyecto» (texto que ya
  existe) y lleva a Contacto. Alternativa: omitirlo hasta la 004.
- **(b) Dos botones al mismo sitio.** En Acerca de («Iniciar un proyecto» y
  «Contáctame») y en el caso («Iniciar un proyecto» y «Hacer una pregunta»), los
  dos llevan ahora a Contacto. Se dejaron los dos, como en el diseño.
  Alternativa: omitir el secundario.

Capturas: `capturas/c1-servicios-boton-es-1440.png`,
`capturas/c1-acerca-cierre-es-1440.png`.

## 3. Contacto provisional (T3)

- **Composición:** título (`pages.contact`), un rótulo, una línea de apoyo y
  dos caminos con el estilo `.path-link` del cierre de Inicio: correo y GitHub.
  Sin CSS nuevo, sin formulario, sin promesas de plazo.
- **Textos nuevos, en borrador** (`src/messages/{es,en}/contact.json`): pasan a
  ser 102 bloques en `draft`.
- **Sin dirección todavía.** `src/config/contact.ts` vale `null` (puerta G4):
  la página muestra solo GitHub. No se inventó ninguna dirección.

**Prueba con una dirección de prueba**, solo en una copia fuera del repositorio
(`prueba@thisjulio.com`, que no existe):

| Comprobación | Resultado |
|---|---|
| Archivos del build (HTML y carga RSC) con la dirección | **0** |
| Archivos del build con `mailto:` | **0** |
| *Chunks* de cliente con la dirección completa escrita | **0** (las dos partes van por separado en un *chunk*) |
| e2e de Contacto con dirección (enlace al hidratar, teclado, HTML y RSC sin dirección, lectura sin JavaScript), en escritorio y móvil | 17 superadas, 5 omitidas (las del estado sin dirección) |
| CSP, accesibilidad, red y consola de las rutas de Contacto con la isla activa | 11 superadas |
| Capturas | `capturas/c1-contacto-con-correo-de-prueba-*.png`, `capturas/c1-contacto-sin-javascript-es-1440.png` |

Lo que no cubre, dicho sin rodeos: un rastreador que ejecute JavaScript ve la
dirección. La defensa de fondo es que sea un alias (P-42).

## 4. SEO (T5)

Medido sobre el HTML del build (`tests/e2e/seo.spec.ts`, 28 páginas indexables
por idioma) y sobre las funciones (`tests/unit/seo.test.ts`,
`seo-origin.test.ts`):

| Pieza | Resultado |
|---|---|
| Canonical | Absoluto y autorreferenciado en las 28 páginas indexables |
| `hreflang` | `es`, `en` y `x-default` → español, recíprocos, con el slug de cada idioma |
| Duplicado del servicio 01 | Canonical a `/servicios`, sin `hreflang`, fuera del sitemap |
| Títulos y descripciones | Únicos por idioma |
| Open Graph | `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:locale` (`es_GT` / `en_US`) y su alterno. Sin imagen (P-48) |
| `sitemap.xml` | 28 URL (14 rutas × 2 idiomas), cada una con sus tres alternates; sin blog, sin estimador, sin `lastmod` |
| `robots.txt` | Con el origen de pruebas: `Disallow: /`, sin sitemap |
| JSON-LD | Solo en Inicio: `WebSite` y `Person` (nombre, URL, GitHub). Sin correo, cargo, dirección ni teléfono |
| Blog | Sigue `noindex`, sin canonical y fuera del sitemap |

**Con el origen de producción** (copia aislada; el build falla por las puertas,
pero deja el HTML para mirarlo):

| Comprobación | Resultado |
|---|---|
| `<meta name="robots">` de `/es` | `index, follow` |
| Canonical de `/es/trabajo` | `https://thisjulio.com/es/trabajo` |
| `robots.txt` | `User-Agent: *`, `Allow: /`, `Sitemap: https://thisjulio.com/sitemap.xml` |
| `sitemap.xml` | 28 URL de `https://thisjulio.com` |

**Tabla «campo de JSON-LD → fuente» (CA-7):**

| Campo | Valor | Fuente |
|---|---|---|
| `WebSite.name` | THIS JULIO | `src/config/site.ts` |
| `WebSite.url` | Inicio del idioma | origen del build + ruta |
| `WebSite.inLanguage` | `es` o `en` | idioma de la página |
| `Person.name` | Julio Orellana | `mission.md` §1; ya publicado en Acerca de (`src/content/about.ts`) |
| `Person.url` | Acerca de del idioma | origen del build + ruta |
| `Person.sameAs` | perfil de GitHub | `src/config/site.ts` |

## 5. Puertas de publicación (T2)

`node scripts/release-gates.mjs` es el último paso de `npm run build`. Con un
origen que no es el de producción informa y no bloquea. Estado de hoy
(`--report`):

| Puerta | Estado | Motivo |
|---|---|---|
| G1 Textos aprobados | Abierta | 102 bloques en borrador; sin fecha de Julio |
| G2 Legal revisado | Abierta | Legal lleva el rótulo de borrador en los dos idiomas; sin fecha |
| G3 Favicon e iconos | Abierta | No hay icono en `src/app/`; sin fecha |
| G4 Correo de contacto real | Abierta | No hay correo configurado; sin fecha |

Una puerta se cierra solo con **las dos cosas**: su condición comprobable y la
fecha que Julio registra en `release-gates.json`. Probado con 17 pruebas
unitarias: desde un estado con las cuatro cerradas, estropear una sola cosa
reabre exactamente esa puerta; quitar solo la fecha, también.

**Build de producción con las puertas abiertas** (copia aislada):
`SITE_ORIGIN=https://thisjulio.com npm run build` sale con **código 1**, lista
las cuatro puertas abiertas y **borra `.next/csp-manifest.json`**: ese build no
puede servir páginas.

## 6. Rendimiento (T6, T7)

Laboratorio: Chromium sin cabeza; móvil emulado con 4× CPU y 4G rápida.

| Métrica | Límite (P-46) | Antes de la R1 | Ahora |
|---|---|---|---|
| HTML por ruta (gzip) | ≤ 13 000 B | 7 342 – 12 114 B | **4 646 – 10 583 B** (mediana 7 408) |
| HTML por ruta (sin comprimir) | — | 25 828 – 65 502 B | 17 605 – 59 283 B |
| JavaScript, ruta sin escena (gzip) | ≤ 165 000 B | 157 684 B | **157 756 – 159 069 B** (la mayor, Contacto) |
| JavaScript, Inicio (gzip) | ≤ 177 000 B | 169 200 B | **169 272 B** |
| LCP | ≤ 2,5 s | 648 ms (solo Inicio) | **608 – 1 088 ms** en las 32 rutas |
| CLS | ≤ 0,05 | sin medir | **0** en las 32 rutas |
| Tiempo de bloqueo | ≤ 200 ms | sin medir | **8 – 39 ms** (tarea más larga, 89 ms) |
| Código de la escena en rutas sin escena (P-34) | ≤ 1,5 KB gzip | 1 119 B | **1 190 B** (157 756 − 156 566 de la línea base). Son 71 B más de código común que al cierre de la 003; lo único común que cambió en la ronda es el selector de idioma **[Inferencia]** |

- **P-45 (cierra P-24):** al navegador viajan solo `common`, `nav` y `work`.
  Las palabras «PostgreSQL» y «MongoDB» ya no están en el HTML de las 30 rutas
  que no son Inicio ni Arquitectura (lo vigila `transversal.spec.ts`).
- Contacto carga 1,3 KB más de JavaScript que las demás: es la isla del correo,
  que Next envía aunque todavía no se pinte.
- **Mutación del presupuesto** (copia aislada): con una isla común importando
  todos los mensajes, el JavaScript sube a 165 179–165 677 B gzip y la prueba
  **falla** en las 30 rutas sin escena.
- **Regresión visual de P-45:** `<main>` de las 12 rutas cuyo contenido no
  cambió, a 1440 y 390, antes (`0b58658`) y después: **24 de 24 capturas
  idénticas byte a byte**.
- **Hallazgo: CLS con red lenta (P-55).** Dentro de la suite completa, con la
  máquina cargada, `/en/architecture` en móvil dio CLS 0,11. No es ruido: con
  6× CPU y 4G lenta se reproduce siempre (0,1126). Al llegar la fuente web, la
  fila de pestañas pasa a ocupar una línea menos y lo de abajo sube 50 px. Con
  las condiciones del criterio (4× CPU, 4G rápida) la fuente llega antes de
  pintar y el CLS es 0. Medido en las 32 rutas con red lenta: a 390 px, solo
  esa pasa de 0,05 (`/es/trabajo` 0,04; `/en/blog` y el caso en español, 0,02);
  a 1440 px, el máximo es 0,01. **No se tocó la tipografía ni la maquetación:**
  es una decisión de diseño. La prueba toma la mejor de tres cargas en frío.
- Sin datos de campo: no hay analítica. La escena en GPU real sigue en P-12.

## 7. CSP en Firefox y WebKit (T8, P-17, P-52)

| Motor | Dónde | Resultado |
|---|---|---|
| Chromium | Suite normal (`http://localhost:3100`) y arnés HTTPS | En verde |
| Firefox | Suite normal y arnés HTTPS | En verde, con reintentos (ver abajo) |
| WebKit | **Solo** arnés HTTPS (`https://thisjulio.test`) | En verde: 115 de 115 |

- **WebKit no funciona sobre `http://localhost`.** Aplica
  `upgrade-insecure-requests` también ahí: pide los scripts por HTTPS, fallan
  por TLS y ninguna página hidrata (medido: 64 fallos). No es un defecto del
  sitio —en producción todo es HTTPS—, pero obliga a probarlo de otra forma.
- **Arnés `tests/https/run.mjs`:** construye con el origen
  `https://thisjulio.test` (dominio reservado, inexistente), levanta un frente
  TLS con un certificado desechable y un proxy que solo deja pasar ese host, y
  corre los mismos specs en los tres motores. Resultado final: **368 superadas,
  0 fallidas** (Chromium 138, Firefox 115, WebKit 115). En la primera pasada
  falló una prueba, no el sitio: en WebKit el tabulador no enfoca enlaces, como
  en Safari; se recorre con Opción+Tab, y la prueba ya lo tiene en cuenta.
- **Firefox, fallo intermitente de la herramienta.** Entre 1 y 3 de unas 140
  pruebas por pasada terminan por tiempo en `page.goto`, cada vez una distinta.
  Medido aparte (72 cargas en paralelo): la página sí terminó (`readyState`
  completo, 0 peticiones pendientes) y Playwright no recibió el aviso. Se dan
  2 reintentos **solo** al proyecto de Firefox. No es una violación de CSP: en
  ninguna pasada hubo una.
- El proxy del arnés rechazó un destino ajeno, `aus5.mozilla.org` (el servidor
  de actualizaciones que Firefox consulta por su cuenta; no lo pide la página).
- **Sigue pendiente (P-17):** Safari real en macOS e iOS, y el comportamiento
  detrás del CDN del hosting (R2).

## 8. Verificación final de la ronda

Sobre el árbol final de la ronda:

| Comprobación | Resultado |
|---|---|
| `SITE_ORIGIN=http://localhost:3100 npm run verify` | Código 0: lint, tipos, **292 de 292** pruebas unitarias (24 archivos), build, manifiesto de **32 rutas**, puertas (no bloquean: origen de pruebas) |
| `npm run test:e2e` (Chromium en 4 proyectos y Firefox) | **1 189 superadas, 131 omitidas a propósito, 0 fallidas**; 1 intermitente de Firefox que pasó al reintentar (6,0 min) |
| `tests/e2e/budget.spec.ts`, repetido tras escribir la excepción de P-55 | 34 superadas |
| `node tests/https/run.mjs` (origen `https://thisjulio.test`) | **368 superadas, 55 omitidas, 0 fallidas**: Chromium 138, Firefox 115, WebKit 115 |
| `npm audit --omit=dev` / `npm audit` | Producción: 0. Desarrollo: 8 moderadas (cadena de ESLint, sin cambios desde la 001) |
| `git diff 0b58658 -- src/proxy.ts src/lib/security scripts/csp-manifest.mjs scripts/lib/csp-scan.mjs next.config.ts` | Vacío: la CSP, el proxy, el manifiesto y `next.config.ts` no cambiaron |
| `package.json` | Solo cambia el guion `build` (añade las puertas). Ninguna dependencia nueva |
| `verify` de cada commit intermedio, por separado | Código 0 en los seis (238 a 292 unitarias) |

Una pasada anterior de la suite completa, antes de corregir la medición, dio
1 189 superadas y 1 fallida: el CLS de `/en/architecture` (§6, P-55).

**No ejecutado en esta ronda:** la CI de GitHub con el flujo nuevo (se ve tras
el push), Safari real y cualquier cosa detrás del CDN.

## 9. Lo que queda para ▲C1

1. **P-54:** botón de cada servicio y botones dobles a Contacto (§2.3).
   **P-55:** salto de diseño de `/en/architecture` en móvil con red lenta (§6).
2. **Textos nuevos de Contacto**, en borrador: se aprueban con la puerta G1.
3. **`og:locale`:** se puso `es_GT` y `en_US`. Si Julio prefiere otro, es un
   valor de `src/lib/seo/routes.ts`.
4. **Dirección de contacto (P-42, G4):** sin ella, Contacto muestra solo GitHub.
5. **Favicon (G3):** mientras no exista, cada visita pide `/favicon.ico` y
   recibe el 404 propio, que se renderiza por petición. En el hosting eso son
   invocaciones de función: otro motivo para cerrar G3 antes del preview.
6. **CI:** el flujo instala ahora Firefox y WebKit y corre el arnés HTTPS; el
   tope pasa de 20 a 30 minutos. No se ha visto correr en GitHub: se comprueba
   tras el push.
