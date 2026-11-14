import { buildPlates, token, type PlateKind } from './data.mjs';

export type { PlateKind };

type Props = {
  kind: PlateKind;
  /** 16:9, como en las tarjetas de Inicio, la galería y el caso. */
  wide?: boolean;
  /** 1:1. */
  tall?: boolean;
  /** Solo `stack`: capa resaltada (0 Interfaz … 3 Infraestructura); -1 ninguna. */
  active?: number;
  /** Solo `stack`: rótulos de las capas en orden 0 Interfaz … 3 Infraestructura, ya localizados. */
  layerLabels?: readonly string[];
};

/**
 * Vista explotada del diseño (`Plates.dc.html`), sin atributo `style` (CSP,
 * ADR 006). P-23, opción A: posición, tamaño y profundidad salen de clases de
 * `src/styles/plates.generated.css`; las reglas `.xv`, `.plate`, `.blk` y `.pin`
 * de site.css se usan sin cambios. Decorativa (`aria-hidden`): la información
 * la lleva el texto de la página. Server Component, sin JavaScript en el cliente.
 *
 * El modo `flat` (pantallas del caso) no se expone: esa sección está omitida
 * (P-03) y su CSS no se trasladó.
 */
export function Plates({ kind, wide = false, tall = false, active = -1, layerLabels }: Props) {
  const { plates, pins, xvCls } = buildPlates({ kind, wide, tall, active });
  const last = plates.length - 1;
  return (
    <div className={`xv ${xvCls}`.trim()} aria-hidden="true">
      <div className="xv-scene">
        {plates.map((p) => (
          <div key={p.i} className={`plate ${p.cls} i-${p.i}`.replace(/\s+/g, ' ')}>
            {p.blocks.map((b, k) => (
              <div key={k} className={`blk ${b.c} bx-${token(b.x)} by-${token(b.y)} bw-${token(b.w)} bh-${token(b.h)}`} />
            ))}
            {p.hasLabel ? <span className="plate-t">{layerLabels?.[last - p.i] ?? p.label}</span> : null}
          </div>
        ))}
        {pins.map((q, k) => (
          <div key={k} className={`pin bx-${token(q.x)} by-${token(q.y)}`} />
        ))}
      </div>
    </div>
  );
}
