// Escribe src/styles/plates.generated.css (P-23, opción A). Se ejecuta antes de
// `next build` y `next dev`; no toca scripts/csp-manifest.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { platesCss } from './lib/plates-css.mjs';

const target = new URL('../src/styles/plates.generated.css', import.meta.url);
const css = platesCss();
let current = '';
try {
  current = readFileSync(target, 'utf8');
} catch {}
if (current !== css) writeFileSync(target, css);
console.log(`[plates-css] ${css.split('\n').length - 2} reglas${current === css ? ' (sin cambios)' : ' (actualizada)'}`);
