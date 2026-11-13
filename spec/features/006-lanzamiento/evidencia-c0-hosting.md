# 006 — Evidencia de la planificación: hosting, dominio y correo

**Fecha:** 2026-11-13. **Sobre:** `4561400` (cierre de la 003).
**Para:** la decisión P-38 (hosting) y las que dependen de ella (`plan.md` §2).

Todo lo de este documento se hizo **sin crear cuentas, sin conectar proveedores,
sin tocar DNS ni Cloudflare y sin desplegar nada**. El laboratorio corrió en una
copia aislada fuera del repositorio; el repositorio no cambió (ni `src/`, ni
dependencias, ni la CSP, ni `next.config.ts`, ni el proxy, ni la CI).

Etiquetas: **[Medido]** se ejecutó aquí y se vio el resultado · **[Doc]** lo dice
la documentación oficial citada, consultada el 2026-11-13 · **[Inferencia]**
razonado, sin medir · **[Pendiente de verificar]** no se pudo comprobar.

---

## 1. Lo que el sitio le exige a un hosting

Leído del código y del build actual (`.next/`, build `pRMMIfyd3wGHEu1DLC9aj`):

| # | Hecho | Fuente |
|---|---|---|
| H1 | El proxy (`src/proxy.ts`) corre en **runtime Node.js**. Next 16 no permite otro: «The `edge` runtime is NOT supported in `proxy`. The `proxy` runtime is `nodejs`, and it cannot be configured». | **[Medido]** `.next/server/functions-config-manifest.json` (`"/_middleware": { "runtime": "nodejs" }`); **[Doc]** `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` línea 600 |
| H2 | El proxy pone la CSP de **todas** las respuestas, también de las páginas estáticas: por eso tiene que ejecutarse **antes** de la caché del CDN. | `src/proxy.ts`; **[Doc]** `…/02-guides/cdn-caching.md`: «`proxy.js` should run before the CDN cache» |
| H3 | El proxy lee en tiempo de ejecución dos archivos del disco: `.next/csp-manifest.json` y `.next/BUILD_ID` (`process.cwd()`). Si faltan, responde **500** (falla cerrado, ADR 006). | `src/lib/security/csp-manifest.ts` |
| H4 | **Esos dos archivos no están en la traza de archivos del proxy.** El manifiesto se escribe *después* de `next build`, así que Next no puede saber que el proxy lo necesita. | **[Medido]** `.next/server/middleware.js.nft.json`: 95 archivos, 0 coincidencias con `csp-manifest`, `BUILD_ID` o `prerender-manifest` |
| H5 | La CSP de hashes solo vale si el HTML que llega al navegador es **byte a byte** el del build: 3 scripts en línea por página, cuyos SHA-256 están en el manifiesto. | **[Medido]** `.next/server/app/es.html`: 3 scripts en línea |
| H6 | Un build vale para **un solo origen**: `script-src` lleva `<SITE_ORIGIN>/_next/static/chunks/`, fijado al construir. | `next.config.ts`, `src/lib/security/origin.ts` |
| H7 | El 404 depende de `experimental.globalNotFound` y se renderiza por petición con nonce. | `next.config.ts`, ADR 006 §P-16 |
| H8 | Las 34 páginas son estáticas, sin ISR: `Cache-Control: s-maxage=31536000`; el 404, `private, no-cache, no-store`. | `spec/features/001-…/evidencia-t18-encabezados.txt` |

**Consecuencia de H3 + H4:** hoy el único destino donde el build funciona tal
cual es un **servidor Node con `next start`**, que es donde corren las 981
pruebas e2e. En cualquier plataforma que empaquete el proxy como función
(Vercel, Workers), el manifiesto tiene que llegar a esa función por un camino
que hoy no existe. Es trabajo de la 006 en cualquier caso (`plan.md` §2.4).

## 2. Laboratorio: Cloudflare Workers con OpenNext **[Medido]**

**Entorno.** Copia de `HEAD` (`git archive`) en el scratchpad, `npm ci`, y solo
ahí: `@opennextjs/cloudflare@1.20.17`, `wrangler@4.161.0`, `next@16.4.5`,
Node 22.14.0, macOS. Servido en local con `wrangler dev` (workerd), sin cuenta.
`SITE_ORIGIN=http://localhost:8787`.

