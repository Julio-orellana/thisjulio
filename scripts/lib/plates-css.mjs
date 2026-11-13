// @ts-check
import { distinctValues, token } from '../../src/components/plates/data.mjs';

/**
 * Hoja de `Plates` sin estilos en línea (P-23, opción A): una clase por cada
 * valor distinto de posición y tamaño, más la profundidad de cada placa. Las
 * reglas `.blk`, `.plate` y `.pin` de site.css (en design.css) las consumen sin
 * cambios. Función pura: la usan el script y la prueba que exige que la hoja
 * versionada esté al día.
 */
export function platesCss() {
  const v = distinctValues();
  const prop = { x: '--x', y: '--y', w: '--w', h: '--h' };
  const lines = [
    '/* Generado por scripts/plates-css.mjs desde src/components/plates/data.mjs (P-23, opción A). No editar a mano. */',
  ];
  for (let i = 0; i < 4; i++) lines.push(`.i-${i} { --i: ${i}; }`);
  for (const k of /** @type {const} */ (['x', 'y', 'w', 'h'])) for (const n of v[k]) lines.push(`.b${k}-${token(n)} { ${prop[k]}: ${n}%; }`);
  return lines.join('\n') + '\n';
}
