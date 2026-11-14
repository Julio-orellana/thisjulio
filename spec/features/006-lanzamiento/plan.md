# 006 — Plan

**Estado:** **aprobado por Julio en ▲C0 (2026-11-13), con las opciones
recomendadas en P-38 a P-52** (`spec.md` §10). P-53 se decide en ▲C2. Sin código
todavía. Las etiquetas son las de `spec.md` §0.

## 0. Lo que se leyó y se midió antes de planear

- `CLAUDE.md`, `docs/PENDIENTES.md`, `spec/constitution/*`, `ARCHITECTURE.md`,
  `SECURITY.md`, `TEST-PLAN.md`, ADR 004, 005 y 006, y los cierres de la 001, la
  002 y la 003.
- Código: `src/proxy.ts`, `src/lib/security/*`, `scripts/csp-manifest.mjs`,
  `scripts/lib/csp-scan.mjs`, `next.config.ts`, `src/i18n/routing.ts`,
  `SiteDocument`, las páginas y los 9 enlaces al estimador; el build actual
  (`.next/`).
- Documentación de Next 16.4.5 incluida en `node_modules/next/dist/docs/`
  (despliegue, adaptadores, proxy, caché en CDN, `global-not-found`).
- Documentación oficial de Vercel y Cloudflare, y un laboratorio local con
  OpenNext: `evidencia-c0-hosting.md`.

## 1. Decisiones que se piden a Julio (con recomendación)

**▲C0 (2026-11-13):** Julio eligió la opción recomendada en P-38 a P-52. La
tabla se conserva como se presentó; lo que sigue de este plan es ya lo vigente.

