'use client';

import { useState, type ReactNode } from 'react';
import { Scene3D } from '@/components/scene3d/Scene3D';

type Layer = { n: string; title: string };

/**
 * Isla de «How it's built» (`Main.dc.html`): selector de 4 capas + «Ver el
 * sistema completo» con `aria-pressed`, panel `aria-live` y la escena 3D en
 * modo diagrama, sincronizada con el selector (elegir una capa en la escena o
 * en sus etiquetas la elige también aquí). El servidor pinta de antemano los 5
 * paneles y los 5 respaldos sin WebGL (`Plates stack` con la capa resaltada) y
 * la isla solo elige cuál mostrar: no lleva datos ni componentes de `Plates`
 * al navegador. Sin JavaScript se ve la capa 01.
 * Índices 0–3 = capas; 4 = sistema completo (layer -1 del diseño).
 */
export function LayerPicker({
  layers,
  all,
  groupLabel,
  panels,
  scene,
}: {
  layers: Layer[];
  all: Layer;
  groupLabel: string;
  panels: ReactNode[];
  /** Rótulos del atlas y respaldos de la escena (índices como `panels`). */
  scene: { labels: readonly string[]; fallbacks: readonly ReactNode[] };
}) {
  const [layer, setLayer] = useState(0);
  const idx = layer < 0 ? layers.length : layer;
  return (
    <>
      <div className="stack-3">
        <div className="layer-pick" role="group" aria-label={groupLabel}>
          {layers.map((l, i) => (
            <button key={l.n} className={`lp l${i}${i === layer ? ' on' : ''}`} type="button" aria-pressed={i === layer} onClick={() => setLayer(i)}>
              <span className="mono">{l.n}</span>
              {l.title}
            </button>
          ))}
          <button className={`lp lp-all${layer < 0 ? ' on' : ''}`} type="button" aria-pressed={layer < 0} onClick={() => setLayer(-1)}>
            <span className="mono">{all.n}</span>
            {all.title}
          </button>
        </div>
        <div className={layer < 0 ? 'built-info' : `built-info l${layer}`} aria-live="polite">
          {panels[idx]}
        </div>
      </div>
      <div className="built-stage">
        <Scene3D
          uid="dia"
          mode="diagram"
          active={layer}
          onPick={setLayer}
          labels={scene.labels}
          tags={layers.map((l) => l.title)}
          fallbacks={scene.fallbacks}
        />
      </div>
    </>
  );
}
