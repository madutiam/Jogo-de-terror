// gato-fiel.js
// Pixel art original inspirado no sorriso do gato Cheshire.
// Grade nativa 140x76, exportada tambem em 6x (840x456) nearest neighbor.
// Fundo TRANSPARENTE, partes escuras realmente escuras (uso em BLEND ADD).
// Sem dependencias: encoder PNG escrito a mao (IHDR/IDAT/IEND + CRC32 + zlib).

const fs = require('fs');
const zlib = require('zlib');

const DIR = 'C:/Users/Bedetti/AppData/Local/Temp/claude/C--Users-Bedetti-Documents-ms-pickles-Alice-terror/aed9ee1e-7388-473a-9300-d2f80258b7af/scratchpad';
const W = 140, H = 76, SCALE = 6;

/* ------------------------------------------------------------------ */
/* PNG encoder                                                         */
/* ------------------------------------------------------------------ */
let _crcT = null;
function crcTable() {
  if (_crcT) return _crcT;
  _crcT = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n >>> 0;
    for (let k = 0; k < 8; k++) c = (c & 1) ? ((0xEDB88320 ^ (c >>> 1)) >>> 0) : (c >>> 1);
    _crcT[n] = c >>> 0;
  }
  return _crcT;
}
function crc32(buf) {
  const t = crcTable();
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = (t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)) >>> 0;
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace
  const stride = w * 4;
  const raw = Buffer.alloc(h * (1 + stride));
  for (let y = 0; y < h; y++) {
    const o = y * (1 + stride);
    raw[o] = 0; // filtro 0 (None)
    for (let i = 0; i < stride; i++) raw[o + 1 + i] = rgba[y * stride + i];
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}
function upscale(src, w, h, s) {
  const dw = w * s, dh = h * s;
  const d = new Uint8Array(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    const sy = (y / s) | 0;
    for (let x = 0; x < dw; x++) {
      const sx = (x / s) | 0;
      const si = (sy * w + sx) * 4, di = (y * dw + x) * 4;
      d[di] = src[si]; d[di + 1] = src[si + 1]; d[di + 2] = src[si + 2]; d[di + 3] = src[si + 3];
    }
  }
  return d;
}

/* ------------------------------------------------------------------ */
/* buffer + paleta                                                     */
/* ------------------------------------------------------------------ */
const px = new Uint8Array(W * H * 4); // tudo zero = transparente

function hex(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function put(x, y, c) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
}
function alphaAt(x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return 0;
  return px[(y * W + x) * 4 + 3];
}
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);

// rampa dos dentes: osso sujo, do quase-preto ao osso claro
const T = ['#0b0a09', '#171512', '#26221c', '#372f27', '#4a4136', '#5f5445', '#786b57', '#928469', '#ada08a'].map(hex);
// rampa do olho: verde-azulado, unico ponto de cor
const E = ['#06100f', '#0b201e', '#103430', '#155048', '#1b6f63', '#248c7d', '#31a894', '#45c0aa', '#5fd4bc'].map(hex);
// gengiva / linha de labio: sangue seco
const G = ['#0d0706', '#160b09', '#22110e', '#301813'].map(hex);
const PUPIL = hex('#04090a');
const GLINT = hex('#b8f0e4');
const GLINT2 = hex('#7fdfcd');

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const bay = (x, y) => (BAYER[((y % 4) + 4) % 4][((x % 4) + 4) % 4] + 0.5) / 16;

