import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contactAddress, contactEmail, spokenAddress } from '@/config/contact';
import { messages } from '@/i18n/messages';

// Feature 006 · T3 (CA-3, P-43): el correo de contacto no se escribe entero en ningún sitio.
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe('correo de contacto', () => {
  it('se arma a partir de dos partes y se dice en palabras sin la arroba', () => {
    const parts = { user: 'nombre', domain: 'ejemplo.com.gt' };
    expect(contactAddress(parts)).toBe('nombre@ejemplo.com.gt');
    expect(spokenAddress(parts, 'arroba', 'punto')).toBe('nombre arroba ejemplo punto com punto gt');
    expect(spokenAddress(parts, 'at', 'dot')).not.toMatch(/[@.]/);
  });

  it('si está configurado, es una dirección del dominio del sitio', () => {
    if (!contactEmail) return; // Puerta G4 abierta: todavía no hay dirección (P-42).
    expect(contactEmail.domain).toBe('thisjulio.com');
    expect(contactEmail.user).toMatch(/^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/);
  });

  it('ningún mensaje contiene una dirección de correo ni un mailto', () => {
    expect(JSON.stringify(messages)).not.toMatch(/[A-Za-z0-9._-]+@[A-Za-z0-9-]+\.[a-z]{2,}|mailto:/);
  });

  it('solo la isla MailLink y ContactView importan la configuración del correo', () => {
    const importers = files('src')
      .filter((f) => /\.tsx?$/.test(f) && readFileSync(f, 'utf8').includes("@/config/contact'"))
      .sort();
    expect(importers).toEqual(['src/components/sections/contact/ContactView.tsx', 'src/components/sections/contact/MailLink.tsx']);
  });

  it('MailLink no recibe el correo por props (viajaría en la carga RSC)', () => {
    const island = readFileSync('src/components/sections/contact/MailLink.tsx', 'utf8');
    expect(island).toMatch(/^'use client'/);
    expect(island).toMatch(/export function MailLink\(\{ title, text \}: \{ title: string; text: string \}\)/);
    const view = readFileSync('src/components/sections/contact/ContactView.tsx', 'utf8');
    expect(view).toMatch(/<MailLink title=\{t\('email\.title'\)\} text=\{t\('email\.text'\)\} \/>/);
  });

  it('la dirección completa no está escrita en ningún archivo de src', () => {
    if (!contactEmail) return;
    const address = contactAddress(contactEmail);
    expect(files('src').filter((f) => readFileSync(f, 'utf8').includes(address))).toEqual([]);
  });
});
