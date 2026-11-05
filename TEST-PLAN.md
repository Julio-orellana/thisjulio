# Plan de pruebas — thisjulio.com

> **Ubicación principal** de la estrategia de verificación. Cada feature
> enumera sus criterios de aceptación en su `spec.md` y los vincula a los
> niveles de este plan. Regla: **ningún resultado se declara sin haberlo
> ejecutado**; lo no ejecutado se reporta como no ejecutado.

## 1. Niveles

| Nivel | Herramienta | Qué cubre | Cuándo |
|---|---|---|---|
| Estático | ESLint, `tsc --noEmit` | Tipos, reglas, imports prohibidos (p. ej. componentes de cliente innecesarios) | Cada commit (CI) |
| Contenido | Zod en build | Entradas completas, slugs únicos, ambos idiomas, solo `approved` publicado | Build |
| i18n | Vitest + tipos de mensajes | Claves iguales en `es` y `en`; tabla de rutas recíproca; selector → equivalente o padre | Cada commit |
| Unitario | Vitest | Utilidades, cálculo del estimador, esquemas de formularios, generación de metadatos y alternates | Cada commit |
| Extremo a extremo | Playwright (Chromium preinstalado) | Navegación, redirección `/` → `/es`, selector de idioma, formularios, servicios (posición bajo el encabezado) | Por feature |
| Accesibilidad | `@axe-core/playwright` + revisión manual de teclado | WCAG 2.2 AA: contraste, foco visible, orden, nombres accesibles, `lang` | Por feature |
| Visual | Capturas Playwright vs. artboards del diseño | Fidelidad a 1440 px y 390 px | Por página |
| Seguridad | `npm audit`, prueba de encabezados, pruebas de formularios con entradas maliciosas | CSP, HSTS, validación en servidor, antiabuso | 001 (base), 004, 006 |
| Rendimiento | Lighthouse (Chromium preinstalado) | LCP, CLS, INP en páginas sin 3D y con 3D diferida | 006 |

## 2. Fidelidad visual contra el diseño aprobado

1. Fuente: artefacto versión `1793843453-74ee`; se verifica la huella de
   `site.css` y del artboard antes de comparar
   (`docs/design/REFERENCIA-DISENO.md` §2).
2. Se renderiza el artboard y la página implementada al mismo ancho (1440 y
   390), mismo idioma (`en`, porque el diseño está en inglés), fuentes
   cargadas, animaciones detenidas.
3. Se comparan: jerarquía, tipografía, colores (tokens exactos), espaciado,
   recortes, estados (hover, foco, seleccionado).
4. Diferencias admitidas: las listadas en §5 de la referencia del diseño
   (D-01…D-13) y ajustes de antialiasing. Cualquier otra se corrige o se
   documenta para aprobación.
5. En español se comprueba además que ningún texto desborde ni se recorte
   (los textos en español suelen ser más largos).

## 3. Internacionalización

- Cada ruta de la tabla de `ARCHITECTURE.md` §3 responde en ambos idiomas.
- `/` redirige a `/es`; rutas sin prefijo no generan contenido duplicado.
- El selector en cada página lleva a la equivalente; sin traducción, al
  padre.
- `<html lang>` correcto; ningún texto visible en el idioma equivocado
  (búsqueda de claves faltantes y de cadenas en duro).

## 4. Formularios (feature 004)

Entradas vacías, demasiado largas, con HTML/JS, con saltos de línea en
campos de cabecera, correo inválido, honeypot lleno, envío demasiado rápido,
método o `Content-Type` incorrectos, origen cruzado. Resultado esperado:
rechazo genérico, sin envío y sin registro del contenido.

## 5. Escena 3D (feature 003)

Pruebas funcionales, no de rendimiento: arranque diferido (no se crea
contexto WebGL hasta entrar en viewport), pausa fuera de pantalla, cuadro
fijo con `reduced-motion`, respaldo con WebGL deshabilitado y con pérdida
de contexto simulada (`WEBGL_lose_context`), liberación de recursos al
desmontar (sin contextos acumulados al navegar), etiquetas DOM operables con
teclado y localizadas, sin errores de consola.

## 6. Medición de GPU real (independiente, P-12)

No bloquea ninguna feature. Cuando Julio lo decida: dispositivos de
referencia (escritorio con GPU dedicada, portátil integrada, teléfono
gama media), perfil de calidad elegido, resolución efectiva
(`canvas.dataset.quality`) y costo por cuadro (`canvas.dataset.ms`), que el
motor ya expone.

## 7. Fuera de alcance

Pruebas del sistema POS (otro repositorio, otro producto). Pruebas de carga.

## 8. Registro de verificaciones ejecutadas

| Fecha | Fase / feature | Verificación | Resultado |
|---|---|---|---|
| 2026-11-05 | Fase 1 | Inspección del repositorio `thisjulio` (`git status`, `ls-remote`, listado) | Vacío: sin commits ni archivos; remoto sin ramas |
| 2026-11-05 | Fase 1 | Lectura de los 26 archivos `project/` del artefacto de diseño y cálculo de SHA-256 | Accesible; huellas en `docs/design/REFERENCIA-DISENO.md` |
| 2026-11-05 | Fase 1 | Revisión de solo lectura de `sistema-pos` (README, package.json, electron-builder.yml, roadmap §1, estructura) | Ver `docs/portafolio/caso-pos.md`. **Sin ejecutar pruebas** |
| 2026-11-05 | Fase 1 | Consulta al registro npm de versiones y `peerDependencies` de `next-intl` | `next-intl@4.14.9` acepta `next ^16`; `next@16.4.5` exige Node ≥ 20.9 |

No se ejecutaron pruebas de aplicación: no existe código de aplicación.
