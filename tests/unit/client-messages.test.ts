import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CLIENT_NAMESPACES, clientMessages } from '@/i18n/client-messages';
import { messages } from '@/i18n/messages';

// Feature 006 · T6 (P-45, cierra P-24): al navegador solo viajan los mensajes que usan las islas.
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

/** Espacio raíz de cada `useTranslations('…')` en un archivo `'use client'`. */
function namespacesUsedByIslands(): Map<string, string[]> {
  const used = new Map<string, string[]>();
  for (const file of sourceFiles('src')) {
    const source = readFileSync(file, 'utf8');
    if (!/^['"]use client['"]/m.test(source)) continue;
    for (const m of source.matchAll(/useTranslations\(\s*(?:['"]([A-Za-z0-9_.]+)['"])?\s*\)/g)) {
      const root = (m[1] ?? '').split('.')[0];
      used.set(root, [...(used.get(root) ?? []), file]);
    }
  }
  return used;
}

describe('mensajes del cliente', () => {
  const used = namespacesUsedByIslands();

  it('ninguna isla pide los mensajes sin espacio de nombres (obligaría a enviarlos todos)', () => {
    expect(used.get('') ?? []).toEqual([]);
  });

  it('cada espacio que usa una isla viaja al navegador', () => {
    const missing = [...used.keys()].filter((ns) => !(CLIENT_NAMESPACES as readonly string[]).includes(ns));
    expect(missing.map((ns) => `${ns}: ${used.get(ns)!.join(', ')}`)).toEqual([]);
  });

  it('no viaja ningún espacio que ninguna isla use', () => {
    expect(CLIENT_NAMESPACES.filter((ns) => !used.has(ns))).toEqual([]);
  });

  it('clientMessages devuelve solo esos espacios, sin tocar su contenido', () => {
    for (const locale of ['es', 'en'] as const) {
      const sent = clientMessages(messages[locale]);
      expect(Object.keys(sent).sort()).toEqual([...CLIENT_NAMESPACES].sort());
      for (const ns of CLIENT_NAMESPACES) expect(sent[ns]).toBe(messages[locale][ns]);
    }
  });

  it('lo que viaja es una fracción de los mensajes: sin Inicio, Servicios ni Arquitectura', () => {
    for (const locale of ['es', 'en'] as const) {
      const sent = JSON.stringify(clientMessages(messages[locale]));
      const all = JSON.stringify(messages[locale]);
      expect(sent.length).toBeLessThan(all.length / 4);
      expect(sent).not.toMatch(/PostgreSQL|MongoDB/);
    }
  });
});
