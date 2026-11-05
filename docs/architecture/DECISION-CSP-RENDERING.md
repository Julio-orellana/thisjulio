# Decisión: CSP y estrategia de renderizado

- **Estado:** **análisis con recomendación — pendiente de aprobación de Julio.**
  No se cambió código, ni la CSP vigente, ni dependencias.
- **Fecha:** 2026-11-05
- **Resuelve:** P-14 (`docs/PENDIENTES.md`) y el cierre técnico de la Feature 001.
- **Versiones evaluadas:** Next.js 16.4.5, React 19.3.1, next-intl 4.14.9,
  Chromium del entorno (Playwright 1.63.0).

## Fuentes y cómo leer este documento

| Marca | Significa |
|---|---|
| **[Oficial]** | Está en la documentación oficial de la versión instalada. La guía de Next se leyó en `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` y `keeping-pages-static.md`. Corresponde exactamente a la 16.4.5. |
| **[Experimental]** | La documentación oficial lo declara experimental: puede cambiar o desaparecer. |
| **[Medido]** | Se ejecutó en esta sesión. El procedimiento está en el Anexo A. |
| **[Referencia]** | OWASP y MDN. **No se pudieron consultar en esta sesión**: la red del entorno no resuelve `cheatsheetseries.owasp.org` ni `developer.mozilla.org`. Se citan por su contenido conocido y conviene verificarlas: [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [MDN — CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [MDN — script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src). |
| **[Inferencia]** | Razonamiento sin medición. |

---

## 1. Estado actual y problema

**Lo que hay hoy** (Feature 001, verificado en CA-10 y CA-11):

- `src/proxy.ts` genera un *nonce* por petición y arma la CSP con
  `buildCsp`. La pasa a Next en los encabezados de la petición y la devuelve
  en la respuesta.
- La CSP de producción:
  `script-src 'self' 'nonce-…' 'strict-dynamic'`,
  `style-src 'self' 'nonce-…'`, `object-src 'none'`, `base-uri 'self'`,
  `frame-ancestors 'none'`, `form-action 'self'` y
  `upgrade-insecure-requests`.
- El resultado es 0 errores de consola en 18 rutas × 2 anchos.
- Las 18 rutas se renderizan **por petición**
  (`dynamic = 'force-dynamic'` en el layout, `cacheComponents: false`).

**Por qué es así [Oficial].** La guía de CSP de Next 16 dice:

- «you **must use dynamic rendering** to add nonces»;
- con nonces «Static optimization and ISR are disabled», «Pages cannot be
  cached by CDNs without additional configuration»;
- «**Partial Prerendering (PPR) is incompatible** with nonce-based CSP».

Es lógico: un nonce sirve solo si es impredecible y distinto en cada
respuesta, y una página generada en el build no puede tenerlo.

**El problema:**

- Un sitio de contenido, con texto que cambia poco, se renderiza en el
  servidor en cada visita.
- No hay caché de HTML en CDN.
- El TTFB depende del servidor de origen y no de un borde cercano. Eso pesa en
  el LCP desde Guatemala.
- Cada visita consume cómputo. En plataformas *serverless* eso es costo por
  invocación.

**[Medido], solo indicativo** (local, sin red, esqueletos de la 001), con 60
peticiones a `/es/trabajo`:

| Variante | TTFB mediana | p90 |
|---|---|---|
| Dinámica (la actual) | 12,1 ms | 18,1 ms |
| Estática | 4,0 ms | 5,4 ms |

La diferencia real en producción la dominará la red (CDN cerca o lejos), no
estos milisegundos.

**Lo que este documento NO afirma:** que estático signifique seguro. El
renderizado estático elimina una clase de XSS: el reflejado en tiempo de
petición, porque no hay entrada del usuario al generar el HTML. Pero no
elimina:

- el XSS almacenado en el contenido, por ejemplo MDX del blog o datos del
  estimador;
- el XSS basado en DOM en componentes de cliente;
- dependencias comprometidas;
- inyección en rutas que sí son dinámicas, como formularios, 404 o un panel
  futuro.

La CSP es una **defensa en profundidad** sobre el escape de React. No lo
reemplaza [Referencia OWASP].

---

## 2. Alternativas

### A. Mantener *nonce* y renderizado dinámico (lo actual) — [Oficial]

- **Cómo funciona:** el proxy genera un nonce por petición y Next lo aplica a
  sus scripts y estilos. Con `strict-dynamic`, los scripts que carga un
  script confiable también son confiables.
- **Seguridad:** es la forma de CSP estricta que recomiendan OWASP y Google
  (*nonce* + `strict-dynamic`). Bloquea scripts en línea inyectados aunque
  pasen el escape. Ya está medida en este repositorio.
- **Costo:** sin SSG, ISR, PPR ni `cacheComponents`, y sin caché de HTML en
  CDN.
- **Restricción importante:** **no se puede «arreglar» poniendo caché a estas
  respuestas.** Una respuesta con nonce que se cachea entrega el mismo nonce a
  todos, y un nonce conocido no protege nada [Referencia MDN/OWASP].

### B. SSG/ISR con CSP sin nonce, con `'unsafe-inline'` en `script-src` — [Oficial]

- **Cómo funciona:** es la opción «Without Nonces» de la guía de Next: una CSP
  fija en `next.config` `headers()`, con
  `script-src 'self' 'unsafe-inline'`.
- **[Medido]:** con esa CSP las páginas estáticas hidratan bien y dan 0
  errores.
- **Seguridad:** `'unsafe-inline'` permite ejecutar **cualquier** script en
  línea. Si un atacante logra inyectar HTML, por ejemplo un
  `<script>` en contenido almacenado o un manejador `onerror=` en un atributo,
  la CSP no lo detiene. OWASP lo describe como una política que no protege
  contra XSS [Referencia].
- **Conclusión:** relaja la política vigente para conseguir estático. **Las
  restricciones de este encargo lo prohíben.** Se descarta.

### B'. SSG con SRI experimental de Next y CSP `script-src 'self'` — [Experimental]

- **Lo que dice la documentación [Oficial]:** `experimental.sri` «allows you
  to maintain static generation while still having a strict CSP». El ejemplo
  usa `script-src 'self'`.
- **[Medido], y contradice esa lectura** en esta aplicación:
  - Con SRI activo, cada página estática emite **3 scripts en línea**: dos de
    arranque y uno con la carga RSC (`self.__next_f.push(...)`).
  - SRI **no** les pone hash. Solo agrega `integrity` a archivos externos.
  - Con `script-src 'self'`, Chromium bloquea los 3 en `/es`, `/en/about` y
    `/es/trabajo`. **La página no hidrata:** el menú móvil no abre.
  - Además, **3 de los 9 scripts externos salen sin `integrity`.**
- **Conclusión:** SRI solo no da una CSP estricta que funcione. Hace falta
  sumar `'unsafe-inline'` (y eso es B) o hashes de los scripts en línea (y eso
  es C).

### C. Híbrido: SSG + CSP con *hashes* por página + *nonce* solo en lo dinámico — [Medido; montaje propio]

- **Cómo funciona:**
  1. Las páginas públicas se generan en el build
     (`generateStaticParams` + `setRequestLocale` de next-intl).
  2. Un paso posterior al build lee el HTML generado de cada ruta y calcula el
     `sha256` de sus scripts en línea. Con eso escribe un manifiesto
     `ruta → CSP`.
  3. El proxy, que ya existe y ya corre en cada petición para el idioma,
     elige la CSP:
     - si la ruta está en el manifiesto, la CSP de hashes de esa ruta;
     - si no, por ejemplo en la 404, un formulario o un panel, la CSP con
       nonce de hoy, con renderizado dinámico.
- **[Medido]:**
  - Con `script-src 'self' 'sha256-…'` y los hashes **exactos de cada
    página**, las tres páginas probadas hidratan, el menú abre y hay **0
    errores**.
  - La navegación del cliente (`/es` → `/es/servicios` con `<Link>`) funciona
    sin errores nuevos: las transiciones piden RSC por `fetch` y no ejecutan
    scripts en línea nuevos.
  - Con los hashes de **otra** página, la página no hidrata. Los hashes son
    **por página**, porque la carga RSC cambia en cada una.
  - Agregar `'strict-dynamic'` a los hashes **rompe** la página: el navegador
    deja de aceptar `'self'` y los 3 externos sin `integrity` se bloquean. La
    variante C usa `'self'` + hashes, sin `strict-dynamic`.
- **Seguridad:** igual que A frente a scripts en línea inyectados, porque un
  script inyectado no tiene un hash autorizado. Frente a scripts externos,
  `'self'` permite cualquier archivo del mismo origen. Eso es aceptable porque
  el sitio no sirve JS subido por usuarios ni JSONP [Inferencia]. Es una
  diferencia real con A, que con `strict-dynamic` ni siquiera confía en
  `'self'`.
- **Por qué funciona con CDN:** la CSP de una página estática es **fija para
  ese build**. Puede cachearse junto con el HTML, cosa que un nonce no
  permite.
- **Riesgos:** ver §4. El mayor es que depende de la forma del HTML que emite
  Next, que no es una interfaz documentada.

### D. Otras opciones evaluadas

| Opción | Veredicto |
|---|---|
| **D1.** CSP en `<meta http-equiv>` con hashes inyectados en el HTML | Se descarta. Una CSP en `<meta>` no admite `frame-ancestors` ni reportes, y debe ir antes de todo script [Referencia MDN]. Además obliga a reescribir el HTML del build. |
| **D2.** `cacheComponents`/PPR con nonce | Se descarta: es **incompatible según la documentación** [Oficial]. |
| **D3.** Cachear las respuestas con nonce (TTL corto) | Se descarta. Reutilizar un nonce anula su valor de seguridad. |
| **D4.** Calcular los hashes en el borde, en cada respuesta | Funciona en teoría. Es C con cómputo por petición y más código propio; no aporta sobre C. |
| **D5.** B + Trusted Types | No sirve: Trusted Types protege los *sinks* del DOM, no los `<script>` en línea que llegan en el HTML. No compensa `'unsafe-inline'`. |
| **D6.** Exportación estática pura (`output: 'export'`) | Pierde el proxy, que hoy hace `/` → `/es`, las rutas localizadas y los slugs del otro idioma, y pierde los handlers de formularios (004). La CSP se pondría desde el hosting. Mismo problema de hashes que C, con menos control. Se descarta. |

---

## 3. Tabla comparativa

Escala: ✔ bueno · ◐ aceptable con condiciones · ✘ malo.

| Criterio | A · nonce dinámico | B · `unsafe-inline` | B' · SRI solo | C · híbrido hashes + nonce |
|---|---|---|---|---|
| Resistencia a XSS en línea | ✔ estricta | ✘ ninguna | — no hidrata | ✔ estricta |
| Scripts externos | ✔ `strict-dynamic` | ◐ `'self'` | ◐ `'self'` + `integrity` parcial | ◐ `'self'` |
| Estado en Next 16.4.5 | ✔ oficial y documentado | ✔ oficial | ✘ experimental y no basta [Medido] | ◐ usa APIs oficiales; el manifiesto es propio |
| React 19 | ✔ | ✔ | ✔ | ✔ |
| SSG / ISR / caché de CDN | ✘ / ✘ / ✘ | ✔ / ✔ / ✔ | ✔ / ✔ / ✔ (si funcionara) | ✔ / **✘ ISR** / ✔ |
| Rendimiento y Core Web Vitals | ◐ TTFB de origen | ✔ | — | ✔ |
| Costo y complejidad del hosting | ◐ cómputo por visita; simple | ✔ | — | ✔ cómputo bajo; un paso más de build |
| Escena WebGL (003) | ✔ sin efecto | ✔ | — | ✔ sin efecto |
| Formularios y estimador (004) | ✔ | ✔ | — | ✔ (las rutas dinámicas siguen con nonce) |
| Blog MDX (005) | ◐ dinámico | ✔ | — | ✔ (un build por artículo; ya es así por ADR 003) |
| Panel administrativo futuro | ✔ | ✘ (sin protección) | — | ✔ (dinámico con nonce) |
| Mantenimiento | ✔ ya verificado | ✔ | ✘ | ◐ revisar en cada actualización de Next |
| ¿Cumple «no relajar»? | ✔ | **✘** | **✘** (o no funciona) | ✔ |

---

## 4. Riesgos y limitaciones

| Riesgo | Afecta a | Mitigación |
|---|---|---|
| **El formato del HTML de Next cambia** (los scripts en línea, cuántos son, dónde están) con una actualización. | C | El manifiesto se calcula del HTML **real** de cada build, no de suposiciones. La prueba e2e que ya existe (0 errores de consola en 18 rutas × 2 anchos, más hidratación) bloquea el merge si algo cambia. Versiones de Next fijadas. |
| **El manifiesto y el HTML se desincronizan** (ISR, `revalidate`, regeneración bajo demanda). | C | **Sin ISR en las rutas con hashes**: el contenido vive en el repositorio (ADR 003) y cambiar contenido es hacer un build. Una prueba falla si una ruta del manifiesto declara `revalidate`. |
| **Un script en línea que no sale del build** (un componente que inyecta `<script>` con `dangerouslySetInnerHTML`, JSON-LD calculado en tiempo de petición). | C | Falla cerrado: el navegador lo bloquea y la prueba e2e lo detecta. El JSON-LD de la 006 tiene que ser estático, salir en el build, o ir por rutas dinámicas con nonce. |
| **`'self'` sin `strict-dynamic`** permite cualquier JS del mismo origen. | C (y B, B') | Ninguna ruta sirve JS subido por usuarios. `/_next/static` lo genera solo el build. Prohibido agregar endpoints JSONP o servir archivos de usuarios desde el mismo origen (se documenta en `SECURITY.md`). |
| **Estilos.** | C | [Medido] Las páginas estáticas no emiten `<style>` en línea: `style-src 'self'` alcanza. Si eso cambia, el mismo manifiesto puede llevar hashes de estilo. |
| **next-intl en estático** requiere `setRequestLocale` en **cada** layout y página. | C | Documentado por next-intl como la forma de renderizado estático. Si se olvida en una página, esa ruta pasa a dinámica en silencio. Mitigación: prueba que exige que las rutas públicas figuren como `●` (SSG) en el build. |
| **Dependencia del proxy en cada petición.** | A, C | En C el proxy solo elige un encabezado: no renderiza. En un hosting sin *middleware*, el mismo manifiesto puede generar el archivo de encabezados del proveedor (por ejemplo `_headers` o `vercel.json`). |
| **Costo y TTFB** | A | Sitio de tráfico bajo: el costo absoluto es chico. Lo que pesa es el TTFB lejos del origen. |
| **«Estático = seguro»** | todas | No lo es (§1). El escape de React, la validación en el servidor (004) y la prohibición de `dangerouslySetInnerHTML` siguen siendo la primera línea. |
| **SRI declarado como experimental** | B' | No se depende de él. Si algún día cubre los scripts en línea, se reevalúa. |

---

## 5. Recomendación fundada (no es una decisión)

**Se recomienda C, híbrido:**

- **páginas públicas estáticas (SSG) con una CSP de hashes por página**,
  calculada en el build y servida por el proxy;
- **nonce y renderizado dinámico solo** donde haga falta: 404 o *catch-all*,
  Route Handlers y Server Actions de formularios, y el panel futuro;
- **sin ISR** en las rutas con hashes.

**Por qué:**

1. **Es la única alternativa que cumple las dos condiciones a la vez**: no
   relajar la CSP (descarta B y B') y permitir estático con caché de CDN
   (descarta A como estado final).
2. **Mantiene la protección clave de hoy** frente a scripts en línea
   inyectados. Lo medido muestra que un script no autorizado no corre: con
   hashes ajenos, la página ni siquiera hidrata.
3. **Calza con decisiones ya tomadas:**
   - el contenido vive en archivos del repositorio (ADR 003), así que un build
     por cambio es lo natural y ISR no hace falta;
   - el proxy ya existe por el idioma;
   - la 004 y el panel quedan dinámicos con nonce.
4. **Lo que cuesta:**
   - un paso propio después del build (unas decenas de líneas, sin
     dependencias nuevas);
   - pierde `strict-dynamic` para scripts externos;
   - hay que revisarlo en cada actualización de Next.

**Alternativa conservadora, igual de defendible:** mantener A sin cambios y
cerrar la 001 así, a costa del TTFB y del cómputo por visita. Es lo que ya
está verificado.

**Cuándo implementarlo — también es decisión de Julio:**

- **Opción recomendada:** antes de empezar la 002, como una tarea final de
  la 001 (T18). Así todas las páginas de la 002 nacen con el patrón estático
  (`setRequestLocale`, `generateStaticParams`) y no hay que tocarlas después.
- **Alternativa:** cerrar la 001 con A tal como está y hacer C en la 006,
  junto con el hosting. El costo es repasar cada página de la 002–005, un
  cambio mecánico.

---

## 6. Propuesta de implementación (solo si se aprueba C)

Sin dependencias nuevas. Pasos, cada uno con su comprobación:

1. **Rutas públicas estáticas.**
   - Quitar `dynamic = 'force-dynamic'` del layout.
   - Agregar `generateStaticParams` con los dos idiomas.
   - Llamar `setRequestLocale(locale)` en el layout y en cada página.
   - El *catch-all* `[...rest]` sigue dinámico.
   - *Comprobación:* el build marca las 18 rutas públicas como `●`.
2. **Manifiesto de CSP**, `scripts/csp-manifest.mjs`, que corre después de
   `next build`:
   - recorre el HTML prerenderizado de `.next/server/app/`;
   - extrae el contenido de cada `<script>` sin `src`;
   - calcula `sha256` en base64;
   - escribe `src/lib/security/csp-manifest.json` con `{ "/es/trabajo": ["sha256-…", …] }`.

   Falla el build si una ruta pública no aparece o si aparece un `<style>` en
   línea sin cubrir.
3. **`buildCsp` con dos modos** en `src/lib/security/headers.ts`:
   - `hash`: `script-src 'self' <hashes>`, `style-src 'self'` y el resto de
     las directivas igual;
   - `nonce`: el de hoy, sin cambios.

   Desarrollo sigue con el modo nonce de hoy (plan 001 §6.4).
4. **Proxy:**
   - si la ruta (ya resuelta por next-intl a su `pathname` interno) está en
     el manifiesto, CSP de hashes y **no** se genera nonce;
   - si no, el flujo actual con nonce.

   Las respuestas de redirección (`/` → `/es`) llevan la CSP más estricta.
5. **Caché:**
   - HTML estático con `Cache-Control` público y la CSP fija de esa ruta;
   - respuestas con nonce: `private, no-store`, como hoy.
6. **Documentación:**
   - ADR 006 (§9);
   - `SECURITY.md` §3 (dos modos de CSP; prohibido JS de usuario en el mismo
     origen);
   - `ARCHITECTURE.md` §1;
   - plan 001 §6.1 marcado como reemplazado;
   - P-14 resuelto.

Si en el paso 2 el HTML de Next resulta tener scripts en línea que cambian
**por petición** en una ruta estática (hoy no pasa: [Medido], salen del
build), C no sirve para esa ruta. Esa ruta queda con nonce.

---

## 7. Pruebas necesarias

| # | Prueba | Nivel | Qué falla si… |
|---|---|---|---|
| P1 | El build marca las 18 rutas públicas como SSG y el *catch-all* como dinámico. | build | una página olvidó `setRequestLocale` |
| P2 | El manifiesto cubre todas las rutas públicas, y cada hash coincide con el HTML servido. | unitaria sobre `.next` | el manifiesto quedó viejo |
| P3 | **CSP de producción en Chromium:** 0 errores de consola e hidratación comprobada (un componente con *fiber* de React y el menú que abre) en 18 rutas × 2 anchos. | e2e (amplía CA-11) | un script en línea no autorizado o un hash equivocado |
| P4 | **Prueba negativa:** un `<script>` inyectado en una página de prueba solo de desarrollo **no** se ejecuta con la CSP de hashes. | e2e | la política se relajó sin querer |
| P5 | Encabezados: las rutas públicas no llevan nonce ni `'unsafe-inline'`/`'unsafe-eval'`; las dinámicas llevan un nonce distinto en cada petición. | e2e (amplía CA-10) | se mezclaron los modos |
| P6 | Navegación del cliente entre páginas estáticas sin errores nuevos. | e2e | Next empezó a inyectar scripts en las transiciones |
| P7 | Ninguna ruta con hashes declara `revalidate` o ISR. | estática | alguien activó ISR |
| P8 | Caché: rutas públicas con `Cache-Control` público; las de nonce, `private, no-store`. | e2e | una respuesta con nonce podría cachearse |
| P9 | Sin regresión visual ni de accesibilidad: las capturas y axe de la 001. | e2e | — |

---

## 8. Impacto en el hosting y la CDN

| | A (actual) | C (recomendada) |
|---|---|---|
| Runtime de Next | Obligatorio en cada visita (render completo) | Obligatorio para el proxy, las rutas dinámicas y la 004. El HTML público sale de la caché |
| Caché de HTML en CDN | No (`private, no-store`) | Sí, con su CSP fija por build |
| Cómputo por visita | Render del servidor | Proxy liviano, o nada si el CDN responde |
| Portabilidad (ADR 004) | Cualquier hosting con Node | Igual. Además, el manifiesto puede producir el archivo de encabezados de un CDN (por ejemplo `_headers`) si se quisiera servir lo estático sin proxy |
| Invalidación | No aplica | Un despliegue nuevo reemplaza el HTML y el manifiesto juntos. Hay que evitar que el CDN mezcle el HTML de un build con la CSP de otro: se cachean juntos, en la misma respuesta |
| Criterio 3 del ADR 004 («CSP con nonce») | Se cumple | Pasa a «encabezados por ruta y proxy de Next»; se actualiza el ADR 004 |

No cambia nada de DNS, dominio ni contratación (sigue en la 006).

---

## 9. ADR a crear o actualizar

- **Crear `docs/adr/006-csp-y-renderizado.md`** cuando Julio decida:
  - contexto (§1);
  - alternativas A, B, B', C y D;
  - decisión, consecuencias y las pruebas P1–P9.
- **Actualizar:**
  - **ADR 001**, consecuencias: la línea «La CSP con nonce obliga a
    renderizado dinámico» pasa a remitir al ADR 006;
  - **ADR 004**, criterio 3;
  - **`SECURITY.md`** §3;
  - **`ARCHITECTURE.md`** §1 («Renderizado»);
  - **plan 001** §6.1;
  - **`docs/PENDIENTES.md`** P-14 (resuelto, con fecha y ADR).
- **Si se elige A:** el ADR 006 registra A como decisión. Deja escrito que B
  y B' se descartaron por relajar la política o no funcionar ([Medido]), y que
  C queda disponible.

---

## Anexo A — Cómo se midió

- **Copia aislada:** se copió el proyecto al *scratchpad* de la sesión. El
  repositorio no se tocó.
- **Cambios en la copia:**
  - layout sin `force-dynamic` y con `generateStaticParams`;
  - `setRequestLocale` en el layout y las páginas;
  - proxy solo con next-intl;
  - `experimental.sri` (sha256);
  - CSP fija en `headers()`.
- **Build:** `next build` (Turbopack). Las rutas públicas salieron como `●`
  (SSG) y `[...rest]` como `ƒ`. Las respuestas estáticas trajeron
  `x-nextjs-cache: HIT` y `Cache-Control: s-maxage=31536000`.
- **HTML de `/es`:**
  - 9 scripts externos, 6 con `integrity`;
  - 3 scripts en línea (11 855 bytes): 2 iguales en todas las páginas y 1
    distinto por página;
  - 0 atributos `style` y 0 `<style>`.
- **Chromium**, a 390×844 y 1440×900. La CSP se aplicó reescribiendo el
  encabezado del documento con Playwright. Para cada variante se registró:
  errores de consola, si React hidrató (claves `__reactFiber` en un
  `<button>`) y si el menú cambia `aria-expanded` al hacer clic.

  | Variante de `script-src` | Resultado |
  |---|---|
  | `'self'` (ejemplo SRI de la guía) | 3 errores, **no hidrata**, en las 3 páginas |
  | `'self' 'unsafe-inline'` | 0 errores, hidrata |
  | `'self'` + hashes exactos de la página | 0 errores, hidrata; navegación de cliente sin errores |
  | `'self'` + hashes de `/es` aplicados a otra página | 1 error, **no hidrata** |
  | `'strict-dynamic'` + hashes en línea | 9 errores, no hidrata |
  | `'strict-dynamic'` + hashes en línea + hashes de `integrity` | 3 errores (externos sin `integrity`), no hidrata |

- **TTFB:** 60 peticiones con `curl` a `/es/trabajo`. Variante dinámica: el
  build actual del repositorio. Variante estática: la copia. Mismo equipo.
- **No se midió:** el comportamiento detrás de un CDN real, Lighthouse/Core
  Web Vitals, ni las páginas con el contenido de la 002. Se mide en la 006 y
  en la implementación de C.
