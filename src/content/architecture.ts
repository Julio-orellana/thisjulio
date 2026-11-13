import type { ContentInput } from './schema';

/**
 * Arquitectura (`Technology.dc.html`): los tipos de sistema, sus bandas y las
 * piezas de cada una. Estructura y textos en inglés del artboard; español
 * redactado. Todo en borrador (`copy: 'draft'`, P-22).
 *
 * P-28 (decisión de Julio, 2026-11-13, opción A completa): se muestran las 12
 * tecnologías del artboard (`technology: true`) y «Monitoring», con estas
 * condiciones, que el esquema y `tests/unit/architecture.test.ts` vigilan:
 * - «Monitoring» es una capa de la arquitectura de un sistema: su texto no
 *   promete monitoreo continuo, cobertura, alertas ni tiempos de respuesta (el
 *   del artboard sí lo hacía y se sustituyó);
 * - Redis es opcional, «cuando el proyecto lo requiere»;
 * - Electron es una tecnología general: sin cliente ni caso POS (P-19).
 *
 * El artboard define además un nodo «Browser» que ninguna pestaña usa: no se
 * traslada.
 */
export const architecture = {
  nodes: [
    {
      id: 'next',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'Next.js', text: 'Muestra las páginas con rapidez y también puede ejecutar la parte del servidor, así los proyectos pequeños necesitan menos infraestructura.' },
        en: { label: 'Next.js', text: 'Renders pages quickly and can run the server side too, so smaller projects need less infrastructure.' },
      },
    },
    {
      id: 'react',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'React', text: 'Construye la interfaz con piezas reutilizables, para que las pantallas sigan siendo coherentes a medida que el producto crece.' },
        en: { label: 'React', text: 'Builds the interface from reusable pieces, so screens stay consistent as the product grows.' },
      },
    },
    {
      id: 'ts',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'TypeScript', text: 'Detecta muchos errores antes de que el código se ejecute, lo que hace más seguro cambiar el sistema.' },
        en: { label: 'TypeScript', text: 'Catches many mistakes before the code runs, which keeps the system safer to change.' },
      },
    },
    {
      id: 'actions',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'Server Actions', text: 'Permiten que un formulario hable directamente con el servidor; sirven para acciones que ocurren dentro de la propia aplicación.' },
        en: { label: 'Server Actions', text: 'Let a form talk directly to the server, which suits actions that happen inside the app itself.' },
      },
    },
    {
      id: 'apis',
      text: {
        copy: 'draft',
        es: { label: 'APIs', text: 'Una forma definida de que otras aplicaciones y servicios hablen con tu sistema.' },
        en: { label: 'APIs', text: 'A defined way for other apps and services to talk to your system.' },
      },
    },
    {
      id: 'logic',
      text: {
        copy: 'draft',
        es: { label: 'Lógica de negocio', text: 'Tus reglas, como precios, permisos y aprobaciones, reunidas en un solo lugar, en el servidor.' },
        en: { label: 'Business logic', text: 'Your rules, such as prices, permissions and approvals, kept in one place on the server.' },
      },
    },
    {
      id: 'prisma',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'Prisma', text: 'Conecta el código con la base de datos y deja registro de cada cambio en su estructura.' },
        en: { label: 'Prisma', text: 'Connects the code to the database and keeps every change to its structure on record.' },
      },
    },
    {
      id: 'pg',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'PostgreSQL', text: 'Una base de datos confiable. Aquí se guardan las ventas, los clientes y el inventario.' },
        en: { label: 'PostgreSQL', text: 'A dependable database. This is where sales, customers and stock are stored.' },
      },
    },
    {
      id: 'redis',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'Redis', text: 'Almacenamiento temporal muy rápido para cachés y colas. Es opcional: se agrega solo cuando el proyecto lo requiere.' },
        en: { label: 'Redis', text: 'Very fast temporary storage for caches and queues, added only when speed or background work calls for it.' },
      },
    },
    {
      id: 'storage',
      text: {
        copy: 'draft',
        es: { label: 'Almacenamiento de objetos', text: 'Guarda archivos, como imágenes y documentos, fuera de la base de datos.' },
        en: { label: 'Object storage', text: 'Keeps files such as images and documents outside the database.' },
      },
    },
    {
      id: 'auth',
      text: {
        copy: 'draft',
        es: { label: 'Autenticación', text: 'Confirma quién inicia sesión. Lo que puede hacer se comprueba después en el servidor, en cada acción.' },
        en: { label: 'Authentication', text: 'Confirms who is signing in. What they can do is then checked on the server for every action.' },
      },
    },
    {
      id: 'monitor',
      text: {
        copy: 'draft',
        es: { label: 'Monitoreo', text: 'Capa de la arquitectura que registra errores y datos de rendimiento. Se agrega cuando un sistema la necesita.' },
        en: { label: 'Monitoring', text: 'A layer of the architecture that records errors and performance data. It is added when a system needs it.' },
      },
    },
    {
      id: 'cloud',
      text: {
        copy: 'draft',
        es: { label: 'Servicios en la nube', text: 'Alojamiento y servicios administrados, elegidos para cubrir las necesidades de hoy sin costos mensuales innecesarios.' },
        en: { label: 'Cloud services', text: 'Managed hosting and services, chosen to cover today’s needs without unnecessary monthly costs.' },
      },
    },
    {
      id: 'admins',
      text: {
        copy: 'draft',
        es: { label: 'Administradores', text: 'Las personas que configuran la plataforma para su propia organización.' },
        en: { label: 'Administrators', text: 'The people who configure the platform for their own organization.' },
      },
    },
    {
      id: 'team',
      text: {
        copy: 'draft',
        es: { label: 'Miembros del equipo', text: 'El personal que usa la plataforma todos los días, cada quien con sus propios permisos.' },
        en: { label: 'Team members', text: 'Staff who use the platform every day, each with their own permissions.' },
      },
    },
    {
      id: 'nest',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'NestJS', text: 'Un backend estructurado para sistemas complejos con muchos módulos.' },
        en: { label: 'NestJS', text: 'A structured backend for complex systems with many modules.' },
      },
    },
    {
      id: 'express',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'Express', text: 'Un servidor ligero para APIs independientes de complejidad moderada.' },
        en: { label: 'Express', text: 'A lightweight server for standalone APIs of moderate complexity.' },
      },
    },
    {
      id: 'tenant',
      text: {
        copy: 'draft',
        es: { label: 'Aislamiento entre clientes', text: 'Mantiene separados los datos de cada cliente, de modo que una empresa nunca pueda ver los de otra.' },
        en: { label: 'Client isolation', text: 'Keeps each client’s data apart, so one company can never see another’s.' },
      },
    },
    {
      id: 'roles',
      text: {
        copy: 'draft',
        es: { label: 'Roles y permisos', text: 'Define lo que cada persona puede ver y hacer.' },
        en: { label: 'Roles & permissions', text: 'Defines what each person may see and do.' },
      },
    },
    {
      id: 'jobs',
      text: {
        copy: 'draft',
        es: { label: 'Tareas en segundo plano', text: 'Ejecutan las tareas lentas, como reportes y correos, sin hacer esperar a nadie.' },
        en: { label: 'Background jobs', text: 'Run slow tasks, such as reports and emails, without making anyone wait.' },
      },
    },
    {
      id: 'ui',
      text: {
        copy: 'draft',
        es: { label: 'Interfaz', text: 'Diseñada para el equipo del cliente: pantalla táctil, teclado y ratón, o ambos.' },
        en: { label: 'Interface', text: 'Designed for the client’s equipment: touchscreen, keyboard and mouse, or both.' },
      },
    },
    {
      id: 'electron',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'Electron', text: 'Empaqueta el software como un programa de escritorio cuando un proyecto lo necesita.' },
        en: { label: 'Electron', text: 'Packages the software as a desktop program when a project needs one.' },
      },
    },
    {
      id: 'lan',
      text: {
        copy: 'draft',
        es: { label: 'Servidor local', text: 'Ejecuta el sistema dentro del negocio, en su propia red interna.' },
        en: { label: 'Local server', text: 'Runs the system inside the business, on its own internal network.' },
      },
    },
    {
      id: 'lanbk',
      text: {
        copy: 'draft',
        es: { label: 'Respaldos locales', text: 'Copias de los datos guardadas en la infraestructura del propio cliente.' },
        en: { label: 'Local backups', text: 'Copies of the data kept on the client’s own infrastructure.' },
      },
    },
    {
      id: 'rules',
      text: {
        copy: 'draft',
        es: { label: 'Reglas de negocio', text: 'Precios, inventario y permisos, aplicados siempre de la misma manera.' },
        en: { label: 'Business rules', text: 'Prices, stock and permissions, applied the same way every time.' },
      },
    },
    {
      id: 'sqlite',
      text: {
        copy: 'draft',
        es: { label: 'Base de datos local', text: 'Guarda los registros en las instalaciones del cliente, cuando la arquitectura lo requiere.' },
        en: { label: 'Local database', text: 'Stores records on the client’s premises, when the architecture calls for it.' },
      },
    },
    {
      id: 'totp',
      text: {
        copy: 'draft',
        es: { label: 'Autorización remota', text: 'Opcional. Un código de corta duración aprueba una acción delicada, cuando el diseño lo incluye.' },
        en: { label: 'Remote authorization', text: 'Optional. A short-lived code approves a sensitive action, when the design includes it.' },
      },
    },
    {
      id: 'sync',
      text: {
        copy: 'draft',
        es: { label: 'Sincronización', text: 'Mueve los datos entre los sistemas locales y la nube, en los diseños híbridos que lo necesitan.' },
        en: { label: 'Synchronization', text: 'Moves data between local and cloud systems, in the hybrid designs that need it.' },
      },
    },
    {
      id: 'remote',
      text: {
        copy: 'draft',
        es: { label: 'Gestión remota', text: 'Permite que las personas autorizadas revisen el negocio desde otro lugar, cuando la arquitectura lo permite.' },
        en: { label: 'Remote management', text: 'Lets authorized people review the business from elsewhere, when the architecture allows it.' },
      },
    },
    {
      id: 'store',
      text: {
        copy: 'draft',
        es: { label: 'Tienda en línea', text: 'Donde empieza la mayoría de los pedidos.' },
        en: { label: 'Online store', text: 'Where most orders begin.' },
      },
    },
    {
      id: 'partners',
      text: {
        copy: 'draft',
        es: { label: 'Servicios externos', text: 'Pagos, envíos y otros proveedores de los que depende tu negocio.' },
        en: { label: 'External services', text: 'Payment, shipping and other providers your business depends on.' },
      },
    },
    {
      id: 'hooks',
      text: {
        copy: 'draft',
        es: { label: 'Webhooks', text: 'Mensajes que un servicio envía en el momento en que algo ocurre, como un pedido nuevo.' },
        en: { label: 'Webhooks', text: 'Messages a service sends the moment something happens, such as a new order.' },
      },
    },
    {
      id: 'valid',
      text: {
        copy: 'draft',
        es: { label: 'Validación', text: 'Revisa cada solicitud entrante antes de procesar cualquier cosa.' },
        en: { label: 'Validation', text: 'Checks every incoming request before anything is processed.' },
      },
    },
    {
      id: 'limit',
      text: {
        copy: 'draft',
        es: { label: 'Límites de solicitudes', text: 'Ponen un tope a las solicitudes, para que una falla o un ataque no sature el sistema.' },
        en: { label: 'Rate limits', text: 'Cap requests, so a fault or an attack can’t overwhelm the system.' },
      },
    },
    {
      id: 'idem',
      text: {
        copy: 'draft',
        es: { label: 'Protección contra duplicados', text: 'Se asegura de que un mensaje repetido no cree un segundo pedido.' },
        en: { label: 'Duplicate protection', text: 'Makes sure a repeated message doesn’t create a second order.' },
      },
    },
    {
      id: 'queue',
      text: {
        copy: 'draft',
        es: { label: 'Cola', text: 'Mantiene el trabajo en fila, para que una ráfaga de pedidos se procese con seguridad.' },
        en: { label: 'Queue', text: 'Holds work in line, so a burst of orders is processed safely.' },
      },
    },
    {
      id: 'logs',
      text: {
        copy: 'draft',
        es: { label: 'Registro de eventos', text: 'Un registro de lo que pasó con cada solicitud, para soporte y auditoría.' },
        en: { label: 'Event log', text: 'A record of what happened to each request, for support and auditing.' },
      },
    },
    {
      id: 'rn',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'React Native', text: 'Crea aplicaciones para iOS y Android a partir de una sola base de código.' },
        en: { label: 'React Native', text: 'Builds iOS and Android apps from one codebase.' },
      },
    },
    {
      id: 'expo',
      technology: true,
      text: {
        copy: 'draft',
        es: { label: 'Expo', text: 'Simplifica la compilación, la actualización y la publicación de aplicaciones móviles.' },
        en: { label: 'Expo', text: 'Simplifies building, updating and publishing mobile apps.' },
      },
    },
    {
      id: 'secure',
      text: {
        copy: 'draft',
        es: { label: 'Almacenamiento seguro', text: 'Guarda los tokens de inicio de sesión en el almacenamiento protegido del teléfono.' },
        en: { label: 'Secure storage', text: 'Keeps sign-in tokens in the phone’s protected storage.' },
      },
    },
    {
      id: 'offline',
      text: {
        copy: 'draft',
        es: { label: 'Caché sin conexión', text: 'Mantiene disponibles los datos recientes cuando la señal es débil.' },
        en: { label: 'Offline cache', text: 'Keeps recent data available when the signal is weak.' },
      },
    },
    {
      id: 'push',
      text: {
        copy: 'draft',
        es: { label: 'Notificaciones push', text: 'Llegan a las personas en su teléfono cuando algo necesita atención.' },
        en: { label: 'Push notifications', text: 'Reach people on their phone when something needs attention.' },
      },
    },
  ],
  bands: [
    { id: 'frontend', label: { copy: 'draft', es: 'Frontend', en: 'Frontend' } },
    { id: 'application', label: { copy: 'draft', es: 'Aplicación', en: 'Application' } },
    { id: 'data', label: { copy: 'draft', es: 'Datos', en: 'Data' } },
    { id: 'optional', label: { copy: 'draft', es: 'Se agrega cuando hace falta', en: 'Add when needed' } },
    { id: 'people', label: { copy: 'draft', es: 'Personas', en: 'People' } },
    { id: 'platform', label: { copy: 'draft', es: 'Plataforma', en: 'Platform' } },
    { id: 'backend', label: { copy: 'draft', es: 'Backend', en: 'Backend' } },
    { id: 'interface', label: { copy: 'draft', es: 'Interfaz', en: 'Interface' } },
    { id: 'cloud', label: { copy: 'draft', es: 'En la nube', en: 'In the cloud' } },
    { id: 'premises', label: { copy: 'draft', es: 'En el local', en: 'On the premises' } },
    { id: 'between', label: { copy: 'draft', es: 'Entre ambos', en: 'Between both' } },
    { id: 'sources', label: { copy: 'draft', es: 'Orígenes', en: 'Sources' } },
    { id: 'entry', label: { copy: 'draft', es: 'Entrada', en: 'Entry' } },
    { id: 'processing', label: { copy: 'draft', es: 'Procesamiento', en: 'Processing' } },
    { id: 'on-device', label: { copy: 'draft', es: 'En el dispositivo', en: 'On the device' } },
    { id: 'device', label: { copy: 'draft', es: 'Dispositivo', en: 'Device' } },
    { id: 'api', label: { copy: 'draft', es: 'API', en: 'API' } },
  ],
  /** Capa de `Plates stack` que resalta el inspector: 0 Interfaz … 3 Infraestructura. */
  systems: [
    {
      id: 'web',
      label: { copy: 'draft', es: 'Aplicaciones web', en: 'Web applications' },
      bands: [
        { band: 'frontend', layer: 0, optional: false, nodes: ['next', 'react', 'ts'] },
        { band: 'application', layer: 1, optional: false, nodes: ['actions', 'apis', 'logic'] },
        { band: 'data', layer: 2, optional: false, nodes: ['prisma', 'pg'] },
        { band: 'optional', layer: 3, optional: true, nodes: ['redis', 'storage', 'auth', 'monitor', 'cloud'] },
      ],
    },
    {
      id: 'saas',
      label: { copy: 'draft', es: 'Plataformas SaaS', en: 'SaaS platforms' },
      bands: [
        { band: 'people', layer: 0, optional: false, nodes: ['admins', 'team'] },
        { band: 'frontend', layer: 0, optional: false, nodes: ['next', 'react', 'ts'] },
        { band: 'platform', layer: 1, optional: false, nodes: ['auth', 'roles', 'tenant'] },
        { band: 'backend', layer: 1, optional: false, nodes: ['nest', 'logic'] },
        { band: 'data', layer: 2, optional: false, nodes: ['prisma', 'pg'] },
        { band: 'optional', layer: 3, optional: true, nodes: ['redis', 'jobs', 'storage', 'monitor'] },
      ],
    },
    {
      id: 'pos-cloud',
      label: { copy: 'draft', es: 'POS: en la nube', en: 'POS: cloud' },
      bands: [
        { band: 'interface', layer: 0, optional: false, nodes: ['ui'] },
        { band: 'cloud', layer: 1, optional: false, nodes: ['apis', 'rules'] },
        { band: 'data', layer: 2, optional: false, nodes: ['pg'] },
        { band: 'optional', layer: 3, optional: true, nodes: ['remote', 'monitor', 'totp'] },
      ],
    },
    {
      id: 'pos-local',
      label: { copy: 'draft', es: 'POS: local', en: 'POS: local' },
      bands: [
        { band: 'interface', layer: 0, optional: false, nodes: ['ui', 'electron'] },
        { band: 'premises', layer: 1, optional: false, nodes: ['rules', 'lan'] },
        { band: 'data', layer: 2, optional: false, nodes: ['sqlite'] },
        { band: 'optional', layer: 3, optional: true, nodes: ['lanbk', 'totp'] },
      ],
    },
    {
      id: 'pos-hybrid',
      label: { copy: 'draft', es: 'POS: híbrido', en: 'POS: hybrid' },
      bands: [
        { band: 'interface', layer: 0, optional: false, nodes: ['ui', 'electron'] },
        { band: 'premises', layer: 1, optional: false, nodes: ['rules', 'sqlite'] },
        { band: 'between', layer: 2, optional: false, nodes: ['sync'] },
        { band: 'cloud', layer: 2, optional: false, nodes: ['apis', 'pg'] },
        { band: 'optional', layer: 3, optional: true, nodes: ['remote', 'monitor', 'totp'] },
      ],
    },
    {
      id: 'api',
      label: { copy: 'draft', es: 'APIs e integraciones', en: 'APIs & integrations' },
      bands: [
        { band: 'sources', layer: 0, optional: false, nodes: ['store', 'partners', 'hooks'] },
        { band: 'entry', layer: 1, optional: false, nodes: ['express', 'auth', 'valid', 'limit'] },
        { band: 'processing', layer: 1, optional: false, nodes: ['logic', 'idem'] },
        { band: 'data', layer: 2, optional: false, nodes: ['pg', 'logs'] },
        { band: 'optional', layer: 3, optional: true, nodes: ['queue', 'jobs', 'monitor'] },
      ],
    },
    {
      id: 'mobile',
      label: { copy: 'draft', es: 'Móvil y escritorio', en: 'Mobile & desktop' },
      bands: [
        { band: 'on-device', layer: 0, optional: false, nodes: ['rn', 'expo', 'electron', 'ts'] },
        { band: 'device', layer: 0, optional: false, nodes: ['secure', 'offline'] },
        { band: 'api', layer: 1, optional: false, nodes: ['apis', 'auth', 'logic'] },
        { band: 'data', layer: 2, optional: false, nodes: ['prisma', 'pg'] },
        { band: 'optional', layer: 3, optional: true, nodes: ['push', 'storage', 'monitor'] },
      ],
    },
  ],
} satisfies ContentInput['architecture'];
