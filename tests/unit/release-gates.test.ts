import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contactEmail } from '@/config/contact';
import { listCopyBlocks } from '@/lib/content';
import { PRODUCTION_ORIGIN as SEO_ORIGIN } from '@/lib/seo/routes';
import {
  evaluateGates,
  findDraftCopy,
  GATES,
  hasLegalDraftLabel,
  ICON_FILE,
  parseContactEmail,
  parseRecord,
  PRODUCTION_ORIGIN,
  sha256,
} from '../../scripts/lib/release-gates.mjs';

// Feature 006 · T2 (CA-16, P-51): puertas de publicación. Ninguna se cierra sola: hace falta la condición
// comprobable Y el registro de que Julio la cerró.
const ADDRESS = { user: 'nombre', domain: 'thisjulio.com' };
const ICON = 'a'.repeat(64);
const LEGAL_OK = '<main><h1>Legal</h1><p class="muted">Última actualización</p></main>';
const LEGAL_DRAFT = '<main><p class="muted legal-draft">Borrador pendiente de revisión legal.</p></main>';

/** Estado con las cuatro puertas cerradas; cada prueba estropea una sola cosa. */
function closed() {
  return {
    record: parseRecord({
      gates: {
        G1: { closed: '2026-12-01' },
        G2: { closed: '2026-12-02', reviewedBy: 'Lic. Ejemplo' },
        G3: { closed: '2026-12-03', files: { 'icon.png': ICON } },
        G4: { closed: '2026-12-04', sha256: sha256('nombre@thisjulio.com') },
      },
      exceptions: [],
    }),
    drafts: [] as { path: string; drafts: number }[],
    legalHtml: { es: LEGAL_OK, en: LEGAL_OK } as Record<string, string | null>,
    icons: { 'icon.png': ICON } as Record<string, string>,
    contact: ADDRESS as { user: string; domain: string } | null,
  };
}
const open = (input: ReturnType<typeof closed>) => evaluateGates(input).filter((r) => r.state === 'open').map((r) => r.gate);

describe('evaluateGates', () => {
  it('con todo en regla y las cuatro registradas por Julio, ninguna queda abierta', () => {
    expect(evaluateGates(closed()).map((r) => r.state)).toEqual(['closed', 'closed', 'closed', 'closed']);
  });

  it('G1: un solo bloque en borrador la abre', () => {
    const s = closed();
    s.drafts = [{ path: 'src/content/about.ts', drafts: 1 }];
    expect(open(s)).toEqual(['G1']);
  });

  it('G2: el rótulo de borrador en cualquiera de los dos idiomas la abre; también si falta el HTML o el revisor', () => {
    for (const mutate of [
      (s: ReturnType<typeof closed>) => (s.legalHtml.es = LEGAL_DRAFT),
      (s: ReturnType<typeof closed>) => (s.legalHtml.en = LEGAL_DRAFT),
      (s: ReturnType<typeof closed>) => (s.legalHtml.en = null),
      (s: ReturnType<typeof closed>) => (s.legalHtml = {}),
      (s: ReturnType<typeof closed>) => (s.record.gates.G2.reviewedBy = '  '),
    ]) {
      const s = closed();
      mutate(s);
      expect(open(s)).toEqual(['G2']);
    }
  });

  it('G3: sin icono, con un icono distinto del registrado, sin registrar o con uno registrado que falta', () => {
    for (const mutate of [
      (s: ReturnType<typeof closed>) => (s.icons = {}),
      (s: ReturnType<typeof closed>) => (s.icons = { 'icon.png': 'b'.repeat(64) }),
      (s: ReturnType<typeof closed>) => (s.icons = { 'icon.png': ICON, 'apple-icon.png': 'c'.repeat(64) }),
      (s: ReturnType<typeof closed>) => (s.record.gates.G3.files = { 'icon.png': ICON, 'apple-icon.png': 'c'.repeat(64) }),
      (s: ReturnType<typeof closed>) => {
        // Solo el icono de Apple no basta: hace falta el del sitio.
        s.icons = { 'apple-icon.png': ICON };
        s.record.gates.G3.files = { 'apple-icon.png': ICON };
      },
    ]) {
      const s = closed();
      mutate(s);
      expect(open(s)).toEqual(['G3']);
    }
  });

  it('G4: sin correo, con otro correo que el registrado, sin huella o con una dirección de otro dominio', () => {
    for (const mutate of [
      (s: ReturnType<typeof closed>) => (s.contact = null),
      (s: ReturnType<typeof closed>) => (s.contact = { user: 'otro', domain: 'thisjulio.com' }),
      (s: ReturnType<typeof closed>) => (s.record.gates.G4.sha256 = null),
      (s: ReturnType<typeof closed>) => {
        s.contact = { user: 'nombre', domain: 'gmail.com' };
        s.record.gates.G4.sha256 = sha256('nombre@gmail.com');
      },
    ]) {
      const s = closed();
      mutate(s);
      expect(open(s)).toEqual(['G4']);
    }
  });

  it('ninguna puerta se cierra sola: con la condición cumplida pero sin fecha de Julio, sigue abierta', () => {
    for (const gate of GATES) {
      const s = closed();
      s.record.gates[gate].closed = null;
      expect(open(s)).toEqual([gate]);
    }
  });

  it('una excepción registrada con su decisión deja pasar esa puerta y solo esa', () => {
    const s = closed();
    s.legalHtml.es = LEGAL_DRAFT;
    s.drafts = [{ path: 'src/content/about.ts', drafts: 2 }];
    s.record.exceptions = [{ gate: 'G2', decision: 'P-99', date: '2026-12-05', note: 'Julio publica Legal como borrador mientras llega la revisión.' }];
    const results = evaluateGates(s);
    expect(results.find((r) => r.gate === 'G2')).toMatchObject({ state: 'excepted', exception: expect.stringContaining('P-99') });
    expect(open(s)).toEqual(['G1']);
  });
});

