import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildCspManifest, hashScript, scanHtml, SUPPORTED_NEXT_VERSION } from '../../scripts/lib/csp-scan.mjs';

// Formas reales de Next 16.4.5 (copiadas del HTML del build del 2026-11-05).
const REGISTRO = '(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push({"otherChunks":["static/chunks/310vm2bl3xxpt.js","static/chunks/1wnov70f88xjy.js"],"runtimeModuleIds":[94553]});';
const ARRANQUE = '(self.__next_f=self.__next_f||[]).push([0])';
const DATOS = 'self.__next_f.push([1,"1:\\"$Sreact.fragment\\"\\n2:\\"/_next/static/chunks/3qfy96eoyh-ek.js\\"\\n"])';

function page(extra = '', { registro = REGISTRO, datos = DATOS } = {}) {
  return `<!DOCTYPE html><html lang="es"><head><link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/310vm2bl3xxpt.js"/>
<script src="/_next/static/chunks/1wnov70f88xjy.js" async=""></script><script src="/_next/static/chunks/0cz1d0mv5g_q7.js" noModule=""></script>
<script id="_R_">${registro}</script></head><body><h1>Trabajo</h1>${extra}<script>${ARRANQUE}</script><script>${datos}</script></body></html>`;
}

describe('scanHtml: lo contemplado', () => {
  it('reconoce las tres formas de Next 16.4.5 y calcula su sha256 exacto', () => {
    const { hashes, issues } = scanHtml(page());
    expect(issues).toEqual([]);
    const esperado = [REGISTRO, ARRANQUE, DATOS].map((s) => 'sha256-' + createHash('sha256').update(s).digest('base64'));
    expect(hashes.sort()).toEqual(esperado.sort());
  });

  it('hashScript usa SHA-256 en base64 (vector de prueba de FIPS 180-2: "abc")', () => {
    // ba7816bf…f20015ad en hexadecimal. Que el navegador acepte estos hashes lo prueba la e2e (P2/P3).
    expect(hashScript('abc')).toBe('sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=');
  });

  it('un bloque application/ld+json válido no se hashea ni falla (JSON-LD de la 006)', () => {
    const r = scanHtml(page('<script type="application/ld+json">{"@type":"Person"}</script>'));
    expect(r.issues).toEqual([]);
    expect(r.hashes).toHaveLength(3);
  });
});

