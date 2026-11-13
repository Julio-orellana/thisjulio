/**
 * Partes puras del motor de la escena 3D (spec 003, T3): perfil de calidad,
 * escalera de resolución, encuadre y celdas del atlas. Port literal de
 * `docs/design/fuente/Arch3D.dc.html`; aquí no se toca el DOM ni WebGL, para
 * poder probarlas en Node.
 */

export type Profile = 'high' | 'balanced' | 'low';
export type QualitySetting = 'auto' | Profile;

export interface Quality {
  /** Lado del atlas de texto, en píxeles. */
  atlas: number;
  /** Lado del mapa de sombras. */
  shadow: number;
  /** Muestras del filtro de sombras (`#define TAPS`). */
  taps: number;
  /** Tope de píxeles del lienzo. */
  maxPx: number;
}

export const QUALITY: Record<Profile, Quality> = {
  high: { atlas: 4096, shadow: 2048, taps: 12, maxPx: 8.4e6 },
  balanced: { atlas: 2048, shadow: 1024, taps: 6, maxPx: 2.8e6 },
  low: { atlas: 2048, shadow: 1024, taps: 4, maxPx: 2.2e6 },
};

export interface DeviceInfo {
  /** `UNMASKED_RENDERER_WEBGL`, o cadena vacía si el navegador no lo expone. */
  renderer: string;
  /** `matchMedia('(pointer: coarse)')`. */
  coarsePointer: boolean;
  /** `Math.max(screen.width, screen.height)`. */
  screenMax: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export const isSoftwareRenderer = (renderer: string): boolean =>
  /swiftshader|llvmpipe|software|basic render/i.test(renderer);

/** La calidad se elige por clase de dispositivo; un perfil forzado manda. */
export function pickProfile(device: DeviceInfo, quality: QualitySetting = 'auto'): Profile {
  if (quality && quality !== 'auto') return quality;
  const phone = device.coarsePointer && device.screenMax < 1400;
  const limited =
    (!!device.deviceMemory && device.deviceMemory <= 2) ||
    (!!device.hardwareConcurrency && device.hardwareConcurrency <= 2);
  return isSoftwareRenderer(device.renderer) ? 'low' : phone || limited ? 'balanced' : 'high';
}

/**
 * Multiplicadores sobre los píxeles físicos, el mejor primero. El perfil
 * `high` en una pantalla estándar puede subir a 2×, una reducción exacta.
 */
export function ladder(profile: Profile, maxPx: number, bw: number, bh: number, cssW: number): number[] {
  const px = bw * bh;
  const cap = Math.min(1, Math.sqrt(maxPx / px));
  if (profile !== 'high') return [cap, cap * 0.8];
  const density = bw / Math.max(1, cssW);
  if (density < 1.5) return px * 4 <= maxPx ? [2, 1] : [1];
  return [cap, cap * 0.75];
}

/**
 * Tamaño del lienzo en píxeles físicos. Se confía en la medida del
 * `ResizeObserver` (`devicePixelContentBoxSize`) solo si concuerda con
 * `devicePixelRatio`.
 */
export function backingStore(cssW: number, cssH: number, dpr: number, devW: number, devH: number): [number, number] {
  const trusted = !!devW && Math.abs(devW / cssW - dpr) < 0.2;
  return trusted ? [devW, devH] : [Math.round(cssW * dpr), Math.round(cssH * dpr)];
}

export interface Framing {
  /** Desplazamiento en coordenadas de recorte (el hero ancho deja sitio al titular). */
  off: [number, number];
  zoom: number;
}

export function framing(hero: boolean, cssW: number, cssH: number): Framing {
  const wideHero = hero && cssW >= 1040;
  return {
    off: wideHero ? [0.56, -0.02] : [0, 0],
    zoom: wideHero
      ? Math.min(1, Math.min(cssH / 820, cssW / 1420))
      : Math.min(1.14, (cssW - 24 - (cssW >= 560 ? 250 : 0)) / (0.68 * cssH)),
  };
}

export interface ProbeState {
  step: number;
  over: number;
  under: number;
}

/**
 * Decisión de la escalera tras una medición temporizada (`readPixels`): baja
 * un peldaño con dos cuadros caros seguidos (o uno de más de 80 ms) y lo
 * recupera tras cinco baratos. `last` es el índice del último peldaño.
 */
export function probe(state: ProbeState, cost: number, last: number): ProbeState & { refit: boolean } {
  let { step, over, under } = state;
  if (cost > 24) { over++; under = 0; } else if (cost < 9) { under++; over = 0; } else { over = 0; under = 0; }
  let refit = false;
  if ((over >= 2 || cost > 80) && step < last) { step++; over = 0; refit = true; }
  else if (under >= 5 && step > 0) { step--; under = 0; refit = true; }
  return { step, over, under, refit };
}

/** Lado del atlas en unidades del diseño; las celdas se escalan al tamaño real. */
export const ATLAS_SIZE = 2048;
/** Celdas de rótulo del atlas: 15 fijas, 3 por fila (la geometría no cambia). */
export const ATLAS_LABELS = 15;

export type Rect = [x: number, y: number, w: number, h: number];

/** Celda del rótulo `i` en el atlas (unidades de `ATLAS_SIZE`). */
export const labelRect = (i: number): Rect => [340 + (i % 3) * 400, 900 + Math.floor(i / 3) * 100, 390, 90];

/**
 * Exactamente 15 rótulos, en el orden de las celdas. Los que falten quedan
 * como cadena vacía y los que sobren se descartan: la geometría es fija.
 */
export function atlasLabels(labels: readonly string[]): string[] {
  return Array.from({ length: ATLAS_LABELS }, (_, i) => labels[i] ?? '');
}
