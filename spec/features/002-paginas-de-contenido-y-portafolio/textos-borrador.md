# Textos en borrador de la Feature 002 (para revisión de Julio, P-22)

Generado del código el 2026-11-12 (`src/content` y `src/messages`). **34 de 34 bloques en `draft`.** Nada de esto está aprobado; el inglés sale del diseño y el español es redacción nueva.

Para aprobar un bloque: cambiar su `copy` a `'approved'` en `src/content` (o el espacio de nombres en `src/content/messages-copy.ts`).


## Mensajes: home

| Clave | Español | English |
|---|---|---|
| `meta.description` | Software, plataformas y productos digitales construidos con propósito. | Software, platforms and digital products engineered with purpose. |
| `hero.label` | Introducción | Introduction |
| `hero.title` | Experiencias digitales que hacen avanzar a los negocios. | Building digital experiences that move businesses forward. |
| `hero.lead` | Software, plataformas y productos digitales construidos con propósito. | Software, platforms and digital products engineered with purpose. |
| `hero.explore` | Explorar proyectos | Explore projects |
| `hero.start` | Iniciar un proyecto | Start a project |
| `work.title` | <this>This</this> es el trabajo. | <this>This</this> is the work. |
| `work.all` | Ver todos los proyectos | Explore all projects |
| `services.title` | <this>This</this> es lo que puedo construir para ti. | <this>This</this> is what I can build for you. |
| `built.title` | <this>This</this> es cómo se construye. | <this>This</this> is how it's built. |
| `built.link` | Explorar las arquitecturas | Explore the architectures |
| `built.groupLabel` | Capas de la arquitectura | Architecture layers |
| `built.allTag` | 1–4 | All |
| `built.all` | Ver el sistema completo | View the complete system |
| `built.layers.interface.title` | Interfaz | Interface |
| `built.layers.interface.text` | Lo que las personas ven y tocan: aplicaciones web, móviles y de escritorio. | What people see and touch: web, mobile and desktop applications. |
| `built.layers.interface.parts.0` | Aplicaciones web | Web apps |
| `built.layers.interface.parts.1` | Aplicaciones móviles | Mobile apps |
| `built.layers.interface.parts.2` | Aplicaciones de escritorio | Desktop apps |
| `built.layers.interface.link` | Envía cada solicitud a Lógica y muestra la respuesta. | Sends each request to Logic and shows the response. |
| `built.layers.logic.title` | Lógica | Logic |
| `built.layers.logic.text` | Donde el sistema decide: servicios de backend, APIs, reglas de negocio, integraciones y automatización. | Where the system decides: backend services, APIs, business rules, integrations and automation. |
| `built.layers.logic.parts.0` | Servicios | Services |
| `built.layers.logic.parts.1` | APIs | APIs |
| `built.layers.logic.parts.2` | Reglas de negocio | Business rules |
| `built.layers.logic.parts.3` | Automatización | Automation |
| `built.layers.logic.link` | Recibe las solicitudes de Interfaz y lee o escribe a través de Datos. | Receives requests from Interface and reads or writes through Data. |
| `built.layers.data.title` | Datos | Data |
| `built.layers.data.text` | Donde vive la información: almacenamiento de datos, sincronización y gestión de la información. | Where information lives: data storage, synchronization and information management. |
| `built.layers.data.parts.0` | Almacenamiento | Storage |
| `built.layers.data.parts.1` | Sincronización | Sync |
| `built.layers.data.link` | Da servicio a Lógica; Infraestructura lo mantiene a salvo. | Serves Logic and is kept safe by Infrastructure. |
| `built.layers.infrastructure.title` | Infraestructura | Infrastructure |
| `built.layers.infrastructure.text` | Donde todo se ejecuta: entornos en la nube, servidores locales, redes, despliegue y seguridad. | Where everything runs: cloud environments, local servers, networking, deployment and security. |
| `built.layers.infrastructure.parts.0` | Nube | Cloud |
| `built.layers.infrastructure.parts.1` | Servidores locales | Local servers |
| `built.layers.infrastructure.parts.2` | Redes | Networking |
| `built.layers.infrastructure.parts.3` | Seguridad | Security |
| `built.layers.infrastructure.link` | Sostiene y protege cada capa que tiene encima. | Supports and protects every layer above it. |
| `built.layers.system.title` | El sistema completo | The complete system |
| `built.layers.system.text` | Cuatro capas independientes. Cada una hace un trabajo y, juntas, funcionan como un solo producto. | Four independent layers. Each does one job, and together they work as one product. |
| `built.layers.system.parts.0` | Interfaz | Interface |
| `built.layers.system.parts.1` | Lógica | Logic |
| `built.layers.system.parts.2` | Datos | Data |
| `built.layers.system.parts.3` | Infraestructura | Infrastructure |
| `built.layers.system.link` | Elige una capa para ver qué hace y con qué se conecta. | Select a layer to see what it does and what it connects to. |
| `me.title` | <this>This</this> es Julio. | <this>This</this> is Julio. |
| `me.lead` | Soy desarrollador independiente con base en Guatemala. Construyo software de principio a fin y me mantengo cerca del problema de negocio que tiene que resolver. | I'm an independent developer based in Guatemala. I build software end to end and stay close to the business problem it has to solve. |
| `me.text` | Construirlo bien, documentar las decisiones, proteger el sistema y escalar solo cuando el negocio lo necesite. | Build it correctly, document the decisions, protect the system, and scale only when the business needs it. |
| `me.more` | Más sobre mí | More about me |
| `final.title` | ¿Tienes algo que construir? | Have something to build? |
| `final.estimate` | Obtén un estimado rápido | Get a quick estimate |
| `final.estimateText` | Ocho preguntas cortas. | Eight short questions. |
| `final.contact` | Habla directamente conmigo | Talk to me directly |
| `final.contactText` | Cuéntame qué necesitas y te respondo personalmente. | Tell me what you need and I'll reply personally. |

