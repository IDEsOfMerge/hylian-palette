#!/usr/bin/env node
'use strict';

// Dev-only tool: exports the color-science-relevant tokens from every
// palette into a flat CSV for the R analysis in analysis/color_science.R.
// Restricted to the ~13 roles that actually sit next to each other in real
// syntax-highlighted code and therefore need to be mutually distinguishable
// (plus bg/fg for context) -- not the full ~40-token schema, most of which
// is structural chrome rather than semantically-load-bearing syntax color.
// Run with: node scripts/export-color-data.js

const fs = require('fs');
const path = require('path');

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
  const files = fs.readdirSync(PALETTES_DIR).filter((f) => f.endsWith('.js'));
  const rows = [['theme_slug', 'game', 'year', 'mode', 'role', 'role_kind', 'hex']];

  for (const f of files) {
    const p = require(path.join(PALETTES_DIR, f));
    const t = p.tokens;
    for (const role of CONTEXT_ROLES) {
      rows.push([p.slug, p.game, p.year, t.mode, role, 'context', t[role].toUpperCase()]);
    }
    for (const role of SYNTAX_ROLES) {
      rows.push([p.slug, p.game, p.year, t.mode, role, 'syntax', t[role].toUpperCase()]);
    }
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n';
  fs.writeFileSync(OUT_FILE, csv);
  console.log(`Wrote ${rows.length - 1} rows to ${path.relative(process.cwd(), OUT_FILE)}`);
}

main();
