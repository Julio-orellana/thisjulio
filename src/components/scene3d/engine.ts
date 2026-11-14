/**
 * Motor WebGL 1 de la escena de arquitectura (spec 003, T3; P-26 = A).
 *
 * Port de `docs/design/fuente/Arch3D.dc.html` a TypeScript, sin React y sin
 * dependencias. Geometría, materiales, colores, cámara, sombras horneadas,
 * perfiles de calidad y orden de las llamadas a WebGL son los de la fuente: la
 * fidelidad se mide cuadro a cuadro contra el motor original
 * (`tests/fidelity/`). Lo que la fuente no hacía y aquí se añade:
 *
 * - `dispose()`: cancela el bucle, desconecta observadores y escuchas, borra
 *   buffers, texturas, framebuffer, renderbuffer, programas y shaders, y suelta
 *   el contexto (`WEBGL_lose_context`).
 * - Los 15 rótulos del atlas llegan por parámetro (`labels`, `setLabels`); uno
 *   vacío deja su celda transparente.
 * - El atlas se repinta cuando la fuente tipográfica está cargada y, con
 *   `prefers-reduced-motion`, se redibuja el cuadro fijo.
 *
 * Este módulo no se ejecuta al importarse: solo `createEngine` toca el DOM.
 */
import {
  ATLAS_SIZE,
  QUALITY,
  atlasLabels,
  backingStore,
  framing,
  labelRect,
  ladder,
  pickProfile,
  probe,
  type QualitySetting,
  type Rect,
} from './engine-profile';
import { DEPTH_FS, DEPTH_VS, GLOW_FS, GLOW_VS, SCENE_VS, sceneFragmentShader } from './engine-shaders';

export type SceneMode = 'hero' | 'diagram';

export interface EngineOptions {
  mode: SceneMode;
  /** Los 15 rótulos del atlas, en el orden de sus celdas (ver `engine-profile`). */
  labels: readonly string[];
  /** Capa resaltada, 0–3; −1 = todas. */
  active?: number;
  quality?: QualitySetting;
  /** Las 4 etiquetas DOM de las capas, en orden; el motor solo las posiciona. */
  tags?: () => ArrayLike<HTMLElement | null>;
  onPick?: (layer: number) => void;
  /** El contexto se perdió: quien monta el motor muestra el respaldo. */
  onContextLost?: () => void;
  /** Familias CSS de los rótulos del atlas. Por defecto, las del diseño. */
  labelFont?: string;
}

export interface Engine {
  setActive(layer: number): void;
  setHover(layer: number): void;
  setLabels(labels: readonly string[]): void;
  dispose(): void;
}

type V2 = [number, number];
type V3 = [number, number, number];
type Vec = ArrayLike<number>;
type DrawKind = 'solid' | 'path' | 'glass' | 'label';

export interface SceneGeometry {
  /** Vértices intercalados, `STRIDE` valores por vértice; el suelo va al final. */
  vertices: number[];
  draws: { first: number; count: number; kind: DrawKind }[];
  floorStart: number;
  /** Triángulos de la escena sin contar el suelo. */
  triangles: number;
  /** Huellas de los objetos sobre cada bandeja, para la oclusión horneada. */
  foot: [layer: number, x: number, z: number, a: number, d: number, round: number][];
  routes: { col: number; pts: V3[]; len: number }[];
}

/** Valores por vértice: posición 3, normal 3, uv 2, color 3, capa 1, material 1. */
export const STRIDE = 13;
/** Familias de los rótulos del atlas en el diseño. */
export const LABEL_FONT = '"JetBrains Mono", ui-monospace, Menlo, monospace';

// Colores de capa: interfaz azul, lógica cian, datos violeta, infraestructura acero
const LC: V3[] = [[.47, .66, 1], [.33, .86, .92], [.61, .55, 1], [.79, .83, .89]];
const LY = [2.7, .72, -1.26, -3.24];
const TW = 3.15, TD = 1.8;
const camYaw = -.66;
const AS = ATLAS_SIZE;
const BG: V3 = [9 / 255, 10 / 255, 13 / 255];

// Atlas de texturas: contenido real de interfaz, para que cada objeto se lea como lo que es
const R: Record<'web' | 'desk' | 'phone' | 'rack' | 'lock', Rect> = {
  web: [0, 0, 1024, 640], desk: [1024, 0, 1024, 640], phone: [0, 640, 320, 640], rack: [340, 640, 512, 256], lock: [860, 640, 256, 256],
};

