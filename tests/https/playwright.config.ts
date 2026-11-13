import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración del arnés HTTPS local (`node tests/https/run.mjs`; feature 006 · T8). Los mismos specs de CSP,
 * 404 y navegación que la suite normal, en los tres motores, contra `https://thisjulio.test` a través del proxy
 * del arnés. El certificado es autofirmado y desechable: por eso `ignoreHTTPSErrors`.
 */
const origin = process.env.HTTPS_LAB_ORIGIN;
const proxy = process.env.HTTPS_LAB_PROXY;
if (!origin || !proxy) throw new Error('Este archivo lo usa tests/https/run.mjs; no se ejecuta directamente.');

const viewport = { width: 1440, height: 900 };
const shared = { proxy: { server: proxy }, launchOptions: { proxy: { server: proxy } } };

export default defineConfig({
  testDir: join(__dirname, '..', 'e2e'),
  testMatch: /(csp|not-found|navigation|locale-switcher)\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: origin, ignoreHTTPSErrors: true, trace: 'retain-on-failure' },
  projects: [
    // Mismos nombres que la suite normal donde los specs los distinguen (`desktop` es Chromium a 1440).
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport, ...shared, launchOptions: { args: ['--disable-3d-apis'], proxy: { server: proxy } } } },
    // Reintentos solo en Firefox: Playwright pierde a veces su aviso de carga (ver playwright.config.ts).
    { name: 'firefox', retries: 2, use: { ...devices['Desktop Firefox'], viewport, ...shared } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport, ...shared } },
  ],
});
