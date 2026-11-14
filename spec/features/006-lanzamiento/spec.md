# 006 — Lanzamiento mínimo: seguridad, SEO, accesibilidad y despliegue

**Estado:** **aprobada por Julio en ▲C0 (2026-11-13), con las opciones
recomendadas en P-38 a P-52** (§10). P-53 sigue abierta y se decide en ▲C2.
Nada se contrató, conectó ni desplegó.
**R1 (T1–T8) ejecutada y aprobada en ▲C1 (2026-11-13)**, con P-54 = A y P-55 = A.
La R2 espera a Julio en la T9 (`guia-t9-hosting.md`).
**Redactada:** 2026-11-13, sobre `4561400` (cierre de la Feature 003 y registro
de su CI; el encargo citaba `610595a`, el commit anterior).
**Origen:** decisión de Julio del 2026-11-13 (camino B, «lanzamiento mínimo»:
`spec/constitution/roadmap.md` §2.1), `ARCHITECTURE.md` §7, `SECURITY.md` §3 y §7,
`TEST-PLAN.md` §1, ADR 004, 005 y 006, y los cierres de la 001, la 002 y la 003.
**Alcance según el roadmap:** hosting, dominio y DNS; contacto provisional por
`mailto:`; SEO internacional; rendimiento; seguridad final; accesibilidad;
puertas de publicación; despliegue con preview y reversión.

---

## 0. Cómo leer esta spec

| Etiqueta | Significa |
|---|---|
| **[Comprobado]** | Tiene evidencia en el repositorio o se midió en esta planificación (`evidencia-c0-hosting.md`). |
| **[Doc]** | Lo dice la documentación oficial citada en `evidencia-c0-hosting.md` §3, consultada el 2026-11-13. |
| **[Pendiente de Julio]** | Depende de un dato, permiso, archivo o decisión de Julio. |
| **[Propuesta]** | Decisión técnica o editorial nueva. Requiere aprobación expresa. |
| **[Inferencia]** | Razonado sin medir; se mide en la tarea indicada antes de darlo por bueno. |
| **[Pendiente de verificar]** | No se pudo comprobar; no se presenta como cierto. |

## 1. Hallazgos (hechos, no suposiciones)

1. **El build funciona sin cambios solo en un servidor Node.** El proxy corre
   en Node.js (Next 16 no admite otro runtime) y lee `.next/csp-manifest.json`
   del disco; ese archivo **no está en la traza de archivos del proxy** (0 de
   95). Una plataforma que empaquete el proxy como función necesita que el
   manifiesto le llegue por otro camino. **[Comprobado]** (evidencia §1)
2. **Cloudflare Workers + OpenNext no sirve este sitio hoy.** Construye, pero
   toda página responde 500; con el manifiesto embebido en un laboratorio, el
   Worker vuelve a renderizar las páginas y deja 10 a 13 scripts por página
   fuera de la CSP de hashes. El adaptador declara el proxy en Node.js
   «experimental» y Cloudflare recomienda otra herramienta (vinext), que no usa
   el build de Next. **[Comprobado]** y **[Doc]** (evidencia §2 y §3.3)
3. **Vercel:** adaptador verificado por Next, proxy antes de la caché. Su plan
   gratuito es solo para uso no comercial, y este sitio anuncia servicios: hace
   falta Pro, US$20/mes. **[Doc]** Lo demás no se pudo medir sin cuenta.
   **[Pendiente de verificar]** (evidencia §3.2)
4. **Un build vale para un solo origen** (`SITE_ORIGIN` va dentro de la CSP).
   El preview y la producción se construyen por separado; no se puede «promover»
   un preview a producción. **[Comprobado]**
5. **El dominio está vacío:** registrador y DNS en Cloudflare, sin ningún
   registro, sin correo y sin DNSSEC. **[Comprobado]** (evidencia §4)
