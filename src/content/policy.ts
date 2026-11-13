/**
 * Reglas de contenido que ningún texto publicable puede romper
 * (CLAUDE.md §5, spec 002 §4.4, P-19, P-20, P-22).
 *
 * Se aplican en dos lugares:
 * - al validar `src/content` (schema.ts): un texto que las rompe hace fallar
 *   `next build` y las pruebas;
 * - a todos los mensajes de `src/messages` (tests/unit/messages.test.ts).
 *
 * Cada regla dice por qué existe. Si Julio confirma algo que hoy está vedado
 * (p. ej. una tecnología, P-20), se retira la regla en el mismo commit que
 * publica el dato, con la referencia a su decisión.
 */
export type PolicyRule = { id: string; pattern: RegExp; reason: string };

export const CONTENT_POLICY: readonly PolicyRule[] = [
  {
    id: 'marcador',
    pattern: /\[[^\]]*\]/,
    reason: 'marcador del diseño sin resolver ([Confirm stack], [year], [Add…]): lo pendiente se omite (D-08, D-12)',
  },
  { id: '24/7', pattern: /24\s*\/\s*7/, reason: 'servicio 07 sin «24/7» (D-02)' },
  { id: 'sla', pattern: /\bSLAs?\b/i, reason: 'sin SLA (D-02)' },
  {
    id: 'tiempos-de-respuesta',
    pattern: /tiempos?\s+de\s+respuesta|response[\s-]+times?/i,
    reason: 'sin tiempos de respuesta (D-02, P-22)',
  },
  {
    id: 'disponibilidad',
    pattern: /disponibilidad|availability/i,
    reason: 'sin afirmaciones de disponibilidad garantizada (D-02, DA-6, P-22)',
  },
  { id: 'monitoreo', pattern: /monitore|monitoriz|monitoring/i, reason: 'sin afirmaciones de monitoreo no confirmadas (P-22)' },
  { id: 'cobertura', pattern: /cobertura|coverage/i, reason: 'sin afirmaciones de cobertura no confirmadas (P-22)' },
  {
    id: 'proyecto-no-verificado',
    pattern: /\bAY\s*LUPITA\b|\bLupita\b|\bKinderland\b|\bATRIO\b|Order\s+Processing\s+API|API\s+de\s+pedidos/i,
    reason: 'proyecto del portafolio sin verificar (P-08, D-08)',
  },
  {
    id: 'tecnologia-no-confirmada',
    // Mayúsculas exactas: son nombres propios. «Shopify» no está: es parte del
    // nombre oficial del servicio 04 (mission §4).
    pattern: /\b(?:Electron|SQLite|better-sqlite3|TypeScript|React|Next\.js|Tailwind|Express|NestJS|Expo|PostgreSQL|Prisma|MongoDB)\b/,
    reason: 'tecnología sin confirmar: ni stack del POS (P-19) ni lista de tecnologías (P-20)',
  },
];

/** Devuelve una descripción por cada regla que el texto rompe (vacío si cumple). */
export function findPolicyViolations(value: string): string[] {
  return CONTENT_POLICY.filter((rule) => rule.pattern.test(value)).map(
    (rule) => `texto vedado (${rule.id}): «${value}» — ${rule.reason}`,
  );
}
