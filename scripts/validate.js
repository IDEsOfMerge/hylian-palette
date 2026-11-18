#!/usr/bin/env node
'use strict';

// Validates every palette, generated theme JSON, metadata file, and asset
// reference before packaging or CI passes:
//   1. Strict JSON parsing of package.json, theme-metadata.json, and themes/*.json
//   2. Exact 36-theme count across palettes/, themes/, package.json, and metadata
//   3. Valid #RRGGBB / #RRGGBBAA hex syntax on every theme color key
//   4. Every `positron*` color key drawn strictly from Positron's confirmed source
//      list (src/vs/workbench/common/theme.ts on posit-dev/positron)
//   5. Multi-gate colorimetric audit (WCAG 2.1, APCA, CIEDE2000, CVD) via color-science.js
//   6. Existence of icon and walkthrough media files referenced in package.json
// Run with: node scripts/validate.js

const fs = require('fs');
const path = require('path');
const cs = require('./color-science');

const ROOT_DIR = path.join(__dirname, '..');
const PALETTES_DIR = path.join(ROOT_DIR, 'palettes');
const THEMES_DIR = path.join(ROOT_DIR, 'themes');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');
const META_JSON = path.join(ROOT_DIR, 'theme-metadata.json');
const EXPECTED_THEME_COUNT = 36;

