import type { SlugLookup } from '@/i18n/alternate';
import type { Locale } from '@/i18n/routing';
import { validateContent, type Content, type CopyStatus } from '@/content/schema';

/**
 * Puerta única al contenido (spec 002 §4.3). Valida al crearse y devuelve
 * funciones que entregan datos ya localizados y tipados a los componentes.
 * `src/lib/content/index.ts` crea la instancia con el contenido real; las
 * pruebas la crean con datos de prueba.
 */
export function createContent(raw: unknown) {
  const data: Content = validateContent(raw);

  const approved = data.projects.filter((p) => p.status === 'approved').sort((a, b) => a.order - b.order);
  const services = [...data.services].sort((a, b) => a.order - b.order);
  const process = [...data.process].sort((a, b) => a.order - b.order);
  const pad = (n: number) => String(n).padStart(2, '0');

  const localizeProject = (p: (typeof approved)[number], locale: Locale) => ({
    id: p.id,
    n: pad(p.order),
    slug: p.slugs[locale],
    categories: p.categories,
    plates: p.plates,
    description: p.description[locale],
    ...p.text[locale],
    features: p.features[locale],
  });

  const localizeService = (s: (typeof services)[number], locale: Locale) => ({
    id: s.id,
    n: pad(s.order),
    slug: s.slugs[locale],
    deploy: s.deploy,
    ...s.text[locale],
  });

  const findTranslatedSlug: SlugLookup = (pathname, value, from, to) => {
    if (pathname === '/work/[slug]') return approved.find((p) => p.slugs[from] === value)?.slugs[to] ?? null;
    if (pathname === '/services/[slug]') return services.find((s) => s.slugs[from] === value)?.slugs[to] ?? null;
    return null; // blog: feature 005
  };

  return {
    /** Solo proyectos `approved`, en orden. */
    getProjects: (locale: Locale) => approved.map((p) => localizeProject(p, locale)),
    getProject: (locale: Locale, value: string) => {
      const p = approved.find((x) => x.slugs[locale] === value);
      return p ? localizeProject(p, locale) : undefined;
    },
    /** Categorías con al menos un proyecto aprobado (el filtro se oculta si son < 2, DA-4). */
    getProjectCategories: () => [...new Set(approved.flatMap((p) => p.categories))],
    getServices: (locale: Locale) => services.map((s) => localizeService(s, locale)),
    getService: (locale: Locale, value: string) => {
      const s = services.find((x) => x.slugs[locale] === value);
      return s ? localizeService(s, locale) : undefined;
    },
    getProcess: (locale: Locale) => process.map((s) => ({ id: s.id, n: pad(s.order), ...s.text[locale] })),
    getAbout: (locale: Locale) => ({
      who: data.about.who[locale],
      what: data.about.what[locale],
      philosophy: data.about.philosophy[locale],
      method: data.about.method.map((m, i) => ({ id: m.id, n: pad(i + 1), ...m.text[locale] })),
    }),
    getLegal: (locale: Locale) => ({
      updated: data.legal.updated,
      notice: data.legal.notice[locale],
      sections: data.legal.sections.map((s) => ({ id: s.id, anchor: s.anchors[locale], ...s.text[locale] })),
    }),
    findTranslatedSlug,
    /** Pares (idioma, slug) de las rutas con slug: alimentan `generateStaticParams`. */
    listStaticParams: (kind: 'work' | 'services') =>
      (['es', 'en'] as const).flatMap((locale) =>
        (kind === 'work' ? approved : services).map((x) => ({ locale, slug: x.slugs[locale] })),
      ),
    /**
     * Pares de slugs ES/EN de las rutas con slug, sin texto: los recibe el
     * selector de idioma (isla de cliente) sin cargar la capa de contenido.
     */
    slugPairs: () => ({
      '/work/[slug]': approved.map((p) => ({ ...p.slugs })),
      '/services/[slug]': services.map((s) => ({ ...s.slugs })),
    }),
    /** Todos los bloques con `copy` y su estado (informe de textos en borrador, DA-8). */
    listCopyBlocks: () => collectCopy(data),
  };
}

export type ContentApi = ReturnType<typeof createContent>;

function collectCopy(value: unknown, path = ''): { path: string; copy: CopyStatus }[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => collectCopy(v, `${path}[${(v as { id?: string })?.id ?? i}]`));
  if (value === null || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if (path === '.messagesCopy') {
    return Object.entries(obj).map(([ns, copy]) => ({ path: `messages/${ns}`, copy: copy as CopyStatus }));
  }
  const own = typeof obj.copy === 'string' && 'es' in obj ? [{ path: path.slice(1), copy: obj.copy as CopyStatus }] : [];
  return [
    ...own,
    ...Object.entries(obj)
      .filter(([k]) => k !== 'es' && k !== 'en' && k !== 'copy')
      .flatMap(([k, v]) => collectCopy(v, `${path}.${k}`)),
  ];
}
