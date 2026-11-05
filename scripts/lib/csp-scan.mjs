// @ts-check
/**
 * Revisión del HTML del build para la CSP de hashes (T18, ADR 006,
 * docs/architecture/DECISION-CSP-RENDERING.md §6 y §11).
 *
 * Funciones puras, sin dependencias: las usa scripts/csp-manifest.mjs y las
 * prueban tests/unit/csp-scan.test.ts.
 *
 * Regla general: FALLA CERRADO. Todo lo que no esté contemplado aquí (un script
 * en línea con otra forma, un script externo fuera de la ruta, un manejador
 * `on…=`, un estilo en línea, otra versión de Next) es un error del build.
 * Nada se autoriza "por si acaso".
 */
import { createHash } from 'node:crypto';

/**
 * Versión de Next.js con la que se validaron las formas de abajo (laboratorio
 * del 2026-11-05). Al actualizar Next, el build falla hasta que se revisen las
 * formas contra el HTML nuevo y se actualice esta constante a propósito.
 */
export const SUPPORTED_NEXT_VERSION = '16.4.5';

/** Debe coincidir con SCRIPT_PATH de src/lib/security/headers.ts (lo prueba la unitaria). */
export const SCRIPT_PATH = '/_next/static/chunks/';

/** Formas de script en línea que emite Next 16.4.5 (Turbopack) y que se autorizan por hash. */
export const INLINE_SCRIPT_FORMS = [
  {
    name: 'turbopack-registro-de-chunks',
    // Registra los chunks iniciales. Todos deben estar bajo static/chunks/.
    test: (/** @type {string} */ s) => {
      const m = s.match(/^\(globalThis\["TURBOPACK"\] \|\| \(globalThis\["TURBOPACK"\] = \[\]\)\)\.push\(\{"otherChunks":\[([^\]]*)\],"runtimeModuleIds":\[[0-9,]*\]\}\);$/);
      if (!m) return false;
      const chunks = m[1] === '' ? [] : m[1].split(',');
      return chunks.every((c) => /^"static\/chunks\/[A-Za-z0-9._-]+\.js"$/.test(c));
    },
  },
  {
    name: 'next-flight-arranque',
    test: (/** @type {string} */ s) => s === '(self.__next_f=self.__next_f||[]).push([0])',
  },
  {
    name: 'next-flight-datos',
    // Carga RSC de la página. El contenido es una cadena JSON; se exige la envoltura exacta.
    test: (/** @type {string} */ s) => /^self\.__next_f\.push\(\[[1-3],"[\s\S]*"\]\)$/.test(s),
  },
];

/**
 * Páginas internas de Next sin layout del sitio (404 de rutas con extensión y
 * error global). Usan estilos en línea que la CSP no admite y no se autorizan
 * por hash: se sirven con la CSP sin ningún hash (ni scripts ni estilos en
 * línea se ejecutan). Solo estas dos, por nombre exacto.
 */
export const NEXT_INTERNAL_ROUTES = ['/_not-found', '/_global-error'];

/**
 * sha256 en base64 del texto exacto entre las etiquetas, como lo calcula el navegador.
 * @param {string} text
 */
export function hashScript(text) {
  return 'sha256-' + createHash('sha256').update(text, 'utf8').digest('base64');
}

