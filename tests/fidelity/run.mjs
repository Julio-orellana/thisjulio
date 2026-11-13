#!/usr/bin/env node
/*
 * Arnés de fidelidad de la escena 3D (spec 003, T2/T3/T10; CA-12).
 *
 * Ejecuta en Chromium sin cabeza, en una página aislada (nada de esto llega al
 * sitio ni al build):
 *
 *   referencia  el motor del diseño, `docs/design/fuente/Arch3D.dc.html`, SIN
 *               modificar: se extrae su script tal cual y se le da un `DCLogic`
 *               mínimo y el marcado de su plantilla.
 *   port        `src/components/scene3d/engine.ts` y sus dos módulos, con los
 *               tipos quitados por TypeScript y nada más.
 *
 * y compara, caso por caso: los píxeles del lienzo, la posición de las
 * etiquetas DOM y la traza de llamadas a WebGL.
 *
 *   node tests/fidelity/run.mjs --out <carpeta> [--matrix base|full] [--no-anim] [--no-dispose] [--no-hidden] [--swiftshader]
 *
 * Requiere `npm run build` antes (usa la fuente JetBrains Mono autoalojada del
 * build). La carpeta de salida va fuera del repositorio; al informe solo pasan
 * las capturas elegidas.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import ts from 'typescript';
import { diffPng } from './png.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const ORIGIN = 'http://fidelity.test';
const DESIGN = 'docs/design/fuente/Arch3D.dc.html';
const DESIGN_SHA = '70cba440a2f7d01f'; // la misma huella que vigila tests/unit/design-sources.test.ts

const argv = process.argv.slice(2);
const flag = name => argv.includes('--' + name);
const option = (name, fallback) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : fallback; };
const OUT = option('out');
if (!OUT) { console.error('Falta --out <carpeta>'); process.exit(2); }
const MATRIX = option('matrix', 'base');
const sha = data => createHash('sha256').update(data).digest('hex');

// ── Fuentes ──────────────────────────────────────────────────────────────────
const designHtml = readFileSync(join(ROOT, DESIGN));
if (!sha(designHtml).startsWith(DESIGN_SHA)) throw new Error(`${DESIGN} no es la versión registrada (${DESIGN_SHA}…)`);
const designText = designHtml.toString('utf8');
const designScript = designText.match(/<script type="text\/x-dc"[^>]*>\n([\s\S]*?)<\/script>/)?.[1];
if (!designScript?.startsWith('class Component extends DCLogic')) throw new Error('No se encontró el script del componente en ' + DESIGN);
// Los rótulos del atlas se leen del diseño: el arnés no escribe textos propios.
const LABELS = JSON.parse('[' + designText.match(/const labels = \[([^\]]*)\];/)[1].replaceAll("'", '"') + ']');

const font = (() => {
  const dir = join(ROOT, '.next/static/chunks');
  let css = '';
  try { css = readdirSync(dir).filter(f => f.endsWith('.css')).map(f => readFileSync(join(dir, f), 'utf8')).join('\n'); } catch { /* sin build */ }
  const face = [...css.matchAll(/@font-face\{[^}]*\}/g)].map(m => m[0])
    .find(f => /font-family:"?JetBrains Mono"?;/.test(f) && /font-weight:500/.test(f) && /unicode-range:U\+(\?\?|0+-0*FF)/i.test(f));
  const file = face?.match(/url\(\.\.\/media\/([^)]+\.woff2)\)/)?.[1];
  if (!file) throw new Error('No se encontró JetBrains Mono en .next (ejecuta antes `npm run build`).');
  return readFileSync(join(ROOT, '.next/static/media', file));
})();