## Mensajes: work

| Clave | Español | English |
|---|---|---|
| `meta.description` | Proyectos de THIS JULIO. | Projects by THIS JULIO. |
| `title` | <this>This</this> es el trabajo. | <this>This</this> is the work. |
| `filterLabel` | Filtrar proyectos | Filter projects |
| `all` | Todos | All |
| `count` | {count, plural, =1 {# proyecto} other {# proyectos}} | {count, plural, =1 {# project} other {# projects}} |
| `itemMeta` | {n} / {tag} | {n} / {tag} |
| `categories.web` | Sitios web | Websites |
| `categories.dashboard` | Paneles | Dashboards |
| `categories.pos` | POS | POS |
| `categories.saas` | SaaS | SaaS |
| `categories.api` | APIs | APIs |
| `case.breadcrumb` | Ruta de navegación | Breadcrumb |
| `case.type` | Tipo | Type |
| `case.overview` | Resumen | Overview |
| `case.features` | Funcionalidades principales | Key features |

## Mensajes: services

| Clave | Español | English |
|---|---|---|
| `meta.description` | Siete formas de trabajar juntos. Cada una parte de un problema de negocio, no de una tecnología. | Seven ways to work together. Each one starts from a business problem, not a technology. |
| `title` | <this>This</this> es lo que puedo construir para ti. | <this>This</this> is what I can build for you. |
| `lead` | Siete formas de trabajar juntos. Cada una parte de un problema de negocio, no de una tecnología. | Seven ways to work together. Each one starts from a business problem, not a technology. |
| `indexLabel` | Elige un servicio | Choose a service |
| `fit` | Un buen punto de partida si: | A good fit if: |
| `gets` | Qué recibes | What you get |
| `previous` | Anterior: {name} | Previous: {name} |
| `next` | Siguiente: {name} | Next: {name} |
| `deployTitle` | Tres arquitecturas de despliegue | Three deployment architectures |
| `process.title` | <this>This</this> es cómo avanza un proyecto. | <this>This</this> is how a project runs. |
| `own.title` | Tus cuentas son tuyas. | Your accounts stay yours. |
| `own.text` | Los dominios, las tiendas, los métodos de pago y las cuentas del negocio te pertenecen. Trabajo con el acceso que necesito, y nada más. | Domains, stores, payment methods and business accounts belong to you. I work with the access I need, and nothing more. |
| `final.title` | ¿No sabes cuál necesitas? | Not sure which one you need? |
| `deploy.cloud.title` | En la nube | Cloud-based |
| `deploy.cloud.text` | Opera a través de infraestructura en la nube, con acceso y gestión centralizados según el diseño de la solución. | Operates through cloud infrastructure, allowing centralized access and management according to the solution's design. |
| `deploy.cloud.label` | Servicios en la nube conectados a varios clientes | Cloud services connected to several clients |
| `deploy.cloud.svg.services` | EN LA NUBE | CLOUD SERVICES |
| `deploy.cloud.svg.client` | CLIENTE | CLIENT |
| `deploy.local.title` | Despliegue local | Local deployment |
| `deploy.local.text` | Opera dentro de tu infraestructura local. Puede diseñarse para funcionar sin conexión permanente a internet, cuando la arquitectura y los requisitos lo permiten. | Operates within your local infrastructure. It can be designed to work without permanent internet connectivity, when the architecture and requirements allow it. |
| `deploy.local.label` | Computadoras y un servidor local en una red interna | Computers and a local server on an internal network |
| `deploy.local.svg.premises` | TUS INSTALACIONES | YOUR PREMISES |
| `deploy.local.svg.server` | SERV. LOCAL | LOCAL SERVER |
| `deploy.local.svg.lan` | LAN | LAN |
| `deploy.local.svg.pc` | PC | PC |
| `deploy.hybrid.title` | Despliegue híbrido | Hybrid deployment |
| `deploy.hybrid.text` | Combina infraestructura local y servicios en la nube. Según el diseño, puede incluir procesamiento local, respaldos en la nube, sincronización, gestión remota y reportes centralizados. | Combines local infrastructure and cloud services. Depending on the design, it can include local processing, cloud backups, synchronization, remote management and centralized reporting. |
| `deploy.hybrid.label` | Infraestructura local conectada a servicios en la nube | Local infrastructure connected to cloud services |
| `deploy.hybrid.svg.premises` | TUS INSTALACIONES | YOUR PREMISES |
| `deploy.hybrid.svg.local` | LOCAL | LOCAL |
| `deploy.hybrid.svg.pc` | PC | PC |
| `deploy.hybrid.svg.cloud` | NUBE | CLOUD |
| `deploy.hybrid.svg.backups` | RESPALDOS | BACKUPS |
| `deploy.hybrid.svg.sync` | SINCRONÍA | SYNC |
| `deploy.hybrid.svg.reporting` | REPORTES | REPORTING |
| `deploy.note` | Son alternativas de arquitectura, no tres funciones de todo sistema. La operación sin conexión, la sincronización y el acceso remoto dependen de la arquitectura elegida para cada proyecto. | These are architectural alternatives, not three features of every system. Offline operation, synchronization and remote access depend on the architecture selected for each project. |
| `deploy.designedFor` | Interfaz diseñada para | Interface designed for |
| `deploy.devices.0` | Pantallas táctiles | Touchscreens |
| `deploy.devices.1` | Teclado y mouse | Keyboard and mouse |
| `deploy.devices.2` | Computadoras de escritorio | Desktops |
| `deploy.devices.3` | Laptops | Laptops |
| `deploy.devices.4` | Otros dispositivos | Other devices |

## Mensajes: about

| Clave | Español | English |
|---|---|---|
| `meta.description` | Quién está detrás de THIS JULIO y cómo trabajo. | Who is behind THIS JULIO and how I work. |
| `title` | <this>This</this> es Julio. | <this>This</this> is Julio. |
| `who` | Quién soy | Who I am |
| `what` | Qué construyo | What I build |
| `github` | GitHub | GitHub |
| `philosophy` | Cómo pienso el software | How I think about software |
| `method` | Método de trabajo | Working method |
| `final.title` | Hablemos de tu proyecto. | Let's talk about your project. |

## Mensajes: legal

| Clave | Español | English |
|---|---|---|
| `meta.description` | Cómo aborda THIS JULIO el licenciamiento de software, la propiedad intelectual y la privacidad. | How THIS JULIO approaches software licensing, intellectual property and privacy. |
| `title` | Legal y privacidad | Legal & Privacy |
| `status` | Borrador pendiente de revisión legal. Última actualización: {date}. | Draft pending legal review. Last updated: {date}. |
| `indexLabel` | En esta página | On this page |
| `questions.title` | Preguntas | Questions |
| `questions.text` | Escríbeme desde la <contact>página de contacto</contact>. Aquí se añadirá documentación más completa a medida que esté disponible. | Write to me through the <contact>contact page</contact>. More complete documentation will be added here as it becomes available. |

## Mensajes: cta

| Clave | Español | English |
|---|---|---|
| `startProject` | Iniciar un proyecto | Start a project |
| `askQuestion` | Hacer una pregunta | Ask a question |
| `contactMe` | Contáctame | Contact me |
| `estimateThis` | Estimar esto | Estimate this |
| `seeHowBuilt` | Ver cómo se construye | See how it's built |

## Contenido: caso POS

| Clave | Español | English |
|---|---|---|
| `pos.description` | Sistema POS de escritorio para un comercio de productos agrícolas en Guatemala. | Desktop POS system for an agricultural products business in Guatemala. |
| `pos.title` | Sistema POS de escritorio | Desktop POS System |
| `pos.short` | Sistema POS de escritorio | Desktop POS system |
| `pos.tag` | POS | POS |
| `pos.type` | Aplicación de escritorio | Desktop application |
| `pos.overview` | Aplicación de escritorio con arquitectura offline-first: trabaja con los datos en el equipo local y los respalda en la nube. | A desktop application with an offline-first architecture: it works with data on the local computer and backs it up to the cloud. |
| `pos.cta` | ¿Necesitas un sistema hecho para tu operación? | Need a system built for your operation? |
| `pos.features.note` | Funcionalidades del sistema, según su documentación. No son resultados medidos. | System features, as documented. They are not measured results. |
| `pos.features.items.0` | Operación local | Local operation |
| `pos.features.items.1` | Usuarios y roles | Users and roles |
| `pos.features.items.2` | Autorización remota con códigos temporales (TOTP) | Remote authorization with time-based codes (TOTP) |
| `pos.features.items.3` | Gestión de caja | Cash register management |
| `pos.features.items.4` | Catálogo e inventario | Catalog and inventory |
| `pos.features.items.5` | Ventas, con topes de descuento según el rol | Sales, with discount limits by role |
| `pos.features.items.6` | Recibos y soporte de impresión | Receipts and printing support |
| `pos.features.items.7` | Reportes y auditoría | Reports and audit records |
| `pos.features.items.8` | Respaldo en la nube | Cloud backup |
| `pos.features.items.9` | Instalador para Windows | Windows installer |

## Contenido: servicios

| Clave | Español | English |
|---|---|---|
| `custom.short` | Software a la medida | Custom Software |
| `custom.title` | Desarrollo de software a la medida | Custom Software Development |
| `custom.line` | Software que parte de cómo ya trabaja tu negocio. | Software shaped around how your business already works. |
| `custom.value` | Software hecho a partir de cómo ya trabaja tu negocio, para que tu equipo deje de rodear sus herramientas. | Software shaped around how your business already works, so your team stops working around its tools. |
| `custom.fit` | las hojas de cálculo o las herramientas genéricas ya no se ajustan a tu forma de operar. | spreadsheets or off-the-shelf tools no longer match how you operate. |
| `custom.gets.0` | Un sistema construido alrededor de tu proceso | A system built around your process |
| `custom.gets.1` | Documentación escrita de qué se construyó y por qué | Written documentation of what was built and why |
| `custom.gets.2` | Control de acceso y seguridad desde la primera versión | Access control and security from the first version |
| `web.short` | Aplicaciones web y plataformas | Web Applications & Platforms |
| `web.title` | Aplicaciones web y plataformas | Web Applications & Platforms |
| `web.line` | Portales, herramientas internas y SaaS que tu equipo usa desde cualquier lugar. | Portals, internal tools and SaaS your team can use from anywhere. |
| `web.value` | Portales, herramientas internas y productos SaaS que tus clientes y tu equipo abren desde cualquier dispositivo. | Portals, internal tools and SaaS products that your customers and team can open from any device. |
| `web.fit` | personas en distintos lugares necesitan trabajar con la misma información. | people in different places need to work from the same information. |
| `web.gets.0` | Portales para clientes y herramientas internas | Customer portals and internal tools |
| `web.gets.1` | Paneles administrativos | Administrative dashboards |
| `web.gets.2` | Plataformas SaaS con datos separados para cada cliente | SaaS platforms with separate data for each client |
| `apps.short` | Aplicaciones móviles y de escritorio | Mobile & Desktop Applications |
| `apps.title` | Aplicaciones móviles y de escritorio | Mobile & Desktop Applications |
| `apps.line` | Aplicaciones adaptadas a tus dispositivos, sistemas y flujos de trabajo diarios. | Apps adapted to your devices, systems and daily workflows. |
| `apps.value` | Aplicaciones adaptadas a los dispositivos, sistemas operativos y flujos de trabajo que tu negocio usa de verdad. | Applications adapted to the devices, operating systems and workflows your business actually uses. |
| `apps.fit` | tu equipo o tus clientes necesitan más que un sitio web: una aplicación en el teléfono, la tableta o la computadora. | your team or customers need more than a website: an app on their phone, tablet or computer. |
| `apps.gets.0` | Aplicaciones móviles para teléfonos y tabletas | Mobile apps for phones and tablets |
| `apps.gets.1` | Aplicaciones de escritorio para tus computadoras | Desktop applications for your computers |
| `apps.gets.2` | Pantallas adaptadas a cada dispositivo y tarea | Screens adapted to each device and task |
| `shopify.short` | E-commerce y Shopify | E-commerce & Shopify |
| `shopify.title` | E-commerce y Shopify | E-commerce & Shopify |
| `shopify.line` | Tiendas fáciles de administrar, con cada cuenta a tu nombre. | Stores that are simple to run, with every account in your name. |
| `shopify.value` | Una tienda sencilla de administrar y fácil para comprar, con todo registrado a tu nombre. | A store that is straightforward to run and easy to buy from, with everything registered in your name. |
| `shopify.fit` | quieres vender en línea sin construir una plataforma desde cero. | you want to sell online without building a platform from scratch. |
| `shopify.gets.0` | Diseño y configuración de la tienda en Shopify | Store design and setup on Shopify |
| `shopify.gets.1` | Integración de pagos, envíos y aplicaciones | Payments, shipping and app integrations |
| `shopify.gets.2` | Proceso de compra probado de principio a fin antes del lanzamiento | Checkout tested end to end before launch |
| `apis.short` | APIs y automatización | APIs & Process Automation |
| `apis.title` | APIs y automatización de procesos | APIs & Process Automation |
| `apis.line` | Tus herramientas conectadas, para que nadie vuelva a escribir el mismo pedido. | Your tools connected, so nobody re-types the same order twice. |
| `apis.value` | Conecta las herramientas que ya usas, para que los pedidos y los datos se muevan solos en lugar de escribirse dos veces. | Connect the tools you already use, so orders and data move on their own instead of being typed twice. |
| `apis.fit` | alguien de tu equipo copia la misma información entre sistemas. | someone on your team copies the same information between systems. |
| `apis.gets.0` | APIs para tus propios sistemas | APIs for your own systems |
| `apis.gets.1` | Integraciones con servicios externos | Integrations with external services |
| `apis.gets.2` | Automatización de pasos repetitivos | Automation of repetitive steps |
| `pos.short` | POS y gestión de negocios | POS & Business Management |
| `pos.title` | Sistemas POS y gestión de negocios | POS & Business Management Systems |
| `pos.line` | Hechos a partir de cómo tu negocio vende, controla y opera. | Built around how your business sells, tracks and operates. |
| `pos.value` | Soluciones de punto de venta y gestión de negocios hechas a la medida, diseñadas a partir de cómo opera cada negocio. | Custom-built point-of-sale and business management solutions designed around the way each business operates. |
| `pos.fit` | los sistemas genéricos obligan a tu negocio a cambiar su forma de vender, controlar o llevar su operación. | generic systems force your business to change how it sells, tracks or controls its operation. |
| `pos.gets.0` | Una interfaz adecuada a tus equipos y dispositivos | An interface suited to your equipment |
| `pos.gets.1` | Despliegue en la nube, local o híbrido, elegido para cada proyecto | Cloud, local or hybrid deployment, selected per project |
| `pos.gets.2` | Módulos definidos por tu operación | Modules defined by your operation |
| `support.short` | Soporte y mantenimiento | Support and Maintenance |
| `support.title` | Soporte y mantenimiento | Support and Maintenance |
| `support.line` | Cuidado continuo de tus sistemas, bajo un acuerdo de servicio definido. | Ongoing care for your systems, under a defined service agreement. |
| `support.value` | Soporte técnico, mantenimiento y resolución de problemas continuos que mantienen tus sistemas funcionando después del lanzamiento. | Ongoing technical support, maintenance and troubleshooting that keep your systems working after launch. |
| `support.fit` | tienes un sistema en marcha y nadie que lo cuide. | you have a system running and nobody looking after it. |
| `support.gets.0` | Mantenimiento y actualizaciones de seguridad | Maintenance and security updates |
| `support.gets.1` | Resolución de problemas y asistencia técnica | Troubleshooting and technical assistance |

## Contenido: proceso

| Clave | Español | English |
|---|---|---|
| `define.title` | Definir | Define |
| `define.text` | Acordamos el problema, las personas involucradas y cómo se ve un buen resultado. | We agree on the problem, the people involved and what a good result looks like. |
| `specify.title` | Especificar | Specify |
| `specify.text` | Escribo el alcance y los criterios de aceptación antes de que exista código. | I write down the scope and acceptance criteria before any code exists. |
| `build.title` | Construir | Build |
| `build.text` | El trabajo avanza en pasos pequeños y revisables que puedes ver. | Work happens in small, reviewable steps you can see. |
| `verify.title` | Verificar | Verify |
| `verify.text` | El resultado se prueba contra lo acordado, incluida la seguridad. | The result is tested against what we agreed, including security. |
| `maintain.title` | Mantener | Maintain |
| `maintain.text` | La documentación y el soporte mantienen el sistema útil después del lanzamiento. | Documentation and support keep the system useful after launch. |

## Contenido: Acerca de

| Clave | Español | English |
|---|---|---|
| `about.who` | Soy Julio Orellana, desarrollador independiente con base en Guatemala. THIS JULIO es mi marca personal de tecnología y el estudio con el que trabajo con clientes y construyo mis propios productos. | I'm Julio Orellana, an independent developer based in Guatemala. THIS JULIO is my personal technology brand, and the studio through which I work with clients and build my own products. |
| `about.what` | Software a la medida, plataformas web, tiendas en Shopify, sistemas de gestión de negocios, APIs y automatización. | Custom software, web platforms, Shopify stores, business management systems, APIs and automation. |
| `about.philosophy` | Construirlo bien, documentar las decisiones, proteger el sistema y escalar solo cuando el negocio lo necesite. | Build it correctly, document the decisions, protect the system, and scale only when the business needs it. |
| `about.method.0.title` | Entender | Understand |
| `about.method.0.text` | El objetivo del negocio va antes que la tecnología. | The business goal comes before the technology. |
| `about.method.1.title` | Especificar | Specify |
| `about.method.1.text` | Los requisitos y los criterios de aceptación se escriben primero. | Requirements and acceptance criteria are written first. |
| `about.method.2.title` | Decidir | Decide |
| `about.method.2.text` | La arquitectura se mantiene proporcional al proyecto. | Architecture stays proportional to the project. |
| `about.method.3.title` | Construir y verificar | Build and verify |
| `about.method.3.text` | Pasos pequeños, comprobados contra lo acordado. | Small steps, checked against what was agreed. |
| `about.method.4.title` | Documentar y mantener | Document and maintain |
| `about.method.4.text` | Las decisiones quedan registradas para que el sistema pueda evolucionar. | Decisions stay on record so the system can evolve. |

## Contenido: Legal

| Clave | Español | English |
|---|---|---|
| `legal.notice` | Esta página es informativa. Describe cómo THIS JULIO aborda el licenciamiento y la privacidad. No es un contrato, una garantía ni asesoría legal, y no sustituye un acuerdo firmado. | This page is informative. It describes how THIS JULIO approaches licensing and privacy. It is not a contract, a guarantee or legal advice, and it does not replace a signed agreement. |
| `legal.sections.0.title` | Licenciamiento de software | Software Licensing |
| `legal.sections.0.body.0.text` | El desarrollo de software, el licenciamiento, los permisos de uso y los derechos de distribución dependen del marco legal aplicable y del acuerdo específico que se establezca con cada cliente. | Software development, licensing, usage permissions and distribution rights depend on the applicable legal framework and on the specific agreement established with each client. |
| `legal.sections.0.body.1.text` | Como cada proyecto es distinto, estos términos se definen para ese proyecto y no en esta página. | Because each project is different, these terms are defined for that project rather than on this page. |
| `legal.sections.1.title` | Propiedad intelectual | Intellectual Property |
| `legal.sections.1.body.0.text` | En Guatemala, los programas de computación están protegidos por la Ley de Derecho de Autor y Derechos Conexos (Decreto 33-98). Quién es titular de los derechos de un proyecto específico, o quién puede usarlos, se establece en el acuerdo de ese proyecto. | In Guatemala, computer programs are protected under the Copyright and Related Rights Law (Decree 33-98). Who owns or may use the rights in a specific project is established in the agreement for that project. |
| `legal.sections.1.body.1.text` | También pueden ser relevantes obligaciones internacionales, entre ellas el Convenio de Berna, el Tratado de la OMPI sobre Derecho de Autor y el Acuerdo sobre los ADPIC de la OMC. | International obligations may also be relevant, including the Berne Convention, the WIPO Copyright Treaty and the WTO TRIPS Agreement. |
| `legal.sections.2.title` | Principios de privacidad | Privacy Principles |
| `legal.sections.2.body.0.text` | THIS JULIO aplica estos principios de trabajo al construir software: | THIS JULIO applies these operating principles when building software: |
| `legal.sections.2.body.1.items.0` | La recopilación de datos debe limitarse a lo necesario para los requisitos acordados del proyecto. | Data collection should be limited to what is necessary for the agreed project requirements. |
| `legal.sections.2.body.1.items.1` | THIS JULIO no recopila ni trata información personal adicional de los usuarios del software de un cliente solo para fines propios. | THIS JULIO does not collect or process additional personal information from a client's software users merely for its own purposes. |
| `legal.sections.2.body.1.items.2` | El tratamiento de datos debe estar justificado por los requisitos del proyecto, las responsabilidades autorizadas y las obligaciones legales aplicables. | Data processing must be justified by the project's requirements, authorized responsibilities and applicable legal obligations. |
| `legal.sections.2.body.1.items.3` | Cuando un proyecto requiere recopilar, almacenar, tratar, transferir o analizar información, deben definirse su finalidad y su alcance. | When a project requires collecting, storing, processing, transferring or analyzing information, the purpose and scope must be defined. |
| `legal.sections.2.body.1.items.4` | Las consideraciones de privacidad y seguridad deben incorporarse a la arquitectura del sistema. | Privacy and security considerations should be incorporated into the system architecture. |
| `legal.sections.2.body.1.items.5` | Deben considerarse controles de acceso y medidas de seguridad adecuados a la sensibilidad y la naturaleza de la información. | Appropriate access controls and security measures should be considered according to the sensitivity and nature of the information. |
| `legal.sections.3.title` | Marco legal aplicable | Applicable Legal Framework |
| `legal.sections.3.body.0.text` | Las normas que aplican dependen de cada proyecto, de su cliente, de sus usuarios y del lugar donde se manejan los datos. THIS JULIO toma en cuenta: | The rules that apply depend on each project, its client, its users and where the data is handled. THIS JULIO takes into account: |
| `legal.sections.3.body.1.items.0` | La legislación guatemalteca aplicable al desarrollo de software, al derecho de autor y a la propiedad intelectual. | Guatemalan legislation applicable to software development, copyright and intellectual property. |
| `legal.sections.3.body.1.items.1` | Las obligaciones de privacidad, de confidencialidad y relativas a los datos que apliquen al proyecto. En Guatemala, estas provienen de varias fuentes y no de una sola ley integral de protección de datos, entre ellas la Constitución Política de la República y la Ley de Acceso a la Información Pública (Decreto 57-2008), dentro de su respectivo ámbito. | Privacy, confidentiality and data-related obligations that apply to the project. In Guatemala, these arise from several sources rather than from a single comprehensive data protection law, including the Political Constitution and the Law on Access to Public Information (Decree 57-2008), within their respective scope. |
| `legal.sections.3.body.1.items.2` | Estándares internacionales y requisitos legales, cuando el proyecto, el cliente, los usuarios o el tratamiento de los datos involucran otras jurisdicciones. | International standards and legal requirements, when the project, client, users or data processing involve other jurisdictions. |
| `legal.sections.3.body.2.text` | Las regulaciones extranjeras, como el RGPD, no aplican automáticamente a todos los proyectos. Si aplican o no lo determinan las circunstancias reales y la jurisdicción. | Foreign regulations such as the GDPR do not automatically apply to every project. Whether they apply is determined by the actual circumstances and jurisdiction. |
