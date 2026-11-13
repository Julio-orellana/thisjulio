/**
 * Configuración del sitio sin textos localizados.
 * Solo datos reales y aprobados (spec/constitution/mission.md §5).
 */
export const site = {
  name: 'THIS JULIO',
  /** Persona detrás de la marca (spec/constitution/mission.md §1). Solo para datos estructurados (P-47). */
  owner: 'Julio Orellana',
  domain: 'thisjulio.com',
  githubUrl: 'https://github.com/Julio-orellana',
  /**
   * Indicador «Taking projects» del diseño (D-09). Afirmación comercial
   * pendiente de aprobación (P-04): permanece apagado hasta que Julio la apruebe.
   */
  showAvailabilityStatus: false,
} as const;
