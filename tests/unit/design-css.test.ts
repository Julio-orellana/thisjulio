import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Fidelidad de design.css (spec 001 §1.3, spec 002 T4): toda regla trasladada
// del diseño existe en docs/design/fuente/site.css con los mismos valores. Las
// adiciones propias van precedidas de un comentario «[app]» y no se comprueban
// aquí (cada una documenta el `style=""` del diseño que reemplaza).
const site = readFileSync('docs/design/fuente/site.css', 'utf8').split('\n').map((l) => l.trim());
const design = readFileSync('src/styles/design.css', 'utf8').split('\n');

const declarations = (line: string) => line.slice(line.indexOf('{'));
const selectors = (line: string) => line.slice(0, line.indexOf('{')).split(',').map((s) => s.trim());

function checkedRules() {
  const out: { n: number; line: string }[] = [];
  let mode: 'site' | 'app' = 'site';
  let inComment = false;
  design.forEach((raw, i) => {
    const line = raw.trim();
    if (inComment || line.startsWith('/*')) {
      if (!inComment) mode = line.includes('[app]') ? 'app' : 'site';
      inComment = !line.includes('*/');
      return;
    }
    if (mode === 'app' || line === '' || line === '}' || line.startsWith('@media') || line.startsWith('@layer') || line.startsWith('@supports')) return;
    out.push({ n: i + 1, line });
  });
  return out;
}

describe('design.css frente a site.css', () => {
  const rules = checkedRules();

  it('comprueba un número razonable de reglas', () => {
    expect(rules.length).toBeGreaterThan(150);
  });

  it('cada regla trasladada existe en site.css: igual, o con los mismos valores y un subconjunto de sus selectores', () => {
    const missing = rules.filter(({ line }) => {
      if (site.includes(line)) return false;
      if (!line.includes('{')) return true; // continuación de una regla multilínea: debe ser literal
      return !site.some(
        (s) => s.includes('{') && declarations(s) === declarations(line) && selectors(line).every((sel) => selectors(s).includes(sel)),
      );
    });
    expect(missing.map((m) => `design.css:${m.n}  ${m.line}`)).toEqual([]);
  });

  it('Deploy (T7): las reglas de site.css 537–549 y 576–577 están completas', () => {
    const css = design.map((l) => l.trim());
    const expected = [...site.slice(536, 549), ...site.slice(575, 577)].filter((l) => l && !l.startsWith('/*'));
    expect(expected.filter((l) => !css.includes(l))).toEqual([]);
  });

  it('Plates (T6b): las reglas de site.css 177–198, 317–319 y 331 están completas', () => {
    const css = design.map((l) => l.trim());
    const expected = [...site.slice(176, 198), ...site.slice(316, 319), site[330]].filter((l) => l && !l.startsWith('/*'));
    expect(expected.filter((l) => !css.includes(l))).toEqual([]);
  });
});
