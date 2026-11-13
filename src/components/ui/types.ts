import type { ComponentProps } from 'react';
import type { Link } from '@/i18n/navigation';

/** Destino interno tipado (ruta + parámetros + ancla) del `Link` localizado. */
export type AppHref = ComponentProps<typeof Link>['href'];
