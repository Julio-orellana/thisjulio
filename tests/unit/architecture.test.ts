import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { architecture } from '@/content/architecture';
import { findPolicyViolations } from '@/content/policy';
import { ARCHITECTURE_SYSTEM_IDS, ARCHITECTURE_TECHNOLOGIES, validateContent } from '@/content/schema';
import { getArchitecture, listCopyBlocks } from '@/lib/content';
import { validContent, type ContentFixture } from './fixtures/content';

// 003 · T5 — contenido de Arquitectura (`Technology.dc.html`) y condiciones de
// P-28 (decisión de Julio, 2026-11-13: opción A completa).
const design = readFileSync('docs/design/fuente/Technology.dc.html', 'utf8').replaceAll('\\u2019', '’');
const node = (id: string) => architecture.nodes.find((n) => n.id === id)!;

describe('Arquitectura: estructura del artboard', () => {
  it('7 tipos de sistema, en el orden de las pestañas, con sus bandas y piezas', () => {
    expect(architecture.systems.map((s) => s.id)).toEqual([...ARCHITECTURE_SYSTEM_IDS]);
    const en = getArchitecture('en');
    expect(en.map((s) => s.label)).toEqual(['Web applications', 'SaaS platforms', 'POS: cloud', 'POS: local', 'POS: hybrid', 'APIs & integrations', 'Mobile & desktop']);
    // Cada banda, tal como la escribe el diseño: ['Rótulo', capa, punteada, [piezas]].
    for (const system of architecture.systems) {
      for (const b of system.bands) {
        const band = architecture.bands.find((x) => x.id === b.band)!;
        expect(design, `${system.id} · ${band.label.en}`).toContain(`['${band.label.en}', ${b.layer}, ${b.optional ? 1 : 0}, [${b.nodes.map((n) => `'${n}'`).join(', ')}]]`);
      }
    }
    expect(en.flatMap((s) => s.bands)).toHaveLength(33);
  });

  it('42 piezas: todas las del artboard que alguna pestaña usa («Browser» no se usa y no se traslada)', () => {
    expect(architecture.nodes).toHaveLength(42);
    expect(architecture.nodes.map((n) => n.id)).not.toContain('browser');
    expect(design).toContain("browser: ['Browser',");
  });

  it('el inglés de cada pieza es el del artboard, salvo la descripción de «Monitoring» (P-28)', () => {
    for (const n of architecture.nodes) {
      if (n.id === 'monitor') {
        expect(design).toContain(`${n.id}: ['${n.text.en.label}', `);
        expect(design).not.toContain(n.text.en.text);
      } else {
        expect(design, n.id).toContain(`${n.id}: ['${n.text.en.label}', '${n.text.en.text}']`);
      }
    }
  });

  it('una banda punteada es siempre la última y la única opcional de su sistema', () => {
    for (const s of architecture.systems) {
      expect(s.bands.map((b) => b.optional)).toEqual([...s.bands.slice(0, -1).map(() => false), true]);
      expect(s.bands.at(-1)!.band).toBe('optional');
    }
  });

  it('todos los textos están en borrador (P-22) y entran en el informe de textos', () => {
    const blocks = listCopyBlocks().filter((b) => b.path.startsWith('architecture') || b.path === 'messages/architecture');
    // 42 piezas + 17 bandas + 7 sistemas + el espacio de nombres de la página.
    expect(blocks).toHaveLength(42 + 17 + 7 + 1);
    expect(blocks.every((b) => b.copy === 'draft')).toBe(true);
  });
});

