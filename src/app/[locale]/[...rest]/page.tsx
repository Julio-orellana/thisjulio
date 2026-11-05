import { notFound } from 'next/navigation';

/** Cualquier ruta no declarada bajo un idioma responde 404 con el layout del sitio. */
export default function CatchAll() {
  notFound();
}