/** @param {string} raw */
function parseAttrs(raw) {
  /** @type {Record<string, string>} */
  const attrs = {};
  for (const m of raw.matchAll(/([^\s=/"'<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

const EXTERNAL_SCRIPT = /^\/_next\/static\/chunks\/[A-Za-z0-9._-]+\.js$/;

/**
 * Revisa el HTML de una página. Devuelve los hashes de sus scripts en línea y
 * la lista de problemas (vacía si todo está contemplado).
 * @param {string} html
 * @returns {{ hashes: string[]; issues: string[]; externals: string[] }}
 */
export function scanHtml(html) {
  /** @type {string[]} */
  const issues = [];
  /** @type {Set<string>} */
  const hashes = new Set();
  /** @type {string[]} */
  const externals = [];

  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attrs = parseAttrs(m[1]);
    const body = m[2];
    const names = Object.keys(attrs);
    if ('nonce' in attrs) issues.push('script con atributo nonce en HTML estático');
    if ('src' in attrs) {
      externals.push(attrs.src);
      if (!EXTERNAL_SCRIPT.test(attrs.src)) issues.push(`script externo fuera de ${SCRIPT_PATH}: ${attrs.src.slice(0, 120)}`);
      const unexpected = names.filter((n) => !['src', 'async', 'nomodule'].includes(n));
      if (unexpected.length) issues.push(`script externo con atributos no contemplados (${unexpected.join(', ')}): ${attrs.src.slice(0, 80)}`);
      if (body.trim() !== '') issues.push(`script externo con contenido: ${attrs.src.slice(0, 80)}`);
      continue;
    }
    if (attrs.type === 'application/ld+json') {
      // Bloque de datos (JSON-LD, feature 006): el navegador no lo ejecuta y la CSP no lo gobierna.
      try {
        JSON.parse(body);
      } catch {
        issues.push('bloque application/ld+json que no es JSON válido');
      }
      continue;
    }
    const unexpected = names.filter((n) => n !== 'id');
    if (unexpected.length) issues.push(`script en línea con atributos no contemplados (${unexpected.join(', ')})`);
    const form = INLINE_SCRIPT_FORMS.find((f) => f.test(body));
    if (!form) {
      issues.push(`script en línea no contemplado: «${body.slice(0, 70).replace(/\s+/g, ' ')}…» (${body.length} caracteres)`);
      continue;
    }
    hashes.add(hashScript(body));
  }

  // El resto del documento, sin el contenido de los scripts (la carga RSC es texto).
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '<script></script>');
  if (/<[a-zA-Z][^>]*\son[a-z]+\s*=/.test(markup)) issues.push('atributo manejador de eventos (on…=) en el HTML');
  if (/<style\b/i.test(markup)) issues.push('elemento <style> en línea (style-src no lo admite)');
  if (/<[a-zA-Z][^>]*\sstyle\s*=/.test(markup)) issues.push('atributo style= en línea (style-src no lo admite)');
  if (/\s(?:href|src|action|formaction)\s*=\s*["']?\s*javascript:/i.test(markup)) issues.push('URL javascript: en un atributo');
  if (/<(?:base|object|embed|iframe)\b/i.test(markup)) issues.push('elemento <base>, <object>, <embed> o <iframe> no contemplado');
  for (const l of markup.matchAll(/<link\b([^>]*)>/gi)) {
    const a = parseAttrs(l[1]);
    if ((a.rel === 'preload' && a.as === 'script') || a.rel === 'modulepreload') {
      if (!EXTERNAL_SCRIPT.test(a.href ?? '')) issues.push(`precarga de script fuera de ${SCRIPT_PATH}: ${(a.href ?? '').slice(0, 120)}`);
    }
  }
  // Cualquier JS de Next referido en el documento (también dentro de la carga RSC) debe estar bajo chunks/.
  for (const r of html.matchAll(/(?:\/_next\/)?static\/[A-Za-z0-9._/-]+\.m?js\b/g)) {
    const ref = r[0].startsWith('/_next/') ? r[0] : '/_next/' + r[0];
    if (!EXTERNAL_SCRIPT.test(ref)) issues.push(`referencia a JS de Next fuera de ${SCRIPT_PATH}: ${ref.slice(0, 120)}`);
  }

  return { hashes: [...hashes], issues: [...new Set(issues)], externals };
}

/**
 * Arma el manifiesto a partir de los archivos del build. Lanza (y el build
 * falla) ante cualquier problema; nunca escribe un manifiesto parcial.
 * @param {{
 *   nextVersion: string;
 *   buildId: string;
 *   prerenderManifest: { routes: Record<string, { initialRevalidateSeconds?: number | false }> };
 *   readRouteFile: (route: string, ext: string) => string | null;
 * }} input
 */
export function buildCspManifest({ nextVersion, buildId, prerenderManifest, readRouteFile }) {
  const problems = [];
  if (nextVersion !== SUPPORTED_NEXT_VERSION) {
    problems.push(
      `Next.js ${nextVersion} no está validado para la CSP de hashes (validado: ${SUPPORTED_NEXT_VERSION}). Revisar las formas de script en scripts/lib/csp-scan.mjs contra el HTML nuevo y repetir las pruebas P1–P14 antes de actualizar SUPPORTED_NEXT_VERSION.`,
    );
  }
  if (!/^[A-Za-z0-9_-]{8,}$/.test(buildId)) problems.push(`BUILD_ID inesperado: «${buildId}»`);
  /** @type {Record<string, { hashes: string[] }>} */
  const routes = {};
  for (const [route, info] of Object.entries(prerenderManifest.routes ?? {})) {
    if (info.initialRevalidateSeconds !== false) {
      problems.push(`${route}: declara revalidación (${String(info.initialRevalidateSeconds)} s). Las rutas con CSP de hashes no admiten ISR.`);
      continue;
    }
    if (NEXT_INTERNAL_ROUTES.includes(route)) continue;
    const html = readRouteFile(route, '.html');
    if (html === null) {
      // Salida prerenderizada que no es HTML (p. ej. un Route Handler): no lleva CSP de página.
      if (readRouteFile(route, '.body') !== null) continue;
      problems.push(`${route}: está en prerender-manifest.json pero no tiene HTML en el build`);
      continue;
    }
    const { hashes, issues } = scanHtml(html);
    for (const i of issues) problems.push(`${route}: ${i}`);
    if (hashes.length === 0) problems.push(`${route}: no tiene ningún script en línea reconocible (¿cambió la salida de Next?)`);
    routes[route] = { hashes };
  }
  if (Object.keys(routes).length === 0) problems.push('el build no tiene ninguna página prerenderizada');
  if (problems.length) {
    const err = new Error(`Manifiesto de CSP: ${problems.length} problema(s):\n- ${problems.join('\n- ')}`);
    /** @type {any} */ (err).problems = problems;
    throw err;
  }
  return { schema: 1, nextVersion, buildId, scriptPath: SCRIPT_PATH, internalRoutesWithoutHashes: NEXT_INTERNAL_ROUTES, routes };
}
