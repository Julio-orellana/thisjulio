import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

// Fuentes del diseño, autoalojadas (D-10). Pesos de site.css / DesignSystem.
// Un solo módulo para el layout del sitio y las páginas de error (P-16): las
// tres se declaran una vez y se aplican igual en todas.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

/** Clases de las variables CSS de las tres fuentes, para `<html>`. */
export const fontVariables = `${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`;
