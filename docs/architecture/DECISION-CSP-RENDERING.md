# Decisión: CSP y estrategia de renderizado

- **Estado:** **decidido e implementado.** Julio aprobó la alternativa C con
  las ocho decisiones de §11 (2026-11-05). Se implementó en la T18 de la
  Feature 001; el resultado está en §12. La decisión queda registrada en el
  **ADR 006**. El cierre de la 001 espera la aprobación final de Julio.
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
| **[Referencia]** | OWASP, MDN y la especificación CSP 3. **Verificadas el 2026-11-05 (segunda ronda), con una salvedad: los sitios web siguen bloqueados** en esta sesión (`cheatsheetseries.owasp.org` y `developer.mozilla.org` no resuelven). Se leyó el **texto fuente oficial** de cada documento en el repositorio que lo publica (ver §10.1, con huellas). En la primera versión de este documento eran citas de memoria; las que siguen vigentes ya se cotejaron. |
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
  el sitio no sirve JS subido por usuarios ni JSONP [Inferencia]. **Medido después (§10):** `'self'` sí deja pasar un JS propio fuera del build; la ruta `/_next/static/chunks/` no. La recomendación definitiva (§11) usa la ruta. Es una
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

## 5. Recomendación fundada (primera ronda)

> **Superada en un punto por §11:** la elección de C se mantiene, pero
> `'self'` se reemplaza por la ruta de los archivos de Next, después de
> medirlo (§10).

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

> **Ajustada por §11.3**, que manda sobre esta sección donde difieran: la
> fuente de scripts externos pasa a ser `https://<origen>/_next/static/chunks/`,
> y las rutas dinámicas usan nonce + esa ruta, sin `strict-dynamic` ni
> `'self'`.

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

> Se suman las pruebas P10–P14 de §11.4.

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

## 10. Comprobación final: ¿se puede reemplazar `'self'`?

Pedido de Julio (2026-11-05): medir si `'self'` se puede reemplazar por una
fuente limitada a los JavaScript que genera Next, sin suponer que funciona.

### 10.1 Referencias oficiales, ahora consultadas

**Los sitios web siguen bloqueados.** `cheatsheetseries.owasp.org` y
`developer.mozilla.org` no resuelven en esta sesión (comprobado de nuevo). Para
habilitarlos hay que agregarlos en la configuración de red de la sesión.

En su lugar se leyó el **texto fuente oficial** de cada documento, desde el
repositorio que lo publica (vía `raw.githubusercontent.com`). El commit exacto
no se pudo leer: la API de GitHub no tiene acceso a esos repositorios desde
esta sesión. Por eso se anotan la rama y la huella sha256 del archivo
descargado.

| Documento | Fuente leída | sha256 (16) |
|---|---|---|
| OWASP CSP Cheat Sheet | `OWASP/CheatSheetSeries` · `master` · `cheatsheets/Content_Security_Policy_Cheat_Sheet.md` | `4d5e2f4d1c42ae58` |
| MDN — Content Security Policy (guía) | `mdn/content` · `main` · `files/en-us/web/http/guides/csp/index.md` | `7634104d53e84ec0` |
| MDN — `script-src` | `mdn/content` · `main` · `…/content-security-policy/script-src/index.md` | `4d1883b524db90a3` |
| MDN — `Content-Security-Policy` (fuentes, `host-source`) | `mdn/content` · `main` · `…/headers/content-security-policy/index.md` | `cf7e7e0d669c47be` |
| W3C CSP Level 3 (especificación) | `w3c/webappsec-csp` · `main` · `index.bs` | `f303de92d5846741` |

**Lo que dicen, citado textualmente:**

- **OWASP — CSP estricta.** Las dos formas recomendadas son
  `script-src 'nonce-{RANDOM}' 'strict-dynamic'` y
  `script-src 'sha256-{HASHED_INLINE_SCRIPT}' 'strict-dynamic'`, con
  `object-src 'none'` y `base-uri 'none'`. Sobre `strict-dynamic` dice que
  «can **optionally** also be used to make it easier to implement a Strict
  CSP».
