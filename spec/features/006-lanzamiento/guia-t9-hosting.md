# 006 — Guía de la T9: alta del hosting y del entorno de preview

**Para:** Julio. **Fecha:** 2026-11-13 (actualizada el mismo día para Hobby).
**Decisiones que aplica:** P-38 = A-Hobby (Vercel Hobby hasta el inicio de la
actividad comercial; Pro al iniciarla, disparador P-57), P-40 A (integración
Git), P-41 A (preview en el dominio de Vercel), P-56 A (protección quitada solo
durante las pruebas).

Esta tarea es tuya: el agente no crea cuentas, no contrata, no conecta
proveedores y no despliega. Aquí está qué hacer, en orden, y qué entregar al
terminar. **No se toca el dominio ni el DNS**: eso es el lanzamiento (T17).

Lo que afirma esta guía sobre Vercel sale de su documentación oficial,
consultada el 2026-11-13 (§9). Los nombres exactos de los menús pueden variar:
donde no se pudo confirmar, dice **[Confirmar en el panel]**; lo que la
documentación no dice, **[No verificado]**.

## 0. Antes de empezar

- **Cuenta de GitHub con segundo factor** activado.
- **Costo: US$0.** Hobby es gratis y no tiene ciclos de facturación (§9).
- **Condición del plan.** Hobby es solo para uso personal no comercial. Vercel
  cuenta como comercial cobrar a los visitantes, anunciar o vender productos o
  servicios (también con anuncios como AdSense) y que te paguen por crear,
  actualizar o alojar el sitio (§9). Mientras estés en Hobby, el sitio debe
  leerse como portafolio personal. Cuando se cumpla un criterio de P-57, pasa a
  Pro (§8) **antes** de publicar nada comercial.
- **Conviene tener ya el favicon** (puerta G3). Sin él, cada visita pide
  `/favicon.ico` y recibe el 404 propio, que en Vercel es una invocación de
  función y cuenta contra el límite mensual de Hobby (§2). No bloquea esta
  tarea.

## 1. Cuenta y plan

1. Crea la cuenta (o usa la tuya) y **activa el segundo factor**.
2. Quédate en el plan **Hobby**. **No crees un equipo Pro ni empieces la prueba
   de Pro**: no hace falta para nada de la T9 a la T11.
3. Vercel admite **un solo equipo Hobby por cuenta** (§9). El proyecto va en
   ese equipo.

## 2. Límites de Hobby y qué pasa al llegar a uno

Hobby **no tiene Spend Management** (§9): no hay presupuesto que configurar,
porque no hay nada que cobrar.

**Qué incluye cada mes** (lo relevante para este sitio; tabla completa en §9):

| Recurso | Incluido en Hobby |
|---|---|
| Fast Data Transfer | 100 GB |
| Fast Origin Transfer | 10 GB |
| Peticiones al CDN | 1 000 000 |
| Invocaciones de función | 1 000 000 |
| Active CPU | 4 horas de CPU |
| Provisioned Memory | 360 GB-h |
| Despliegues por día | 100 |
| Registros de ejecución (Runtime Logs) | 1 hora |

**Al llegar a un límite.** Vercel **pausa en vez de cobrar**:

- «En la mayoría de los casos», hay que esperar a que pasen **30 días** para
  volver a usar esa función (§9).
- Un despliegue en pausa responde **`503 DEPLOYMENT_PAUSED`** a los visitantes
  (§9).
- Los proyectos en pausa **no se reanudan solos**: se reanudan uno por uno
  desde la página del proyecto en el panel. Reducir el uso o pasar a un plan
  superior resuelve la pausa (§9).
- Vercel avisa al llegar a un límite de su política de uso justo (aviso «Usage
  limit reached», en el panel y por correo) (§9). **[No verificado]** con
  cuánta antelación, y si avisa antes de llegar al límite en Hobby: los
  umbrales personalizables son solo de Pro.
- Pausa por política (por ejemplo, uso comercial en Hobby): Vercel la comunica
  por correo con los pasos para resolverla (§9).

**Dónde ver el uso y los límites.**

- Panel → **Usage** en la barra lateral, con el equipo Hobby seleccionado. Pon
  el periodo en **Last 30 days**; el indicador de cada recurso muestra cuánto
  llevas consumido (§9).
- Desde la terminal: `vercel billing usage --since 30d --group-by project`
  (§9). **[No verificado]** que funcione en una cuenta Hobby.
- Límites de referencia por plan: la página de Fair Use Guidelines (§9).

Para este sitio (estático salvo el proxy de la CSP, sin imágenes optimizadas
por Vercel) no se espera llegar a ningún límite con el tráfico de un
portafolio, pero **no está medido**: la T13 lo estima con el preview.

