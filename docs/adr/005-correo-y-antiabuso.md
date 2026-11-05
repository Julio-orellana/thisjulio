# ADR 005 — Correo y protección antiabuso de formularios

- **Estado:** **Propuesta — pendiente de aprobación de Julio (P-07).** No se
  contrata ni se integra ningún servicio antes de la feature 004.
- **Fecha:** 2026-11-05

## Contexto

Contacto y estimador envían un mensaje a Julio. No se guarda en base de
datos (ADR 003). Los formularios públicos atraen spam y abuso; la v1 no usa
analítica ni cookies de seguimiento.

## Decisión de arquitectura (independiente del proveedor)

1. **Envío solo desde el servidor** (Route Handler o Server Action). Ninguna
   clave llega al navegador.
2. **Validación con Zod en servidor**, límites de longitud, normalización y
   rechazo de campos inesperados; el resultado al usuario no revela detalles
   internos.
3. **Sin almacenamiento:** el contenido se envía y se descarta. Los registros
   guardan solo metadatos técnicos (resultado, tiempo), nunca el mensaje ni
   el correo del remitente.
4. **Correo hacia Julio, no respuesta automática al remitente** en v1 (evita
   usar el formulario para enviar correo a terceros).
5. **Capas antiabuso sin servicios externos, siempre activas:** campo trampa
   (*honeypot*), tiempo mínimo de llenado, límites de tamaño, validación
   estricta.
6. **Capa adicional, a decidir:** verificación humana y/o límite de
   frecuencia por IP.

## Alternativas — correo transaccional

| Alternativa | Notas |
|---|---|
| API transaccional (p. ej. Resend, Postmark, Amazon SES) | Entregabilidad y registro de envíos; exige verificar el dominio (SPF/DKIM). Revisar retención de contenido en sus logs. |
| SMTP del buzón del dominio (p. ej. Google Workspace, Microsoft 365, Zoho) | Reutiliza el correo que Julio ya tendría; límites de envío más bajos y credenciales SMTP que proteger. |

## Alternativas — verificación humana / límites

| Alternativa | Notas |
|---|---|
| Cloudflare Turnstile | Sin rompecabezas en la mayoría de los casos; revisar su política de privacidad y cookies antes de aprobar. |
| hCaptcha | Alternativa con enfoque de privacidad; más fricción. |
| Google reCAPTCHA | Descartable por privacidad (comparte datos con Google). |
| Límite por IP | En hosting *serverless* requiere un almacén compartido (servicio externo) o el WAF del proveedor. |

## Criterios

Privacidad (sin seguimiento, datos mínimos, retención), entregabilidad,
costo para volumen bajo, facilidad de configurar SPF/DKIM/DMARC, que no
exija cookies que obliguen a un aviso de consentimiento, y portabilidad.

## Recomendación preliminar

Capas sin servicios externos desde el primer día; proveedor transaccional
con dominio verificado; verificación humana solo si Julio la aprueba (o si el
abuso aparece). Todo se confirma en la spec de la 004.
