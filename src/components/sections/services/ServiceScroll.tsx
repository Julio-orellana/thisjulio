'use client';

import { useEffect } from 'react';

/** `true` tras la primera carga de documento que monta esta isla. */
let documentLoaded = false;

/**
 * Isla mínima de Servicios (spec 002 §3.4, plan §1.6, REFERENCIA §4.3): al
 * elegir un servicio, su número y título quedan justo debajo del encabezado
 * fijo (76 px escritorio / 64 px móvil, más la barra de pestañas cuando se
 * apila, + 20 px), sin desplazar si ya están ahí (±8 px). Misma cuenta que
 * `Services.dc.html` → select().
 *
 * - Entrada directa a `/servicios/<slug>` (o desde otra página): salto
 *   instantáneo, sin mover el foco (como `select(id, true)` del diseño).
 * - Cambio de servicio dentro de la página: desplazamiento suave (instantáneo
 *   con `prefers-reduced-motion`) y el foco pasa al panel.
 * - `/servicios` cargado directamente: no se mueve nada.
 * Sin estado; sin JavaScript las pestañas siguen funcionando como enlaces.
 */
export function ServiceScroll({ id, deepLink }: { id: string; deepLink: boolean }) {
  useEffect(() => {
    const first = !documentLoaded;
    documentLoaded = true;
    if (first && !deepLink) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const panel = document.getElementById('sv-panel');
        const bar = document.getElementById('sv-index');
        if (!panel) return;
        const stacked = !!bar && getComputedStyle(bar).flexDirection === 'row';
        const head = (window.innerWidth <= 640 ? 64 : 76) + (stacked && bar ? bar.offsetHeight : 0) + 20;
        // El panel entra con la animación `svIn` (translateY 8 px → 0): se mide su
        // posición final, sin la traslación en curso.
        const transform = getComputedStyle(panel).transform;
        const shift = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform).m42 : 0;
        const top = panel.getBoundingClientRect().top - shift;
        if (Math.abs(top - head) > 8) {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: Math.max(0, window.scrollY + top - head), behavior: reduce || first ? 'auto' : 'smooth' });
        }
        // Barra apilada (≤ 1040 px): centra la pestaña activa sin mover la página.
        const tab = document.getElementById(`sv-tab-${id}`);
        if (tab && bar && stacked) bar.scrollLeft = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
        if (!first) panel.focus({ preventScroll: true });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [id, deepLink]);
  return null;
}
