import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NAV_HEIGHT, heroLayer, tourStep } from '@/components/sections/home/hero-tour';

// 003 · T7 — recorrido del hero (P-30): la lógica de `_onScroll` de Main.dc.html.
// A 1440×900 el hero mide 824 px y `.hero-pin` 824 + 420: 420 px de recorrido.
const HERO = 824;
const PIN = HERO + 420;
/** Paso con la página desplazada `y` píxeles (`.hero-pin` empieza bajo la navegación). */
const at = (y: number) => tourStep(NAV_HEIGHT - y, PIN, HERO);

describe('recorrido del hero', () => {
  it('la fórmula es la del diseño', () => {
    const main = readFileSync('docs/design/fuente/Main.dc.html', 'utf8');
    expect(main).toContain('if (travel < 40) return;');
    expect(main).toContain('const p = (76 - r.top) / travel;');
    expect(main).toContain('const step = p < .08 || p > 1 ? -1 : Math.min(3, Math.floor(((p - .08) / .92) * 4));');
    expect(NAV_HEIGHT).toBe(76);
  });

  it('antes del 8 % del tramo no resalta ninguna capa', () => {
    expect(at(0)).toBe(-1);
    expect(at(33)).toBe(-1); // 7,9 %
  });

  it('después, cuatro tramos iguales: una capa cada uno', () => {
    expect(at(34)).toBe(0); // 8,1 %
    expect(at(0.2 * 420)).toBe(0);
    expect(at(0.31 * 420 + 1)).toBe(1);
    expect(at(0.54 * 420 + 1)).toBe(2);
    expect(at(0.77 * 420 + 1)).toBe(3);
    expect(at(420)).toBe(3); // el 100 % exacto sigue siendo la última capa
  });

  it('pasado el tramo, o desplazando hacia arriba del inicio, vuelve a ninguna', () => {
    expect(at(421)).toBe(-1);
    expect(at(2000)).toBe(-1);
    expect(at(-50)).toBe(-1);
  });

  it('sin tramo de recorrido (hero sin fijar) el paso no cambia', () => {
    expect(tourStep(NAV_HEIGHT - 200, 792, 792)).toBeNull(); // ≤ 1040 px y reduced-motion: .hero-pin mide lo que el hero
    expect(tourStep(0, HERO + 39, HERO)).toBeNull();
    expect(tourStep(NAV_HEIGHT, HERO + 40, HERO)).toBe(-1);
  });

  it('el paso del recorrido manda sobre la capa elegida con clic', () => {
    expect(heroLayer(-1, -1)).toBe(-1);
    expect(heroLayer(-1, 2)).toBe(2);
    expect(heroLayer(1, 2)).toBe(1);
    expect(heroLayer(0, -1)).toBe(0);
  });
});
