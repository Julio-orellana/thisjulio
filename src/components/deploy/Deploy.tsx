import { getTranslations } from 'next-intl/server';
import { TagList } from '@/components/ui';

/**
 * Arquitecturas de despliegue (`Deploy.dc.html`), solo en Servicios 06.
 * Cloud, local e híbrida son ALTERNATIVAS de diseño para cada cliente, no
 * capacidades de un sistema concreto (caso-pos.md §5, D-14): por eso no se usa
 * en el caso POS. Los SVG son los del diseño, con los rótulos localizados;
 * cada uno lleva `role="img"` y su descripción. Server Component.
 */
export async function Deploy() {
  const t = await getTranslations('services.deploy');
  const devices = t.raw('devices') as string[];
  return (
    <div>
      <div className="dep-grid">
        <article className="dep">
          <svg viewBox="0 0 260 170" role="img" aria-label={t('cloud.label')}>
            <path className="f" d="M130 84 L46 128" />
            <path className="f" d="M130 84 L130 128" />
            <path className="f" d="M130 84 L214 128" />
            <path className="c" d="M92 76a22 22 0 0 1 4-43 30 30 0 0 1 57-6 24 24 0 0 1 22 49z" />
            <text x="130" y="59" textAnchor="middle">{t('cloud.svg.services')}</text>
            <g>
              <rect className="n" x="24" y="128" width="44" height="28" rx="2" />
              <rect className="n" x="108" y="128" width="44" height="28" rx="2" />
              <rect className="n" x="192" y="128" width="44" height="28" rx="2" />
            </g>
            <text x="46" y="146" textAnchor="middle">{t('cloud.svg.client')}</text>
            <text x="130" y="146" textAnchor="middle">{t('cloud.svg.client')}</text>
            <text x="214" y="146" textAnchor="middle">{t('cloud.svg.client')}</text>
          </svg>
          <h3 className="h3">{t('cloud.title')}</h3>
          <p className="muted small">{t('cloud.text')}</p>
        </article>
        <article className="dep">
          <svg viewBox="0 0 260 170" role="img" aria-label={t('local.label')}>
            <rect className="b" x="8" y="10" width="244" height="150" rx="3" />
            <text x="20" y="28">{t('local.svg.premises')}</text>
            <path className="f" d="M130 74 L130 106" />
            <path className="f" d="M62 118 L198 118" />
            <rect className="c" x="96" y="38" width="68" height="36" rx="2" />
            <text x="130" y="60" textAnchor="middle">{t('local.svg.server')}</text>
            <rect className="n" x="110" y="108" width="40" height="20" rx="2" />
            <text x="130" y="122" textAnchor="middle">{t('local.svg.lan')}</text>
            <rect className="n" x="20" y="104" width="44" height="28" rx="2" />
            <rect className="n" x="196" y="104" width="44" height="28" rx="2" />
            <text x="42" y="122" textAnchor="middle">{t('local.svg.pc')}</text>
            <text x="218" y="122" textAnchor="middle">{t('local.svg.pc')}</text>
          </svg>
          <h3 className="h3">{t('local.title')}</h3>
          <p className="muted small">{t('local.text')}</p>
        </article>
        <article className="dep">
          <svg viewBox="0 0 260 170" role="img" aria-label={t('hybrid.label')}>
            <rect className="b" x="8" y="62" width="150" height="98" rx="3" />
            <text x="20" y="80">{t('hybrid.svg.premises')}</text>
            <path className="f" d="M104 104 L188 62" />
            <path className="f" d="M64 120 L72 120" />
            <rect className="c" x="72" y="92" width="72" height="44" rx="2" />
            <text x="108" y="118" textAnchor="middle">{t('hybrid.svg.local')}</text>
            <rect className="n" x="20" y="106" width="44" height="28" rx="2" />
            <text x="42" y="124" textAnchor="middle">{t('hybrid.svg.pc')}</text>
            <path className="c" d="M160 62a17 17 0 0 1 3-33 23 23 0 0 1 44-5 19 19 0 0 1 17 38z" />
            <text x="192" y="46" textAnchor="middle">{t('hybrid.svg.cloud')}</text>
            <text x="196" y="104" textAnchor="middle">{t('hybrid.svg.backups')}</text>
            <text x="196" y="118" textAnchor="middle">{t('hybrid.svg.sync')}</text>
            <text x="196" y="132" textAnchor="middle">{t('hybrid.svg.reporting')}</text>
          </svg>
          <h3 className="h3">{t('hybrid.title')}</h3>
          <p className="muted small">{t('hybrid.text')}</p>
        </article>
      </div>
      <div className="dep-note">
        <p className="small dep-note-text">{t('note')}</p>
        <div className="stack-1">
          <span className="mono">{t('designedFor')}</span>
          <TagList variant="chip" items={devices} />
        </div>
      </div>
    </div>
  );
}
