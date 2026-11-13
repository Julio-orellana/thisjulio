// @ts-check
/**
 * Puertas de publicación (feature 006, P-51, spec §9). Funciones puras, sin
 * dependencias: las usa scripts/release-gates.mjs y las prueba
 * tests/unit/release-gates.test.ts.
 *
 * Regla: FALLA CERRADO. Una puerta está cerrada solo si se cumplen las dos
 * cosas: (1) su condición comprobable por máquina y (2) el registro de que
 * Julio la cerró, con fecha, en `release-gates.json`. Ninguna se cierra sola.
 *
 * | Puerta | Condición                                            | Registro                    |
 * |--------|------------------------------------------------------|-----------------------------|
 * | G1     | ningún texto con `copy: 'draft'`                     | `closed`                    |
 * | G2     | Legal sin el rótulo de borrador (`.legal-draft`)     | `closed`, `reviewedBy`      |
 * | G3     | icono presente, con la huella registrada             | `closed`, `files` (sha256)  |
 * | G4     | correo configurado, con la huella registrada         | `closed`, `sha256`          |
 */
import { createHash } from 'node:crypto';

/** Único origen en el que las puertas se evalúan. Debe coincidir con `PRODUCTION_ORIGIN` de src/lib/seo/routes.ts (lo prueba la unitaria). */
export const PRODUCTION_ORIGIN = 'https://thisjulio.com';

export const GATES = /** @type {const} */ (['G1', 'G2', 'G3', 'G4']);
export const GATE_NAMES = { G1: 'Textos aprobados', G2: 'Legal revisado', G3: 'Favicon e iconos', G4: 'Correo de contacto real' };

/** Archivos de icono que reconoce Next en `src/app/` (convención de metadatos). */
export const ICON_FILE = /^(?:favicon\.ico|icon\.(?:ico|png|svg|jpe?g)|apple-icon\.(?:png|jpe?g))$/;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SHA256 = /^[a-f0-9]{64}$/;

/** @param {string | Uint8Array} data */
export function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * G1 · Textos en borrador. `files`: fuentes de `src/content/*.ts` (sin el
 * esquema ni la política). En el contenido cuenta cada `copy: 'draft'`; en
 * `messages-copy.ts`, cada espacio de mensajes marcado `'draft'`.
 * @param {{ path: string; source: string }[]} files
 * @returns {{ path: string; drafts: number }[]}
 */
export function findDraftCopy(files) {
  return files
    .map(({ path, source: raw }) => {
      // Sin comentarios: un `copy: 'draft'` citado en un comentario no es un bloque de texto.
      const source = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      const drafts = path.endsWith('messages-copy.ts')
        ? [...source.matchAll(/^\s*[A-Za-z0-9_]+:\s*'draft'\s*,?\s*$/gm)].length
        : [...source.matchAll(/\bcopy:\s*'draft'/g)].length;
      return { path, drafts };
    })
    .filter((f) => f.drafts > 0);
}

/**
 * G2 · ¿El HTML de Legal lleva el rótulo de borrador? El rótulo es el párrafo
 * `.legal-draft` de `LegalView`. `null` = no hay HTML que revisar.
 * @param {string | null} html
 */
export function hasLegalDraftLabel(html) {
  if (html === null) return null;
  return /class="[^"]*\blegal-draft\b[^"]*"/.test(html);
}

/**
 * G4 · Lee la declaración de `src/config/contact.ts` como texto. Devuelve la
 * dirección, `null` si no hay ninguna, o lanza si la forma no es la esperada
 * (mejor fallar que dar por buena una dirección que no se entiende).
 * @param {string} source
 * @returns {{ user: string; domain: string } | null}
 */
export function parseContactEmail(source) {
  const m = source.match(/^export const contactEmail: ContactEmail \| null = (.+);$/m);
  if (!m) throw new Error('src/config/contact.ts: no se encontró la declaración de `contactEmail` con la forma esperada.');
  if (m[1] === 'null') return null;
  const parts = m[1].match(/^\{ user: '([^'\\]+)', domain: '([^'\\]+)' \}$/);
  if (!parts) throw new Error("src/config/contact.ts: `contactEmail` debe ser `null` o `{ user: '…', domain: '…' }` en una sola línea.");
  return { user: parts[1], domain: parts[2] };
}

/**
 * Valida el registro versionado. Lanza ante cualquier forma inesperada.
 * @param {unknown} raw
 */