const seglen = (a: Vec, b: Vec) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
const norm = (v: Vec): V3 => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const mul = (a: number[], b: number[]) => { const o = new Array<number>(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
const look = (e: Vec, t: Vec) => {
  const z = norm([e[0] - t[0], e[1] - t[1], e[2] - t[2]]);
  const x = norm([z[2], 0, -z[0]]);
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
};

/** La escena es estática: su geometría se construye una vez, sin tocar WebGL. */
export function buildGeometry(): SceneGeometry {
  const verts = { solid: [] as number[], glass: [[], [], [], []] as number[][], path: [] as number[], label: [] as number[] };
  const foot: SceneGeometry['foot'] = [];
  const push = (arr: number[], p: Vec, n: Vec, uv: Vec, col: Vec, layer: number, mat: number) => { arr.push(p[0], p[1], p[2], n[0], n[1], n[2], uv[0], uv[1], col[0], col[1], col[2], layer, mat); };
  const quad = (arr: number[], a: Vec, b: Vec, c: Vec, d: Vec, n: Vec, uvs: Vec[], col: Vec, layer: number, mat: number) => {
    push(arr, a, n, uvs[0], col, layer, mat); push(arr, b, n, uvs[1], col, layer, mat); push(arr, c, n, uvs[2], col, layer, mat);
    push(arr, a, n, uvs[0], col, layer, mat); push(arr, c, n, uvs[2], col, layer, mat); push(arr, d, n, uvs[3], col, layer, mat);
  };
  const UV0: V2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const rectUV = (r: Rect): V2[] => { const u0 = r[0] / AS, u1 = (r[0] + r[2]) / AS, v0 = 1 - (r[1] + r[3]) / AS, v1 = 1 - r[1] / AS; return [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]; };
  const addBox = (arr: number[], c: V3, h: V3, col: Vec, layer: number, mat: number) => {
    const [x, y, z] = c, [a, b, d] = h;
    if (arr === verts.solid && mat === 0 && layer < 4 && y - b - LY[layer] < .2) foot.push([layer, x, z, a, d, 0]);
    const v = (sx: number, sy: number, sz: number): V3 => [x + sx * a, y + sy * b, z + sz * d];
    quad(arr, v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1), [0, 0, 1], UV0, col, layer, mat);
    quad(arr, v(1, -1, -1), v(-1, -1, -1), v(-1, 1, -1), v(1, 1, -1), [0, 0, -1], UV0, col, layer, mat);
    quad(arr, v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1), v(-1, 1, -1), [0, 1, 0], UV0, col, layer, mat);
    quad(arr, v(-1, -1, -1), v(1, -1, -1), v(1, -1, 1), v(-1, -1, 1), [0, -1, 0], UV0, col, layer, mat);
    quad(arr, v(1, -1, 1), v(1, -1, -1), v(1, 1, -1), v(1, 1, 1), [1, 0, 0], UV0, col, layer, mat);
    quad(arr, v(-1, -1, -1), v(-1, -1, 1), v(-1, 1, 1), v(-1, 1, -1), [-1, 0, 0], UV0, col, layer, mat);
  };
  const addCyl = (arr: number[], c: V3, r: number, hh: number, col: Vec, layer: number, mat: number, seg?: number) => {
    const n = seg || 64;
    if (arr === verts.solid && mat === 0 && c[1] - hh - LY[layer] < .2) foot.push([layer, c[0], c[2], r, r, 1]);
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
      const p = (a: number, y: number): V3 => [c[0] + Math.cos(a) * r, y, c[2] + Math.sin(a) * r];
      const n0 = [Math.cos(a0), 0, Math.sin(a0)], n1 = [Math.cos(a1), 0, Math.sin(a1)];
      const t = c[1] + hh, b = c[1] - hh;
      push(arr, p(a1, b), n1, [.5, 0], col, layer, mat); push(arr, p(a0, b), n0, [.5, 0], col, layer, mat); push(arr, p(a0, t), n0, [.5, 1], col, layer, mat);
      push(arr, p(a1, b), n1, [.5, 0], col, layer, mat); push(arr, p(a0, t), n0, [.5, 1], col, layer, mat); push(arr, p(a1, t), n1, [.5, 1], col, layer, mat);
      push(arr, [c[0], t, c[2]], [0, 1, 0], [.5, .5], col, layer, mat); push(arr, p(a1, t), [0, 1, 0], [0, .5], col, layer, mat); push(arr, p(a0, t), [0, 1, 0], [0, .5], col, layer, mat);
    }
  };
  const addSphere = (arr: number[], c: V3, r: number, col: Vec, layer: number, mat: number) => {
    const seg = 40, rings = 24;
    const p = (u: number, v: number): [V3, V3] => { const th = u * Math.PI * 2, ph = v * Math.PI; const n: V3 = [Math.cos(th) * Math.sin(ph), Math.cos(ph), Math.sin(th) * Math.sin(ph)]; return [[c[0] + n[0] * r, c[1] + n[1] * r, c[2] + n[2] * r], n]; };
    for (let i = 0; i < seg; i++) for (let k = 0; k < rings; k++) {
      const a = p(i / seg, k / rings), b = p((i + 1) / seg, k / rings), d = p((i + 1) / seg, (k + 1) / rings), e = p(i / seg, (k + 1) / rings);
      [a, d, b, a, e, d].forEach(q => push(arr, q[0], q[1], [0, 0], col, layer, mat));
    }
  };
  // Panel vertical orientado hacia la dirección de reposo de la cámara
  const addPanel = (arr: number[], c: V3, w: number, h: number, rect: Rect, layer: number, mat: number, yaw?: number) => {
    const a = yaw === undefined ? -camYaw : yaw;
    const ca = Math.cos(a), sa = Math.sin(a);
    const ux = [ca * w / 2, 0, -sa * w / 2], uy = [0, h / 2, 0];
    const n = [sa, 0, ca];
    const V = (s: number, t: number): V3 => [c[0] + s * ux[0] + t * uy[0], c[1] + s * ux[1] + t * uy[1], c[2] + s * ux[2] + t * uy[2]];
    const uv = rectUV(rect);
    quad(arr, V(-1, -1), V(1, -1), V(1, 1), V(-1, 1), n, uv, [1, 1, 1], layer, mat);
  };
  const offset = (c: V3, d: number, a?: number): V3 => { const y = a === undefined ? -camYaw : a; return [c[0] + Math.sin(y) * d, c[1], c[2] + Math.cos(y) * d]; };
  const dark: V3 = [.09, .115, .155], steel: V3 = [.2, .24, .3];
  const device = (c: V3, w: number, h: number, rect: Rect, layer: number, frame: number) => {
    const y = -camYaw, ca = Math.cos(y), sa = Math.sin(y);
    const t = .05;
    const hw = [ca * (w / 2 + frame), 0, -sa * (w / 2 + frame)], hd = [sa * t, 0, ca * t], hh = h / 2 + frame;
    const P = (s: number, u: number, d: number): V3 => [c[0] + s * hw[0] + d * hd[0], c[1] + u * hh, c[2] + s * hw[2] + d * hd[2]];
    const faces: V3[][] = [[[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], [sa, 0, ca]], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1], [-sa, 0, -ca]], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1], [0, 1, 0]], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1], [ca, 0, -sa]], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-ca, 0, sa]], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [0, -1, 0]]];
    faces.forEach(f => quad(verts.solid, P(...f[0]), P(...f[1]), P(...f[2]), P(...f[3]), f[4], UV0, dark, layer, 0));
    addPanel(verts.solid, offset(c, t + .004), w, h, rect, layer, 2);
  };
  const tag = (c: V3, i: number, layer: number) => addPanel(verts.label, c, 1.2, .277, labelRect(i), layer, 2);

  // Bandejas de vidrio
  LY.forEach((y, i) => addBox(verts.glass[i], [0, y, 0], [TW, .022, TD], LC[i], i, 1));

  // 01 Interfaz: aplicaciones web, de escritorio y móviles
  const y0 = LY[0];
  device([-1.25, y0 + .92, -.25], 2.1, 1.31, R.web, 0, .05);
  addBox(verts.solid, [-1.25, y0 + .12, -.25], [.05, .1, .05], steel, 0, 0);
  tag([-1.25, y0 + 1.86, -.25], 0, 0);
  device([1.35, y0 + .78, -.95], 1.62, 1.01, R.desk, 0, .07);
  addBox(verts.solid, [1.35, y0 + .16, -.95], [.08, .14, .08], steel, 0, 0);
  addBox(verts.solid, [1.35, y0 + .04, -.95], [.42, .02, .24], steel, 0, 0);
  tag([1.35, y0 + 1.52, -.95], 1, 0);
  device([1.75, y0 + .6, .95], .46, .92, R.phone, 0, .04);
  tag([1.75, y0 + 1.28, .95], 2, 0);

  // 02 Lógica: servicios, API, reglas, automatización
  const y1 = LY[1];
  const nodes1: V2[] = [[-1.9, -.5], [0, -.95], [1.95, -.5], [.15, .95]];
  nodes1.forEach((n, i) => {
    addBox(verts.solid, [n[0], y1 + .17, n[1]], [.52, .15, .4], dark, 1, 0);
    addBox(verts.solid, [n[0], y1 + .326, n[1] + .26], [.36, .006, .018], LC[1], 1, 3);
    addBox(verts.solid, [n[0] - .1, y1 + .326, n[1] + .19], [.26, .006, .012], LC[0], 1, 3);
    tag([n[0], y1 + .62, n[1]], 3 + i, 1);
  });

  // 03 Datos: relacional, documental, almacenamiento, sincronización
  const y2 = LY[2];
  [0, 1, 2].forEach(i => {
    addCyl(verts.solid, [-1.75, y2 + .14 + i * .3, -.45], .58, .118, dark, 2, 0);
    if (i < 2) addCyl(verts.solid, [-1.75, y2 + .29 + i * .3, -.45], .6, .012, LC[2], 2, 3);
  });
  tag([-1.75, y2 + 1.2, -.45], 7, 2);
  [0, 1, 2, 3].forEach(i => {
    addBox(verts.solid, [.2 + i * .04, y2 + .08 + i * .15, -.85 + i * .05], [.5, .05, .36], i === 3 ? steel : dark, 2, 0);
    addBox(verts.solid, [.2 + i * .04, y2 + .134 + i * .15, -.85 + i * .05], [.38, .006, .025], LC[2], 2, 3);
  });
  tag([.3, y2 + .96, -.8], 8, 2);
  addBox(verts.solid, [1.95, y2 + .24, -.5], [.48, .22, .48], dark, 2, 0);
  addBox(verts.solid, [1.95, y2 + .466, -.14], [.3, .006, .016], LC[2], 2, 3);
  tag([1.95, y2 + .76, -.5], 9, 2);
  addCyl(verts.solid, [.15, y2 + .02, .95], .46, .012, LC[1], 2, 3);
  addCyl(verts.solid, [.15, y2 + .11, .95], .42, .08, dark, 2, 0);
  tag([.15, y2 + .5, .95], 10, 2);

  // 04 Infraestructura: nube, servidores locales, red, seguridad
  const y3 = LY[3];
  ([[-2.25, -.6], [-1.55, -.6], [-.85, -.6]] as V2[]).forEach(n => {
    addBox(verts.solid, [n[0], y3 + .43, n[1]], [.31, .41, .3], dark, 3, 0);
    addPanel(verts.solid, [n[0], y3 + .43, n[1] + .305], .55, .72, R.rack, 3, 2, 0);
  });
  tag([-2.32, y3 + 1.04, -.6], 12, 3);
  [[1.7, .66, -.6, .5], [2.2, .55, -.6, .4], [1.22, .52, -.55, .35], [1.78, .95, -.5, .36]].forEach(s => addSphere(verts.solid, [s[0], y3 + s[1], s[2]], s[3], [.5, .68, .9], 3, 5));
  tag([1.72, y3 + 1.56, -.55], 11, 3);
  addBox(verts.solid, [-.6, y3 + .1, 1], [.95, .08, .22], dark, 3, 0);
  for (let i = 0; i < 8; i++) addBox(verts.solid, [-1.35 + i * .215, y3 + .1, 1.222], [.05, .03, .004], LC[1], 3, 3);
  tag([-.6, y3 + .45, 1], 13, 3);
  addPanel(verts.label, [1.8, y3 + .46, 1.05], .7, .7, R.lock, 3, 2);
  tag([1.8, y3 + 1.02, 1.05], 14, 3);

  // Rutas de datos entre capas: una petición recorre todas las capas y vuelve
  const Y = LY;
  const routes: SceneGeometry['routes'] = [
    { col: 1, pts: [[-1.25, Y[0] + .02, -.25], [-1.25, Y[1] + .03, -.25], [0, Y[1] + .03, -.25], [0, Y[1] + .03, -.55]], len: 0 },
    { col: 1, pts: [[1.75, Y[0] + .02, .95], [1.75, Y[1] + .03, .95], [.67, Y[1] + .03, .95]], len: 0 },
    { col: 1, pts: [[1.35, Y[0] + .02, -.95], [1.35, Y[1] + .03, -.95], [1.95, Y[1] + .03, -.95], [1.95, Y[1] + .03, -.9]], len: 0 },
    { col: 2, pts: [[-1.9, Y[1] + .02, -.45], [-1.9, Y[2] + 1.0, -.45]], len: 0 },
    { col: 2, pts: [[0, Y[1] + .02, -.85], [.24, Y[1] + .02, -.85], [.24, Y[2] + .56, -.85]], len: 0 },
    { col: 2, pts: [[1.95, Y[1] + .02, -.5], [1.95, Y[2] + .47, -.5]], len: 0 },
    { col: 2, pts: [[.15, Y[1] + .02, .95], [.15, Y[2] + .2, .95]], len: 0 },
    { col: 3, pts: [[-1.75, Y[2] + .02, -.45], [-1.55, Y[3] + .86, -.6]], len: 0 },
    { col: 3, pts: [[1.95, Y[2] + .02, -.5], [1.72, Y[3] + 1.28, -.55]], len: 0 },
    { col: 3, pts: [[.15, Y[2] + .02, .95], [.15, Y[3] + .03, .95], [.35, Y[3] + .03, 1]], len: 0 },
  ];
  routes.push({ col: 1, pts: [[-1.9, Y[1] + .03, -.5], [-1.9, Y[1] + .03, .25], [1.95, Y[1] + .03, .25], [1.95, Y[1] + .03, -.1]], len: 0 });
  routes.push({ col: 3, pts: [[-1.55, Y[3] + .03, -.25], [-1.55, Y[3] + .03, .55], [1.8, Y[3] + .03, .55]], len: 0 });
  routes.forEach(r => {
    let s = 0; r.len = 0;
    for (let i = 1; i < r.pts.length; i++) {
      const a = r.pts[i - 1], b = r.pts[i], L = seglen(a, b);
      const t = .011;
      const m: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
      const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      // Segmentos alineados a un eje; los inclinados se emiten como una cinta fina
      const axis = [Math.abs(d[0]) < 1e-3, Math.abs(d[1]) < 1e-3, Math.abs(d[2]) < 1e-3].filter(Boolean).length;
      const n = verts.path.length;
      if (axis >= 2) addBox(verts.path, m, [Math.max(t, Math.abs(d[0]) / 2), Math.max(t, Math.abs(d[1]) / 2), Math.max(t, Math.abs(d[2]) / 2)], LC[r.col], 4 + Math.min(2, r.col), 4);
      else {
        const w = [t * Math.cos(-camYaw), 0, -t * Math.sin(-camYaw)];
        quad(verts.path, [a[0] - w[0], a[1], a[2] - w[2]], [a[0] + w[0], a[1], a[2] + w[2]], [b[0] + w[0], b[1], b[2] + w[2]], [b[0] - w[0], b[1], b[2] - w[2]], [0, 1, 0], UV0, LC[r.col], 4 + Math.min(2, r.col), 4);
      }
      for (let k = n; k < verts.path.length; k += 13) { const q = [verts.path[k], verts.path[k + 1], verts.path[k + 2]]; verts.path[k + 6] = s + Math.hypot(q[0] - a[0], q[1] - a[1], q[2] - a[2]); }
      s += L;
    }
    r.len = s;
  });

  const all: number[] = [], draws: SceneGeometry['draws'] = [];
  const take = (arr: number[], kind: DrawKind) => { draws.push({ first: all.length / STRIDE, count: arr.length / STRIDE, kind }); for (let i = 0; i < arr.length; i++) all.push(arr[i]); };
  take(verts.solid, 'solid');
  take(verts.path, 'path');
  for (let i = 3; i >= 0; i--) take(verts.glass[i], 'glass');
  take(verts.label, 'label');
  const triangles = Math.round(all.length / STRIDE / 3);
  const floorStart = all.length / STRIDE;
  const fy = LY[3] - .9, FS = 22;
  quad(all, [-FS, fy, FS], [FS, fy, FS], [FS, fy, -FS], [-FS, fy, -FS], [0, 1, 0], [[-FS, FS], [FS, FS], [FS, -FS], [-FS, -FS]], [0, 0, 0], 3, 6);

  return { vertices: all, draws, floorStart, triangles, foot, routes };
}

