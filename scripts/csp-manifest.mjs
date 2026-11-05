// @ts-check
/**
 * Paso posterior a `next build` (T18, ADR 006): calcula el SHA-256 de los
 * scripts en línea del HTML real de cada página prerenderizada y escribe
 * `.next/csp-manifest.json`, que el proxy usa para la CSP de hashes.
 *
 * Falla cerrado (código de salida 1, sin escribir nada) ante cualquier script
 * no contemplado, una versión de Next no validada, ISR o un HTML ausente. Ver
 * scripts/lib/csp-scan.mjs.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { buildCspManifest } from './lib/csp-scan.mjs';

const distDir = join(process.cwd(), '.next');
const out = join(distDir, 'csp-manifest.json');
// Nunca dejar un manifiesto de un build anterior junto a un build nuevo.
rmSync(out, { force: true });

try {
  const require = createRequire(import.meta.url);
  const nextVersion = require('next/package.json').version;
  const buildId = readFileSync(join(distDir, 'BUILD_ID'), 'utf8').trim();
  const prerenderManifest = JSON.parse(readFileSync(join(distDir, 'prerender-manifest.json'), 'utf8'));
  const readRouteFile = (/** @type {string} */ route, /** @type {string} */ ext) => {
    const file = join(distDir, 'server', 'app', (route === '/' ? '/index' : route) + ext);
    return existsSync(file) ? readFileSync(file, 'utf8') : null;
  };
  const manifest = buildCspManifest({ nextVersion, buildId, prerenderManifest, readRouteFile });
  writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n');
  const routes = Object.keys(manifest.routes);
  console.log(`[csp-manifest] ${routes.length} rutas con CSP de hashes (Next ${nextVersion}, build ${buildId}): ${routes.join(', ')}`);
} catch (error) {
  console.error(`[csp-manifest] ERROR — el build no es válido:\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
