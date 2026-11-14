import { describe, expect, it } from 'vitest';
import { validateContent } from '@/content/schema';
import { createContent } from '@/lib/content/create';
import { validContent, type ContentFixture } from './fixtures/content';

// CA-3 (spec 002): la capa de contenido rechaza en build lo inválido.
// Cada caso parte del contenido de prueba válido y rompe una sola cosa.

function rejects(mutate: (c: ContentFixture) => void, expected: RegExp) {
  const c = validContent();
  mutate(c);
  expect(() => validateContent(c)).toThrow(expected);
}

describe('esquema de contenido: el caso válido', () => {
  it('el contenido de prueba pasa', () => {
    expect(() => validateContent(validContent())).not.toThrow();
  });
});

describe('esquema de contenido: rechaza', () => {
  it('idioma faltante en un bloque', () => {
    rejects((c) => {
      delete (c.services[0].text as Partial<typeof c.services[0]['text']>).en;
    }, /services\[0\]\.text\.en/);
  });

  it('un idioma no declarado', () => {
    rejects((c) => {
      (c.about.who as Record<string, unknown>).fr = 'Qui';
    }, /Unrecognized key: "fr"/);
  });

  it('slug duplicado dentro de un idioma (servicios)', () => {
    rejects((c) => {
      c.services[1].slugs.es = c.services[0].slugs.es;
    }, /slug de servicio \(es\) duplicado/);
  });

  it('slug duplicado dentro de un idioma (proyectos, aunque uno sea borrador)', () => {
    rejects((c) => {
      c.projects[1].slugs.en = c.projects[0].slugs.en;
    }, /slug de proyecto \(en\) duplicado/);
  });

  it('slug con mayúsculas o espacios', () => {
    rejects((c) => {
      c.services[0].slugs.en = 'Custom Software';
    }, /slug inválido/);
  });

  it('campo vacío o solo espacios', () => {
    rejects((c) => {
      c.services[2].text.es.value = '   ';
    }, /campo vacío/);
  });

  for (const marker of ['[Confirm stack]', '[year]', '[Add confirmed feature]', '[email]@thisjulio.com']) {
    it(`marcador sin resolver ${marker}`, () => {
      rejects((c) => {
        c.projects[0].features.en.items.push(marker);
        c.projects[0].features.es.items.push('Otra');
      }, /marcador/);
    });
  }

  it('status inválido', () => {
    rejects((c) => {
      (c.projects[0] as { status: string }).status = 'published';
    }, /projects\[0\]\.status/);
  });

  it('copy inválido', () => {
    rejects((c) => {
      (c.about.what as { copy: string }).copy = 'final';
    }, /about\.what\.copy/);
  });

  it('copy inválido en un espacio de nombres de mensajes', () => {
    rejects((c) => {
      (c.messagesCopy as Record<string, string>).home = 'ok';
    }, /messagesCopy\.home/);
  });

  it('6 servicios', () => {
    rejects((c) => {
      c.services.pop();
    }, /exactamente 7 servicios/);
  });

  it('8 servicios', () => {
    rejects((c) => {
      c.services.push({ ...c.services[0], id: 'octavo', order: 7, slugs: { es: 'octavo', en: 'eighth' } });
    }, /exactamente 7 servicios/);
  });

  it('orden de servicio repetido', () => {
    rejects((c) => {
      c.services[6].order = 1;
    }, /orden de servicio duplicado/);
  });

  it('proyecto aprobado sin fuente verificable', () => {
    rejects((c) => {
      delete (c.projects[0] as { source?: string }).source;
    }, /aprobado sin fuente/);
  });

  it('proyecto aprobado con fuente vacía', () => {
    rejects((c) => {
      c.projects[0].source = '  ';
    }, /aprobado sin fuente/);
  });

  it('categoría desconocida', () => {
    rejects((c) => {
      c.projects[0].categories = ['blockchain'];
    }, /projects\[0\]\.categories/);
  });

  it('especialidades o tecnologías en Acerca de (P-20)', () => {
    rejects((c) => {
      (c.about as Record<string, unknown>).technologies = { copy: 'draft', es: 'X', en: 'X' };
    }, /Unrecognized key: "technologies"/);
  });

  it('distinto número de entregables entre idiomas', () => {
    rejects((c) => {
      c.services[0].text.en.gets.push('Three');
    }, /distinto número de entregables/);
  });

  it('distinta estructura de una sección legal entre idiomas', () => {
    rejects((c) => {
      c.legal.sections[0].text.en.body.pop();
    }, /misma estructura/);
  });

  it('una sección legal de menos', () => {
    rejects((c) => {
      c.legal.sections.pop();
    }, /legal\.sections/);
  });

  const vedados: [string, string, RegExp][] = [
    ['«24/7»', 'Asistencia 24/7', /24\/7/],
    ['«24 / 7»', 'Support 24 / 7', /24\/7/],
    ['«SLA»', 'Con SLA definido', /sla/],
    ['«tiempos de respuesta»', 'Tiempos de respuesta acordados', /tiempos-de-respuesta/],
    ['«response times»', 'Response times are defined', /tiempos-de-respuesta/],
    ['«availability»', 'Guaranteed availability', /disponibilidad/],
    ['«monitoreo»', 'Monitoreo, según el plan', /monitoreo/],
    ['«monitoring»', 'Monitoring included', /monitoreo/],
    ['«cobertura»', 'La cobertura se define', /cobertura/],
    ['proyecto sin verificar', 'Hecho para Kinderland', /proyecto-no-verificado/],
    ['stack del POS', 'Electron + SQLite', /tecnologia-no-confirmada/],
    ['tecnología de la lista de Acerca de', 'Construido con Next.js', /tecnologia-no-confirmada/],
  ];
  for (const [nombre, valor, patron] of vedados) {
    it(`texto vedado: ${nombre}`, () => {
      rejects((c) => {
        c.services[6].text.en.value = valor;
      }, patron);
    });
  }
});

describe('createContent', () => {
  it('valida al crearse: contenido inválido lanza', () => {
    const c = validContent();
    c.services.pop();
    expect(() => createContent(c)).toThrow(/exactamente 7 servicios/);
  });

  it('solo los proyectos approved generan página y aparecen en la galería', () => {
    const api = createContent(validContent());
    expect(api.getProjects('es').map((p) => p.id)).toEqual(['uno']);
    expect(api.getProject('es', 'proyecto-borrador')).toBeUndefined();
    expect(api.listStaticParams('work')).toEqual([
      { locale: 'es', slug: 'proyecto-uno' },
      { locale: 'en', slug: 'project-one' },
    ]);
  });

  it('las categorías del filtro salen solo de proyectos approved (DA-4)', () => {
    expect(createContent(validContent()).getProjectCategories()).toEqual(['pos']);
  });

  it('lista los bloques de texto con su estado de aprobación', () => {
    const c = validContent();
    c.about.who.copy = 'approved' as 'draft';
    const blocks = createContent(c).listCopyBlocks();
    expect(blocks.find((b) => b.path === 'about.who')?.copy).toBe('approved');
    expect(blocks.filter((b) => b.path.startsWith('messages/'))).toHaveLength(8);
    expect(blocks.every((b) => b.copy === 'draft' || b.copy === 'approved')).toBe(true);
  });
});