- **OWASP — listas de permitidos.** «current leading practice is to create a
  "Strict" CSP which is much easier to deploy and more secure as it is less
  likely to be bypassed». Advierte que «creating a non-Strict policy that is
  too granular or permissive is likely to lead to bypasses».
- **OWASP — hashes.** «Using hashes can be a risky approach. If you change
  *anything* inside the script tag (even whitespace) […] the hash will be
  different, and the script won't render.»
- **MDN — `'unsafe-inline'`.** «Developers should avoid `'unsafe-inline'`,
  because it defeats much of the purpose of having a CSP.»
- **MDN — nonce y HTML estático.** El nonce implica que «the server cannot
  serve static HTML». Con hashes, en cambio, «both the CSP and the content can
  be static […] This makes hash-based policies more suitable for static
  pages».
- **MDN — `'strict-dynamic'`.** «makes it much easier to create and maintain
  nonce- or hash-based CSPs, especially when a website uses third-party
  scripts. **It does make your CSP less secure, though**, because if the
  scripts you include create `<script>` elements based on potential sources of
  XSS, then the CSP will not protect them.»
- **MDN — CSP estricta.** Define «strict CSP» como directivas basadas en nonce
  o hash, frente a la «allowlist CSP», y cita *CSP Is Dead, Long Live CSP!*.
  Un script externo puede autorizarse por hash si su atributo `integrity`
  coincide con la CSP.
- **MDN — `host-source`.** «Paths that end in `/` match any path they are a
  prefix of.» Además: «If the scheme is omitted, the scheme of the document's
  origin is used.»
- **CSP 3 §«Paths and Redirects».** «the matching algorithm **ignores the path
  component** of a source expression if the resource being loaded is the
  result of a redirect».

**Consecuencia.** La propuesta C (hashes para lo que va en línea y una fuente
de ruta para los archivos) **no es una «CSP estricta» en el sentido estricto**
de OWASP y MDN, porque combina hashes con una lista de permitidos. La versión
estricta pura basada en hashes (hashes + `integrity` en todos los scripts
externos, con o sin `strict-dynamic`) **se midió y no funciona** en Next
16.4.5 (§10.3). Lo que mitiga la crítica a las listas de permitidos es su
alcance: no es un dominio de terceros ni un CDN compartido. Es **una sola ruta
propia** con la salida inmutable del build, servida con
`X-Content-Type-Options: nosniff`.

### 10.2 Qué scripts carga de verdad la aplicación [Medido]

- **Laboratorio.** Copia aislada del proyecto en el *scratchpad* (el
  repositorio no se tocó), con el build estático (SSG), sin SRI y sin CSP
  propia.
- **Origen de producción simulado.** Delante del servidor hay un frente HTTPS
  local con certificado autofirmado para `thisjulio.com`. Chromium resuelve
  ese nombre a `127.0.0.1`. Así la fuente `https://thisjulio.com/…` se prueba
  con el esquema, el host y el puerto reales.
- **Recorrido.** 18 rutas × 2 anchos (1440 y 390), el menú móvil, la
  navegación de cliente (Inicio → Servicios → Acerca de → Contacto) y el
  cambio de idioma.

| Carpeta de `.next/static` | Archivos JS en el build | Pedidos por el navegador |
|---|---|---|
| `chunks/` | 9 | **8** (todos los scripts que usa la aplicación) |
| `<buildId>/` (`_buildManifest.js`, `_ssgManifest.js`, `_clientMiddlewareManifest.js`) | 3 | **0** |
| `media/` (fuentes) y CSS | 0 JS | — (no los gobierna `script-src`) |

**Todos los scripts externos que pide el navegador están bajo
`/_next/static/chunks/`.** Ningún script sale de otra ruta ni de otro origen.

### 10.3 Variantes medidas