describe('scanHtml: falla cerrado ante lo no contemplado', () => {
  const casos: [string, string, RegExp][] = [
    ['script en línea propio', page('<script>window.x=1</script>'), /no contemplado/],
    ['script externo de otra carpeta de Next', page('<script src="/_next/static/BUILD/_buildManifest.js"></script>'), /fuera de \/_next\/static\/chunks\//],
    ['script externo de otro origen', page('<script src="https://cdn.example/x.js"></script>'), /fuera de/],
    ['script del mismo origen fuera de la ruta', page('<script src="/lab.js"></script>'), /fuera de/],
    ['script con nonce en HTML estático', page('<script nonce="abc">' + ARRANQUE + '</script>'), /nonce/],
    ['script con type=module', page('<script type="module">' + ARRANQUE + '</script>'), /atributos no contemplados/],
    ['manejador on…=', page('<img src="/a.png" onerror="x()">'), /manejador/],
    ['estilo en línea', page('<div style="color:red"></div>'), /style=/],
    ['elemento <style>', page('<style>h1{}</style>'), /<style>/],
    ['URL javascript:', page('<a href="javascript:alert(1)">x</a>'), /javascript:/],
    ['<base>', page('<base href="https://evil.example/">'), /<base>/],
    ['precarga de script fuera de la ruta', page('<link rel="modulepreload" href="/_next/static/x/y.js">'), /precarga/],
    ['JSON-LD inválido', page('<script type="application/ld+json">{no</script>'), /JSON válido/],
  ];
  for (const [nombre, html, problema] of casos) {
    it(nombre, () => expect(scanHtml(html).issues.join(' | ')).toMatch(problema));
  }

  it('CAMBIO DE ESTRUCTURA DE CHUNKS: el registro de Turbopack apunta fuera de static/chunks/', () => {
    const r = scanHtml(page('', { registro: REGISTRO.replace('static/chunks/310vm2bl3xxpt.js', 'static/js/310vm2bl3xxpt.js') }));
    expect(r.issues.join(' | ')).toMatch(/no contemplado|fuera de/);
  });

  it('CAMBIO DE ESTRUCTURA DE CHUNKS: la carga RSC referencia JS fuera de static/chunks/', () => {
    const r = scanHtml(page('', { datos: DATOS.replace('/_next/static/chunks/3qfy96eoyh-ek.js', '/_next/static/app/3qfy96eoyh-ek.js') }));
    expect(r.issues.join(' | ')).toMatch(/referencia a JS de Next fuera de/);
  });

  it('CAMBIO DE FORMA de los scripts en línea (otra versión de Next): el arranque cambia', () => {
    const html = page().replace(ARRANQUE, '(self.__next_f=self.__next_f||[]).push([0]);self.__next_s=[]');
    expect(scanHtml(html).issues.join(' | ')).toMatch(/no contemplado/);
  });
});

describe('buildCspManifest', () => {
  const routes = { '/es/work': { initialRevalidateSeconds: false as const }, '/_not-found': { initialRevalidateSeconds: false as const } };
  const files: Record<string, string> = { '/es/work.html': page(), '/_not-found.html': page() };
  const base = {
    nextVersion: SUPPORTED_NEXT_VERSION,
    buildId: 'AbCdEfGh123',
    prerenderManifest: { routes },
    readRouteFile: (r: string, ext: string) => files[r + ext] ?? null,
  };

  it('arma el manifiesto con los hashes de cada ruta', () => {
    const m = buildCspManifest(base);
    expect(Object.keys(m.routes)).toEqual(['/es/work']);
    expect(m.internalRoutesWithoutHashes).toEqual(['/_not-found', '/_global-error']);
    expect(m.routes['/es/work'].hashes).toHaveLength(3);
    expect(m).toMatchObject({ schema: 1, buildId: 'AbCdEfGh123', scriptPath: '/_next/static/chunks/' });
  });

  it('CAMBIO DE VERSIÓN DE NEXT: falla hasta revalidar a propósito', () => {
    expect(() => buildCspManifest({ ...base, nextVersion: '16.5.0' })).toThrow(/16\.5\.0 no está validado/);
  });

  it('P7: una ruta con ISR (revalidate) hace fallar el build', () => {
    expect(() => buildCspManifest({ ...base, prerenderManifest: { routes: { ...routes, '/es/work': { initialRevalidateSeconds: 60 } } } })).toThrow(/no admiten ISR/);
  });

  it('una ruta prerenderizada sin HTML, o una página sin ningún script reconocible, hace fallar el build', () => {
    expect(() => buildCspManifest({ ...base, readRouteFile: (r, e) => (r === '/es/work' ? null : files[r + e] ?? null) })).toThrow(/no tiene HTML/);
    const sinScripts: Record<string, string> = { ...files, '/es/work.html': '<html><body><h1>x</h1></body></html>' };
    expect(() => buildCspManifest({ ...base, readRouteFile: (r, e) => sinScripts[r + e] ?? null })).toThrow(/ningún script/);
  });

  it('un script no contemplado en cualquier ruta hace fallar el build completo (no hay manifiesto parcial)', () => {
    const malo: Record<string, string> = { ...files, '/en/work.html': page('<script>x()</script>') };
    const prerenderManifest = { routes: { ...routes, '/en/work': { initialRevalidateSeconds: false as const } } };
    expect(() => buildCspManifest({ ...base, prerenderManifest, readRouteFile: (r, e) => malo[r + e] ?? null })).toThrow(/\/en\/work: script en línea no contemplado/);
  });

  it('solo /_not-found y /_global-error, por nombre exacto, quedan fuera del hash (se sirven sin scripts en línea)', () => {
    const conEstilo: Record<string, string> = { ...files, '/_not-foundx.html': page('<style>x{}</style>') };
    const prerenderManifest = { routes: { ...routes, '/_not-foundx': { initialRevalidateSeconds: false as const } } };
    expect(() => buildCspManifest({ ...base, prerenderManifest, readRouteFile: (r, e) => conEstilo[r + e] ?? null })).toThrow(/_not-foundx: elemento <style>/);
  });
});