### 2.1 Pasada 1 — el sitio tal cual

| Paso | Resultado |
|---|---|
| `opennextjs-cloudflare build` | Termina bien. El manifiesto de CSP se genera (34 rutas). Aviso del adaptador: **«Node.js middleware support is experimental in cloudflare, and not officially maintained by OpenNext maintainers. Use at your own risk.»** |
| `GET /es`, `/es/trabajo`, `/en/about`, `/es/no-existe` | **500 Internal Server Error.** En el registro: `Falta .next/csp-manifest.json` (H3: el archivo no existe dentro del Worker) |
| `GET /foto.png` | **404 con el 404 propio**, CSP con nonce, `no-store`, HSTS, `nosniff`, `X-Frame-Options`: `globalNotFound` **funciona** |
| `GET /` y `GET /es/work` | **307** a `/es` y a `/es/trabajo`, con la CSP sin scripts: funciona |

### 2.2 Pasadas 2 y 3 — con el manifiesto embebido (cambio solo de laboratorio)

Para ver qué pasa después del 500, en la copia se fijó el `BUILD_ID`
(`generateBuildId`) y el proxy importó el manifiesto como módulo en vez de
leerlo del disco. **Ese cambio no está en el repositorio ni se propone tal cual.**

| Comprobación | Resultado |
|---|---|
| ¿El manifiesto es reproducible? | Dos builds seguidos con el mismo constructor y el mismo `BUILD_ID`: **manifiestos idénticos** (34 rutas). Entre la pasada 1 (`npm run build`) y la 2 (build de OpenNext) cambió 1 de los 3 hashes de cada ruta (el de los datos RSC); la causa no se investigó |
| Páginas estáticas | **200**, `Cache-Control: s-maxage=31536000`, CSP de hashes con 3 hashes |
| **¿La CSP autoriza los scripts del HTML servido?** | **No.** El Worker no sirve el HTML del build: lo **vuelve a renderizar** (`x-nextjs-cache: MISS`) y ese HTML trae **12 a 15 scripts en línea** en lugar de 3. Quedan **10 a 13 scripts sin autorizar por página** (medido en `/es`, `/en`, `/es/trabajo`, `/es/servicios/sistemas-pos`, `/en/architecture`, `/es/legal`): la página no hidrataría |
| Con la caché para sitios estáticos (`staticAssetsIncrementalCache` + `enableCacheInterception`) | Igual: `x-nextjs-cache: MISS`, 10–13 scripts sin autorizar, y errores `StaticAssetsIncrementalCache: Failed to set to read-only cache` en el registro |
| 404 (`/es/no-existe`, `/foto.png`) | 404, nonce nuevo, los 3 scripts con su nonce, `no-store` |
| `/_next/static/chunks/*.js` | 200 con `Cache-Control: public, max-age=0, must-revalidate` (sin `immutable`; se configura aparte) |
| Tamaño del Worker (`wrangler deploy --dry-run`, sin desplegar) | 6 414 KiB · **1 340 KiB gzip** |

**Límites de esta prueba.** No se probaron las cachés con R2 o KV (piden cuenta)
ni otras opciones del adaptador; puede existir una configuración que sirva el
HTML del build. `wrangler dev` no es la red de Cloudflare. Lo que queda medido es
que **ni la configuración por omisión ni la documentada para sitios estáticos
cumplen H5 con esta versión**.

## 3. Documentación oficial consultada (2026-11-13)

### 3.1 Next.js 16.4.5 (documentación incluida en `node_modules/next/dist/docs/`)

- **Adaptadores verificados:** «Vercel» y «Bun». «Cloudflare and Netlify are
  working on verified adapters built on the Adapter API. In the meantime, they
  offer their own Next.js integrations», que «are not verified by the Next.js
  team, so feature support and compatibility may vary» (`01-getting-started/17-deploying.md`).
- **Servidor Node y Docker:** soportan «All» las funciones (`17-deploying.md`).
- **`global-not-found.js`:** sigue marcado «(experimental)» (`03-file-conventions/not-found.md`).
- **Caché:** páginas estáticas `s-maxage=31536000`; dinámicas `private, no-cache,
  no-store`; `/_next/static/` `public, max-age=31536000, immutable`; el CDN debe
  incluir `_rsc` en la clave de caché y conservar el encabezado `rsc` (`02-guides/cdn-caching.md`).