// El port se sirve como módulos ES: TypeScript quita los tipos y nada más (sin empaquetar ni minificar).
const PORT_MODULES = ['engine', 'engine-profile', 'engine-shaders'];
const portJs = Object.fromEntries(PORT_MODULES.map(name => {
  const source = readFileSync(join(ROOT, `src/components/scene3d/${name}.ts`), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return [name, outputText.replace(/(from\s+['"]\.\/[\w-]+)(['"])/g, '$1.js$2')];
}));

const page = side => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Arnés de fidelidad: ${side}</title>
<link rel="stylesheet" href="/site.css">
<style>@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:400 500;src:url(/font.woff2) format('woff2')}
html,body{margin:0}#stage{position:relative}</style></head>
<body><div id="stage"></div>
<script src="/instrument.js"></script>
${side === 'ref'
    ? `<script>class DCLogic { constructor() { this.props = {}; this.state = null; } setState(s) { this.state = Object.assign({}, this.state, s); } }</script>
<script src="/design.js"></script>
<script>window.__Design = Component;</script>`
    : `<script type="module">import { createEngine } from '/port/engine.js'; window.__createEngine = createEngine;</script>`}
<script src="/driver.js"></script></body></html>`;

const FILES = {
  '/ref.html': ['text/html', page('ref')],
  '/port.html': ['text/html', page('port')],
  '/site.css': ['text/css', readFileSync(join(ROOT, 'docs/design/fuente/site.css'))],
  '/font.woff2': ['font/woff2', font],
  '/design.js': ['text/javascript', designScript],
  ...Object.fromEntries(PORT_MODULES.map(name => [`/port/${name}.js`, ['text/javascript', portJs[name]]])),
  '/instrument.js': ['text/javascript', readFileSync(join(HERE, 'page/instrument.js'))],
  '/driver.js': ['text/javascript', readFileSync(join(HERE, 'page/driver.js'))],
};

// ── Matriz ───────────────────────────────────────────────────────────────────
// Tamaños del lienzo: los de los contenedores del sitio a 1440×900 y 390×844
// (`.hero-3d` de site.css; `.built-stage` sin su borde de 1 px, medido en el build).
const VIEWS = {
  '1440': { viewport: { width: 1440, height: 900 }, dpr: 1, touch: false, hero: [1440, 824], diagram: [845, 638] },
  '390': { viewport: { width: 390, height: 844 }, dpr: 1, touch: true, hero: [390, 360], diagram: [348, 378] },
  '1440@2x': { viewport: { width: 1440, height: 900 }, dpr: 2, touch: false, hero: [1440, 824], diagram: [845, 638] },
  '390@3x': { viewport: { width: 390, height: 844 }, dpr: 3, touch: true, hero: [390, 360], diagram: [348, 378] },
};
const MODES = ['hero', 'diagram'];
const LAYERS = [-1, 0, 1, 2, 3];
const layerName = i => (i < 0 ? 'todas' : 'capa' + i);
const mounts = [];
for (const view of ['1440', '390']) for (const mode of MODES) mounts.push({ view, mode, quality: 'auto' });
if (MATRIX === 'full') {
  for (const quality of ['high', 'balanced', 'low']) for (const view of ['1440', '390']) for (const mode of MODES) mounts.push({ view, mode, quality });
  for (const view of ['1440@2x', '390@3x']) for (const mode of MODES) mounts.push({ view, mode, quality: 'auto' });
}
const mountName = m => `${m.mode}-${m.view}-${m.quality}`;

// Guion de la animación (reloj virtual, 60 cuadros por segundo): cambios de
// capa, puntero sobre el lienzo, clic, foco de una etiqueta y una medición.
const animScript = ([w, h]) => {
  const at = (fx, fy) => [Math.round(w * fx), Math.round(h * fy)];
  return {
    frames: 150, dt: 1000 / 60, captures: [12, 40, 66, 95, 125, 150],
    events: {
      20: [['setActive', 2]],
      30: [['pointer', 'pointermove', ...at(.7, .32)]],
      44: [['pointer', 'pointermove', ...at(.62, .55)], ['pointer', 'click', ...at(.62, .55)]],
      58: [['pointer', 'pointermove', ...at(.5, .8)], ['pointer', 'click', ...at(.5, .8)]],
      70: [['setActive', -1]],
      82: [['pointer', 'pointerleave', ...at(.5, .8)]],
      100: [['setHover', 1]],
      118: [['setHover', -1]],
      130: [['setActive', 0], ['pointer', 'click', ...at(.7, .32)]],
    },
  };
};

// ── Ejecución ────────────────────────────────────────────────────────────────
const browser = await chromium.launch({ args: flag('swiftshader') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] });
const blocked = new Set();

async function run(side, m, { trace = false, anim = false, dispose = false, labels = LABELS } = {}) {
  const view = VIEWS[m.view];
  const context = await browser.newContext({ viewport: view.viewport, deviceScaleFactor: view.dpr, hasTouch: view.touch, reducedMotion: anim ? 'no-preference' : 'reduce' });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    const file = url.origin === ORIGIN ? FILES[url.pathname] : undefined;
    if (!file) { blocked.add(url.origin + url.pathname); return route.abort(); }
    return route.fulfill({ contentType: file[0], body: file[1] });
  });
  const tab = await context.newPage();
  const errors = [];
  const warnings = [];
  tab.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); else if (msg.type() === 'warning') warnings.push(msg.text()); });
  tab.on('pageerror', e => errors.push(String(e)));
  const query = [trace && 'trace', anim && 'clock'].filter(Boolean).join('&');
  await tab.goto(`${ORIGIN}/${side}.html${query ? '?' + query : ''}`);
  await tab.waitForFunction(() => window.__F && (window.__Design || window.__createEngine));
  const [w, h] = view[m.mode];
  const info = await tab.evaluate(o => window.__F.mount(o), { side, uid: m.mode === 'hero' ? 'hero' : 'dia', mode: m.mode, quality: m.quality, active: -1, w, h, labels });
  const shots = {};
  if (anim) {
    const out = await tab.evaluate(script => window.__F.run(script), animScript([w, h]));
    for (const [f, shot] of Object.entries(out)) shots['f' + String(f).padStart(3, '0')] = shot;
  } else {
    for (const layer of LAYERS) shots[layerName(layer)] = await tab.evaluate(i => window.__F.frame(i), layer);
  }
  // Liberación (solo en la pasada que la pide): desmontar y, después, 20 montajes seguidos en la misma página.
  let release = null;
  if (dispose) {
    release = await tab.evaluate(([x, y]) => window.__F.release(x, y), [Math.round(w * .62), Math.round(h * .55)]);
    const before = warnings.length;
    release.cycle = await tab.evaluate(o => window.__F.cycle(20, o), { side, uid: 'ciclo', mode: m.mode, quality: m.quality, active: -1, w, h, labels: LABELS });
    release.cycleWarnings = warnings.slice(before);
  }
  const lines = trace ? await tab.evaluate(() => window.__H.trace) : [];
  if (!dispose) await tab.evaluate(() => window.__F.unmount());
  await context.close();
  for (const shot of Object.values(shots)) { shot.png = Buffer.from(shot.png.split(',')[1], 'base64'); shot.sha = sha(shot.png); }
  const segments = {};
  let current = null;
  for (const line of lines) { if (line.startsWith('## ')) { current = segments[line.slice(3)] = []; } else if (current) current.push(line); }
  return { info, shots, segments, errors, warnings, release };
}

const firstDiff = (a, b) => { const n = Math.max(a.length, b.length); for (let i = 0; i < n; i++) if (a[i] !== b[i]) return { line: i, ref: a[i] ?? '(fin)', port: b[i] ?? '(fin)' }; return null; };
/** Si `longer` es `shorter` con un bloque contiguo añadido, devuelve ese bloque. */
const extraBlock = (shorter, longer) => {
  let pre = 0; while (pre < shorter.length && shorter[pre] === longer[pre]) pre++;
  let post = 0; while (post < shorter.length - pre && shorter[shorter.length - 1 - post] === longer[longer.length - 1 - post]) post++;
  return pre + post === shorter.length ? longer.slice(pre, longer.length - post) : null;
};

for (const d of ['ref', 'port', 'diff']) mkdirSync(join(OUT, d), { recursive: true });
const results = { cases: [], mounts: [], anim: [], dispose: [], hiddenLabel: null };
const save = (dir, name, png) => writeFileSync(join(OUT, dir, name + '.png'), png);

function compareShots(name, ref, port, extra = {}) {
  const d = ref.sha === port.sha ? { pixels: 0, total: ref.size[0] * ref.size[1], maxDelta: 0, image: null } : diffPng(ref.png, port.png);
  save('ref', name, ref.png); save('port', name, port.png);
  if (d.image) save('diff', name, d.image);
  const same = key => JSON.stringify(ref[key]) === JSON.stringify(port[key]);
  return {
    name, ...extra, size: ref.size.join('x'), sizeEqual: same('size'), pixels: d.pixels, total: d.total, maxDelta: d.maxDelta,
    refSha: ref.sha, portSha: port.sha, tagsEqual: same('tags'), datasetEqual: same('data'), cursorEqual: same('cursor'), picksEqual: same('picks'),
    quality: ref.data.quality, triangles: ref.data.triangles, tags: ref.tags, picks: ref.picks,
  };
}

for (const m of mounts) {
  const name = mountName(m);
  process.stdout.write(name + ' … ');
  // T2: la referencia se captura dos veces sin instrumentar; debe salir idéntica.
  const refA = await run('ref', m), refB = await run('ref', m);
  const port = await run('port', m);
  // Pasada instrumentada: la traza de WebGL, y la prueba de que instrumentar no cambia los píxeles.
  const refT = await run('ref', m, { trace: true }), portT = await run('port', m, { trace: true });
  const frames = Object.keys(refA.shots);
  const reproducible = frames.every(f => refA.shots[f].sha === refB.shots[f].sha);
  const traceNeutral = frames.every(f => refA.shots[f].sha === refT.shots[f].sha && port.shots[f].sha === portT.shots[f].sha);
  const seg = k => [refT.segments[k] ?? [], portT.segments[k] ?? []];
  const [setupR, setupP] = seg('setup'), [idleR, idleP] = seg('idle');
  const extra = extraBlock(idleR, idleP);
  const frameTraces = LAYERS.map(i => { const [a, b] = seg('frame ' + i); return { layer: i, calls: a.length, equal: !firstDiff(a, b), diff: firstDiff(a, b) }; });
  results.mounts.push({
    name, ...m, ok: [refA.info.ok, port.info.ok], renderer: refA.info.renderer, dpr: refA.info.dpr, client: refA.info.client, pointer: refA.info.fine ? 'fine' : refA.info.coarse ? 'coarse' : 'none',
    reproducible, traceNeutral,
    setup: { calls: [setupR.length, setupP.length], equal: !firstDiff(setupR, setupP), diff: firstDiff(setupR, setupP), sha: sha(setupR.join('\n')) },
    // Tras arrancar llegan el ResizeObserver y la promesa de las fuentes. El port añade un redibujado
    // al recargar el atlas (spec §3.1): la diferencia admitida es exactamente ese bloque.
    idle: { calls: [idleR.length, idleP.length], equal: !firstDiff(idleR, idleP), portExtraCalls: extra ? extra.length : null, portExtraIsOneFrame: !!extra && !firstDiff(extra, refT.segments['frame -1'] ?? []) },
    frames: frameTraces,
    // Datos horneados que emite el motor del diseño al arrancar (para las pruebas unitarias del port).
    refData: { vbo: setupR.find(l => /^bufferData\(34962,Float32Array/.test(l)), textures: setupR.filter(l => /^texImage2D\(.*canvas\[/.test(l)) },
    errors: { ref: [...refA.errors, ...refT.errors], port: [...port.errors, ...portT.errors] },
    warnings: { ref: [...new Set([...refA.warnings, ...refT.warnings])], port: [...new Set([...port.warnings, ...portT.warnings])] },
  });
  for (const f of frames) results.cases.push(compareShots(`${name}-${f}`, refA.shots[f], port.shots[f], { mount: name, mode: m.mode, view: m.view, profile: m.quality, layer: f }));
  console.log(results.cases.slice(-frames.length).map(c => c.pixels).join(' '));
}

if (!flag('no-anim')) {
  for (const view of ['1440', '390']) for (const mode of MODES) {
    const m = { view, mode, quality: 'auto' }, name = `anim-${mode}-${view}`;
    process.stdout.write(name + ' … ');
    const ref = await run('ref', m, { trace: true, anim: true }), port = await run('port', m, { trace: true, anim: true });
    const a = ref.segments.run ?? [], b = port.segments.run ?? [];
    const cases = Object.keys(ref.shots).map(f => compareShots(`${name}-${f}`, ref.shots[f], port.shots[f], { mount: name, mode, view, frame: f }));
    results.anim.push({ name, mode, view, calls: [a.length, b.length], traceEqual: !firstDiff(a, b), diff: firstDiff(a, b), traceSha: sha(a.join('\n')), cases, errors: { ref: ref.errors, port: port.errors }, warnings: { ref: [...new Set(ref.warnings)], port: [...new Set(port.warnings)] } });
    console.log(cases.map(c => c.pixels).join(' '), a.length === b.length && !firstDiff(a, b) ? 'traza igual' : 'TRAZA DISTINTA');
  }
}

// Liberación de recursos: qué borra cada motor al desmontar y qué pasa tras 20 montajes seguidos.
if (!flag('no-dispose')) {
  const count = (lines, re) => lines.filter(l => re.test(l)).length;
  const kinds = ['Buffer', 'Texture', 'Framebuffer', 'Renderbuffer', 'Program', 'Shader'];
  for (const [mode, anim] of [['hero', false], ['diagram', true]]) for (const side of ['ref', 'port']) {
    const r = await run(side, { view: '1440', mode, quality: 'auto' }, { trace: true, anim, dispose: true });
    const before = Object.entries(r.segments).filter(([k]) => k !== 'dispose' && k !== 'after').flatMap(([, v]) => v), d = r.segments.dispose ?? [];
    results.dispose.push({
      side, mode, motion: anim ? 'animación' : 'reduced-motion',
      created: Object.fromEntries(kinds.map(k => [k, count(before, new RegExp('^create' + k + '\\('))])),
      deleted: Object.fromEntries(kinds.map(k => [k, count(d, new RegExp('^delete' + k + '\\('))])),
      loseContext: count(d, /^getExtension\("WEBGL_lose_context"\)/) > 0, callsAfter: (r.segments.after ?? []).length,
      ...r.release, errors: r.errors,
    });
    console.log(`liberación ${side} ${mode}: contexto perdido=${r.release.contextLost}, vivos tras 20 montajes=${r.release.cycle.alive}/${r.release.cycle.created}, avisos=${r.release.cycleWarnings.length}`);
  }
}

// Rótulo oculto (P-28, decisión de Julio): con un rótulo vacío el port deja su celda transparente, sin recuadro.
// El motor del diseño no tiene este caso: se comprueba que lo único que cambia es el atlas.
if (!flag('no-hidden')) {
  const m = { view: '1440', mode: 'diagram', quality: 'auto' }, hidden = 7;
  const full = await run('port', m, { trace: true });
  const blank = await run('port', m, { trace: true, labels: LABELS.map((l, i) => (i === hidden ? '' : l)) });
  const d = diffPng(full.shots.todas.png, blank.shots.todas.png);
  save('port', 'rotulo-oculto', blank.shots.todas.png);
  if (d.image) save('diff', 'rotulo-oculto', d.image);
  const a = Object.values(full.segments).flat(), b = Object.values(blank.segments).flat();
  const changed = a.map((line, i) => (line === b[i] ? null : line)).filter(Boolean);
  results.hiddenLabel = {
    label: LABELS[hidden], pixels: d.pixels, total: d.total, calls: [a.length, b.length],
    changedCalls: changed.length, onlyAtlasUploads: changed.length > 0 && changed.every(l => /^texImage2D\(.*canvas\[/.test(l)),
    errors: blank.errors,
  };
  console.log(`rótulo oculto (${LABELS[hidden]}): ${d.pixels} píxeles cambian; llamadas distintas: ${changed.length}, todas subidas del atlas: ${results.hiddenLabel.onlyAtlasUploads}`);
}

results.env = {
  chromium: browser.version(), platform: `${process.platform} ${process.arch}`, node: process.version, swiftshaderFlag: flag('swiftshader'),
  design: { file: DESIGN, sha256: sha(designHtml) }, labels: LABELS, blockedRequests: [...blocked],
  port: Object.fromEntries(PORT_MODULES.map(name => [name + '.ts', sha(readFileSync(join(ROOT, `src/components/scene3d/${name}.ts`)))])),
};
await browser.close();
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2));

// ── Resumen ──────────────────────────────────────────────────────────────────
const pct = c => (c.pixels < 0 ? 'tamaño distinto' : (100 * c.pixels / c.total).toFixed(3).replace('.', ',') + ' %');
const yes = v => (v ? 'sí' : '**no**');
const table = [
  '| Modo | Ancho | Perfil | Capa | Lienzo | Píxeles distintos | % | Δ máx. | Etiquetas iguales | Traza del cuadro igual |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...results.cases.map(c => {
    const mount = results.mounts.find(x => x.name === c.mount);
    const tr = mount.frames.find(x => layerName(x.layer) === c.layer);
    return `| ${c.mode} | ${c.view} | ${c.quality.split(' ')[0]}${c.profile === 'auto' ? '' : ' (forzado)'} | ${c.layer} | ${c.size} | ${c.pixels} | ${pct(c)} | ${c.maxDelta} | ${yes(c.tagsEqual && c.datasetEqual)} | ${yes(tr.equal)} (${tr.calls}) |`;
  }),
  '',
  '| Montaje | Referencia reproducible | Instrumentar no cambia píxeles | Traza de arranque igual (llamadas ref / port) | Tras arrancar (ref / port) | Errores de consola (ref / port) |',
  '|---|---|---|---|---|---|',
  ...results.mounts.map(x => `| ${x.name} | ${yes(x.reproducible)} | ${yes(x.traceNeutral)} | ${yes(x.setup.equal)} (${x.setup.calls.join(' / ')}) | ${x.idle.equal ? 'igual' : x.idle.portExtraIsOneFrame ? `port: +1 cuadro (${x.idle.portExtraCalls} llamadas)` : '**distinta**'} (${x.idle.calls.join(' / ')}) | ${x.errors.ref.length} / ${x.errors.port.length} |`),
  '',
  '| Animación | Cuadro | Lienzo | Píxeles distintos | Δ máx. | Etiquetas, cursor y clics iguales | Traza completa igual |',
  '|---|---|---|---|---|---|---|',
  ...results.anim.flatMap(x => x.cases.map(c => `| ${x.mode} ${x.view} | ${c.frame} | ${c.size} | ${c.pixels} | ${c.maxDelta} | ${yes(c.tagsEqual && c.cursorEqual && c.picksEqual && c.datasetEqual)} | ${yes(x.traceEqual)} (${x.calls.join(' / ')}) |`)),
  '',
  '| Liberación | Motor | Creados (buffers, texturas, framebuffers, renderbuffers, programas, shaders) | Borrados al desmontar | `loseContext` | Contexto perdido | Cuadros en cola | Clics atendidos después | Contextos vivos tras 20 montajes | Avisos de Chromium |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...results.dispose.map(x => `| ${x.mode}, ${x.motion} | ${x.side === 'ref' ? 'diseño' : 'port'} | ${Object.values(x.created).join(', ')} | ${Object.values(x.deleted).join(', ')} | ${x.loseContext ? 'sí' : 'no'} | ${x.contextLost ? 'sí' : 'no'} | ${x.pendingFrames ?? '—'} | ${x.picksAfter} | ${x.cycle.alive} de ${x.cycle.created} | ${x.cycleWarnings.length ? x.cycleWarnings.length + ': ' + [...new Set(x.cycleWarnings)].join(' · ') : 'ninguno'} |`),
].join('\n');
writeFileSync(join(OUT, 'tabla.md'), table + '\n');
const bad = results.cases.filter(c => c.pixels !== 0 || !c.tagsEqual).length + results.anim.flatMap(x => x.cases).filter(c => c.pixels !== 0).length;
console.log(`\n${results.cases.length} cuadros fijos y ${results.anim.flatMap(x => x.cases).length} animados; ${bad} con diferencias. Chromium ${results.env.chromium}.`);
console.log('Resultados en ' + OUT);
