/** Pares aprobados de rutas públicas (prompt §4.1). */
export const routePairs = [
  { key: 'home', es: '/es', en: '/en' },
  { key: 'work', es: '/es/trabajo', en: '/en/work' },
  { key: 'services', es: '/es/servicios', en: '/en/services' },
  { key: 'about', es: '/es/acerca-de', en: '/en/about' },
  { key: 'contact', es: '/es/contacto', en: '/en/contact' },
  { key: 'architecture', es: '/es/arquitectura', en: '/en/architecture' },
  { key: 'estimate', es: '/es/estimador', en: '/en/estimate' },
  { key: 'blog', es: '/es/blog', en: '/en/blog' },
  { key: 'legal', es: '/es/legal', en: '/en/legal' },
] as const;

export const allPaths = routePairs.flatMap((r) => [
  { locale: 'es' as const, path: r.es, key: r.key },
  { locale: 'en' as const, path: r.en, key: r.key },
]);

/**
 * Feature 002 · T8: una ruta por servicio e idioma (DA-3, P-21). Slugs de
 * `plan.md` §3; `title` es el nombre oficial (es) y el del diseño ajustado (en).
 */
export const servicePairs = [
  { id: 'custom', es: '/es/servicios/desarrollo-a-la-medida', en: '/en/services/custom-software', titleEs: 'Desarrollo de software a la medida', titleEn: 'Custom Software Development' },
  { id: 'web', es: '/es/servicios/aplicaciones-web', en: '/en/services/web-applications', titleEs: 'Aplicaciones web y plataformas', titleEn: 'Web Applications & Platforms' },
  { id: 'apps', es: '/es/servicios/aplicaciones-moviles-y-escritorio', en: '/en/services/mobile-and-desktop-apps', titleEs: 'Aplicaciones móviles y de escritorio', titleEn: 'Mobile & Desktop Applications' },
  { id: 'shopify', es: '/es/servicios/ecommerce-y-shopify', en: '/en/services/ecommerce-and-shopify', titleEs: 'E-commerce y Shopify', titleEn: 'E-commerce & Shopify' },
  { id: 'apis', es: '/es/servicios/apis-y-automatizacion', en: '/en/services/apis-and-automation', titleEs: 'APIs y automatización de procesos', titleEn: 'APIs & Process Automation' },
  { id: 'pos', es: '/es/servicios/sistemas-pos', en: '/en/services/pos-systems', titleEs: 'Sistemas POS y gestión de negocios', titleEn: 'POS & Business Management Systems' },
  { id: 'support', es: '/es/servicios/soporte-y-mantenimiento', en: '/en/services/support-and-maintenance', titleEs: 'Soporte y mantenimiento', titleEn: 'Support and Maintenance' },
] as const;

/** Ruta interna (clave del build y del manifiesto de CSP) de una ruta pública de servicio. */
export const internalServicePath = (p: string) => p.replace('/es/servicios/', '/es/services/');

export const servicePaths = servicePairs.flatMap((s) => [
  { locale: 'es' as const, path: s.es, key: `services.${s.id}` },
  { locale: 'en' as const, path: s.en, key: `services.${s.id}` },
]);

/** Feature 002 · T10: el único caso aprobado (POS), una ruta por idioma (plan §3). */
export const casePair = { es: '/es/trabajo/sistema-pos-de-escritorio', en: '/en/work/desktop-pos-system' } as const;
export const casePaths = [
  { locale: 'es' as const, path: casePair.es, key: 'work.pos' },
  { locale: 'en' as const, path: casePair.en, key: 'work.pos' },
];
/** Ruta interna (clave del build y del manifiesto) de una ruta pública de caso. */
export const internalCasePath = (p: string) => p.replace('/es/trabajo/', '/es/work/');

/** Feature 002 · T14: todas las rutas públicas estáticas (18 + 14 servicios + 2 del caso = 34). */
export const sitePaths = [...allPaths, ...servicePaths, ...casePaths];
