import type { ContentInput } from './schema';

/**
 * Portafolio (spec 002 §3.3 y §4.1). Regla: un dato solo entra si tiene una
 * fuente verificable de la tabla §4.1; sin fuente, se omite (D-08).
 *
 * Hoy solo existe el caso POS, anonimizado (P-02) y mínimo (P-19, alternativa
 * A). Fuente única: `docs/portafolio/caso-pos.md`.
 *
 * Lo que NO está, a propósito:
 * - nombre comercial del producto y del cliente (P-02);
 * - stack (P-19), problema y solución (P-19), año, rol y enlace (D-12);
 * - pantallas o capturas (P-03), resultados y cifras (caso §4);
 * - `Deploy`: cloud/local/híbrida es oferta de servicio, no del POS (caso §5, D-14);
 * - los proyectos sin verificar del diseño (AY LUPITA, Kinderland, ATRIO,
 *   API de pedidos, P-08): ni se cargan.
 *
 * Todo el texto va `copy: 'draft'`. La línea descriptiva es la autorizada en
 * `caso-pos.md` §1, copiada literalmente; aun así queda `draft` hasta que Julio
 * revise el caso completo (▲A3).
 */
export const projects = [
  {
    id: 'pos',
    order: 1,
    status: 'approved',
    source:
      'docs/portafolio/caso-pos.md — revisión de solo lectura de sistema-pos en ced39d4 (README.md, package.json, electron-builder.yml, roadmap §1, estructura de src/)',
    categories: ['pos'],
    plates: 'pos',
    slugs: { es: 'sistema-pos-de-escritorio', en: 'desktop-pos-system' },
    description: {
      copy: 'draft',
      es: 'Sistema POS de escritorio para un comercio de productos agrícolas en Guatemala.',
      en: 'Desktop POS system for an agricultural products business in Guatemala.',
    },
    text: {
      copy: 'draft',
      es: {
        title: 'Sistema POS de escritorio',
        short: 'Sistema POS de escritorio',
        tag: 'POS',
        type: 'Aplicación de escritorio',
        overview:
          'Aplicación de escritorio con arquitectura offline-first: trabaja con los datos en el equipo local y los respalda en la nube.',
        cta: '¿Necesitas un sistema hecho para tu operación?',
      },
      en: {
        title: 'Desktop POS System',
        short: 'Desktop POS system',
        tag: 'POS',
        type: 'Desktop application',
        overview: 'A desktop application with an offline-first architecture: it works with data on the local computer and backs it up to the cloud.',
        cta: 'Need a system built for your operation?',
      },
    },
    features: {
      copy: 'draft',
      // Las 10 capacidades de caso-pos.md §3, en el mismo orden. Documentadas,
      // no verificadas en ejecución: nunca «probadas en producción».
      es: {
        note: 'Funcionalidades del sistema, según su documentación. No son resultados medidos.',
        items: [
          'Operación local',
          'Usuarios y roles',
          'Autorización remota con códigos temporales (TOTP)',
          'Gestión de caja',
          'Catálogo e inventario',
          'Ventas, con topes de descuento según el rol',
          'Recibos y soporte de impresión',
          'Reportes y auditoría',
          'Respaldo en la nube',
          'Instalador para Windows',
        ],
      },
      en: {
        note: 'System features, as documented. They are not measured results.',
        items: [
          'Local operation',
          'Users and roles',
          'Remote authorization with time-based codes (TOTP)',
          'Cash register management',
          'Catalog and inventory',
          'Sales, with discount limits by role',
          'Receipts and printing support',
          'Reports and audit records',
          'Cloud backup',
          'Windows installer',
        ],
      },
    },
  },
] satisfies ContentInput['projects'];