describe('registro (release-gates.json)', () => {
  const base = () => ({
    gates: { G1: { closed: null }, G2: { closed: null, reviewedBy: null }, G3: { closed: null, files: {} }, G4: { closed: null, sha256: null } },
    exceptions: [] as unknown[],
  });

  it('acepta el registro vacío y rechaza formas inesperadas', () => {
    expect(() => parseRecord(base())).not.toThrow();
    const bad: ((r: ReturnType<typeof base>) => unknown)[] = [
      (r) => ({ ...r, skip: true }),
      (r) => ({ ...r, gates: { ...r.gates, G5: { closed: null } } }),
      (r) => ({ ...r, gates: { ...r.gates, G1: { closed: 'ayer' } } }),
      (r) => ({ ...r, gates: { ...r.gates, G1: { closed: true } } }),
      (r) => ({ ...r, gates: { ...r.gates, G3: { closed: null, files: { 'logo.png': ICON } } } }),
      (r) => ({ ...r, gates: { ...r.gates, G3: { closed: null, files: { 'icon.png': 'corto' } } } }),
      (r) => ({ ...r, gates: { ...r.gates, G4: { closed: null, sha256: 'x' } } }),
      (r) => ({ gates: r.gates }),
    ];
    for (const make of bad) expect(() => parseRecord(make(base()))).toThrow(/release-gates\.json/);
  });

  it('una excepción sin decisión, sin fecha, sin motivo o con campos de más no vale', () => {
    const ok = { gate: 'G2', decision: 'P-99', date: '2026-12-05', note: 'Motivo suficientemente explicado.' };
    expect(() => parseRecord({ ...base(), exceptions: [ok] })).not.toThrow();
    for (const e of [
      { ...ok, decision: 'porque sí' },
      { ...ok, date: '' },
      { ...ok, note: 'ok' },
      { ...ok, gate: 'G9' },
      { ...ok, all: true },
      { gate: 'G2' },
      'G2',
    ]) {
      expect(() => parseRecord({ ...base(), exceptions: [e] })).toThrow(/excepción/);
    }
  });
});

