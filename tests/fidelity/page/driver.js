/*
 * Conductor de la página del arnés de fidelidad (spec 003, T2/T3). Monta el
 * motor del diseño (`window.__Design`, la clase de `Arch3D.dc.html` sin
 * modificar) o el port (`window.__createEngine`) sobre el mismo marcado de la
 * plantilla del diseño, y captura el lienzo en la misma tarea en que se pinta.
 */
(() => {
  const H = window.__H;
  const NAMES = ['Interface', 'Logic', 'Data', 'Infrastructure'];
  const stage = document.getElementById('stage');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let side, canvas, tags, comp, engine, active, picks;

  // Marcado de la plantilla de Arch3D.dc.html (líneas 15–25).
  const render = (uid, mode) => {
    stage.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'a3 ' + (mode === 'hero' ? 'hero' : 'diagram');
    canvas = document.createElement('canvas');
    canvas.id = 'a3-' + uid; canvas.className = 'a3-gl'; canvas.setAttribute('aria-hidden', 'true');
    root.append(canvas);
    tags = NAMES.map((label, i) => {
      const b = document.createElement('button');
      b.id = 'a3-' + uid + '-t' + i; b.type = 'button';
      b.append(document.createElement('i'), document.createElement('b'), label);
      root.append(b);
      return b;
    });
    stage.append(root);
  };
  const paintTags = () => tags.forEach((b, i) => { b.className = 'a3-tag l' + i + (active === i ? ' on' : ''); b.setAttribute('aria-pressed', String(active === i)); });

  const F = (window.__F = {
    async mount(o) {
      side = o.side; active = o.active; picks = [];
      stage.style.width = o.w + 'px'; stage.style.height = o.h + 'px';
      // La fuente de los rótulos está cargada antes de arrancar cualquiera de los dos motores.
      await document.fonts.load('500 38px "JetBrains Mono"', o.labels.join(''));
      await document.fonts.load('400 11px "JetBrains Mono"', NAMES.join(''));
      render(o.uid, o.mode); paintTags();
      const onPick = i => picks.push(i);
      let ok;
      H.mark('setup');
      if (side === 'ref') {
        comp = new window.__Design();
        comp.props = { uid: o.uid, active: o.active, mode: o.mode, quality: o.quality, onPick };
        const started = new Promise(done => { const start = comp.start.bind(comp); comp.start = () => { try { start(); } finally { H.mark('idle'); done(); } }; });
        comp.componentDidMount();
        await started;
        ok = !(comp.state && comp.state.noGL);
      } else {
        engine = window.__createEngine(canvas, { mode: o.mode, active: o.active, quality: o.quality, labels: o.labels, tags: () => tags, onPick });
        H.mark('idle');
        ok = !!engine;
      }
      // ResizeObserver, IntersectionObserver y la promesa de las fuentes llegan después.
      await sleep(o.settle ?? 300);
      H.mark('ready');
      const gl = H.gl, dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
      return { ok, renderer: dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '', dpr: devicePixelRatio, client: [canvas.clientWidth, canvas.clientHeight], fine: matchMedia('(pointer: fine)').matches, coarse: matchMedia('(pointer: coarse)').matches, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
    },
    setActive(i) {
      active = i; paintTags();
      if (side === 'ref') { comp.props.active = i; comp.componentDidUpdate(); } else engine.setActive(i);
    },
    setHover(i) { if (side === 'ref') comp._setHover(i); else engine.setHover(i); },
    pointer(type, x, y) {
      const r = canvas.getBoundingClientRect();
      const init = { clientX: r.left + x, clientY: r.top + y, bubbles: true };
      canvas.dispatchEvent(type === 'click' ? new MouseEvent(type, init) : new PointerEvent(type, init));
    },
    capture() {
      return {
        png: canvas.toDataURL('image/png'),
        size: [canvas.width, canvas.height],
        // `data-start` (coste del arranque) solo lo escribe el port y depende del reloj: no se compara.
        data: Object.fromEntries(Object.entries(canvas.dataset).filter(([k]) => k !== 'start')),
        cursor: canvas.style.cursor,
        tags: tags.map(b => [b.style.transform, b.children[1].style.width, b.style.visibility, b.className, b.getAttribute('aria-pressed')].join(' | ')),
        picks: picks.slice(),
      };
    },
    // Cuadro fijo (`prefers-reduced-motion`): cambia la capa y captura en la misma tarea.
    frame(i) { H.mark('frame ' + i); F.setActive(i); return F.capture(); },
    // Animación con reloj virtual: aplica los eventos del guion, avanza un cuadro y captura donde se pide.
    run(script) {
      H.mark('run');
      const shots = {};
      for (let f = 1; f <= script.frames; f++) {
        (script.events[f] || []).forEach(([fn, ...args]) => F[fn](...args));
        H.step(script.dt);
        if (script.captures.includes(f)) shots[f] = F.capture();
      }
      return shots;
    },
    unmount() { if (side === 'ref') comp.componentWillUnmount(); else if (engine) engine.dispose(); },
    // Liberación: desmonta y dice qué quedó vivo (contexto, bucle, escuchas).
    release(x, y) {
      H.mark('dispose');
      F.unmount();
      H.mark('after');
      const before = picks.length;
      F.pointer('pointermove', x, y); F.pointer('click', x, y);
      return { contextLost: H.gl.isContextLost(), pendingFrames: H.pending ? H.pending() : null, picksAfter: picks.length - before, cursor: canvas.style.cursor };
    },
    // Montar y desmontar `n` veces seguidas, como al navegar ida y vuelta.
    async cycle(n, o) {
      for (let i = 0; i < n; i++) { await F.mount({ ...o, settle: 30 }); F.frame(-1); F.unmount(); stage.innerHTML = ''; }
      await sleep(200);
      return { created: H.contexts.length, alive: H.contexts.filter(c => !c.isContextLost()).length };
    },
  });
})();
