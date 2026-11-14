import type { Page } from '@playwright/test';

/**
 * Espera a que terminen las transiciones y animaciones finitas. Los chips cambian de color en 160 ms; medido:
 * axe a mitad del cambio da un falso `color-contrast`, y el estado final no tiene ninguna violación.
 */
export async function settle(page: Page) {
  // Dos cuadros: las animaciones ligadas al desplazamiento se actualizan en el cuadro siguiente al desplazamiento.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  // Solo las del reloj del documento: las ligadas al desplazamiento no terminan mientras no se desplace.
  await page.evaluate(() => {
    const finite = document
      .getAnimations()
      .filter((a) => a.timeline === document.timeline && a.effect?.getComputedTiming().iterations !== Infinity);
    return Promise.race([Promise.all(finite.map((a) => a.finished.catch(() => undefined))), new Promise((r) => setTimeout(r, 2000))]);
  });
}
