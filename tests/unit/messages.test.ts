import { describe, expect, it } from 'vitest';
import { messages } from '@/i18n/messages';

// CA-6: los mensajes de es y en tienen exactamente las mismas claves.
function keys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe('mensajes', () => {
  it('es y en tienen las mismas claves', () => {
    expect(keys(messages.en).sort()).toEqual(keys(messages.es).sort());
  });

  it('ningún mensaje está vacío', () => {
    for (const locale of ['es', 'en'] as const) {
      const empty = keys(messages[locale]).filter((k) => {
        const value = k.split('.').reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], messages[locale]);
        return typeof value !== 'string' || value.trim() === '';
      });
      expect(empty, locale).toEqual([]);
    }
  });

  it('no contienen «24/7» (prompt §4.5)', () => {
    expect(JSON.stringify(messages)).not.toMatch(/24\s*\/\s*7/);
  });
});
