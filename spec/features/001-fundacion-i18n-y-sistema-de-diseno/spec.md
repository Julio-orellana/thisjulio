# 001 — Fundación, internacionalización y sistema de diseño

**Estado:** **completada y cerrada (2026-11-05)**. Aprobada por Julio: revisión visual, CSP y renderizado (T18, ADR 006) y 404 y errores propios (T19, P-16). Cierre formal en `tasks.md` (T17)
**Aprobada:** 2026-11-05, con las decisiones de §6
**Origen:** prompt de dirección técnica, Fase 1, §10 paso 3 y §4.1–4.3, §5, §7.
**Alcance:** crea el proyecto Next.js, el enrutamiento bilingüe, los tokens y
la tipografía del diseño, el layout compartido (Nav, Footer, selector de
idioma) y la base de seguridad y verificación. **No** construye el contenido
de ninguna página, la escena 3D, los formularios ni el blog.

---

## 1. Por qué

Todas las features siguientes dependen de tres cosas que deben ser correctas
desde el primer commit: rutas localizadas con español como predeterminado,
un sistema visual idéntico al aprobado y una base segura y verificable.
Corregirlas después obliga a tocar cada página.

## 2. Requisitos

### R1. Proyecto

1. Next.js (App Router) + React + TypeScript `strict` + Tailwind CSS, con
   versiones exactas fijadas (`spec/constitution/tech-stack.md` §1).
2. Scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`,
   `verify` (lint + typecheck + test + build).
3. `.gitignore` que excluye `.env*` salvo `.env.example` (sin valores),
   `node_modules`, `.next`, resultados de pruebas.
4. Versión de Node declarada (`engines` y `.nvmrc`).

### R2. Tokens y tipografía

1. `src/styles/tokens.css` reproduce **todas** las variables de `:root` de
   `site.css` del diseño con los mismos valores (color, tipografía,
   espaciado, movimiento, radio).
2. Tailwind expone esos tokens; no hay colores, tamaños ni duraciones fuera
   de ellos.
3. Space Grotesk (300, 400, 500), Inter (400, 500, 600) y JetBrains Mono
   (400, 500) autoalojadas con `next/font`, con las pilas de respaldo del
   diseño.
4. Estilos base del diseño: fondo `--bg`, texto `--text`, escala
   tipográfica (`display`, `h1`–`h3`, `lead`, `body`, `small`, `mono`),
   contenedor `wrap`, `section`, `rule`, `band`, la marca `.this`, foco
   visible, y la regla `prefers-reduced-motion`.
5. Primitivas usadas por Nav y Footer: botón primario, fantasma y pequeño;
   enlace con flecha; etiqueta mono; indicador de estado. Las demás
   (chips, filas, campos, modal) se crean en la feature que las use.

### R3. Internacionalización

1. Idiomas `es` (predeterminado) y `en`; tabla única de rutas con todos los
   pares aprobados (`ARCHITECTURE.md` §3).
2. `/` redirige a `/es`. Rutas sin prefijo o con idioma desconocido no
   generan contenido duplicado (redirigen o devuelven 404).
3. `<html lang>` correcto en cada ruta.
4. Mensajes en `src/messages/{es,en}`; la verificación falla si una clave
   existe en un idioma y no en el otro.
5. Selector ES | EN en la navegación (escritorio y hoja móvil): enlaza a la
   página equivalente; si no existe, a la página padre. Es un enlace con
   `hreflang` y `lang`; el idioma activo se indica con `aria-current`.

### R4. Layout compartido

1. Nav fiel a `Nav.dc.html`: marca THIS JULIO, Inicio · Trabajo · Servicios ·
   Acerca de · Contacto, selector ES | EN, CTA «Iniciar un proyecto»
   (→ estimador); hoja móvil con el botón Menú/Cerrar (`aria-expanded`).
   **Sin** enlace a Arquitectura en la hoja móvil (D-04). El indicador
   «Taking projects» queda tras un interruptor de configuración, apagado
   hasta P-04 (D-09).
2. Footer fiel a `Footer.dc.html`: Trabajo, Servicios, Arquitectura,
   Estimador, Contacto, Acerca de, GitHub (`github.com/Julio-orellana`) y
   enlaces legales (Legal y privacidad, Licencias, Propiedad intelectual,
   Principios de privacidad → anclas de `/legal`). LinkedIn y correo se
   omiten mientras no existan (P-11). Sin enlace al blog.
3. Enlace «Saltar al contenido», un único `<main>` por página, landmarks
   con nombre.

### R5. Esqueletos de ruta

Cada ruta aprobada existe en ambos idiomas y renderiza layout + título
localizado, sin contenido de página (el contenido es de la 002–005). El
blog responde con `noindex`. Ninguna se despliega (no hay despliegue hasta
la 006).

### R6. Seguridad base

1. Encabezados de `SECURITY.md` §3 activos, con la CSP del ADR 006 generada en
   el proxy (hashes por página en las estáticas, nonce en las dinámicas;
   T18); `poweredByHeader: false`.
2. Ninguna variable `NEXT_PUBLIC_` con secretos; ningún servicio externo
   cargado desde el navegador (fuentes incluidas).
3. `npm audit` sin vulnerabilidades altas o críticas conocidas en
   dependencias de producción, o excepciones documentadas.

### R7. Verificación

1. Vitest y Playwright configurados (Playwright con el Chromium del entorno).
2. Página interna de muestra del sistema de diseño, **solo en desarrollo**,
   para comparar con `DesignSystem.dc.html`; excluida del build de
   producción.
3. CI en GitHub Actions que ejecuta `verify` y las pruebas e2e en cada push
   a ramas de trabajo. Sin pasos de despliegue.

## 3. Impacto por dimensión

| Dimensión | Impacto |
|---|---|
| Diseño | Se replica, no se modifica. Únicas adiciones: selector ES \| EN (D-05) y retirada de Technology de la hoja móvil (D-04). |
| i18n | Define el mecanismo completo; los textos de esta feature son solo navegación, footer y títulos. |
| Accesibilidad | Foco visible, contraste de tokens verificado (texto `--text-2` sobre `--bg`), navegación por teclado del menú móvil. |
| Seguridad | Encabezados y CSP desde el inicio; sin secretos. |
| Privacidad | Sin cookies salvo, si `next-intl` la usa, una de idioma funcional; se documenta. |
| Rendimiento | Fuentes autoalojadas con `display: swap`; sin JavaScript de cliente salvo hoja móvil. |
| Contenido / SEO | Sin contenido real; metadatos y sitemap son de la 006. |

## 4. Criterios de aceptación

| ID | Criterio | Verificación |
|---|---|---|
| CA-1 | `npm run verify` termina sin errores en un clon limpio. | Comando |
| CA-2 | `tokens.css` contiene las mismas variables y valores que `site.css` `:root` (huella `aac3072a2970729a`). | Prueba Vitest que compara ambos conjuntos |
| CA-3 | `/` responde con redirección a `/es`; `/es` y `/en` responden 200 con `lang` correcto. | Playwright |
| CA-4 | Cada par de la tabla de rutas responde 200 en su idioma; el slug del otro idioma (p. ej. `/es/work`) redirige a la ruta correcta o responde 404, **nunca** 200 con contenido duplicado. | Playwright, recorriendo la tabla |
| CA-5 | En cada ruta, el selector lleva a la equivalente; en una ruta sin traducción simulada, al padre. | Playwright + prueba unitaria del resolvedor |
| CA-6 | Las claves de `es` y `en` coinciden exactamente. | Vitest |
| CA-7 | Nav y Footer a 1440 px y 390 px coinciden con `Nav.dc.html`, `MobileMenu.dc.html` y `Footer.dc.html`, salvo D-04, D-05, D-09 y D-12. | Comparación de capturas documentada |
| CA-8 | La hoja móvil abre y cierra con teclado, expone `aria-expanded` y no incluye Arquitectura. | Playwright |
| CA-9 | Sin violaciones axe de nivel serio o crítico en los esqueletos (ambos idiomas). | `@axe-core/playwright` |
| CA-10 | Las respuestas incluyen CSP (hashes por página en las estáticas, *nonce* en las dinámicas; ADR 006), HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`; sin `X-Powered-By`. | Playwright (lectura de cabeceras) |
| CA-11 | Ninguna petición del navegador sale a un origen distinto del propio. | Playwright (registro de red) |
| CA-12 | `/es/blog` y `/en/blog` llevan `noindex` y no aparecen en la navegación. | Playwright |
| CA-13 | No existe enlace visible a Blog ni texto «24/7» en el sitio. | Búsqueda en el build + Playwright |
| CA-14 | (T18, ADR 006) Las 18 rutas públicas son estáticas y sin ISR. Su CSP lleva exactamente los hashes del HTML servido y solo `<ORIGEN>/_next/static/chunks/`, sin `'self'`, `'strict-dynamic'` ni `'unsafe-*'`. Las rutas dinámicas llevan un nonce distinto por respuesta. El origen no depende del `Host`. El generador del manifiesto falla ante lo no contemplado. El diseño no cambia. | Playwright P1–P14 (`csp.spec.ts`), Vitest, mutaciones y comparación de capturas píxel a píxel |
| CA-15 | (T19, P-16 opción B) Toda URL que no es una ruta, con o sin extensión, responde 404 con un 404 propio: renderizado en el servidor, en el idioma de la URL (o en los dos si no lo trae), con la Nav y el Footer del sitio, «Volver al inicio» y «Regresar», sin estilos ni scripts en línea propios y con la CSP de nonce. Los errores globales usan una página propia con el mismo diseño. Las 18 rutas no cambian. | `tests/e2e/not-found.spec.ts`, `csp.spec.ts`, axe, mutaciones y comparación de capturas píxel a píxel |

