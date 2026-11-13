# Textos en borrador de la Feature 003 (para revisión de Julio, P-22)

Generado del código el 2026-11-13 (`src/content/architecture.ts` y `src/messages`). **Todo en `draft`:** 67 bloques nuevos (42 piezas, 17 bandas, 7 tipos de sistema y el espacio de nombres `architecture`), más los textos añadidos o cambiados en `home`, que ya estaba en borrador. Con los de la 002 son 101 de 101 bloques en borrador. Nada de esto está aprobado.

El inglés sale del diseño (`Main.dc.html`, `Arch3D.dc.html`, `Technology.dc.html`), salvo la descripción de «Monitoring», que es texto nuevo por la condición de P-28. El español es redacción nueva.

Para aprobar un bloque: cambiar su `copy` a `'approved'` en `src/content/architecture.ts` (o el espacio de nombres en `src/content/messages-copy.ts`).

## Mensajes: home (añadidos o cambiados en la 003)

Rótulo y pasos del recorrido del hero, los 15 rótulos del atlas 3D, la frase de las luces en «El sistema completo» y el panel de la capa «Datos» (P-35 = B).

| Clave | Español | English |
|---|---|---|
| `hero.hint` | Desplázate para seguir una solicitud por el sistema | Scroll to follow a request through the system |
| `hero.steps.0` | Una solicitud empieza en la Interfaz | A request starts at the Interface |
| `hero.steps.1` | La Lógica aplica las reglas de negocio | Logic applies the business rules |
| `hero.steps.2` | Los Datos guardan el resultado | Data stores the result |
| `hero.steps.3` | La Infraestructura lo mantiene todo en marcha | Infrastructure keeps it all running |
| `scene.labels.0` | WEB | WEB |
| `scene.labels.1` | ESCRITORIO | DESKTOP |
| `scene.labels.2` | MÓVIL | MOBILE |
| `scene.labels.3` | SERVICIOS | SERVICES |
| `scene.labels.4` | API | API |
| `scene.labels.5` | REGLAS | RULES |
| `scene.labels.6` | AUTOMATIZACIÓN | AUTOMATION |
| `scene.labels.7` | POSTGRESQL | POSTGRESQL |
| `scene.labels.8` | MONGODB | MONGODB |
| `scene.labels.9` | ALMACENAMIENTO | STORAGE |
| `scene.labels.10` | SINCRONIZACIÓN | SYNC |
| `scene.labels.11` | NUBE | CLOUD |
| `scene.labels.12` | SERVIDOR LOCAL | LOCAL SERVER |
| `scene.labels.13` | RED | NETWORK |
| `scene.labels.14` | SEGURIDAD | SECURITY |
| `built.layers.data.text` | Donde vive la información: PostgreSQL, MongoDB, almacenamiento de datos, sincronización y gestión de la información. | Where information lives: PostgreSQL, MongoDB, data storage, synchronization and information management. |
| `built.layers.data.parts.0` | PostgreSQL | PostgreSQL |
| `built.layers.data.parts.1` | MongoDB | MongoDB |
| `built.layers.data.parts.2` | Almacenamiento | Storage |
| `built.layers.data.parts.3` | Sincronización | Sync |
| `built.layers.system.text` | Cuatro capas independientes. Cada una hace un trabajo y, juntas, funcionan como un solo producto. Las luces en movimiento muestran los datos viajando entre ellas. | Four independent layers. Each does one job, and together they work as one product. The moving lights show data travelling between them. |

## Mensajes: architecture

| Clave | Español | English |
|---|---|---|
| `title` | <this>This</this> es cómo se construye. | <this>This</this> is how it's built. |
| `lead` | Elige un tipo de sistema y luego cualquier pieza para ver el trabajo que hace. No hace falta ser técnico. | Pick a type of system, then select any part to see the job it does. You don't need to be technical. |
| `systemsLabel` | Tipo de sistema | Type of system |
| `optionalNote` | Las capas punteadas se agregan solo cuando un proyecto las necesita | Dashed layers are added only when a project needs them |
| `inspectorLabel` | Pieza seleccionada | Selected part |
| `simple.title` | La configuración más simple que hace el trabajo. | The simplest setup that does the job. |
| `simple.lead` | Más tecnología significa más que pagar y más que mantener. Agrego una capa cuando tu negocio la necesita, no antes. | More technology means more to pay for and more to maintain. I add a layer when your business needs it, not before. |

## Arquitectura: tipos de sistema (pestañas)

| Id | Español | English |
|---|---|---|
| `web` | Aplicaciones web | Web applications |
| `saas` | Plataformas SaaS | SaaS platforms |
| `pos-cloud` | POS: en la nube | POS: cloud |
| `pos-local` | POS: local | POS: local |
| `pos-hybrid` | POS: híbrido | POS: hybrid |
| `api` | APIs e integraciones | APIs & integrations |
| `mobile` | Móvil y escritorio | Mobile & desktop |