describe('Arquitectura: condiciones de P-28', () => {
  const technologies = architecture.nodes.filter((n) => 'technology' in n && n.technology);

  it('las 12 tecnologías del artboard, ni una más ni una menos, con el mismo nombre en los dos idiomas', () => {
    expect(technologies.map((n) => n.text.en.label).sort()).toEqual([...ARCHITECTURE_TECHNOLOGIES].sort());
    for (const n of technologies) expect(n.text.es.label).toBe(n.text.en.label);
  });

  it('fuera de esos 12 nombres y de «Monitoring», ningún texto rompe la política de contenido', () => {
    for (const n of architecture.nodes) {
      for (const locale of ['es', 'en'] as const) {
        expect(findPolicyViolations(n.text[locale].text), `${n.id}.${locale}.text`).toEqual([]);
        if (!technologies.includes(n) && n.id !== 'monitor') expect(findPolicyViolations(n.text[locale].label), `${n.id}.${locale}.label`).toEqual([]);
      }
    }
    // La exención no se cuela: sin ella, los nombres confirmados siguen vedados en cualquier otro contenido.
    expect(findPolicyViolations('PostgreSQL')).not.toEqual([]);
    expect(findPolicyViolations('Monitoring')).not.toEqual([]);
  });

  it('«Monitoring» es una capa de la arquitectura: no promete vigilancia continua, cobertura, alertas ni tiempos', () => {
    const { es, en } = node('monitor').text;
    expect([es.label, en.label]).toEqual(['Monitoreo', 'Monitoring']);
    expect(es.text).toMatch(/^Capa de la arquitectura/);
    expect(en.text).toMatch(/^A layer of the architecture/);
    const promises = /continu|24|siempre|always|alert|aviso|notif|cobertura|coverage|tiempo|response|antes de que|before |garant|guarant|vigila|watch|detect/i;
    expect(es.text).not.toMatch(promises);
    expect(en.text).not.toMatch(promises);
  });

  it('Redis se presenta como opcional, «cuando el proyecto lo requiere»', () => {
    const { es, en } = node('redis').text;
    expect(es.text).toContain('Es opcional: se agrega solo cuando el proyecto lo requiere.');
    expect(en.text).toMatch(/added only when/);
    // Y solo aparece en bandas punteadas.
    for (const s of architecture.systems) for (const b of s.bands) if ((b.nodes as readonly string[]).includes('redis')) expect(b.optional).toBe(true);
  });

  it('Electron es una tecnología general: su texto no menciona al cliente ni el caso POS (P-19)', () => {
    const { es, en } = node('electron').text;
    for (const value of [es.text, en.text]) expect(value).not.toMatch(/POS|punto de venta|point of sale|client|caso|case/i);
  });
});

describe('Arquitectura: el esquema rechaza', () => {
  function rejects(mutate: (c: ContentFixture) => void, expected: RegExp) {
    const c = validContent();
    mutate(c);
    expect(() => validateContent(c)).toThrow(expected);
  }
  const part = (c: ContentFixture) => c.architecture.nodes[0];
  const tech = (c: ContentFixture) => c.architecture.nodes[1];

  it('el contenido de prueba pasa', () => {
    expect(() => validateContent(validContent())).not.toThrow();
  });

  it('una tecnología que P-28 no confirmó', () => {
    rejects((c) => { tech(c).text.es.label = tech(c).text.en.label = 'SQLite'; }, /fuera de la lista confirmada \(P-28\)/);
  });

  it('una tecnología con nombre distinto en cada idioma', () => {
    rejects((c) => { tech(c).text.es.label = 'Express'; }, /fuera de la lista confirmada \(P-28\)/);
  });

  it('una pieza corriente con nombre de tecnología (sin marcarla, no hay exención)', () => {
    rejects((c) => { part(c).text.en.label = 'PostgreSQL'; }, /tecnologia-no-confirmada/);
  });

  it('una pieza que no es la de monitoreo y se llama «Monitoring»', () => {
    rejects((c) => { part(c).text.en.label = 'Monitoring'; }, /monitoreo/);
  });

  it('una descripción que nombra una tecnología o promete monitoreo, aunque la pieza sea una tecnología', () => {
    rejects((c) => { tech(c).text.en.text = 'Built with React'; }, /tecnologia-no-confirmada/);
    rejects((c) => { tech(c).text.es.text = 'Con monitoreo continuo'; }, /monitoreo/);
  });

  it('una banda o una pieza que no existe, una pieza sin usar y un id repetido', () => {
    rejects((c) => { c.architecture.systems[0].bands[0].nodes.push('fantasma'); }, /nodo desconocido «fantasma»/);
    rejects((c) => { c.architecture.systems[0].bands[0].band = 'otra'; }, /banda desconocida «otra»/);
    rejects((c) => { c.architecture.nodes.push({ ...part(c), id: 'suelta' }); }, /nodo «suelta» sin usar/);
    rejects((c) => { c.architecture.nodes.push({ ...part(c) }); }, /id de nodo duplicado: «pieza»/);
  });

  it('menos de 7 tipos de sistema, uno desconocido o una capa fuera de 0–3', () => {
    rejects((c) => { c.architecture.systems.pop(); }, /architecture\.systems/);
    rejects((c) => { c.architecture.systems[0].id = 'otro'; }, /architecture\.systems\[0\]\.id/);
    rejects((c) => { c.architecture.systems[0].bands[0].layer = 4; }, /architecture\.systems\[0\]\.bands\[0\]\.layer/);
  });
});
