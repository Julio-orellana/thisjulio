import { Plates, type PlateKind } from '@/components/plates/Plates';

/**
 * Laboratorio de `Plates` — SOLO DESARROLLO (como /sistema; no existe en el
 * build de producción). Las mismas vistas que la comparación de la T6a, salvo
 * el modo flat: sirve para repetir la comparación píxel a píxel con la réplica
 * del diseño (evidencia-t6-plates.md) cuando cambie el componente.
 */
const KINDS: PlateKind[] = ['site', 'dash', 'inst', 'pos', 'saas', 'api', 'stack'];
const VIEWS = [
  ...KINDS.map((kind) => ({ id: `wide-${kind}`, props: { kind, wide: true } })),
  ...KINDS.map((kind) => ({ id: `default-${kind}`, props: { kind } })),
  ...KINDS.map((kind) => ({ id: `tall-${kind}`, props: { kind, tall: true } })),
  ...[0, 1, 2, 3].map((active) => ({ id: `stack-active-${active}`, props: { kind: 'stack' as const, active } })),
];

export default function PlatesLabPage() {
  return (
    <div className="wrap">
      <div className="gal">
        {VIEWS.map((v) => (
          <a key={v.id} className="gal-item hover-depth" href={`#${v.id}`} data-view={v.id}>
            <div className="gal-view proj-view">
              <Plates {...v.props} />
            </div>
            <div className="gal-meta">
              <span className="mono">{v.id}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