### 3.2 Vercel

| Dato | Valor | Fuente |
|---|---|---|
| Precio | Hobby US$0 · **Pro US$20/mes**, con US$20 de crédito de uso · Enterprise a medida. Asiento de desarrollador adicional, US$20/mes. Impuestos aparte | <https://vercel.com/pricing>, <https://vercel.com/docs/plans/hobby> |
| Uso comercial | Hobby: solo uso personal y no comercial; todo uso comercial pide Pro o Enterprise. Entre los ejemplos de uso comercial está anunciar la venta de un producto o servicio | <https://vercel.com/docs/limits/fair-use-guidelines>, <https://vercel.com/legal/terms> §4. **[Pendiente de verificar]** la cita literal: la descarga directa de la página no trajo esa sección; el texto sale del resumen del buscador sobre esas dos URL |
| Límites de Hobby | 100 GB de transferencia, 1 M de peticiones al CDN, 1 M de invocaciones, 4 h de CPU, 360 GB-h de memoria, 100 despliegues al día, registros de 1 hora. No puede comprar uso extra: al pasarse, la función se pausa hasta 30 días | <https://vercel.com/docs/plans/hobby> (actualizada 2026-09-14) |
| Incluido en Pro | 1 TB de transferencia y 10 M de peticiones al CDN al mes según la página de precios; la guía de uso dice «Flat Rate CDN». Lo demás, por uso contra el crédito: invocaciones US$0,60/M, CPU activa desde US$0,128/h, memoria desde US$0,0106/GB-h. Registros de 1 día. Límite de gasto configurable | <https://vercel.com/pricing>, <https://vercel.com/docs/limits/fair-use-guidelines> |
| Proxy | «Routing Middleware» se ejecuta **antes de la caché** («Because it runs globally before the cache…»), en Node.js por omisión, en todos los planes; en Next 16 se usa `proxy.ts`. Se cobra como cómputo (Fluid). Sin `matcher` corre en cada petición | <https://vercel.com/docs/routing-middleware> (actualizada 2026-08-14) |
| Dominio con DNS externo | Apex con un registro **A**; subdominio con un **CNAME** propio de cada proyecto (ejemplo de la guía: `d1d4fc829fe7bc7c.vercel-dns-017.com`). Los valores exactos los muestra el panel del proyecto | <https://vercel.com/docs/domains/working-with-domains/add-a-domain> (actualizada 2026-09-16) |
| Cloudflare delante | «We recommend connecting directly where possible, but you can place a proxy in front of Vercel». Con Cloudflare solo para DNS: registros en **DNS only**. Un proxy delante cachea por su cuenta (un despliegue nuevo no limpia esa caché) y debilita la protección contra bots | <https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment> |
| Previews en dominio propio | Hay que añadir `X-Robots-Tag: noindex` a mano si se asigna un dominio propio a una rama | <https://vercel.com/docs/headers/response-headers> |

**No se pudo medir** (pide cuenta): que el manifiesto llegue al proxy (H3/H4),
que el CDN sirva el HTML del build sin tocarlo (H5), `globalNotFound`, los
encabezados que añade la plataforma y la vuelta atrás instantánea. Van a la
tarea T10 de `tasks.md`, **[Pendiente de verificar]** hasta entonces.

### 3.3 Cloudflare