| ID | Decisión | Opciones | Recomendación y por qué |
|---|---|---|---|
| **P-38** | Hosting | **A.** Vercel Pro. **B.** Cloudflare Workers + OpenNext. **C.** Servidor Node (`next start`) en un PaaS o contenedor, con Cloudflare delante. **D.** Vercel Hobby. | **A, condicionada a la prueba en preview (T10).** Es el único adaptador verificado por Next y corre el proxy antes de la caché. D no es admisible: el plan gratuito es solo para uso no comercial. B falla hoy, medido (§2). Si A no pasara T10 sin relajar la CSP, **C**, que es donde el sitio ya funciona sin cambios. |
| **P-39** | Dominio canónico | **A.** `thisjulio.com`; `www` redirige con 308. **B.** `www.thisjulio.com`; el apex redirige. | **A.** Es el origen que ya usan `.env.example` y la evidencia de la T18; más corto y coincide con la marca. |
| **P-40** | Rama de producción y forma de desplegar | **A.** Integración Git del hosting: producción desde `main` tras un merge aprobado, previews de las demás ramas; la CI de GitHub sigue solo verificando. **B.** Desplegar desde GitHub Actions con un token. **C.** Desplegar a mano desde la máquina de Julio. | **A.** No mete secretos en GitHub y respeta «CI solo de verificación». Hoy no existe `main` (la rama por defecto es `claude/gifted-keller-x03g4c`): se crea desde ella al lanzar, con aprobación. B cambia una decisión de la 001. |
| **P-41** | Entorno de preview | **A.** El dominio estable que da el hosting a la rama, protegido con su autenticación; sin tocar DNS. **B.** `preview.thisjulio.com` (un CNAME), con `noindex`. | **A** para la prueba y la revisión. B solo si Julio quiere enseñarlo a terceros. En los dos casos el preview se construye con su propio `SITE_ORIGIN`. |
| **P-42** | Correo de contacto | **A.** Email Routing de Cloudflare: una dirección `@thisjulio.com` que reenvía a la bandeja de Julio. Gratis. Julio responde desde su bandeja personal. **B.** Buzón real de pago (envía y recibe como `@thisjulio.com`). **C.** Publicar una dirección que no sea del dominio. | **A** para lanzar. Limitación dicha sin rodeos: la respuesta sale desde la dirección personal de Julio. La dirección la elige Julio (no se inventa). Con A se propone además `_dmarc` con `p=reject`: el dominio no envía correo y así nadie lo suplanta; se revisa en la 004. |
| **P-43** | Página Contacto provisional y exposición del correo | **A.** Una isla arma el `mailto:` al hidratar; el correo no está en el HTML; sin JavaScript se lee escrito en palabras. **B.** Enlace `mailto:` normal en el HTML. **C.** Solo texto, sin enlace. | **A.** Es lo que pide el encargo. Lo que no cubre: un rastreador que ejecute JavaScript lo ve igual. La defensa de fondo es P-42 A: la dirección publicada es un alias que se puede cambiar sin tocar la bandeja real. Composición: `spec.md` §3.2. |
| **P-44** | CTA «Iniciar un proyecto» y Estimador mientras no exista la 004 | **A.** El CTA lleva a Contacto; se omiten las entradas que nombran el estimador; `/estimador` y `/estimate` dejan de ser rutas (404 propio) hasta la 004. **B.** `/estimador` redirige a `/contacto`. **C.** Publicar el esqueleto actual. | **A.** «Lo pendiente se omite»: no se publica una página vacía ni un «próximamente». B mantiene vivas URL que aún no significan nada. Es una adaptación temporal del diseño: se anota en `REFERENCIA-DISENO.md` §5. Quedan 32 rutas. |
| **P-45** | Mensajes enviados al navegador (cierra P-24) | **A.** El proveedor recibe solo los espacios que usan las islas. **B.** Dejarlo. | **A.** Menos HTML en todas las rutas **[Inferencia: unos 6,5 KB sin comprimir; se mide]** y las palabras «PostgreSQL» y «MongoDB» dejan de viajar en 33 rutas. Cambia `SiteDocument` (001): con regresión visual y e2e. |
| **P-46** | Presupuesto de rendimiento por ruta | Aprobar la tabla de `spec.md` §3.5, o fijar otros valores. | **Aprobarla.** Los límites dejan un margen del 5 % sobre lo medido hoy; LCP y CLS son los umbrales «bueno» de Core Web Vitals o más estrictos. |
| **P-47** | Datos estructurados (JSON-LD) | **A.** `WebSite` (nombre, URL, idiomas) y `Person` (Julio Orellana, URL, GitHub). **B.** Además `Organization` para THIS JULIO. **C.** Ninguno. | **A.** Todo sale de datos ya públicos y verificados (`mission.md`, `src/config/site.ts`). B afirmaría una organización que hoy es una marca personal. Sin cargo, correo, dirección ni teléfono. |
| **P-48** | Imagen de Open Graph | **A.** Sin imagen: tarjeta solo de texto. **B.** Julio entrega una imagen aprobada (1200 × 630). **C.** Generarla con piezas del diseño. | **B si llega con el favicon; si no, A.** C crea un activo que el diseño no tiene: sería diseño nuevo y pediría aprobación visual. |
| **P-49** | Alcance de la revisión OWASP ASVS | **A.** ASVS 5.0: nivel 1 completo en los capítulos que aplican, y nivel 2 en frontend web, comunicaciones, configuración y arquitectura y dependencias. **B.** Solo nivel 1. **C.** Nivel 2 completo. | **A.** Sin autenticación, sesiones, archivos ni API, C sería casi todo «no aplica». `SECURITY.md` no fija nivel hoy: esta decisión lo fija (§4.5). |
| **P-50** | HSTS, DNSSEC y CAA | **A.** HSTS como está aprobado desde el primer día; DNSSEC 48–72 h después del lanzamiento; CAA más adelante. **B.** Todo antes de lanzar. **C.** Subir HSTS por etapas. | **A.** El hosting obliga a HTTPS de todos modos. DNSSEC mal publicado tumba el dominio entero: mejor en un paso propio, con el sitio ya estable. `preload` sigue sin activarse. |
| **P-51** | Puertas de publicación | **A.** Una comprobación automática hace fallar el build de producción si queda una puerta abierta; una excepción solo con decisión registrada. **B.** Solo una lista manual. | **A.** Incluye resolver la diferencia con P-09: Legal revisado es puerta; publicarla como «borrador» sería una excepción que solo Julio puede registrar. |
| **P-52** | Navegadores de la verificación (P-17) | **A.** Playwright con Firefox y WebKit para CSP, 404 y navegación, en local y en la CI; Safari real (macOS e iOS) con una lista manual de Julio. **B.** Solo en local. **C.** Solo Chromium. | **A.** WebKit de Playwright no es Safari: la lista manual cubre la diferencia. Añade dos proyectos a `playwright.config.ts` y un paso a la CI, sin dependencias nuevas. |
| **P-53** | Cómo llega el manifiesto de CSP al proxy en el hosting | **A.** Tras el build, añadir el manifiesto y `BUILD_ID` a la traza de archivos del proxy. **B.** Embeberlo en el proxy con un build en dos pasadas y `BUILD_ID` fijo por commit. **C.** No tocar nada y usar un servidor Node (P-38 C). | **Se decide en ▲C2, con la evidencia de T10.** Orden propuesto: A, y B solo si A no basta. La política de la CSP no cambia en ningún caso; toca `scripts/` (A) o además `next.config.ts` y `src/lib/security` (B), y obliga a repetir P1–P14 y las mutaciones. |

