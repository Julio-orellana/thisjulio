# Seguridad y privacidad — thisjulio.com

> **Ubicación principal** de las medidas de seguridad y privacidad del sitio.
> Referencias: `TECH-STACK.md` de Julio (pendiente, P-01), OWASP Top 10 y
> OWASP ASVS como guía de verificación. Estado: **diseño de la Fase 1, nada
> implementado.**

## 1. Superficie de ataque de la v1

Páginas de contenido estáticas, dos formularios públicos (contacto y
estimador), proxy de idioma, escena WebGL en cliente. **Sin** base de datos,
autenticación, cuentas de usuario, subida de archivos (salvo aprobación,
P-06), analítica ni cookies de seguimiento.

## 2. Controles por riesgo

| Riesgo | Control |
|---|---|
| XSS | React escapa por defecto; prohibido `dangerouslySetInnerHTML` salvo JSON-LD serializado y MDX del repositorio (contenido confiable, revisado por commit). CSP con *nonce* y `strict-dynamic`. |
| CSRF | Server Actions de Next.js validan el origen; los Route Handlers comprueban `Origin`/`Host` y solo aceptan `POST` con `Content-Type` esperado. Sin cookies de sesión en v1. |
| SSRF | El servidor no hace peticiones a URLs provistas por el usuario. La única salida es la API de correo, con dominio fijo. |
| IDOR / control de acceso | Sin recursos por usuario en v1. Al llegar el panel (futuro), autorización comprobada en servidor en cada acción. |
| Abuso de formularios | Ver ADR 005: honeypot, tiempo mínimo, límites de tamaño, validación estricta; verificación humana y límite de frecuencia a decidir. |
| Inyección en correo | Los campos se tratan como texto; cabeceras del correo fijas (remitente, destinatario, asunto con prefijo); `reply-to` solo tras validar el formato del correo. |
| Dependencias vulnerables | Versiones fijadas, `npm audit` en CI, actualización revisada; sin dependencias sin justificación en el plan de su feature. |
| Secretos | Solo variables de entorno del servidor; nunca con prefijo `NEXT_PUBLIC_`; `.env*` en `.gitignore` salvo `.env.example` sin valores; secretos distintos por entorno. |
| Fuga de información | Errores genéricos al usuario; sin trazas en respuestas; `poweredByHeader: false`. |

## 3. Encabezados de seguridad

Se fijan en la feature 001 (base) y se endurecen en la 006:

- `Content-Security-Policy` con *nonce* por petición:
  `default-src 'self'`; `script-src 'self' 'nonce-…' 'strict-dynamic'`;
  `style-src 'self' 'nonce-…'` (o `'unsafe-inline'` solo si los estilos en
  línea de Next/Tailwind lo exigen, documentado); `img-src 'self' data: blob:`;
  `font-src 'self'` (fuentes autoalojadas, D-10); `connect-src 'self'`;
  `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`;
  `object-src 'none'`; `upgrade-insecure-requests`.
- **Compatibilidad con WebGL:** el motor usa un `<canvas>` y texturas
  generadas en un canvas 2D; no necesita `unsafe-eval`, *workers* ni orígenes
  externos. Si una verificación demuestra lo contrario, se documenta la
  excepción mínima.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` (preload
  solo con aprobación, porque compromete el dominio entero).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy` denegando cámara,
  micrófono, geolocalización y similares, `Cross-Origin-Opener-Policy:
  same-origin`.

## 4. Privacidad y datos personales

- **Minimización:** los formularios piden solo nombre, correo y la
  descripción del proyecto; lo demás es opcional.
- **Sin almacenamiento:** los mensajes se envían por correo y no se guardan
  en el servidor; los logs no contienen el contenido ni el correo.
- **Sin analítica ni cookies de seguimiento** en v1. Si se usa una cookie de
  idioma, es funcional, de primera parte y sin identificadores. Un cambio
  aquí requiere aprobación y actualizar la página de privacidad.
- **Sin servicios externos** cargados desde el navegador (fuentes, mapas,
  vídeos, widgets) sin aprobación.

## 5. Almacenamiento en el navegador

El diseño usa `localStorage` para pasar estado entre artboards; la
aplicación lo sustituye por rutas y anclas (`docs/design/REFERENCIA-DISENO.md`
§4.2). No se guarda nada personal en el navegador.

## 6. Contenido legal

La página Legal es **informativa y marcada «Borrador pendiente de revisión
legal»** hasta la revisión jurídica (P-09). Reglas de redacción:

- No afirmar que Guatemala tiene una ley integral de protección de datos
  equivalente al RGPD; las obligaciones surgen de varias fuentes (p. ej.
  Constitución Política y Decreto 57-2008, en su ámbito), sujeto a revisión.
- No afirmar que el RGPD aplica automáticamente a todos los proyectos.
- Derechos de autor sobre software: Decreto 33-98 y reformas (vigencia y
  aplicabilidad a confirmar), Convenio de Berna, Tratado de la OMPI sobre
  Derecho de Autor y ADPIC cuando corresponda.
- Principio operativo: THIS JULIO no recopila ni procesa información
  adicional de los usuarios de los sistemas que desarrolla, salvo cuando sea
  parte de los requerimientos, las responsabilidades autorizadas o las
  obligaciones aplicables del proyecto.
- Sin contratos, garantías ni cláusulas de responsabilidad en el sitio.

## 7. Reporte de vulnerabilidades

Hasta que exista un correo de seguridad real (P-11), los reportes se reciben
por el canal de contacto. Se publicará `/.well-known/security.txt` en la
006 cuando haya un contacto confirmado.