| Dato | Valor | Fuente |
|---|---|---|
| Workers Free | 100 000 peticiones al día; 10 ms de CPU por invocación. Al pasarse del límite diario: error 1027 o, si la ruta «falla abierta», la petición pasa **sin el Worker** | <https://developers.cloudflare.com/workers/platform/pricing/>, <https://developers.cloudflare.com/workers/platform/limits/> |
| Workers Paid | **US$5/mes** por cuenta: 10 M de peticiones y 30 M de ms de CPU incluidos; después US$0,30/M y US$0,02/M de ms | misma |
| Recursos estáticos | «Requests to static assets are free and unlimited» | misma |
| Tamaño del Worker | 3 MiB (Free) y 10 MiB (Paid), comprimido, según OpenNext; la página de límites de Cloudflare habla de 64 MiB sin comprimir. **[Pendiente de verificar]** cuál rige | <https://opennext.js.org/cloudflare>, <https://developers.cloudflare.com/workers/platform/limits/> |
| OpenNext | Soporta Next 16. **«Node.js in Middleware — Not yet supported»** | <https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/> (actualizada 2026-10-12), <https://opennext.js.org/cloudflare> |
| Recomendación de Cloudflare | «Cloudflare recommends vinext instead of OpenNext for new Next.js applications». vinext es «a Vite plugin that reimplements the Next.js API surface» | <https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/> (actualizada 2026-11-05) |
| Workers Builds | Free: 3 000 min/mes, 1 build a la vez. Paid: 6 000 min/mes, US$0,005 por minuto extra | <https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/> |
| Email Routing | Gratis en Workers Free y Paid, correo entrante sin límite. Exige DNS en Cloudflare. Añade 3 **MX** (`route1/2/3.mx.cloudflare.net`), un **TXT** SPF (`v=spf1 include:_spf.mx.cloudflare.net ~all`) y un **TXT** DKIM (`cf2024-1._domainkey`), y los deja bloqueados. La dirección de destino se verifica por correo. Sin regla que coincida, el mensaje se rechaza. Si hay MX de otro proveedor, falla con el error 2008 | <https://developers.cloudflare.com/email-service/platform/pricing/>, <https://developers.cloudflare.com/email-service/configuration/domains/>, <https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/> |
| Ofuscación de correo | «Cloudflare enables email address obfuscation automatically when you sign up». Reescribe las direcciones del HTML e **inyecta el script `email-decode.min.js`**. Solo actúa sobre tráfico que pasa por el proxy de Cloudflare | <https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/> (actualizada 2026-08-03) |
| Funciones que cambian el HTML | Además de la anterior: AI Labyrinth, Always Online, Automatic HTTPS Rewrites, desafíos, Cloudflare Fonts, Markdown for Agents, reemplazo de librerías inseguras | <https://developers.cloudflare.com/rules/configuration-rules/response-body-inspection/> |
| DNSSEC | Se activa en el panel; con Cloudflare Registrar el registro DS se publica solo, en uno o dos días | <https://developers.cloudflare.com/dns/dnssec/> |

## 4. Estado público del dominio **[Medido]**

Consultas de solo lectura (`dig`, `whois`, `curl`) el 2026-11-13:

| Dato | Resultado |
|---|---|
| Registrador | **Cloudflare, Inc.** Creado el 2026-11-12; vence el 2031-11-12 |
| Servidores de nombres | `paige.ns.cloudflare.com`, `henrik.ns.cloudflare.com` |
| Registros `A`, `AAAA`, `MX`, `TXT`, `CAA` en el apex; `www`; `_dmarc` | **Ninguno** |
| DNSSEC | `unsigned`; sin registro `DS` |
| `https://thisjulio.com`, `http://thisjulio.com` | No responde (no hay registro que resolver) |

Qué significa: no hay sitio ni correo que se pueda romper; Email Routing no
chocará con MX previos; DNSSEC será automático; y la vuelta atrás del día del
lanzamiento es **borrar los registros** (el dominio vuelve al estado de hoy).

## 5. Lectura de la evidencia

| Requisito | Servidor Node (`next start`) | Vercel | Workers + OpenNext 1.20.17 |
|---|---|---|---|
| H1 proxy en Node.js | ✔ medido (e2e) | ✔ **[Doc]** | ⚠ «experimental», sin mantenimiento oficial **[Medido + Doc]** |
| H2 proxy antes de la caché | ✔ (no hay CDN) | ✔ **[Doc]** | ✔ en el laboratorio |
| H3/H4 manifiesto en el proxy | ✔ medido | **[Pendiente de verificar]**; por H4 se espera que falle sin un cambio | ✘ **500 medido** |
| H5 HTML idéntico al del build | ✔ medido | **[Pendiente de verificar]** | ✘ **medido: vuelve a renderizar; 10–13 scripts sin autorizar** |
| H7 `globalNotFound` + nonce | ✔ medido | **[Pendiente de verificar]** | ✔ medido |
| Adaptador verificado por Next | no aplica | ✔ **[Doc]** | ✘ **[Doc]** |

Conclusiones y recomendación: `plan.md` §2.