## 3. Proyecto

1. **Add New → Project** e importa el repositorio `thisjulio`.
2. Al instalar la aplicación de Vercel en GitHub, elige **Only select
   repositories** y da acceso **solo a ese repositorio** (§9).
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
   Authentication**. Las dos están disponibles en todos los planes, también en
   Hobby (§9). Standard Protection protege todo menos los dominios de
   producción. **Password Protection no existe en Hobby** (§9); no hace falta.
2. **Rama de producción:** `main` (**Settings → Git** **[Confirmar en el
   panel]**). Todavía no existe y es a propósito: se crea al lanzar. Mientras
   tanto solo hay previews.
3. **No actives** Web Analytics, Speed Insights ni la barra de comentarios en
   producción. El sitio no lleva analítica (CA-19).

A saber en Hobby: las solicitudes de acceso al preview admiten **un solo
usuario externo por cuenta** (§9). Si quieres enseñar el preview a alguien más,
avisa antes: se resuelve en la T10 sin cambiar de plan.

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

**Protección durante las pruebas (P-56 = A, decisión del 2026-11-13).** Las
pruebas automáticas no pueden iniciar sesión, así que la protección se quita
**solo durante la ventana de pruebas** de la T10 y la T11:

1. **Ahora no toques nada:** el preview se queda protegido.
2. Cuando el agente avise de que empieza la ventana: **Settings → Deployment
   Protection** y desactiva Vercel Authentication con su interruptor. En Hobby
   puedes hacerlo tú en tus propios proyectos (§9). Al desactivarla, **todos**
   los despliegues existentes quedan sin protección (§9). Avisa cuando esté
   hecho.
3. Al terminar las pruebas, vuelve a **Standard Protection** con Vercel
   Authentication y avisa.
4. El agente comprueba desde fuera que la dirección vuelve a pedir acceso.

Mientras dura la ventana, quien tenga la dirección puede ver el sitio con sus
textos en borrador. Sigue `noindex` y con `robots.txt` cerrado.

## 7. Qué entregar al terminar

1. La **dirección de la rama** del preview.
2. El **resultado del primer despliegue**: «Ready» o el final del registro de
   build si falló.
3. Qué ves al abrir la dirección: la página, un 500 o la pantalla de acceso.
4. Capturas de **Environment Variables**, **Build Command**, **Deployment
   Protection**, la rama de producción, **Billing** (que muestre el plan
   Hobby) y **Usage** (periodo «Last 30 days»).
5. La protección, **activada**: se quita solo durante la T10 (§6).

No pegues contraseñas, códigos ni el secreto de «Protection Bypass» en el chat
ni en el repositorio.

## 8. Cuando actives Pro

Esto **no es parte de la T9**. Es la tarea **TP** de la 006 y se hace el día
en que se cumpla un criterio de P-57 (publicidad pagada, publicar las páginas
de servicios o de cotización, o emitir la primera factura o cotización
formal), **antes** de publicar el contenido comercial.

1. **Actualiza el equipo Hobby a Pro.** Panel → selecciona el equipo →
   **Settings → Billing** → en **Plan**, **Upgrade**. No añadas miembros.
   Introduce la tarjeta y **Confirm and Upgrade** (§9). El proyecto, sus
   variables y su protección se quedan en el mismo equipo. **[Confirmar en el
   panel]** que el botón actualiza el equipo existente y no pide crear otro.
2. **Precio:** US$20 al mes de cuota de plataforma, con **un asiento que puede
   desplegar incluido** y **US$20 de crédito de uso** al mes; impuestos aparte
   (§9). No hace falta la prueba gratuita de Pro: dura 14 días y, sin método de
   pago, el equipo vuelve a Hobby (§9).
3. **Spend Management, ese mismo día y antes de publicar nada:**
   1. **Settings → Billing → Spend Management → Add Budget → Team** (§9).
   2. Importe: **US$20**. En Pro, el presupuesto de equipo cuenta solo el uso
      que pasa del crédito mensual (§9): con US$20, el gasto máximo previsto
      es la cuota (US$20) más US$20 de uso adicional, más impuestos.
   3. Activa **Pause production deployments** y confirma (§9). Sin eso, el
      presupuesto solo avisa: no detiene el gasto (§9).
   4. Los avisos al 50, 75 y 100 % se activan solos, en el panel y por correo;
      el SMS al 100 % se configura en **Settings → My Notifications** (§9).
