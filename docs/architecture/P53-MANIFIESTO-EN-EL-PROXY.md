# Análisis: cómo llega el manifiesto de CSP al proxy en Vercel (P-53)

- **Estado:** análisis estático (§1–§5) y **medición en una copia aislada con
  el adaptador oficial** (§6, aprobada por Julio el 2026-11-13), sin desplegar.
  **No decide P-53**: la corrección va en otra sesión (Fable 5.2, esfuerzo
  alto) con aprobación previa.
- **Fecha:** 2026-11-13
- **Versiones:** Next.js 16.4.5 (build local con Turbopack), adaptador oficial
  de Vercel `@next-community/adapter-vercel` 0.0.1-beta.37 (repositorio
  `github.com/nextjs/adapter-vercel`, último commit `187884e`, 2026-11-12).
- **Resultado medido (§6): sin cambios, el manifiesto NO llega al proxy.** Antes
  incluso, **el build falla**: con un adaptador, Next deja el HTML en
  `.next/server/route-cache/`, y `scripts/csp-manifest.mjs` (y la puerta G2) lo
  buscan en `.next/server/app/`. Si el build pasara, el proxy lanzaría en cada
  página: 500. Falla cerrado en los dos casos: ninguna página con una CSP más
  laxa. Es un **bloqueo del lanzamiento**, no un riesgo de seguridad.

## Marcas

| Marca | Significa |
|---|---|
| **[Código]** | Leído en el código instalado (`node_modules/next/dist/…`) o en el del adaptador oficial |
| **[Doc]** | Documentación oficial: la de Next en `node_modules/next/dist/docs/` (exacta para la 16.4.5) o páginas oficiales con fecha |
| **[Medido]** | Salida de `next build` en esta máquina |
| **[Inferencia]** | Deducción sin medición |

## 1. Qué necesita el proxy

`src/lib/security/csp-manifest.ts` lee en ejecución **dos** archivos con
`join(process.cwd(), '.next', …)`: `csp-manifest.json` y `BUILD_ID`. Si falta
cualquiera de los dos, lanza `CspManifestError` y la petición responde 500
**[Código]**. Medido en una copia aislada sin el manifiesto: `/es` y
`/es/no-existe` → 500 `text/plain`, «Internal Server Error», con el motivo
solo en el registro del servidor (`auditoria-seguridad.md` §4).

`scripts/csp-manifest.mjs` escribe el manifiesto **después** de `next build`
(`package.json`: `next build && node scripts/csp-manifest.mjs && …`), porque
necesita el HTML real del build **[Código]**.

## 2. Qué empaqueta Next 16.4.5 para el proxy

1. **La traza del proxy no los incluye.** `.next/server/middleware.js.nft.json`
   de este build: 95 archivos, **0** con `csp-manifest`, `BUILD_ID` o
   `prerender-manifest` **[Medido]**. Lo mismo que en ▲C0 (H4 de
   `evidencia-c0-hosting.md`). `.next/BUILD_ID` está en
   `required-server-files.json`, pero esa lista no forma parte de los archivos
   del proxy (§3) **[Código]**.
2. **`outputFileTracingIncludes` no sirve para un archivo que se crea
   después.** Se aplica dentro de `next build`
   (`build/collect-build-traces.js:437–520`), resolviendo los globs en ese
   momento, y sobre las entradas de la traza de rutas **[Código]**. Cuando se
   ejecuta, `csp-manifest.json` todavía no existe. Además, la documentación lo
   describe por rutas («route globs»), no por proxy **[Doc]**
   (`…/next-config-js/output.md`). Que alcance la traza del proxy con
   Turbopack **[Inferencia]**: no parece, y da igual por lo anterior.
3. **Vercel lee la traza NFT.** El propio código de Next lo dice al renombrar
   `proxy.js` a `middleware.js`: «the files in NFT will differ from the actual
   outputs, which will fail for the providers like Vercel that uses NFT»
   (`build/index.js:2831–2834`) **[Código]**.

## 3. Cómo arma Vercel la función del proxy en 2026

1. **API de adaptadores, estable desde Next 16.2** («Next.js 16.2 ships with a
   stable, public Adapter API»; «Vercel's adapter uses this same public
   contract, with no private hooks») **[Doc]**
   <https://nextjs.org/blog/nextjs-across-platforms> (2026-03-25).
2. **El adaptador se activa solo en Vercel.** README del adaptador: «It does not
   need to be used directly as it will be auto configured when deploying on
   Vercel» **[Doc]**. En Next 16.4.5 la configuración por omisión es
   `adapterPath: process.env.NEXT_ADAPTER_PATH` (`server/config-shared.js:189`)
   **[Código]**: la plataforma lo puede activar con una variable de entorno,
   sin tocar `next.config.ts`.