Todas las variantes llevan lo mismo además de su fuente de archivos: los
hashes de los 3 scripts en línea de cada página, **sin `'unsafe-inline'` ni
`'unsafe-eval'`**, y el resto de las directivas de la CSP actual.

| # | `script-src` (además de los hashes en línea) | Rutas OK¹ | Menú móvil | Navegación e idioma | Tamaño de la CSP |
|---|---|---|---|---|---|
| V1 | `'self'` | 36/36 | ✔ | ✔ | 435 B |
| V2 | `https://thisjulio.com/_next/static/` | 36/36 | ✔ | ✔ | 464 B |
| **V3** | **`https://thisjulio.com/_next/static/chunks/`** | **36/36** | **✔** | **✔** | **471 B** |
| V4 | `thisjulio.com/_next/static/chunks/` (sin esquema) | 36/36 | ✔ | ✔ | 463 B |
| V5 | `/_next/static/chunks/` (solo ruta, sin host) | **0/36** | ✘ | ✘ | — |
| V6 | Lista exacta de los 12 archivos JS del build | 36/36 | ✔ | ✔ | 1203 B |
| V7 | Solo hashes: en línea + `integrity` (build con SRI) | **0/36** | ✘ | ✘ | — |
| V8 | V7 + `'strict-dynamic'` | **0/36** | ✘ | ✘ | — |

¹ «OK» quiere decir las tres cosas a la vez: la página hidrató (React ligado
al DOM), no hubo ninguna violación de CSP y no falló ninguna carga de script.

Lo que muestran las filas que fallan:

- **V5:** una ruta sin host no es una `host-source` válida. El navegador la
  ignora y bloquea los 9 scripts. **La fuente tiene que llevar el origen.**
- **V7 y V8:** son la CSP estricta basada en hashes de OWASP y MDN, y fallan
  igual que en la primera ronda. Los 3 scripts que el SRI experimental deja
  sin `integrity` se bloquean, y la página no hidrata.

### 10.4 Pruebas negativas: qué detiene cada variante [Medido]

Se inyectó HTML en `/es`, simulando una inyección de marcado, y se comprobó si
el código llegaba a ejecutarse. `/lab-evil.js` es un archivo JS del **mismo
origen pero fuera de `/_next/static/`**: representa una subida de archivos,
un JSONP o cualquier JS propio fuera del build.

| Inyección | V1 `'self'` | V2 / V3 / V4 / V6 (ruta) |
|---|---|---|
| `<script>` en línea | bloqueado | bloqueado |
| `<script src="/lab-evil.js">` (mismo origen, fuera de la ruta) | **EJECUTÓ** | **bloqueado** |
| `src="/_next/static/../../lab-evil.js"` | **EJECUTÓ** | bloqueado |
| `src="/_next/static/%2e%2e/%2e%2e/lab-evil.js"` | **EJECUTÓ** | bloqueado |
| `src="/_next/static/chunks/..\..\..\lab-evil.js"` | **EJECUTÓ** | bloqueado |
| `src="/_next/static/chunks/.%2e/.%2e/.%2e/lab-evil.js/"` (con redirección 308) | **EJECUTÓ** | bloqueado |
| `src="data:…"` | bloqueado | bloqueado |
| `https://evil.example/x.js` | bloqueado | bloqueado |
| Manejador en línea (`onerror=`) | bloqueado | bloqueado |
| Re-inclusión de un *chunk* propio de Next | permitido | permitido |

Ninguna de estas inyecciones impidió que la página hidratara.

**Por qué los trucos de rutas no pasan.**