function ramp(r, v, x, y, dither) {
  const n = r.length - 1;
  let f = clamp(v, 0, 1) * n;
  let i = dither ? Math.floor(f + bay(x, y) - 0.5 + 0.5) : Math.round(f);
  return r[clamp(i, 0, n)];
}
function rnd(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/* ------------------------------------------------------------------ */
/* geometria da boca                                                   */
/* ------------------------------------------------------------------ */
const CX = 70;        // centro horizontal da boca
const HALFW = 56;     // meia largura -> boca de x=14 a x=126
const Y_TOP_C = 43.5; // topo dos dentes no centro
const TOP_LIFT = 6.5; // quanto os cantos sobem
const THICK_C = 17.5; // altura da faixa de dentes no centro

// mapeia u em [-1,1] para x, comprimindo os dentes perto das pontas
function mouthX(u) {
  return CX + HALFW * (0.6 * u + 0.4 * Math.sin(u * Math.PI / 2));
}
function tAt(x) { return clamp((x - CX) / HALFW, -1, 1); }
function yTopAt(x) { const t = tAt(x); return Y_TOP_C - TOP_LIFT * t * t; }
function thickAt(x) {
  const t = tAt(x);
  const k = Math.max(0, 1 - t * t);
  return THICK_C * Math.pow(k, 0.62);
}
// queda de luz global: mais claro um pouco a esquerda do centro (como na referencia)
function gf(x) {
  const d = (x - 66) / 66;
  return clamp(1 - 0.72 * d * d, 0.05, 1);
}

/* ------------------------------------------------------------------ */
/* gengiva (linha escura acima dos dentes)                             */
/* ------------------------------------------------------------------ */
for (let x = 13; x <= 127; x++) {
  const xc = x + 0.5;
  if (thickAt(xc) < 1.2) continue;
  const yt = yTopAt(xc);
  const g = gf(xc);
  for (let k = 1; k <= 3; k++) {
    const y = Math.floor(yt) - k;
    const v = g * (k === 1 ? 1.0 : k === 2 ? 0.62 : 0.3);
    put(x, y, ramp(G, v, x, y, true));
  }
}

/* ------------------------------------------------------------------ */
/* corpo escuro da boca: mantem o crescente inteiro em vez de um pente  */
/* ------------------------------------------------------------------ */
for (let x = 13; x <= 127; x++) {
  const xc = x + 0.5;
  const th = thickAt(xc);
  if (th < 0.8) continue;
  const yt = yTopAt(xc), yb = yt + th;
  for (let y = Math.floor(yt); y <= Math.ceil(yb); y++) {
    const yc = y + 0.5;
    if (yc < yt - 0.6 || yc > yb) continue;
    const f = clamp((yc - yt) / th, 0, 1);
    const v = gf(xc) * (0.22 - 0.18 * f);
    put(x, y, ramp(T, v, x, y, true));
  }
}

/* ------------------------------------------------------------------ */
/* dentes                                                              */
/* ------------------------------------------------------------------ */
const N = 25;
const TEETH_GAIN = 0.76;

function toothColumnGeom(i, offset) {
  const u0 = -1 + 2 * (i + offset) / N;
  const u1 = -1 + 2 * (i + 1 + offset) / N;
  const x0 = mouthX(clamp(u0, -1, 1));
  const x1 = mouthX(clamp(u1, -1, 1));
  return { x0, x1, c: (x0 + x1) / 2, half: (x1 - x0) / 2 };
}

// --- dentes de cima: base no topo, ponta para baixo
for (let i = 0; i < N; i++) {
  const g0 = toothColumnGeom(i, 0);
  if (g0.half <= 0.35) continue;
  const r = rnd(i * 3.7 + 1.3);
  const r2 = rnd(i * 9.1 + 5.7);
  const tipFrac = 0.42 + 0.30 * r;         // dentes de comprimentos irregulares
  const bright = 0.86 + 0.26 * r2;
  const gap = g0.half * 0.24 + 0.14;

  for (let x = Math.floor(g0.x0); x <= Math.ceil(g0.x1); x++) {
    const xc = x + 0.5;
    const th = thickAt(xc);
    if (th < 1.0) continue;
    const yt = yTopAt(xc);
    const len = Math.max(1.6, th * tipFrac);
    const hwMax = g0.half - gap;
    if (hwMax <= 0.05) continue;
    for (let y = Math.floor(yt); y <= Math.ceil(yt + len); y++) {
      const yc = y + 0.5;
      const s = (yc - yt) / len;
      if (s < -0.02 || s > 1) continue;
      const ss = clamp(s, 0, 1);
      const hw = hwMax * (1 - Math.pow(ss, 2.3));  // fica largo e so entao aponta
      const dx = xc - g0.c;
      if (Math.abs(dx) > Math.max(hw, 0.34)) continue;
      const q = clamp(dx / Math.max(hw, 0.5), -1, 1);
      let v = TEETH_GAIN * gf(xc) * bright;
      v *= (1 - 0.40 * Math.pow(ss, 1.2));        // escurece um pouco para a ponta
      v *= (1 - 0.26 * q * q - 0.09 * q);         // lado esquerdo do dente pega mais luz
      if (yc - yt < 1.2) v *= 1.12;               // brilho na linha da gengiva
      put(x, y, ramp(T, v, x, y, false));
    }
  }
}

// --- dentes de baixo: base embaixo, ponta para cima, meio passo deslocados
for (let i = -1; i < N; i++) {
  const g0 = toothColumnGeom(i, 0.5);
  if (g0.half <= 0.35) continue;
  const r = rnd(i * 5.3 + 21.7);
  const r2 = rnd(i * 2.9 + 41.1);
  const tipFrac = 0.36 + 0.26 * r;
  const ybOff = (rnd(i * 7.3 + 3.1) - 0.62) * 1.7;   // borda de baixo levemente irregular
  const bright = 0.84 + 0.26 * r2;
  const gap = g0.half * 0.24 + 0.14;

  for (let x = Math.floor(g0.x0); x <= Math.ceil(g0.x1); x++) {
    const xc = x + 0.5;
    const th = thickAt(xc);
    if (th < 1.6) continue;
    const yb = yTopAt(xc) + th + ybOff;
    const len = Math.max(1.6, th * tipFrac);
    const hwMax = g0.half - gap;
    if (hwMax <= 0.05) continue;
    for (let y = Math.floor(yb - len); y <= Math.ceil(yb); y++) {
      const yc = y + 0.5;
      const s = (yb - yc) / len;   // 0 na base, 1 na ponta
      if (s < 0 || s > 1) continue;
      const hw = hwMax * (1 - Math.pow(s, 2.9));
      const dx = xc - g0.c;
      if (Math.abs(dx) > Math.max(hw, 0.34)) continue;
      const q = clamp(dx / Math.max(hw, 0.5), -1, 1);
      let v = TEETH_GAIN * gf(xc) * bright * 0.94;
      v *= (0.80 + 0.26 * s);                     // ponta de baixo pega a luz
      v *= (1 - 0.24 * q * q - 0.08 * q);
      if (yb - yc < 0.9) v *= 0.72;               // sombra do labio inferior
      put(x, y, ramp(T, v, x, y, false));
    }
  }
}

/* ------------------------------------------------------------------ */
/* olhos                                                               */
/* ------------------------------------------------------------------ */
function drawEye(ecx, ecy, side, glintLen, gain) {
  const a = 11.4, b = 9.6, p = 1.55;
  const m = -side * 0.13;            // canto externo levemente mais alto
  const R = 18;
  for (let y = Math.floor(ecy - R); y <= Math.ceil(ecy + R); y++) {
    for (let x = Math.floor(ecx - R); x <= Math.ceil(ecx + R); x++) {
      const dx = x + 0.5 - ecx;
      const dy0 = y + 0.5 - ecy;
      const dye = dy0 - m * dx;
      const r = Math.pow(Math.pow(Math.abs(dx) / a, p) + Math.pow(Math.abs(dye) / b, p), 1 / p);

      if (r <= 1.0) {
        // pupila em fenda vertical
        const ph = b * 0.90;
        const pw = 2.25;
        const k = 1 - Math.abs(dye) / ph;
        const half = k > 0 ? pw * Math.pow(k, 0.55) : -1;
        if (half > 0 && Math.abs(dx) <= half) {
          put(x, y, PUPIL);
          continue;
        }
        let v = gain;
        v *= (1 - 0.44 * Math.pow(r, 1.8));                    // borda escurece
        v *= (0.60 + 0.52 * Math.exp(-Math.abs(dx) / 5.0));    // brilho junto da fenda
        v *= (1 - 0.30 * Math.max(0, -dye / b));               // sombra da palpebra
        v *= (1 + 0.09 * Math.max(0, dye / b));
        if (r > 0.90) v *= 0.55;
        if (r > 0.965) v *= 0.5;
        put(x, y, ramp(E, v, x, y, r > 0.6));
      } else if (r < 1.34 && alphaAt(x, y) === 0) {
        // halo fraquissimo, com dither, para o olho parecer emitir luz
        const gl = (1.34 - r) / 0.34;
        const lvl = gl * 1.9 + bay(x, y) - 0.75;
        const idx = Math.floor(lvl);
        if (idx >= 1) put(x, y, E[clamp(idx, 0, 2)]);
      }
    }
  }
  // reflexo: risco vertical claro na parte de cima da fenda
  const gx = Math.round(ecx - 1);
  for (let k = 0; k < glintLen; k++) {
    const y = Math.round(ecy - 5 + k);
    put(gx, y, k === 0 || k === 1 ? GLINT : GLINT2);
  }
}

drawEye(51, 23, -1, 4, 0.88);
drawEye(89, 23, +1, 5, 0.94);

/* ------------------------------------------------------------------ */
/* export                                                              */
/* ------------------------------------------------------------------ */
fs.writeFileSync(DIR + '/gato-fiel-1x.png', encodePNG(W, H, px));
const big = upscale(px, W, H, SCALE);
fs.writeFileSync(DIR + '/gato-fiel-6x.png', encodePNG(W * SCALE, H * SCALE, big));

// preview: simula o uso real no jogo (BLEND ADD, alpha 0.6, sobre fundo quase preto)
(function preview() {
  const BG = [10, 9, 12];
  const A = 0.6;
  const out = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const a = px[i * 4 + 3] / 255;
    for (let ch = 0; ch < 3; ch++) {
      out[i * 4 + ch] = Math.min(255, Math.round(BG[ch] + px[i * 4 + ch] * A * a));
    }
    out[i * 4 + 3] = 255;
  }
  const bigp = upscale(out, W, H, SCALE);
  fs.writeFileSync(DIR + '/gato-fiel-preview-add.png', encodePNG(W * SCALE, H * SCALE, bigp));
})();

// preview 2: sobre fundo branco, so para inspecionar a forma/desenho
(function previewFlat() {
  const out = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const a = px[i * 4 + 3] / 255;
    for (let ch = 0; ch < 3; ch++) {
      out[i * 4 + ch] = Math.round(px[i * 4 + ch] * a + 255 * (1 - a));
    }
    out[i * 4 + 3] = 255;
  }
  const bigp = upscale(out, W, H, SCALE);
  fs.writeFileSync(DIR + '/gato-fiel-preview-flat.png', encodePNG(W * SCALE, H * SCALE, bigp));
})();

console.log('ok', W + 'x' + H, '->', (W * SCALE) + 'x' + (H * SCALE));
