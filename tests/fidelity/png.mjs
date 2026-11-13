// PNG mínimo para el arnés de fidelidad: lee los PNG de `canvas.toDataURL`
// (8 bits, RGB o RGBA, sin entrelazado) y escribe la imagen de diferencias.
// Sin dependencias: solo `node:zlib`.
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** @returns {{ width: number, height: number, data: Uint8Array }} RGBA, 4 bytes por píxel */
export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(SIGNATURE)) throw new Error('no es un PNG');
  let width = 0, height = 0, channels = 0;
  const idat = [];
  for (let at = 8; at < buf.length;) {
    const len = buf.readUInt32BE(at), type = buf.toString('latin1', at + 4, at + 8), body = buf.subarray(at + 8, at + 8 + len);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4);
      const depth = body[8], color = body[9], interlace = body[12];
      if (depth !== 8 || (color !== 2 && color !== 6) || interlace !== 0) throw new Error(`PNG no admitido (profundidad ${depth}, color ${color}, entrelazado ${interlace})`);
      channels = color === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(body);
    at += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = new Uint8Array(width * height * 4);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Uint8Array.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0, b = prev[i], c = i >= channels ? prev[i - channels] : 0;
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      else if (filter !== 0) throw new Error('filtro PNG desconocido: ' + filter);
      line[i] = (line[i] + add) & 255;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4, i = x * channels;
      out[o] = line[i]; out[o + 1] = line[i + 1]; out[o + 2] = line[i + 2]; out[o + 3] = channels === 4 ? line[i + 3] : 255;
    }
    prev = line;
  }
  return { width, height, data: out };
}

export function encodePng(width, height, rgba) {
  const chunk = (type, body) => {
    const head = Buffer.alloc(8); head.writeUInt32BE(body.length, 0); head.write(type, 4, 'latin1');
    const tail = Buffer.alloc(4); tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])) >>> 0, 0);
    return Buffer.concat([head, body, tail]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  return Buffer.concat([SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/**
 * Diferencia píxel a píxel de dos PNG del mismo tamaño.
 * @returns {{ pixels: number, total: number, maxDelta: number, image: Buffer | null }}
 * `image`: la referencia atenuada con los píxeles distintos en magenta.
 */
export function diffPng(refBuf, otherBuf) {
  const a = decodePng(refBuf), b = decodePng(otherBuf);
  if (a.width !== b.width || a.height !== b.height) return { pixels: -1, total: a.width * a.height, maxDelta: 255, image: null };
  const total = a.width * a.height, out = new Uint8Array(total * 4);
  let pixels = 0, maxDelta = 0;
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const d = Math.max(Math.abs(a.data[o] - b.data[o]), Math.abs(a.data[o + 1] - b.data[o + 1]), Math.abs(a.data[o + 2] - b.data[o + 2]), Math.abs(a.data[o + 3] - b.data[o + 3]));
    if (d) { pixels++; if (d > maxDelta) maxDelta = d; out[o] = 255; out[o + 1] = 0; out[o + 2] = 255; }
    else { const g = (a.data[o] + a.data[o + 1] + a.data[o + 2]) / 6; out[o] = out[o + 1] = out[o + 2] = g; }
    out[o + 3] = 255;
  }
  return { pixels, total, maxDelta, image: pixels ? encodePng(a.width, a.height, out) : null };
}
