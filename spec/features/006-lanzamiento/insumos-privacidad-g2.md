# 006 · T15 — Insumos de privacidad para G2 (para el abogado)

**Qué es:** hechos técnicos, con su fuente, sobre qué datos de los visitantes
pasan por el sitio y por sus proveedores, para que el abogado revise Legal y
Privacidad (puerta **G2**, P-09). **No es texto legal** ni una recomendación
jurídica: el agente no redacta la página de privacidad. Fecha de consulta de
las fuentes: 2026-11-13. Marcas: **[Doc]** documentación oficial,
**[Medido]** comprobado en el build local, **[Inferencia]** deducción a
confirmar, **[Pendiente]** se confirma en el panel o con el abogado.

## 1. El sitio en sí

| Hecho | Fuente |
|---|---|
| No usa cookies: 0 `Set-Cookie` en todas las rutas y tipos de respuesta | [Medido] `transversal.spec.ts`, `headers.spec.ts` |
| No guarda nada en el navegador (`localStorage`) | [Medido] `transversal.spec.ts` |
| No pide nada a otros orígenes: las fuentes están autoalojadas y no hay analítica ni scripts de terceros | [Medido] `quality.spec.ts` (CA-11); CA-19 |
| No tiene formularios en el lanzamiento: el contacto es un enlace `mailto:` (y, mientras G4 siga abierta, solo GitHub) | `SECURITY.md` §1, P-43 |
| La aplicación no escribe registros propios de los visitantes; solo los errores del servidor quedan en el registro del hosting | [Medido] código de `src/` |

## 2. Hosting: Vercel, plan Hobby (P-38 = A-Hobby)

| Hecho | Fuente |
|---|---|
| Vercel recopila datos del tráfico de los sitios de sus clientes: «End User IP address», «location information derived from IP address, and system configuration information» | [Doc] Privacy Notice, vigente desde el 2026-06-01: <https://vercel.com/legal/privacy-notice> |
| Para esos datos dice actuar como **encargado** («data processor on behalf of our Customers») y deja al cliente la obligación de informar a los visitantes («Customers are solely responsible … including notifying their End Users») | [Doc] ídem |
| Puede tratar los datos **fuera del país** del visitante, incluido Estados Unidos | [Doc] ídem |
| Retención declarada: «the minimum necessary period to fulfill our legal and contractual obligations», sin un plazo concreto | [Doc] ídem |
| **Registros de ejecución** (Runtime Logs) del proxy y de las funciones: método, ruta, parámetros de búsqueda, código de estado, hora, host, región, **agente de usuario** del navegador. El panel puede filtrar «tus» peticiones por IP y agente de usuario, así que la IP se registra aunque no se muestre como campo. Las peticiones estáticas solo aparecen si salen de la caché | [Doc] <https://vercel.com/docs/logs/runtime> (actualizada el 2026-08-28) |
| Retención de esos registros: **1 hora en Hobby** (1 día en Pro) | [Doc] ídem |
| Ocultar las IP en el panel solo es posible en Pro y Enterprise, y aun así «Vercel will still collect IP addresses» para fines como mitigar ataques | [Doc] <https://vercel.com/docs/query/monitoring> (actualizada el 2026-08-11) |
| Web Analytics y Speed Insights quedan **apagados** (CA-19); el proyecto no tiene Log Drains | `guia-t9-hosting.md`; [Pendiente] captura del panel en la T9 |
| Si el sitio pasa a Pro (P-57), cambia la retención de los registros (1 día) | [Doc] Runtime Logs |
| Si el acuerdo de tratamiento de datos (DPA) de Vercel cubre también una cuenta Hobby de uso personal | [Pendiente] lo confirma Julio o el abogado: <https://vercel.com/legal/dpa> |

## 3. DNS: Cloudflare

| Hecho | Fuente |
|---|---|
| El DNS del dominio está en Cloudflare (registrador y servidores de nombres) y los registros van en «DNS only»: el tráfico web **no** pasa por Cloudflare | `plan.md` §3; P-07 |
| Lo que llega a Cloudflare por DNS son las consultas de los resolvedores, no las visitas | [Inferencia]; [Pendiente] qué registra Cloudflare de esas consultas |

## 4. Correo de contacto: Cloudflare Email Routing (P-42, puerta G4)

Solo aplica cuando Julio elija la dirección y cree el reenvío.

| Hecho | Fuente |
|---|---|
| «Cloudflare will not store or access the emails routed to your inbox» | [Doc] Email Routing, introducción: <https://developers.cloudflare.com/email-routing/> |
| Aun así, el registro de actividad guarda **metadatos de cada mensaje**: remitente, destinatario, asunto, identificador, estado, acción y resultados de SPF, DKIM, DMARC y ARC, más una puntuación de spam | [Doc] documentación de Email Routing (registro de actividad y consultas GraphQL): <https://developers.cloudflare.com/email-routing/llms-full.txt> |
| La puntuación de spam sale de un análisis «of the email's headers and **text**» (hoy experimental y pasivo). Comprueba la IP del remitente contra listas de bloqueo y exige SPF o DKIM | [Doc] ídem, sección Postmaster |
| No se publica cuánto tiempo se guarda ese registro de actividad | [Pendiente] |
| El mensaje se reenvía a la bandeja personal de Julio; las respuestas salen de esa bandeja, así que quien escribe ve la dirección personal de Julio al recibir la respuesta | `plan.md` §1 (P-42) |
| Lo que pase después en la bandeja personal (proveedor, retención) queda fuera del sitio | [Pendiente] Julio |

## 5. Enlaces a terceros

| Hecho | Fuente |
|---|---|
| El único enlace externo es el perfil de GitHub, con `rel="noopener noreferrer"`: el navegador no envía la página de origen. Al seguirlo, rige la privacidad de GitHub | [Medido] `Footer.tsx`, `AboutView.tsx`, `ContactView.tsx` |
| No hay contenido incrustado de terceros (mapas, vídeos, fuentes, iconos) | [Medido] CA-11 |

## 6. Preguntas para el abogado (no se responden aquí)

1. Con visitantes de Guatemala y de otros países, ¿qué marco aplica al aviso de
   privacidad y qué debe decir sobre los datos que trata el hosting como
   encargado?
2. ¿Hace falta mencionar la transferencia a Estados Unidos (Vercel) y el
   reenvío de correo por Cloudflare?
3. ¿Qué decir de los metadatos del correo de contacto (§4) y de cuánto tiempo
   los conserva Julio en su bandeja?
4. Si el sitio pasa a Pro (P-57), ¿cambia algo del aviso?
5. ¿Debe la página nombrar a los proveedores o basta con describir el
   tratamiento?

## 7. Qué se confirma en la T9 y la T10

- Capturas del panel de Vercel: Web Analytics y Speed Insights apagados, sin
  Log Drains, solo las dos variables de entorno.
- Que el preview no envía nada a otros orígenes (CA-19, Playwright contra el
  preview).
- Cuando exista el reenvío (G4): qué muestra el registro de actividad de
  Email Routing y su retención.
