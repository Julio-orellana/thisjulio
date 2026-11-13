import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { QUALITY } from '@/components/scene3d/engine-profile';
import { DEPTH_FS, DEPTH_VS, GLOW_FS, GLOW_VS, SCENE_VS, sceneFragmentShader } from '@/components/scene3d/engine-shaders';

// Los shaders del port son los del diseño, sin cambios (spec 003, T3). Se leen
// de la fuente versionada (su huella la vigila design-sources.test.ts).
const design = readFileSync('docs/design/fuente/Arch3D.dc.html', 'utf8');
const template = (name: string) => design.match(new RegExp('const ' + name + ' = `([\\s\\S]*?)`;'))![1];
const quoted = (name: string) => design.match(new RegExp('const ' + name + " = '([^']*)';"))![1];

describe('shaders de la escena 3D', () => {
  it('vértices de la escena, del brillo y de la profundidad: idénticos al diseño', () => {
    expect(SCENE_VS).toBe(template('vs'));
    expect(GLOW_VS).toBe(template('glowVs'));
    expect(DEPTH_VS).toBe(quoted('depthVs'));
  });

  it('fragmentos del brillo y de la profundidad: idénticos al diseño', () => {
    expect(GLOW_FS).toBe(template('glowFs'));
    expect(DEPTH_FS).toBe(quoted('depthFs'));
  });

  it.each(Object.entries(QUALITY))('fragmentos de la escena con el perfil %s: idénticos al diseño', (_profile, q) => {
    expect(template('fs')).toContain('#define TAPS ${Q.taps}\n');
    expect(sceneFragmentShader(q.taps)).toBe(template('fs').replace('${Q.taps}', String(q.taps)));
  });

  it('el diseño no interpola nada más en sus shaders', () => {
    for (const name of ['vs', 'glowVs', 'glowFs']) expect(template(name)).not.toContain('${');
    expect(template('fs').match(/\$\{/g)).toHaveLength(1);
  });
});
