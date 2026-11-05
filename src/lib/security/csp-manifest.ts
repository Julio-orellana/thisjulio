import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Manifiesto de CSP generado por scripts/csp-manifest.mjs tras `next build`
 * (T18, ADR 006). Lo lee el proxy (runtime Node.js) una vez por proceso.
 */
export type CspManifest = {
  schema: 1;
  nextVersion: string;
  buildId: string;
  scriptPath: string;
  routes: Record<string, { hashes: string[] }>;
};

const HASH = /^sha256-[A-Za-z0-9+/]{43}=$/;

export class CspManifestError extends Error {}

/**
 * Lee y valida el manifiesto. Lanza si falta, si es de otro build o si algún
 * hash está mal formado: el proxy no improvisa una CSP más laxa.
 */
export function loadCspManifest(expectedScriptPath: string, distDir = join(process.cwd(), '.next')): CspManifest {
  let raw: string;
  let buildId: string;
  try {
    raw = readFileSync(join(distDir, 'csp-manifest.json'), 'utf8');
    buildId = readFileSync(join(distDir, 'BUILD_ID'), 'utf8').trim();
  } catch {
    throw new CspManifestError('Falta .next/csp-manifest.json: el build debe correr `npm run build` (next build + scripts/csp-manifest.mjs).');
  }
  const m = JSON.parse(raw) as CspManifest;
  if (m.schema !== 1) throw new CspManifestError('Manifiesto de CSP con esquema desconocido.');
  if (m.buildId !== buildId) throw new CspManifestError(`Manifiesto de CSP de otro build (${m.buildId} ≠ ${buildId}).`);
  if (m.scriptPath !== expectedScriptPath) throw new CspManifestError('Manifiesto de CSP con otra ruta de scripts.');
  for (const [route, { hashes }] of Object.entries(m.routes)) {
    if (!Array.isArray(hashes) || hashes.length === 0 || !hashes.every((h) => HASH.test(h))) {
      throw new CspManifestError(`Manifiesto de CSP con hashes inválidos en ${route}.`);
    }
  }
  return m;
}

/** Clave de ruta tal como la guarda Next en prerender-manifest.json. */
export function routeKey(pathname: string): string {
  const p = pathname.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}