## 2. Hosting: comparación con pruebas

Fuentes, fechas y método: `evidencia-c0-hosting.md`. Precios en dólares, sin
impuestos, consultados el 2026-11-13.

### 2.1 Tabla

| | **A. Vercel Pro** | **B. Workers + OpenNext** | **C. Servidor Node + Cloudflare** | D. Vercel Hobby |
|---|---|---|---|---|
| **Costo mensual** | **US$20**, con US$20 de crédito de uso **[Doc]** | **US$0** (Free) o **US$5** (Paid) **[Doc]** | **[Pendiente de verificar]**: depende del proveedor; no se consultó ninguno | US$0 |
| **Límites que importan** | 1 TB y 10 M de peticiones incluidos; lo demás contra el crédito; límite de gasto configurable **[Doc]** | Free: 100 000 peticiones/día y 10 ms de CPU por petición. Paid: 10 M de peticiones y 30 M de ms **[Doc]** | Los del servidor contratado | 100 GB, 1 M de peticiones, registros de 1 h; sin uso extra **[Doc]** |
| **Uso comercial** | Permitido | Permitido | Permitido | **No permitido** **[Doc]** |
| **Next 16.4.5** | Adaptador verificado por Next **[Doc]** | No verificado; Cloudflare recomienda vinext, que no usa el build de Next **[Doc]** | Soporte completo (`next start`) **[Doc]** | Como A |
| **Proxy en Node.js** | Soportado; corre antes de la caché **[Doc]** | «Not yet supported» / «experimental… not officially maintained» **[Doc + Medido]** | ✔ **[Medido]** (e2e) | Como A |
| **Manifiesto de CSP en el proxy** | **[Pendiente de verificar]**; se espera que haga falta P-53 | ✘ **500 en todas las páginas** **[Medido]** | ✔ **[Medido]** | Como A |
| **HTML igual al del build** (hashes) | **[Pendiente de verificar]** | ✘ vuelve a renderizar: **10–13 scripts sin autorizar por página** **[Medido]** | ✔ **[Medido]** | Como A |
| **404 propio con nonce** | **[Pendiente de verificar]** | ✔ **[Medido]** | ✔ **[Medido]** | Como A |
| **Caché del HTML con su CSP** | El proxy pone la CSP antes de la caché **[Doc]**; se mide en T10 | No evaluable: el HTML no es el del build | Sin CDN por omisión. Con Cloudflare delante el proxy queda **detrás** de la caché: hay que purgar en cada despliegue y apagar lo que reescribe el HTML | Como A |
| **Preview por rama** | Sí, con autenticación **[Doc]** | **[Pendiente de verificar]** (no se consultó) | Hay que montarlo | Sí |
| **Operación** | Ninguna | Configuración del adaptador y de la caché | Actualizaciones, reinicios, certificados y purgas por cuenta propia | Ninguna |
| **Dependencia del proveedor** | Baja: sigue siendo un Next estándar; salir es cambiar de hosting | Alta: adaptador, `wrangler`, y cambios en el proxy | Ninguna | Baja |
| **Riesgo con nuestra CSP** | Medio, acotado: P-53 | **Alto**: dos fallos medidos y un runtime sin mantenimiento oficial | Bajo en la aplicación; medio en la caché si se usa el CDN | — |
| **Recomendación** | **Sí, condicionada a T10** | **No ahora** | **Respaldo** | **No** |

