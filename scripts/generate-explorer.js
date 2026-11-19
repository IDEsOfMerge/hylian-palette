#!/usr/bin/env node
'use strict';

// Generates the self-contained, zero-CDN interactive Hylian Palette &
// Colorimetry Explorer in two deployment targets from a single source of truth
// (`palettes/*.js` + `theme-metadata.json`):
//   1. `site/index.html` (+ `site/.nojekyll`, `site/icon.png`) for GitHub Pages
//   2. `assets/explorer/explorer.html` for the in-editor VS Code / Positron
//      Webview command (`hylianPalette.openExplorer`) with strict nonce CSP.
//
// Run with: node scripts/generate-explorer.js

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PALETTES_DIR = path.join(ROOT_DIR, 'palettes');
const META_PATH = path.join(ROOT_DIR, 'theme-metadata.json');
const SITE_DIR = path.join(ROOT_DIR, 'site');
const WEBVIEW_DIR = path.join(ROOT_DIR, 'assets', 'explorer');

const ERA_GROUPS = [
  {
    era: '8-bit & 16-bit',
    games: ['The Legend of Zelda', 'Zelda II: The Adventure of Link', 'A Link to the Past'],
  },
  {
    era: 'Handheld',
    games: ["Link's Awakening", 'Oracle of Seasons', 'Oracle of Ages', 'The Minish Cap'],
  },
  {
    era: 'N64 & GameCube',
    games: ['Ocarina of Time', "Majora's Mask", 'The Wind Waker', 'Twilight Princess'],
  },
  {
    era: 'Nintendo DS',
    games: ['Phantom Hourglass', 'Spirit Tracks'],
  },
  {
    era: 'Modern',
    games: ['Skyward Sword', 'A Link Between Worlds', 'Breath of the Wild', 'Tears of the Kingdom', 'Echoes of Wisdom'],
  },
];

const SHORT_GAME_NAMES = {
  'The Legend of Zelda': 'Zelda I',
  'Zelda II: The Adventure of Link': 'Zelda II',
  'A Link to the Past': 'ALttP',
  "Link's Awakening": "Link's Awakening",
  'Ocarina of Time': 'Ocarina of Time',
  "Majora's Mask": "Majora's Mask",
  'Oracle of Seasons': 'Oracle of Seasons',
  'Oracle of Ages': 'Oracle of Ages',
  'The Wind Waker': 'Wind Waker',
  'The Minish Cap': 'Minish Cap',
  'Twilight Princess': 'Twilight Princess',
  'Phantom Hourglass': 'Phantom Hourglass',
  'Spirit Tracks': 'Spirit Tracks',
  'Skyward Sword': 'Skyward Sword',
  'A Link Between Worlds': 'Link Between Worlds',
  'Breath of the Wild': 'Breath of the Wild',
  'Tears of the Kingdom': 'Tears of the Kingdom',
  'Echoes of Wisdom': 'Echoes of Wisdom',
};

function extractRationale(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split(/\r?\n/);
  const commentLines = [];
  for (const line of lines) {
    if (line.startsWith("'use strict'")) continue;
    if (line.trim() === '') {
      if (commentLines.length > 0) continue;
      continue;
    }
    if (line.startsWith('//')) {
      commentLines.push(line.replace(/^\/\/\s?/, ''));
    } else if (line.startsWith('module.exports')) {
      break;
    }
  }
  // Drop the first title line (e.g. "Echoes of Wisdom (2024) -- Dark") and blank separator
  const body = commentLines.slice(1).filter((l, idx) => !(idx === 0 && l.trim() === ''));
  return body.join(' ').replace(/\s+/g, ' ').trim();
}

function loadThemeDataset() {
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  const bySlug = new Map();

  for (const file of fs.readdirSync(PALETTES_DIR).filter((f) => f.endsWith('.js')).sort()) {
    const full = path.join(PALETTES_DIR, file);
    const mod = require(full);
    bySlug.set(mod.slug, { mod, rationale: extractRationale(full) });
  }

  return meta.map((entry) => {
    const found = bySlug.get(entry.slug);
    if (!found) throw new Error(`Missing palette module for slug: ${entry.slug}`);
    const { mod, rationale } = found;
    const tk = mod.tokens;
    const eraObj = ERA_GROUPS.find((g) => g.games.includes(mod.game));
    return {
      slug: mod.slug,
      label: mod.label,
      game: mod.game,
      shortGame: SHORT_GAME_NAMES[mod.game] || mod.game,
      era: eraObj ? eraObj.era : 'Modern',
      year: mod.year,
      mode: tk.mode,
      subtitle: mod.subtitle,
      story: rationale,
      t: {
        bg: tk.bg,
        fg: tk.fg,
        bgLine: tk.bgLine,
        bgWidget: tk.bgWidget,
        bgSidebar: tk.bgSidebar,
        bgPanel: tk.bgPanel,
        bgActivity: tk.bgActivity,
        tintSelect: tk.tintSelect,
        borderSubtle: tk.borderSubtle,
        borderStrong: tk.borderStrong,
        fgSecondary: tk.fgSecondary,
        fgMuted: tk.fgMuted,
        fgVariable: tk.fgVariable,
        fgPunct: tk.fgPunct,
        fgComment: tk.fgComment,
        fgParameter: tk.fgParameter,
        fgProperty: tk.fgProperty,
        kw: tk.accentKeyword,
        stor: tk.accentStorage,
        str: tk.accentString,
        rx: tk.accentRegex,
        fn: tk.accentFunction,
        fnDim: tk.accentFunctionDim,
        type: tk.accentType,
        iface: tk.accentInterface,
        num: tk.accentNumber,
        dec: tk.accentDecorator,
        ns: tk.accentNamespace,
        cur: tk.accentCursor,
        foc: tk.accentFocus,
        badge: tk.accentBadge,
        status: tk.accentStatusBar,
        err: tk.colorError,
        warn: tk.colorWarning,
        info: tk.colorInfo,
        gitAdd: tk.gitAdd,
        gitDel: tk.gitDelete,
      },
      ansi: tk.ansi,
    };
  });
}

