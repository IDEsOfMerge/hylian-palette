#!/usr/bin/env node
'use strict';

// Dev-only tool: exports the color-science-relevant tokens from every
// palette into a flat CSV for analysis/color_science.R and theme_similarity.R,
// enriched with OKLCH coordinates, WCAG 2.1 contrast ratio, and APCA Lc.
// Run with: node scripts/export-color-data.js

const fs = require('fs');
const path = require('path');
const cs = require('./color-science');

const PALETTES_DIR = path.join(__dirname, '..', 'palettes');
const OUT_DIR = path.join(__dirname, '..', 'analysis', 'data');
const OUT_FILE = path.join(OUT_DIR, 'colors.csv');

const CONTEXT_ROLES = ['bg', 'fg'];
const SYNTAX_ROLES = [
  'accentKeyword', 'accentStorage', 'accentString', 'accentRegex',
  'accentFunction', 'accentFunctionDim', 'accentType', 'accentInterface',
  'accentNumber', 'accentDecorator', 'accentNamespace',
  'colorError', 'colorWarning',
];

function csvEscape(value) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function main() {
  const files = fs.readdirSync(PALETTES_DIR).filter((f) => f.endsWith('.js')).sort();
  const rows = [[
    'theme_slug', 'game', 'year', 'mode', 'role', 'role_kind', 'hex',
    'oklch_L', 'oklch_C', 'oklch_h', 'wcag_bg', 'apca_lc',
  ]];

  for (const f of files) {
    const p = require(path.join(PALETTES_DIR, f));
    const t = p.tokens;
    const emitRow = (role, kind) => {
      const hex = t[role].toUpperCase();
      const lch = cs.hexToOklch(hex);
      const wcag = cs.contrastRatio(hex, t.bg);
      const lc = cs.apcaContrast(hex, t.bg);
      rows.push([
        p.slug, p.game, p.year, t.mode, role, kind, hex,
        lch.L.toFixed(4), lch.C.toFixed(4), lch.h.toFixed(2),
        wcag.toFixed(2), lc.toFixed(1),
      ]);
    };
    for (const role of CONTEXT_ROLES) emitRow(role, 'context');
    for (const role of SYNTAX_ROLES) emitRow(role, 'syntax');
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n';
  fs.writeFileSync(OUT_FILE, csv);
  console.log(`Wrote ${rows.length - 1} rows to ${path.relative(process.cwd(), OUT_FILE)}`);
}

main();
