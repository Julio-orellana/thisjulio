import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// CA-2: tokens.css reproduce exactamente :root del diseño aprobado.
const designCss = readFileSync('docs/design/fuente/site.css', 'utf8');
const tokensCss = readFileSync('src/styles/tokens.css', 'utf8');

function rootVars(css: string): Map<string, string> {
  const block = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error('No se encontró :root');
  const vars = new Map<string, string>();
  for (const m of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars.set(m[1], m[2].trim());
  return vars;
}

describe('tokens del diseño', () => {
  it('la copia de referencia es la versión aprobada del diseño (SHA-256 aac3072a2970729a…)', () => {
    const hash = createHash('sha256').update(readFileSync('docs/design/fuente/site.css')).digest('hex');
    expect(hash.startsWith('aac3072a2970729a')).toBe(true);
  });

  it('tokens.css declara las mismas variables con los mismos valores que site.css', () => {
    const expected = rootVars(designCss);
    const actual = rootVars(tokensCss);
    expect(expected.size).toBeGreaterThan(40);
    expect(Object.fromEntries(actual)).toEqual(Object.fromEntries(expected));
  });

  it('incluye la paleta aprobada en el prompt de dirección técnica', () => {
    const v = rootVars(tokensCss);
    expect({
      bg: v.get('--bg'), secondary: v.get('--bg-2'), surface: v.get('--surface'),
      text: v.get('--text'), text2: v.get('--text-2'), blue: v.get('--accent'),
      cyan: v.get('--cyan'), violet: v.get('--violet'), steel: v.get('--steel'),
    }).toEqual({
      bg: '#090A0D', secondary: '#12151B', surface: '#202630',
      text: '#E8EAF0', text2: '#929AA8', blue: '#78A9FF',
      cyan: '#55DCEB', violet: '#9B8CFF', steel: '#C9D3E3',
    });
  });
});
