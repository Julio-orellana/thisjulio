import type { ContentInput } from './schema';

/**
 * Legal y privacidad (`Legal.dc.html`). Página informativa, rotulada
 * «Borrador pendiente de revisión legal» (P-09). El español es traducción del
 * texto del diseño; no es asesoría jurídica ni texto definitivo.
 *
 * Reglas de SECURITY.md §6: no afirma una ley integral de protección de datos
 * en Guatemala; no afirma que el RGPD aplique siempre; sin contratos,
 * garantías ni cláusulas de responsabilidad.
 *
 * Anclas: las tres primeras son las de `footer.json` → `anchors` (lo comprueba
 * una prueba); la cuarta, «marco legal», es propia.
 * El correo de «Preguntas» se omite (P-11); el texto remite a Contacto.
 */
export const legal = {
  // Fecha del último commit que cambió este archivo; tests/unit/legal-date.test.ts
  // exige que coincida (o que sea hoy si hay cambios sin commit).
  updated: '2026-11-12',
  notice: {
    copy: 'draft',
    es: 'Esta página es informativa. Describe cómo THIS JULIO aborda el licenciamiento y la privacidad. No es un contrato, una garantía ni asesoría legal, y no sustituye un acuerdo firmado.',
    en: 'This page is informative. It describes how THIS JULIO approaches licensing and privacy. It is not a contract, a guarantee or legal advice, and it does not replace a signed agreement.',
  },
  sections: [
    {
      id: 'licensing',
      anchors: { es: 'licenciamiento', en: 'licensing' },
      text: {
        copy: 'draft',
        es: {
          title: 'Licenciamiento de software',
          body: [
            {
              type: 'p',
              text: 'El desarrollo de software, el licenciamiento, los permisos de uso y los derechos de distribución dependen del marco legal aplicable y del acuerdo específico que se establezca con cada cliente.',
            },
            { type: 'p', text: 'Como cada proyecto es distinto, estos términos se definen para ese proyecto y no en esta página.' },
          ],
        },
        en: {
          title: 'Software Licensing',
          body: [
            {
              type: 'p',
              text: 'Software development, licensing, usage permissions and distribution rights depend on the applicable legal framework and on the specific agreement established with each client.',
            },
            { type: 'p', text: 'Because each project is different, these terms are defined for that project rather than on this page.' },
          ],
        },
      },
    },
    {
      id: 'ip',
      anchors: { es: 'propiedad-intelectual', en: 'intellectual-property' },
      text: {
        copy: 'draft',
        es: {
          title: 'Propiedad intelectual',
          body: [
            {
              type: 'p',
              text: 'En Guatemala, los programas de computación están protegidos por la Ley de Derecho de Autor y Derechos Conexos (Decreto 33-98). Quién es titular de los derechos de un proyecto específico, o quién puede usarlos, se establece en el acuerdo de ese proyecto.',
            },
            {
              type: 'p',
              text: 'También pueden ser relevantes obligaciones internacionales, entre ellas el Convenio de Berna, el Tratado de la OMPI sobre Derecho de Autor y el Acuerdo sobre los ADPIC de la OMC.',
            },
          ],
        },
        en: {
          title: 'Intellectual Property',
          body: [
            {
              type: 'p',
              text: 'In Guatemala, computer programs are protected under the Copyright and Related Rights Law (Decree 33-98). Who owns or may use the rights in a specific project is established in the agreement for that project.',
            },
            {
              type: 'p',
              text: 'International obligations may also be relevant, including the Berne Convention, the WIPO Copyright Treaty and the WTO TRIPS Agreement.',
            },
          ],
        },
      },
    },
    {
      id: 'privacy',
      anchors: { es: 'privacidad', en: 'privacy' },
      text: {
        copy: 'draft',
        es: {
          title: 'Principios de privacidad',
          body: [
            { type: 'p', text: 'THIS JULIO aplica estos principios de trabajo al construir software:' },
            {
              type: 'ul',
              items: [
                'La recopilación de datos debe limitarse a lo necesario para los requisitos acordados del proyecto.',
                'THIS JULIO no recopila ni trata información personal adicional de los usuarios del software de un cliente solo para fines propios.',
                'El tratamiento de datos debe estar justificado por los requisitos del proyecto, las responsabilidades autorizadas y las obligaciones legales aplicables.',
                'Cuando un proyecto requiere recopilar, almacenar, tratar, transferir o analizar información, deben definirse su finalidad y su alcance.',
                'Las consideraciones de privacidad y seguridad deben incorporarse a la arquitectura del sistema.',
                'Deben considerarse controles de acceso y medidas de seguridad adecuados a la sensibilidad y la naturaleza de la información.',
              ],
            },
          ],
        },
        en: {
          title: 'Privacy Principles',
          body: [
            { type: 'p', text: 'THIS JULIO applies these operating principles when building software:' },
            {
              type: 'ul',
              items: [
                'Data collection should be limited to what is necessary for the agreed project requirements.',
                "THIS JULIO does not collect or process additional personal information from a client's software users merely for its own purposes.",
                "Data processing must be justified by the project's requirements, authorized responsibilities and applicable legal obligations.",
                'When a project requires collecting, storing, processing, transferring or analyzing information, the purpose and scope must be defined.',
                'Privacy and security considerations should be incorporated into the system architecture.',
                'Appropriate access controls and security measures should be considered according to the sensitivity and nature of the information.',
              ],
            },
          ],
        },
      },
    },
    {
      id: 'framework',
      anchors: { es: 'marco-legal', en: 'legal-framework' },
      text: {
        copy: 'draft',
        es: {
          title: 'Marco legal aplicable',
          body: [
            {
              type: 'p',
              text: 'Las normas que aplican dependen de cada proyecto, de su cliente, de sus usuarios y del lugar donde se manejan los datos. THIS JULIO toma en cuenta:',
            },
            {
              type: 'ul',
              items: [
                'La legislación guatemalteca aplicable al desarrollo de software, al derecho de autor y a la propiedad intelectual.',
                'Las obligaciones de privacidad, de confidencialidad y relativas a los datos que apliquen al proyecto. En Guatemala, estas provienen de varias fuentes y no de una sola ley integral de protección de datos, entre ellas la Constitución Política de la República y la Ley de Acceso a la Información Pública (Decreto 57-2008), dentro de su respectivo ámbito.',
                'Estándares internacionales y requisitos legales, cuando el proyecto, el cliente, los usuarios o el tratamiento de los datos involucran otras jurisdicciones.',
              ],
            },
            {
              type: 'p',
              text: 'Las regulaciones extranjeras, como el RGPD, no aplican automáticamente a todos los proyectos. Si aplican o no lo determinan las circunstancias reales y la jurisdicción.',
            },
          ],
        },
        en: {
          title: 'Applicable Legal Framework',
          body: [
            {
              type: 'p',
              text: 'The rules that apply depend on each project, its client, its users and where the data is handled. THIS JULIO takes into account:',
            },
            {
              type: 'ul',
              items: [
                'Guatemalan legislation applicable to software development, copyright and intellectual property.',
                'Privacy, confidentiality and data-related obligations that apply to the project. In Guatemala, these arise from several sources rather than from a single comprehensive data protection law, including the Political Constitution and the Law on Access to Public Information (Decree 57-2008), within their respective scope.',
                'International standards and legal requirements, when the project, client, users or data processing involve other jurisdictions.',
              ],
            },
            {
              type: 'p',
              text: 'Foreign regulations such as the GDPR do not automatically apply to every project. Whether they apply is determined by the actual circumstances and jurisdiction.',
            },
          ],
        },
      },
    },
  ],
} satisfies ContentInput['legal'];
