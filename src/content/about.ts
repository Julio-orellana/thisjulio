import type { ContentInput } from './schema';

/**
 * Acerca de (`About.dc.html`), en borrador (P-22).
 *
 * Omitido hasta que Julio lo confirme (P-20, P-11): especialidades técnicas,
 * las 14 tecnologías del diseño, retrato, CV y LinkedIn. El esquema no admite
 * esos campos. El enlace a GitHub sale de `src/config/site.ts`.
 */
export const about = {
  who: {
    copy: 'draft',
    es: 'Soy Julio Orellana, desarrollador independiente con base en Guatemala. THIS JULIO es mi marca personal de tecnología y el estudio con el que trabajo con clientes y construyo mis propios productos.',
    en: "I'm Julio Orellana, an independent developer based in Guatemala. THIS JULIO is my personal technology brand, and the studio through which I work with clients and build my own products.",
  },
  what: {
    copy: 'draft',
    es: 'Software a la medida, plataformas web, tiendas en Shopify, sistemas de gestión de negocios, APIs y automatización.',
    en: 'Custom software, web platforms, Shopify stores, business management systems, APIs and automation.',
  },
  philosophy: {
    copy: 'draft',
    es: 'Construirlo bien, documentar las decisiones, proteger el sistema y escalar solo cuando el negocio lo necesite.',
    en: 'Build it correctly, document the decisions, protect the system, and scale only when the business needs it.',
  },
  method: [
    {
      id: 'understand',
      text: {
        copy: 'draft',
        es: { title: 'Entender', text: 'El objetivo del negocio va antes que la tecnología.' },
        en: { title: 'Understand', text: 'The business goal comes before the technology.' },
      },
    },
    {
      id: 'specify',
      text: {
        copy: 'draft',
        es: { title: 'Especificar', text: 'Los requisitos y los criterios de aceptación se escriben primero.' },
        en: { title: 'Specify', text: 'Requirements and acceptance criteria are written first.' },
      },
    },
    {
      id: 'decide',
      text: {
        copy: 'draft',
        es: { title: 'Decidir', text: 'La arquitectura se mantiene proporcional al proyecto.' },
        en: { title: 'Decide', text: 'Architecture stays proportional to the project.' },
      },
    },
    {
      id: 'build-and-verify',
      text: {
        copy: 'draft',
        es: { title: 'Construir y verificar', text: 'Pasos pequeños, comprobados contra lo acordado.' },
        en: { title: 'Build and verify', text: 'Small steps, checked against what was agreed.' },
      },
    },
    {
      id: 'document-and-maintain',
      text: {
        copy: 'draft',
        es: { title: 'Documentar y mantener', text: 'Las decisiones quedan registradas para que el sistema pueda evolucionar.' },
        en: { title: 'Document and maintain', text: 'Decisions stay on record so the system can evolve.' },
      },
    },
  ],
} satisfies ContentInput['about'];
