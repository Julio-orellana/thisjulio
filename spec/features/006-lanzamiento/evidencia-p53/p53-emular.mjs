// P-53, medición en copia aislada (no forma parte del repositorio).
// Uso: node p53-emular.mjs <copia>
// 1. Genera un manifiesto de CSP a partir del HTML que el adaptador de Vercel deja para servir
//    (.next/output/functions/<ruta>.prerender-fallback.html), con el escáner del propio repositorio.
// 2. Monta la función del proxy como la empaquetaría Vercel: SOLO los archivos de filePathMap (E1),
//    y E1 + .next/csp-manifest.json (E2). Llama al lanzador en un proceso Node limpio.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const C = process.argv[2];
const out = join(C, '.next', 'output');
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 16);

// --- 1. Manifiesto desde el HTML servido ---
const { buildCspManifest } = await import(pathToFileURL(join(C, 'scripts/lib/csp-scan.mjs')).href);
const require = createRequire(join(C, 'package.json'));
const nextVersion = require('next/package.json').version;
const buildId = readFileSync(join(C, '.next/BUILD_ID'), 'utf8').trim();
const prerenderManifest = JSON.parse(readFileSync(join(C, '.next/prerender-manifest.json'), 'utf8'));
const htmlOf = (route) => join(out, 'functions', `${route === '/' ? 'index' : route.slice(1)}.prerender-fallback.html`);
const readRouteFile = (route, ext) => {
  if (ext === '.html') return existsSync(htmlOf(route)) ? readFileSync(htmlOf(route), 'utf8') : null;
  if (ext === '.body') { const f = join(out, 'static', route.slice(1)); return existsSync(f) ? readFileSync(f, 'utf8') : null; }
  return null;
};
let manifest;
try {
  manifest = buildCspManifest({ nextVersion, buildId, prerenderManifest, readRouteFile });
  console.log(`[M5] el escáner acepta el HTML del adaptador: ${Object.keys(manifest.routes).length} rutas con hashes, ningún script en línea no contemplado`);
} catch (e) {
  console.log(`[M5] el escáner RECHAZA el HTML del adaptador: ${e.message}`);
  process.exit(1);
}

// ¿El HTML que se sirve es el mismo que dejó Next en route-cache?
const rc = execFileSync('find', [join(C, '.next/server/route-cache/APP_PAGE'), '-name', 'es.html']).toString().trim().split('\n')[0];
console.log(`[M4] /es: route-cache ${sha(rc)} · prerender-fallback ${sha(htmlOf('/es'))} → ${sha(rc) === sha(htmlOf('/es')) ? 'idénticos' : 'DISTINTOS'}`);

// --- 2. Función del proxy como la empaquetaría Vercel ---
const func = join(out, 'functions', '_middleware.func');
const vc = JSON.parse(readFileSync(join(func, '.vc-config.json'), 'utf8'));
function mount(dir, extra = {}) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const [dest, src] of Object.entries({ ...vc.filePathMap, ...extra })) {
    mkdirSync(dirname(join(dir, dest)), { recursive: true });
    cpSync(join(C, src), join(dir, dest));
  }
  cpSync(join(func, vc.handler), join(dir, vc.handler));
}
const call = `
  const h = require(process.argv[1]);
  (async () => {
    for (const path of ['/es', '/es/trabajo', '/es/no-existe', '/']) {
      try {
        const r = await h(new Request('http://localhost:3100' + path, { headers: { accept: 'text/html' } }));
        const csp = r.headers.get('content-security-policy') || '';
        const mode = /'sha256-/.test(csp) ? 'hashes' : /'nonce-/.test(csp) ? 'nonce' : csp ? 'sin scripts' : 'ninguna';
        console.log('   ' + path.padEnd(14) + ' → ' + r.status + ' · CSP: ' + mode + (r.headers.get('location') ? ' · location: ' + r.headers.get('location') : '') + (r.headers.get('x-middleware-rewrite') ? ' · rewrite: ' + new URL(r.headers.get('x-middleware-rewrite')).pathname : ''));
      } catch (e) {
        console.log('   ' + path.padEnd(14) + ' → EXCEPCIÓN (la plataforma responde 500): ' + (e && e.message ? e.message.split('\\n')[0] : e));
      }
    }
  })();`;
const base = join(dirname(C), 'p53-funcion');
const scenarios = [
  ['E1 · solo filePathMap (lo que empaquetaría Vercel hoy)', join(base, 'e1'), {}],
  ['E2 · filePathMap + .next/csp-manifest.json (idea de A2)', join(base, 'e2'), { '.next/csp-manifest.json': '.next/csp-manifest.p53.json' }],
];
writeFileSync(join(C, '.next/csp-manifest.p53.json'), JSON.stringify(manifest, null, 2) + '\n');
for (const [name, dir, extra] of scenarios) {
  mount(dir, extra);
  console.log(`[M3] ${name}: ${Object.keys({ ...vc.filePathMap, ...extra }).length} archivos; manifiesto presente: ${existsSync(join(dir, '.next/csp-manifest.json'))}; BUILD_ID presente: ${existsSync(join(dir, '.next/BUILD_ID'))}`);
  execFileSync(process.execPath, ['-e', call, join(dir, vc.handler)], { stdio: 'inherit', cwd: dir, env: { PATH: process.env.PATH } });
}
