import { describe, expect, it } from 'vitest';
import {
  ATLAS_LABELS, ATLAS_SIZE, QUALITY, atlasLabels, backingStore, framing, isSoftwareRenderer, labelRect, ladder, pickProfile, probe,
  type DeviceInfo,
} from '@/components/scene3d/engine-profile';

// Partes puras del motor (spec 003, T3): los valores esperados son los de
// docs/design/fuente/Arch3D.dc.html.
const desktop: DeviceInfo = { renderer: 'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)', coarsePointer: false, screenMax: 1728, deviceMemory: 8, hardwareConcurrency: 8 };

describe('perfil de calidad', () => {
  it('la tabla de perfiles es la del diseño', () => {
    expect(QUALITY).toEqual({
      high: { atlas: 4096, shadow: 2048, taps: 12, maxPx: 8.4e6 },
      balanced: { atlas: 2048, shadow: 1024, taps: 6, maxPx: 2.8e6 },
      low: { atlas: 2048, shadow: 1024, taps: 4, maxPx: 2.2e6 },
    });
  });

  it('escritorio con GPU real: high', () => {
    expect(pickProfile(desktop)).toBe('high');
    expect(pickProfile(desktop, 'auto')).toBe('high');
  });

  it.each([
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0) (0x0000C0DE)), SwiftShader driver)',
    'llvmpipe (LLVM 15.0.7, 256 bits)',
    'Microsoft Basic Render Driver',
    'Software Rasterizer',
  ])('GPU por software (%s): low, aunque sea un teléfono', (renderer) => {
    expect(isSoftwareRenderer(renderer)).toBe(true);
    expect(pickProfile({ ...desktop, renderer })).toBe('low');
    expect(pickProfile({ ...desktop, renderer, coarsePointer: true, screenMax: 844 })).toBe('low');
  });

  it('teléfono (puntero grueso y pantalla menor de 1400): balanced', () => {
    expect(pickProfile({ ...desktop, coarsePointer: true, screenMax: 844 })).toBe('balanced');
    expect(pickProfile({ ...desktop, coarsePointer: true, screenMax: 1399 })).toBe('balanced');
  });

  it('pantalla táctil grande: no es un teléfono', () => {
    expect(pickProfile({ ...desktop, coarsePointer: true, screenMax: 1400 })).toBe('high');
  });

  it('poca memoria o pocos núcleos: balanced', () => {
    expect(pickProfile({ ...desktop, deviceMemory: 2 })).toBe('balanced');
    expect(pickProfile({ ...desktop, hardwareConcurrency: 2 })).toBe('balanced');
    expect(pickProfile({ ...desktop, deviceMemory: 4, hardwareConcurrency: 4 })).toBe('high');
  });

  it('sin datos del dispositivo (navegador que no los expone): high', () => {
    expect(pickProfile({ renderer: '', coarsePointer: false, screenMax: 1440 })).toBe('high');
    expect(pickProfile({ renderer: '', coarsePointer: false, screenMax: 1440, deviceMemory: 0, hardwareConcurrency: 0 })).toBe('high');
  });

  it('un perfil forzado manda sobre el dispositivo', () => {
    const software = { ...desktop, renderer: 'SwiftShader' };
    expect(pickProfile(software, 'high')).toBe('high');
    expect(pickProfile(desktop, 'low')).toBe('low');
    expect(pickProfile(desktop, 'balanced')).toBe('balanced');
  });
});