3. **Corre dentro de `next build`.** `handleBuildComplete` se llama al final
   de `next build`, después de la traza (`build/index.js:2863–2866`)
   **[Código]**, y por tanto **antes** de `scripts/csp-manifest.mjs`.
4. **Los archivos del proxy salen de la traza en ese momento.** Para un proxy
   en Node, `handleTraceFiles(middleware.js)` lee `middleware.js.nft.json` y
   le añade unos pocos archivos comunes de Next
   (`build/adapter/build-complete.js:202–216` y `471–480`) **[Código]**. El
   adaptador de Vercel copia esa lista (`output.assets`) al `filePathMap` de
   `.vc-config.json`, con el hash de cada archivo (`fileHashes`), en
   `.next/output/functions/_middleware.func/` (`packages/adapter/src/outputs.ts`,
   `handleNodeOutputs`) **[Código]**.
5. **El directorio de trabajo sería el correcto.** El lanzador del adaptador
   hace `process.chdir(__dirname)` en la raíz del proyecto (`node-handler.ts`,
   línea 19) **[Código]**. `process.cwd()/.next/csp-manifest.json` apuntaría al
   lugar correcto **si el archivo estuviera en `filePathMap`**.

**Conclusión:** con el adaptador, la lista de archivos del proxy queda cerrada
dentro de `next build`, cuando el manifiesto todavía no existe: **el
manifiesto no llega al proxy** (confirmado en §6). *Corrección tras medir:*
`BUILD_ID` **sí** llega, porque el adaptador añade los archivos comunes del
servidor; aquí se había inferido que no. La opción **A de P-53** («añadir el manifiesto a la traza del proxy
tras el build») **probablemente no funciona**: cuando el script edita la
traza, el adaptador ya la leyó. Solo funcionaría si Vercel usara para esta
versión el empaquetador anterior, que lee las trazas después del comando de
build. No se descarta, y por eso se mide.

**Otro efecto del adaptador para la T10:** su `modifyConfig` añade
instrumentación por omisión (`injectDefaultTracing`, `@vercel/otel`) en los
builds de producción **[Código]**. El manifiesto se calcula del HTML real, así
que si cambia el HTML los hashes siguen coincidiendo **[Inferencia]**. Pero hay
que confirmar que no aparezcan scripts nuevos y que la consola no muestre
violaciones de CSP (por ejemplo, de la barra de herramientas de Vercel en el
preview).

## 4. Opciones, de nuevo (para ▲C2; no se decide aquí)

| Opción | Qué hace | Cambia | Riesgo |
|---|---|---|---|
| **A** (la de ▲C0) | El paso posterior al build añade el manifiesto y `BUILD_ID` a `middleware.js.nft.json` | `scripts/` | **No llega** con el adaptador (§3.4); solo sirve con el empaquetador anterior |
| **A2** | El paso posterior al build añade los dos archivos y sus hashes al `filePathMap` de `.next/output/functions/_middleware.func/.vc-config.json` | `scripts/` | Depende del formato interno de un adaptador en beta: frágil; se rompe si Vercel cambia la salida |
| **A3** (nueva) | Un adaptador propio y mínimo que envuelve al de Vercel. En `onBuildComplete`, que ya tiene el HTML prerenderizado, genera el manifiesto, lo añade con `BUILD_ID` a `outputs.middleware.assets` y `assetsHashes`, y delega en el adaptador de Vercel (el de `NEXT_ADAPTER_PATH`) | `next.config.ts` (`adapterPath`), `scripts/` | Usa solo la API pública y estable. Hay que confirmar cómo lo activa Vercel; en local (`next start`) no cambia nada. Lo más correcto, y de complejidad media |
| **B** (la de ▲C0) | Embeber manifiesto y `BUILD_ID` en el código del proxy con un build en dos pasadas y un `BUILD_ID` determinista | `next.config.ts`, `src/lib/security/csp-manifest.ts`, `scripts/` | No depende de cómo se empaquete. Duplica el tiempo de build y exige que las dos pasadas den el mismo HTML (en el laboratorio dieron manifiestos idénticos) |
| **C** | Servidor Node (`next start`) | Hosting (P-38 C) | Funciona sin cambios (medido); cambia la decisión de hosting |

En todas: las mismas directivas, el proxy sigue fallando cerrado, y se repiten
P1–P14 y las mutaciones de la T18 (CA-20).

## 5. Qué medir en la T10 (en este orden; se detiene en la primera falla)

