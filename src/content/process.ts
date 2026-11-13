import type { ContentInput } from './schema';

/** «This is how a project runs» (`Services.dc.html`). Borrador (P-22). */
export const process = [
  {
    id: 'define',
    order: 1,
    text: {
      copy: 'draft',
      es: { title: 'Definir', text: 'Acordamos el problema, las personas involucradas y cómo se ve un buen resultado.' },
      en: { title: 'Define', text: 'We agree on the problem, the people involved and what a good result looks like.' },
    },
  },
  {
    id: 'specify',
    order: 2,
    text: {
      copy: 'draft',
      es: { title: 'Especificar', text: 'Escribo el alcance y los criterios de aceptación antes de que exista código.' },
      en: { title: 'Specify', text: 'I write down the scope and acceptance criteria before any code exists.' },
    },
  },
  {
    id: 'build',
    order: 3,
    text: {
      copy: 'draft',
      es: { title: 'Construir', text: 'El trabajo avanza en pasos pequeños y revisables que puedes ver.' },
      en: { title: 'Build', text: 'Work happens in small, reviewable steps you can see.' },
    },
  },
  {
    id: 'verify',
    order: 4,
    text: {
      copy: 'draft',
      es: { title: 'Verificar', text: 'El resultado se prueba contra lo acordado, incluida la seguridad.' },
      en: { title: 'Verify', text: 'The result is tested against what we agreed, including security.' },
    },
  },
  {
    id: 'maintain',
    order: 5,
    text: {
      copy: 'draft',
      es: { title: 'Mantener', text: 'La documentación y el soporte mantienen el sistema útil después del lanzamiento.' },
      en: { title: 'Maintain', text: 'Documentation and support keep the system useful after launch.' },
    },
  },
] satisfies ContentInput['process'];
