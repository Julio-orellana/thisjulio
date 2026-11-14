'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Scene3D } from '@/components/scene3d/Scene3D';
import { heroLayer, tourStep } from './hero-tour';

type Props = {
  /** Nombre accesible de la sección. */
  label: string;
  /** «Scroll to follow a request through the system». */
  hint: string;
  /** Texto de cada paso del recorrido, capas 0–3. */
  steps: readonly string[];
  scene: { labels: readonly string[]; tags: readonly string[]; fallbacks: readonly ReactNode[] };
  /** Titular y acciones del hero, pintados en el servidor. */
  children: ReactNode;
};

/**
 * Hero de Inicio con la escena 3D y su recorrido por capas (`Main.dc.html`,
 * P-30): `.hero-pin` da el tramo de desplazamiento durante el que `.hero`
 * queda fijado; el paso resalta una capa y cambia el rótulo `.hero-hint`. Con
 * ≤ 1040 px, pantallas muy altas o `prefers-reduced-motion`, el CSS del diseño
 * no fija el hero y no hay recorrido. Un clic en una capa la resalta (y otro la
 * suelta) mientras el recorrido no manda.
 */
export function HeroScene({ label, hint, steps, scene, children }: Props) {
  const pin = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(-1);
  const [picked, setPicked] = useState(-1);

  useEffect(() => {
    const onScroll = () => {
      const el = pin.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const hero = el.firstElementChild ? el.firstElementChild.getBoundingClientRect() : r;
      const next = tourStep(r.top, r.height, hero.height);
      if (next !== null) setStep(next);
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={pin} className="hero-pin">
      <section className="hero" aria-label={label}>
        <div className="hero-3d">
          <Scene3D
            uid="hero"
            mode="hero"
            active={heroLayer(step, picked)}
            onPick={(i) => setPicked((now) => (now === i ? -1 : i))}
            labels={scene.labels}
            tags={scene.tags}
            fallbacks={scene.fallbacks}
          />
        </div>
        {children}
        <span className="hero-hint mono" aria-hidden="true">
          {step >= 0 ? steps[step] : hint}
        </span>
      </section>
    </div>
  );
}
