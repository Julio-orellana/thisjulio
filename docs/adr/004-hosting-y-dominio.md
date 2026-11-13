# ADR 004 — Hosting y dominio

- **Estado:** **Propuesta — pendiente de aprobación de Julio (P-07).** No se
  contrata nada, no se cambia DNS y no se despliega hasta la feature 006.
- **Fecha:** 2026-11-05

## Contexto

La aplicación necesita runtime de Next.js para el proxy de idioma, los
handlers de formularios y la CSP por ruta (ADR 006). Las páginas públicas
son estáticas y cacheables. El dominio es
`thisjulio.com`; su registrador y DNS actuales no se conocen en esta fase.

## Criterios de decisión

1. Soporte completo de Next.js App Router (proxy, Route Handlers / Server
   Actions, imágenes, ISR) sin adaptadores frágiles.
2. **Términos que permitan uso comercial** en el plan elegido.
3. Encabezados de seguridad por ruta desde el proxy de Next (CSP de hashes o
   nonce, ADR 006) y HSTS. El despliegue debe incluir `.next/csp-manifest.json`.
   El CDN debe cachear el HTML junto con su CSP, y nunca cachear respuestas
   con nonce. Origen fijado por `SITE_ORIGIN` en el build.
4. HTTPS automático, dominio propio, entornos de vista previa por rama.
5. Registros (*logs*) sin datos personales innecesarios y con retención
   controlable; sin analítica activada por defecto.
6. Latencia aceptable hacia Guatemala y Norteamérica.
7. Costo mensual previsible para un sitio de tráfico bajo.
8. Portabilidad: salir del proveedor sin reescribir la aplicación.

## Alternativas

| Alternativa | A favor | En contra / a verificar |
|---|---|---|
| Vercel | Soporte nativo de Next.js, vistas previas, CDN global. | El plan gratuito es para uso no comercial: requiere plan de pago; revisar retención de logs. |
| Netlify | Buen soporte de Next.js mediante su adaptador. | Paridad de funciones con la versión de Next.js a confirmar. |
| Cloudflare (Workers + OpenNext) | CDN y WAF fuertes, DNS en el mismo lugar. | Adaptador adicional; compatibilidad con cada versión de Next.js a confirmar. |
| Contenedor Node (`output: 'standalone'`) en un PaaS o VPS | Máxima portabilidad y control. | Más operación: actualizaciones, certificados, CDN y monitoreo por cuenta propia. |

## Recomendación preliminar

Un proveedor con soporte nativo de Next.js en un plan con uso comercial
permitido, manteniendo el build compatible con `output: 'standalone'` como
salida de emergencia. La elección final la hace Julio con precios vigentes.

## Dominio y DNS

- No se modifican registros DNS hasta la 006.
- Se documentará: registrador, quién tiene acceso, registros actuales (sobre
  todo MX, para no romper el correo) y plan de cambio con vuelta atrás.
- Correo del dominio (SPF, DKIM, DMARC) se coordina con el ADR 005.

## Actualización del 2026-11-13 (planificación de la Feature 006)

**El estado no cambia: sigue siendo una propuesta.** La decisión es P-38
(`docs/PENDIENTES.md`); no se contrató ni se desplegó nada.

- **Dominio (medido, solo lectura):** registrador Cloudflare, DNS en
  Cloudflare, **sin ningún registro** (`A`, `AAAA`, `MX`, `TXT`, `CAA`) y sin
  DNSSEC. No hay sitio ni correo previos que romper.
- **Criterio 1, medido.** El proxy corre en Node.js (Next 16 no admite otro
  runtime) y lee `.next/csp-manifest.json` del disco; ese archivo **no está en
  la traza del proxy**. Solo un servidor Node con `next start` funciona hoy sin
  cambios.
- **Cloudflare Workers + OpenNext, probado en local:** construye, pero toda
  página responde 500 (falta el manifiesto) y, con el manifiesto embebido en un
  laboratorio, el Worker vuelve a renderizar las páginas y su HTML ya no
  coincide con los hashes de la CSP. El adaptador declara el proxy en Node.js
  «experimental» y Next no lo lista como adaptador verificado.
- **Vercel:** adaptador verificado por Next; el proxy corre antes de la caché.
  El plan gratuito no admite uso comercial: **Pro, US$20/mes**. Lo que no se
  pudo medir sin cuenta queda para una prueba en preview.
- **Recomendación para P-38:** Vercel Pro, condicionada a esa prueba; si
  fallara sin arreglo que respete la CSP, servidor Node detrás de Cloudflare.
- **▲C0 (2026-11-13): Julio eligió esa opción (P-38 = A).** El ADR sigue como
  propuesta hasta que la prueba en preview (T10 de la 006) la confirme; pasa a
  «Aceptada» en ▲C2. Nada contratado todavía.

Evidencia y fuentes: `spec/features/006-lanzamiento/evidencia-c0-hosting.md`.
Comparación y plan: `spec/features/006-lanzamiento/plan.md` §2 y §3.
