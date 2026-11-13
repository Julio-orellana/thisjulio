import { describe, expect, it } from 'vitest';
import { messages } from '@/i18n/messages';
import { findPolicyViolations } from '@/content/policy';
import { MESSAGE_NAMESPACES_002 } from '@/content/schema';
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

  it('los espacios de nombres de la 002 están registrados y tienen su estado de aprobación (DA-8)', () => {
    for (const ns of MESSAGE_NAMESPACES_002) expect(Object.keys(messages.es)).toContain(ns);
    expect(Object.keys(messagesCopy).sort()).toEqual([...MESSAGE_NAMESPACES_002].sort());
  });
});
