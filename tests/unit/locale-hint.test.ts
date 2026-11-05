import { describe, expect, it } from 'vitest';
import { localeFromPathname } from '@/i18n/locale-hint';

// P-16: idioma de la URL que el proxy le pasa al 404 global.
describe('localeFromPathname', () => {
  it('toma el primer segmento si es un idioma del sitio', () => {
    expect(localeFromPathname('/es/no-existe')).toBe('es');
    expect(localeFromPathname('/en/a/b/c')).toBe('en');
    expect(localeFromPathname('/en')).toBe('en');
    expect(localeFromPathname('/es/foto.png')).toBe('es');
  });

  it('sin idioma en la URL no hay idioma (el 404 va en los dos)', () => {
    for (const path of ['/', '/foto.png', '/fr/x', '/ES/x', '/esp', '/e', '//es/x', '/es.png']) {
      expect(localeFromPathname(path), path).toBeNull();
    }
  });
});
