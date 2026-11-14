import { getTranslations } from 'next-intl/server';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { Plates } from '@/components/plates/Plates';
import { signature } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getArchitecture } from '@/lib/content';
import { ArchitectureExplorer } from './ArchitectureExplorer';

const LAYERS = ['interface', 'logic', 'data', 'infrastructure'] as const;

/**
 * Arquitectura (`Technology.dc.html`; spec 003 §3.3, P-27 = A): diagrama HTML
 * de bandas y piezas con un inspector, sin escena 3D. El contenido sale de
 * `src/content/architecture.ts` (P-28: las 12 tecnologías del artboard y
 * «Monitoring», con sus condiciones). El servidor pinta el encabezado, la
 * banda final y las 4 vistas `Plates stack` del inspector; la isla
 * `ArchitectureExplorer` solo guarda la pestaña y la pieza elegidas.
 */
export async function ArchitectureView({ locale }: { locale: Locale }) {
  const t = await getTranslations('architecture');
  const home = await getTranslations('home');
  const cta = await getTranslations('cta');
  const layerLabels = LAYERS.map((k) => home(`built.layers.${k}.title`));
  // Al navegador solo va lo que la isla pinta: sin la marca de tecnología ni otros campos del contenido.
  const systems = getArchitecture(locale).map((s) => ({
    id: s.id,
    label: s.label,
    bands: s.bands.map((b) => ({
      id: b.id,
      label: b.label,
      layer: b.layer,
      optional: b.optional,
      nodes: b.nodes.map((n) => ({ id: n.id, label: n.label, text: n.text })),
    })),
  }));

  return (
    <>
      <header className="wrap page-head page-head-arch">
        <h1 className="h1">{t.rich('title', signature)}</h1>
        <p className="lead prose head-lead">{t('lead')}</p>
      </header>
      <div className="wrap">
        <ArchitectureExplorer
          systems={systems}
          systemsLabel={t('systemsLabel')}
          inspectorLabel={t('inspectorLabel')}
          optionalNote={t('optionalNote')}
          plates={[0, 1, 2, 3].map((active) => (
            <Plates key={active} kind="stack" active={active} layerLabels={layerLabels} />
          ))}
        />
      </div>

      <section className="section band" aria-labelledby="h-simple">
        <div className="wrap own">
          <div className="stack-2">
            <h2 id="h-simple" className="h2">
              {t('simple.title')}
            </h2>
            <p className="lead prose">{t('simple.lead')}</p>
          </div>
          <div className="actions">
            <Link className="btn btn-primary" href="/contact">
              {cta('startProject')} <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