const CONFIRMED_POSITRON_KEYS = new Set([
  'positronError.foreground', 'positronScrollBar.border',
  'positronSplitterExpandCollapseButton.background', 'positronSplitterExpandCollapseButton.foreground',
  'positronToolTip.background', 'positronToolTip.border',
  'positronContextMenu.background', 'positronContextMenu.foreground', 'positronContextMenu.hoverBackground', 'positronContextMenu.hoverForeground', 'positronContextMenu.actionHoverBackground', 'positronContextMenu.separatorBackground',
  'positronActionBar.border', 'positronActionBar.background', 'positronActionBar.foreground', 'positronActionBar.disabledForeground', 'positronActionBar.separator', 'positronActionBar.hoverBackground', 'positronActionBar.checkboxBorder', 'positronActionBar.toggleButtonHighlightedBorder', 'positronActionBar.textInputBackground', 'positronActionBar.textInputBorder', 'positronActionBar.textInputSelectionForeground', 'positronActionBar.textInputSelectionBackground', 'positronActionBar.selectBorder', 'positronActionBar.selectBoxBackground',
  'positronModalDialog.background', 'positronModalDialog.foreground', 'positronModalDialog.contrastBackground', 'positronModalDialog.border', 'positronModalDialog.separator', 'positronModalDialog.preformattedTextForeground', 'positronModalDialog.titleBarBackground', 'positronModalDialog.titleBarForeground', 'positronModalDialog.buttonBackground', 'positronModalDialog.buttonHoverBackground', 'positronModalDialog.defaultButtonBackground', 'positronModalDialog.defaultButtonHoverBackground', 'positronModalDialog.buttonActiveBackground', 'positronModalDialog.buttonDisabledBackground', 'positronModalDialog.buttonForeground', 'positronModalDialog.defaultButtonForeground', 'positronModalDialog.buttonDestructiveBackground', 'positronModalDialog.buttonDestructiveHoverBackground', 'positronModalDialog.buttonDestructiveForeground', 'positronModalDialog.buttonDisabledForeground', 'positronModalDialog.buttonBorder', 'positronModalDialog.buttonDisabledBorder', 'positronModalDialog.textInputBackground', 'positronModalDialog.textInputBorder', 'positronModalDialog.textInputSelectionForeground', 'positronModalDialog.textInputSelectionBackground', 'positronModalDialog.radioButtonBackground', 'positronModalDialog.radioButtonForeground', 'positronModalDialog.radioButtonBorder', 'positronModalDialog.projectTypeBackground', 'positronModalDialog.projectTypeBackgroundHover', 'positronModalDialog.projectTypeBackgroundSelected', 'positronModalDialog.projectTypeForeground', 'positronModalDialog.projectTypeForegroundHover', 'positronModalDialog.projectTypeForegroundSelected', 'positronModalDialog.projectTypeBorder', 'positronModalDialog.projectTypeBorderHover', 'positronModalDialog.projectTypeBorderSelected',
  'positronIconButton.border', 'positronIconButton.background',
  'positronDropDownListBox.border', 'positronDropDownListBox.background', 'positronDropDownListBox.foreground', 'positronDropDownListBox.hoverBackground', 'positronDropDownListBox.hoverForeground', 'positronDropDownListBox.actionHoverBackground', 'positronDropDownListBox.separatorBackground',
  'positronCheckbox.background', 'positronCheckbox.foreground', 'positronCheckbox.border',
  'positronConsole.background', 'positronConsole.foreground', 'positronConsole.errorBackground', 'positronConsole.errorForeground', 'positronConsole.traceBackground',
  'positronConsole.ansiBlack', 'positronConsole.ansiRed', 'positronConsole.ansiGreen', 'positronConsole.ansiYellow', 'positronConsole.ansiBlue', 'positronConsole.ansiMagenta', 'positronConsole.ansiCyan', 'positronConsole.ansiWhite',
  'positronConsole.ansiBrightBlack', 'positronConsole.ansiBrightRed', 'positronConsole.ansiBrightGreen', 'positronConsole.ansiBrightYellow', 'positronConsole.ansiBrightBlue', 'positronConsole.ansiBrightMagenta', 'positronConsole.ansiBrightCyan', 'positronConsole.ansiBrightWhite',
  'positronRuntime.stateIconActive', 'positronRuntime.stateIconDisconnected', 'positronRuntime.stateIconIdle',
  'positronDataGrid.contrastBackground', 'positronDataGrid.foreground', 'positronDataGrid.border', 'positronDataGrid.cursorBorder', 'positronDataGrid.selectionBorder', 'positronDataGrid.selectionInnerBorder', 'positronDataGrid.selectionBackground', 'positronDataGrid.sortIndexForeground',
  'positronDataExplorer.background', 'positronDataExplorer.contrastBackground', 'positronDataExplorer.invalidFilterBackground', 'positronDataExplorer.statusIndicatorComputing', 'positronDataExplorer.statusIndicatorDisconnected', 'positronDataExplorer.selectionBackground', 'positronDataExplorer.foreground', 'positronDataExplorer.border', 'positronDataExplorer.columnNullPercentGraphBackgroundFill', 'positronDataExplorer.columnNullPercentGraphBackgroundStroke', 'positronDataExplorer.columnNullPercentGraphIndicatorFill', 'positronDataExplorer.sparklineAxis', 'positronDataExplorer.sparklineFill', 'positronDataExplorer.sparklineHover', 'positronDataExplorer.sparklineStroke',
  'positronVariables.background', 'positronVariables.foreground', 'positronVariables.border', 'positronVariables.headerBackground', 'positronVariables.rowHoverBackground', 'positronVariables.rowHoverForeground', 'positronVariables.activeSelectionBackground', 'positronVariables.activeSelectionForeground', 'positronVariables.inactiveSelectionBackground', 'positronVariables.inactiveSelectionForeground',
  'positronPackages.background', 'positronPackages.foreground', 'positronPackages.border', 'positronPackages.recentlyChangedBackground',
  'positronPlots.background',
  'positronNotebook.cellFooterForeground', 'positronNotebook.foreground', 'positronNotebook.errorForeground', 'positronNotebook.imgPlaceholderBackground', 'positronNotebook.cellBorder', 'positronNotebook.cellHoverBorder', 'positronNotebook.cellFocusedBorder', 'positronNotebook.cellInactiveFocusedBorder', 'positronNotebook.actionBarBackground', 'positronNotebook.actionBarBorder', 'positronNotebook.cellTagBorder', 'positronNotebook.cellTagHoverForeground',
  'positronMemoryUsageBar.overheadForeground', 'positronMemoryUsageBar.otherForeground',
]);

const HEX_COLOR_RE = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

function fail(msg) {
  console.error('FAIL: ' + msg);
  process.exitCode = 1;
}

