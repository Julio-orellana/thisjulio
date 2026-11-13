// @ts-check
/**
 * Datos de `Plates` (vista explotada del diseño), port LITERAL de
 * `Plates.dc.html` → renderVals() (huella e960511d1b7f2c7d). La aritmética es
 * la misma, así que salen los mismos decimales de coma flotante que en el
 * diseño (p. ej. 48.800000000000004): el render es idéntico (T6a, P-23,
 * opción A). Es un módulo JS para que lo use también el generador de CSS
 * (scripts/plates-css.mjs) sin paso de compilación.
 *
 * @typedef {'l' | 'f' | 's' | 'a' | 'al'} BlockClass
 * @typedef {{ c: BlockClass, x: number, y: number, w: number, h: number }} Block
 * @typedef {'site' | 'dash' | 'inst' | 'pos' | 'saas' | 'api' | 'stack'} PlateKind
 * @typedef {{ i: number, cls: string, blocks: Block[], hasLabel: boolean, label: string }} Plate
 */
/** @type {readonly PlateKind[]} */
export const KINDS = ['site', 'dash', 'inst', 'pos', 'saas', 'api', 'stack'];
export const LABELS = ['Infrastructure', 'Data', 'Logic', 'Interface'];
export const PINS = [{ x: 4, y: 6 }, { x: 96, y: 6 }, { x: 96, y: 94 }, { x: 4, y: 94 }];

/** @type {(c: BlockClass, x: number, y: number, w: number, h: number) => Block} */
const b = (c, x, y, w, h) => ({ c, x, y, w, h });
/** @type {(c: BlockClass, x: number, y: number, w: number, n: number, step: number, h: number) => Block[]} */
const rows = (c, x, y, w, n, step, h) => Array.from({ length: n }, (_, i) => b(c, x, y + i * step, w, h));
/** @type {(c: BlockClass, x: number, y: number, cols: number, rowsN: number, w: number, h: number, gx: number, gy: number) => Block[]} */
const tiles = (c, x, y, cols, rowsN, w, h, gx, gy) => {
  /** @type {Block[]} */
  const out = [];
  for (let r = 0; r < rowsN; r++) for (let k = 0; k < cols; k++) out.push(b(c, x + k * (w + gx), y + r * (h + gy), w, h));
  return out;
};

