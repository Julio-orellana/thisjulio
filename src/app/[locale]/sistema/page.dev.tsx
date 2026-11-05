import { ArrowIcon } from '@/components/layout/ArrowIcon';

/**
 * Muestra del sistema de diseño — SOLO DESARROLLO (spec 001 R7.2).
 * La extensión `.dev.tsx` solo se reconoce en `next dev` (next.config.ts
 * `pageExtensions`), por lo que esta ruta no existe en el build de producción.
 * Sirve para comparar con `DesignSystem.dc.html`; sus textos son muestras del
 * diseño y no forman parte del sitio.
 */
const colors = [
  ['--bg', 'bg-bg'],
  ['--bg-2', 'bg-bg-2'],
  ['--surface', 'bg-surface'],
  ['--line', 'bg-line'],
  ['--line-2', 'bg-line-2'],
  ['--text', 'bg-text'],
  ['--text-2', 'bg-text-2'],
  ['--accent', 'bg-accent'],
  ['--accent-up', 'bg-accent-up'],
  ['--cyan', 'bg-cyan'],
  ['--violet', 'bg-violet'],
  ['--steel', 'bg-steel'],
  ['--warn', 'bg-warn'],
  ['--ok', 'bg-ok'],
] as const;

export default function SistemaPage() {
  return (
    <div className="wrap section stack-4">
      <h1 className="h1">
        <span className="this">This</span> is the system.
      </h1>

      <section className="stack-2" aria-labelledby="ds-color">
        <h2 id="ds-color" className="mono">Color tokens</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {colors.map(([name, cls]) => (
            <li key={name} className="stack-1">
              <span className={`block h-16 border border-line-2 ${cls}`} />
              <span className="mono">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack-3" aria-labelledby="ds-type">
        <h2 id="ds-type" className="mono">Typography</h2>
        <p className="display">Move forward</p>
        <p className="h1">Move forward</p>
        <p className="h2">Engineered with purpose</p>
        <p className="h3">Custom software development</p>
        <p className="lead">Software, platforms and digital products.</p>
        <p>Short descriptions and generous spacing.</p>
        <p className="mono">Technical label</p>
      </section>

      <section className="band section" aria-labelledby="ds-btn">
        <div className="stack-3 px-6">
          <h2 id="ds-btn" className="mono">Buttons and links</h2>
          <div className="actions">
            <a className="btn btn-primary" href="#ds-btn">
              Primary <ArrowIcon />
            </a>
            <a className="btn btn-primary is-hover" href="#ds-btn">Hover</a>
            <a className="btn btn-primary is-active" href="#ds-btn">Pressed</a>
            <a className="btn btn-primary is-focus" href="#ds-btn">Focus</a>
            <button className="btn btn-primary" type="button" disabled>
              Disabled
            </button>
          </div>
          <div className="actions">
            <a className="btn btn-ghost" href="#ds-btn">Secondary</a>
            <a className="btn btn-ghost is-hover" href="#ds-btn">Hover</a>
            <a className="btn btn-ghost is-active" href="#ds-btn">Pressed</a>
            <a className="btn btn-ghost btn-sm" href="#ds-btn">Small</a>
          </div>
          <div className="actions">
            <a className="link" href="#ds-btn">
              <span>Text link</span> <ArrowIcon />
            </a>
            <span className="status mono">
              <span className="status-dot" aria-hidden="true" />
              Status
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
