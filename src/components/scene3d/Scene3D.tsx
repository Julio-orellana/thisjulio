'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Engine, SceneMode } from './engine';

type Props = {
  /** Distingue las escenas de una misma página (`hero`, `dia`), como en el diseño. */
  uid: string;
  mode: SceneMode;
  /** Capa resaltada, 0–3; −1 = todas. */
  active: number;
  /** Los 15 rótulos del atlas, ya localizados (mensajes `home.scene.labels`). */
  labels: readonly string[];
  /** Nombres de las 4 capas para las etiquetas DOM, ya localizados. */
  tags: readonly string[];
  /**
   * Respaldo sin WebGL del diseño (`Plates stack`), pintado en el servidor:
   * índices 0–3 = capa resaltada, 4 = ninguna.
   */
  fallbacks: readonly ReactNode[];
  onPick?: (layer: number) => void;
};

/** Margen con el que la escena empieza a cargarse antes de entrar en pantalla (P-29). */
const VIEWPORT_MARGIN = '200px';

/**
 * Isla de la escena 3D (`Arch3D.dc.html`; spec 003 §3.1, T4).
 *
 * - **Carga diferida:** el motor (`./engine`) solo se importa, y el `<canvas>`
 *   y su contexto WebGL solo se crean, cuando el contenedor se acerca al
 *   viewport. Las rutas sin escena no cargan nada.
 * - **Respaldo:** sin WebGL utilizable, o si el contexto se pierde, se muestra
 *   el `Plates stack` del diseño y se retiran lienzo y etiquetas. Sin
 *   JavaScript se ve ese mismo respaldo (`<noscript>`).
 * - **Liberación:** al desmontar, `dispose()` borra los recursos de la GPU y
 *   suelta el contexto. Cada montaje usa un `<canvas>` nuevo: uno cuyo contexto
 *   se soltó ya no sirve.
 * - Pausa fuera de pantalla, `prefers-reduced-motion` (un cuadro fijo) y perfil
 *   de calidad los resuelve el motor, como en el diseño.
 *
 * El lienzo es decorativo (`aria-hidden`): la información la llevan las 4
 * etiquetas (botones con `aria-pressed`) y el panel de texto de quien la monta.
 */
export function Scene3D({ uid, mode, active, labels, tags, fallbacks, onPick }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const tagEls = useRef<(HTMLButtonElement | null)[]>([]);
  const engine = useRef<Engine | null>(null);
  const [noGL, setNoGL] = useState(false);
  // Lo último que pidió quien monta la escena, para cuando el motor termine de cargar.
  const latest = useRef({ active, labels, onPick });
  useEffect(() => {
    latest.current = { active, labels, onPick };
  });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let canvas: HTMLCanvasElement | null = null;
    const stop = () => {
      engine.current?.dispose();
      engine.current = null;
      canvas?.remove();
      canvas = null;
    };
    const fallBack = () => {
      stop();
      if (!cancelled) setNoGL(true);
    };
    const start = async () => {
      const { createEngine } = await import('./engine');
      if (cancelled) return;
      canvas = document.createElement('canvas');
      canvas.id = `a3-${uid}`;
      canvas.className = 'a3-gl';
      canvas.setAttribute('aria-hidden', 'true');
      el.prepend(canvas);
      engine.current = createEngine(canvas, {
        mode,
        active: latest.current.active,
        labels: latest.current.labels,
        tags: () => tagEls.current,
        onPick: (layer) => latest.current.onPick?.(layer),
        onContextLost: fallBack,
      });
      if (!engine.current) fallBack();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        start().catch(fallBack);
      },
      { rootMargin: VIEWPORT_MARGIN },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      stop();
    };
  }, [uid, mode]);

  useEffect(() => {
    engine.current?.setActive(active);
  }, [active]);

  // Al cambiar de idioma sin recargar, el atlas se repinta con los rótulos nuevos.
  const labelsKey = labels.join('\n');
  useEffect(() => {
    engine.current?.setLabels(latest.current.labels);
  }, [labelsKey]);

  const fallback = <div className="a3-fallback">{fallbacks[active < 0 ? 4 : active]}</div>;
  const hover = (layer: number) => () => engine.current?.setHover(layer);

  return (
    <div ref={host} className={`a3 ${mode}`}>
      {noGL ? (
        fallback
      ) : (
        <>
          <noscript>{fallback}</noscript>
          {tags.map((label, i) => (
            <button
              key={i}
              ref={(node) => {
                tagEls.current[i] = node;
              }}
              id={`a3-${uid}-t${i}`}
              className={`a3-tag l${i}${active === i ? ' on' : ''}`}
              type="button"
              aria-pressed={active === i}
              onClick={() => onPick?.(i)}
              onMouseEnter={hover(i)}
              onMouseLeave={hover(-1)}
              onFocus={hover(i)}
              onBlur={hover(-1)}
            >
              <i />
              <b />
              {label}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
