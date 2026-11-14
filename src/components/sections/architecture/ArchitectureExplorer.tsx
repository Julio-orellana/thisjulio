'use client';

import { useState, type ReactNode } from 'react';
import { Chip } from '@/components/ui/Chip';

type Part = { id: string; label: string; text: string };
type Band = { id: string; label: string; layer: number; optional: boolean; nodes: Part[] };
type System = { id: string; label: string; bands: Band[] };

/**
 * Isla de Arquitectura (`Technology.dc.html`): pestañas de tipo de sistema,
 * diagrama de bandas con sus piezas e inspector de la pieza elegida. Guarda
 * solo la pestaña y la pieza; al cambiar de pestaña se elige su primera pieza,
 * como el diseño. Los textos llegan ya localizados y las 4 vistas `Plates
 * stack` del inspector (una por capa resaltada), pintadas en el servidor. Sin
 * JavaScript se ve la primera pestaña con su primera pieza.
 */
export function ArchitectureExplorer({
  systems,
  systemsLabel,
  inspectorLabel,
  optionalNote,
  plates,
}: {
  systems: System[];
  systemsLabel: string;
  inspectorLabel: string;
  optionalNote: string;
  /** `Plates stack` con la capa 0–3 resaltada, en ese orden. */
  plates: ReactNode[];
}) {
  const [state, setState] = useState<{ tab: string; node: string | null }>({ tab: systems[0].id, node: null });
  const system = systems.find((s) => s.id === state.tab) ?? systems[0];
  const picked = state.node !== null && system.bands.some((b) => b.nodes.some((n) => n.id === state.node));
  const nodeId = picked ? state.node : system.bands[0].nodes[0].id;
  const band = system.bands.find((b) => b.nodes.some((n) => n.id === nodeId))!;
  const part = band.nodes.find((n) => n.id === nodeId)!;

  return (
    <>
      <div className="gal-tools arch-tools">
        <div className="chips" role="group" aria-label={systemsLabel}>
          {systems.map((s) => (
            <Chip key={s.id} pressed={s.id === system.id} onClick={() => setState({ tab: s.id, node: null })}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
      <div className="tech">
        <div className="stack-2">
          <div className="arch">
            {system.bands.map((b, i) => (
              <div key={b.id}>
                {i > 0 ? <div className={i % 2 ? 'arch-link alt' : 'arch-link'} /> : null}
                <div className={`arch-band${b.optional ? ' opt' : ''}${b === band ? ' on' : ''}`}>
                  <span className="mono">{b.label}</span>
                  <div className="arch-nodes">
                    {b.nodes.map((n) => (
                      <button
                        key={n.id}
                        className={n.id === nodeId ? 'arch-node on' : 'arch-node'}
                        type="button"
                        aria-pressed={n.id === nodeId}
                        onClick={() => setState({ tab: system.id, node: n.id })}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mono arch-note">{optionalNote}</p>
        </div>
        <aside className="inspector" aria-live="polite" aria-label={inspectorLabel}>
          <div className="inspector-plates">{plates[band.layer]}</div>
          <span className="mono">{band.label}</span>
          <h2 className="h3">{part.label}</h2>
          <p className="muted">{part.text}</p>
        </aside>
      </div>
    </>
  );
}