6. **Nueve enlaces llevan al estimador**, que es un esqueleto con solo un
   título: Nav (`Nav.tsx:28`), menú móvil (`MobileMenu.tsx:69`), Footer
   (`Footer.tsx:33`), Inicio (`HomeView.tsx:59` y `:145`), Arquitectura
   (`ArchitectureView.tsx:65`), Acerca de (`AboutView.tsx:81`), Servicios
   (`ServicesView.tsx:62` y `:128`) y el caso (`CaseView.tsx:77`). Contacto
   (`/contacto`) también es un esqueleto. **[Comprobado]**
7. **Todo el sitio lleva `noindex`** desde el layout (`[locale]/layout.tsx:30`);
   no hay `robots.ts`, `sitemap.ts`, `metadataBase`, canonical, `hreflang`,
   descripciones, Open Graph ni JSON-LD. `routing.ts` tiene
   `alternateLinks: false` a propósito. No existe `public/`. **[Comprobado]**
8. **El escáner de CSP ya admite JSON-LD** (`scripts/lib/csp-scan.mjs`: un
   bloque `application/ld+json` válido no cuenta como script). No hace falta
   tocarlo para los datos estructurados. **[Comprobado]**
9. **Tamaños de hoy.** JavaScript por ruta sin escena: 157 684 B gzip; Inicio,
   +11 516 B (el motor). HTML por ruta: 25,8 a 65,5 KB (7,3 a 12,1 KB gzip;
   mediana 9,6). LCP de laboratorio de Inicio: 648 ms. **[Comprobado]**
   (`TEST-PLAN.md` §8; HTML medido hoy sobre el build)
10. **`SECURITY.md` cita OWASP ASVS «como guía de verificación» pero no fija
    nivel ni capítulos.** El encargo habla de «la parte de L2 elegida en
    SECURITY.md»: esa elección no existe todavía. Se propone en P-49.
    **[Comprobado]**
11. **P-09 y el encargo no dicen lo mismo sobre Legal.** P-09 permitía publicar
    `/legal` marcada «Borrador pendiente de revisión legal»; el encargo del
    2026-11-13 pone «legal revisado» como puerta de publicación. Prevalece lo
    más reciente (CLAUDE.md §2) y se registra en P-51. **[Comprobado]**
12. **Faltan `DESIGN.md` y `TECH-STACK.md`** (P-01), como en las tres features
    anteriores. Si llegan y contradicen algo, se revisa esta spec.

## 2. Alcance

### 2.1 Dentro

| Pieza | Qué entrega la 006 |
|---|---|
| Hosting | Comparación con pruebas y recomendación (`plan.md` §2); prueba en preview del hosting elegido; lo necesario para que el manifiesto de CSP llegue al proxy (P-53) |
| Dominio y DNS | Lista exacta de registros, HTTPS, HSTS, DNSSEC; **los crea Julio**, con guía y verificación posterior |
| Contacto provisional | Página Contacto con un enlace `mailto:` que no deja el correo en el HTML y no usa JavaScript en línea; destino provisional de los enlaces al estimador |
| SEO | Metadatos ES/EN, canonical, `hreflang`, sitemap sin el blog, robots, JSON-LD solo con datos reales, Open Graph |
| Rendimiento | P-24 y P-34, presupuesto por ruta, LCP y CLS medidos en todas las rutas |
| Seguridad | Encabezados finales; CSP verificada en Firefox, Safari y detrás del CDN (P-17); revisión OWASP ASVS; secretos y dependencias; `security.txt`; auditoría final previa a producción |
| Accesibilidad | Auditoría WCAG 2.2 AA de todas las rutas publicadas y del 404 |
| Puertas de publicación | Cuatro puertas que solo cierra Julio, con una comprobación automática que impide publicar con alguna abierta |
| Despliegue | Entorno de preview, paso a producción en dos tiempos, plan de reversión ensayado, observación posterior |

### 2.2 Fuera (y dónde va)

