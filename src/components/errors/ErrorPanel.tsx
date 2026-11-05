import type { ReactNode } from 'react';

/**
 * Cuerpo común de las páginas de error (P-16): etiqueta en mono, título,
 * frase y acciones, con las clases de `.page-head` del diseño aprobado.
 * Sin estilos en línea (ADR 006): todo sale de design.css.
 */
export function ErrorPanel({
  eyebrow,
  title,
  text,
  actions,
  level = 1,
  lang,
}: {
  eyebrow: string;
  title: string;
  text: string;
  actions: ReactNode;
  level?: 1 | 2;
  lang?: string;
}) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <section className="stack-3" lang={lang}>
      <div>
        <span className="mono">{eyebrow}</span>
        <Heading className={level === 1 ? 'h1' : 'h2'}>{title}</Heading>
      </div>
      <p className="lead muted">{text}</p>
      <div className="actions">{actions}</div>
    </section>
  );
}
