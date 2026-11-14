// @ts-check
/**
 * Puertas de publicación (feature 006, P-51): último paso de `npm run build`.
 *
 * Solo actúa cuando el build es el de producción (`SITE_ORIGIN` = el dominio
 * del sitio). Con cualquier otro origen (pruebas, preview) informa del estado
 * y no bloquea. En producción, si queda una puerta abierta: código de salida 1
 * y se borra `.next/csp-manifest.json`, de modo que ese build no puede servir
 * páginas (el proxy responde 500 sin manifiesto, ADR 006).
 *
 * `--report`: evalúa como si fuera producción y no borra nada (para pruebas e
 * informes). Sale con 1 si hay puertas abiertas.
 *
 * Las puertas las cierra Julio, no este script: ver scripts/lib/release-gates.mjs
 * y `release-gates.json`.
 */
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateGates, findDraftCopy, formatReport, ICON_FILE, parseContactEmail, parseRecord, PRODUCTION_ORIGIN, sha256 } from './lib/release-gates.mjs';

const root = process.cwd();
const report = process.argv.includes('--report');
const origin = process.env.SITE_ORIGIN ?? '';
const production = origin === PRODUCTION_ORIGIN;

try {
  const record = parseRecord(JSON.parse(readFileSync(join(root, 'release-gates.json'), 'utf8')));

  const contentDir = join(root, 'src', 'content');
  const drafts = findDraftCopy(
    readdirSync(contentDir)
      .filter((f) => f.endsWith('.ts') && !['schema.ts', 'policy.ts'].includes(f))
      .sort()
      .map((f) => ({ path: `src/content/${f}`, source: readFileSync(join(contentDir, f), 'utf8') })),
  );

  const legalHtml = Object.fromEntries(
    ['es', 'en'].map((locale) => {
      const file = join(root, '.next', 'server', 'app', locale, 'legal.html');
      return [locale, existsSync(file) ? readFileSync(file, 'utf8') : null];
    }),
  );

  const appDir = join(root, 'src', 'app');
  const icons = Object.fromEntries(
    readdirSync(appDir)
      .filter((f) => ICON_FILE.test(f))
      .sort()
      .map((f) => [f, sha256(readFileSync(join(appDir, f)))]),
  );

  const contact = parseContactEmail(readFileSync(join(root, 'src', 'config', 'contact.ts'), 'utf8'));

  const results = evaluateGates({ record, drafts, legalHtml, icons, contact });
  const open = results.filter((r) => r.state === 'open');
  const text = formatReport(results);

  if (!production && !report) {
    console.log(`[release-gates] Origen «${origin || '(sin definir)'}»: no es el de producción, las puertas no bloquean este build.\n${text}`);
    process.exit(0);
  }
  if (open.length === 0) {
    console.log(`[release-gates] Puertas de publicación en regla.\n${text}`);
    process.exit(0);
  }
  console.error(`[release-gates] ERROR — ${open.length} puerta(s) de publicación abierta(s). Este build no se puede publicar.\n${text}`);
  if (production && !report) {
    // Sin manifiesto, el proxy responde 500: un build con puertas abiertas no sirve páginas.
    rmSync(join(root, '.next', 'csp-manifest.json'), { force: true });
    console.error('[release-gates] Se borró .next/csp-manifest.json.');
  }
  process.exit(1);
} catch (error) {
  console.error(`[release-gates] ERROR — no se pudieron evaluar las puertas:\n${error instanceof Error ? error.message : String(error)}`);
  if (production && !report) rmSync(join(root, '.next', 'csp-manifest.json'), { force: true });
  process.exit(1);
}
