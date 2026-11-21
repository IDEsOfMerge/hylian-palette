#!/usr/bin/env node
'use strict';

// Dev-only tool: prints the era-grouped color-swatch catalog table for
// README.md, reading directly from palettes/*.js so it can never drift from
// the actual shipped colors. Run with:
//   node scripts/generate-readme-catalog.js
// then place the output into README.md between the CATALOG markers.

const fs = require('fs');
const path = require('path');

const ERAS = [
  { title: '8-bit & 16-bit Classics', games: ['The Legend of Zelda', 'Zelda II: The Adventure of Link', 'A Link to the Past'] },
  { title: 'Handheld (Game Boy / Color / Advance)', games: ["Link's Awakening", 'Oracle of Seasons', 'Oracle of Ages', 'The Minish Cap'] },
  { title: 'N64 & GameCube', games: ['Ocarina of Time', "Majora's Mask", 'The Wind Waker', 'Twilight Princess'] },
  { title: 'Nintendo DS', games: ['Phantom Hourglass', 'Spirit Tracks'] },
  { title: 'Modern (Wii / 3DS / Switch)', games: ['Skyward Sword', 'A Link Between Worlds', 'Breath of the Wild', 'Tears of the Kingdom', 'Echoes of Wisdom'] },
];

function loadPalettes() {
  const dir = path.join(__dirname, '..', 'palettes');
  const byGame = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const p = require(path.join(dir, f));
    byGame[p.game] = byGame[p.game] || {};
    byGame[p.game][p.tokens.mode] = p;
    byGame[p.game].year = p.year;
  }
  return byGame;
}

function swatch(hex) {
  return `![](assets/swatches/${hex.replace('#', '').toUpperCase()}.png)`;
}

function strip(t) {
  return [t.bg, t.accentKeyword, t.accentString, t.accentFunction, t.accentType].map(swatch).join(' ');
}

function main() {
  const byGame = loadPalettes();
  let out = '';
  for (const era of ERAS) {
    out += `\n**${era.title}**\n\n`;
    out += `| Game | Light (bg · keyword · string · function · type) | Dark (bg · keyword · string · function · type) |\n`;
    out += `|---|---|---|\n`;
    for (const game of era.games) {
      const entry = byGame[game];
      if (!entry) { console.error('MISSING GAME:', game); continue; }
      const light = entry.light ? strip(entry.light.tokens) : '—';
      const dark = entry.dark ? strip(entry.dark.tokens) : '—';
      out += `| **${game}** (${entry.year}) | ${light} | ${dark} |\n`;
    }
  }
  process.stdout.write(out);
}

main();