### 2.2 Por qué Vercel Pro, y qué cuesta

- Es el único camino donde lo que falta comprobar es acotado: **una cosa que
  arreglar** (que el manifiesto llegue al proxy) y **tres que medir** (HTML del
  build sin tocar, 404, encabezados). En Workers hay dos fallos ya medidos.
- Costo: **US$240 al año** frente a US$0–60. Es la diferencia que hay que
  aceptar a cambio de no tocar la pieza más delicada del sitio (el proxy y su
  CSP, ADR 006) para adaptarla a un runtime que su propio adaptador llama
  experimental.
- **[Pendiente de verificar al contratar]:** que un equipo de una sola persona
  pague US$20 en total, y el modelo de transferencia incluido (la página de
  precios dice 1 TB; la guía de uso, «Flat Rate CDN»).
- El proxy se ejecuta en cada petición de página (es quien pone la CSP). Con
  tráfico bajo cabe en el crédito **[Inferencia]**; se fija un **límite de
  gasto** desde el primer día.

### 2.3 Por qué no Cloudflare Workers ahora

No es por precio ni por la red de Cloudflare: es por este sitio.

1. El proxy tiene que ser Node.js (Next 16) y el adaptador no lo soporta
   oficialmente.
2. El manifiesto no llega al Worker: 500 en todas las páginas (medido).
3. Aun con el manifiesto, el Worker no sirve el HTML del build: la CSP de
   hashes deja de autorizar los scripts de la página (medido).
4. Arreglarlo es rehacer la decisión de la ADR 006 para otro runtime, o pasar a
   vinext, que no usa el build de Next: el generador del manifiesto valida las
   formas exactas de script de Next 16.4.5 y dejaría de valer.

Se puede reconsiderar cuando Cloudflare publique su adaptador verificado.
**Cloudflare sigue siendo el DNS y el registrador**, y es la opción para el
correo (P-42).

### 2.4 El manifiesto y el proxy (P-53)

Hecho medido: `.next/csp-manifest.json` se escribe después de `next build` y no
figura en la traza del proxy. Caminos, por orden de preferencia:

1. **Comprobar primero** en el preview si la plataforma ya lo incluye (T10).
2. **A:** el paso posterior al build añade el manifiesto y `BUILD_ID` a la
   lista de archivos de la traza del proxy. **[Inferencia]**: la plataforma lee
   esa traza al empaquetar la función. Toca solo `scripts/`.
3. **B:** embeberlo. En el laboratorio, dos builds con el mismo `BUILD_ID` dan
   manifiestos idénticos, así que un build en dos pasadas es viable; exige un
   `BUILD_ID` determinista (por commit) y tocar `next.config.ts` y
   `src/lib/security/csp-manifest.ts`.

En los tres casos: mismas directivas, el proxy sigue fallando cerrado si el
manifiesto no es el de su build, y se repiten P1–P14 y las mutaciones de la T18.

## 3. Dominio, DNS y correo

**Estado medido:** dominio registrado en Cloudflare el 2026-11-12, DNS en
Cloudflare, **sin registros**, sin DNSSEC. **Los registros los crea Julio**; el
agente no toca Cloudflare y verifica después con `dig` y `curl`.

