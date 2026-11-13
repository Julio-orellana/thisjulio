/**
 * Contenido de PRUEBA, válido y mínimo, para las pruebas de la capa de
 * contenido. No se publica ni se importa desde `src/`: solo sirve para
 * mutarlo y comprobar que el esquema rechaza cada caso inválido.
 */
const t = (label: string) => ({ copy: 'draft' as const, es: `${label} es`, en: `${label} en` });

export function validContent() {
  return {
    projects: [
      {
        id: 'uno',
        order: 1,
        status: 'approved' as const,
        source: 'fuente de prueba',
        categories: ['pos'],
        plates: 'pos',
        slugs: { es: 'proyecto-uno', en: 'project-one' },
        description: t('Descripción'),
        text: {
          copy: 'draft' as const,
          es: { title: 'Título', short: 'Corto', tag: 'Etiqueta', type: 'Tipo', overview: 'Resumen', cta: 'Llamada' },
          en: { title: 'Title', short: 'Short', tag: 'Tag', type: 'Type', overview: 'Overview', cta: 'Call' },
        },
        features: {
          copy: 'draft' as const,
          es: { note: 'Nota', items: ['Una', 'Dos'] },
          en: { note: 'Note', items: ['One', 'Two'] },
        },
      },
      {
        id: 'borrador',
        order: 2,
        status: 'draft' as const,
        categories: ['web'],
        plates: 'site',
        slugs: { es: 'proyecto-borrador', en: 'draft-project' },
        description: t('Borrador'),
        text: {
          copy: 'draft' as const,
          es: { title: 'B', short: 'B', tag: 'B', type: 'B', overview: 'B', cta: 'B' },
          en: { title: 'D', short: 'D', tag: 'D', type: 'D', overview: 'D', cta: 'D' },
        },
        features: { copy: 'draft' as const, es: { note: 'N', items: ['A'] }, en: { note: 'N', items: ['A'] } },
      },
    ],
    services: Array.from({ length: 7 }, (_, i) => ({
      id: `servicio-${i + 1}`,
      order: i + 1,
      slugs: { es: `servicio-${i + 1}`, en: `service-${i + 1}` },
      deploy: i === 5,
      text: {
        copy: 'draft' as const,
        es: { short: `S${i + 1}`, title: `Servicio ${i + 1}`, line: 'Línea', value: 'Valor', fit: 'Encaja', gets: ['Uno', 'Dos'] },
        en: { short: `S${i + 1}`, title: `Service ${i + 1}`, line: 'Line', value: 'Value', fit: 'Fit', gets: ['One', 'Two'] },
      },
    })),
    process: [
      { id: 'definir', order: 1, text: { copy: 'draft' as const, es: { title: 'Definir', text: 'T' }, en: { title: 'Define', text: 'T' } } },
    ],
    about: {
      who: t('Quién'),
      what: t('Qué'),
      philosophy: t('Filosofía'),
      method: [{ id: 'entender', text: { copy: 'draft' as const, es: { title: 'Entender', text: 'T' }, en: { title: 'Understand', text: 'T' } } }],
    },
    legal: {
      updated: '2026-01-01',
      notice: t('Aviso'),
      sections: (['licensing', 'ip', 'privacy', 'framework'] as const).map((id) => ({
        id,
        anchors: { es: `es-${id}`, en: `en-${id}` },
        text: {
          copy: 'draft' as const,
          es: { title: id, body: [{ type: 'p' as const, text: 'Párrafo' }, { type: 'ul' as const, items: ['A', 'B'] }] },
          en: { title: id, body: [{ type: 'p' as const, text: 'Paragraph' }, { type: 'ul' as const, items: ['A', 'B'] }] },
        },
      })),
    },
    architecture: {
      nodes: [
        { id: 'pieza', text: { copy: 'draft' as const, es: { label: 'Pieza', text: 'Qué hace' }, en: { label: 'Part', text: 'What it does' } } },
        { id: 'tec', technology: true, text: { copy: 'draft' as const, es: { label: 'Redis', text: 'Opcional' }, en: { label: 'Redis', text: 'Optional' } } },
      ],
      bands: [{ id: 'banda', label: t('Banda') }],
      systems: (['web', 'saas', 'pos-cloud', 'pos-local', 'pos-hybrid', 'api', 'mobile'] as const).map((id) => ({
        id: id as string,
        label: t('Sistema'),
        bands: [{ band: 'banda', layer: 0, optional: false, nodes: ['pieza', 'tec'] }],
      })),
    },
    messagesCopy: { home: 'draft', work: 'draft', services: 'draft', about: 'draft', legal: 'draft', cta: 'draft', architecture: 'draft' },
  };
}

export type ContentFixture = ReturnType<typeof validContent>;