| Queda fuera | Va en |
|---|---|
| Formularios, estimador, correo de envío, antiabuso | 004 (después del lanzamiento) |
| Blog | 005; sigue `noindex`, fuera de la navegación y del sitemap |
| Analítica, cookies, píxeles, mapas, fuentes de terceros | No forman parte de la v1 |
| Medición en GPU real | P-12, independiente; no bloquea |
| Search Console, Bing Webmaster y similares | No se da de alta ningún servicio; si Julio los quiere, se decide aparte |
| Redactar o aprobar textos, revisar Legal, crear el favicon | Julio (puertas, §9) |
| Crear cuentas, contratar, tocar DNS o Cloudflare, desplegar | Julio; el agente verifica después |
| Rediseño | Nunca; un problema visual se documenta y se pide aprobación |

## 3. Especificación

### 3.1 Hosting, dominio y DNS

- **Hosting:** el que Julio elija en P-38. Recomendado: **Vercel Pro**, sujeto a
  la prueba en preview (CA-12). Comparación y motivos: `plan.md` §2.
- **Un build por origen.** Preview con el origen que fije P-41; producción con
  `SITE_ORIGIN=https://thisjulio.com` (P-39). Sin «promoción» de preview.
- **Sin funciones de visitantes del proveedor:** analítica, medición de
  velocidad y barras de comentarios quedan apagadas (CA-19).
- **DNS (los crea Julio):** registros de `plan.md` §3, en **DNS only**. Con el
  dominio vacío no hay nada que migrar.
- **HTTPS:** certificado automático del hosting. **HSTS:** el valor ya aprobado
  (`max-age=63072000; includeSubDomains`, sin `preload`). **DNSSEC:** P-50.
- **Correo:** la dirección y su recepción se deciden en P-42 (recomendado:
  Email Routing de Cloudflare hacia la bandeja de Julio).

### 3.2 Contacto provisional (`contact`)

| Requisito | Detalle |
|---|---|
| Composición | Con piezas que ya existen del diseño (`page-head`, `.lead`, `PathLink` o `.row`, `ArrowLink`): título, una línea de apoyo, el enlace de correo y GitHub (dato real de `src/config/site.ts`). Sin formulario, sin promesas de tiempo de respuesta, sin canales no confirmados (P-11). **[Propuesta]** P-43 |
| Enlace | `mailto:` operable con teclado y con nombre accesible. **[Propuesta]** P-43: lo arma una isla de cliente al hidratar; sin JavaScript se muestra la dirección escrita en palabras |
| Dónde **no** puede estar el correo | En el HTML del servidor, en la carga RSC, en `src/messages` (viajan en el HTML de todas las rutas, P-24), en JSON-LD, en `security.txt` |
| CSP | Ningún script ni estilo en línea propio; la isla llega como *chunk* de `/_next/static/chunks/`. El generador del manifiesto no cambia |
| Textos | Nuevos, en `es` y `en`, `copy: 'draft'` hasta que Julio los apruebe (puerta G1) |
| Carácter | Provisional: la 004 lo sustituye. Se anota en `REFERENCIA-DISENO.md` §5 |

### 3.3 Enlaces al estimador

**P-44 = A (▲C0).** Mientras no exista la 004, el CTA «Iniciar un
proyecto» lleva a Contacto; las entradas que nombran el estimador se omiten
(Footer y «Obtén un estimado rápido» de Inicio); `/es/estimador` y `/en/estimate`
dejan de ser rutas (404 propio) y vuelven con la 004. Quedan **32 rutas
estáticas**. El texto del CTA no cambia. Al implementarlo apareció un botón que
la planificación no listó, «Estimar esto» en cada servicio: decisión P-54.

### 3.4 SEO internacional