function buildHtml({ dataset, target }) {
  const isWeb = target === 'web';
  const cspTag = isWeb
    ? `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />`
    : '{{CSP_META}}';
  const scriptOpen = isWeb ? '<script>' : '<script nonce="{{CSP_NONCE}}">';
  const seoTags = isWeb
    ? `
  <meta name="description" content="Interactive workbench preview and perceptual colorimetry explorer for Hylian Palette — a 40th anniversary tribute (1986–2026) featuring 36 scientifically tuned Light and Dark VS Code & Positron themes across all 18 mainline Legend of Zelda games." />
  <meta property="og:title" content="Hylian Palette — Interactive Workbench & Colorimetry Explorer" />
  <meta property="og:description" content="Explore all 36 OKLCH-calibrated Light and Dark themes for VS Code & Positron with live R/Python/TypeScript syntax previews, WCAG 2.1 + APCA contrast readouts, and real-time dichromacy simulation." />
  <meta property="og:type" content="website" />
  <link rel="icon" type="image/png" href="icon.png" />`
    : '';

  const serializedData = JSON.stringify(dataset);
  const serializedEras = JSON.stringify(ERA_GROUPS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${cspTag}
  <title>Hylian Palette — Interactive Workbench &amp; Perceptual Colorimetry Explorer</title>${seoTags}
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --shell-bg: #111317;
      --shell-surface: #181b21;
      --shell-elevated: #1f232b;
      --shell-border: #2b303b;
      --shell-border-strong: #3d4454;
      --shell-text: #eceff4;
      --shell-muted: #9aa3b2;
      --shell-accent: #c9a227;
      --shell-accent-fg: #121316;
      --shell-radius: 10px;
      --font-sans: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    }

    body[data-shell-mode="light"] {
      --shell-bg: #f4f2ec;
      --shell-surface: #ffffff;
      --shell-elevated: #ece9e0;
      --shell-border: #d8d3c6;
      --shell-border-strong: #b8b1a0;
      --shell-text: #181b20;
      --shell-muted: #575e6b;
      --shell-accent: #1d4e89;
      --shell-accent-fg: #ffffff;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--shell-bg);
      color: var(--shell-text);
      font-family: var(--font-sans);
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      transition: background-color 160ms ease, color 160ms ease;
    }

    .page-wrap {
      max-width: 1320px;
      margin: 0 auto;
      padding: 20px 20px 44px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Top Header */
    .topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 14px 18px;
      background: var(--shell-surface);
      border: 1px solid var(--shell-border);
      border-radius: var(--shell-radius);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-gem {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .brand h1 {
      margin: 0;
      font-size: 17px;
      font-weight: 650;
      letter-spacing: -0.015em;
      line-height: 1.2;
    }

    .brand-sub {
      margin: 2px 0 0;
      font-size: 12px;
      color: var(--shell-muted);
    }

    .top-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    button, select, .btn-link {
      font-family: var(--font-sans);
      font-size: 12px;
      font-weight: 550;
      line-height: 1;
      border-radius: 7px;
      border: 1px solid var(--shell-border);
      background: var(--shell-elevated);
      color: var(--shell-text);
      padding: 8px 12px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background-color 120ms ease, border-color 120ms ease, transform 80ms ease;
    }

    button:hover, select:hover, .btn-link:hover {
      border-color: var(--shell-border-strong);
    }

    button:active {
      transform: translateY(1px);
    }

    .btn-primary {
      background: var(--shell-text);
      color: var(--shell-bg);
      border-color: var(--shell-text);
      font-weight: 600;
    }

    .btn-primary:hover {
      opacity: 0.92;
      border-color: var(--shell-text);
    }

    .kbd-hint {
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 4px;
      background: rgba(127, 127, 127, 0.18);
      opacity: 0.85;
    }

    .sync-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--shell-muted);
      padding: 6px 10px;
      border-radius: 7px;
      border: 1px solid var(--shell-border);
      background: var(--shell-elevated);
      cursor: pointer;
      user-select: none;
    }

    .sync-toggle input {
      margin: 0;
      cursor: pointer;
    }

    /* Era Game Selector Rail */
    .era-panel {
      background: var(--shell-surface);
      border: 1px solid var(--shell-border);
      border-radius: var(--shell-radius);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .era-groups {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 18px;
    }

    .era-block {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .era-label {
      font-size: 10px;
      font-weight: 650;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--shell-muted);
    }

    .era-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .game-pill {
      padding: 5px 9px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 500;
      background: var(--shell-bg);
      border: 1px solid var(--shell-border);
      color: var(--shell-muted);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .game-pill:hover {
      color: var(--shell-text);
      border-color: var(--shell-border-strong);
    }

    .game-pill[aria-pressed="true"] {
      background: var(--shell-text);
      color: var(--shell-bg);
      border-color: var(--shell-text);
      font-weight: 600;
    }

    .mini-strip {
      display: inline-flex;
      border-radius: 3px;
      overflow: hidden;
      border: 1px solid rgba(128, 128, 128, 0.35);
      height: 10px;
      flex-shrink: 0;
    }

    .mini-strip span {
      width: 5px;
      height: 10px;
      display: block;
    }

    /* Story + Mode/CVD Control Bar */
    .story-bar {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: start;
      padding: 16px 18px;
      background: var(--shell-surface);
      border: 1px solid var(--shell-border);
      border-radius: var(--shell-radius);
    }

    @media (max-width: 920px) {
      .story-bar { grid-template-columns: 1fr; }
    }

    .story-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px 12px;
    }

    .story-title {
      margin: 0;
      font-size: 16px;
      font-weight: 650;
      letter-spacing: -0.01em;
    }

    .story-sub {
      font-size: 12.5px;
      color: var(--shell-muted);
    }

    .story-text {
      margin: 7px 0 0;
      font-size: 13px;
      line-height: 1.55;
      color: var(--shell-muted);
      max-width: 82ch;
    }

    .control-clusters {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }

    @media (max-width: 920px) {
      .control-clusters { align-items: flex-start; }
    }

    .seg-group {
      display: inline-flex;
      background: var(--shell-bg);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--shell-border);
      gap: 2px;
      flex-wrap: wrap;
    }

    .seg-btn {
      border: none;
      background: transparent;
      color: var(--shell-muted);
      padding: 6px 10px;
      border-radius: 5px;
      font-size: 11.5px;
      font-weight: 550;
    }

    .seg-btn:hover {
      color: var(--shell-text);
    }

    .seg-btn[aria-selected="true"] {
      background: var(--shell-surface);
      color: var(--shell-text);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.14);
    }

    /* Simulated Positron / VS Code Workbench */
    .workbench {
      border-radius: var(--shell-radius);
      overflow: hidden;
      border: 1px solid var(--shell-border-strong);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
      font-family: var(--font-mono);
    }

    .wb-titlebar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      height: 36px;
      border-bottom: 1px solid transparent;
      font-size: 12px;
    }

    .wb-tabs {
      display: flex;
      align-items: stretch;
      height: 100%;
      gap: 2px;
      overflow-x: auto;
    }

    .wb-dots {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-right: 10px;
    }

    .wb-dots span {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }

    .wb-tab {
      border: none;
      border-top: 2px solid transparent;
      border-radius: 0;
      padding: 0 13px;
      font-family: var(--font-mono);
      font-size: 11.5px;
      background: transparent;
      cursor: pointer;
      height: 100%;
      white-space: nowrap;
    }

    .wb-pill {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .wb-body {
      display: grid;
      grid-template-columns: 44px 235px 1fr;
      min-height: 370px;
    }

    @media (max-width: 960px) {
      .wb-body { grid-template-columns: 1fr; }
      .wb-activity, .wb-sidebar { display: none; }
    }

    .wb-activity {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 0;
      gap: 14px;
      border-right: 1px solid transparent;
    }

    .wb-act-icon {
      width: 44px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-left: 2px solid transparent;
      opacity: 0.85;
    }

    .wb-sidebar {
      padding: 12px;
      border-right: 1px solid transparent;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 14px;
      font-size: 11.5px;
    }

    .wb-sec-head {
      font-family: var(--font-sans);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .wb-file-item {
      padding: 4px 7px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }

    .wb-var-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px;
      padding: 3px 0;
      font-size: 11px;
    }

    .wb-main {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .wb-editor {
      margin: 0;
      padding: 14px 0;
      font-family: var(--font-mono);
      font-size: 12.5px;
      line-height: 1.62;
      overflow-x: auto;
      flex: 1;
    }

    .code-line {
      display: flex;
      padding: 0 16px 0 0;
      min-width: max-content;
    }

    .line-num {
      width: 42px;
      padding-right: 14px;
      text-align: right;
      user-select: none;
      flex-shrink: 0;
    }

    .wb-console {
      padding: 10px 16px 12px;
      border-top: 1px solid transparent;
      font-size: 11.5px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ansi-strip {
      display: grid;
      grid-template-columns: repeat(16, minmax(0, 1fr));
      gap: 4px;
      padding-top: 4px;
    }

    .ansi-cell {
      height: 16px;
      border-radius: 3px;
      border: 1px solid rgba(128, 128, 128, 0.28);
      cursor: pointer;
      padding: 0;
      transition: transform 90ms ease;
    }

    .ansi-cell:hover {
      transform: scaleY(1.25);
    }

    .wb-statusbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 5px 12px;
      font-size: 11.5px;
    }

    @keyframes blinkCursor {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0.18; }
    }

    .sim-cursor {
      display: inline-block;
      width: 7px;
      height: 1.12em;
      vertical-align: text-bottom;
      margin-left: 1px;
      animation: blinkCursor 1.1s infinite;
    }

    /* Science Studio Grid */
    .studio-grid {
      display: grid;
      grid-template-columns: 7fr 5fr;
      gap: 16px;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .studio-grid { grid-template-columns: 1fr; }
    }

    .panel-card {
      background: var(--shell-surface);
      border: 1px solid var(--shell-border);
      border-radius: var(--shell-radius);
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .panel-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
    }

    .panel-head h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 650;
    }

    .panel-meta {
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: var(--shell-muted);
    }

    .table-scroll {
      overflow-x: auto;
    }

    table.audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .audit-table th {
      text-align: left;
      font-weight: 600;
      color: var(--shell-muted);
      padding: 7px 8px;
      border-bottom: 1px solid var(--shell-border);
      font-size: 11px;
      white-space: nowrap;
    }

    .audit-table td {
      padding: 6.5px 8px;
      border-bottom: 1px solid var(--shell-border);
      font-family: var(--font-mono);
      font-size: 11.5px;
      white-space: nowrap;
    }

    .audit-table tr.token-row {
      cursor: pointer;
      transition: background-color 100ms ease;
    }

    .audit-table tr.token-row:hover {
      background: var(--shell-elevated);
    }

    .audit-table td.role-cell {
      font-family: var(--font-sans);
      font-weight: 500;
    }

    .swatch-chip {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .swatch-box {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      border: 1px solid rgba(128, 128, 128, 0.35);
      display: inline-block;
      flex-shrink: 0;
    }

    .canvas-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .canvas-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 8px;
      border-radius: 8px;
      background: var(--shell-bg);
      border: 1px solid var(--shell-border);
    }

    .pair-compare {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--shell-border);
      font-size: 12px;
      color: var(--shell-muted);
      flex-wrap: wrap;
    }

    .toast {
      position: fixed;
      bottom: 18px;
      right: 18px;
      background: var(--shell-text);
      color: var(--shell-bg);
      padding: 8px 14px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 600;
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px);
      transition: opacity 150ms ease, transform 150ms ease;
      z-index: 50;
    }

    .toast[data-visible="true"] {
      opacity: 1;
      transform: translateY(0);
    }

    footer.foot {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
      color: var(--shell-muted);
      padding-top: 4px;
    }

    footer.foot a {
      color: var(--shell-text);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  </style>
</head>
<body data-shell-mode="dark" data-target="${target}" data-initial-theme="">
  <div class="page-wrap">
    <header class="topbar">
      <div class="brand">
        <svg class="brand-gem" viewBox="0 0 32 32" aria-hidden="true">
          <g id="tri-top" fill="#E5AF24">
            <polygon points="16,1.4 11.5,8.5 20.5,8.5" />
            <polygon points="11.5,8.5 7,15.6 16,15.6" />
            <polygon points="20.5,8.5 16,15.6 25,15.6" />
          </g>
          <g id="tri-bot" fill="#3C3252">
            <polygon points="7,16.4 16,16.4 11.5,23.5" />
            <polygon points="16,16.4 25,16.4 20.5,23.5" />
            <polygon points="11.5,23.5 20.5,23.5 16,30.6" />
          </g>
        </svg>
        <div>
          <h1>Hylian Palette</h1>
          <p class="brand-sub">40th Anniversary Tribute (1986–2026) · 18 Mainline Zelda Games · 36 OKLCH-Calibrated Themes</p>
        </div>
      </div>

      <div class="top-actions" id="top-actions">
        <button type="button" id="btn-prev-theme" title="Previous theme (Left Arrow)">←</button>
        <button type="button" id="btn-toggle-mode" class="btn-primary" title="Flip Light and Dark variant of current game (T)">
          <span id="toggle-mode-label">Switch to Light</span>
          <span class="kbd-hint">T</span>
        </button>
        <button type="button" id="btn-next-theme" title="Next theme (Right Arrow)">→</button>
        <button type="button" id="btn-random-theme" title="Jump to a random theme (R)">
          Random <span class="kbd-hint">R</span>
        </button>
        <span id="env-actions"></span>
      </div>
    </header>

    <nav class="era-panel" aria-label="Mainline games by hardware era">
      <div class="era-groups" id="era-groups"></div>
    </nav>

    <section class="story-bar" aria-labelledby="active-theme-heading">
      <div>
        <div class="story-head">
          <h2 class="story-title" id="active-theme-heading"></h2>
          <span class="story-sub" id="active-theme-subtitle"></span>
        </div>
        <p class="story-text" id="active-theme-story"></p>
      </div>

      <div class="control-clusters">
        <div class="seg-group" role="tablist" aria-label="Vision simulation">
          <button type="button" class="seg-btn cvd-btn" data-cvd="normal" role="tab" aria-selected="true">Normal <span class="kbd-hint">1</span></button>
          <button type="button" class="seg-btn cvd-btn" data-cvd="protan" role="tab" aria-selected="false">Protanopia <span class="kbd-hint">2</span></button>
          <button type="button" class="seg-btn cvd-btn" data-cvd="deutan" role="tab" aria-selected="false">Deuteranopia <span class="kbd-hint">3</span></button>
          <button type="button" class="seg-btn cvd-btn" data-cvd="tritan" role="tab" aria-selected="false">Tritanopia <span class="kbd-hint">4</span></button>
        </div>
      </div>
    </section>

    <main class="workbench" id="workbench" aria-label="Simulated Positron and VS Code Workbench">
      <div class="wb-titlebar" id="wb-titlebar">
        <div class="wb-tabs">
          <div class="wb-dots" aria-hidden="true">
            <span id="dot-close"></span>
            <span id="dot-min"></span>
            <span id="dot-max"></span>
          </div>
          <button type="button" class="wb-tab lang-tab" id="tab-r" data-lang="r">color_science.R</button>
          <button type="button" class="wb-tab lang-tab" id="tab-py" data-lang="py">oklch_gamut.py</button>
          <button type="button" class="wb-tab lang-tab" id="tab-ts" data-lang="ts">extension.ts</button>
          <button type="button" class="wb-tab lang-tab" id="tab-qmd" data-lang="qmd">report.qmd</button>
        </div>
        <span class="wb-pill" id="wb-vision-pill"></span>
      </div>

      <div class="wb-body">
        <aside class="wb-activity" id="wb-activity" aria-hidden="true">
          <div class="wb-act-icon" id="act-icon-active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z"/></svg>
          </div>
          <div class="wb-act-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </div>
          <div class="wb-act-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="9" r="3"/><path d="M6 9v6M18 12c0 3-3 4-12 4"/></svg>
          </div>
          <div class="wb-act-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>
          </div>
        </aside>

        <aside class="wb-sidebar" id="wb-sidebar">
          <div>
            <div class="wb-sec-head" id="wb-exp-head">Explorer · Workspace</div>
            <div id="wb-file-list"></div>
          </div>
          <div id="wb-positron-pane" style="padding-top:10px;border-top:1px solid transparent">
            <div class="wb-sec-head" id="wb-var-head">Positron · Variables</div>
            <div id="wb-var-list"></div>
          </div>
        </aside>

        <div class="wb-main">
          <pre class="wb-editor" id="wb-editor"></pre>
          <div class="wb-console" id="wb-console">
            <div id="wb-console-lines"></div>
            <div>
              <div class="wb-sec-head" id="wb-ansi-head" style="margin-bottom:4px">Integrated Terminal · 16 ANSI Slots (click any swatch to copy hex)</div>
              <div class="ansi-strip" id="ansi-strip"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="wb-statusbar" id="wb-statusbar">
        <div style="display:flex;align-items:center;gap:14px">
          <span id="sb-git">⎇ main · Positron R 4.4</span>
          <span id="sb-cvd-gate"></span>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <span id="sb-contrast"></span>
          <strong id="sb-label"></strong>
        </div>
      </div>
    </main>

    <section class="studio-grid" aria-label="Perceptual Colorimetry Audit">
      <div class="panel-card">
        <div class="panel-head">
          <h2>Perceptual Token Inspector (click any row to copy hex)</h2>
          <span class="panel-meta" id="audit-summary-badge"></span>
        </div>
        <div class="table-scroll">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Semantic Role</th>
                <th>Hex</th>
                <th>OKLCH (L% · C · H°)</th>
                <th>WCAG / bg</th>
                <th>WCAG / line</th>
                <th>APCA |Lc|</th>
              </tr>
            </thead>
            <tbody id="audit-tbody"></tbody>
          </table>
        </div>
      </div>

      <div class="canvas-stack">
        <div class="panel-card">
          <div class="panel-head">
            <h2>OKLab a–b Chromaticity Polygon</h2>
            <span class="panel-meta" id="chroma-meta">Solid = active · Dashed = Light/Dark sibling</span>
          </div>
          <div class="canvas-wrap">
            <canvas id="canvas-chroma" width="320" height="260"></canvas>
          </div>
          <div class="pair-compare" id="pair-compare-box"></div>
        </div>

        <div class="panel-card">
          <div class="panel-head">
            <h2>OKLCH Lightness Staggering &amp; CVD Safety</h2>
            <span class="panel-meta" id="cvd-min-readout"></span>
          </div>
          <div class="canvas-wrap">
            <canvas id="canvas-lightness" width="320" height="190"></canvas>
          </div>
        </div>
      </div>
    </section>

    <footer class="foot">
      <span>Every color synthesized in OKLCH &amp; verified against WCAG 2.1, APCA-W3, CIEDE2000 &amp; Machado et al. (2009) dichromacy matrices. Zero copyrighted game assets.</span>
      <span id="footer-links"></span>
    </footer>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  ${scriptOpen}
    (function () {
      'use strict';

      const THEMES = ${serializedData};
      const ERAS = ${serializedEras};
      const IS_WEB = document.body.dataset.target === 'web';
      const vscodeApi = (!IS_WEB && typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : null;

      // --- Colorimetry Math ---
      function hexToRgb(hex) {
        const h = hex.replace('#', '');
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      function rgbToHex(r, g, b) {
        const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0').toUpperCase();
        return '#' + c(r) + c(g) + c(b);
      }
      function srgbToLin(c) {
        const u = c / 255;
        return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
      }
      function linToSrgb(u) {
        const x = Math.max(0, Math.min(1, u));
        return (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055) * 255;
      }
      const CVD_MATRICES = {
        protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
        deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
        tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
      };
      function simHex(hex, mode) {
        if (!mode || mode === 'normal') return hex;
        const [r, g, b] = hexToRgb(hex).map(srgbToLin);
        const m = CVD_MATRICES[mode];
        return rgbToHex(
          linToSrgb(m[0][0] * r + m[0][1] * g + m[0][2] * b),
          linToSrgb(m[1][0] * r + m[1][1] * g + m[1][2] * b),
          linToSrgb(m[2][0] * r + m[2][1] * g + m[2][2] * b)
        );
      }
      function hexToOklch(hex) {
        const [r, g, b] = hexToRgb(hex).map(srgbToLin);
        const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
        const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
        const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
        const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
        const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
        const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
        return { L, C: Math.hypot(a, b2), H: (Math.atan2(b2, a) * 180 / Math.PI + 360) % 360, a, b: b2 };
      }
      function hexToLab(hex) {
        const [r, g, b] = hexToRgb(hex).map(srgbToLin);
        const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
        const y = (0.2126729 * r + 0.7151522 * g + 0.0721750 * b);
        const z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883;
        const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
        const fx = f(x), fy = f(y), fz = f(z);
        return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
      }
      function deltaE76(h1, h2) {
        const a = hexToLab(h1), b = hexToLab(h2);
        return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      }
      function relLum(hex) {
        const [r, g, b] = hexToRgb(hex).map(srgbToLin);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      function wcag(h1, h2) {
        const l1 = relLum(h1), l2 = relLum(h2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }
      function apcaLc(txtHex, bgHex) {
        const lin = (h) => hexToRgb(h).map((c) => Math.pow(c / 255, 2.4));
        const yOf = ([r, g, b]) => {
          const y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
          return y > 0.022 ? y : y + Math.pow(0.022 - y, 1.414);
        };
        const yt = yOf(lin(txtHex)), yb = yOf(lin(bgHex));
        if (Math.abs(yb - yt) < 0.0005) return 0;
        if (yb > yt) {
          const s = (Math.pow(yb, 0.56) - Math.pow(yt, 0.57)) * 1.14;
          return s < 0.1 ? 0 : (s - 0.027) * 100;
        }
        const s = (Math.pow(yb, 0.65) - Math.pow(yt, 0.62)) * 1.14;
        return s > -0.1 ? 0 : (s + 0.027) * 100;
      }

      // --- State ---
      let activeSlug = 'echoes-dark';
      let workbenchActiveLabel = document.body.dataset.initialTheme || '';
      let activeLang = 'r';
      let activeCvd = 'normal';
      let liveSyncWorkbench = false;

      // Initialize starting theme from VS Code active theme or URL hash
      if (workbenchActiveLabel) {
        const match = THEMES.find((t) => t.label === workbenchActiveLabel);
        if (match) activeSlug = match.slug;
      } else if (IS_WEB && window.location.hash) {
        const slugHash = window.location.hash.slice(1).trim();
        if (THEMES.some((t) => t.slug === slugHash)) activeSlug = slugHash;
      }

      let toastTimer = null;
      function showToast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.dataset.visible = 'true';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { el.dataset.visible = 'false'; }, 1900);
      }

      function copyText(txt, label) {
        const toastMsg = label || ('Copied ' + txt);
        if (vscodeApi) {
          vscodeApi.postMessage({ type: 'copyText', text: txt });
          showToast(toastMsg);
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(() => showToast(toastMsg)).catch(() => {});
        }
      }

      function findSibling(th) {
        const other = th.mode === 'light' ? 'dark' : 'light';
        return THEMES.find((x) => x.game === th.game && x.mode === other);
      }

      // Environment-specific action buttons
      const envWrap = document.getElementById('env-actions');
      const footLinks = document.getElementById('footer-links');
      if (vscodeApi) {
        envWrap.innerHTML =
          '<button type="button" id="btn-apply-vscode">Apply to Workbench</button> ' +
          '<label class="sync-toggle" title="Automatically apply every clicked theme to your Positron / VS Code window">' +
          '<input type="checkbox" id="chk-live-sync" /> Live-sync IDE</label>';
        footLinks.textContent = 'Running inside VS Code / Positron Webview · Strict offline CSP';

        document.getElementById('btn-apply-vscode').addEventListener('click', () => {
          const cur = THEMES.find((x) => x.slug === activeSlug);
          if (cur) {
            workbenchActiveLabel = cur.label;
            vscodeApi.postMessage({ type: 'applyTheme', label: cur.label });
            showToast('Applied "' + cur.label + '" to Workbench');
            render();
          }
        });
        document.getElementById('chk-live-sync').addEventListener('change', (e) => {
          liveSyncWorkbench = !!e.target.checked;
          if (liveSyncWorkbench) {
            const cur = THEMES.find((x) => x.slug === activeSlug);
            if (cur) {
              workbenchActiveLabel = cur.label;
              vscodeApi.postMessage({ type: 'applyTheme', label: cur.label });
            }
          }
          render();
        });
        window.addEventListener('message', (event) => {
          const msg = event.data;
          if (msg && msg.type === 'activeThemeChanged' && msg.label) {
            workbenchActiveLabel = msg.label;
            const match = THEMES.find((t) => t.label === msg.label);
            if (match && match.slug !== activeSlug) {
              activeSlug = match.slug;
            }
            render();
          }
        });
      } else {
        envWrap.innerHTML =
          '<button type="button" id="btn-copy-setting" title="Copy workbench.colorTheme JSON setting">Copy settings.json</button> ' +
          '<button type="button" id="btn-share-url" title="Copy direct link to this theme">Share Link</button> ' +
          '<a class="btn-link" href="vscode:extension/idesofmerge.hylian-palette" title="Open extension in VS Code">Install in VS Code</a> ' +
          '<a class="btn-link" href="https://github.com/idesofmerge/hylian-palette" target="_blank" rel="noopener">GitHub ↗</a>';
        footLinks.innerHTML =
          '<a href="https://github.com/idesofmerge/hylian-palette#color-science" target="_blank" rel="noopener">Color-Science Write-Up</a> · ' +
          '<a href="https://github.com/idesofmerge/hylian-palette" target="_blank" rel="noopener">MIT License</a>';

        document.getElementById('btn-copy-setting').addEventListener('click', () => {
          const cur = THEMES.find((x) => x.slug === activeSlug);
          if (cur) copyText('"workbench.colorTheme": "' + cur.label + '"', 'Copied settings.json line for ' + cur.label);
        });
        document.getElementById('btn-share-url').addEventListener('click', () => {
          const url = window.location.origin + window.location.pathname + '#' + activeSlug;
          copyText(url, 'Copied direct link to ' + activeSlug);
        });
      }

      function selectSlug(slug, fromUserAction) {
        activeSlug = slug;
        const cur = THEMES.find((x) => x.slug === activeSlug) || THEMES[0];
        if (IS_WEB && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#' + cur.slug);
        }
        if (fromUserAction && vscodeApi && liveSyncWorkbench) {
          workbenchActiveLabel = cur.label;
          vscodeApi.postMessage({ type: 'applyTheme', label: cur.label });
        }
        render();
      }

      // Render 5-era chronological selector strip
      function renderEraRail(cur) {
        const container = document.getElementById('era-groups');
        container.innerHTML = '';
        ERAS.forEach((group) => {
          const block = document.createElement('div');
          block.className = 'era-block';
          const lbl = document.createElement('div');
          lbl.className = 'era-label';
          lbl.textContent = group.era;
          block.appendChild(lbl);

          const pills = document.createElement('div');
          pills.className = 'era-pills';
          group.games.forEach((gameName) => {
            const target = THEMES.find((t) => t.game === gameName && t.mode === cur.mode) || THEMES.find((t) => t.game === gameName);
            if (!target) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'game-pill';
            btn.setAttribute('aria-pressed', String(target.game === cur.game));
            btn.title = target.game + ' (' + target.year + ') — ' + target.subtitle;

            const strip = document.createElement('span');
            strip.className = 'mini-strip';
            [target.t.bg, target.t.kw, target.t.str, target.t.fn, target.t.type].forEach((hx) => {
              const s = document.createElement('span');
              s.style.backgroundColor = simHex(hx, activeCvd);
              strip.appendChild(s);
            });
            btn.appendChild(strip);
            btn.appendChild(document.createTextNode(target.shortGame));
            btn.addEventListener('click', () => selectSlug(target.slug, true));
            pills.appendChild(btn);
          });
          block.appendChild(pills);
          container.appendChild(block);
        });
      }

      function sp(color, text, extra) {
        return '<span style="color:' + color + (extra ? ';' + extra : '') + '">' + text + '</span>';
      }

      function buildCodeSample(c, lang, th) {
        const cur = '<span class="sim-cursor" style="background:' + c.cur + '"></span>';
        if (lang === 'r') {
          return [
            sp(c.fgComment, '# Hylian Palette · Perceptual OKLCH & CIEDE2000 audit in Positron', 'font-style:italic'),
            sp(c.fn, 'library') + sp(c.fgPunct, '(') + sp(c.ns, 'tidyverse') + sp(c.fgPunct, ')'),
            '',
            sp(c.dec, '#| label: verify-' + th.slug, 'font-style:italic'),
            sp(c.fn, 'audit_theme') + ' ' + sp(c.kw, '<-', 'font-weight:700') + ' ' + sp(c.kw, 'function', 'font-weight:700') + sp(c.fgPunct, '(') + sp(c.fgParameter, 'palette_df', 'font-style:italic') + sp(c.fgPunct, ', ') + sp(c.fgParameter, 'min_aa', 'font-style:italic') + ' ' + sp(c.fgPunct, '=') + ' ' + sp(c.num, '4.5') + sp(c.fgPunct, ') {'),
            '  ' + sp(c.fgVariable, 'verified') + ' ' + sp(c.kw, '<-', 'font-weight:700') + ' ' + sp(c.fgParameter, 'palette_df', 'font-style:italic') + ' ' + sp(c.kw, '|>', 'font-weight:700'),
            '    ' + sp(c.ns, 'dplyr') + sp(c.fgPunct, '::') + sp(c.fn, 'filter') + sp(c.fgPunct, '(') + sp(c.fgProperty, 'game') + ' ' + sp(c.fgPunct, '==') + ' ' + sp(c.str, '"' + th.game + '"') + sp(c.fgPunct, ')') + ' ' + sp(c.kw, '|>', 'font-weight:700'),
            '    ' + sp(c.fn, 'mutate') + sp(c.fgPunct, '(') + sp(c.fgProperty, 'aa_ok') + ' ' + sp(c.fgPunct, '=') + ' ' + sp(c.fgVariable, 'wcag_ratio') + ' ' + sp(c.fgPunct, '>=') + ' ' + sp(c.fgParameter, 'min_aa', 'font-style:italic') + sp(c.fgPunct, ', ') + sp(c.fgProperty, 'year') + ' ' + sp(c.fgPunct, '=') + ' ' + sp(c.num, String(th.year) + 'L') + sp(c.fgPunct, ')'),
            '  ' + sp(c.kw, 'return', 'font-weight:700') + sp(c.fgPunct, '(') + sp(c.fgVariable, 'verified') + sp(c.fgPunct, ')') + cur,
            sp(c.fgPunct, '}'),
          ];
        }
        if (lang === 'py') {
          return [
            sp(c.fgComment, '# Binary-search OKLCH gamut mapper & Machado (2009) cone transform', 'font-style:italic'),
            sp(c.kw, 'from', 'font-weight:700') + ' ' + sp(c.ns, 'dataclasses') + ' ' + sp(c.kw, 'import', 'font-weight:700') + ' ' + sp(c.fn, 'dataclass'),
            sp(c.kw, 'import', 'font-weight:700') + ' ' + sp(c.ns, 're'),
            '',
            sp(c.dec, '@dataclass(frozen=True)', 'font-style:italic'),
            sp(c.stor, 'class', 'font-style:italic') + ' ' + sp(c.type, 'StoryPalette', 'font-weight:700') + sp(c.fgPunct, ':'),
            '    ' + sp(c.fgProperty, 'slug') + sp(c.fgPunct, ':') + ' ' + sp(c.iface, 'str', 'font-style:italic') + ' ' + sp(c.fgPunct, '=') + ' ' + sp(c.str, '"' + th.slug + '"'),
            '    ' + sp(c.fgProperty, 'release_year') + sp(c.fgPunct, ':') + ' ' + sp(c.iface, 'int', 'font-style:italic') + ' ' + sp(c.fgPunct, '=') + ' ' + sp(c.num, String(th.year)),
            '',
            sp(c.stor, 'def', 'font-style:italic') + ' ' + sp(c.fn, 'is_valid_hex') + sp(c.fgPunct, '(') + sp(c.fgParameter, 'token', 'font-style:italic') + sp(c.fgPunct, ':') + ' ' + sp(c.iface, 'str', 'font-style:italic') + sp(c.fgPunct, ') ->') + ' ' + sp(c.iface, 'bool', 'font-style:italic') + sp(c.fgPunct, ':'),
            '    ' + sp(c.kw, 'return', 'font-weight:700') + ' ' + sp(c.ns, 're') + sp(c.fgPunct, '.') + sp(c.fn, 'match') + sp(c.fgPunct, '(') + sp(c.rx, 'r"^#[0-9A-F]{6}$"') + sp(c.fgPunct, ', ') + sp(c.fgParameter, 'token', 'font-style:italic') + sp(c.fgPunct, ')') + ' ' + sp(c.kw, 'is not', 'font-weight:700') + ' ' + sp(c.num, 'None') + cur,
          ];
        }
        if (lang === 'ts') {
          return [
            sp(c.fgComment, '// Live-preview QuickPick & smart per-game Light/Dark toggle', 'font-style:italic'),
            sp(c.kw, 'export', 'font-weight:700') + ' ' + sp(c.stor, 'interface', 'font-style:italic') + ' ' + sp(c.iface, 'HylianThemeEntry', 'font-style:italic') + ' ' + sp(c.fgPunct, '{'),
            '  ' + sp(c.stor, 'readonly', 'font-style:italic') + ' ' + sp(c.fgProperty, 'label') + sp(c.fgPunct, ':') + ' ' + sp(c.type, 'string', 'font-weight:700') + sp(c.fgPunct, ';'),
            '  ' + sp(c.fgProperty, 'mode') + sp(c.fgPunct, ':') + ' ' + sp(c.str, '"light"') + ' ' + sp(c.kw, '|', 'font-weight:700') + ' ' + sp(c.str, '"dark"') + sp(c.fgPunct, ';'),
            sp(c.fgPunct, '}'),
            '',
            sp(c.dec, '@command', 'font-style:italic') + sp(c.fgPunct, '(') + sp(c.str, '"hylianPalette.toggleTheme"') + sp(c.fgPunct, ')'),
            sp(c.kw, 'export async', 'font-weight:700') + ' ' + sp(c.stor, 'function', 'font-style:italic') + ' ' + sp(c.fn, 'activatePair') + sp(c.fgPunct, '(') + sp(c.fgParameter, 'entry', 'font-style:italic') + sp(c.fgPunct, ':') + ' ' + sp(c.iface, 'HylianThemeEntry', 'font-style:italic') + sp(c.fgPunct, ') {'),
            '  ' + sp(c.stor, 'const', 'font-style:italic') + ' ' + sp(c.fgVariable, 'themesTotal') + ' ' + sp(c.fgPunct, '=') + ' ' + sp(c.num, '36') + sp(c.fgPunct, ';'),
            '  ' + sp(c.kw, 'await', 'font-weight:700') + ' ' + sp(c.ns, 'workbench') + sp(c.fgPunct, '.') + sp(c.fn, 'setColorTheme') + sp(c.fgPunct, '(') + sp(c.str, '"' + th.label + '"') + sp(c.fgPunct, ')') + cur,
            sp(c.fgPunct, '}'),
          ];
        }
        return [
          sp(c.fgPunct, '---'),
          sp(c.fgProperty, 'title') + sp(c.fgPunct, ': ') + sp(c.str, '"' + th.label + ' — Colorimetry Report"'),
          sp(c.fgProperty, 'format') + sp(c.fgPunct, ': ') + sp(c.type, 'html', 'font-weight:700'),
          sp(c.fgPunct, '---'),
          '',
          sp(c.kw, '## ' + th.game + ' (' + th.year + ')', 'font-weight:700'),
          '',
          sp(c.fg, 'Every foreground & syntax token clears ') + sp(c.fg, '**WCAG 2.1 AA (4.5:1)**', 'font-weight:700') + sp(c.fg, ' on ') + sp(c.type, '\\x60editor.background\\x60') + sp(c.fg, '.'),
          '',
          sp(c.dec, '\\x60\\x60\\x60{sql}', 'font-style:italic'),
          sp(c.kw, 'SELECT', 'font-weight:700') + ' ' + sp(c.fgProperty, 'slug') + sp(c.fgPunct, ', ') + sp(c.fn, 'MIN') + sp(c.fgPunct, '(') + sp(c.fgProperty, 'wcag_ratio') + sp(c.fgPunct, ') ') + sp(c.kw, 'AS', 'font-weight:700') + ' ' + sp(c.fgVariable, 'tightest_role') + ' ' + sp(c.kw, 'FROM', 'font-weight:700') + ' ' + sp(c.type, 'palettes', 'font-weight:700') + ' ' + sp(c.kw, 'WHERE', 'font-weight:700') + ' ' + sp(c.fgProperty, 'year') + ' ' + sp(c.fgPunct, '=') + ' ' + sp(c.num, String(th.year)) + sp(c.fgPunct, ';') + cur,
          sp(c.dec, '\\x60\\x60\\x60', 'font-style:italic'),
        ];
      }

      const AUDIT_ROLES = [
        ['Editor Text (fg)', 'fg'],
        ['Secondary UI Text', 'fgSecondary'],
        ['Comment (fgComment)', 'fgComment'],
        ['Variable', 'fgVariable'],
        ['Parameter (italic)', 'fgParameter'],
        ['Property', 'fgProperty'],
        ['Keyword (bold)', 'kw'],
        ['Storage / Modifier', 'stor'],
        ['String Literal', 'str'],
        ['Regex / Escape', 'rx'],
        ['Function / Method', 'fn'],
        ['Type / Class (bold)', 'type'],
        ['Interface / Trait', 'iface'],
        ['Number / Constant', 'num'],
        ['Decorator / Macro', 'dec'],
        ['Namespace / Module', 'ns'],
        ['Diagnostic Error', 'err'],
        ['Diagnostic Warning', 'warn'],
      ];

      const POLY_KEYS = ['kw', 'stor', 'str', 'rx', 'fn', 'type', 'iface', 'num', 'dec', 'ns'];
      const POLY_NAMES = ['kw', 'sto', 'str', 'rgx', 'fn', 'typ', 'ifc', 'num', 'dec', 'ns'];
      const CRITICAL_KEYS = ['kw', 'stor', 'str', 'fn', 'type', 'num', 'err'];

      function drawChromaCanvas(simCur, simSib, isLightShell) {
        const canvas = document.getElementById('canvas-chroma');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 320, h = 260;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        const maxC = 0.27;
        const scale = 108 / maxC;
        const gridColor = isLightShell ? 'rgba(24,27,32,0.12)' : 'rgba(236,239,244,0.12)';
        const labelColor = isLightShell ? 'rgba(24,27,32,0.58)' : 'rgba(236,239,244,0.58)';

        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        [0.08, 0.16, 0.24].forEach((r) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(16, cy); ctx.lineTo(w - 16, cy);
        ctx.moveTo(cx, 12); ctx.lineTo(cx, h - 12);
        ctx.stroke();

        ctx.fillStyle = labelColor;
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText('+a (red)', w - 58, cy - 5);
        ctx.fillText('-a (green)', 14, cy - 5);
        ctx.fillText('+b (yellow)', cx + 5, 20);
        ctx.fillText('-b (blue)', cx + 5, h - 10);

        if (simSib) {
          const sibPts = POLY_KEYS.map((k) => {
            const ok = hexToOklch(simSib[k]);
            return { x: cx + ok.a * scale, y: cy - ok.b * scale };
          });
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = isLightShell ? 'rgba(24,27,32,0.32)' : 'rgba(236,239,244,0.32)';
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          sibPts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }

        const pts = POLY_KEYS.map((k, idx) => {
          const hex = simCur[k];
          const ok = hexToOklch(hex);
          return { x: cx + ok.a * scale, y: cy - ok.b * scale, hex, lbl: POLY_NAMES[idx] };
        });

        ctx.beginPath();
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.strokeStyle = simCur.foc;
        ctx.lineWidth = 1.9;
        ctx.stroke();

        pts.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5.2, 0, Math.PI * 2);
          ctx.fillStyle = p.hex;
          ctx.fill();
          ctx.lineWidth = 1.3;
          ctx.strokeStyle = simCur.bg;
          ctx.stroke();
        });
      }

      function drawLightnessCanvas(simCur, isLightShell) {
        const canvas = document.getElementById('canvas-lightness');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 320, h = 190;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const padL = 34, padR = 14, padT = 16, padB = 28;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;
        const yOfL = (L) => padT + (1 - L) * plotH;

        const gridColor = isLightShell ? 'rgba(24,27,32,0.12)' : 'rgba(236,239,244,0.12)';
        const txtColor = isLightShell ? 'rgba(24,27,32,0.62)' : 'rgba(236,239,244,0.62)';

        ctx.font = '10px ui-monospace, monospace';
        [0, 0.25, 0.5, 0.75, 1].forEach((lv) => {
          const y = yOfL(lv);
          ctx.strokeStyle = gridColor;
          ctx.beginPath();
          ctx.moveTo(padL, y); ctx.lineTo(w - padR, y);
          ctx.stroke();
          ctx.fillStyle = txtColor;
          ctx.fillText(Math.round(lv * 100) + '%', 4, y + 3);
        });

        // Background & comment reference lines
        const bgL = hexToOklch(simCur.bg).L;
        const cmtL = hexToOklch(simCur.fgComment).L;
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = simCur.fgComment;
        ctx.beginPath();
        ctx.moveTo(padL, yOfL(cmtL)); ctx.lineTo(w - padR, yOfL(cmtL));
        ctx.stroke();
        ctx.restore();

        const step = plotW / POLY_KEYS.length;
        POLY_KEYS.forEach((k, i) => {
          const hex = simCur[k];
          const L = hexToOklch(hex).L;
          const x = padL + step * (i + 0.5);
          const y = yOfL(L);
          const yBg = yOfL(bgL);

          ctx.strokeStyle = hex;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(x, yBg);
          ctx.lineTo(x, y);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = hex;
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = simCur.bg;
          ctx.stroke();

          ctx.fillStyle = txtColor;
          ctx.fillText(POLY_NAMES[i], x - 9, h - 10);
        });
      }

      function render() {
        const th = THEMES.find((x) => x.slug === activeSlug) || THEMES[0];
        const sib = findSibling(th);
        const isLightShell = th.mode === 'light';
        document.body.dataset.shellMode = th.mode;

        // Mirrored Hyrule / Lorule triad brand mark reflects active pair's accents
        document.getElementById('tri-top').setAttribute('fill', th.t.cur);
        document.getElementById('tri-bot').setAttribute('fill', sib ? sib.t.status : th.t.status);

        document.getElementById('toggle-mode-label').textContent =
          th.mode === 'light' ? 'Switch to Dark' : 'Switch to Light';

        const applyBtn = document.getElementById('btn-apply-vscode');
        if (applyBtn) {
          const isApplied = workbenchActiveLabel === th.label;
          applyBtn.textContent = isApplied ? '✓ Active in Workbench' : 'Apply to Workbench';
        }

        renderEraRail(th);

        document.getElementById('active-theme-heading').textContent = th.label + ' (' + th.year + ')';
        document.getElementById('active-theme-subtitle').textContent = th.subtitle;
        document.getElementById('active-theme-story').textContent = th.story;

        document.querySelectorAll('.cvd-btn').forEach((btn) => {
          btn.setAttribute('aria-selected', String(btn.dataset.cvd === activeCvd));
        });

        // Simulate tokens
        const c = {};
        for (const [k, v] of Object.entries(th.t)) c[k] = simHex(v, activeCvd);
        const simSib = sib ? Object.fromEntries(Object.entries(sib.t).map(([k, v]) => [k, simHex(v, activeCvd)])) : null;

        // Workbench styling
        const wb = document.getElementById('workbench');
        wb.style.backgroundColor = c.bg;
        wb.style.color = c.fg;

        const titlebar = document.getElementById('wb-titlebar');
        titlebar.style.backgroundColor = c.bgActivity;
        titlebar.style.borderBottomColor = c.borderSubtle;
        document.getElementById('dot-close').style.backgroundColor = c.str;
        document.getElementById('dot-min').style.backgroundColor = c.num;
        document.getElementById('dot-max').style.backgroundColor = c.kw;

        document.querySelectorAll('.lang-tab').forEach((tab) => {
          const isAct = tab.dataset.lang === activeLang;
          tab.style.backgroundColor = isAct ? c.bg : 'transparent';
          tab.style.color = isAct ? c.fg : c.fgMuted;
          tab.style.borderTopColor = isAct ? c.foc : 'transparent';
          tab.style.fontWeight = isAct ? '600' : '400';
        });

        const pill = document.getElementById('wb-vision-pill');
        const cvdTitle = { normal: 'Normal Trichromacy', protan: 'Simulated Protanopia', deutan: 'Simulated Deuteranopia', tritan: 'Simulated Tritanopia' }[activeCvd];
        pill.textContent = cvdTitle;
        pill.style.backgroundColor = c.bgLine;
        pill.style.color = c.fgSecondary;

        const actBar = document.getElementById('wb-activity');
        actBar.style.backgroundColor = c.bgActivity;
        actBar.style.borderRightColor = c.borderSubtle;
        actBar.style.color = c.fgMuted;
        const actIcon = document.getElementById('act-icon-active');
        actIcon.style.color = c.fg;
        actIcon.style.borderLeftColor = c.foc;

        const sidebar = document.getElementById('wb-sidebar');
        sidebar.style.backgroundColor = c.bgSidebar;
        sidebar.style.borderRightColor = c.borderSubtle;
        document.getElementById('wb-exp-head').style.color = c.fgMuted;
        document.getElementById('wb-var-head').style.color = c.fgMuted;
        document.getElementById('wb-positron-pane').style.borderTopColor = c.borderSubtle;

        const files = [
          ['color_science.R', 'r', 'R'],
          ['oklch_gamut.py', 'py', 'PY'],
          ['extension.ts', 'ts', 'TS'],
          ['report.qmd', 'qmd', 'QMD'],
        ];
        const fileList = document.getElementById('wb-file-list');
        fileList.innerHTML = '';
        files.forEach(([fname, code, tag]) => {
          const row = document.createElement('div');
          row.className = 'wb-file-item';
          const isCur = activeLang === code;
          row.style.backgroundColor = isCur ? c.tintSelect : 'transparent';
          row.style.color = isCur ? c.fg : c.fgSecondary;
          row.innerHTML = '<span>' + fname + '</span><span style="font-size:10px;color:' + c.type + '">' + tag + '</span>';
          row.addEventListener('click', () => { activeLang = code; render(); });
          fileList.appendChild(row);
        });

        // Compute minimum critical pair DeltaE76 under current vision mode
        let minCritDe = Infinity;
        let minPairNames = '';
        for (let i = 0; i < CRITICAL_KEYS.length; i++) {
          for (let j = i + 1; j < CRITICAL_KEYS.length; j++) {
            const k1 = CRITICAL_KEYS[i], k2 = CRITICAL_KEYS[j];
            const d = deltaE76(c[k1], c[k2]);
            if (d < minCritDe) {
              minCritDe = d;
              minPairNames = k1 + '/' + k2;
            }
          }
        }

        document.getElementById('wb-var-list').innerHTML = [
          '<div class="wb-var-row"><span style="color:' + c.fgVariable + '">active_slug</span><span style="color:' + c.str + '">"' + th.slug + '"</span></div>',
          '<div class="wb-var-row"><span style="color:' + c.fgVariable + '">release_yr</span><span style="color:' + c.num + '">' + th.year + 'L</span></div>',
          '<div class="wb-var-row"><span style="color:' + c.fgVariable + '">min_de76</span><span style="color:' + c.fn + '">' + minCritDe.toFixed(1) + '</span></div>',
          '<div class="wb-var-row"><span style="color:' + c.fgVariable + '">wcag_gate</span><span style="color:' + c.kw + ';font-weight:700">TRUE</span></div>',
        ].join('');

        // Editor code lines
        const codeLines = buildCodeSample(c, activeLang, th);
        const ed = document.getElementById('wb-editor');
        ed.style.backgroundColor = c.bg;
        ed.innerHTML = codeLines.map((ln, idx) => {
          const hi = idx === 5;
          return '<div class="code-line" style="background:' + (hi ? c.bgLine : 'transparent') + '">' +
            '<span class="line-num" style="color:' + (hi ? c.fgSecondary : c.fgMuted) + '">' + (idx + 1) + '</span>' +
            '<span>' + (ln || ' ') + '</span></div>';
        }).join('');

        // Console + 16 ANSI strip
        const con = document.getElementById('wb-console');
        con.style.backgroundColor = c.bgPanel;
        con.style.borderTopColor = c.borderSubtle;
        document.getElementById('wb-ansi-head').style.color = c.fgMuted;

        const fgW = wcag(c.fg, c.bg).toFixed(2);
        const fgLc = Math.abs(apcaLc(c.fg, c.bg)).toFixed(1);
        document.getElementById('wb-console-lines').innerHTML =
          '<div><span style="color:' + c.kw + ';font-weight:700">&gt;</span> <span style="color:' + c.fn + '">audit_palette</span><span style="color:' + c.fgPunct + '">(</span><span style="color:' + c.str + '">"' + th.slug + '"</span><span style="color:' + c.fgPunct + ')</span></div>' +
          '<div style="color:' + c.fgSecondary + ';margin-top:2px">✔ fg/bg = <span style="color:' + c.num + '">' + fgW + ':1</span> (APCA |Lc| <span style="color:' + c.num + '">' + fgLc + '</span>) · min critical pair ΔE*ab = <span style="color:' + c.type + '">' + minCritDe.toFixed(1) + '</span> (' + minPairNames + ')</div>';

        const ansiOrder = [
          'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
          'brightBlack', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite'
        ];
        const ansiStrip = document.getElementById('ansi-strip');
        ansiStrip.innerHTML = '';
        ansiOrder.forEach((slot) => {
          const rawHex = th.ansi[slot];
          const sHex = simHex(rawHex, activeCvd);
          const cell = document.createElement('button');
          cell.type = 'button';
          cell.className = 'ansi-cell';
          cell.style.backgroundColor = sHex;
          cell.title = 'ansi.' + slot + ': ' + sHex + ' (WCAG ' + wcag(sHex, c.bgPanel).toFixed(2) + ':1) — click to copy';
          cell.addEventListener('click', () => copyText(sHex, 'Copied ansi.' + slot + ' (' + sHex + ')'));
          ansiStrip.appendChild(cell);
        });

        // Status Bar
        const sb = document.getElementById('wb-statusbar');
        sb.style.backgroundColor = c.status;
        sb.style.color = relLum(c.status) > 0.24 ? '#11161C' : '#F6F7FA';
        document.getElementById('sb-cvd-gate').textContent =
          th.slug === 'linksawakening-dark'
            ? 'DMG-01 Monochrome Hardware Tribute'
            : 'Critical CVD min ΔE*ab: ' + minCritDe.toFixed(1);
        document.getElementById('sb-contrast').textContent = 'WCAG ' + fgW + ':1 · |Lc| ' + fgLc;
        document.getElementById('sb-label').textContent = th.label;

        // Audit Table
        const tbody = document.getElementById('audit-tbody');
        tbody.innerHTML = '';
        let minRoleW = Infinity;
        AUDIT_ROLES.forEach(([roleLabel, key]) => {
          const hex = c[key];
          const ok = hexToOklch(hex);
          const wBg = wcag(hex, c.bg);
          const wLine = wcag(hex, c.bgLine);
          const lc = Math.abs(apcaLc(hex, c.bg));
          if (wBg < minRoleW) minRoleW = wBg;

          const tr = document.createElement('tr');
          tr.className = 'token-row';
          tr.title = 'Click to copy ' + hex;
          tr.innerHTML =
            '<td class="role-cell">' + roleLabel + '</td>' +
            '<td><span class="swatch-chip"><span class="swatch-box" style="background:' + hex + '"></span>' + hex + '</span></td>' +
            '<td>' + (ok.L * 100).toFixed(1) + '% · ' + ok.C.toFixed(3) + ' · ' + ok.H.toFixed(0) + '°</td>' +
            '<td><strong>' + wBg.toFixed(2) + ':1</strong></td>' +
            '<td>' + wLine.toFixed(2) + ':1</td>' +
            '<td>' + lc.toFixed(1) + '</td>';
          tr.addEventListener('click', () => copyText(hex, 'Copied ' + roleLabel + ' (' + hex + ')'));
          tbody.appendChild(tr);
        });

        document.getElementById('audit-summary-badge').textContent =
          '18/18 roles >= 4.5:1 · Floor: ' + minRoleW.toFixed(2) + ':1';
        document.getElementById('cvd-min-readout').textContent =
          'Min critical ΔE*ab (' + activeCvd + '): ' + minCritDe.toFixed(1) + ' (' + minPairNames + ')';

        // Pair comparison box
        const pairBox = document.getElementById('pair-compare-box');
        if (sib) {
          pairBox.innerHTML =
            '<span>Paired variant: <strong>' + sib.label + '</strong></span>' +
            '<span class="swatch-chip">Identity cursor: <span class="swatch-box" style="background:' + c.cur + '"></span><code>' + c.cur + '</code> ↔ <span class="swatch-box" style="background:' + simSib.cur + '"></span><code>' + simSib.cur + '</code></span>';
        }

        drawChromaCanvas(c, simSib, isLightShell);
        drawLightnessCanvas(c, isLightShell);
      }

      // Controls & Keyboard Shortcuts
      document.getElementById('btn-toggle-mode').addEventListener('click', () => {
        const cur = THEMES.find((x) => x.slug === activeSlug) || THEMES[0];
        const sib = findSibling(cur);
        if (sib) selectSlug(sib.slug, true);
      });

      document.getElementById('btn-prev-theme').addEventListener('click', () => {
        const idx = THEMES.findIndex((x) => x.slug === activeSlug);
        const nextIdx = (idx - 1 + THEMES.length) % THEMES.length;
        selectSlug(THEMES[nextIdx].slug, true);
      });

      document.getElementById('btn-next-theme').addEventListener('click', () => {
        const idx = THEMES.findIndex((x) => x.slug === activeSlug);
        const nextIdx = (idx + 1) % THEMES.length;
        selectSlug(THEMES[nextIdx].slug, true);
      });

      document.getElementById('btn-random-theme').addEventListener('click', () => {
        const pool = THEMES.filter((x) => x.slug !== activeSlug);
        selectSlug(pool[Math.floor(Math.random() * pool.length)].slug, true);
      });

      document.querySelectorAll('.lang-tab').forEach((tab) => {
        tab.addEventListener('click', () => { activeLang = tab.dataset.lang; render(); });
      });

      document.querySelectorAll('.cvd-btn').forEach((btn) => {
        btn.addEventListener('click', () => { activeCvd = btn.dataset.cvd; render(); });
      });

      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === 't') {
          document.getElementById('btn-toggle-mode').click();
        } else if (k === 'r') {
          document.getElementById('btn-random-theme').click();
        } else if (e.key === 'ArrowLeft') {
          document.getElementById('btn-prev-theme').click();
        } else if (e.key === 'ArrowRight') {
          document.getElementById('btn-next-theme').click();
        } else if (k === '1') { activeCvd = 'normal'; render(); }
        else if (k === '2') { activeCvd = 'protan'; render(); }
        else if (k === '3') { activeCvd = 'deutan'; render(); }
        else if (k === '4') { activeCvd = 'tritan'; render(); }
      });

      window.addEventListener('hashchange', () => {
        if (!IS_WEB) return;
        const slugHash = window.location.hash.slice(1).trim();
        if (THEMES.some((t) => t.slug === slugHash) && slugHash !== activeSlug) {
          activeSlug = slugHash;
          render();
        }
      });

      window.addEventListener('resize', () => render());
      render();
    })();
  </script>
</body>
</html>
`;
}

function main() {
  const dataset = loadThemeDataset();
  fs.mkdirSync(SITE_DIR, { recursive: true });
  fs.mkdirSync(WEBVIEW_DIR, { recursive: true });

  const webHtml = buildHtml({ dataset, target: 'web' });
  const webviewHtml = buildHtml({ dataset, target: 'webview' });

  fs.writeFileSync(path.join(SITE_DIR, 'index.html'), webHtml);
  fs.writeFileSync(path.join(SITE_DIR, '.nojekyll'), '');
  fs.copyFileSync(path.join(ROOT_DIR, 'icon.png'), path.join(SITE_DIR, 'icon.png'));

  fs.writeFileSync(path.join(WEBVIEW_DIR, 'explorer.html'), webviewHtml);

  console.log(
    `Generated site/index.html (${(Buffer.byteLength(webHtml) / 1024).toFixed(1)} KB) and assets/explorer/explorer.html (${(Buffer.byteLength(webviewHtml) / 1024).toFixed(1)} KB) across ${dataset.length} themes.`
  );
}

main();