/** @type {Record<PlateKind, Block[][]>} */
export const DEFS = {
  site: [
    [b('l', 6, 10, 88, 80), ...tiles('f', 10, 16, 3, 3, 24, 18, 3, 6)],
    [...rows('f', 8, 12, 84, 5, 16, 9)],
    [b('l', 8, 12, 40, 76), b('l', 52, 12, 40, 34), b('l', 52, 54, 40, 34)],
    [b('f', 5, 8, 90, 7), b('a', 5, 8, 16, 7), b('s', 5, 24, 58, 13), b('f', 5, 41, 44, 4), b('f', 5, 48, 36, 4), b('al', 5, 58, 20, 9), b('l', 52, 58, 43, 32)]
  ],
  dash: [
    [...tiles('f', 8, 12, 4, 3, 19, 22, 4, 6)],
    [b('l', 6, 10, 42, 80), b('l', 52, 10, 42, 80), ...rows('f', 10, 18, 34, 5, 13, 6)],
    [...rows('f', 54, 16, 38, 6, 12, 5), b('s', 8, 14, 38, 2)],
    [b('f', 3, 5, 15, 90), ...rows('s', 6, 12, 9, 6, 12, 4), b('l', 22, 8, 22, 24), b('a', 48, 8, 22, 24), b('l', 74, 8, 22, 24), ...[36, 52, 44, 60, 50, 70, 62].map((v, i) => b(i === 5 ? 'a' : 's', 24 + i * 10.4, 92 - v * .72, 7, v * .72))]
  ],
  pos: [
    [b('l', 8, 12, 36, 76), b('f', 12, 20, 28, 16), b('s', 12, 42, 28, 4), b('l', 52, 12, 40, 76), ...tiles('f', 56, 20, 3, 3, 9.5, 18, 2.5, 5)],
    [...tiles('l', 18, 34, 6, 1, 8, 28, 3, 0), b('a', 18, 70, 64, 5)],
    [...rows('f', 8, 14, 84, 6, 12, 6)],
    [...tiles('f', 4, 7, 4, 3, 13, 25, 2.5, 4), b('a', 19.5, 7, 13, 25), b('l', 67, 7, 29, 62), ...rows('f', 70, 13, 23, 5, 9, 4), b('a', 67, 74, 29, 19)]
  ],
  saas: [
    [b('l', 8, 12, 25, 76), b('al', 37, 12, 25, 76), b('l', 66, 12, 25, 76), b('f', 11, 18, 19, 8), b('a', 40, 18, 19, 8), b('f', 69, 18, 19, 8)],
    [...tiles('f', 8, 14, 5, 3, 14, 20, 4, 8)],
    [b('l', 7, 12, 86, 24), b('l', 7, 42, 41, 46), b('l', 52, 42, 41, 46), ...rows('f', 11, 50, 33, 3, 12, 6)],
    [b('f', 3, 5, 94, 9), b('a', 5, 7.5, 12, 4), ...tiles('l', 3, 20, 3, 1, 29.3, 24, 3, 0), ...rows('f', 3, 50, 94, 4, 11, 7), b('s', 3, 50, 42, 7)]
  ],
  api: [
    [...rows('f', 8, 14, 84, 7, 11, 5)],
    [b('l', 8, 18, 22, 64), b('l', 39, 18, 22, 64), b('l', 70, 18, 22, 64), b('s', 30, 48, 9, 1.4), b('s', 61, 48, 9, 1.4)],
    [...tiles('l', 12, 18, 5, 2, 12, 28, 4, 8)],
    [...rows('l', 5, 10, 60, 5, 17, 12), ...[0, 1, 2, 3, 4].map(i => b(i === 2 ? 'a' : 's', 8, 13.5 + i * 17, 10, 5)), ...[0, 1, 2, 3, 4].map(i => b('f', 22, 13.5 + i * 17, 38, 5)), b('al', 70, 10, 25, 80)]
  ],
  inst: [
    [...tiles('l', 10, 14, 3, 2, 24, 32, 4, 8)],
    [b('l', 8, 12, 84, 34), ...rows('f', 12, 56, 76, 3, 11, 6)],
    [b('f', 8, 12, 18, 76), ...rows('f', 32, 16, 60, 6, 12, 6)],
    [b('f', 3, 6, 45, 7), b('s', 3, 20, 38, 11), b('f', 3, 36, 30, 4), b('a', 3, 46, 15, 8), b('l', 3, 60, 45, 32), b('l', 53, 6, 44, 88), b('f', 53, 6, 11, 88), ...rows('s', 55, 14, 7, 5, 11, 4), ...tiles('f', 68, 12, 2, 2, 11.5, 20, 3, 5), b('a', 68, 58, 26, 6), ...rows('f', 68, 70, 26, 2, 9, 4)]
  ],
  stack: [[], [], [], []]
};

/**
 * Mismo resultado que renderVals() del diseño.
 * @param {{ kind?: PlateKind, active?: number, tall?: boolean, wide?: boolean, flat?: boolean, layer?: number }} [props]
 * @returns {{ plates: Plate[], pins: typeof PINS, xvCls: string }}
 */
export function buildPlates({ kind = 'pos', active = -1, tall = false, wide = false, flat = false, layer = 3 } = {}) {
  const layers = DEFS[kind] || DEFS.pos;
  const last = layers.length - 1;
  const plates = layers.map((blocks, i) => ({
    i, blocks,
    cls: ['l' + (last - i), i === 0 ? 'base' : '', i === last ? 'top' : '', kind === 'stack' && active === last - i ? 'is-on' : '', flat && i === (layer ?? last) ? 'show' : ''].join(' '),
    hasLabel: kind === 'stack',
    label: LABELS[i]
  }));
  return { plates, pins: PINS, xvCls: [tall ? 'tall' : '', wide ? 'wide' : '', flat ? 'flat' : ''].join(' ') };
}

/**
 * Valores numéricos distintos por propiedad (bloques y pines), ordenados.
 * @returns {{ x: number[], y: number[], w: number[], h: number[] }}
 */
export function distinctValues() {
  /** @type {{ x: Set<number>, y: Set<number>, w: Set<number>, h: Set<number> }} */
  const v = { x: new Set(), y: new Set(), w: new Set(), h: new Set() };
  for (const layers of Object.values(DEFS)) for (const blocks of layers) for (const bl of blocks) for (const k of /** @type {const} */ (['x', 'y', 'w', 'h'])) v[k].add(bl[k]);
  for (const p of PINS) { v.x.add(p.x); v.y.add(p.y); }
  /** @param {Set<number>} s */
  const sorted = (s) => [...s].sort((a, b) => a - b);
  return { x: sorted(v.x), y: sorted(v.y), w: sorted(v.w), h: sorted(v.h) };
}

/**
 * Nombre de clase de un valor: 19.5 → «19_5» (opción A, P-23).
 * @param {number} n
 */
export const token = (n) => String(n).replace('-', 'm').replace('.', '_');