| Tipo | Nombre | Valor | Proxy | Para qué | Cuándo |
|---|---|---|---|---|---|
| `A` | `@` | El que muestre el panel del proyecto en el hosting **[Pendiente de verificar]** | **DNS only** | Sitio (apex) | Lanzamiento técnico |
| `CNAME` | `www` | El CNAME propio del proyecto **[Pendiente de verificar]** | **DNS only** | `www` → 308 al apex (lo hace el hosting) | Lanzamiento técnico |
| `MX` ×3 | `@` | `route1`, `route2` y `route3.mx.cloudflare.net` | — | Recibir correo (P-42 A). Los añade y bloquea Cloudflare | Antes: G4 |
| `TXT` | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | — | SPF del reenvío. Lo añade Cloudflare | Antes: G4 |
| `TXT` | `cf2024-1._domainkey` | Clave DKIM que genera Cloudflare | — | DKIM del reenvío | Antes: G4 |
| `TXT` | `_dmarc` | `v=DMARC1; p=reject` **[Propuesta]** | — | Que nadie envíe como `@thisjulio.com` | Con el correo |
| `CNAME` | `preview` | El que indique el hosting | **DNS only** | Solo si P-41 = B | Preview |
| `DS` | — | Automático (registrador Cloudflare) | — | DNSSEC (P-50) | 48–72 h después |
| `CAA` | `@` | Las autoridades que use el hosting **[Pendiente de verificar]** | — | Opcional | Más adelante |

- **DNS only (nube gris), siempre.** Si el tráfico pasara por el proxy de
  Cloudflare, su ofuscación de correo —activada por omisión— reescribiría el
  HTML e inyectaría un script que nuestra CSP bloquea. Vercel, además,
  recomienda la conexión directa.
- **HTTPS:** certificado automático del hosting al resolver el dominio.
  **HSTS:** el encabezado ya aprobado, sin `preload`.
- **Correo (P-42 A).** Julio añade y verifica su bandeja como destino y crea
  **una regla para una dirección concreta**, sin regla comodín: lo que no
  coincide se rechaza. Email Routing solo recibe; el correo de envío es de la
  004 (ADR 005).

## 4. Cómo se construye

Nada de esto existe todavía. Estructura propuesta (se ajusta al implementar):

```
src/app/robots.ts  sitemap.ts            robots y sitemap (rutas estáticas, sin HTML)
src/app/icon.* apple-icon.*              los archivos que entregue Julio (G3)
public/.well-known/security.txt          contacto por URL, Expires ≤ 1 año
src/lib/seo/                             metadatos por ruta e idioma, alternates, JSON-LD (puro, con pruebas)
src/components/sections/contact/         ContactView (servidor) + isla MailLink
src/config/site.ts                       correo en dos partes (usuario, dominio); lo importa solo la isla
scripts/release-gates.mjs                puertas de publicación (P-51)
tests/e2e/  tests/unit/                  seo, contacto, puertas, presupuesto por ruta, enlaces
playwright.config.ts                     proyectos firefox y webkit (P-52)
```

### 4.1 Contacto y enlaces

- **Isla `MailLink`.** Importa las dos partes del correo desde la
  configuración y arma `href` y texto en un efecto. No recibe el correo por
  *props*: lo que un componente de servidor pasa a una isla viaja en la carga
  RSC del HTML. Sin JavaScript, un `<noscript>` muestra la dirección escrita en
  palabras, desde los mensajes, sin la dirección literal.
- **Prueba de fuga:** tras el build se busca la dirección completa en todos los
  `.html` y `.rsc` de `.next/server/app/` y en `src/messages`: 0 apariciones.
- **P-44 = A:** los 9 enlaces de `spec.md` §1.6. Los CTA apuntan a `/contact`;
  se omiten el enlace «Estimador» del Footer y la fila «Obtén un estimado
  rápido» de Inicio; `/estimate` sale de `routing.ts` y de `src/app`. La 004
  lo revierte.

