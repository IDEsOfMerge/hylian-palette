#!/usr/bin/env node
'use strict';

// Dev-only tool: renders tiny solid-color PNG swatches (no dependencies,
// pure Node + zlib) for use in README.md color tables and walkthrough steps,
// since GitHub strips inline CSS from README HTML. Cleans stale swatch PNGs
// first so unused hexes never bloat the packaged VSIX.
// Run with: node scripts/generate-swatches.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'swatches');
const WIDTH = 32;
const HEIGHT = 20;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makeSwatchPng(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(WIDTH, 0);
  ihdrData.writeUInt32BE(HEIGHT, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: truecolor RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = chunk('IHDR', ihdrData);

  const rowBytes = 1 + WIDTH * 3;
  const raw = Buffer.alloc(rowBytes * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    const rowStart = y * rowBytes;
    raw[rowStart] = 0; // filter type: None
    for (let x = 0; x < WIDTH; x++) {
      const px = rowStart + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }
  const idat = chunk('IDAT', zlib.deflateSync(raw, { level: 9 }));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function main() {
  const palettesDir = path.join(__dirname, '..', 'palettes');
  const files = fs.readdirSync(palettesDir).filter((f) => f.endsWith('.js')).sort();
  const hexes = new Set();

  for (const f of files) {
    const p = require(path.join(palettesDir, f));
    const t = p.tokens;
    for (const key of [
      'bg', 'fg', 'accentKeyword', 'accentStorage', 'accentString',
      'accentFunction', 'accentType', 'accentNumber', 'accentDecorator',
      'accentCursor', 'accentFocus',
    ]) {
      hexes.add(t[key].toUpperCase());
    }
  }

  if (fs.existsSync(OUT_DIR)) {
    for (const existing of fs.readdirSync(OUT_DIR)) {
      if (existing.endsWith('.png')) {
        fs.unlinkSync(path.join(OUT_DIR, existing));
      }
    }
  } else {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let count = 0;
  for (const hex of [...hexes].sort()) {
    const clean = hex.replace('#', '');
    fs.writeFileSync(path.join(OUT_DIR, `${clean}.png`), makeSwatchPng(hex));
    count++;
  }
  console.log(`Generated ${count} unique swatch PNGs in ${path.relative(process.cwd(), OUT_DIR)}`);
}

main();
