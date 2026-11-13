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

  it('no hay estilos de Plates ni de Deploy antes de su tarea (T6b, T7)', () => {
    const css = design.join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/\.(xv|xv-scene|plate|blk|pin|dep|dep-grid)\b[^-]/);
  });
});