### 4.2 SEO

- Una función pura por ruta devuelve título, descripción, canonical y
  alternates a partir de la clave de ruta, el idioma y los slugs del contenido;
  la usan `generateMetadata` y `sitemap.ts`. Se prueba con Vitest: recíprocos,
  `x-default`, slugs por idioma y la excepción del servicio 01.
- La indexación depende del origen del build (`spec.md` §3.4): solo el build de
  producción quita `noindex`.
- `robots.ts` y `sitemap.ts` salen prerenderizados y sin HTML: el generador del
  manifiesto ya los ignora (`readRouteFile(route, '.body')`). El proxy trata
  `/robots.txt` y `/sitemap.xml` como rutas con extensión: no pasan por el
  enrutamiento de idioma. Se comprueba en T5.
- JSON-LD como `<script type="application/ld+json">` en el layout. El escáner
  ya lo admite; la CSP no gobierna bloques de datos. Se verifica en los tres
  motores que no genera violaciones (CA-11).

### 4.3 Rendimiento

Se amplía `scene-budget.spec.ts` (o un archivo hermano) a **todas** las rutas:
bytes de JavaScript y de HTML del build, y LCP, CLS y tiempo de bloqueo con
`PerformanceObserver` en móvil emulado. Sin dependencias nuevas. Contra el
preview se repite una muestra para ver el efecto del CDN.

### 4.4 Accesibilidad: lo que axe no ve

| Criterio WCAG 2.2 | Qué se revisa a mano |
|---|---|
| 2.1.1, 2.1.2, 2.4.3 | Recorrido completo con teclado, sin trampas, orden lógico (menú móvil, selector de capas, pestañas, etiquetas de la escena) |
| 2.4.7, 2.4.11 | Foco visible y **no tapado** por la navegación fija |
| 2.5.8 | Tamaño de objetivo ≥ 24 px (selector ES \| EN, chips, enlaces del pie) |
| 1.4.10, 1.4.4, 1.4.12 | Reflujo a 320 px, zoom al 200 %, espaciado de texto aumentado |
| 1.4.3, 1.4.11 | Contraste de texto y de componentes en los estados que axe no alcanza (hover, foco, seleccionado) |
| 2.3.3, 2.2.2 | `prefers-reduced-motion` en la escena y en las animaciones |
| 3.1.1, 3.1.2 | Idioma de la página y de las partes (la palabra «This», el 404 bilingüe) |
| 1.3.1, 2.4.6, 4.1.2 | Encabezados, regiones y nombres con VoiceOver en macOS e iOS |
| 3.2.3, 3.2.6 | Navegación y ayuda (Contacto) en el mismo lugar en todas las páginas |

Resultado en `auditoria-accesibilidad.md`. Límite que se declara: no hay
lector de pantalla de Windows disponible.

### 4.5 Seguridad

- **ASVS (P-49 = A).** Versión 5.0 (17 capítulos, tres niveles) **[Doc]**.
  Aplican: codificación y saneamiento, validación, frontend web, comunicaciones,
  configuración, protección de datos, arquitectura y dependencias, y registro y
  errores. No aplican en el lanzamiento, con motivo escrito: autenticación,
  sesiones, autorización, tokens, OAuth, archivos, API y WebRTC. **[Pendiente de
  verificar]**: los identificadores exactos de capítulos y requisitos se toman
  del documento oficial al ejecutar T14, no de memoria.
- **Encabezados reales** por tipo de respuesta (página, 404, redirección,
  estático, `robots.txt`), comparados con `SECURITY.md` §3.
- **Cuentas (las revisa Julio):** segundo factor en GitHub, Cloudflare y el
  hosting; el hosting con acceso solo a este repositorio.
- **Privacidad:** el proveedor de hosting guarda registros técnicos y el
  reenvío de correo pasa por Cloudflare. Es insumo para G2, no texto que
  redacte el agente.