describe('lectura del repositorio', () => {
  it('cuenta los borradores igual que la capa de contenido', () => {
    const files = ['about', 'architecture', 'legal', 'messages-copy', 'process', 'projects', 'services'].map((f) => ({
      path: `src/content/${f}.ts`,
      source: readFileSync(`src/content/${f}.ts`, 'utf8'),
    }));
    const counted = findDraftCopy(files).reduce((n, f) => n + f.drafts, 0);
    expect(counted).toBe(listCopyBlocks().filter((b) => b.copy === 'draft').length);
  });

  it('no cuenta lo aprobado ni se confunde con otros «draft»', () => {
    expect(findDraftCopy([{ path: 'src/content/x.ts', source: "{ copy: 'approved', es: 'a' }, { status: 'draft' }" }])).toEqual([]);
    // Un `copy: 'draft'` citado en un comentario no cuenta; uno real en la línea siguiente, sí.
    const commented = "/**\n * Todo el texto va `copy: 'draft'`.\n */\n  // copy: 'draft',\nexport const x = { copy: 'draft', es: 'a', en: 'b' };";
    expect(findDraftCopy([{ path: 'src/content/x.ts', source: commented }])).toEqual([{ path: 'src/content/x.ts', drafts: 1 }]);
    expect(findDraftCopy([{ path: 'src/content/messages-copy.ts', source: "export const m = {\n  home: 'approved',\n  work: 'draft',\n};" }])).toEqual([
      { path: 'src/content/messages-copy.ts', drafts: 1 },
    ]);
  });

  it('reconoce el rótulo de borrador de LegalView', () => {
    expect(readFileSync('src/components/sections/legal/LegalView.tsx', 'utf8')).toContain('className="muted legal-draft"');
    expect(hasLegalDraftLabel(LEGAL_DRAFT)).toBe(true);
    expect(hasLegalDraftLabel(LEGAL_OK)).toBe(false);
    expect(hasLegalDraftLabel(null)).toBeNull();
  });

  it('lee el correo de src/config/contact.ts igual que el módulo', () => {
    expect(parseContactEmail(readFileSync('src/config/contact.ts', 'utf8'))).toEqual(contactEmail);
    expect(parseContactEmail("export const contactEmail: ContactEmail | null = { user: 'nombre', domain: 'thisjulio.com' };")).toEqual(ADDRESS);
    expect(() => parseContactEmail('export const contactEmail = build();')).toThrow(/contactEmail/);
    expect(() => parseContactEmail("export const contactEmail: ContactEmail | null = { user: USER, domain: 'x.com' };")).toThrow(/una sola línea/);
  });

  it('reconoce los archivos de icono de Next y nada más', () => {
    for (const f of ['favicon.ico', 'icon.png', 'icon.svg', 'apple-icon.png']) expect(ICON_FILE.test(f), f).toBe(true);
    for (const f of ['logo.png', 'icon.tsx', 'opengraph-image.png', 'favicon.png']) expect(ICON_FILE.test(f), f).toBe(false);
  });

  it('el origen de producción es el mismo que usa el SEO', () => {
    expect(PRODUCTION_ORIGIN).toBe(SEO_ORIGIN);
  });
});

describe('scripts/release-gates.mjs sobre el repositorio de hoy', () => {
  const run = (args: string[], origin: string) => {
    try {
      return { code: 0, out: execFileSync('node', ['scripts/release-gates.mjs', ...args], { env: { ...process.env, SITE_ORIGIN: origin }, encoding: 'utf8', stdio: 'pipe' }) };
    } catch (e) {
      const err = e as { status: number; stdout: string; stderr: string };
      return { code: err.status, out: err.stdout + err.stderr };
    }
  };

  it('con un origen de pruebas informa y no bloquea', () => {
    const { code, out } = run([], 'http://localhost:3100');
    expect(code).toBe(0);
    expect(out).toContain('no es el de producción');
  });

  it('evaluado como producción falla mientras haya puertas abiertas, y dice cuáles y por qué', () => {
    const { code, out } = run(['--report'], PRODUCTION_ORIGIN);
    const record = parseRecord(JSON.parse(readFileSync('release-gates.json', 'utf8')));
    const pending = GATES.filter((g) => record.gates[g].closed === null);
    if (pending.length === 0 && record.exceptions.length === 0) {
      expect(code).toBe(0);
      return;
    }
    expect(code).toBe(1);
    for (const g of pending) expect(out).toMatch(new RegExp(`${g} [^\\n]+: ABIERTA`));
    expect(out).toContain('no se puede publicar');
  });
});
