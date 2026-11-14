import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';
import { PRODUCTION_ORIGIN } from '@/lib/seo/routes';

/**
 * Feature 006 · T15 (CA-13): `public/.well-known/security.txt` según la RFC 9116.
 * Contacto por URL (la página Contacto en los dos idiomas), nunca un correo (spec.md §3.2 y §3.6, P-43); `Expires` a menos
 * de un año. **Esta prueba falla cuando el archivo vence o está a punto de vencer: es el aviso para renovarlo**
 * (cambiar la fecha a menos de un año de ese día y volver a correr la CI).
 */
const FILE = 'public/.well-known/security.txt';
const raw = readFileSync(FILE, 'utf8');
const lines = raw.split(/\r?\n/);
const fields = lines
  .filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => {
    const i = l.indexOf(':');
    return { name: l.slice(0, i).trim().toLowerCase(), value: l.slice(i + 1).trim() };
  });
const values = (name: string) => fields.filter((f) => f.name === name).map((f) => f.value);
const DAY = 24 * 60 * 60 * 1000;

describe('T15 · security.txt (RFC 9116)', () => {
  it('es texto UTF-8 de líneas terminadas en LF, sin firma ni campos desconocidos', () => {
    expect(raw.endsWith('\n')).toBe(true);
    expect(raw).not.toContain('\r');
    expect(Buffer.from(raw, 'utf8').toString('utf8')).toBe(raw);
    const known = new Set(['contact', 'expires', 'preferred-languages', 'canonical', 'policy', 'acknowledgments', 'encryption', 'hiring']);
    expect(fields.map((f) => f.name).filter((n) => !known.has(n))).toEqual([]);
  });

  it('Contact: las páginas de Contacto del sitio, por HTTPS y en el orden es, en', () => {
    const contact = routing.pathnames['/contact'];
    expect(values('contact')).toEqual([`${PRODUCTION_ORIGIN}/es${contact.es}`, `${PRODUCTION_ORIGIN}/en${contact.en}`]);
    for (const v of values('contact')) expect(new URL(v).protocol).toBe('https:');
  });

  it('no publica ningún correo (puerta G4, P-42, P-43)', () => {
    expect(raw).not.toMatch(/@|mailto:/i);
  });

  it('Expires: una sola vez, RFC 3339 en UTC, no vencido y a menos de un año', () => {
    const expires = values('expires');
    expect(expires).toHaveLength(1);
    expect(expires[0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    const left = (Date.parse(expires[0]) - Date.now()) / DAY;
    // Margen de 30 días para renovarlo antes de que venza en producción.
    expect(left, `security.txt vence el ${expires[0]}: renovar Expires`).toBeGreaterThan(30);
    expect(left).toBeLessThanOrEqual(366);
  });

  it('Preferred-Languages: una vez, es y en; Canonical: la URL de producción', () => {
    expect(values('preferred-languages')).toEqual(['es, en']);
    expect(values('canonical')).toEqual([`${PRODUCTION_ORIGIN}/.well-known/security.txt`]);
  });
});
