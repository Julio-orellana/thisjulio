import { about } from '@/content/about';
import { legal } from '@/content/legal';
import { messagesCopy } from '@/content/messages-copy';
import { process } from '@/content/process';
import { projects } from '@/content/projects';
import { services } from '@/content/services';
import { createContent } from './create';

/**
 * Contenido del sitio, validado al importar este módulo (spec 002 §4.4): una
 * entrada inválida rompe `next build` y Vitest. Única puerta al contenido para
 * páginas y componentes.
 */
export const content = createContent({ projects, services, process, about, legal, messagesCopy });

export const {
  getProjects,
  getProject,
  getProjectCategories,
  getServices,
  getService,
  getProcess,
  getAbout,
  getLegal,
  findTranslatedSlug,
  listStaticParams,
  listCopyBlocks,
} = content;