export function parseRecord(raw) {
  const fail = (/** @type {string} */ msg) => {
    throw new Error(`release-gates.json: ${msg}`);
  };
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) fail('debe ser un objeto.');
  const record = /** @type {Record<string, any>} */ (raw);
  const extra = Object.keys(record).filter((k) => !['gates', 'exceptions'].includes(k));
  if (extra.length) fail(`claves no contempladas: ${extra.join(', ')}.`);
  const gates = record.gates;
  if (gates === null || typeof gates !== 'object') fail('falta `gates`.');
  if (Object.keys(gates).sort().join() !== [...GATES].sort().join()) fail('`gates` debe tener exactamente G1, G2, G3 y G4.');
  for (const g of GATES) {
    const closed = gates[g].closed;
    if (closed !== null && !(typeof closed === 'string' && DATE.test(closed))) fail(`${g}.closed debe ser null o una fecha AAAA-MM-DD.`);
  }
  if (gates.G2.reviewedBy !== null && typeof gates.G2.reviewedBy !== 'string') fail('G2.reviewedBy debe ser null o un texto.');
  const files = gates.G3.files;
  if (files === null || typeof files !== 'object' || Array.isArray(files)) fail('G3.files debe ser un objeto { archivo: sha256 }.');
  for (const [name, hash] of Object.entries(files)) {
    if (!ICON_FILE.test(name)) fail(`G3.files: «${name}» no es un archivo de icono reconocido.`);
    if (typeof hash !== 'string' || !SHA256.test(hash)) fail(`G3.files: la huella de «${name}» no es un sha256.`);
  }
  if (gates.G4.sha256 !== null && !(typeof gates.G4.sha256 === 'string' && SHA256.test(gates.G4.sha256))) fail('G4.sha256 debe ser null o un sha256.');
  if (!Array.isArray(record.exceptions)) fail('falta `exceptions` (lista).');
  for (const e of record.exceptions) {
    const ok =
      e !== null &&
      typeof e === 'object' &&
      GATES.includes(e.gate) &&
      typeof e.decision === 'string' &&
      /^P-\d+$/.test(e.decision) &&
      typeof e.date === 'string' &&
      DATE.test(e.date) &&
      typeof e.note === 'string' &&
      e.note.trim().length >= 10 &&
      Object.keys(e).sort().join() === 'date,decision,gate,note';
    if (!ok) fail('cada excepción lleva exactamente { gate, decision: "P-NN", date: "AAAA-MM-DD", note } y una nota que explique el motivo.');
  }
  return /** @type {{ gates: { G1: { closed: string | null }; G2: { closed: string | null; reviewedBy: string | null }; G3: { closed: string | null; files: Record<string, string> }; G4: { closed: string | null; sha256: string | null } }; exceptions: { gate: 'G1'|'G2'|'G3'|'G4'; decision: string; date: string; note: string }[] }} */ (record);
}

/**
 * Evalúa las cuatro puertas.
 * @param {{
 *   record: ReturnType<typeof parseRecord>;
 *   drafts: { path: string; drafts: number }[];
 *   legalHtml: Record<string, string | null>;
 *   icons: Record<string, string>;
 *   contact: { user: string; domain: string } | null;
 * }} input `legalHtml`: HTML de Legal por idioma; `icons`: { archivo: sha256 } de los iconos que existen.
 * @returns {{ gate: 'G1'|'G2'|'G3'|'G4'; name: string; state: 'closed' | 'open' | 'excepted'; reasons: string[]; exception?: string }[]}
 */
export function evaluateGates({ record, drafts, legalHtml, icons, contact }) {
  /** @type {Record<'G1'|'G2'|'G3'|'G4', string[]>} */
  const reasons = { G1: [], G2: [], G3: [], G4: [] };

  const totalDrafts = drafts.reduce((n, f) => n + f.drafts, 0);
  if (totalDrafts > 0) reasons.G1.push(`${totalDrafts} bloque(s) de texto en borrador: ${drafts.map((f) => `${f.path} (${f.drafts})`).join(', ')}`);

  for (const [locale, html] of Object.entries(legalHtml)) {
    const label = hasLegalDraftLabel(html);
    if (label === null) reasons.G2.push(`no se encontró el HTML de Legal (${locale}) en el build`);
    else if (label) reasons.G2.push(`Legal (${locale}) lleva el rótulo «Borrador pendiente de revisión legal»`);
  }
  if (Object.keys(legalHtml).length === 0) reasons.G2.push('no se revisó ninguna página de Legal');
  if (record.gates.G2.closed !== null && !record.gates.G2.reviewedBy?.trim()) reasons.G2.push('falta quién hizo la revisión (`reviewedBy`)');

  const recorded = record.gates.G3.files;
  const hasSiteIcon = Object.keys(icons).some((f) => /^(favicon\.ico|icon\.)/.test(f));
  if (!hasSiteIcon) reasons.G3.push('no hay icono del sitio en src/app/ (favicon.ico o icon.*)');
  for (const [name, hash] of Object.entries(icons)) {
    if (!(name in recorded)) reasons.G3.push(`el icono ${name} no está en el registro de la puerta`);
    else if (recorded[name] !== hash) reasons.G3.push(`el icono ${name} no coincide con la huella registrada`);
  }
  for (const name of Object.keys(recorded)) if (!(name in icons)) reasons.G3.push(`falta el icono registrado ${name}`);

  if (contact === null) reasons.G4.push('no hay correo de contacto configurado (src/config/contact.ts)');
  else {
    if (contact.domain !== new URL(PRODUCTION_ORIGIN).hostname) reasons.G4.push(`el correo no es del dominio del sitio (${contact.domain})`);
    if (record.gates.G4.sha256 === null) reasons.G4.push('el correo configurado no tiene huella registrada');
    else if (sha256(`${contact.user}@${contact.domain}`) !== record.gates.G4.sha256) reasons.G4.push('el correo configurado no coincide con la huella registrada');
  }

  return GATES.map((gate) => {
    if (record.gates[gate].closed === null) reasons[gate].push('Julio no la ha cerrado (sin fecha en release-gates.json)');
    const exception = record.exceptions.find((e) => e.gate === gate);
    const state = reasons[gate].length === 0 ? 'closed' : exception ? 'excepted' : 'open';
    return {
      gate,
      name: GATE_NAMES[gate],
      state,
      reasons: reasons[gate],
      ...(exception && state === 'excepted' ? { exception: `${exception.decision} (${exception.date}): ${exception.note}` } : {}),
    };
  });
}

/** @param {ReturnType<typeof evaluateGates>} results */
export function formatReport(results) {
  const mark = { closed: 'CERRADA', open: 'ABIERTA', excepted: 'EXCEPCIÓN' };
  return results
    .map((r) => [`${r.gate} ${r.name}: ${mark[r.state]}`, ...r.reasons.map((x) => `    - ${x}`), ...(r.exception ? [`    excepción registrada: ${r.exception}`] : [])].join('\n'))
    .join('\n');
}
