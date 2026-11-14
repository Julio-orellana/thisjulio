import { describe, expect, it } from 'vitest';
import {
  content,
  findTranslatedSlug,
  getAbout,
  getLegal,
  getProject,
  getProjects,
  getServices,
  listCopyBlocks,
  listStaticParams,
} from '@/lib/content';
import { findPolicyViolations } from '@/content/policy';
import esFooter from '@/messages/es/footer.json';
import enFooter from '@/messages/en/footer.json';

// Contenido real de la 002 (T3). CA-3, CA-4, CA-5 (unitario), CA-7 y CA-12
// a nivel de contenido; las comprobaciones en las páginas llegan con T8–T14.

const OFFICIAL_ES = [
  'Desarrollo de software a la medida',
  'Aplicaciones web y plataformas',
  'Aplicaciones móviles y de escritorio',
  'E-commerce y Shopify',
  'APIs y automatización de procesos',
  'Sistemas POS y gestión de negocios',
  'Soporte y mantenimiento',
]; // spec/constitution/mission.md §4

const SLUGS = {
  services: [
    ['desarrollo-a-la-medida', 'custom-software'],
    ['aplicaciones-web', 'web-applications'],
    ['aplicaciones-moviles-y-escritorio', 'mobile-and-desktop-apps'],
    ['ecommerce-y-shopify', 'ecommerce-and-shopify'],
    ['apis-y-automatizacion', 'apis-and-automation'],
    ['sistemas-pos', 'pos-systems'],
    ['soporte-y-mantenimiento', 'support-and-maintenance'],
  ],
  pos: ['sistema-pos-de-escritorio', 'desktop-pos-system'],
}; // plan.md §3 (P-21)

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('contenido real: qué se publica', () => {
  it('exactamente un proyecto aprobado: el caso POS (CA-4)', () => {
    expect(getProjects('es').map((p) => p.id)).toEqual(['pos']);
    expect(getProjects('en').map((p) => p.id)).toEqual(['pos']);
  });

  it('siete servicios con los nombres oficiales en español, en orden', () => {
    expect(getServices('es').map((s) => s.title)).toEqual(OFFICIAL_ES);
    expect(getServices('es').map((s) => s.n)).toEqual(['01', '02', '03', '04', '05', '06', '07']);
  });

  it('solo el servicio 06 lleva Deploy', () => {
    expect(getServices('es').filter((s) => s.deploy).map((s) => s.id)).toEqual(['pos']);
  });

  it('los slugs son los propuestos en plan.md §3', () => {
    expect(getServices('es').map((s, i) => [s.slug, getServices('en')[i].slug])).toEqual(SLUGS.services);
    expect([getProjects('es')[0].slug, getProjects('en')[0].slug]).toEqual(SLUGS.pos);
  });
});

describe('contenido real: política (CA-7)', () => {
  it('ningún texto de src/content rompe la política (también lo exige el esquema)', () => {
    const all = strings({ p: getProjects('es'), q: getProjects('en'), s: getServices('es'), t: getServices('en'), a: getAbout('es'), b: getAbout('en'), l: getLegal('es'), m: getLegal('en') });
    // Sin exenciones: la de P-28 es solo para los nombres de nodo de Arquitectura (architecture.test.ts).
    expect(all.flatMap((value) => findPolicyViolations(value))).toEqual([]);
  });

  it('el servicio 07 no promete monitoreo, cobertura, tiempos ni 24/7 (D-02, P-22)', () => {
    const support = [...getServices('es'), ...getServices('en')].filter((s) => s.id === 'support');
    const text = strings(support).join(' ');
    expect(text).not.toMatch(/24\s*\/\s*7|SLA|monitor|cobertura|coverage|availability|disponibilidad|respuesta|response/i);
  });
});

