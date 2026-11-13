# 006 — Guía de la T9: alta del hosting y del entorno de preview

**Para:** Julio. **Fecha:** 2026-11-13. **Decisiones que aplica:** P-38 A (Vercel
Pro), P-40 A (integración Git), P-41 A (preview en el dominio de Vercel).

Esta tarea es tuya: el agente no crea cuentas, no contrata, no conecta
proveedores y no despliega. Aquí está qué hacer, en orden, y qué entregar al
terminar. **No se toca el dominio ni el DNS**: eso es el lanzamiento (T17).

Lo que afirma esta guía sobre Vercel sale de su documentación oficial,
consultada el 2026-11-13 (§8). Los nombres exactos de los menús pueden variar:
donde no se pudo confirmar, dice **[Confirmar en el panel]**.

## 0. Antes de empezar

- **Cuenta de GitHub con segundo factor** activado.
- **Costo:** Vercel Pro, **US$20 al mes**, con US$20 de crédito de uso;
  impuestos aparte. **[Confirmar al contratar]** que un equipo de una sola
  persona paga US$20 en total.
- **Conviene tener ya el favicon** (puerta G3). Sin él, cada visita pide
  `/favicon.ico` y recibe el 404 propio, que en Vercel es una invocación de
  función. No bloquea esta tarea.

## 1. Cuenta y plan

1. Crea la cuenta (o usa la tuya) y **activa el segundo factor**.
2. Crea un equipo en el plan **Pro**. El plan Hobby no sirve: es solo para uso
   no comercial.

## 2. Límite de gasto (hazlo antes de desplegar nada)

En **Settings → Billing → Spend Management**:

1. Activa Spend Management y fija el **On-Demand Budget**. Sugerencia: **US$20**
   (el uso que pase del crédito incluido). Es tu decisión.
2. Activa **Pause Production Deployments**. Sin eso, el límite solo avisa: no
   detiene el gasto.

A saber: la comprobación corre cada pocos minutos, así que el corte no es
instantáneo; y si se alcanza, el sitio responde 503 hasta que lo reanudes a
mano.

## 3. Proyecto

1. **Add New → Project** e importa el repositorio `thisjulio`.
2. Al instalar la aplicación de Vercel en GitHub, da acceso **solo a ese
   repositorio**, no a todos.
3. **Framework Preset:** Next.js (lo detecta solo). No cambies el directorio
   raíz, el comando de instalación ni el directorio de salida.
4. **Node.js:** 22.x (`package.json` lo exige). **[Confirmar en el panel]**
   que no queda otra versión.
5. **No añadas ningún dominio.** El proyecto queda solo con sus direcciones
   `*.vercel.app`.

## 4. Variables y comando de build

El sitio no construye sin `SITE_ORIGIN`, y un build solo funciona en el origen
con el que se construyó (va dentro de la CSP). Por eso el preview y la
producción llevan valores distintos.

**Settings → Environment Variables:**

| Variable | Valor | Entornos |
|---|---|---|
| `SITE_ORIGIN` | `https://thisjulio.com` | **Solo Production** |
| `NEXT_TELEMETRY_DISABLED` | `1` | Todos |

- Deja marcada la casilla **Enable access to System Environment Variables**.
- **No añadas ninguna otra variable.** El sitio no usa secretos.

**Settings → Build and Deployment → Framework Settings → Build Command**, con
**Override** activado:

```bash
if [ "$VERCEL_ENV" = "production" ]; then npm run build; else SITE_ORIGIN="https://$VERCEL_BRANCH_URL" npm run build; fi
```

Qué hace: en producción construye con el valor de la tabla (y si faltara, el
build falla: no hay valor de repuesto); en un preview usa la dirección estable
de la rama, que Vercel entrega en `VERCEL_BRANCH_URL`. Así no hay que adivinar
esa dirección. El origen sigue fijándose al construir, nunca desde la petición
(ADR 006).

**[Confirmar en el panel]** que el campo admite una expresión de consola. Si no
la admite, la alternativa es definir `SITE_ORIGIN` para **Preview** con la
dirección exacta de la rama, que Vercel muestra tras el primer despliegue.