| Pieza | Especificación |
|---|---|
| `metadataBase` | `SITE_ORIGIN` |
| Título y descripción | Únicos por ruta e idioma. Las descripciones son textos nuevos: `draft` hasta aprobarse (G1) |
| Canonical | Absoluto y autorreferenciado. Excepción **[Propuesta]**: `/servicios/<slug del servicio 01>` muestra lo mismo que `/servicios` (002, limitación 6); su canonical apunta a `/servicios` y no entra en el sitemap |
| `hreflang` | `es`, `en` y `x-default` → la versión en español, recíprocos, con el slug de cada idioma (resolvedor de `src/i18n/alternate.ts` y slugs del contenido) |
| Indexación | `index, follow` **solo** en un build cuyo origen sea el de producción; cualquier otro build sigue `noindex` |
| `robots.txt` | Producción: permite todo y enlaza el sitemap. Otros orígenes: `Disallow: /`. El blog **no** se bloquea aquí: así los buscadores leen su `noindex` |
| `sitemap.xml` | Exactamente las rutas indexables, con sus alternates por idioma. Sin blog, sin 404, sin rutas retiradas. Sin `lastmod` mientras no haya una fecha real por página **[Propuesta]** |
| JSON-LD | Solo con datos reales y aprobados (P-47). Serializado con `<` escapado. Sin correo, dirección, teléfono, horarios ni valoraciones |
| Open Graph | `og:title`, `og:description`, `og:url`, `og:site_name`, `og:type`, `og:locale` y su alterno, por idioma. Imagen según P-48 |
| Iconos | Los que entregue Julio (P-15, puerta G3). No se crea ninguno |

### 3.5 Rendimiento

- **P-24:** el proveedor de mensajes del cliente recibe solo los espacios que
  usan las islas (P-45). Se mide el HTML antes y después.
- **P-34:** sigue aceptado; se vuelve a medir contra su límite (1,5 KB gzip).
- **Presupuesto por ruta** (P-46) **[Propuesta]**, valores de laboratorio:

  | Métrica | Límite propuesto | Hoy |
  |---|---|---|
  | JavaScript, ruta sin escena | ≤ 165 KB gzip | 157,7 KB |
  | JavaScript, Inicio | ≤ 177 KB gzip | 169,2 KB |
  | HTML por ruta | ≤ 13 KB gzip | 7,3 a 12,1 KB |
  | LCP (móvil emulado: 4× CPU, 4G rápida) | ≤ 2,5 s en todas las rutas | 648 ms en Inicio |
  | CLS | ≤ 0,05 en todas las rutas | sin medir |
  | Tiempo de bloqueo (rutas sin escena) | ≤ 200 ms | sin medir |

- Se mide además contra el preview (CDN real) y, a mano, desde la red y el
  teléfono de Julio. Sin analítica no hay datos de campo: se dice, no se suple.

### 3.6 Seguridad

- **Encabezados finales:** los de `SECURITY.md` §3, sin cambios de política. Se
  comprueba lo que añade o duplica la plataforma.
- **P-17:** Chromium, Firefox y WebKit con Playwright; Safari real en macOS e
  iOS a mano (P-52); y detrás del CDN (CA-12).
- **Revisión OWASP ASVS** con el alcance de P-49; informe requisito por
  requisito.
- **Secretos:** el lanzamiento no necesita ninguno. En el hosting solo existen
  `SITE_ORIGIN` y `NEXT_TELEMETRY_DISABLED`.
- **Dependencias:** `npm audit`, avisos publicados de Next 16.4.5 y React
  19.3.1. Si un aviso obliga a actualizar Next, se repiten P1–P14 (ADR 006).
- **`/.well-known/security.txt`** (`SECURITY.md` §7), con contacto por URL.
- **Auditoría de seguridad final** antes de producción: tarea propia, con
  **Fable 5.2, esfuerzo alto** (`tasks.md`, T16).

### 3.7 Accesibilidad

Auditoría WCAG 2.2 AA de todas las rutas publicadas y del 404, a 1440 y 390:
axe con las reglas A y AA de WCAG 2.0, 2.1 y 2.2 **sin violaciones** (hoy se
exige solo que no haya «serias») y una revisión manual de lo que axe no ve
(`plan.md` §4.4). Un arreglo que cambie el aspecto se documenta y se aprueba
antes: no se rediseña.

