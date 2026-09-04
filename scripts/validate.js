#!/usr/bin/env node
'use strict';

// Validates every generated theme file: strict JSON parsing, and that every
// `positron*` color key used is drawn from the confirmed-real key list
// extracted from Positron's own source (src/vs/workbench/common/theme.ts on
// posit-dev/positron) -- guards against inventing unsupported theme keys.
// Run with: node scripts/validate.js

const fs = require('fs');
const path = require('path');

const THEMES_DIR = path.join(__dirname, '..', 'themes');
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');

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

function fail(msg) {
  console.error('FAIL: ' + msg);
  process.exitCode = 1;
}

function main() {
  // package.json must be strict JSON too.
  try {
    JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  } catch (err) {
    fail(`package.json is not valid JSON: ${err.message}`);
  }

  const files = fs.readdirSync(THEMES_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    fail('no theme files found in themes/ -- did you run scripts/generate-themes.js first?');
    return;
  }

  let totalPositronKeys = 0;
  for (const file of files) {
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

    const positronKeys = Object.keys(theme.colors).filter((k) => k.startsWith('positron'));
    totalPositronKeys += positronKeys.length;
    const unknown = positronKeys.filter((k) => !CONFIRMED_POSITRON_KEYS.has(k));
    if (unknown.length) {
      fail(`${file}: unrecognized positron* key(s) not in the confirmed-real list: ${unknown.join(', ')}`);
    }
  }

  if (process.exitCode !== 1) {
    console.log(`OK: ${files.length} theme files valid, ${totalPositronKeys} positron* key usages all verified.`);
  }
}

main();