| # | Medición | Cómo | Qué decide |
|---|---|---|---|
| M1 | ¿Se activó el adaptador? | Registro del build en Vercel: Next escribe «Applying modifyConfig from Vercel» cuando el adaptador tiene `modifyConfig` (`server/config.js:1158–1163`) y aparece `.next/output` | Si **no** aparece: empaquetador anterior; la opción A vuelve a ser viable |
| M2 | ¿Qué archivos tiene la función del proxy? | Lista de archivos del despliegue (panel → *Deployment* → *Source/Output*, o la API de Vercel con permiso de lectura): buscar `.next/csp-manifest.json` y `.next/BUILD_ID` en `_middleware` | Confirma o descarta §3 |
| M3 | ¿Responde? | `curl -sI` a `/es`, `/es/no-existe` y `/` del preview; registro de ejecución: `Falta .next/csp-manifest.json` | 200 → seguir con CA-12; 500 → parar y presentar P-53 |
| M4 | Si responde: hashes y HTML | CA-12 (a)–(f) completo, también con respuestas de caché | — |
| M5 | Efectos del adaptador | Consola del navegador en el preview: 0 violaciones de CSP y ningún script nuevo; comparar el HTML servido con el del build | Detecta lo de §3, último párrafo |

**Para no tener que esperar a la T10** (propuesta; necesita la aprobación de
Julio, porque descarga el adaptador de npm): en una **copia aislada**, sin
tocar `package.json`, construir con
`NEXT_ADAPTER_PATH=<adaptador>/dist/index.js npm run build` y leer el
`filePathMap` de `.next/output/functions/_middleware.func/.vc-config.json`.
Eso convierte M1 y M2 en una medición sin crear cuentas ni desplegar, y P-53
podría llegar decidida a la T10.

## 6. Medición en una copia aislada (2026-11-13)

**Montaje.** Copia de `6b1a38a` (`git archive`) fuera del árbol de trabajo, con
su propio `npm ci`. Solo en la copia, sin guardarlos en `package.json`:
`@next-community/adapter-vercel@0.0.1-beta.37`, la última (2026-11-12,
posterior a Next 16.4.5) y la misma cuyo código se leyó en §3, y
`@vercel/build-utils@15.4.0`, que el adaptador necesita y que en Vercel trae el
entorno de build. Build:
`NEXT_ADAPTER_PATH=…/adapter-vercel/dist/index.js SITE_ORIGIN=http://localhost:3100 npm run build`.
No se creó ninguna cuenta, no se conectó Vercel y no se desplegó nada.

| # | Pregunta | Resultado **[Medido]** |
|---|---|---|
| **M1** | ¿Se activa el adaptador? | **Sí.** El registro de `next build` dice `Applying modifyConfig from Vercel` y `Running onBuildComplete from Vercel`, y aparece `.next/output/` (funciones, estáticos y `config.json`) |
| **M0** (nueva) | ¿Pasa `npm run build`? | **No: sale con 1.** `[csp-manifest] ERROR — 35 problema(s): /en: está en prerender-manifest.json pero no tiene HTML en el build …`. Causa **[Código]**: `useScopedBuildArtifacts: Boolean(nextConfig.adapterPath) && …` (`export/worker.js:295`); con **cualquier** adaptador, el HTML prerenderizado va a `.next/server/route-cache/APP_PAGE/<hash>/$/<ruta>.html`, y el adaptador lo copia a `.next/output/functions/<ruta>.prerender-fallback.html`. **La puerta G2 tampoco lo encuentra**: `release-gates --report` con el origen de producción dice «no se encontró el HTML de Legal (es) en el build». **En Vercel, hoy, el despliegue fallaría en el build** |
| **M2** | ¿Qué archivos lleva la función del proxy? | `.next/output/functions/_middleware.func/.vc-config.json`: `runtime: nodejs22.x`, `handler: ___next_launcher.cjs`, `useWebApi: true` y **115 archivos** en `filePathMap`, por referencia (rutas desde la raíz del repo), cada uno con su `fileHashes`. Incluye `.next/BUILD_ID` y `.next/prerender-manifest.json`; **no incluye `.next/csp-manifest.json`** |
| **M3** | ¿Responde? (emulado) | Se montó la función con **solo** los archivos de `filePathMap` y se llamó a su lanzador con un `Request` (guion y salida en `spec/features/006-lanzamiento/evidencia-p53/`; uso: `node p53-emular.mjs <copia>`). **E1, como la empaquetaría Vercel:** `/es`, `/es/trabajo` y `/es/no-existe` → excepción `Falta .next/csp-manifest.json…`: la plataforma respondería **500**. `/` → 307 a `/es` (la CSP de una redirección no usa el manifiesto). **E2, añadiendo `.next/csp-manifest.json`:** `/es` → 200 con hashes; `/es/trabajo` → 200 con hashes y reescritura a `/es/work`; `/es/no-existe` → nonce; `/` → 307 |
| **M4** | ¿Coinciden HTML y hashes? (parte local) | El HTML que serviría Vercel (`es.prerender-fallback.html`) es **idéntico** al de `route-cache` (misma huella SHA-256). Un manifiesto calculado de esos archivos autoriza exactamente sus scripts. **No verificado:** la caché y el CDN reales (T10, CA-12) |
| **M5** | ¿El adaptador cambia el HTML o añade scripts? | El escáner del repositorio (`scripts/lib/csp-scan.mjs`) acepta el HTML del adaptador: 32 rutas con hashes y **ningún script en línea no contemplado**. **No verificado:** lo que el hosting pueda inyectar en el borde del preview (barra de herramientas de Vercel): consola del preview en la T10 |

