import type { ContentInput } from './schema';

/**
 * Los siete servicios aprobados (spec/constitution/mission.md §4).
 *
 * - Títulos en español: los nombres oficiales. El inglés sale de
 *   `Services.dc.html` y `Main.dc.html`, ajustado a esos nombres (D-03):
 *   05 «Process Automation», 07 «Support and Maintenance» (D-02).
 * - Servicio 07: sin «24/7», sin SLA, sin tiempos de respuesta; sin el renglón
 *   «Monitoreo, según el plan de servicio» ni la nota de cobertura (P-22, DA-6).
 *   Del texto del diseño se quitó «and monitoring», sin añadir nada.
 * - Slugs: propuesta de `plan.md` §3 (P-21: ruta por servicio aprobada; los
 *   slugs concretos siguen como propuesta documentada).
 * - Todo `copy: 'draft'` hasta que Julio apruebe los textos (P-04, P-22).
 */
export const services = [
  {
    id: 'custom',
    order: 1,
    slugs: { es: 'desarrollo-a-la-medida', en: 'custom-software' },
    deploy: false,
    text: {
      copy: 'draft',
      es: {
        short: 'Software a la medida',
        title: 'Desarrollo de software a la medida',
        line: 'Software que parte de cómo ya trabaja tu negocio.',
        value: 'Software hecho a partir de cómo ya trabaja tu negocio, para que tu equipo deje de rodear sus herramientas.',
        fit: 'las hojas de cálculo o las herramientas genéricas ya no se ajustan a tu forma de operar.',
        gets: [
          'Un sistema construido alrededor de tu proceso',
          'Documentación escrita de qué se construyó y por qué',
          'Control de acceso y seguridad desde la primera versión',
        ],
      },
      en: {
        short: 'Custom Software',
        title: 'Custom Software Development',
        line: 'Software shaped around how your business already works.',
        value: 'Software shaped around how your business already works, so your team stops working around its tools.',
        fit: 'spreadsheets or off-the-shelf tools no longer match how you operate.',
        gets: [
          'A system built around your process',
          'Written documentation of what was built and why',
          'Access control and security from the first version',
        ],
      },
    },
  },
  {
    id: 'web',
    order: 2,
    slugs: { es: 'aplicaciones-web', en: 'web-applications' },
    deploy: false,
    text: {
      copy: 'draft',
      es: {
        short: 'Aplicaciones web y plataformas',
        title: 'Aplicaciones web y plataformas',
        line: 'Portales, herramientas internas y SaaS que tu equipo usa desde cualquier lugar.',
        value: 'Portales, herramientas internas y productos SaaS que tus clientes y tu equipo abren desde cualquier dispositivo.',
        fit: 'personas en distintos lugares necesitan trabajar con la misma información.',
        gets: [
          'Portales para clientes y herramientas internas',
          'Paneles administrativos',
          'Plataformas SaaS con datos separados para cada cliente',
        ],
      },
      en: {
        short: 'Web Applications & Platforms',
        title: 'Web Applications & Platforms',
        line: 'Portals, internal tools and SaaS your team can use from anywhere.',
        value: 'Portals, internal tools and SaaS products that your customers and team can open from any device.',
        fit: 'people in different places need to work from the same information.',
        gets: ['Customer portals and internal tools', 'Administrative dashboards', 'SaaS platforms with separate data for each client'],
      },
    },
  },
  {
    id: 'apps',
    order: 3,
    slugs: { es: 'aplicaciones-moviles-y-escritorio', en: 'mobile-and-desktop-apps' },
    deploy: false,
    text: {
      copy: 'draft',
      es: {
        short: 'Aplicaciones móviles y de escritorio',
        title: 'Aplicaciones móviles y de escritorio',
        line: 'Aplicaciones adaptadas a tus dispositivos, sistemas y flujos de trabajo diarios.',
        value: 'Aplicaciones adaptadas a los dispositivos, sistemas operativos y flujos de trabajo que tu negocio usa de verdad.',
        fit: 'tu equipo o tus clientes necesitan más que un sitio web: una aplicación en el teléfono, la tableta o la computadora.',
        gets: [
          'Aplicaciones móviles para teléfonos y tabletas',
          'Aplicaciones de escritorio para tus computadoras',
          'Pantallas adaptadas a cada dispositivo y tarea',
        ],
      },
      en: {
        short: 'Mobile & Desktop Applications',
        title: 'Mobile & Desktop Applications',
        line: 'Apps adapted to your devices, systems and daily workflows.',
        value: 'Applications adapted to the devices, operating systems and workflows your business actually uses.',
        fit: 'your team or customers need more than a website: an app on their phone, tablet or computer.',
        gets: ['Mobile apps for phones and tablets', 'Desktop applications for your computers', 'Screens adapted to each device and task'],
      },
    },
  },
  {
    id: 'shopify',
    order: 4,
    slugs: { es: 'ecommerce-y-shopify', en: 'ecommerce-and-shopify' },
    deploy: false,
    text: {
      copy: 'draft',
      es: {
        short: 'E-commerce y Shopify',
        title: 'E-commerce y Shopify',
        line: 'Tiendas fáciles de administrar, con cada cuenta a tu nombre.',
        value: 'Una tienda sencilla de administrar y fácil para comprar, con todo registrado a tu nombre.',
        fit: 'quieres vender en línea sin construir una plataforma desde cero.',
        gets: [
          'Diseño y configuración de la tienda en Shopify',
          'Integración de pagos, envíos y aplicaciones',
          'Proceso de compra probado de principio a fin antes del lanzamiento',
        ],
      },
      en: {
        short: 'E-commerce & Shopify',
        title: 'E-commerce & Shopify',
        line: 'Stores that are simple to run, with every account in your name.',
        value: 'A store that is straightforward to run and easy to buy from, with everything registered in your name.',
        fit: 'you want to sell online without building a platform from scratch.',
        gets: ['Store design and setup on Shopify', 'Payments, shipping and app integrations', 'Checkout tested end to end before launch'],
      },
    },
  },
  {
    id: 'apis',
    order: 5,
    slugs: { es: 'apis-y-automatizacion', en: 'apis-and-automation' },
    deploy: false,
    text: {
      copy: 'draft',
      es: {
        short: 'APIs y automatización',
        title: 'APIs y automatización de procesos',
        line: 'Tus herramientas conectadas, para que nadie vuelva a escribir el mismo pedido.',
        value: 'Conecta las herramientas que ya usas, para que los pedidos y los datos se muevan solos en lugar de escribirse dos veces.',
        fit: 'alguien de tu equipo copia la misma información entre sistemas.',
        gets: ['APIs para tus propios sistemas', 'Integraciones con servicios externos', 'Automatización de pasos repetitivos'],
      },
      en: {
        short: 'APIs & Process Automation',
        title: 'APIs & Process Automation',
        line: 'Your tools connected, so nobody re-types the same order twice.',
        value: 'Connect the tools you already use, so orders and data move on their own instead of being typed twice.',
        fit: 'someone on your team copies the same information between systems.',
        gets: ['APIs for your own systems', 'Integrations with external services', 'Automation of repetitive steps'],
      },
    },
  },
  {
    id: 'pos',
    order: 6,
    slugs: { es: 'sistemas-pos', en: 'pos-systems' },
    deploy: true,
    text: {
      copy: 'draft',
      es: {
        short: 'POS y gestión de negocios',
        title: 'Sistemas POS y gestión de negocios',
        line: 'Hechos a partir de cómo tu negocio vende, controla y opera.',
        value: 'Soluciones de punto de venta y gestión de negocios hechas a la medida, diseñadas a partir de cómo opera cada negocio.',
        fit: 'los sistemas genéricos obligan a tu negocio a cambiar su forma de vender, controlar o llevar su operación.',
        gets: [
          'Una interfaz adecuada a tus equipos y dispositivos',
          'Despliegue en la nube, local o híbrido, elegido para cada proyecto',
          'Módulos definidos por tu operación',
        ],
      },
      en: {
        short: 'POS & Business Management',
        title: 'POS & Business Management Systems',
        line: 'Built around how your business sells, tracks and operates.',
        value: 'Custom-built point-of-sale and business management solutions designed around the way each business operates.',
        fit: 'generic systems force your business to change how it sells, tracks or controls its operation.',
        gets: ['An interface suited to your equipment', 'Cloud, local or hybrid deployment, selected per project', 'Modules defined by your operation'],
      },
    },
  },
  {
    id: 'support',
    order: 7,
    slugs: { es: 'soporte-y-mantenimiento', en: 'support-and-maintenance' },
    deploy: false,
    text: {
      copy: 'draft',
      es: {
        short: 'Soporte y mantenimiento',
        title: 'Soporte y mantenimiento',
        line: 'Cuidado continuo de tus sistemas, bajo un acuerdo de servicio definido.',
        value: 'Soporte técnico, mantenimiento y resolución de problemas continuos que mantienen tus sistemas funcionando después del lanzamiento.',
        fit: 'tienes un sistema en marcha y nadie que lo cuide.',
        gets: ['Mantenimiento y actualizaciones de seguridad', 'Resolución de problemas y asistencia técnica'],
      },
      en: {
        short: 'Support and Maintenance',
        title: 'Support and Maintenance',
        line: 'Ongoing care for your systems, under a defined service agreement.',
        value: 'Ongoing technical support, maintenance and troubleshooting that keep your systems working after launch.',
        fit: 'you have a system running and nobody looking after it.',
        gets: ['Maintenance and security updates', 'Troubleshooting and technical assistance'],
      },
    },
  },
] satisfies ContentInput['services'];