- El navegador normaliza los segmentos `..`, `%2e%2e`, `.%2e` y `\` antes de
  pedir el recurso, y la CSP compara la URL ya normalizada.
- El servidor de Next **sí** sirve `/lab-evil.js` si recibe en crudo
  `/_next/static/%2e%2e/%2e%2e/lab-evil.js` (medido con un cliente HTTP).
  Pero un navegador nunca envía esa forma.
- Por la regla de CSP 3, una redirección **anula la comprobación de ruta**.
  Se buscaron redirecciones del servidor que salieran de `/_next/static/chunks/`
  con 19 formas de URL:
  - las únicas aparecen con segmentos de punto, que el navegador normaliza
    antes de enviar;
  - las demás son redirecciones 308 por barra final o doble, que quedan dentro
    del prefijo.

  El proxy de next-intl no corre en `/_next/` (matcher).

### 10.5 Diferencias de seguridad con la política actual [Medido]

Mismas inyecciones contra el **build actual del repositorio** (la CSP vigente:
`script-src 'self' 'nonce-…' 'strict-dynamic'`). Se agregó un caso más, el
**«gadget» confiable**: un script autorizado (con el nonce o con su hash) que
crea elementos `<script>` hacia un dominio externo y hacia una ruta propia
cualquiera. Es el patrón de XSS basado en DOM que MDN cita contra
`strict-dynamic`.

| Caso | A · actual: nonce + `strict-dynamic` | Nonce + ruta, sin `strict-dynamic` (rutas dinámicas) | C · hashes + ruta (páginas estáticas) |
|---|---|---|---|
| `<script>` en línea inyectado | bloqueado | bloqueado | bloqueado |
| JS del mismo origen fuera de la ruta | bloqueado | bloqueado | bloqueado |
| `data:` / externo / `onerror=` | bloqueado | bloqueado | bloqueado |
| Re-inclusión de un *chunk* propio de Next | **bloqueado** | permitido | permitido |
| Script confiable que crea `<script>` hacia `evil.example` | **PERMITIDO** | **bloqueado** | **bloqueado** |
| Script confiable que crea `<script>` hacia una ruta propia cualquiera | **PERMITIDO** | **bloqueado** | **bloqueado** |
| Funciona (hidratación, navegación, menú, idioma, 404) | ✔ | ✔ 12/12 cargas² | ✔ 36/36 |

² Build actual del repositorio, con solo la `script-src` reescrita en el
navegador: `/es`, `/es/trabajo`, `/es/servicios`, `/en`, `/en/about` y una 404
dinámica, en los dos anchos. También la navegación de cliente y el cambio de
idioma, con 0 violaciones.

**La diferencia, dicha llanamente.**

- **`strict-dynamic`** cuida mejor **lo que entra por el HTML**: ni siquiera
  un *chunk* propio sin nonce se ejecuta. A cambio, **confía en cualquier
  script que cree un script confiable**, hacia cualquier origen. Si un
  componente o una dependencia arma un `<script>` con un dato controlable por
  el atacante, la CSP no lo detiene.
- **La ruta sin `strict-dynamic`** deja re-incluir archivos que ya son del
  build: es código de Next, no del atacante [Inferencia]. A cambio, **ningún
  script, confiable o no, puede cargar código desde fuera de
  `/_next/static/chunks/`**.

Para un sitio **sin scripts de terceros**, la segunda propiedad vale más. El
motivo principal de `strict-dynamic` es justamente simplificar los scripts de
terceros (MDN), y este sitio no tiene ninguno (constitución: sin analítica ni
servicios externos).

**Lo que ninguna de las dos cubre:**

- el código malicioso que llegue por el build o por una dependencia
  comprometida (supply chain);
- el XSS que no ejecuta scripts (inyección de marcado, *phishing* en la
  página);
- los datos exfiltrados por canales que la CSP permite (`img-src 'self'`,
  `connect-src 'self'`).

La primera línea sigue siendo el escape de React y la validación en el
servidor.

## 11. Recomendación definitiva

### 11.1 Decisión que se propone

Se mantiene la **dirección aprobada por Julio**:

- páginas públicas estáticas;
- hashes calculados del HTML real del build;
- nonce solo donde haga falta;
- sin `'unsafe-inline'` ni `'unsafe-eval'`;
- sin ISR en las rutas con hashes;
- caché de CDN solo para las respuestas compatibles.

**Y se adopta la política restringida por ruta como opción preferida.**
Funciona igual que `'self'` (36/36, §10.3) y protege mejor (§10.4–10.5).

### 11.2 Las dos políticas resultantes

`<ORIGEN>` es el origen del despliegue. En producción, `https://thisjulio.com`.

