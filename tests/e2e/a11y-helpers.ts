import type { Page } from '@playwright/test';

/**
 * Espera a que terminen las transiciones y animaciones finitas. Los chips cambian de color en 160 ms; medido:
 * axe a mitad del cambio da un falso `color-contrast`, y el estado final no tiene ninguna violación.
 */
export async function settle(page: Page) {
  // Dos cuadros: las animaciones ligadas al desplazamiento se actualizan en el cuadro siguiente al desplazamiento.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  // Solo las del reloj del documento: las ligadas al desplazamiento no terminan mientras no se desplace.
  // Y solo las de un cambio de estado: transiciones y animaciones a las que les queda ≤ 1 s. Las decorativas que
  // duran varios segundos (`flow`, 4,4 s desde P-58, y se reinicia al cambiar de pestaña) no cambian el texto.
  await page.evaluate(() => {
    const left = (a: Animation) => Number(a.effect?.getComputedTiming().endTime ?? 0) - Number(a.currentTime ?? 0);
    const finite = document
      .getAnimations()
      .filter((a) => a.timeline === document.timeline && a.effect?.getComputedTiming().iterations !== Infinity)
      .filter((a) => a instanceof CSSTransition || left(a) <= 1000);
    return Promise.race([Promise.all(finite.map((a) => a.finished.catch(() => undefined))), new Promise((r) => setTimeout(r, 2000))]);
  });
}
