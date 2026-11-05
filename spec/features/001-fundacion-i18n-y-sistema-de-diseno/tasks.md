# 001 — Tareas

**Estado:** propuesta. Ninguna tarea se inicia sin aprobación de Julio.
Cada tarea termina con su comprobación ejecutada; si falla, la tarea no se
marca.

| # | Tarea | Comprobación | CA |
|---|---|---|---|
| T1 | Crear el proyecto Next.js (App Router, TS strict, Tailwind, ESLint, `src/`), fijar versiones exactas, `engines`, `.nvmrc`, `.gitignore`, `.env.example` vacío. | `npm run build` y `npm run lint` pasan | CA-1 |
| T2 | Prueba mínima de `next-intl` con `proxy.ts` y un par de `pathnames`; decidir versión de TypeScript. | `/es/trabajo` y `/en/work` responden 200 | CA-3, CA-4 |
| T3 | `src/styles/tokens.css` desde `site.css` `:root`; tema Tailwind; fuentes con `next/font`. | Prueba de equivalencia de tokens | CA-2 |
| T4 | Estilos base y primitivas (tipografía, `wrap`, `section`, `rule`, `band`, `.this`, botones, enlace con flecha, estado, foco, reduced-motion). | Página de muestra en desarrollo vs. `DesignSystem.dc.html` | CA-7 |
| T5 | `routing.ts` con la tabla completa, `navigation.ts`, `request.ts`; mensajes `es`/`en` (`common`, `nav`, `footer`, `pages`). | Prueba de claves iguales | CA-6 |
| T6 | Resolvedor `alternateHref` + pruebas (equivalente y padre). | Vitest | CA-5 |
| T7 | Layout `[locale]` con `lang`, SkipLink, landmarks. | axe | CA-9 |
| T8 | `Nav` + `MobileMenu` (sin Arquitectura) + `LocaleSwitcher` + interruptor del estado «Taking projects» (apagado). | Playwright de teclado y `aria-expanded` | CA-5, CA-8 |
| T9 | `Footer` con enlaces aprobados (sin blog, sin LinkedIn/correo hasta P-11). | Captura vs. `Footer.dc.html` | CA-7 |
| T10 | Esqueletos de todas las rutas; blog `noindex`. | Playwright recorre la tabla | CA-3, CA-4, CA-12 |
| T11 | CSP con *nonce* en `proxy.ts` + encabezados en `next.config.ts`. | Playwright lee cabeceras; consola sin errores CSP | CA-10, CA-11 |
| T12 | Configurar Vitest, Playwright (+ axe) y script `verify`. | `npm run verify` | CA-1 |
| T13 | Prueba de textos prohibidos («24/7», enlace a blog). | Playwright / búsqueda en build | CA-13 |
| T14 | Workflow `verify.yml` en GitHub Actions (sin despliegue). | Ejecución verde en la rama | CA-1 |
| T15 | `npm audit` de producción; documentar excepciones si las hay. | Salida del comando en el cierre | R6.3 |
| T16 | Capturas Nav/Footer 1440/390 junto a los artboards; presentar a Julio (P-05). | Capturas adjuntas | CA-7 |
| T17 | Cierre: marcar CA con evidencia, actualizar `TEST-PLAN.md` §8, `ARCHITECTURE.md` si la estructura cambió, `docs/PENDIENTES.md`. | Revisión de Julio | — |

## Fuera de esta feature

Contenido de páginas (002), escena 3D (003), formularios (004), blog (005),
SEO y despliegue (006).
