import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { getLegal } from '@/lib/content';

// spec 002 §3.6: «La fecha de última actualización es la del commit, no una
// inventada». La fecha vive en src/content/legal.ts (el build no depende de
// git) y esta prueba la contrasta con el historial.
//
// En un clon superficial (p. ej. `actions/checkout` sin `fetch-depth: 0`) el
// único commit disponible aparenta haber creado todos los archivos, y en un
// pull request ese commit es la fusión que genera GitHub: su fecha no es la de
// legal.ts. Ahí no se puede comprobar, y la prueba lo dice en lugar de fallar
// o de aceptar cualquier fecha. La CI clona el historial completo (verify.yml).
const FILE = 'src/content/legal.ts';
const git = (cmd: string) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};
const shallow = git('git rev-parse --is-shallow-repository') === 'true';

describe('Legal: fecha de última actualización', () => {
  it.skipIf(shallow)('es la del último commit de legal.ts, o la de hoy si tiene cambios sin commit', () => {
    const updated = getLegal('es').updated;
    const dirty = git(`git status --porcelain -- ${FILE}`) !== '';
    const committed = git(`git log -1 --format=%cs -- ${FILE}`);
    const today = new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD, hora local
    if (dirty) expect(updated, 'legal.ts cambió: poner la fecha de hoy').toBe(today);
    else expect(committed, 'sin historial de legal.ts en un clon completo').not.toBe('');
    if (!dirty) expect(updated).toBe(committed);
  });
});