function main() {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  } catch (err) {
    fail(`package.json is not valid JSON: ${err.message}`);
    return;
  }

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(META_JSON, 'utf8'));
  } catch (err) {
    fail(`theme-metadata.json is not valid JSON: ${err.message}`);
    return;
  }

  const paletteFiles = fs.readdirSync(PALETTES_DIR).filter((f) => f.endsWith('.js')).sort();
  const themeFiles = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.json')).sort();

  if (paletteFiles.length !== EXPECTED_THEME_COUNT) {
    fail(`expected ${EXPECTED_THEME_COUNT} palette files in palettes/, found ${paletteFiles.length}`);
  }
  if (themeFiles.length !== EXPECTED_THEME_COUNT) {
    fail(`expected ${EXPECTED_THEME_COUNT} theme files in themes/, found ${themeFiles.length}`);
  }
  if (!pkg.contributes || !Array.isArray(pkg.contributes.themes) || pkg.contributes.themes.length !== EXPECTED_THEME_COUNT) {
    fail(`package.json contributes.themes has ${pkg.contributes?.themes?.length} entries, expected ${EXPECTED_THEME_COUNT}`);
  }
  if (!Array.isArray(meta) || meta.length !== EXPECTED_THEME_COUNT) {
    fail(`theme-metadata.json has ${meta?.length} entries, expected ${EXPECTED_THEME_COUNT}`);
  }

  // Verify icon and walkthrough media files exist on disk
  if (pkg.icon && !fs.existsSync(path.join(ROOT_DIR, pkg.icon))) {
    fail(`package.json icon missing on disk: ${pkg.icon}`);
  }
  for (const wt of pkg.contributes?.walkthroughs || []) {
    for (const step of wt.steps || []) {
      const mediaPath = step.media?.image || step.media?.markdown;
      if (mediaPath && !fs.existsSync(path.join(ROOT_DIR, mediaPath))) {
        fail(`walkthrough step "${step.id}" references missing media file: ${mediaPath}`);
      }
    }
  }

  // Run colorimetric audit across all palette modules
  for (const pf of paletteFiles) {
    const p = require(path.join(PALETTES_DIR, pf));
    if (!p.subtitle || typeof p.subtitle !== 'string') {
      fail(`${pf}: missing required string property "subtitle"`);
    }
    const res = cs.auditPalette(p);
    for (const err of res.errors) {
      fail(err);
    }
  }

  // Validate generated theme JSON files
  let totalPositronKeys = 0;
  for (const file of themeFiles) {
    const filePath = path.join(THEMES_DIR, file);
    let theme;
    try {
      theme = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      fail(`${file} is not valid JSON: ${err.message}`);
      continue;
    }

    if (!theme.colors || typeof theme.colors !== 'object') {
      fail(`${file}: missing or malformed "colors" block`);
      continue;
    }

    for (const [key, val] of Object.entries(theme.colors)) {
      if (typeof val !== 'string' || !HEX_COLOR_RE.test(val)) {
        fail(`${file}: invalid hex color "${val}" on key "${key}"`);
      }
    }

    const positronKeys = Object.keys(theme.colors).filter((k) => k.startsWith('positron'));
    totalPositronKeys += positronKeys.length;
    const unknown = positronKeys.filter((k) => !CONFIRMED_POSITRON_KEYS.has(k));
    if (unknown.length) {
      fail(`${file}: unrecognized positron* key(s) not in the confirmed-real list: ${unknown.join(', ')}`);
    }
  }

  // Verify generated interactive Explorer bundles (GitHub Pages + VS Code Webview)
  const explorerTargets = [
    { rel: 'site/index.html', requirePlaceholders: false },
    { rel: 'assets/explorer/explorer.html', requirePlaceholders: true },
  ];
  for (const target of explorerTargets) {
    const abs = path.join(ROOT_DIR, target.rel);
    if (!fs.existsSync(abs)) {
      fail(`missing generated Explorer bundle: ${target.rel} (run node scripts/generate-explorer.js)`);
      continue;
    }
    const html = fs.readFileSync(abs, 'utf8');
    // Ensure 100% offline / zero-CDN compliance (no external script, stylesheet, or image URLs)
    if (/<(?:script|link|img)\b[^>]+(?:src|href)=["']https?:\/\//i.test(html)) {
      fail(`${target.rel}: contains external HTTP(S) script/stylesheet/image URL; Explorer must be 100% self-contained`);
    }
    if (target.requirePlaceholders && (!html.includes('{{CSP_META}}') || !html.includes('{{CSP_NONCE}}'))) {
      fail(`${target.rel}: missing {{CSP_META}} or {{CSP_NONCE}} placeholder required by extension.js`);
    }
    for (const entry of meta) {
      if (!html.includes(`"slug":"${entry.slug}"`)) {
        fail(`${target.rel}: missing embedded palette data for slug "${entry.slug}"`);
      }
    }
  }

  if (process.exitCode !== 1) {
    console.log(
      `OK: ${themeFiles.length} theme files valid, ${totalPositronKeys} positron* key usages verified, Explorer bundles verified, all WCAG/APCA/CIEDE2000/CVD gates clear.`
    );
  }
}

main();
