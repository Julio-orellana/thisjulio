import { getTranslations } from 'next-intl/server';
import { ArrowIcon } from '@/components/layout/ArrowIcon';
import { Plates } from '@/components/plates/Plates';
import { ArrowLink, PathLink, Row, Rows, SectionHead, signature, TagList } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getProjects, getServices } from '@/lib/content';
import { HeroScene } from './HeroScene';
import { LayerPicker } from './LayerPicker';
import { workGridClass } from './work-grid';

const LAYERS = ['interface', 'logic', 'data', 'infrastructure'] as const;

/**
 * Inicio (`Main.dc.html`), seis secciones en el orden del diseño. El hero y
 * «How it's built» llevan la escena 3D (feature 003): `HeroScene` con el
 * recorrido por capas al desplazar (P-30) y `LayerPicker` con el diagrama
 * sincronizado. El servidor no pinta ningún `<canvas>`: la isla `Scene3D` lo
 * crea al acercarse al viewport y, sin WebGL, muestra el respaldo del diseño
 * (`Plates stack` en `.a3-fallback`), que se pinta aquí. «This is Julio» en una
 * columna, sin retrato (D-12, DA-7). Con un solo proyecto, su tarjeta ocupa el
 * ancho de la rejilla (▲A4).
 */
export async function HomeView({ locale }: { locale: Locale }) {
  const t = await getTranslations('home');
  const projects = getProjects(locale).slice(0, 3);
  const services = getServices(locale);
  const layerText = (k: (typeof LAYERS)[number] | 'system') => ({
    title: t(`built.layers.${k}.title`),
    text: t(`built.layers.${k}.text`),
    parts: t.raw(`built.layers.${k}.parts`) as string[],
    link: t(`built.layers.${k}.link`),
  });
  const layerLabels = LAYERS.map((k) => t(`built.layers.${k}.title`));
  // Respaldo sin WebGL de la escena, uno por capa resaltada (0–3) y otro sin ninguna.
  const fallbacks = [0, 1, 2, 3, -1].map((active) => (
    <Plates key={active} kind="stack" active={active} tall layerLabels={layerLabels} />
  ));
  const sceneLabels = t.raw('scene.labels') as string[];
  const infos = [...LAYERS, 'system' as const].map((k) => layerText(k));

  return (
    <>
      <HeroScene
        label={t('hero.label')}
        hint={t('hero.hint')}
        steps={t.raw('hero.steps') as string[]}
        scene={{ labels: sceneLabels, tags: layerLabels, fallbacks }}
      >
        <div className="wrap hero-in">
          <h1 className="display hero-title">{t('hero.title')}</h1>
          <div className="hero-foot">
            <div className="stack-3">
              <p className="lead hero-lead">{t('hero.lead')}</p>
              <div className="actions">
                <Link className="btn btn-primary" href="/work">
                  {t('hero.explore')} <ArrowIcon />
                </Link>
                <Link className="btn btn-ghost" href="/estimate">
                  {t('hero.start')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </HeroScene>

      <section className="section wrap" aria-labelledby="h-work">
        <SectionHead id="h-work" reveal title={t.rich('work.title', signature)} />
        <div className={workGridClass(projects.length)}>
          {projects.map((p) => (
            <Link key={p.id} className="proj hover-depth" href={{ pathname: '/work/[slug]', params: { slug: p.slug } }}>
              <div className="proj-view">
                <Plates kind={p.plates} wide />
              </div>
              <div className="gal-meta">
                <span className="mono">{p.tag}</span>
                <h3 className="proj-name">{p.title}</h3>
                <p className="muted small">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="work-foot">
          <Link className="btn btn-ghost" href="/work">
            {t('work.all')} <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className="section wrap rule" aria-labelledby="h-serv">
        <SectionHead id="h-serv" reveal title={t.rich('services.title', signature)} />
        <Rows reveal>
          {services.map((s) => (
            <Row key={s.id} href={{ pathname: '/services/[slug]', params: { slug: s.slug } }} n={s.n} title={s.title} line={s.line} />
          ))}
        </Rows>
      </section>

      <section className="section band" aria-labelledby="h-tech">
        <div className="wrap">
          <SectionHead
            id="h-tech"
            title={t.rich('built.title', signature)}
            action={<ArrowLink href="/architecture">{t('built.link')}</ArrowLink>}
          />
          <div className="built">
            <LayerPicker
              groupLabel={t('built.groupLabel')}
              layers={LAYERS.map((k, i) => ({ n: `0${i + 1}`, title: t(`built.layers.${k}.title`) }))}
              all={{ n: t('built.allTag'), title: t('built.all') }}
              panels={infos.map((info) => (
                <>
                  <h3 className="h3">{info.title}</h3>
                  <p className="muted">{info.text}</p>
                  <TagList variant="chip" items={info.parts} />
                  <p className="small built-link">{info.link}</p>
                </>
              ))}
              scene={{ labels: sceneLabels, fallbacks }}
            />
          </div>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="h-me">
        <div className="me solo">
          <div className="stack-3 rv">
            <h2 id="h-me" className="h2">
              {t.rich('me.title', signature)}
            </h2>
            <p className="lead prose">{t('me.lead')}</p>
            <p className="muted prose">{t('me.text')}</p>
            <ArrowLink href="/about">{t('me.more')}</ArrowLink>
          </div>
        </div>
      </section>

      <section className="section wrap rule" aria-labelledby="h-go">
        <div className="final">
          <h2 id="h-go" className="display rv">
            {t('final.title')}
          </h2>
          <div className="rv">
            <PathLink href="/estimate" title={t('final.estimate')} text={t('final.estimateText')} />
            <PathLink href="/contact" title={t('final.contact')} text={t('final.contactText')} />
          </div>
        </div>
      </section>
    </>
  );
}