## Arquitectura: bandas

| Id | Español | English |
|---|---|---|
| `frontend` | Frontend | Frontend |
| `application` | Aplicación | Application |
| `data` | Datos | Data |
| `optional` | Se agrega cuando hace falta | Add when needed |
| `people` | Personas | People |
| `platform` | Plataforma | Platform |
| `backend` | Backend | Backend |
| `interface` | Interfaz | Interface |
| `cloud` | En la nube | In the cloud |
| `premises` | En el local | On the premises |
| `between` | Entre ambos | Between both |
| `sources` | Orígenes | Sources |
| `entry` | Entrada | Entry |
| `processing` | Procesamiento | Processing |
| `on-device` | En el dispositivo | On the device |
| `device` | Dispositivo | Device |
| `api` | API | API |

## Arquitectura: piezas

12 de las 42 son tecnologías (P-28): su nombre es igual en los dos idiomas.

| Id | Español | English |
|---|---|---|
| `next` · tecnología | **Next.js.** Muestra las páginas con rapidez y también puede ejecutar la parte del servidor, así los proyectos pequeños necesitan menos infraestructura. | **Next.js.** Renders pages quickly and can run the server side too, so smaller projects need less infrastructure. |
| `react` · tecnología | **React.** Construye la interfaz con piezas reutilizables, para que las pantallas sigan siendo coherentes a medida que el producto crece. | **React.** Builds the interface from reusable pieces, so screens stay consistent as the product grows. |
| `ts` · tecnología | **TypeScript.** Detecta muchos errores antes de que el código se ejecute, lo que hace más seguro cambiar el sistema. | **TypeScript.** Catches many mistakes before the code runs, which keeps the system safer to change. |
| `actions` · tecnología | **Server Actions.** Permiten que un formulario hable directamente con el servidor; sirven para acciones que ocurren dentro de la propia aplicación. | **Server Actions.** Let a form talk directly to the server, which suits actions that happen inside the app itself. |
| `apis` | **APIs.** Una forma definida de que otras aplicaciones y servicios hablen con tu sistema. | **APIs.** A defined way for other apps and services to talk to your system. |
| `logic` | **Lógica de negocio.** Tus reglas, como precios, permisos y aprobaciones, reunidas en un solo lugar, en el servidor. | **Business logic.** Your rules, such as prices, permissions and approvals, kept in one place on the server. |
| `prisma` · tecnología | **Prisma.** Conecta el código con la base de datos y deja registro de cada cambio en su estructura. | **Prisma.** Connects the code to the database and keeps every change to its structure on record. |
| `pg` · tecnología | **PostgreSQL.** Una base de datos confiable. Aquí se guardan las ventas, los clientes y el inventario. | **PostgreSQL.** A dependable database. This is where sales, customers and stock are stored. |
| `redis` · tecnología | **Redis.** Almacenamiento temporal muy rápido para cachés y colas. Es opcional: se agrega solo cuando el proyecto lo requiere. | **Redis.** Very fast temporary storage for caches and queues, added only when speed or background work calls for it. |
| `storage` | **Almacenamiento de objetos.** Guarda archivos, como imágenes y documentos, fuera de la base de datos. | **Object storage.** Keeps files such as images and documents outside the database. |
| `auth` | **Autenticación.** Confirma quién inicia sesión. Lo que puede hacer se comprueba después en el servidor, en cada acción. | **Authentication.** Confirms who is signing in. What they can do is then checked on the server for every action. |
| `monitor` | **Monitoreo.** Capa de la arquitectura que registra errores y datos de rendimiento. Se agrega cuando un sistema la necesita. | **Monitoring.** A layer of the architecture that records errors and performance data. It is added when a system needs it. |
| `cloud` | **Servicios en la nube.** Alojamiento y servicios administrados, elegidos para cubrir las necesidades de hoy sin costos mensuales innecesarios. | **Cloud services.** Managed hosting and services, chosen to cover today’s needs without unnecessary monthly costs. |
| `admins` | **Administradores.** Las personas que configuran la plataforma para su propia organización. | **Administrators.** The people who configure the platform for their own organization. |
| `team` | **Miembros del equipo.** El personal que usa la plataforma todos los días, cada quien con sus propios permisos. | **Team members.** Staff who use the platform every day, each with their own permissions. |
| `nest` · tecnología | **NestJS.** Un backend estructurado para sistemas complejos con muchos módulos. | **NestJS.** A structured backend for complex systems with many modules. |
| `express` · tecnología | **Express.** Un servidor ligero para APIs independientes de complejidad moderada. | **Express.** A lightweight server for standalone APIs of moderate complexity. |
| `tenant` | **Aislamiento entre clientes.** Mantiene separados los datos de cada cliente, de modo que una empresa nunca pueda ver los de otra. | **Client isolation.** Keeps each client’s data apart, so one company can never see another’s. |
| `roles` | **Roles y permisos.** Define lo que cada persona puede ver y hacer. | **Roles & permissions.** Defines what each person may see and do. |
| `jobs` | **Tareas en segundo plano.** Ejecutan las tareas lentas, como reportes y correos, sin hacer esperar a nadie. | **Background jobs.** Run slow tasks, such as reports and emails, without making anyone wait. |
| `ui` | **Interfaz.** Diseñada para el equipo del cliente: pantalla táctil, teclado y ratón, o ambos. | **Interface.** Designed for the client’s equipment: touchscreen, keyboard and mouse, or both. |
| `electron` · tecnología | **Electron.** Empaqueta el software como un programa de escritorio cuando un proyecto lo necesita. | **Electron.** Packages the software as a desktop program when a project needs one. |
| `lan` | **Servidor local.** Ejecuta el sistema dentro del negocio, en su propia red interna. | **Local server.** Runs the system inside the business, on its own internal network. |
| `lanbk` | **Respaldos locales.** Copias de los datos guardadas en la infraestructura del propio cliente. | **Local backups.** Copies of the data kept on the client’s own infrastructure. |
| `rules` | **Reglas de negocio.** Precios, inventario y permisos, aplicados siempre de la misma manera. | **Business rules.** Prices, stock and permissions, applied the same way every time. |
| `sqlite` | **Base de datos local.** Guarda los registros en las instalaciones del cliente, cuando la arquitectura lo requiere. | **Local database.** Stores records on the client’s premises, when the architecture calls for it. |
| `totp` | **Autorización remota.** Opcional. Un código de corta duración aprueba una acción delicada, cuando el diseño lo incluye. | **Remote authorization.** Optional. A short-lived code approves a sensitive action, when the design includes it. |
| `sync` | **Sincronización.** Mueve los datos entre los sistemas locales y la nube, en los diseños híbridos que lo necesitan. | **Synchronization.** Moves data between local and cloud systems, in the hybrid designs that need it. |
| `remote` | **Gestión remota.** Permite que las personas autorizadas revisen el negocio desde otro lugar, cuando la arquitectura lo permite. | **Remote management.** Lets authorized people review the business from elsewhere, when the architecture allows it. |
| `store` | **Tienda en línea.** Donde empieza la mayoría de los pedidos. | **Online store.** Where most orders begin. |
| `partners` | **Servicios externos.** Pagos, envíos y otros proveedores de los que depende tu negocio. | **External services.** Payment, shipping and other providers your business depends on. |
| `hooks` | **Webhooks.** Mensajes que un servicio envía en el momento en que algo ocurre, como un pedido nuevo. | **Webhooks.** Messages a service sends the moment something happens, such as a new order. |
| `valid` | **Validación.** Revisa cada solicitud entrante antes de procesar cualquier cosa. | **Validation.** Checks every incoming request before anything is processed. |
| `limit` | **Límites de solicitudes.** Ponen un tope a las solicitudes, para que una falla o un ataque no sature el sistema. | **Rate limits.** Cap requests, so a fault or an attack can’t overwhelm the system. |
| `idem` | **Protección contra duplicados.** Se asegura de que un mensaje repetido no cree un segundo pedido. | **Duplicate protection.** Makes sure a repeated message doesn’t create a second order. |
| `queue` | **Cola.** Mantiene el trabajo en fila, para que una ráfaga de pedidos se procese con seguridad. | **Queue.** Holds work in line, so a burst of orders is processed safely. |
| `logs` | **Registro de eventos.** Un registro de lo que pasó con cada solicitud, para soporte y auditoría. | **Event log.** A record of what happened to each request, for support and auditing. |
| `rn` · tecnología | **React Native.** Crea aplicaciones para iOS y Android a partir de una sola base de código. | **React Native.** Builds iOS and Android apps from one codebase. |
| `expo` · tecnología | **Expo.** Simplifica la compilación, la actualización y la publicación de aplicaciones móviles. | **Expo.** Simplifies building, updating and publishing mobile apps. |
| `secure` | **Almacenamiento seguro.** Guarda los tokens de inicio de sesión en el almacenamiento protegido del teléfono. | **Secure storage.** Keeps sign-in tokens in the phone’s protected storage. |
| `offline` | **Caché sin conexión.** Mantiene disponibles los datos recientes cuando la señal es débil. | **Offline cache.** Keeps recent data available when the signal is weak. |
| `push` | **Notificaciones push.** Llegan a las personas en su teléfono cuando algo necesita atención. | **Push notifications.** Reach people on their phone when something needs attention. |
