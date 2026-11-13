/*
 * Instrumentación de la página del arnés de fidelidad (spec 003, T2/T3). Se
 * carga antes que cualquiera de los dos motores y no modifica ninguno:
 *
 * - `?trace`: envuelve el contexto WebGL y anota cada llamada con sus
 *   argumentos (los datos grandes, por su huella FNV-1a). Dos motores que
 *   emiten la misma traza pintan lo mismo.
 * - `?clock`: reloj virtual (`performance.now`, `requestAnimationFrame`) para
 *   que la animación sea reproducible cuadro a cuadro.
 */
(() => {
  const params = new URLSearchParams(location.search);
  const H = (window.__H = { trace: [], gl: null, contexts: [], mark: name => H.trace.push('## ' + name) });

  const fnv = bytes => {
    let h = 0x811c9dc5;
    for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(16).padStart(8, '0');
  };
  H.fnv = fnv;

  const ids = new WeakMap();
  const counters = {};
  const idOf = o => {
    if (!ids.has(o)) { const k = o.constructor.name; counters[k] = (counters[k] || 0) + 1; ids.set(o, k + '#' + counters[k]); }
    return ids.get(o);
  };
  const show = v => {
    if (v === null || v === undefined) return String(v);
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'string') return v.length > 60 ? 'str[' + v.length + ']:' + fnv(new TextEncoder().encode(v)) : JSON.stringify(v);
    if (ArrayBuffer.isView(v)) return v.constructor.name + '[' + v.length + ']:' + fnv(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
    if (v instanceof HTMLCanvasElement) return 'canvas[' + v.width + 'x' + v.height + ']:' + fnv(v.getContext('2d').getImageData(0, 0, v.width, v.height).data);
    if (Array.isArray(v)) return '[' + v.map(show).join(',') + ']';
    return idOf(v);
  };

  // Consultas sin efecto en lo que se pinta: no forman parte de la traza.
  const SILENT = new Set(['isContextLost', 'getError']);
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    const ctx = getContext.call(this, type, attrs);
    if (type !== 'webgl' || !ctx) return ctx;
    H.gl = ctx;
    if (!H.contexts.includes(ctx)) H.contexts.push(ctx);
    if (!params.has('trace')) return ctx;
    H.trace.push('getContext(' + JSON.stringify(attrs) + ')');
    const wrapped = new Map();
    return new Proxy(ctx, {
      get(target, prop) {
        const value = target[prop];
        if (typeof value !== 'function') return value;
        if (!wrapped.has(prop)) wrapped.set(prop, (...args) => {
          const out = value.apply(target, args);
          if (!SILENT.has(prop)) H.trace.push(prop + '(' + args.map(show).join(',') + ')' + (out && typeof out === 'object' && prop.startsWith('create') ? ' -> ' + idOf(out) : ''));
          return out;
        });
        return wrapped.get(prop);
      },
    });
  };

  if (params.has('clock')) {
    let now = 1000, seq = 0;
    let queue = [];
    performance.now = () => now;
    window.requestAnimationFrame = cb => { queue.push([++seq, cb]); return seq; };
    window.cancelAnimationFrame = id => { queue = queue.filter(e => e[0] !== id); };
    H.step = ms => { now += ms; const run = queue; queue = []; run.forEach(e => e[1](now)); };
    H.pending = () => queue.length;
  }
})();
