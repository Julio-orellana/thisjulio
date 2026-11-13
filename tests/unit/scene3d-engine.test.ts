import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { STRIDE, buildGeometry } from '@/components/scene3d/engine';

// Geometría del port frente a la del motor del diseño (spec 003, T3). La huella
// esperada es la del buffer de vértices que el motor ORIGINAL sube a la GPU,
// anotada por el arnés de fidelidad (`tests/fidelity/run.mjs`, traza de
// arranque: `bufferData(ARRAY_BUFFER, Float32Array[383448]:baa3dee5, STATIC_DRAW)`).
const DESIGN_VERTEX_VALUES = 383448;
const DESIGN_VERTEX_FNV1A = 'baa3dee5';
const DESIGN_TRIANGLES = 9830; // `canvas.dataset.triangles` del diseño

const fnv1a = (bytes: Uint8Array) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
};

describe('geometría de la escena 3D', () => {
  const g = buildGeometry();

  it('el buffer de vértices es, byte a byte, el del motor del diseño', () => {
    expect(g.vertices).toHaveLength(DESIGN_VERTEX_VALUES);
    expect(fnv1a(new Uint8Array(new Float32Array(g.vertices).buffer))).toBe(DESIGN_VERTEX_FNV1A);
  });

  it('mismos triángulos que el diseño, más los dos del suelo al final', () => {
    expect(g.triangles).toBe(DESIGN_TRIANGLES);
    expect(g.floorStart).toBe(DESIGN_TRIANGLES * 3);
    expect(g.vertices.length / STRIDE).toBe(DESIGN_TRIANGLES * 3 + 6);
  });

  it('se dibuja en el orden del diseño: sólidos, rutas, las 4 bandejas de abajo arriba y rótulos', () => {
    expect(g.draws.map((d) => d.kind)).toEqual(['solid', 'path', 'glass', 'glass', 'glass', 'glass', 'label']);
    let next = 0;
    for (const d of g.draws) { expect(d.first).toBe(next); expect(d.count % 3).toBe(0); next += d.count; }
    expect(next).toBe(g.floorStart);
    // 15 rótulos y el candado: 16 paneles de 2 triángulos.
    expect(g.draws[6].count).toBe(16 * 6);
    // Cada bandeja es una caja: 12 triángulos.
    for (const d of g.draws.slice(2, 6)) expect(d.count).toBe(36);
  });

  it('12 rutas de datos con longitud, y huellas de oclusión en las 4 capas', () => {
    expect(g.routes).toHaveLength(12);
    for (const r of g.routes) { expect(r.len).toBeGreaterThan(0); expect(r.pts.length).toBeGreaterThanOrEqual(2); }
    expect(new Set(g.foot.map((f) => f[0]))).toEqual(new Set([0, 1, 2, 3]));
  });

  it('construirla dos veces da lo mismo (sin estado compartido)', () => {
    expect(buildGeometry().vertices).toEqual(g.vertices);
  });
});

describe('el motor y la CSP (ADR 006)', () => {
  const files = ['engine.ts', 'engine-shaders.ts', 'engine-profile.ts'].map((f) => [f, readFileSync(`src/components/scene3d/${f}`, 'utf8')] as const);

  it.each(files)('%s no usa eval, Function, workers, blob:, red, HTML en cadena ni atributos style', (_file, source) => {
    const code = source.replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, '');
    for (const banned of [/\beval\s*\(/, /\bnew\s+Function\b/, /\bWorker\b/, /\bimportScripts\b/, /blob:/, /\bfetch\s*\(/, /XMLHttpRequest/, /\binnerHTML\b/, /\bouterHTML\b/, /insertAdjacentHTML/, /setAttribute\(\s*['"]style/, /\.cssText\b/, /https?:\/\//, /localStorage|sessionStorage|document\.cookie/]) {
      expect(code).not.toMatch(banned);
    }
  });

  it.each(files)('%s no depende de React ni de paquetes', (_file, source) => {
    const imports = [...source.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
    for (const spec of imports) expect(spec).toMatch(/^\.\/engine-(profile|shaders)$/);
  });
});
