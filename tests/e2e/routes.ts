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
