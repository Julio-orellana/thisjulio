import { z } from 'zod';
import { findPolicyViolations, type PolicyRuleId } from './policy';

/**
 * Esquema de la capa de contenido (spec 002 §4, ADR 003).
 *
 * - Cada entrada separa la estructura (id, orden, estado, categorías, vista
 *   `Plates`, slugs) del texto por idioma.
 * - Cada bloque de texto lleva `copy: 'draft' | 'approved'` (DA-8, P-22): lo
 *   no aprobado por Julio queda en `draft`. Una prueba lista cuántos quedan.
 * - Solo `status: 'approved'` genera página, y exige `source` (spec §4.1).
 * - `validateContent` se ejecuta al importar `src/lib/content`: una entrada
 *   inválida rompe `next build` y Vitest, no la producción.
 */

export const COPY_STATUSES = ['draft', 'approved'] as const;
export const PROJECT_STATUSES = ['draft', 'approved'] as const;
/** Categorías de la galería de Trabajo (filtros de `Work.dc.html`). */
export const PROJECT_CATEGORIES = ['web', 'dashboard', 'pos', 'saas', 'api'] as const;
/** Composiciones de `Plates.dc.html` disponibles para un proyecto. */
export const PLATE_KINDS = ['site', 'dash', 'inst', 'pos', 'saas', 'api'] as const;
export const SERVICE_COUNT = 7;
export const LEGAL_SECTION_IDS = ['licensing', 'ip', 'privacy', 'framework'] as const;
/** Espacios de nombres de `src/messages` creados en la 002 (su `copy` va aquí). */
export const MESSAGE_NAMESPACES_002 = ['home', 'work', 'services', 'about', 'legal', 'cta'] as const;
/** Espacios de nombres creados en la 003. */
export const MESSAGE_NAMESPACES_003 = ['architecture'] as const;
/** Espacios de nombres creados en la 006 (Contacto provisional, P-43). */
export const MESSAGE_NAMESPACES_006 = ['contact'] as const;
export const MESSAGE_NAMESPACES = [...MESSAGE_NAMESPACES_002, ...MESSAGE_NAMESPACES_003, ...MESSAGE_NAMESPACES_006] as const;
/** Tipos de sistema de Arquitectura (pestañas de `Technology.dc.html`), en su orden. */
export const ARCHITECTURE_SYSTEM_IDS = ['web', 'saas', 'pos-cloud', 'pos-local', 'pos-hybrid', 'api', 'mobile'] as const;
/**
 * Tecnologías que Arquitectura puede nombrar (P-28, decisión de Julio del
 * 2026-11-13). Lista cerrada: un nodo `technology` con otro nombre rompe el
 * build. No autoriza a nombrarlas en ningún otro contenido (P-19, P-20).
 */
export const ARCHITECTURE_TECHNOLOGIES = [
  'Next.js', 'React', 'TypeScript', 'Server Actions', 'Prisma', 'PostgreSQL', 'Redis', 'NestJS', 'Express', 'Electron', 'React Native', 'Expo',
] as const;
/** Único nodo que puede llamarse «Monitoring» / «Monitoreo» (P-28): es una capa, no una promesa de servicio. */
export const ARCHITECTURE_MONITORING_NODE = 'monitor';

/** Texto publicable: no vacío y sin nada que la política de contenido prohíba. */
export const text = z
  .string()
  .trim()
  .min(1, 'campo vacío')
  .superRefine((value, ctx) => {
    for (const message of findPolicyViolations(value)) ctx.addIssue({ code: 'custom', message });
  });

const copyStatus = z.enum(COPY_STATUSES);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug inválido (minúsculas, números y guiones)');
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id inválido');
const slugs = z.strictObject({ es: slug, en: slug });

/** Bloque de texto bilingüe: los dos idiomas son obligatorios y no se admite otro. */
function block<T extends z.ZodType>(shape: T) {
  return z.strictObject({ copy: copyStatus, es: shape, en: shape });
}

const paragraph = z.strictObject({ type: z.literal('p'), text });
const list = z.strictObject({ type: z.literal('ul'), items: z.array(text).min(1) });
const legalBody = z.array(z.discriminatedUnion('type', [paragraph, list])).min(1);

