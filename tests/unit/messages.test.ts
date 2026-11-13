import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { messages } from '@/i18n/messages';
import { findPolicyViolations } from '@/content/policy';
import { MESSAGE_NAMESPACES } from '@/content/schema';
import { messagesCopy } from '@/content/messages-copy';

// CA-6 (001): los mensajes de es y en tienen exactamente las mismas claves.
function keys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

function valueAt(obj: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], obj);
}

describe('mensajes', () => {
  it('es y en tienen las mismas claves', () => {
    expect(keys(messages.en).sort()).toEqual(keys(messages.es).sort());
  });

  it('ningún mensaje está vacío', () => {
    for (const locale of ['es', 'en'] as const) {
      const empty = keys(messages[locale]).filter((k) => {
        const value = valueAt(messages[locale], k);
        return typeof value !== 'string' || value.trim() === '';
      });
      expect(empty, locale).toEqual([]);
    }
  });

  it('no contienen «24/7» (prompt §4.5)', () => {
    expect(JSON.stringify(messages)).not.toMatch(/24\s*\/\s*7/);
  });

  // CA-4 y CA-7 (002, nivel de contenido): ningún mensaje rompe la política:
  // 24/7, SLA, tiempos de respuesta, disponibilidad, monitoreo, cobertura,
  // marcadores, proyectos sin verificar ni tecnologías sin confirmar.
  it('ningún mensaje rompe la política de contenido (src/content/policy.ts)', () => {
    for (const locale of ['es', 'en'] as const) {
      const violations = keys(messages[locale]).flatMap((k) =>
        findPolicyViolations(String(valueAt(messages[locale], k))).map((v) => `${locale}.${k}: ${v}`),
      );
      expect(violations).toEqual([]);
    }
  });

  it('la firma «This» (D-13, P-22) se conserva igual en los dos idiomas', () => {
    const conFirma = keys(messages.en).filter((k) => String(valueAt(messages.en, k)).includes('<this>'));
    expect(conFirma.length).toBeGreaterThan(0);
    for (const k of conFirma) {
      expect(String(valueAt(messages.es, k)), k).toMatch(/^<this>This<\/this> /);
      expect(String(valueAt(messages.en, k)), k).toMatch(/^<this>This<\/this> /);
    }
  });

  it('los espacios de nombres de la 002 y la 003 están registrados y tienen su estado de aprobación (DA-8)', () => {
    for (const ns of MESSAGE_NAMESPACES) expect(Object.keys(messages.es)).toContain(ns);
    expect(Object.keys(messagesCopy).sort()).toEqual([...MESSAGE_NAMESPACES].sort());
  });

  // 003 · T5: textos de la escena 3D de Inicio.
  it('la escena de Inicio tiene sus 15 rótulos de atlas, los 4 pasos del recorrido y el rótulo de partida en los dos idiomas', () => {
    for (const locale of ['es', 'en'] as const) {
      const home = messages[locale].home;
      expect(home.scene.labels, locale).toHaveLength(15);
      expect(home.hero.steps, locale).toHaveLength(4);
      expect(home.hero.hint.length, locale).toBeGreaterThan(0);
      // JetBrains Mono es de ancho fijo (0,6 em): a 38 px, 16 caracteres ocupan 365 de las 390 unidades de la
      // celda. La medida real con la fuente del sitio está en tests/e2e/scene.spec.ts (CA-9).
      for (const label of home.scene.labels) expect(label.length, `${locale}: ${label}`).toBeLessThanOrEqual(15);
      // En mayúsculas, como el diseño (los rótulos se pintan tal cual en el atlas).
      for (const label of home.scene.labels) expect(label).toBe(label.toUpperCase());
    }
  });

  it('P-28: el atlas conserva POSTGRESQL y MONGODB en sus celdas del diseño (8 y 9), iguales en los dos idiomas', () => {
    for (const locale of ['es', 'en'] as const) {
      expect(messages[locale].home.scene.labels.slice(7, 9)).toEqual(['POSTGRESQL', 'MONGODB']);
    }
  });

  it('el inglés de la escena es el del diseño (Arch3D.dc.html y Main.dc.html)', () => {
    const arch3d = readFileSync('docs/design/fuente/Arch3D.dc.html', 'utf8');
    const main = readFileSync('docs/design/fuente/Main.dc.html', 'utf8');
    const quoted = messages.en.home.scene.labels.map((l) => `'${l}'`).join(', ');
    expect(arch3d).toContain(`const labels = [${quoted}];`);
    expect(main).toContain(`const steps = [${messages.en.home.hero.steps.map((s) => `'${s}'`).join(', ')}];`);
    expect(main).toContain(`'${messages.en.home.hero.hint}'`);
    expect(main).toContain(messages.en.home.built.layers.system.text);
  });
});