**Veredicto: sin cambios, el manifiesto no llega al proxy en Vercel**, y antes
el build no pasa. Con el manifiesto en la lista de archivos de la función, el
proxy responde como en local (E2). Queda una inferencia por medir en la T10:
que Vercel lea `.next/output` **después** de que termine todo el comando de
build, que incluye los pasos posteriores a `next build`.

### Lo que necesita cualquier corrección

1. **Encontrar el HTML en un build con adaptador** para el manifiesto y para
   la puerta G2. Hoy los dos fallan cerrado.
2. **Poner `.next/csp-manifest.json` en la lista de archivos de la función del
   proxy.**
3. **Hashes.** `fileHashes`/`assetsHashes` no son un SHA-256 del contenido sino
   el hash propio de Next, con sal (`hashFile(salt, …)`, interno;
   `build/adapter/build-complete.js:1591–1597`). Falta medir si una entrada sin
   hash es válida para Vercel.
4. **Una prueba en la CI** que construya con el adaptador oficial y emule la
   función (como `evidencia-p53/p53-emular.mjs`). Vercel actualiza el adaptador solo («It is
   recommended to leave this automatically configured to receive automatic
   fixes», README), así que un cambio suyo puede romper el despliegue sin tocar
   el repositorio.

### A2 y A3 con su costo (para la decisión de Julio)

| | **A2**: parchear la salida del adaptador | **A3**: adaptador propio que envuelve al de Vercel |
|---|---|---|
| Qué hace | Tras `next build`: el generador lee el HTML de `.next/output/functions/*.prerender-fallback.html` (o de `route-cache`); escribe el manifiesto; lo añade a `filePathMap` (y `fileHashes`) de `_middleware.func/.vc-config.json`. G2 lee el mismo HTML | En `onBuildComplete`, con la API pública: lee el HTML de `outputs.prerenders[].fallback.filePath`, genera el manifiesto, lo añade a `outputs.middleware.assets` (y `assetsHashes`) y llama al `onBuildComplete` del adaptador de Vercel (el de `NEXT_ADAPTER_PATH`). G2 y el paso posterior al build validan lo ya generado |
| Toca | `scripts/csp-manifest.mjs`, `scripts/lib/csp-scan.mjs` (lectura del HTML), `scripts/lib/release-gates.mjs` | Un archivo nuevo en `scripts/` (el adaptador), `next.config.ts` (`adapterPath` solo cuando existe `NEXT_ADAPTER_PATH`), `scripts/csp-manifest.mjs` y `release-gates` |
| Depende de | La **salida interna** de un adaptador en beta (`.vc-config.json`, nombres de archivo, formato de `fileHashes`) y de que Vercel lea esa salida después del comando de build **[Inferencia]** | La **API pública y estable** de adaptadores (Next 16.2+); del contrato de `assets`/`assetsHashes`; de que Vercel siga activando su adaptador con `NEXT_ADAPTER_PATH` |
| Fragilidad | **Alta**: cualquier cambio del adaptador, que Vercel actualiza solo, puede romperlo | **Media**: el contrato es público y versionado; hay que delegar bien `modifyConfig` y `onBuildComplete` |
| Tamaño estimado | 60–120 líneas y sus pruebas | 150–250 líneas y sus pruebas |
| En local (`next start`) | Sin cambios | Sin cambios: sin `NEXT_ADAPTER_PATH` no hay adaptador |
| Pruebas | Unitarias de la lectura del HTML en los dos diseños; un paso de la CI que construya con el adaptador y emule la función | Ídem, y unitarias del envoltorio con `outputs` sintéticos |
| CA-20 | Toca `scripts/` (aprobación de P-53) | Toca `scripts/` y `next.config.ts` (aprobación de P-53) |

En los dos: mismas directivas, el proxy sigue fallando cerrado, se repiten
P1–P14 y las mutaciones de la T18, y la medición M1–M5 se repite en el preview.
**Recomendación técnica: A3**, porque solo usa la API pública y es la que
mejor resiste las actualizaciones automáticas del adaptador. B (embeber, en
dos pasadas) también tendría que resolver el punto 1. **La corrección no se
hace en esta sesión.**