/** Pinta el atlas (interfaces, bastidor, candado y los 15 rótulos) en un canvas 2D. */
function paintAtlas(atlas: HTMLCanvasElement, atlasPx: number, labels: readonly string[], font: string): void {
  const c = atlas.getContext('2d');
  if (!c) return;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, atlasPx, atlasPx);
  c.scale(atlasPx / AS, atlasPx / AS);
  const box = (x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const out = (x: number, y: number, w: number, h: number, col: string, lw?: number) => { c.strokeStyle = col; c.lineWidth = lw || 2; c.strokeRect(x, y, w, h); };
  const blue = '#78A9FF', cyan = '#55DCEB', violet = '#9B8CFF', dim = '#33425A', ink = '#0B1019', mid = '#16202E';
  // Aplicación web
  let [x, y] = R.web;
  box(x, y, 1024, 640, ink); box(x, y, 1024, 52, mid);
  [0, 1, 2].forEach(i => { c.fillStyle = [blue, cyan, violet][i]; c.beginPath(); c.arc(x + 30 + i * 28, y + 26, 8, 0, 7); c.fill(); });
  box(x + 130, y + 14, 620, 24, '#0E1623');
  box(x + 40, y + 88, 420, 34, '#DDE5F2'); box(x + 40, y + 140, 320, 14, '#6B7A91'); box(x + 40, y + 166, 260, 14, '#6B7A91');
  box(x + 40, y + 208, 170, 44, blue);
  for (let i = 0; i < 3; i++) { box(x + 40 + i * 316, y + 300, 296, 290, mid); out(x + 40 + i * 316, y + 300, 296, 290, dim); box(x + 66 + i * 316, y + 330, 150, 16, '#A9B6C9'); box(x + 66 + i * 316, y + 362, 240, 10, '#55637A'); box(x + 66 + i * 316, y + 384, 200, 10, '#55637A'); }
  c.strokeStyle = cyan; c.lineWidth = 5; c.beginPath(); [[560, 230], [640, 160], [720, 190], [800, 110], [880, 140], [970, 82]].forEach((p, i) => (i ? c.lineTo(x + p[0], y + p[1]) : c.moveTo(x + p[0], y + p[1]))); c.stroke();
  // Aplicación de escritorio
  [x, y] = R.desk;
  box(x, y, 1024, 640, ink); box(x, y, 210, 640, mid);
  for (let i = 0; i < 7; i++) box(x + 30, y + 40 + i * 62, i === 1 ? 150 : 130, 16, i === 1 ? blue : '#55637A');
  [0, 1, 2].forEach(i => { box(x + 240 + i * 256, y + 34, 236, 120, mid); out(x + 240 + i * 256, y + 34, 236, 120, dim); box(x + 262 + i * 256, y + 60, 90, 12, '#7F8EA5'); box(x + 262 + i * 256, y + 90, 150, 30, i === 1 ? cyan : '#DDE5F2'); });
  for (let i = 0; i < 8; i++) { box(x + 240, y + 186 + i * 54, 750, 42, i === 0 ? '#1E2B3E' : mid); box(x + 262, y + 202 + i * 54, 170, 10, '#8795AC'); box(x + 520, y + 202 + i * 54, 120, 10, '#55637A'); box(x + 780, y + 202 + i * 54, 90, 10, i % 3 ? '#55637A' : violet); }
  // Teléfono
  [x, y] = R.phone;
  box(x, y, 320, 640, ink); box(x + 110, y + 22, 100, 12, '#2C3A4E');
  box(x + 26, y + 66, 190, 26, '#DDE5F2'); box(x + 26, y + 118, 268, 180, mid); out(x + 26, y + 118, 268, 180, dim);
  c.strokeStyle = blue; c.lineWidth = 5; c.beginPath(); [[46, 270], [100, 220], [150, 240], [210, 170], [274, 190]].forEach((p, i) => (i ? c.lineTo(x + p[0], y + p[1]) : c.moveTo(x + p[0], y + p[1]))); c.stroke();
  for (let i = 0; i < 3; i++) { box(x + 26, y + 322 + i * 78, 268, 62, mid); box(x + 44, y + 340 + i * 78, 120, 12, '#8795AC'); box(x + 44, y + 360 + i * 78, 170, 8, '#55637A'); }
  box(x + 26, y + 566, 268, 50, cyan);
  // Frente del bastidor
  [x, y] = R.rack;
  box(x, y, 512, 256, '#0C1118');
  for (let i = 0; i < 4; i++) { box(x + 14, y + 14 + i * 60, 484, 48, '#141C28'); for (let k = 0; k < 16; k++) box(x + 150 + k * 20, y + 28 + i * 60, 10, 20, '#222E3F'); [0, 1, 2].forEach(k => { c.fillStyle = k === 2 && i % 2 ? violet : cyan; c.beginPath(); c.arc(x + 44 + k * 26, y + 38 + i * 60, 6, 0, 7); c.fill(); }); }
  // Seguridad
  [x, y] = R.lock;
  c.strokeStyle = '#DDE5F2'; c.lineWidth = 10; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x + 128, y + 22); c.lineTo(x + 218, y + 58); c.lineTo(x + 218, y + 128); c.quadraticCurveTo(x + 214, y + 196, x + 128, y + 236); c.quadraticCurveTo(x + 42, y + 196, x + 38, y + 128); c.lineTo(x + 38, y + 58); c.closePath(); c.stroke();
  c.strokeStyle = cyan; c.lineWidth = 12; c.beginPath(); c.moveTo(x + 86, y + 122); c.lineTo(x + 118, y + 156); c.lineTo(x + 172, y + 94); c.stroke();
  // Rótulos
  c.textBaseline = 'middle'; c.textAlign = 'center';
  labels.forEach((l, i) => {
    // Un rótulo vacío no se pinta: su celda queda transparente, sin recuadro (P-28).
    if (!l) return;
    const [tx, ty, tw, th] = labelRect(i);
    c.fillStyle = 'rgba(10,14,21,.88)'; c.fillRect(tx, ty, tw, th);
    c.strokeStyle = 'rgba(160,185,220,.55)'; c.lineWidth = 2; c.strokeRect(tx + 1, ty + 1, tw - 2, th - 2);
    c.fillStyle = '#E8EAF0'; c.font = font; c.fillText(l, tx + tw / 2, ty + th / 2 + 2);
  });
}