**Páginas públicas estáticas (modo hash)**, la CSP fija de cada página para
ese build:

```
default-src 'self';
script-src <ORIGEN>/_next/static/chunks/ 'sha256-<inline1>' 'sha256-<inline2>' 'sha256-<inline3>';
style-src 'self';
img-src 'self' blob: data:; font-src 'self'; connect-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
manifest-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
```

**Rutas dinámicas: 404, formularios y panel futuro (modo nonce)**, un nonce
nuevo en cada respuesta:

```
script-src 'nonce-<N>' <ORIGEN>/_next/static/chunks/;
style-src 'self' 'nonce-<N>';
(el resto de las directivas igual)
```

Detalles de las dos políticas:

- **Ninguna lleva `'self'` en `script-src`.** Sin `strict-dynamic`, `'self'`
  dejaría de ser ignorado y volvería a autorizar todo el origen.
- **Se quita `'strict-dynamic'` de la política vigente.** Lo hace C1 (§11.3),
  con la autorización de Julio. **Hoy no se cambia nada.**
- **Se elige `/_next/static/chunks/` (V3) y no `/_next/static/` (V2).** Todos
  los scripts que se usan están ahí (§10.2). V2 sumaría los manifiestos del
  `<buildId>`, que el App Router no pide.
- **Si una versión futura de Next carga JS de otra carpeta,** P10 lo detecta
  y la página falla en cerrado. Ahí se cambia a V2 de forma consciente.
- **Se descarta V6 (lista exacta de archivos).** Casi triplica la CSP
  (1203 B) y obliga a regenerarla con cada carga diferida nueva, como el motor
  WebGL de la 003. A cambio solo ganaría contra los *chunks* viejos que queden
  en un CDN entre despliegues, que también son código de Next.
- **Se descarta V4 (sin esquema).** Funciona, pero el esquema explícito
  `https://` no depende del esquema del documento y se lee sin ambigüedad.

### 11.3 Cambios a la propuesta de implementación (§6)

| Paso | Cambio |
|---|---|
| C1 | `buildCsp` gana el parámetro `origen`. Los dos modos (`hash` y `nonce`) usan `<origen>/_next/static/chunks/` y **ninguno** lleva `'self'` ni `'strict-dynamic'` en `script-src`. En desarrollo queda la política de hoy (plan 001 §6.4). |
| C2 | **El origen sale de la configuración, nunca del encabezado `Host`.** Una variable validada en el build y en el arranque (por ejemplo `SITE_ORIGIN`), con la forma `https://<host>` sin barra final. Si falta o es inválida, el build falla. **Por qué no del `Host`:** con caché de CDN, una CSP armada con un `Host` manipulado podría quedar guardada y servirse a otros (envenenamiento de caché), y además metería texto del cliente en un encabezado de seguridad. |
| C3 | Cada entorno tiene su origen: producción `https://thisjulio.com`, una vista previa su propio dominio y las e2e locales `http://localhost:<puerto>`. Lo fija la 006 junto con el hosting. |
| C4 | Si algún día se usa `assetPrefix` (otro dominio para `/_next/static`), la fuente cambia a ese dominio, que debe ser exclusivo del sitio. |
| C5 | Se mantiene `X-Content-Type-Options: nosniff`, que ya está en los encabezados de seguridad (001): impide ejecutar como script un archivo servido con otro tipo MIME. |

### 11.4 Pruebas adicionales (además de P1–P9)

