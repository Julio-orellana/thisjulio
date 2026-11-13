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
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/es`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