## 5. Qué NO cambia ni se hace

- Contenido de páginas, casos, servicios y legal (002).
- Escena 3D y página Arquitectura (003); componentes `Plates` y `Deploy`
  (002/003).
- Formularios, estimador, correo, antiabuso (004).
- MDX y artículos (005).
- Sitemap, `hreflang`, JSON-LD, Open Graph, hosting, dominio, despliegue (006).
- Ningún cambio al diseño aprobado fuera de D-04, D-05 y D-09.

## 6. Decisiones que esta spec pide a Julio

Resueltas por Julio el 2026-11-05:

1. **`/` → `/es` siempre**; el inglés en `/en`. Implementado sin detección
   por `Accept-Language` y sin cookie de idioma.
2. **GitHub Actions aprobado** solo para verificaciones; sin despliegues.
3. **Revisión de capturas** (ES/EN, navegación, responsive) antes del cierre:
   `capturas/`. El visto bueno al selector ES | EN (P-05) se da en esa
   revisión.

## 7. Riesgos

| Riesgo | Detección | Mitigación |
|---|---|---|
| Incompatibilidad entre versiones de Next.js, `next-intl` o TypeScript | Primer paso del plan: prueba mínima de enrutamiento | Fijar versiones; retroceder a la última menor compatible |
| CSP con *nonce* rompe estilos o scripts de Next/Tailwind | CA-10, CA-11 y consola sin errores | Excepción mínima documentada en `SECURITY.md` |
| Diferencias tipográficas entre Google Fonts y `next/font` | CA-7 | Mismos archivos y pesos; ajustar `font-display`/métricas de respaldo |
| Textos en español más largos que el diseño | Revisión a 390 px en CA-7 | Ajuste de copia, no de diseño (P-04) |