### 3.8 Despliegue y reversión

Preview antes de producción; producción en dos tiempos (técnico y público);
reversión ensayada en preview. Detalle: `plan.md` §5.

## 4. Requisitos transversales

**R1. Bilingüe.** Todo texto nuevo existe en `es` y `en`; nada en duro.
**R2. Seguridad.** La política de la CSP no cambia. Si hace falta tocar
`scripts/`, el proxy o `src/lib/security` para que el manifiesto llegue al
proxy, solo con P-53 aprobada y repitiendo P1–P14 y las mutaciones.
**R3. Privacidad.** Sin analítica, cookies ni terceros; el correo de contacto
no queda expuesto en el HTML.
**R4. Honestidad.** No se publica un dato que no sea real y aprobado. Las
puertas no se cierran solas.
**R5. Fidelidad.** Paleta, tipografía, espaciado, composición, animaciones y
escena 3D se conservan.
**R6. Evidencia.** Ningún criterio se marca sin el comando y su resultado.

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
|---|---|---|
| CA-1 | `SITE_ORIGIN=http://localhost:3100 npm run verify` sale con 0. | Comando |
| CA-2 | Todas las rutas publicadas responden 200 en ES y EN, con un `<h1>` y `lang`, y siguen estáticas en el manifiesto (**32**, con P-44 = A; hoy son 34). Las retiradas responden con el 404 propio. | Playwright + `csp.spec.ts` P1 |
| CA-3 | Contacto: enlace `mailto:` con nombre accesible y operable con teclado; sin JavaScript, la dirección se lee. El correo **no aparece** en el HTML de ninguna ruta, ni en la carga RSC, ni en `src/messages`, ni en JSON-LD. | Playwright; búsqueda en `.next/server/app/` y en los mensajes |
| CA-4 | Ningún enlace interno lleva a una página vacía ni al estimador mientras no exista. | Playwright (rastreo de enlaces en todas las rutas) |
| CA-5 | Cada ruta indexable tiene título y descripción propios, canonical absoluto y `hreflang` `es`/`en`/`x-default` recíprocos con el slug correcto. | Vitest (generación) + Playwright (HTML real) |
| CA-6 | `sitemap.xml` lista exactamente las rutas indexables con sus alternates; no contiene blog, 404 ni rutas `noindex`. `robots.txt` lo enlaza en producción y bloquea todo en cualquier otro origen. | Vitest + Playwright con dos builds (origen de producción y de prueba) |
| CA-7 | JSON-LD válido y solo con campos que tienen fuente; tabla «campo → fuente» en `tasks.md`. | Vitest + revisión |
| CA-8 | Open Graph completo por idioma en cada ruta indexable. | Playwright |
| CA-9 | Presupuesto de P-46 cumplido en todas las rutas; P-24 medido antes y después; P-34 ≤ 1,5 KB gzip. | Build + Playwright (LCP, CLS, bloqueo) |
| CA-10 | Encabezados de la respuesta real (preview y producción) iguales a la tabla esperada; sin duplicados en conflicto; sin `Set-Cookie`. | `curl -sI` por tipo de respuesta, guardado como evidencia |
| CA-11 | P-17, navegadores: `csp.spec.ts` P1–P14, `not-found.spec.ts` y navegación en Chromium, Firefox y WebKit con 0 violaciones; lista manual en Safari de macOS e iOS completada por Julio. | Playwright (3 motores) + lista firmada |
| CA-12 | P-17, CDN, medido en el preview del hosting elegido: (a) el HTML estático llega con una CSP cuyos hashes autorizan **exactamente** sus scripts, también cuando la respuesta sale de la caché; (b) las respuestas con nonce no se cachean y cada una trae un nonce distinto; (c) ninguna ruta responde 500 por el manifiesto; (d) HTML y carga RSC no se mezclan en la caché; (e) tras un despliegue nuevo, HTML y CSP cambian juntos; (f) un `Host` o `X-Forwarded-Host` falso no cambia la CSP. | Guion de comprobación contra el preview; evidencia guardada |
| CA-13 | Revisión ASVS con el alcance de P-49: cada requisito, «cumple», «no aplica» (con motivo) o «hallazgo». Sin hallazgos altos abiertos. | `auditoria-seguridad.md` |
| CA-14 | Sin secretos en el repositorio ni en su historial; en el hosting solo las dos variables de §3.6; `npm audit --omit=dev` sin vulnerabilidades; avisos de Next y React revisados. | Búsqueda en `git log -p`, captura del panel (Julio), audit |
| CA-15 | Accesibilidad: axe (WCAG 2.0, 2.1 y 2.2, A y AA) sin violaciones en todas las rutas y el 404, a 1440 y 390; revisión manual de `plan.md` §4.4 completada. | Playwright + `auditoria-accesibilidad.md` |
| CA-16 | Puertas: el build de producción **falla** con cualquiera de las cuatro abierta (probado con mutaciones); al lanzar, las cuatro cerradas por Julio, con fecha. | Vitest + mutaciones; registro en `PENDIENTES.md` |
| CA-17 | Despliegue: preview aprobado por Julio; producción construida con `SITE_ORIGIN=https://thisjulio.com`; pruebas de humo y e2e de solo lectura contra producción en verde; reversión ensayada en preview. | Registro en `tasks.md` |
| CA-18 | Auditoría de seguridad final (Fable 5.2, esfuerzo alto) sin hallazgos altos ni críticos abiertos, aprobada por Julio. | `auditoria-seguridad.md`, sección final |
| CA-19 | Sin analítica, cookies ni terceros: 0 `Set-Cookie` y 0 peticiones a otros orígenes en todas las rutas, en preview y en producción; funciones de visitantes del proveedor apagadas. | Playwright (red) + captura del panel (Julio) |
| CA-20 | CSP: mismas directivas que al cierre de la 003. `git diff 4561400 -- scripts src/proxy.ts src/lib/security` vacío, o con solo lo aprobado en P-53. | `git diff`, `csp.spec.ts`, mutaciones |
| CA-21 | Documentación: `TEST-PLAN.md` §8, `ARCHITECTURE.md` §2 y §7, `SECURITY.md` §3 y §7, ADR 004, `REFERENCIA-DISENO.md` §5, `PENDIENTES.md`, `tasks.md` con evidencia. | Revisión |