describe('contenido real: caso POS (CA-12, nivel de contenido)', () => {
  const es = getProject('es', 'sistema-pos-de-escritorio')!;
  const en = getProject('en', 'desktop-pos-system')!;

  it('la línea descriptiva es la autorizada, literal (caso-pos.md §1)', () => {
    expect(es.description).toBe('Sistema POS de escritorio para un comercio de productos agrícolas en Guatemala.');
    expect(en.description).toBe('Desktop POS system for an agricultural products business in Guatemala.');
  });

  it('es de escritorio y nunca se describe como aplicación web', () => {
    for (const text of [strings(es).join(' '), strings(en).join(' ')]) {
      expect(text).not.toMatch(/aplicaci[oó]n\s+web|web\s+app|web\s+application|sitio\s+web|website|SaaS/i);
    }
    expect(es.type).toMatch(/escritorio/);
    expect(en.type).toMatch(/[Dd]esktop/);
  });

  it('lista las 10 funcionalidades documentadas con el aviso de que no son resultados', () => {
    expect(es.features.items).toHaveLength(10);
    expect(en.features.items).toHaveLength(10);
    expect(es.features.note).toMatch(/No son resultados/);
    expect(en.features.note).toMatch(/not measured results/);
  });

  it('no afirma lo que caso-pos.md §4 prohíbe', () => {
    const text = strings([es, en]).join(' ');
    expect(text).not.toMatch(
      /multi-?sucursal|multi-?branch|sincronizaci[oó]n entre terminales|facturaci[oó]n|invoic|cr[eé]dito|credit|probad[oa] en producci[oó]n|production-tested|clientes|customers/i,
    );
    expect(text).not.toMatch(/\d+\s*%|\d{3,}/); // sin cifras
  });

  it('no tiene campos de stack, problema, solución, año, rol, enlace, pantallas ni resultados', () => {
    for (const key of ['stack', 'problem', 'solution', 'year', 'role', 'link', 'shots', 'results', 'deploy']) {
      expect(Object.keys(es)).not.toContain(key);
    }
  });
});

describe('contenido real: rutas y selector de idioma (CA-5, nivel unitario)', () => {
  it('ida y vuelta ES ⇄ EN de los 7 servicios y del caso', () => {
    for (const [esSlug, enSlug] of SLUGS.services) {
      expect(findTranslatedSlug('/services/[slug]', esSlug, 'es', 'en')).toBe(enSlug);
      expect(findTranslatedSlug('/services/[slug]', enSlug, 'en', 'es')).toBe(esSlug);
    }
    expect(findTranslatedSlug('/work/[slug]', SLUGS.pos[0], 'es', 'en')).toBe(SLUGS.pos[1]);
    expect(findTranslatedSlug('/work/[slug]', SLUGS.pos[1], 'en', 'es')).toBe(SLUGS.pos[0]);
  });

  it('sin traducción (slug inexistente o del otro idioma): null, el selector cae en la página padre', () => {
    expect(findTranslatedSlug('/work/[slug]', 'ay-lupita', 'es', 'en')).toBeNull();
    expect(findTranslatedSlug('/services/[slug]', 'custom-software', 'es', 'en')).toBeNull();
  });

  it('pares estáticos: 2 del caso y 14 de servicios (las 16 rutas con slug de la 002)', () => {
    expect(listStaticParams('work')).toHaveLength(2);
    expect(listStaticParams('services')).toHaveLength(14);
  });
});

describe('contenido real: Legal', () => {
  it('las anclas coinciden con las que ya enlaza el Footer (footer.json → anchors)', () => {
    for (const [locale, footer] of [['es', esFooter], ['en', enFooter]] as const) {
      const anchors = Object.fromEntries(getLegal(locale).sections.map((s) => [s.id, s.anchor]));
      expect({ licensing: anchors.licensing, ip: anchors.ip, privacy: anchors.privacy }).toEqual(footer.anchors);
      expect(anchors.framework).toBeTruthy();
    }
  });

  it('no afirma una ley integral de protección de datos ni que el RGPD aplique siempre (SECURITY.md §6)', () => {
    const es = strings(getLegal('es')).join(' ');
    const en = strings(getLegal('en')).join(' ');
    expect(es).toMatch(/no de una sola ley integral/);
    expect(es).toMatch(/RGPD, no aplican automáticamente/);
    expect(en).toMatch(/rather than from a single comprehensive data protection law/);
    expect(en).toMatch(/do not automatically apply/);
  });
});

describe('contenido real: textos en borrador (DA-8, P-22)', () => {
  it('todo el contenido de R1 sigue en draft; se informa cuántos bloques', () => {
    const blocks = listCopyBlocks();
    const draft = blocks.filter((b) => b.copy === 'draft');
    console.info(`[copy] ${draft.length} de ${blocks.length} bloques en draft:\n  ${draft.map((b) => b.path).join('\n  ')}`);
    expect(draft).toHaveLength(blocks.length);
    expect(blocks.length).toBeGreaterThan(0);
  });

  it('la instancia expone el mismo contenido validado', () => {
    expect(content.getServices('en')).toEqual(getServices('en'));
  });
});
