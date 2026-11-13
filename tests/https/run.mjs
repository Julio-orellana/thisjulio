// @ts-check
/**
 * Arnés HTTPS local (feature 006 · T8, P-17, P-52): comprueba la CSP, el 404 y la navegación en Chromium,
 * Firefox y WebKit bajo HTTPS y con un origen que no es `localhost`.
 *
 * Por qué hace falta: la suite normal sirve el build en `http://localhost:3100`. WebKit aplica
 * `upgrade-insecure-requests` también a localhost, pide los scripts por HTTPS y fallan por TLS, así que ninguna
 * página hidrata. No es un defecto del sitio (en producción todo es HTTPS), pero impide probar WebKit ahí.
 *
 * Qué hace, todo en esta máquina y sin tocar la red:
 *   1. construye con `SITE_ORIGIN=https://thisjulio.test` (`.test` es un dominio reservado que no existe);
 *   2. arranca `next start`, un frente TLS con un certificado autofirmado desechable y un proxy que solo deja
 *      pasar ese host (cualquier otro destino se rechaza y se informa al final);
 *   3. corre `tests/https/playwright.config.ts` (los mismos specs que la suite normal).
 *
 * Uso: `node tests/https/run.mjs [--no-build] [argumentos de Playwright]`. Deja `.next` construido con el
 * origen `.test`: antes de `npm run test:e2e` hay que volver a construir (`npm run verify`).
 * No forma parte de `verify`; la CI lo corre en un paso propio. WebKit de Playwright no es Safari: Safari real
 * se revisa a mano (lista de la feature 006).
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HOST = 'thisjulio.test';
const ORIGIN = `https://${HOST}`;
const APP_PORT = 3210;
const TLS_PORT = 3211;
const PROXY_PORT = 3212;
const args = process.argv.slice(2);
const build = !args.includes('--no-build');
const playwrightArgs = args.filter((a) => a !== '--no-build');
const env = { ...process.env, SITE_ORIGIN: ORIGIN, NEXT_TELEMETRY_DISABLED: '1' };

/** @type {import('node:child_process').ChildProcess | undefined} */
let app;
/** @type {(http.Server | https.Server)[]} */
const servers = [];
const certDir = mkdtempSync(join(tmpdir(), 'thisjulio-https-'));
/** Destinos que alguien intentó alcanzar y no son el sitio. */
const blocked = new Set();

function cleanup() {
  app?.kill('SIGTERM');
  for (const s of servers) s.close();
  rmSync(certDir, { recursive: true, force: true });
}
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

async function waitFor(/** @type {string} */ url, ms = 60_000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      if ((await fetch(url, { redirect: 'manual' })).status < 500) return;
    } catch {
      /* todavía no escucha */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`El servidor no respondió en ${url}`);
}

try {
  if (build) execFileSync('npm', ['run', 'build'], { env, stdio: 'inherit' });

  // Certificado autofirmado de dos días, solo para este arnés.
  const [key, cert] = [join(certDir, 'key.pem'), join(certDir, 'cert.pem')];
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '2', '-subj', `/CN=${HOST}`, '-addext', `subjectAltName=DNS:${HOST}`], { stdio: 'pipe' });

  app = spawn('npx', ['next', 'start', '--port', String(APP_PORT)], { env, stdio: 'ignore' });
  await waitFor(`http://127.0.0.1:${APP_PORT}/es`);

  // Frente TLS: termina HTTPS y pasa la petición tal cual (con su Host) a `next start`.
  const front = https.createServer({ key: readFileSync(key), cert: readFileSync(cert) }, (req, res) => {
    const upstream = http.request({ host: '127.0.0.1', port: APP_PORT, method: req.method, path: req.url, headers: req.headers }, (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    });
    upstream.on('error', () => res.writeHead(502).end());
    req.pipe(upstream);
  });
  // Proxy: solo abre un túnel hacia el frente TLS para el host del sitio.
  const proxy = http.createServer((req, res) => {
    blocked.add(req.url ?? '?');
    res.writeHead(403).end();
  });
  proxy.on('connect', (req, client, head) => {
    client.on('error', () => {});
    if (req.url !== `${HOST}:443`) {
      blocked.add(req.url ?? '?');
      client.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      return;
    }
    const upstream = net.connect(TLS_PORT, '127.0.0.1', () => {
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      upstream.write(head);
      upstream.pipe(client);
      client.pipe(upstream);
    });
    upstream.on('error', () => client.destroy());
  });
  servers.push(front, proxy);
  await new Promise((r) => front.listen(TLS_PORT, '127.0.0.1', () => r(undefined)));
  await new Promise((r) => proxy.listen(PROXY_PORT, '127.0.0.1', () => r(undefined)));

  // El build tiene que ser de este origen: si no, su CSP apunta a otro y nada cargaría.
  const csp = (await fetch(`http://127.0.0.1:${APP_PORT}/es`)).headers.get('content-security-policy') ?? '';
  if (!csp.includes(`script-src ${ORIGIN}/_next/static/chunks/`)) {
    throw new Error(`El build no es de ${ORIGIN} (su CSP dice: ${csp.split('; ')[1] ?? 'nada'}). Corre el arnés sin --no-build.`);
  }

  const code = await new Promise((resolve) => {
    const run = spawn('npx', ['playwright', 'test', '--config', 'tests/https/playwright.config.ts', ...playwrightArgs], {
      env: { ...process.env, HTTPS_LAB_ORIGIN: ORIGIN, HTTPS_LAB_PROXY: `http://127.0.0.1:${PROXY_PORT}` },
      stdio: 'inherit',
    });
    run.on('exit', (c) => resolve(c ?? 1));
  });
  cleanup();
  // Lo que el proxy rechazó son peticiones del propio navegador (actualizaciones, comprobaciones de red): las
  // de las páginas las vigilan los specs (`csp.spec.ts`, `not-found.spec.ts`). Se informan, no hacen fallar.
  if (blocked.size) console.log(`[https] El proxy rechazó ${blocked.size} destino(s) ajeno(s) al sitio, pedidos por los navegadores: ${[...blocked].join(', ')}`);
  console.log(`[https] ${code === 0 ? 'En verde' : 'Con fallos'} bajo ${ORIGIN}. Recuerda reconstruir antes de la suite normal.`);
  process.exit(Number(code));
} catch (error) {
  cleanup();
  console.error(`[https] ERROR — ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
