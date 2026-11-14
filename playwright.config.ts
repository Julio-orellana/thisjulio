import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };
const mobile = { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true };
/**
 * Chromium sin cabeza pinta WebGL por software (SwiftShader): caro y sensible a
 * la carga. Solo las pruebas de la escena 3D (`scene.spec.ts` y
 * `scene-budget.spec.ts`, proyectos `*-webgl`) lo usan; el resto de la suite corre con WebGL desactivado y ve el
 * respaldo `Plates stack` de Inicio, que es lo que esas pruebas necesitan
 * (rutas, textos, CSP, accesibilidad). Feature 003.
 */
const SCENE = /scene(-[\w]+)?\.spec\.ts$/;
const noWebGL = { launchOptions: { args: ['--disable-3d-apis'] } };
/**
 * Feature 006 · T8 (P-17, P-52): la CSP, el 404 y la navegación se comprueban además en Firefox.
 * WebKit no puede correr aquí: aplica `upgrade-insecure-requests` también a `http://localhost`, pide los
 * scripts por HTTPS y ninguna página hidrata. WebKit (y de nuevo Chromium y Firefox) se prueban bajo HTTPS con
 * `node tests/https/run.mjs`. Safari real (macOS e iOS) se revisa a mano con la lista de la 006.
 * El resto de la suite sigue solo en Chromium.
 */
const CROSS_BROWSER = /(csp|not-found|navigation|locale-switcher)\.spec\.ts$/;
const firefox = { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } };

/**
 * Las pruebas e2e corren contra el build de producción (`npm run build`
 * antes de `npm run test:e2e`). Ver TEST-PLAN.md §1.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', testIgnore: SCENE, use: { ...desktop, ...noWebGL } },
    { name: 'mobile', testIgnore: SCENE, use: { ...mobile, ...noWebGL } },
    { name: 'desktop-webgl', testMatch: SCENE, use: desktop },
    { name: 'mobile-webgl', testMatch: SCENE, use: mobile },
    // Firefox de Playwright pierde a veces el aviso de carga o de red inactiva aunque la página terminó (medido:
    // `readyState` completo y 0 peticiones pendientes; 1–3 de ~140 por corrida). Es de la herramienta: se reintenta.
    { name: 'firefox', testMatch: CROSS_BROWSER, retries: 2, use: firefox },
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/es`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