## 6. Qué NO cambia

El diseño aprobado; las directivas de la CSP y la regla «origen desde
`SITE_ORIGIN`»; el contenido aprobado o en borrador de la 002 y la 003, salvo
los enlaces de P-44; la decisión de no usar analítica ni cookies; el blog
oculto; la CI de GitHub solo de verificación (salvo lo que P-40 y P-52 decidan);
ningún dato del caso POS.

## 7. Riesgos

Ver `plan.md` §7.

## 9. Puertas de publicación

**Ninguna se resuelve sola.** El agente prepara el material y comprueba el
resultado; cerrar cada puerta es un acto de Julio, con fecha, en
`docs/PENDIENTES.md`.

| Puerta | Qué exige | Quién la cierra | Pendiente | Cómo se comprueba |
|---|---|---|---|---|
| **G1** Textos aprobados | Los 101 bloques en `draft` de la 002 y la 003, más los textos nuevos de la 006 (Contacto, descripciones y Open Graph), aprobados en `es` y `en` | **Julio** | P-04, P-22 | Ningún bloque publicado con `copy: 'draft'` |
| **G2** Legal revisado | Revisión jurídica de Legal y Privacidad; el texto refleja el hosting y el reenvío de correo elegidos | **Un abogado**, y Julio acepta el texto | P-09 | Sin el rótulo «Borrador pendiente de revisión legal»; fecha y autor de la revisión registrados |
| **G3** Favicon e iconos | El archivo aprobado de la marca | **Julio** (lo entrega) | P-15 | El archivo existe y su huella coincide con la registrada |
| **G4** Correo de contacto real | Una dirección `@thisjulio.com` que recibe correo de verdad | **Julio** (elige la dirección, crea el reenvío en Cloudflare y confirma la recepción) | P-11, P-42 | Dirección configurada; prueba de entrega confirmada por Julio |