4. **A saber:**
   - La comprobación del gasto corre cada pocos minutos: la pausa puede llegar
     varios minutos después de alcanzar el importe (§9).
   - En pausa, producción responde `503 DEPLOYMENT_PAUSED`, y hay que reanudar
     el proyecto a mano: subir el presupuesto no lo reanuda (§9).
   - El almacenamiento de despliegues se sigue cobrando durante la pausa (§9).
   - Con Pro, Password Protection pasa a estar disponible por US$20 más al mes
     por proyecto. **No la actives**: Vercel Authentication basta (§9).
5. **Entrega** capturas de **Billing** con el plan Pro y de **Spend
   Management** con el presupuesto y la pausa. El agente comprueba desde fuera
   que el sitio sigue respondiendo igual.

## 9. Fuentes (documentación oficial de Vercel, consultada el 2026-11-13)

| Tema | Lo que dice | Página |
|---|---|---|
| Plan Hobby | Gratis; recursos incluidos por mes (tabla de §2, más imágenes, Global Config, etc.); sin ciclos de facturación; al pasar un límite, «en la mayoría de los casos» hay que esperar 30 días; 100 despliegues por día; Runtime Logs de 1 hora; Spend Management «N/A»; Vercel Authentication para preview y producción; Password Protection solo en Pro. Pasos para actualizar a Pro desde **Settings → Billing** | <https://vercel.com/docs/plans/hobby> |
| Pausas y uso comercial | Una pausa da `503 DEPLOYMENT_PAUSED`; entre las causas, pasar los límites del plan; los proyectos se reanudan uno a uno, nunca solos; Hobby «non-commercial personal use only»; qué cuenta como comercial; en pausas por política, Vercel envía un correo | <https://vercel.com/kb/guide/why-is-my-account-deployment-blocked> |
| Uso justo | Rangos mensuales típicos de Hobby y de Pro | <https://vercel.com/docs/limits/fair-use-guidelines> |
| Ver el uso | **Usage** en la barra lateral; periodo «Last 30 days»; `vercel billing usage`; Spend Management solo en Pro y Enterprise; los avisos de uso se configuran solos y solo Pro elige sus umbrales | <https://vercel.com/docs/pricing/manage-and-optimize-usage> |
| Notificaciones | «Usage limit reached»: aviso al llegar a los límites de la política de uso justo; personalizar los avisos de uso es de Pro | <https://vercel.com/docs/notifications> |
| Protección | Standard Protection, en todos los planes, protege todo menos los dominios de producción; Password Protection no está en Hobby | <https://vercel.com/docs/deployment-protection> |
| Vercel Authentication | En todos los planes; en Hobby, cada uno la activa o desactiva en sus proyectos; al desactivarla, todos los despliegues quedan sin protección; Hobby admite un solo usuario externo por cuenta en las solicitudes de acceso | <https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication> |
| GitHub | Al instalar la aplicación: «All repositories» u «Only select repositories» | <https://vercel.com/docs/git/vercel-for-github> |
| Variables de sistema | `VERCEL_BRANCH_URL`: dominio de la dirección de la rama, sin `https://`, disponible al construir. `VERCEL_ENV`: `production`, `preview` o `development`. Se activan con «Enable access to System Environment Variables» | <https://vercel.com/docs/environment-variables/system-environment-variables> |
| Comando de build | Para Next.js usa el guion `build` de `package.json`; se puede sustituir con **Override** en Framework Settings o con `buildCommand` en `vercel.json`. Instala también las dependencias de desarrollo. Clona con `--depth=10` | <https://vercel.com/docs/builds/configure-a-build> |
| Plan Pro | US$20 al mes de cuota, con un asiento que despliega incluido y US$20 de crédito; un equipo Hobby por cuenta | <https://vercel.com/docs/plans/pro-plan> |
| Prueba de Pro | 14 días o hasta pasar los límites; sin método de pago vuelve a Hobby | <https://vercel.com/docs/plans/pro-plan/trials> |
| Spend Management | Presupuestos de equipo, proyecto, producto u organización; **Settings → Billing → Spend Management → Add Budget**; en Pro, el de equipo cuenta solo lo que pasa del crédito; sin «Pause production deployments» solo avisa; avisos al 50, 75 y 100 %; comprobación cada pocos minutos; reanudación manual | <https://vercel.com/docs/spend-management> |
| Pausar y reanudar | **Pause Project** en **Settings → General**; reanudar desde el panel o con la API | <https://vercel.com/docs/projects/managing-projects> |

**No confirmado en la documentación consultada:** que el campo Build Command
acepte una expresión de consola; el nombre exacto del ajuste de la rama de
producción; el encabezado que usa «Protection Bypass for Automation»; si Hobby
avisa antes de llegar a un límite y con cuánta antelación; si
`vercel billing usage` funciona en Hobby; que **Upgrade** actualice el mismo
equipo sin crear otro. Se confirman en el panel.