/**
 * Arranca la escena sobre `canvas`. Devuelve `null` si no hay WebGL utilizable
 * (sin contexto, contexto perdido, sin `OES_standard_derivatives` o programas
 * que no enlazan): quien llama muestra entonces el respaldo `Plates stack`.
 */
export function createEngine(canvas: HTMLCanvasElement, opts: EngineOptions): Engine | null {
  const began = performance.now();
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  if (gl.isContextLost()) return null;

  // Todo lo que se crea en la GPU queda anotado para poder borrarlo.
  const owned = {
    buffers: [] as WebGLBuffer[], textures: [] as WebGLTexture[], framebuffers: [] as WebGLFramebuffer[],
    renderbuffers: [] as WebGLRenderbuffer[], programs: [] as WebGLProgram[], shaders: [] as WebGLShader[],
  };
  const keep = <T>(list: T[], o: T): T => { list.push(o); return o; };
  let atlas: HTMLCanvasElement | null = null;
  const release = () => {
    owned.buffers.forEach(o => gl.deleteBuffer(o));
    owned.textures.forEach(o => gl.deleteTexture(o));
    owned.framebuffers.forEach(o => gl.deleteFramebuffer(o));
    owned.renderbuffers.forEach(o => gl.deleteRenderbuffer(o));
    owned.programs.forEach(o => gl.deleteProgram(o));
    owned.shaders.forEach(o => gl.deleteShader(o));
    for (const list of Object.values(owned)) list.length = 0;
    if (atlas) atlas.width = atlas.height = 0;
    // Si el contexto ya se perdió no hay nada que soltar (y soltarlo otra vez es un error de WebGL).
    if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();
  };

  const hero = opts.mode === 'hero';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // La calidad se elige por clase de dispositivo; el escritorio no hereda los límites del móvil
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
  const profile = pickProfile({
    renderer: gpu,
    coarsePointer: matchMedia('(pointer: coarse)').matches,
    screenMax: Math.max(screen.width, screen.height),
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
  }, opts.quality);
  const Q = QUALITY[profile];
  if (!gl.getExtension('OES_standard_derivatives')) { release(); return null; }

  const font = '500 38px ' + (opts.labelFont ?? LABEL_FONT);
  let labels = atlasLabels(opts.labels);
  const atlasPx = Math.min(Q.atlas, gl.getParameter(gl.MAX_TEXTURE_SIZE));
  const atlasCanvas = atlas = document.createElement('canvas'); atlasCanvas.width = atlasCanvas.height = atlasPx;
  const paint = () => paintAtlas(atlasCanvas, atlasPx, labels, font);
  paint();

  const { vertices: all, draws, floorStart, triangles, foot, routes } = buildGeometry();
  canvas.dataset.triangles = String(triangles);

  // Programas
  const sh = (t: number, s: string) => { const o = gl.createShader(t); if (!o) return null; keep(owned.shaders, o); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { if (!gl.isContextLost()) console.error(gl.getShaderInfoLog(o)); return null; } return o; };
  const prog = (v: string, f: string) => { const a = sh(gl.VERTEX_SHADER, v), b = sh(gl.FRAGMENT_SHADER, f); if (!a || !b) return null; const p = keep(owned.programs, gl.createProgram()); gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p); return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null; };
  const main = prog(SCENE_VS, sceneFragmentShader(Q.taps)), glow = prog(GLOW_VS, GLOW_FS), depthP = prog(DEPTH_VS, DEPTH_FS);
  if (!main || !glow || !depthP) { release(); return null; }

  const vbo = keep(owned.buffers, gl.createBuffer()); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(all), gl.STATIC_DRAW);
  const pulseBuf = keep(owned.buffers, gl.createBuffer());
  const MAXP = 26; const pulseData = new Float32Array(MAXP * 7);
  const tex = keep(owned.textures, gl.createTexture()); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  const upload = () => { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas); gl.generateMipmap(gl.TEXTURE_2D); };
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const af = gl.getExtension('EXT_texture_filter_anisotropic');
  if (af) gl.texParameterf(gl.TEXTURE_2D, af.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, gl.getParameter(af.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  upload();

  const uM = (n: string) => gl.getUniformLocation(main, n), uG = (n: string) => gl.getUniformLocation(glow, n);
  const U = { VP: uM('uVP'), LVP: uM('uLVP'), X: uM('uX'), Y: uM('uY'), A: uM('uA'), TY: uM('uTY'), E: uM('uE'), T: uM('uT'), Bg: uM('uBg'), Tex: uM('uTex'), SM: uM('uSM'), AO: uM('uAO'), SR: uM('uSR') };
  const G = { VP: uG('uVP'), X: uG('uX'), Y: uG('uY'), S: uG('uS') };
  const attrs = ([['aP', 3, 0], ['aN', 3, 12], ['aU', 2, 24], ['aC', 3, 32], ['aL', 1, 44], ['aM', 1, 48]] as [string, number, number][]).map(a => [gl.getAttribLocation(main, a[0]), a[1], a[2]]);
  const bindMain = () => { gl.bindBuffer(gl.ARRAY_BUFFER, vbo); attrs.forEach(a => { gl.enableVertexAttribArray(a[0]); gl.vertexAttribPointer(a[0], a[1], gl.FLOAT, false, STRIDE * 4, a[2]); }); };
  const gP = gl.getAttribLocation(glow, 'aP'), gK = gl.getAttribLocation(glow, 'aK');

  gl.clearColor(BG[0], BG[1], BG[2], 1);
  gl.enable(gl.DEPTH_TEST);

  // Cámara
  const DIST = 21, F = 3.5;
  const persp = (aspect: number) => { const n = 1, f = 60; return [F / aspect, 0, 0, 0, 0, F, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; };

  // La escena es estática: sus sombras y la oclusión de contacto se hornean una vez
  const SM = Math.min(Q.shadow, gl.getParameter(gl.MAX_TEXTURE_SIZE));
  const smTex = keep(owned.textures, gl.createTexture()); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, smTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SM, SM, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(q => gl.texParameteri(gl.TEXTURE_2D, q[0], q[1]));
  const fbo = keep(owned.framebuffers, gl.createFramebuffer()); const rb = keep(owned.renderbuffers, gl.createRenderbuffer());
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, smTex, 0);
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, SM, SM);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
  const SE = 7.4, sn = 1, sf = 30, lightDir = norm([-.35, .85, .4]);
  const ortho = [1 / SE, 0, 0, 0, 0, 1 / SE, 0, 0, 0, 0, -2 / (sf - sn), 0, 0, 0, -(sf + sn) / (sf - sn), 1];
  const LVP = mul(ortho, look([lightDir[0] * 15, lightDir[1] * 15, lightDir[2] * 15], [0, 0, 0]));
  gl.useProgram(depthP); gl.viewport(0, 0, SM, SM); gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.BLEND);
  gl.uniformMatrix4fv(gl.getUniformLocation(depthP, 'uLVP'), false, new Float32Array(LVP));
  const dP = gl.getAttribLocation(depthP, 'aP');
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.enableVertexAttribArray(dP); gl.vertexAttribPointer(dP, 3, gl.FLOAT, false, STRIDE * 4, 0);
  gl.drawArrays(gl.TRIANGLES, draws[0].first, draws[0].count);
  gl.disableVertexAttribArray(dP); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(BG[0], BG[1], BG[2], 1);

  const aoC = document.createElement('canvas'); aoC.width = aoC.height = 1024;
  const ac = aoC.getContext('2d');
  if (!ac) { release(); return null; }
  ac.fillStyle = '#fff'; ac.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 4; i++) {
    const rowT = 1024 - (i + 1) * 256;
    ac.save(); ac.beginPath(); ac.rect(0, rowT, 1024, 256); ac.clip();
    foot.filter(f => f[0] === i).forEach(f => {
      const sx = 1024 / (2 * TW), sy = 256 / (2 * TD);
      const x = (f[1] + TW) * sx, y = rowT + (f[2] + TD) * sy;
      ([[38, .34], [14, .5]] as V2[]).forEach(q => {
        ac.shadowColor = 'rgba(0,0,0,' + q[1] + ')'; ac.shadowBlur = q[0]; ac.shadowOffsetX = 4000; ac.fillStyle = '#000';
        ac.beginPath();
        if (f[5]) ac.ellipse(x - 4000, y, f[3] * sx, f[4] * sy, 0, 0, 7); else ac.rect(x - 4000 - f[3] * sx, y - f[4] * sy, f[3] * 2 * sx, f[4] * 2 * sy);
        ac.fill();
      });
    });
    ac.restore();
  }
  const aoTex = keep(owned.textures, gl.createTexture()); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, aoTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, aoC);
  [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(q => gl.texParameteri(gl.TEXTURE_2D, q[0], q[1]));
  gl.activeTexture(gl.TEXTURE0);

  // Resolución: el lienzo coincide exactamente con los píxeles físicos, así el navegador nunca lo amplía
  let w = 0, h = 0, cssW = 1, cssH = 1, off: [number, number] = [0, 0], zoom = 1, VP: number[] | null = null;
  let devW = 0, devH = 0, step = 0, ratio = 1, last = 0;
  const fit = () => {
    cssW = Math.max(2, canvas.clientWidth); cssH = Math.max(2, canvas.clientHeight);
    const [bw, bh] = backingStore(cssW, cssH, devicePixelRatio || 1, devW, devH);
    const steps = ladder(profile, Q.maxPx, bw, bh, cssW);
    step = Math.min(step, steps.length - 1);
    ratio = steps[step];
    const nw = Math.round(bw * ratio), nh = Math.round(bh * ratio);
    if (nw !== w || nh !== h) { w = canvas.width = nw; h = canvas.height = nh; }
    canvas.dataset.quality = profile + ' ' + w + 'x' + h + ' step' + step;
    canvas.dataset.steps = String(steps.length);
    last = steps.length - 1;
    ({ off, zoom } = framing(hero, cssW, cssH));
  };

  const act = [1, 1, 1, 1];
  const yaw = camYaw, pitch = .27;
  let px = 0, py = 0, tx = 0, ty = 0;
  let wanted = opts.active ?? -1, hover = -1;
  const t0 = performance.now();
  let visible = true, alive = true, disposed = false, raf = 0, lastProbe = t0, over = 0, under = 0;
  // P-58 = B (WCAG 2.2.2): sin interacción, la escena se queda quieta antes de 5 s (IDLE_MS) y vuelve
  // a moverse con la interacción. Mientras está quieta el reloj de la animación no avanza (`paused`):
  // se reanuda desde el mismo cuadro, sin saltos. Sin pausas, `now - paused` es el `now` de siempre.
  const IDLE_MS = 4000;
  let lastInput = t0, running = false, paused = 0, lastDrawn = t0, frozen = -1;
  const px1 = new Uint8Array(4);
  const tagsEl = () => Array.from(opts.tags ? opts.tags() : []);
  const pulses: { r: SceneGeometry['routes'][number]; o: number }[] = [];
  routes.slice(0, 10).forEach((r, i) => { pulses.push({ r, o: i * .13 }); pulses.push({ r, o: i * .13 + .5 }); });

  const project = (m: number[], p: Vec): V2 => {
    const c = [0, 1, 2, 3].map(k => m[k] * p[0] + m[k + 4] * p[1] + m[k + 8] * p[2] + m[k + 12]);
    const nx = c[0] / c[3] + off[0], ny = c[1] / c[3] + off[1];
    return [(nx + 1) / 2 * cssW, (1 - ny) / 2 * cssH];
  };
  const corners = (m: number[], i: number) => [[-TW, LY[i], TD], [TW, LY[i], TD], [TW, LY[i], -TD], [-TW, LY[i], -TD]].map(p => project(m, p));
  const inside = (pt: V2, q: V2[]) => { let c = false; for (let i = 0, j = 3; i < 4; j = i++) { if ((q[i][1] > pt[1]) !== (q[j][1] > pt[1]) && pt[0] < (q[j][0] - q[i][0]) * (pt[1] - q[i][1]) / (q[j][1] - q[i][1]) + q[i][0]) c = !c; } return c; };
  // Antes del primer cuadro aún no hay cámara: nada que elegir.
  const pickAt = (x: number, y: number) => { if (!VP) return -1; for (let i = 0; i < 4; i++) { const q = corners(VP, i); const raised = q.map((p, k): V2 => (k > 1 ? [p[0], p[1] - cssH * .05] : p)); if (inside([x, y], raised)) return i; } return -1; };

  const draw = (now: number) => {
    const t = (now - t0) * .001;
    const y = yaw + px * .2 + (reduced ? 0 : Math.sin(t * .13) * .035);
    const p = pitch - py * .05;
    const eye = [Math.sin(-y) * Math.cos(p) * DIST, Math.sin(p) * DIST + .1, Math.cos(-y) * Math.cos(p) * DIST];
    const proj = persp(cssW / cssH);
    proj[0] *= zoom; proj[5] *= zoom;
    const m = VP = mul(proj, look(eye, [0, .62, 0]));
    gl.viewport(0, 0, w, h);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(main); bindMain();
    gl.uniformMatrix4fv(U.VP, false, new Float32Array(m));
    gl.uniform1f(U.X, off[0]); gl.uniform1f(U.Y, off[1]);
    gl.uniform3f(U.E, eye[0], eye[1], eye[2]); gl.uniform1f(U.T, reduced ? 2.2 : t);
    gl.uniform3f(U.Bg, BG[0], BG[1], BG[2]); gl.uniform1i(U.Tex, 0); gl.uniform1i(U.SM, 1); gl.uniform1i(U.AO, 2);
    gl.uniform1f(U.SR, 2.2 / SM); gl.uniform1fv(U.TY, new Float32Array(LY));
    gl.uniformMatrix4fv(U.LVP, false, new Float32Array(LVP));
    const pair = (a: number, b: number) => Math.max(act[a], act[b]);
    gl.uniform1fv(U.A, new Float32Array([act[0], act[1], act[2], act[3], pair(0, 1), pair(1, 2), pair(2, 3)]));
    gl.disable(gl.BLEND); gl.depthMask(false); gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLES, floorStart, 6);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
    draws.forEach(d => {
      if (d.kind === 'solid') { gl.disable(gl.BLEND); gl.depthMask(true); }
      else if (d.kind === 'path') { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.depthMask(false); }
      else { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); }
      gl.drawArrays(gl.TRIANGLES, d.first, d.count);
    });

    // Pulsos que viajan por las rutas de datos
    let n = 0;
    pulses.forEach(q => {
      const r = q.r; let s = ((reduced ? .45 : t * .22) + q.o) % 1 * r.len;
      let i = 1;
      for (; i < r.pts.length; i++) { const L = seglen(r.pts[i - 1], r.pts[i]); if (s <= L) break; s -= L; }
      if (i >= r.pts.length) i = r.pts.length - 1;
      const a = r.pts[i - 1], b = r.pts[i], k = Math.min(1, s / (seglen(a, b) || 1));
      const lvl = Math.max(act[Math.min(3, r.col)], act[Math.max(0, r.col - 1)]);
      const c = LC[Math.min(3, r.col)];
      pulseData.set([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, c[0] * lvl, c[1] * lvl, c[2] * lvl, .35 + .65 * lvl], n * 7); n++;
    });
    gl.useProgram(glow);
    attrs.forEach(a => gl.disableVertexAttribArray(a[0]));
    gl.bindBuffer(gl.ARRAY_BUFFER, pulseBuf); gl.bufferData(gl.ARRAY_BUFFER, pulseData, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(gP); gl.vertexAttribPointer(gP, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(gK); gl.vertexAttribPointer(gK, 4, gl.FLOAT, false, 28, 12);
    gl.uniformMatrix4fv(G.VP, false, new Float32Array(m)); gl.uniform1f(G.X, off[0]); gl.uniform1f(G.Y, off[1]);
    gl.uniform1f(G.S, 15 * (w / cssW) * Math.max(.75, zoom));
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.POINTS, 0, n);
    gl.enable(gl.DEPTH_TEST); gl.disableVertexAttribArray(gP); gl.disableVertexAttribArray(gK);

    // Las etiquetas siguen ancladas a la bandeja que nombran
    if (cssW >= (hero ? 1040 : 560)) {
      const col = Math.max(...[0, 1, 2, 3].map(i => project(m, [TW, LY[i], TD])[0]).concat([0, 1, 2, 3].map(i => project(m, [TW, LY[i], -TD])[0]))) + 18;
      const limit = cssW - (hero ? 136 : 132);
      tagsEl().forEach((el, i) => {
        if (!el) return;
        const a = project(m, [TW, LY[i], TD]);
        el.style.transform = 'translate(' + Math.round(a[0]) + 'px,' + Math.round(a[1] - 14) + 'px)';
        const line = el.children[1] as HTMLElement | undefined;
        if (line) line.style.width = Math.max(10, Math.round(Math.min(col, limit) - a[0] - 16)) + 'px';
        el.style.visibility = 'visible';
      });
    } else tagsEl().forEach(el => { if (el) el.style.visibility = 'hidden'; });
  };

  const settle = () => {
    const focus = hover >= 0 ? hover : wanted;
    let moving = false;
    for (let i = 0; i < 4; i++) {
      const target = focus < 0 ? 1 : i === focus ? 1 : Math.abs(i - focus) === 1 ? .46 : .2;
      if (reduced) act[i] = target; else { const d = target - act[i]; if (Math.abs(d) > .002) { act[i] += d * .14; moving = true; } else act[i] = target; }
    }
    return moving;
  };

  const tick = (now: number) => {
    if (!alive) return;
    if (frozen >= 0) { paused += now - frozen; frozen = -1; }
    if (now - lastInput > IDLE_MS) { running = false; frozen = lastDrawn; return; }
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    px += (tx - px) * .06; py += (ty - py) * .06;
    settle();
    // El ritmo de rAF se limita en iframes y contextos ocultos: no dice nada de la GPU.
    // Una lectura temporizada sí: espera a que este cuadro termine.
    const probing = now - lastProbe > 1200;
    const t1 = probing ? performance.now() : 0;
    draw(now - paused);
    lastDrawn = now;
    if (probing) {
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1);
      const cost = performance.now() - t1;
      lastProbe = performance.now();
      canvas.dataset.ms = cost.toFixed(1);
      const next = probe({ step, over, under }, cost, last);
      ({ step, over, under } = next);
      if (next.refit) fit();
    }
  };
  // Con `prefers-reduced-motion` no hay bucle: se pinta un cuadro cuando algo cambia.
  // Con la escena quieta (P-58), se repinta el mismo cuadro (por ejemplo, tras cambiar de tamaño).
  const redraw = () => {
    if (!alive) return;
    if (reduced) { settle(); draw(performance.now()); } else if (!running) draw(lastDrawn - paused);
  };
  // Cualquier interacción reanuda el bucle; se vuelve a quedar quieta IDLE_MS después de la última.
  const wake = () => {
    lastInput = performance.now();
    if (reduced || !alive || running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };
  const INPUTS = ['pointermove', 'pointerdown', 'wheel', 'scroll', 'keydown', 'touchstart'] as const;

  // El atlas se pinta al arrancar y otra vez cuando la fuente de los rótulos está cargada.
  const refreshAtlas = () => { if (disposed || !alive) return; paint(); upload(); redraw(); };
  const whenFontReady = () => { if (document.fonts) document.fonts.load(font, labels.join('') || 'A').then(refreshAtlas, () => {}); };
  whenFontReady();

  const fine = matchMedia('(pointer: fine)').matches;
  const onWinMove = (e: PointerEvent) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; };
  const at = (e: MouseEvent): V2 => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const onMove = (e: PointerEvent) => { const p = at(e); const i = pickAt(p[0], p[1]); if (i !== hover) { hover = i; canvas.style.cursor = i >= 0 ? 'pointer' : ''; redraw(); } };
  const onLeave = () => { hover = -1; canvas.style.cursor = ''; redraw(); };
  const onClick = (e: MouseEvent) => { const p = at(e); const i = pickAt(p[0], p[1]); if (i >= 0 && opts.onPick) opts.onPick(i); };
  const onLost = (e: Event) => { e.preventDefault(); alive = false; cancelAnimationFrame(raf); if (opts.onContextLost) opts.onContextLost(); };
  if (fine && !reduced) addEventListener('pointermove', onWinMove, { passive: true });
  if (!reduced) for (const type of INPUTS) addEventListener(type, wake, { passive: true });
  if (fine) { canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerleave', onLeave); }
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('webglcontextlost', onLost);
  const ro = new ResizeObserver(es => {
    const e = es[es.length - 1], box = e.devicePixelContentBoxSize && e.devicePixelContentBoxSize[0];
    devW = box ? box.inlineSize : 0; devH = box ? box.blockSize : 0;
    fit();
    redraw();
  });
  try { ro.observe(canvas, { box: 'device-pixel-content-box' }); } catch { ro.observe(canvas); }
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; }); io.observe(canvas);
  fit(); settle();
  if (reduced) draw(performance.now()); else { running = true; raf = requestAnimationFrame(tick); }
  // Diagnóstico, como `data-quality` y `data-ms`: milisegundos de JavaScript que costó arrancar (P-29, P-12).
  canvas.dataset.start = (performance.now() - began).toFixed(1);

  return {
    setActive(layer) { wanted = layer; wake(); redraw(); },
    setHover(layer) { hover = layer; wake(); redraw(); },
    setLabels(next) { if (disposed) return; labels = atlasLabels(next); refreshAtlas(); whenFontReady(); },
    dispose() {
      if (disposed) return;
      disposed = true; alive = false;
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      removeEventListener('pointermove', onWinMove);
      for (const type of INPUTS) removeEventListener(type, wake);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick); canvas.removeEventListener('webglcontextlost', onLost);
      canvas.style.cursor = '';
      release();
    },
  };
}