## 5. Protección y rama de producción

1. **Settings → Deployment Protection:** **Standard Protection** con **Vercel
   Authentication**. Es la opción por omisión: protege todo menos los dominios
   de producción, y está incluida. **No actives Password Protection**: cuesta
   US$20 más al mes.
2. **Rama de producción:** `main` (**Settings → Git** **[Confirmar en el
   panel]**). Todavía no existe y es a propósito: se crea al lanzar. Mientras
   tanto solo hay previews.
3. **No actives** Web Analytics, Speed Insights ni la barra de comentarios en
   producción. El sitio no lleva analítica (CA-19).

Red de seguridad: aunque algo desplegara a producción por error, el build con
el origen de producción **falla** mientras quede una puerta abierta
(`release-gates.json`).

## 6. Primer preview

1. Con el proyecto creado, Vercel construye la rama
   `claude/admiring-babbage-bjvbo8`. Si no arranca solo, usa **Redeploy**.
2. Abre **solo la dirección de la rama**, la que contiene `-git-`. La otra, la
   propia de cada despliegue, mostrará la página sin JavaScript: su origen no
   coincide con el de la CSP. Es lo esperado, no un fallo.
3. Te pedirá iniciar sesión en Vercel: es la protección del preview.

**Es probable que el primer preview responda 500 en todas las páginas.** Está
previsto: el proxy necesita el manifiesto de CSP y ese archivo puede no llegar
a la función (medido en la planificación). Es justo lo que comprueba la T10 y
lo que resuelve P-53. **No cambies nada para arreglarlo:** entrega lo de §7.

**Decisión P-56, antes de la T10.** Las pruebas automáticas no pueden iniciar
sesión. Opciones: (A) quitar la protección solo durante la ventana de pruebas y
volver a activarla al terminar; (B) correr tú el guion en tu terminal con el
secreto de «Protection Bypass for Automation» en una variable de entorno y
pasar la salida; (C) solo revisión manual. Recomendada: A.

## 7. Qué entregar al terminar

1. La **dirección de la rama** del preview.
2. El **resultado del primer despliegue**: «Ready» o el final del registro de
   build si falló.
3. Qué ves al abrir la dirección: la página, un 500 o la pantalla de acceso.
4. Capturas de **Environment Variables**, **Build Command**, **Deployment
   Protection**, **Spend Management** y la rama de producción.
5. Tu respuesta a **P-56**.

No pegues contraseñas, códigos ni el secreto de «Protection Bypass» en el chat
ni en el repositorio.

## 8. Fuentes (documentación oficial de Vercel, consultada el 2026-11-13)

| Tema | Lo que dice | Página |
|---|---|---|
| Variables de sistema | `VERCEL_BRANCH_URL`: dominio de la dirección de la rama, sin `https://`, disponible al construir. `VERCEL_ENV`: `production`, `preview` o `development`. Se activan con «Enable access to System Environment Variables» | <https://vercel.com/docs/environment-variables/system-environment-variables> |
| Comando de build | Para Next.js usa el guion `build` de `package.json`; se puede sustituir con **Override** en Framework Settings o con `buildCommand` en `vercel.json`. Instala también las dependencias de desarrollo. Clona con `--depth=10` | <https://vercel.com/docs/builds/configure-a-build> |
| Protección | Standard Protection, en todos los planes, protege todo menos los dominios de producción; exige autenticación también al proxy. Password Protection en Pro: US$20 al mes por proyecto | <https://vercel.com/docs/deployment-protection> |
| Límite de gasto | Pro. Cuenta el uso medido que pasa del crédito mensual. Avisos al 50, 75 y 100 %; «Pause Production Deployments» detiene producción; la comprobación corre cada pocos minutos | <https://vercel.com/docs/spend-management> |
| Precio y uso comercial | `evidencia-c0-hosting.md` §3.2 | — |

**No confirmado en la documentación consultada:** que el campo Build Command
acepte una expresión de consola; el nombre exacto del ajuste de la rama de
producción; el encabezado que usa «Protection Bypass for Automation»; que el
equipo de una persona pague US$20 en total. Se confirman en el panel.