| # | Prueba | Qué falla si… |
|---|---|---|
| P10 | Todos los scripts que pide el navegador en 18 rutas × 2 anchos, la navegación de cliente y el cambio de idioma están bajo `<origen>/_next/static/chunks/`. | Next empezó a cargar JS de otra ruta |
| P11 | Negativas en modo hash y en modo nonce: JS del mismo origen fuera de la ruta (también con `..`, `%2e%2e`, `\` y barra final), en línea, `data:`, externo y `onerror=`. Ninguno se ejecuta. | alguien volvió a poner `'self'` o `'unsafe-inline'` |
| P12 | «Gadget»: un script autorizado que crea `<script>` hacia otro origen y hacia una ruta propia queda bloqueado. | volvió `'strict-dynamic'` sin decidirlo |
| P13 | Ninguna URL bajo `/_next/static/chunks/` redirige fuera del prefijo, probado con la lista de §10.4. | un cambio de servidor reabrió la ruta por redirección |
| P14 | La CSP no depende del encabezado `Host`: con un `Host` arbitrario sigue saliendo el origen configurado. | la CSP se arma con datos del cliente |

### 11.5 Lo que se gana y lo que se cede respecto de hoy

- **Se gana:**
  - páginas estáticas cacheables con una CSP sin `'unsafe-*'`;
  - el bloqueo de cualquier JS que no venga de la salida del build, incluidos
    los scripts que pudiera crear un script confiable (el punto débil de
    `strict-dynamic` según MDN).
- **Se cede:**
  - un *chunk* propio de Next puede re-incluirse sin nonce ni hash;
  - es una lista de permitidos de una sola ruta, no la «CSP estricta» pura de
    OWASP y MDN, que en Next 16.4.5 no funciona (V7 y V8);
  - las garantías dependen de la forma del build. Las sostienen P1–P14, que
    fallan en cerrado.

### 11.6 Qué queda para Julio

1. **Autorizar la implementación** como tarea final de la 001 (T18), con
   §6 ajustada por §11.3.
2. **Confirmar que se quita `'strict-dynamic'`** también de las rutas
   dinámicas, para tener un solo modelo (§11.2). **Alternativa:** dejar las
   rutas dinámicas exactamente como hoy (nonce + `strict-dynamic`, con
   `'self'` ignorado). Funciona, pero conserva la debilidad del «gadget»
   medida en §10.5.
3. El origen de cada entorno (C3) se fija con el hosting en la 006. Para la
   001 bastan el de producción y el de las e2e locales.

Hasta esa autorización **no se implementa nada** y la CSP vigente sigue igual.

## 12. Implementación (T18) y resultado

**Se siguió §11. Hubo tres ajustes, encontrados al implementar:**

1. **El 404 interno de Next se servía sin ninguna CSP.** Es el 404 de las URLs
   con extensión (`/x.png`, `/robots.txt`). El *matcher* del proxy excluía las
   rutas con punto, así que esa página salía sin CSP, con 9 scripts (medido
   antes del cambio). Ahora el proxy también atiende esas rutas, sin pasarlas
   por el enrutamiento de idioma, y les pone la CSP sin hashes.
2. **Las páginas internas `/_not-found` y `/_global-error` de Next llevan
   estilos en línea.** El generador del manifiesto las rechazó, como debía (el
   build falló). No se autorizan por hash ni se relajó `style-src`. Quedan,
   **por nombre exacto**, fuera del manifiesto y se sirven con la CSP sin
   hashes: se ven sin estilos y no ejecutan nada. El diseño de esa página es la
   pregunta P-16.
   **Actualización (T19, P-16 opción B):** el 404 ahora es propio
   (`app/global-not-found.tsx`), con nonce. La medición mostró que, en la
   práctica, esa página salía **en blanco**: Next enviaba su carcasa de error
   vacía y la CSP sin nonce impedía completarla. Solo `/_global-error` sigue
   fuera del manifiesto. Detalle: ADR 006 §P-16.
3. **El manifiesto se lee en tiempo de ejecución** (`.next/csp-manifest.json`,
   Node.js). No se puede empaquetar en el proxy porque se genera después del
   build. El proxy responde 500 si el manifiesto falta o es de otro build. El
   origen se fija en el build con `env` y solo se exige en `next build`;
   `next start` usa lo fijado.

**Piezas:**

| Archivo | Qué hace |
|---|---|
| `src/lib/security/origin.ts` | Valida `SITE_ORIGIN`: `https://<host>` o `http://localhost[:puerto]`. Rechaza barra final, ruta, puerto en https, mayúsculas, comodines y texto extra |
| `src/lib/security/headers.ts` | `buildCsp` con los modos `hash` y `nonce`. Rechaza hashes y nonces mal formados |
| `scripts/lib/csp-scan.mjs` | Revisión del HTML. Acepta 3 formas de script en línea y scripts externos solo bajo `/_next/static/chunks/`. Rechaza manejadores, estilos, `javascript:`, `<base>`, `<object>`, `<embed>` e `<iframe>`, ISR y una versión de Next distinta de 16.4.5 |
| `scripts/csp-manifest.mjs` | Paso de `npm run build`. Escribe el manifiesto o sale con 1 sin escribir nada |
| `src/lib/security/csp-manifest.ts` | Lectura y validación del manifiesto en el proxy (mismo build, misma ruta, hashes válidos) |
| `src/proxy.ts` | Elige la CSP: hashes si la ruta interna, resuelta por next-intl, está en el manifiesto; nonce si no. Sin hashes en redirecciones y en rutas con extensión |
| `src/app/[locale]/**` | `generateStaticParams` y `setRequestLocale`; se quitó `force-dynamic` |

**Verificación ejecutada (2026-11-05, Chromium):**

| Prueba | Resultado |
|---|---|
| `SITE_ORIGIN=http://localhost:3100 npm run verify` | Código 0: lint, tipos, 50 unitarias, build y manifiesto con 18 rutas |
| Playwright completo (escritorio y móvil) | **295 superadas, 0 fallidas**, 27 omitidas a propósito (pruebas de un solo ancho) |
| P1 / P7 | 18 rutas públicas prerenderizadas, `initialRevalidateSeconds: false`, todas en el manifiesto; el 404 con layout es dinámico |
| P2 | En las 18 rutas, los hashes del encabezado son exactamente los del HTML servido |
| P3 / P10 | Hidratación y 0 violaciones en 18 rutas × 2 anchos y en la 404 dinámica; todos los scripts bajo `<origen>/_next/static/chunks/` |
| P4 / P11 | En modo hash y en modo nonce, no se ejecutó ninguna de las 9 inyecciones: en línea, mismo origen fuera de la ruta, `..`, `%2e%2e`, `\`, barra final 308, `data:`, externo y `onerror` |
| P5 / P8 | Estáticas: hashes, sin nonce, `s-maxage=31536000`. Dinámica: 3 nonces distintos, `no-store`. Ninguna respuesta con `'self'`, `strict-dynamic` ni `unsafe-*` |
| P6 | Inicio → Servicios → Acerca de → Contacto → English con un solo documento cargado, más el menú móvil |
| P12 | En los dos modos, el «gadget» confiable corrió y sus dos cargas quedaron bloqueadas |
| P13 | 12 formas de URL bajo `/_next/static/chunks/`; ninguna redirige fuera del prefijo |
| P14 | `Host` y `X-Forwarded-Host` manipulados: la CSP mantiene el origen configurado |
| P9 | 39 capturas (18 rutas × 2 anchos, la 404 y el menú abierto) antes y después: **idénticas píxel a píxel**. axe sin violaciones serias en 18 rutas × 2 anchos |
| `next dev` | `/es`, `/es/sistema` y `/en/work`: hidratan y 0 errores; los scripts salen de `/_next/static/chunks/` |
| `npm audit` | Producción: 0. Desarrollo: las mismas 8 moderadas de antes (`minimatch`, cadena de ESLint) |

**Las pruebas muerden.** Cada defecto se introdujo a propósito y después se
restauró el archivo (misma huella sha256):

| Mutación | Qué falló |
|---|---|
| `'self'` en `script-src` | 15 e2e: P5, P11 (mismo origen y los 4 *traversal*, en los dos modos) y P12 |
| `'strict-dynamic'` | P3/P10 en todas las rutas (no hidratan) |
| Origen tomado del `Host` | P14 |
| Hash viejo en el manifiesto | P2 y P3 de esa ruta |
| Manifiesto ausente | El servidor responde 500 a `/es` y `/es/no-existe` |
| **Otra versión de Next** (`SUPPORTED_NEXT_VERSION` ≠ instalada) | `scripts/csp-manifest.mjs` sale con 1 y no escribe manifiesto |
| **Otra estructura de chunks** (script en `/_next/static/js/` dentro del HTML real) | El build falla, nombrando el archivo |
| Script en línea nuevo en el HTML real | El build falla: «script en línea no contemplado» |

Además, Vitest cubre con datos sintéticos los casos de cambio de estructura:
registro de Turbopack fuera de `static/chunks/`, la carga RSC apuntando a otra
carpeta y otra forma del arranque.

**Pendiente, y no se presenta como superado (P-17):**

- **Firefox y Safari:** no se ejecutaron. Esta sesión solo tiene Chromium.
  Basta con sumar los proyectos `firefox` y `webkit` a Playwright y correr
  `csp.spec.ts`, más una prueba en Safari real. Lo que conviene vigilar ahí:
  las rutas de `host-source`, el bloqueo de manejadores y el reporte de
  violaciones.
- **CDN real:**
  - que cachee el HTML junto con su CSP;
  - que nunca cachee las respuestas con nonce (`private, no-store`);
  - que incluya `.next/csp-manifest.json` en el despliegue;
  - que no reescriba ni normalice las rutas bajo `/_next/static/chunks/` de
    forma que habilite redirecciones fuera del prefijo.

  Se decide con el hosting (006, ADR 004).
- **HTTPS con certificado de confianza:** el origen de producción se probó en
  el laboratorio de §10 con un certificado autofirmado. Los encabezados reales
  de un build con `https://thisjulio.com` están en
  `spec/features/001-…/evidencia-t18-encabezados.txt`, servidos por HTTP local.

## Anexo A — Cómo se midió (primera ronda)

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

## Anexo B — Cómo se midió (segunda ronda, §10)

- Dos copias aisladas en el *scratchpad*: build SSG sin SRI y build SSG con
  `experimental.sri`. El repositorio no se tocó; las copias se borran al
  terminar.
- Un frente HTTPS local (certificado autofirmado para `thisjulio.com`, sin
  dependencias) delante de `next start`. Chromium 153 resuelve el nombre a
  `127.0.0.1`, ignora el proxy del entorno y acepta el certificado.
- La CSP se aplicó al documento desde Playwright, con los hashes calculados
  del HTML que sirvió cada página. Las violaciones se recogieron con el evento
  `securitypolicyviolation`. La hidratación se comprobó con claves
  `__reactFiber` en un `<button>`. El menú móvil y la navegación se manejaron
  con los mismos roles accesibles que las e2e de la 001.
- Las redirecciones del servidor se probaron con un cliente HTTP crudo, sin
  normalizar la URL, con 19 formas de ruta bajo `/_next/static/chunks/`.
- **La comparación con la política actual** usó el build vigente del
  repositorio con su CSP real (nonce generado por el proxy). La variante
  «nonce + ruta» reescribió solo la `script-src` de esa respuesta.
- **No se midió:**
  - Firefox ni Safari (solo Chromium);
  - un CDN real;
  - HTTPS con un certificado de confianza;
  - páginas con el contenido de la 002 ni la carga diferida del motor WebGL
    de la 003.

  Las cubren P10–P14 al implementar y la 006.
