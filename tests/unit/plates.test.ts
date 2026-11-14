import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Plates } from '@/components/plates/Plates';
import { DEFS, KINDS, buildPlates, distinctValues } from '@/components/plates/data.mjs';
import { platesCss } from '../../scripts/lib/plates-css.mjs';
import { scanHtml } from '../../scripts/lib/csp-scan.mjs';

// T6b (P-23, opción A): `Plates` sin estilos en línea, con la hoja generada.
const generated = readFileSync('src/styles/plates.generated.css', 'utf8');
const VIEWS = KINDS.flatMap((kind) => [
  { kind, wide: true },
  { kind },
  { kind, tall: true },
  ...(kind === 'stack' ? [0, 1, 2, 3].map((active) => ({ kind, active })) : []),
]);
const render = (props: Parameters<typeof Plates>[0]) => renderToStaticMarkup(createElement(Plates, props));

describe('Plates: datos del diseño', () => {
  it('conserva las 7 composiciones y sus 225 bloques; 201 valores distintos', () => {
    expect(Object.keys(DEFS)).toEqual(['site', 'dash', 'pos', 'saas', 'api', 'inst', 'stack']);
    expect(Object.values(DEFS).flat(2)).toHaveLength(225);
    const v = distinctValues();
    expect(v.x.length + v.y.length + v.w.length + v.h.length).toBe(201);
  });

  it('las clases de capa siguen la lógica del diseño (placa 0 = base = l3; stack activa → is-on)', () => {
    const { plates } = buildPlates({ kind: 'stack', active: 0 });
    expect(plates.map((p) => p.cls.trim().replace(/\s+/g, ' '))).toEqual(['l3 base', 'l2', 'l1', 'l0 top is-on']);
  });
});

describe('Plates: CSP y hoja generada', () => {
  it('la hoja versionada está al día con los datos (ejecutar `node scripts/plates-css.mjs` si falla)', () => {
    expect(generated).toBe(platesCss());
  });

  for (const props of VIEWS) {
    const name = JSON.stringify(props);
    it(`${name}: sin style=, aria-hidden y aceptado por csp-scan`, () => {
      const html = render(props);
      expect(html).not.toMatch(/\sstyle=/);
      expect(html.startsWith('<div class="xv')).toBe(true);
      expect(html).toContain('aria-hidden="true"');
      const page = `<!DOCTYPE html><html><body>${html}</body></html>`;
      expect(scanHtml(page).issues).toEqual([]);
    });
  }

  it('toda clase de valor usada existe en la hoja generada', () => {
    const used = new Set(VIEWS.flatMap((p) => [...render(p).matchAll(/\b(b[xywh]-[0-9_m]+|i-\d)\b/g)].map((m) => m[1])));
    const defined = new Set([...generated.matchAll(/^\.([\w-]+) \{/gm)].map((m) => m[1]));
    expect([...used].filter((c) => !defined.has(c))).toEqual([]);
    expect(used.size).toBe(defined.size); // ninguna regla sobra
  });

  it('los rótulos de stack se pueden localizar (orden 0 Interfaz … 3 Infraestructura)', () => {
    const html = render({ kind: 'stack', layerLabels: ['Interfaz', 'Lógica', 'Datos', 'Infraestructura'] });
    expect([...html.matchAll(/<span class="plate-t">([^<]+)<\/span>/g)].map((m) => m[1])).toEqual(['Infraestructura', 'Datos', 'Lógica', 'Interfaz']);
  });
});
