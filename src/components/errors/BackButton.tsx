'use client';

import { useSyncExternalStore } from 'react';

const noSubscription = () => () => {};
const hasHistory = () => window.history.length > 1;
const onServer = () => false;

/**
 * «Regresar a la página anterior» de las páginas de error (P-16).
 *
 * Solo se muestra cuando hay una página anterior en el historial: sin
 * JavaScript, o si la página se abrió directamente, un botón que no lleva a
 * ninguna parte sería un control roto. El enlace al inicio está siempre.
 * El código llega como chunk externo: no hay script ni manejador en línea.
 */
export function BackButton({ label }: { label: string }) {
  const visible = useSyncExternalStore(noSubscription, hasHistory, onServer);
  if (!visible) return null;
  return (
    <button type="button" className="link" onClick={() => window.history.back()}>
      <span>{label}</span>
    </button>
  );
}
