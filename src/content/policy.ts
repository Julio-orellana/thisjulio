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
 *
 * P-28 (2026-11-13) confirmó tecnologías **solo para dos sitios**, y las reglas
 * siguen vigentes en todo lo demás (P-19: el caso POS sin stack; P-20: Acerca
 * de sin tecnologías; P-22: Servicios sin monitoreo):
 * - los nombres de los nodos de Arquitectura (`src/content/architecture.ts`),
 *   que el esquema valida contra su propia lista cerrada, con la exención
 *   `exempt` de abajo;
 * - los rótulos `POSTGRESQL` y `MONGODB` del atlas 3D (`home.scene.labels`), en
 *   mayúsculas como en el diseño (la regla, de nombres propios, no los alcanza).
 *
 * P-35 (▲B1 de la 003, 2026-11-13): el panel de la capa «Datos» de Inicio
 * (`home.built.layers.data`) nombra PostgreSQL y MongoDB, como el diseño. La
 * excepción vive en `tests/unit/messages.test.ts`, limitada a esas claves y a
 * esas dos palabras.
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

export type PolicyRuleId = 'marcador' | '24/7' | 'sla' | 'tiempos-de-respuesta' | 'disponibilidad' | 'monitoreo' | 'cobertura' | 'proyecto-no-verificado' | 'tecnologia-no-confirmada';

/**
 * Devuelve una descripción por cada regla que el texto rompe (vacío si cumple).
 * `exempt` deja fuera reglas concretas: solo lo usa el esquema de Arquitectura,
 * para los nombres de nodo que P-28 confirmó.
 */
export function findPolicyViolations(value: string, exempt: readonly PolicyRuleId[] = []): string[] {
  return CONTENT_POLICY.filter((rule) => !exempt.includes(rule.id as PolicyRuleId) && rule.pattern.test(value)).map(
    (rule) => `texto vedado (${rule.id}): «${value}» — ${rule.reason}`,
  );
}