export const projectSchema = z
  .strictObject({
    id,
    order: z.int().positive(),
    status: z.enum(PROJECT_STATUSES),
    /** Fuente verificable (spec §4.1). Obligatoria si `approved`. */
    source: z.string().trim().optional(),
    categories: z.array(z.enum(PROJECT_CATEGORIES)).min(1),
    plates: z.enum(PLATE_KINDS),
    slugs,
    /** Descripción pública autorizada (una línea). */
    description: block(text),
    text: block(
      z.strictObject({
        title: text,
        short: text,
        tag: text,
        type: text,
        overview: text,
        cta: text,
      }),
    ),
    /** Funcionalidades documentadas, con el aviso de que no son resultados. */
    features: block(z.strictObject({ note: text, items: z.array(text).min(1) })),
  })
  .superRefine((p, ctx) => {
    if (p.status === 'approved' && !p.source) {
      ctx.addIssue({ code: 'custom', path: ['source'], message: `proyecto «${p.id}» aprobado sin fuente verificable` });
    }
    if (p.features.es.items.length !== p.features.en.items.length) {
      ctx.addIssue({ code: 'custom', path: ['features'], message: 'es y en tienen distinto número de funcionalidades' });
    }
  });

export const serviceSchema = z
  .strictObject({
    id,
    order: z.int().min(1).max(SERVICE_COUNT),
    slugs,
    /** Muestra el componente `Deploy` (solo el servicio 06). */
    deploy: z.boolean(),
    text: block(
      z.strictObject({
        short: text,
        title: text,
        line: text,
        value: text,
        fit: text,
        gets: z.array(text).min(1),
      }),
    ),
  })
  .superRefine((s, ctx) => {
    if (s.text.es.gets.length !== s.text.en.gets.length) {
      ctx.addIssue({ code: 'custom', path: ['text'], message: `servicio «${s.id}»: es y en tienen distinto número de entregables` });
    }
  });

export const processStepSchema = z.strictObject({
  id,
  order: z.int().positive(),
  text: block(z.strictObject({ title: text, text })),
});

/**
 * Acerca de. Sin especialidades ni tecnologías (P-20): el objeto es estricto,
 * así que añadirlas sin cambiar el esquema rompe el build.
 */
export const aboutSchema = z.strictObject({
  who: block(text),
  what: block(text),
  philosophy: block(text),
  method: z
    .array(z.strictObject({ id, text: block(z.strictObject({ title: text, text })) }))
    .min(1),
});

export const legalSchema = z.strictObject({
  /** Fecha del último commit que cambió este contenido (no una inventada, spec §3.6). */
  updated: z.iso.date(),
  notice: block(text),
  sections: z
    .array(
      z
        .strictObject({
          id: z.enum(LEGAL_SECTION_IDS),
          /** Ancla de la sección por idioma (las tres primeras = footer.json → anchors). */
          anchors: slugs,
          text: block(z.strictObject({ title: text, body: legalBody })),
        })
        .superRefine((s, ctx) => {
          const shape = (b: z.infer<typeof legalBody>) => b.map((x) => (x.type === 'ul' ? `ul${x.items.length}` : 'p')).join(',');
          if (shape(s.text.es.body) !== shape(s.text.en.body)) {
            ctx.addIssue({ code: 'custom', path: ['text'], message: `sección «${s.id}»: es y en no tienen la misma estructura` });
          }
        }),
    )
    .length(LEGAL_SECTION_IDS.length),
});

const label = z.string().trim().min(1, 'campo vacío');

/**
 * Pieza de un sistema (nodo del diagrama). El nombre de una tecnología va
 * igual en los dos idiomas y sale de la lista cerrada de P-28; cualquier otro
 * nombre y todas las descripciones cumplen la política de contenido completa.
 */
export const architectureNodeSchema = z
  .strictObject({
    id,
    technology: z.boolean().optional(),
    text: block(z.strictObject({ label, text })),
  })
  .superRefine((n, ctx) => {
    if (n.technology) {
      const known: readonly string[] = ARCHITECTURE_TECHNOLOGIES;
      if (n.text.es.label !== n.text.en.label || !known.includes(n.text.en.label)) {
        ctx.addIssue({ code: 'custom', path: ['text'], message: `nodo «${n.id}»: tecnología fuera de la lista confirmada (P-28)` });
      }
      return;
    }
    const exempt: PolicyRuleId[] = n.id === ARCHITECTURE_MONITORING_NODE ? ['monitoreo'] : [];
    for (const locale of ['es', 'en'] as const) {
      for (const message of findPolicyViolations(n.text[locale].label, exempt)) ctx.addIssue({ code: 'custom', path: ['text', locale, 'label'], message });
    }
  });

