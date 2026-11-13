import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { getLegal } from '@/lib/content';

// spec 002 §3.6: «La fecha de última actualización es la del commit, no una
// inventada». La fecha vive en src/content/legal.ts (el build no depende de
// git) y esta prueba la contrasta con el historial.
const FILE = 'src/content/legal.ts';
const git = (cmd: string) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

describe('Legal: fecha de última actualización', () => {
  it('es la del último commit de legal.ts, o la de hoy si tiene cambios sin commit', () => {
    const updated = getLegal('es').updated;
    const dirty = git(`git status --porcelain -- ${FILE}`) !== '';
    const committed = git(`git log -1 --format=%cs -- ${FILE}`);
    const today = new Date().toLocaleDateString('en-CA'); // AAAA-MM-DD, hora local
    if (dirty) expect(updated, 'legal.ts cambió: poner la fecha de hoy').toBe(today);
    else if (committed) expect(updated).toBe(committed);
    // Sin historial (clon superficial sin ese commit): no se puede comprobar aquí.
  });
});
