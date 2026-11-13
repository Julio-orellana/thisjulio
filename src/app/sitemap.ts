import type { MetadataRoute } from 'next';
import { siteOrigin, sitemapRoutes } from '@/lib/seo/metadata';
import { sitemapEntries } from '@/lib/seo/routes';

/**
 * sitemap.xml (feature 006): exactamente las rutas indexables, una entrada por
 * idioma con sus alternates. Sin blog (oculto y `noindex`), sin 404 y sin el
 * duplicado del servicio 01. Sin `lastmod`: no hay una fecha real por página.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(siteOrigin(), sitemapRoutes());
}
