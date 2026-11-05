import type { AppPathname } from '@/i18n/routing';

/** Menú principal aprobado (prompt §4.3). Arquitectura NO forma parte (D-04). */
export const primaryNav = [
  { key: 'home', href: '/' },
  { key: 'work', href: '/work' },
  { key: 'services', href: '/services' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const satisfies readonly { key: string; href: AppPathname }[];

export function isActive(current: string, href: AppPathname): boolean {
  if (href === '/') return current === '/';
  return current === href || current.startsWith(`${href}/`);
}
