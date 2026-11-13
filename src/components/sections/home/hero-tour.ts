/**
 * Recorrido del hero (`Main.dc.html`, `_onScroll`; P-30): mientras el hero está
 * fijado, el desplazamiento recorre las 4 capas de la escena. Lógica del diseño
 * sin cambios, separada del DOM para poder probarla.
 */

/** Alto de la barra de navegación: el hero se fija en `top: 76px` (site.css). */
export const NAV_HEIGHT = 76;

/**
 * Paso del recorrido a partir de las cajas de `.hero-pin` y de `.hero`:
 * −1 = sin capa resaltada (antes del 8 % del tramo o pasado el final), 0–3 = capa.
 * `null` = no hay tramo de recorrido (hero sin fijar: ≤ 1040 px, pantallas muy
 * altas o `prefers-reduced-motion`) y el paso no cambia.
 */
export function tourStep(pinTop: number, pinHeight: number, heroHeight: number): number | null {
  const travel = pinHeight - heroHeight;
  if (travel < 40) return null;
  const p = (NAV_HEIGHT - pinTop) / travel;
  return p < 0.08 || p > 1 ? -1 : Math.min(3, Math.floor(((p - 0.08) / 0.92) * 4));
}

/** Capa que muestra la escena del hero: el paso del recorrido manda sobre la elegida con clic. */
export const heroLayer = (step: number, picked: number): number => (step >= 0 ? step : picked);
