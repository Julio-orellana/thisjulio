import { serializeJsonLd } from '@/lib/seo/routes';

/**
 * Bloque de datos estructurados. Es un `<script type="application/ld+json">`:
 * el navegador no lo ejecuta y la CSP no lo gobierna; el generador del
 * manifiesto lo reconoce y solo exige que sea JSON válido
 * (`scripts/lib/csp-scan.mjs`). Único uso admitido de `dangerouslySetInnerHTML`
 * (SECURITY.md §2); el contenido sale de datos del repositorio, con `<` escapado.
 */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