Además, solo Julio puede: contratar el hosting (P-38), crear los registros DNS,
decidir la visibilidad del repositorio (P-13) y aprobar el paso a producción.

## 10. Decisiones que se piden a Julio

Registradas en `docs/PENDIENTES.md` (P-38 a P-53). Opciones y recomendación:
`plan.md` §1.

**Respuestas de ▲C0 (2026-11-13): Julio aprobó la spec y el plan con las
opciones recomendadas.**

| ID | Decisión de Julio | Efecto en esta spec |
|---|---|---|
| P-38 | **A**, condicionada a T10 | Hosting: Vercel Pro (§3.1). Si la prueba en preview fallara sin arreglo que respete la CSP, servidor Node. Lo contrata Julio (T9) |
| P-39 | **A** | Origen de producción `https://thisjulio.com`; `www` redirige (§3.1, §3.4) |
| P-40 | **A** | Integración Git del hosting desde `main`, que se crea al lanzar; la CI sigue solo verificando |
| P-41 | **A** | Preview en el dominio del hosting, con su autenticación y su propio `SITE_ORIGIN` |
| P-42 | **A** | Email Routing hacia la bandeja de Julio y `_dmarc` en `p=reject`. La dirección sigue pendiente de Julio (G4) |
| P-43 | **A** | Isla que arma el `mailto:`; el correo fuera del HTML (§3.2, CA-3) |
| P-44 | **A** | CTA a Contacto, entradas al estimador omitidas, `/estimador` fuera hasta la 004: 32 rutas (§3.3, CA-2, CA-4) |
| P-45 | **A** | Solo los espacios de mensajes que usan las islas (§3.5); decide P-24 |
| P-46 | **Aprobado tal cual** | Presupuesto de §3.5 (CA-9) |
| P-47 | **A** | JSON-LD con `WebSite` y `Person` (§3.4, CA-7) |
| P-48 | **La recomendada** | Imagen de Open Graph solo si Julio la entrega con el favicon; si no, sin imagen |
| P-49 | **A** | ASVS 5.0: nivel 1 y la parte del nivel 2 de `plan.md` §4.5 (CA-13) |
| P-50 | **A** | HSTS como está; DNSSEC 48–72 h después del lanzamiento; CAA más adelante |
| P-51 | **A** | Comprobación automática de las puertas en el build de producción (CA-16); Legal revisado es puerta |
| P-52 | **A** | Firefox y WebKit con Playwright, en local y en la CI, y Safari real a mano (CA-11) |
| P-53 | **Abierta** | Se decide en ▲C2 con la evidencia de T10 |
| P-54 | **A** en sus dos puntos (▲C1, 2026-11-13) | El botón de cada servicio dice «Iniciar un proyecto» y lleva a Contacto; Acerca de y el caso conservan sus dos botones (§3.3) |
| P-55 | **A** (▲C1, 2026-11-13) | Limitación aceptada: con red lenta, `/en/architecture` a 390 px puede dar CLS 0,11. CA-9 se cumple en las condiciones de §3.5 |
| P-56 | **A** (2026-11-13) | La protección del preview se quita solo durante la ventana de pruebas de la T10 y la T11, y se reactiva al terminar (CA-12, CA-17) |

Las puertas G1 a G4 (§9) y P-13 siguen abiertas: la aprobación de ▲C0 no cierra
ninguna.
