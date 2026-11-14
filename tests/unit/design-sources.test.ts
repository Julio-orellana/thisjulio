import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Fuentes del diseño versionadas en docs/design/fuente/ (copias literales del
// artefacto, REFERENCIA-DISENO.md §2). Si una huella cambia, el diseño se editó:
// se revisa antes de seguir (spec 003, T1).
const SOURCES: Record<string, string> = {
  'site.css': 'aac3072a2970729a',
  'Arch3D.dc.html': '70cba440a2f7d01f',
  'Technology.dc.html': '3c615d97ba2981af',
  'MobileTech.dc.html': 'cd5a0cffd990e1cc',
  'Main.dc.html': '4a7efa0c0ba08554',
};

describe('fuentes del diseño', () => {
  for (const [file, prefix] of Object.entries(SOURCES)) {
    it(`${file} es la versión registrada (SHA-256 ${prefix}…)`, () => {
      const hash = createHash('sha256').update(readFileSync(`docs/design/fuente/${file}`)).digest('hex');
      expect(hash.startsWith(prefix)).toBe(true);
    });
  }
});