### 4.6 Puertas (P-51 = A)

`scripts/release-gates.mjs` corre solo cuando el origen del build es el de
producción y falla si: hay un bloque publicado con `copy: 'draft'` (G1), Legal
conserva el rótulo de borrador (G2), falta el icono o su huella no coincide
(G3), o el correo no está configurado (G4). Cada regla tiene su prueba y su
mutación. Una excepción se escribe en un archivo versionado con la referencia a
la decisión de Julio; sin ella no hay excepción.

## 5. Despliegue y reversión

### 5.1 Fases

| Fase | Qué pasa | Quién |
|---|---|---|
| **F0** | Aprobación de esta planificación y respuestas a P-38 … P-52 (▲C0) | Julio |
| **F1** | Código que no depende del hosting: contacto, enlaces, SEO, P-24, presupuesto, puertas, Firefox y WebKit en local (▲C1) | Agente; Julio revisa |
| **F2** | Julio contrata el hosting, conecta el repositorio y crea el entorno de preview con su `SITE_ORIGIN`. Prueba del hosting (CA-12), P-53 si hace falta, e2e completas y Safari real contra el preview (▲C2) | Julio (cuentas); agente (pruebas) |
| **F3** | Auditorías: accesibilidad, rendimiento en el CDN y ASVS. Julio cierra las puertas G1–G4 (▲C3) | Agente; Julio y el abogado (puertas) |
| **F4** | Auditoría de seguridad final. **Lanzamiento técnico:** merge aprobado a `main`, build de producción, Julio crea los registros DNS, humo y e2e de solo lectura contra `https://thisjulio.com` | Agente (auditoría y pruebas); Julio (merge y DNS) |
| **F5** | **Lanzamiento público** (▲C4): Julio da por publicado el sitio. Observación de 72 h; DNSSEC (P-50); cierre | Julio; agente verifica |

**Lanzamiento en dos tiempos.** El dominio no resuelve hoy y nadie lo conoce:
entre crear los registros y anunciarlo hay una ventana para probar en el origen
real. Como un build de producción solo funciona bajo `https://thisjulio.com`
(su CSP lleva ese origen), esa es la primera vez que se ve entero.

### 5.2 Reversión

| Situación | Acción | Quién | Efecto |
|---|---|---|---|
| El primer despliegue de producción falla el humo | **Borrar los registros `A` y `www`** | Julio | El dominio vuelve al estado de hoy. TTL de Cloudflare: minutos. El correo no se ve afectado |
| Un despliegue posterior rompe algo | Volver al despliegue de producción anterior desde el hosting **[Pendiente de verificar en T10]** | Julio | Mismo origen, CSP válida |
| El fallo está en el código | `git revert` en `main` y nuevo despliegue | Agente propone; Julio aprueba | Minutos de build |
| Una puerta se reabre | Volver al despliegue anterior, o retirar los registros si no lo hay | Julio | Nada sin aprobar queda publicado |

Lo que **no** se puede deshacer: un navegador que ya recibió HSTS no volverá a
aceptar HTTP en dos años (se asume: el sitio nunca se sirve por HTTP), y lo que
un buscador ya haya indexado tarda en desaparecer.

La reversión se **ensaya en el preview** antes de F4 (T10, CA-17).

## 6. Verificación

| Qué | Cómo |
|---|---|
| Regresión | `verify` y la suite e2e actual (981) sin cambios de comportamiento fuera de lo aprobado |
| Contacto y fuga del correo | Playwright con y sin JavaScript; búsqueda en el build |
| SEO | Vitest sobre la función pura; Playwright sobre el HTML; dos builds (producción y prueba) para `robots` e indexación |
| Presupuesto | Build + Playwright en todas las rutas; muestra contra el preview |
| CSP en tres motores | Proyectos `firefox` y `webkit` solo para `csp`, `not-found` y navegación |
| CSP detrás del CDN | Guion de CA-12 contra el preview, con salida guardada en `evidencia-c2-hosting.md` |
| Safari real | Lista manual de Julio (macOS e iOS): consola sin violaciones, menú, selector de capas, escena, 404, cambio de idioma |
| Accesibilidad | axe ampliado + §4.4 |
| Seguridad | T14 (ASVS) y T16 (auditoría final, Fable 5.2 · alto) |
| Producción | Humo y e2e de solo lectura contra `https://thisjulio.com` |

