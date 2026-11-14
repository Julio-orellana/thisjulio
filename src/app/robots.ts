import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/seo/metadata';
import { isIndexable } from '@/lib/seo/routes';

/**
 * robots.txt (feature 006). Solo el build de producción permite rastrear y
 * anuncia el sitemap; cualquier otro origen (preview, pruebas) lo prohíbe todo.
 * El blog no se bloquea aquí: así los buscadores pueden leer su `noindex`.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  if (!isIndexable(origin)) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${origin}/sitemap.xml` };
}
