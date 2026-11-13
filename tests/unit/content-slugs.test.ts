import { describe, expect, it } from 'vitest';
import { resolveAlternate } from '@/i18n/alternate';
import { createContent } from '@/lib/content/create';
import { validContent } from './fixtures/content';

// CA-5 (nivel unitario): findTranslatedSlug conecta el selector ES | EN con el
// contenido; sin traducción, la página padre.
const api = createContent(validContent());

describe('findTranslatedSlug', () => {
  it('ida y vuelta de los 7 servicios', () => {
    for (const s of api.getServices('es')) {
      const en = api.findTranslatedSlug('/services/[slug]', s.slug, 'es', 'en');
      expect(en).toBe(api.getServices('en').find((x) => x.id === s.id)?.slug);
      expect(api.findTranslatedSlug('/services/[slug]', en!, 'en', 'es')).toBe(s.slug);
    }
  });

  it('ida y vuelta del caso aprobado', () => {
    expect(api.findTranslatedSlug('/work/[slug]', 'proyecto-uno', 'es', 'en')).toBe('project-one');
    expect(api.findTranslatedSlug('/work/[slug]', 'project-one', 'en', 'es')).toBe('proyecto-uno');
  });

  it('un proyecto en borrador no se traduce (no tiene página)', () => {
    expect(api.findTranslatedSlug('/work/[slug]', 'proyecto-borrador', 'es', 'en')).toBeNull();
  });

  it('un slug del otro idioma o inexistente no se traduce', () => {
    expect(api.findTranslatedSlug('/services/[slug]', 'service-1', 'es', 'en')).toBeNull();
    expect(api.findTranslatedSlug('/services/[slug]', 'no-existe', 'es', 'en')).toBeNull();
    expect(api.findTranslatedSlug('/blog/[slug]', 'cualquiera', 'es', 'en')).toBeNull();
  });
});

describe('resolveAlternate con el contenido', () => {
  it('lleva al slug equivalente', () => {
    expect(
      resolveAlternate({ pathname: '/services/[slug]', params: { slug: 'servicio-3' } }, 'es', 'en', api.findTranslatedSlug),
    ).toEqual({ pathname: '/services/[slug]', params: { slug: 'service-3' } });
  });

  it('sin traducción, a la página padre', () => {
    expect(
      resolveAlternate({ pathname: '/work/[slug]', params: { slug: 'proyecto-borrador' } }, 'es', 'en', api.findTranslatedSlug),
    ).toEqual({ pathname: '/work' });
  });
});

describe('listStaticParams', () => {
  it('servicios: un par (idioma, slug) por servicio e idioma, sin repetidos', () => {
    const pairs = api.listStaticParams('services');
    expect(pairs).toHaveLength(14);
    expect(new Set(pairs.map((p) => `${p.locale}/${p.slug}`)).size).toBe(14);
  });
});