## 7. Riesgos

| Riesgo | Efecto | Mitigación |
|---|---|---|
| El manifiesto no llega al proxy en el hosting | 500 en todas las páginas | T10 lo mide en preview; P-53; el proxy falla cerrado, nunca con una CSP más laxa |
| El CDN modifica o regenera el HTML | La CSP de hashes bloquea los scripts | CA-12 (a) compara hashes y HTML real; si falla, P-38 C |
| Un build de preview acaba en producción, o al revés | CSP con el origen equivocado: página sin JavaScript | El origen va en el build; humo en producción; las puertas solo corren con el origen de producción |
| Publicar con una puerta abierta | Textos sin aprobar o Legal sin revisar en línea | P-51: el build de producción falla |
| Las puertas tardan (abogado, textos) | El lanzamiento se retrasa | F1–F3 no dependen de ellas; se piden desde ▲C0 |
| El correo publicado recibe spam | Ruido en la bandeja de Julio | Alias rotable (P-42), isla (P-43), sin regla comodín |
| Firefox o Safari tratan la CSP distinto | Página que no hidrata en ese navegador | P-52 antes del preview; si falla, se detiene y se documenta, sin relajar nada |
| Next publica un aviso de seguridad | Hay que actualizar | `SUPPORTED_NEXT_VERSION` obliga a repetir P1–P14 antes |
| `globalNotFound` cambia en la plataforma | 404 distinto del probado | `not-found.spec.ts` contra el preview |
| Costo inesperado en el hosting | Factura mayor | Límite de gasto desde el primer día; funciones de pago apagadas |
| DNSSEC mal publicado | El dominio deja de resolver | Paso propio tras el lanzamiento, con el registrador de Cloudflare (DS automático) y verificación |
| Quitar `/estimador` rompe una prueba o un enlace | 404 internos | CA-4: rastreo de enlaces en todas las rutas |
| Sin datos de campo | No se sabe cómo carga a los visitantes | Se declara; medición manual desde Guatemala; la analítica es una decisión aparte |

## 8. Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| Relajar la CSP para encajar en un hosting | ADR 006 |
| Poner Cloudflare (proxy) delante de Vercel | Vercel lo desaconseja; Cloudflare reescribe el HTML por omisión; dos cachés que purgar |
| `output: 'export'` (sitio estático puro) | Sin proxy no hay CSP por ruta, ni 404 con nonce, ni redirección de idioma |
| Promover el preview a producción | Un build vale para un solo origen |
| Desplegar desde GitHub Actions | Mete un secreto en la CI y cambia una decisión de la 001 (queda como opción B de P-40) |
| Una página «Estimador, próximamente» | Texto nuevo y página vacía: «lo pendiente se omite» |
| Lighthouse como dependencia | Playwright ya mide LCP y CLS; no se añade nada a `package.json` |
| Herramienta externa de escaneo de secretos | Una búsqueda en el historial basta para un repositorio sin secretos; se revisa si aparece el primero |

## 9. Dependencias

Ninguna nueva en `package.json`. Solo se instalan los navegadores Firefox y
WebKit de Playwright, que ya es dependencia (`npx playwright install`).

## 10. Modelo y esfuerzo recomendados

Ver `tasks.md`. **Fable 5.2, esfuerzo alto**, para la auditoría de seguridad
final previa a producción y para cualquier cambio de P-53. **Opus, esfuerzo
alto**, para SEO internacional, la CSP en tres motores, la prueba del hosting y
las auditorías. **Sonnet, esfuerzo medio**, para preflight, puertas, enlaces,
mediciones y documentación.
