# ADR 004 — Hosting y dominio

- **Estado:** **Propuesta — pendiente de aprobación de Julio (P-07).** No se
  contrata nada, no se cambia DNS y no se despliega hasta la feature 006.
- **Fecha:** 2026-11-05

## Contexto

La aplicación necesita runtime de Next.js para el proxy de idioma, los
handlers de formularios y encabezados con *nonce* de CSP. El dominio es
`thisjulio.com`; su registrador y DNS actuales no se conocen en esta fase.

## Criterios de decisión

1. Soporte completo de Next.js App Router (proxy, Route Handlers / Server
   Actions, imágenes, ISR) sin adaptadores frágiles.
2. **Términos que permitan uso comercial** en el plan elegido.
3. Encabezados de seguridad configurables (CSP con *nonce*, HSTS).
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