export const architectureSchema = z
  .strictObject({
    nodes: z.array(architectureNodeSchema).min(1),
    /** Rótulos de las bandas, compartidos entre sistemas. */
    bands: z.array(z.strictObject({ id, label: block(text) })).min(1),
    systems: z
      .array(
        z.strictObject({
          id: z.enum(ARCHITECTURE_SYSTEM_IDS),
          label: block(text),
          bands: z
            .array(
              z.strictObject({
                band: id,
                /** Capa de `Plates stack` que resalta el inspector: 0 Interfaz … 3 Infraestructura. */
                layer: z.int().min(0).max(3),
                /** Banda punteada: se agrega solo cuando el proyecto la necesita. */
                optional: z.boolean(),
                nodes: z.array(id).min(1),
              }),
            )
            .min(1),
        }),
      )
      .length(ARCHITECTURE_SYSTEM_IDS.length),
  })
  .superRefine((a, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
    const nodeIds = a.nodes.map((n) => n.id);
    const bandIds = a.bands.map((b) => b.id);
    const groups: [string, string[]][] = [['nodo', nodeIds], ['banda', bandIds], ['sistema', a.systems.map((s) => s.id)]];
    for (const [what, ids] of groups) {
      for (const v of ids) if (ids.indexOf(v) !== ids.lastIndexOf(v)) issue(`id de ${what} duplicado: «${v}»`);
    }
    const used = new Set<string>();
    for (const s of a.systems) {
      for (const b of s.bands) {
        if (!bandIds.includes(b.band)) issue(`sistema «${s.id}»: banda desconocida «${b.band}»`);
        for (const n of b.nodes) {
          if (!nodeIds.includes(n)) issue(`sistema «${s.id}»: nodo desconocido «${n}»`);
          used.add(n);
        }
      }
    }
    for (const n of nodeIds) if (!used.has(n)) issue(`nodo «${n}» sin usar en ningún sistema`);
    for (const b of bandIds) if (!a.systems.some((s) => s.bands.some((x) => x.band === b))) issue(`banda «${b}» sin usar`);
    const technologies = a.nodes.filter((n) => n.technology).map((n) => n.text.en.label);
    if (technologies.length !== new Set(technologies).size) issue('tecnología repetida en dos nodos');
  });

export const contentSchema = z
  .strictObject({
    projects: z.array(projectSchema),
    services: z.array(serviceSchema).length(SERVICE_COUNT, `debe haber exactamente ${SERVICE_COUNT} servicios`),
    process: z.array(processStepSchema).min(1),
    about: aboutSchema,
    legal: legalSchema,
    architecture: architectureSchema,
    /** Estado de aprobación de los espacios de nombres de mensajes de la 002 y la 003 (DA-8). */
    messagesCopy: z.strictObject(
      Object.fromEntries(MESSAGE_NAMESPACES.map((ns) => [ns, copyStatus])) as Record<
        (typeof MESSAGE_NAMESPACES)[number],
        typeof copyStatus
      >,
    ),
  })
  .superRefine((c, ctx) => {
    const unique = (path: string, values: (string | number)[], what: string) => {
      const seen = new Set<string | number>();
      for (const v of values) {
        if (seen.has(v)) ctx.addIssue({ code: 'custom', path: [path], message: `${what} duplicado: «${v}»` });
        seen.add(v);
      }
    };
    for (const locale of ['es', 'en'] as const) {
      unique('projects', c.projects.map((p) => p.slugs[locale]), `slug de proyecto (${locale})`);
      unique('services', c.services.map((s) => s.slugs[locale]), `slug de servicio (${locale})`);
      unique('legal', c.legal.sections.map((s) => s.anchors[locale]), `ancla legal (${locale})`);
    }
    unique('projects', c.projects.map((p) => p.id), 'id de proyecto');
    unique('projects', c.projects.map((p) => p.order), 'orden de proyecto');
    unique('services', c.services.map((s) => s.id), 'id de servicio');
    unique('services', c.services.map((s) => s.order), 'orden de servicio');
    unique('process', c.process.map((s) => s.id), 'id de paso');
    unique('process', c.process.map((s) => s.order), 'orden de paso');
    unique('legal', c.legal.sections.map((s) => s.id), 'sección legal');
    unique('about', c.about.method.map((s) => s.id), 'id de método');
  });

export type Content = z.infer<typeof contentSchema>;
export type ContentInput = z.input<typeof contentSchema>;
export type CopyStatus = (typeof COPY_STATUSES)[number];

/** Valida el contenido completo. Lanza un error legible si algo no cumple. */
export function validateContent(raw: unknown): Content {
  const result = contentSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Contenido inválido (src/content):\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