describe('escalera de resolución', () => {
  it('high en pantalla estándar: 2× si cabe en el tope, y si no 1×', () => {
    expect(ladder('high', QUALITY.high.maxPx, 1440, 824, 1440)).toEqual([2, 1]);
    // 2560×1440 × 4 = 14,7 M de píxeles: por encima del tope de 8,4 M.
    expect(ladder('high', QUALITY.high.maxPx, 2560, 1440, 2560)).toEqual([1]);
  });

  it('high en pantalla densa: nativo (con tope) y 75 %', () => {
    expect(ladder('high', QUALITY.high.maxPx, 2880, 1648, 1440)).toEqual([1, 0.75]);
    const cap = Math.sqrt(8.4e6 / (5120 * 2880));
    expect(ladder('high', QUALITY.high.maxPx, 5120, 2880, 2560)).toEqual([cap, cap * 0.75]);
  });

  it('balanced y low: nativo (con tope) y 80 %', () => {
    expect(ladder('balanced', QUALITY.balanced.maxPx, 390, 360, 390)).toEqual([1, 0.8]);
    expect(ladder('low', QUALITY.low.maxPx, 1440, 824, 1440)).toEqual([1, 0.8]);
    const cap = Math.sqrt(2.2e6 / (2880 * 1648));
    expect(ladder('low', QUALITY.low.maxPx, 2880, 1648, 1440)).toEqual([cap, cap * 0.8]);
    // El hero a 1440×824 y densidad 2 con GPU por software: 1961×1122 (medido en el arnés).
    expect([Math.round(2880 * cap), Math.round(1648 * cap)]).toEqual([1961, 1122]);
  });

  it('el lienzo usa la medida del ResizeObserver solo si concuerda con la densidad', () => {
    expect(backingStore(845, 638, 1, 845, 638)).toEqual([845, 638]);
    expect(backingStore(844.5, 638, 2, 1689, 1276)).toEqual([1689, 1276]);
    expect(backingStore(845, 638, 2, 0, 0)).toEqual([1690, 1276]);
    // Una medida que no concuerda (p. ej. zoom a medio aplicar) se descarta.
    expect(backingStore(845, 638, 2, 845, 638)).toEqual([1690, 1276]);
  });

  it('medición: baja un peldaño con dos cuadros caros seguidos o uno de más de 80 ms', () => {
    let s = { step: 0, over: 0, under: 0 };
    let r = probe(s, 30, 1);
    expect(r).toEqual({ step: 0, over: 1, under: 0, refit: false });
    s = r; r = probe(s, 30, 1);
    expect(r).toEqual({ step: 1, over: 0, under: 0, refit: true });
    expect(probe({ step: 0, over: 0, under: 0 }, 81, 1)).toEqual({ step: 1, over: 0, under: 0, refit: true });
    // Un cuadro normal entre dos caros reinicia la cuenta.
    expect(probe({ step: 0, over: 1, under: 0 }, 15, 1)).toEqual({ step: 0, over: 0, under: 0, refit: false });
  });

  it('medición: no baja del último peldaño y recupera uno tras cinco cuadros baratos', () => {
    expect(probe({ step: 1, over: 1, under: 0 }, 200, 1)).toEqual({ step: 1, over: 2, under: 0, refit: false });
    let s = { step: 1, over: 0, under: 0 };
    for (let i = 0; i < 4; i++) { const r = probe(s, 5, 1); expect(r.refit).toBe(false); s = r; }
    expect(probe(s, 5, 1)).toEqual({ step: 0, over: 0, under: 0, refit: true });
    expect(probe({ step: 0, over: 0, under: 9 }, 5, 1)).toEqual({ step: 0, over: 0, under: 10, refit: false });
  });
});

describe('encuadre', () => {
  it('hero ancho: escena desplazada a la derecha y sin ampliar', () => {
    expect(framing(true, 1440, 824)).toEqual({ off: [0.56, -0.02], zoom: 1 });
    expect(framing(true, 1040, 640)).toEqual({ off: [0.56, -0.02], zoom: Math.min(640 / 820, 1040 / 1420) });
  });

  it('hero estrecho y diagrama: centrados, con sitio para las etiquetas desde 560 px', () => {
    expect(framing(true, 390, 360)).toEqual({ off: [0, 0], zoom: Math.min(1.14, (390 - 24) / (0.68 * 360)) });
    expect(framing(false, 845, 638)).toEqual({ off: [0, 0], zoom: 1.14 });
    expect(framing(false, 600, 638)).toEqual({ off: [0, 0], zoom: (600 - 24 - 250) / (0.68 * 638) });
    expect(framing(false, 559, 638)).toEqual({ off: [0, 0], zoom: 1.14 });
    expect(framing(false, 348, 378)).toEqual({ off: [0, 0], zoom: 1.14 });
  });
});

describe('rótulos del atlas', () => {
  it('15 celdas de 390×90 en 5 filas de 3, dentro del atlas y sin solaparse', () => {
    expect(ATLAS_LABELS).toBe(15);
    const cells = Array.from({ length: ATLAS_LABELS }, (_, i) => labelRect(i));
    expect(cells[0]).toEqual([340, 900, 390, 90]);
    expect(cells[14]).toEqual([1140, 1300, 390, 90]);
    for (const [x, y, w, h] of cells) { expect(x + w).toBeLessThanOrEqual(ATLAS_SIZE); expect(y + h).toBeLessThanOrEqual(ATLAS_SIZE); }
    for (let i = 0; i < cells.length; i++) for (let k = i + 1; k < cells.length; k++) {
      const [ax, ay, aw, ah] = cells[i], [bx, by, bw, bh] = cells[k];
      expect(ax + aw <= bx || bx + bw <= ax || ay + ah <= by || by + bh <= ay).toBe(true);
    }
  });

  it('siempre 15 rótulos, en orden: los que faltan quedan vacíos y los que sobran se descartan', () => {
    const quince = Array.from({ length: 15 }, (_, i) => 'R' + i);
    expect(atlasLabels(quince)).toEqual(quince);
    expect(atlasLabels(['A', 'B'])).toEqual(['A', 'B', ...Array<string>(13).fill('')]);
    expect(atlasLabels([...quince, 'DE MÁS'])).toEqual(quince);
    expect(atlasLabels([])).toHaveLength(15);
  });
});
