#!/usr/bin/env node
'use strict';

// Dev-only build tool. Expands a compact per-game "story palette" (~35 named
// tokens with real rationale) into full VS Code/Positron theme JSON files.
// Not shipped as a runtime dependency of the extension -- the extension itself
// stays a plain, dependency-free package (see extension.js). Run with:
//   node scripts/generate-themes.js

const fs = require('fs');
const path = require('path');

const THEMES_DIR = path.join(__dirname, '..', 'themes');
const PALETTES_DIR = path.join(__dirname, '..', 'palettes');
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');

// ---------- color helpers ----------

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function rgbToHex({ r, g, b }) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}
function alpha(hex, aa) {
  return `${hex}${aa}`;
}
function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
}
function lighten(hex, t) { return mix(hex, '#FFFFFF', t); }
function darken(hex, t) { return mix(hex, '#000000', t); }

function relLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const chan = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [chan(r), chan(g), chan(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(hexA, hexB) {
  const L1 = relLuminance(hexA), L2 = relLuminance(hexB);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}
function readableTextOn(bgHex) {
  return contrastRatio(bgHex, '#000000') >= contrastRatio(bgHex, '#FFFFFF') ? '#000000' : '#FFFFFF';
}

// ---------- ANSI defaults (overridable per palette via t.ansi) ----------

function defaultAnsi(t) {
  return {
    black: t.borderStrong,
    red: darken(t.colorError, 0.12),
    green: t.accentKeyword,
    yellow: t.accentNumber,
    blue: t.accentFunction,
    magenta: t.accentDecorator,
    cyan: t.accentType,
    white: t.fgSecondary,
    brightBlack: t.fgMuted,
    brightRed: t.colorError,
    brightGreen: lighten(t.accentKeyword, 0.15),
    brightYellow: darken(t.accentNumber, 0.05),
    brightBlue: t.accentFunctionDim,
    brightMagenta: lighten(t.accentDecorator, 0.1),
    brightCyan: t.accentInterface,
    brightWhite: t.fg,
  };
}

// ---------- colors block ----------

function buildColors(p) {
  const t = p.tokens;
  const ansi = { ...defaultAnsi(t), ...(t.ansi || {}) };
  const statusBarBorder = darken(t.accentStatusBar, 0.18);

  return {
    'editor.background': t.bg,
    'editor.foreground': t.fg,
    'editor.lineHighlightBackground': t.bgLine,
    'editor.lineHighlightBorder': '#00000000',
    'editorLineNumber.foreground': t.borderStrong,
    'editorLineNumber.activeForeground': t.fg,
    'editorCursor.foreground': t.accentCursor,
    'editor.selectionBackground': alpha(t.accentFocus, '40'),
    'editor.selectionHighlightBackground': alpha(t.accentFocus, '1F'),
    'editor.inactiveSelectionBackground': alpha(t.accentFocus, '1A'),
    'editor.wordHighlightBackground': alpha(t.accentFunction, '22'),
    'editor.wordHighlightStrongBackground': alpha(t.accentFunction, '38'),
    'editor.findMatchBackground': alpha(t.accentBadge, '66'),
    'editor.findMatchHighlightBackground': alpha(t.accentBadge, '33'),
    'editor.findMatchBorder': t.accentBadge,
    'editorBracketMatch.background': alpha(t.accentFocus, '2A'),
    'editorBracketMatch.border': t.accentFocus,
    'editorBracketHighlight.foreground1': t.accentKeyword,
    'editorBracketHighlight.foreground2': t.accentFunction,
    'editorBracketHighlight.foreground3': t.accentString,
    'editorBracketHighlight.foreground4': t.accentNumber,
    'editorBracketHighlight.foreground5': t.accentType,
    'editorBracketHighlight.foreground6': t.accentDecorator,
    'editorBracketHighlight.unexpectedBracket.foreground': t.colorError,
    'editorError.foreground': t.colorError,
    'editorWarning.foreground': t.colorWarning,
    'editorInfo.foreground': t.colorInfo,
    'editorHint.foreground': t.accentType,
    'editorIndentGuide.background1': t.borderSubtle,
    'editorIndentGuide.activeBackground1': t.borderStrong,
    'editorWhitespace.foreground': t.borderSubtle,
    'editorRuler.foreground': t.borderSubtle,

    'editorGroup.border': t.borderSubtle,
    'editorGroupHeader.tabsBackground': t.bgActivity,
    'editorGroupHeader.tabsBorder': t.borderSubtle,
    'tab.activeBackground': t.bg,
    'tab.activeForeground': t.fg,
    'tab.inactiveBackground': t.bgActivity,
    'tab.inactiveForeground': t.fgSecondary,
    'tab.border': t.borderSubtle,
    'tab.activeBorderTop': t.accentFocus,
    'tab.unfocusedActiveForeground': t.fgSecondary,

    'minimap.background': t.bg,
    'minimap.selectionHighlight': alpha(t.accentFocus, '55'),
    'minimap.findMatchHighlight': alpha(t.accentBadge, 'AA'),
    'minimap.errorHighlight': alpha(t.colorError, 'AA'),
    'minimap.warningHighlight': alpha(t.colorWarning, 'AA'),
    'minimapSlider.background': alpha(t.fg, '22'),
    'minimapSlider.hoverBackground': alpha(t.fg, '38'),
    'minimapSlider.activeBackground': alpha(t.fg, '50'),
    'scrollbarSlider.background': alpha(t.fg, '22'),
    'scrollbarSlider.hoverBackground': alpha(t.fg, '38'),
    'scrollbarSlider.activeBackground': alpha(t.fg, '50'),

    'sideBar.background': t.bgSidebar,
    'sideBar.foreground': t.fg,
    'sideBar.border': t.borderSubtle,
    'sideBarTitle.foreground': t.fg,
    'sideBarSectionHeader.background': t.bgPanel,
    'sideBarSectionHeader.foreground': t.fg,

    'activityBar.background': t.bgActivity,
    'activityBar.foreground': t.accentFocus,
    'activityBar.inactiveForeground': t.fgSecondary,
    'activityBar.border': t.borderSubtle,
    'activityBar.activeBorder': t.accentFocus,
    'activityBarBadge.background': t.accentBadge,
    'activityBarBadge.foreground': readableTextOn(t.accentBadge),

    'statusBar.background': t.accentStatusBar,
    'statusBar.foreground': readableTextOn(t.accentStatusBar),
    'statusBar.border': statusBarBorder,
    'statusBar.noFolderBackground': t.accentKeyword,
    'statusBar.debuggingBackground': t.colorError,
    'statusBar.debuggingForeground': readableTextOn(t.colorError),
    'statusBarItem.hoverBackground': '#FFFFFF22',
    'statusBarItem.remoteBackground': t.accentType,
    'statusBarItem.remoteForeground': readableTextOn(t.accentType),

    'titleBar.activeBackground': t.bgActivity,
    'titleBar.activeForeground': t.fg,
    'titleBar.inactiveBackground': t.bgSidebar,
    'titleBar.inactiveForeground': t.fgSecondary,
    'titleBar.border': t.borderSubtle,

    'panel.background': t.bgPanel,
    'panel.border': t.borderSubtle,
    'panelTitle.activeForeground': t.fg,
    'panelTitle.activeBorder': t.accentFocus,
    'panelTitle.inactiveForeground': t.fgSecondary,
    'terminal.background': t.bg,
    'terminal.foreground': t.fg,
    'terminal.selectionBackground': alpha(t.accentFocus, '40'),
    'terminalCursor.foreground': t.accentCursor,
    'terminal.ansiBlack': ansi.black,
    'terminal.ansiRed': ansi.red,
    'terminal.ansiGreen': ansi.green,
    'terminal.ansiYellow': ansi.yellow,
    'terminal.ansiBlue': ansi.blue,
    'terminal.ansiMagenta': ansi.magenta,
    'terminal.ansiCyan': ansi.cyan,
    'terminal.ansiWhite': ansi.white,
    'terminal.ansiBrightBlack': ansi.brightBlack,
    'terminal.ansiBrightRed': ansi.brightRed,
    'terminal.ansiBrightGreen': ansi.brightGreen,
    'terminal.ansiBrightYellow': ansi.brightYellow,
    'terminal.ansiBrightBlue': ansi.brightBlue,
    'terminal.ansiBrightMagenta': ansi.brightMagenta,
    'terminal.ansiBrightCyan': ansi.brightCyan,
    'terminal.ansiBrightWhite': ansi.brightWhite,

    'list.activeSelectionBackground': t.tintSelect,
    'list.activeSelectionForeground': t.fg,
    'list.inactiveSelectionBackground': mix(t.tintSelect, t.bgSidebar, 0.4),
    'list.hoverBackground': t.tintHover,
    'list.focusOutline': t.accentFocus,
    'list.highlightForeground': t.accentFunction,
    'list.errorForeground': t.colorError,
    'list.warningForeground': t.accentNumber,

    'input.background': t.bgInput,
    'input.foreground': t.fg,
    'input.border': t.borderSubtle,
    'input.placeholderForeground': t.fgMuted,
    'dropdown.background': t.bgWidget,
    'dropdown.foreground': t.fg,
    'dropdown.border': t.borderSubtle,

    'button.background': t.accentButton,
    'button.foreground': readableTextOn(t.accentButton),
    'button.hoverBackground': lighten(t.accentButton, 0.12),
    'button.secondaryBackground': t.bgPanel,
    'button.secondaryForeground': t.fg,
    'badge.background': t.accentBadge,
    'badge.foreground': readableTextOn(t.accentBadge),
    'progressBar.background': t.accentFocus,

    'notifications.background': t.bgWidget,
    'notifications.foreground': t.fg,
    'notifications.border': t.borderSubtle,
    'notificationsErrorIcon.foreground': t.colorError,
    'notificationsWarningIcon.foreground': t.colorWarning,
    'notificationsInfoIcon.foreground': t.colorInfo,

    'editorWidget.background': t.bgWidget,
    'editorWidget.border': t.borderSubtle,
    'quickInput.background': t.bgWidget,
    'quickInput.foreground': t.fg,
    'quickInputList.focusBackground': t.tintSelect,
    'pickerGroup.foreground': t.accentFunction,
    'pickerGroup.border': t.borderSubtle,
    focusBorder: t.accentFocus,

    'diffEditor.insertedTextBackground': alpha(t.gitAdd, '26'),
    'diffEditor.removedTextBackground': alpha(t.gitDelete, '26'),
    'diffEditor.insertedLineBackground': alpha(t.gitAdd, '1A'),
    'diffEditor.removedLineBackground': alpha(t.gitDelete, '1A'),
    'diffEditor.border': t.borderSubtle,
    'gitDecoration.addedResourceForeground': t.gitAdd,
    'gitDecoration.modifiedResourceForeground': t.accentFunction,
    'gitDecoration.deletedResourceForeground': t.gitDelete,
    'gitDecoration.untrackedResourceForeground': t.accentType,
    'gitDecoration.ignoredResourceForeground': t.fgMuted,
    'gitDecoration.conflictingResourceForeground': t.accentNumber,

    'textLink.foreground': t.accentFocus,
    'textLink.activeForeground': t.accentInterface,

    'positronError.foreground': t.colorError,
    'positronScrollBar.border': t.borderSubtle,
    'positronSplitterExpandCollapseButton.background': t.bgActivity,
    'positronSplitterExpandCollapseButton.foreground': t.fg,
    'positronToolTip.background': t.bgWidget,
    'positronToolTip.border': t.borderSubtle,
    'positronContextMenu.background': t.bgWidget,
    'positronContextMenu.foreground': t.fg,
    'positronContextMenu.hoverBackground': t.tintHover,
    'positronContextMenu.hoverForeground': t.fg,
    'positronContextMenu.actionHoverBackground': t.tintSelect,
    'positronContextMenu.separatorBackground': t.borderSubtle,
    'positronActionBar.border': t.borderSubtle,
    'positronActionBar.background': t.bgSidebar,
    'positronActionBar.foreground': t.fg,
    'positronActionBar.disabledForeground': t.fgMuted,
    'positronActionBar.separator': t.borderSubtle,
    'positronActionBar.hoverBackground': t.tintHover,
    'positronActionBar.checkboxBorder': t.borderStrong,
    'positronActionBar.toggleButtonHighlightedBorder': t.accentFocus,
    'positronActionBar.textInputBackground': t.bgInput,
    'positronActionBar.textInputBorder': t.borderSubtle,
    'positronActionBar.textInputSelectionForeground': t.fg,
    'positronActionBar.textInputSelectionBackground': alpha(t.accentFocus, '40'),
    'positronActionBar.selectBorder': t.borderSubtle,
    'positronActionBar.selectBoxBackground': t.bgInput,
    'positronIconButton.border': t.borderSubtle,
    'positronIconButton.background': t.bgSidebar,
    'positronDropDownListBox.border': t.borderSubtle,
    'positronDropDownListBox.background': t.bgWidget,
    'positronDropDownListBox.foreground': t.fg,
    'positronDropDownListBox.hoverBackground': t.tintHover,
    'positronDropDownListBox.hoverForeground': t.fg,
    'positronDropDownListBox.actionHoverBackground': t.tintSelect,
    'positronDropDownListBox.separatorBackground': t.borderSubtle,
    'positronCheckbox.background': t.bgInput,
    'positronCheckbox.foreground': t.fg,
    'positronCheckbox.border': t.borderStrong,

    'positronModalDialog.background': t.bgWidget,
    'positronModalDialog.foreground': t.fg,
    'positronModalDialog.contrastBackground': t.bgSidebar,
    'positronModalDialog.border': t.borderSubtle,
    'positronModalDialog.separator': t.borderSubtle,
    'positronModalDialog.preformattedTextForeground': t.fgVariable,
    'positronModalDialog.titleBarBackground': t.bgActivity,
    'positronModalDialog.titleBarForeground': t.fg,
    'positronModalDialog.buttonBackground': t.accentButton,
    'positronModalDialog.buttonHoverBackground': lighten(t.accentButton, 0.12),
    'positronModalDialog.defaultButtonBackground': t.accentFunction,
    'positronModalDialog.defaultButtonHoverBackground': lighten(t.accentFunction, 0.12),
    'positronModalDialog.buttonActiveBackground': darken(t.accentButton, 0.18),
    'positronModalDialog.buttonDisabledBackground': alpha(t.fgMuted, '40'),
    'positronModalDialog.buttonForeground': readableTextOn(t.accentButton),
    'positronModalDialog.defaultButtonForeground': readableTextOn(t.accentFunction),
    'positronModalDialog.buttonDestructiveBackground': t.colorError,
    'positronModalDialog.buttonDestructiveHoverBackground': lighten(t.colorError, 0.12),
    'positronModalDialog.buttonDestructiveForeground': readableTextOn(t.colorError),
    'positronModalDialog.buttonDisabledForeground': t.fgMuted,
    'positronModalDialog.buttonBorder': t.borderSubtle,
    'positronModalDialog.buttonDisabledBorder': t.borderSubtle,
    'positronModalDialog.textInputBackground': t.bgInput,
    'positronModalDialog.textInputBorder': t.borderSubtle,
    'positronModalDialog.textInputSelectionForeground': t.fg,
    'positronModalDialog.textInputSelectionBackground': alpha(t.accentFocus, '40'),
    'positronModalDialog.radioButtonBackground': t.bgInput,
    'positronModalDialog.radioButtonForeground': t.fg,
    'positronModalDialog.radioButtonBorder': t.borderStrong,
    'positronModalDialog.projectTypeBackground': t.bgSidebar,
    'positronModalDialog.projectTypeBackgroundHover': t.tintHover,
    'positronModalDialog.projectTypeBackgroundSelected': t.tintSelect,
    'positronModalDialog.projectTypeForeground': t.fg,
    'positronModalDialog.projectTypeForegroundHover': t.fg,
    'positronModalDialog.projectTypeForegroundSelected': t.accentFunction,
    'positronModalDialog.projectTypeBorder': t.borderSubtle,
    'positronModalDialog.projectTypeBorderHover': t.borderStrong,
    'positronModalDialog.projectTypeBorderSelected': t.accentFocus,

    'positronConsole.background': t.bg,
    'positronConsole.foreground': t.fg,
    'positronConsole.errorBackground': alpha(t.gitDelete, '1A'),
    'positronConsole.errorForeground': t.colorError,
    'positronConsole.traceBackground': alpha(t.fgMuted, '1A'),
    'positronConsole.ansiBlack': ansi.black,
    'positronConsole.ansiRed': ansi.red,
    'positronConsole.ansiGreen': ansi.green,
    'positronConsole.ansiYellow': ansi.yellow,
    'positronConsole.ansiBlue': ansi.blue,
    'positronConsole.ansiMagenta': ansi.magenta,
    'positronConsole.ansiCyan': ansi.cyan,
    'positronConsole.ansiWhite': ansi.white,
    'positronConsole.ansiBrightBlack': ansi.brightBlack,
    'positronConsole.ansiBrightRed': ansi.brightRed,
    'positronConsole.ansiBrightGreen': ansi.brightGreen,
    'positronConsole.ansiBrightYellow': ansi.brightYellow,
    'positronConsole.ansiBrightBlue': ansi.brightBlue,
    'positronConsole.ansiBrightMagenta': ansi.brightMagenta,
    'positronConsole.ansiBrightCyan': ansi.brightCyan,
    'positronConsole.ansiBrightWhite': ansi.brightWhite,

    'positronRuntime.stateIconActive': t.gitAdd,
    'positronRuntime.stateIconDisconnected': t.fgMuted,
    'positronRuntime.stateIconIdle': t.accentBadge,

    'positronDataGrid.contrastBackground': t.bgPanel,
    'positronDataGrid.foreground': t.fg,
    'positronDataGrid.border': t.borderSubtle,
    'positronDataGrid.cursorBorder': t.accentCursor,
    'positronDataGrid.selectionBorder': t.accentFocus,
    'positronDataGrid.selectionInnerBorder': alpha(t.accentFocus, '80'),
    'positronDataGrid.selectionBackground': alpha(t.accentFocus, '33'),
    'positronDataGrid.sortIndexForeground': t.accentFunction,

    'positronDataExplorer.background': t.bgSidebar,
    'positronDataExplorer.contrastBackground': t.bgPanel,
    'positronDataExplorer.invalidFilterBackground': alpha(t.gitDelete, '26'),
    'positronDataExplorer.statusIndicatorComputing': t.accentBadge,
    'positronDataExplorer.statusIndicatorDisconnected': t.fgMuted,
    'positronDataExplorer.selectionBackground': alpha(t.accentFocus, '33'),
    'positronDataExplorer.foreground': t.fg,
    'positronDataExplorer.border': t.borderSubtle,
    'positronDataExplorer.columnNullPercentGraphBackgroundFill': t.tintHover,
    'positronDataExplorer.columnNullPercentGraphBackgroundStroke': t.borderSubtle,
    'positronDataExplorer.columnNullPercentGraphIndicatorFill': t.accentBadge,
    'positronDataExplorer.sparklineAxis': t.fgSecondary,
    'positronDataExplorer.sparklineFill': alpha(t.accentFocus, '55'),
    'positronDataExplorer.sparklineHover': t.accentFunction,
    'positronDataExplorer.sparklineStroke': t.accentFunction,

    'positronVariables.background': t.bgSidebar,
    'positronVariables.foreground': t.fg,
    'positronVariables.border': t.borderSubtle,
    'positronVariables.headerBackground': t.bgPanel,
    'positronVariables.rowHoverBackground': t.tintHover,
    'positronVariables.rowHoverForeground': t.fg,
    'positronVariables.activeSelectionBackground': alpha(t.accentFocus, '40'),
    'positronVariables.activeSelectionForeground': t.fg,
    'positronVariables.inactiveSelectionBackground': mix(t.tintSelect, t.bgSidebar, 0.4),
    'positronVariables.inactiveSelectionForeground': t.fgSecondary,

    'positronPackages.background': t.bgSidebar,
    'positronPackages.foreground': t.fg,
    'positronPackages.border': t.borderSubtle,
    'positronPackages.recentlyChangedBackground': alpha(t.accentBadge, '26'),

    'positronPlots.background': '#FFFFFF',

    'positronNotebook.cellFooterForeground': t.fgSecondary,
    'positronNotebook.foreground': t.fg,
    'positronNotebook.errorForeground': t.colorError,
    'positronNotebook.imgPlaceholderBackground': t.bgPanel,
    'positronNotebook.cellBorder': t.borderSubtle,
    'positronNotebook.cellHoverBorder': t.accentFocus,
    'positronNotebook.cellFocusedBorder': t.accentFunction,
    'positronNotebook.cellInactiveFocusedBorder': t.borderStrong,
    'positronNotebook.actionBarBackground': t.bgSidebar,
    'positronNotebook.actionBarBorder': t.borderSubtle,
    'positronNotebook.cellTagBorder': t.borderSubtle,
    'positronNotebook.cellTagHoverForeground': t.accentFunction,

    'positronMemoryUsageBar.overheadForeground': t.accentBadge,
    'positronMemoryUsageBar.otherForeground': t.accentFocus,
  };
}

// ---------- tokenColors / semanticTokenColors (shared shape, tokens vary) ----------

function buildTokenColors(t) {
  return [
    { scope: ['comment', 'comment.line', 'comment.block'], settings: { foreground: t.fgComment, fontStyle: 'italic' } },
    { scope: ['comment.block.documentation', 'comment.documentation'], settings: { foreground: t.fgComment, fontStyle: 'italic' } },
    { scope: ['comment.block.documentation storage.type.class', 'comment.block.documentation keyword', 'punctuation.definition.tag.documentation'], settings: { foreground: t.accentType, fontStyle: 'bold italic' } },
    { scope: ['keyword.control', 'keyword.control.flow', 'keyword.control.import', 'keyword.control.export', 'keyword', 'keyword.other'], settings: { foreground: t.accentKeyword, fontStyle: 'bold' } },
    { scope: ['keyword.operator', 'keyword.operator.assignment', 'keyword.operator.comparison', 'keyword.operator.logical', 'keyword.operator.arithmetic'], settings: { foreground: t.fgPunct } },
    { scope: ['storage.type', 'storage'], settings: { foreground: t.accentStorage, fontStyle: 'bold' } },
    { scope: ['storage.modifier'], settings: { foreground: t.accentStorage, fontStyle: 'italic' } },
    { scope: ['string.quoted', 'string.template', 'string', 'string.interpolated'], settings: { foreground: t.accentString } },
    { scope: ['string.regexp'], settings: { foreground: t.accentRegex } },
    { scope: ['constant.character.escape'], settings: { foreground: t.accentFunctionDim } },
    { scope: ['constant.numeric'], settings: { foreground: t.accentNumber } },
    { scope: ['constant.language.boolean', 'constant.language'], settings: { foreground: t.accentNumber, fontStyle: 'bold' } },
    { scope: ['constant.other', 'constant.other.enummember'], settings: { foreground: t.accentType } },
    { scope: ['entity.name.function', 'meta.function-call', 'support.function'], settings: { foreground: t.accentFunction } },
    { scope: ['support.function.builtin', 'support.function.magic'], settings: { foreground: t.accentFunctionDim } },
    { scope: ['entity.name.function.member', 'meta.method', 'meta.function-call.method'], settings: { foreground: t.accentFunction } },
    { scope: ['variable', 'variable.other.readwrite', 'variable.other.object'], settings: { foreground: t.fgVariable } },
    { scope: ['variable.language', 'variable.language.this', 'variable.language.self'], settings: { foreground: t.fgVariable, fontStyle: 'italic bold' } },
    { scope: ['variable.parameter'], settings: { foreground: t.fgParameter, fontStyle: 'italic' } },
    { scope: ['variable.other.property', 'variable.other.object.property', 'meta.object-literal.key'], settings: { foreground: t.fgProperty } },
    { scope: ['entity.name.type.class', 'entity.name.class', 'support.class'], settings: { foreground: t.accentType, fontStyle: 'bold' } },
    { scope: ['entity.name.type', 'support.type'], settings: { foreground: t.accentType } },
    { scope: ['entity.name.type.interface'], settings: { foreground: t.accentInterface, fontStyle: 'italic' } },
    { scope: ['entity.name.type.enum'], settings: { foreground: t.accentType, fontStyle: 'bold' } },
    { scope: ['entity.name.namespace', 'entity.name.type.module', 'entity.name.type.namespace'], settings: { foreground: t.accentNamespace } },
    { scope: ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'], settings: { foreground: t.accentDecorator, fontStyle: 'italic' } },
    { scope: ['punctuation', 'punctuation.separator', 'punctuation.terminator', 'punctuation.definition'], settings: { foreground: t.fgPunct } },
    { scope: ['punctuation.definition.tag'], settings: { foreground: t.fgPunct } },
    { scope: ['entity.name.tag'], settings: { foreground: t.accentFunction } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: t.accentNumber, fontStyle: 'italic' } },
    { scope: ['support.type.property-name.json', 'support.type.property-name'], settings: { foreground: t.accentFunction } },
    { scope: ['markup.heading'], settings: { foreground: t.accentKeyword, fontStyle: 'bold' } },
    { scope: ['markup.bold'], settings: { foreground: t.fg, fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { foreground: t.fg, fontStyle: 'italic' } },
    { scope: ['markup.underline.link'], settings: { foreground: t.accentFunction, fontStyle: 'underline' } },
    { scope: ['markup.quote'], settings: { foreground: t.fgComment, fontStyle: 'italic' } },
    { scope: ['markup.list'], settings: { foreground: t.fgPunct } },
    { scope: ['markup.inline.raw', 'markup.raw'], settings: { foreground: t.accentType } },
    { scope: ['markup.fenced_code.block', 'markup.code'], settings: { foreground: t.accentString } },
    { scope: ['keyword.other.DML', 'keyword.other.DDL', 'keyword.other.sql'], settings: { foreground: t.accentKeyword, fontStyle: 'bold' } },
    { scope: ['support.function.sql'], settings: { foreground: t.accentFunction } },
    { scope: ['variable.other.normal.shell', 'variable.other.readwrite.shell'], settings: { foreground: t.fgVariable, fontStyle: 'bold' } },
    { scope: ['support.function.builtin.shell', 'entity.name.function.shell'], settings: { foreground: t.accentFunction } },
  ];
}

function buildSemanticTokenColors(t) {
  return {
    namespace: { foreground: t.accentNamespace },
    class: { foreground: t.accentType, fontStyle: 'bold' },
    'class.defaultLibrary': { foreground: t.accentInterface },
    interface: { foreground: t.accentInterface, fontStyle: 'italic' },
    enum: { foreground: t.accentType, fontStyle: 'bold' },
    enumMember: { foreground: t.accentNumber },
    struct: { foreground: t.accentType, fontStyle: 'bold' },
    typeParameter: { foreground: t.accentInterface, fontStyle: 'italic' },
    type: { foreground: t.accentType },
    function: { foreground: t.accentFunction },
    'function.defaultLibrary': { foreground: t.accentFunctionDim },
    method: { foreground: t.accentFunction },
    macro: { foreground: t.accentDecorator },
    variable: { foreground: t.fgVariable },
    'variable.readonly': { foreground: t.fgVariable, fontStyle: 'bold' },
    'variable.defaultLibrary': { foreground: t.accentFunctionDim },
    parameter: { foreground: t.fgParameter, fontStyle: 'italic' },
    property: { foreground: t.fgProperty },
    'property.readonly': { foreground: t.fgProperty, fontStyle: 'bold' },
    decorator: { foreground: t.accentDecorator, fontStyle: 'italic' },
    event: { foreground: t.accentNumber, fontStyle: 'italic' },
    keyword: { foreground: t.accentKeyword, fontStyle: 'bold' },
    modifier: { foreground: t.accentStorage, fontStyle: 'italic' },
    comment: { foreground: t.fgComment, fontStyle: 'italic' },
    string: { foreground: t.accentString },
    number: { foreground: t.accentNumber },
    regexp: { foreground: t.accentRegex },
    operator: { foreground: t.fgPunct },
  };
}

// ---------- contrast QA ----------

function checkContrast(slug, t) {
  const failures = [];
  const fgBg = contrastRatio(t.fg, t.bg);
  const commentBg = contrastRatio(t.fgComment, t.bg);
  const sidebarFgBg = contrastRatio(t.fg, t.bgSidebar);
  if (fgBg < 4.5) failures.push(`${slug}: editor fg/bg contrast ${fgBg.toFixed(2)}:1 < 4.5:1 minimum`);
  if (commentBg < 4.5) failures.push(`${slug}: comment fg/bg contrast ${commentBg.toFixed(2)}:1 < 4.5:1 minimum`);
  if (sidebarFgBg < 4.5) failures.push(`${slug}: sidebar fg/bg contrast ${sidebarFgBg.toFixed(2)}:1 < 4.5:1 minimum`);
  return { failures, fgBg, commentBg, sidebarFgBg };
}

// ---------- driver ----------

function loadPalettes() {
  return fs.readdirSync(PALETTES_DIR)
    .filter((f) => f.endsWith('.js'))
    .map((f) => require(path.join(PALETTES_DIR, f)));
}

function main() {
  const palettes = loadPalettes();
  const allFailures = [];
  const themeEntries = [];

  if (!fs.existsSync(THEMES_DIR)) fs.mkdirSync(THEMES_DIR, { recursive: true });

  for (const p of palettes) {
    const { failures, fgBg, commentBg, sidebarFgBg } = checkContrast(p.slug, p.tokens);
    allFailures.push(...failures);

    const theme = {
      name: p.label,
      type: p.tokens.mode,
      semanticHighlighting: true,
      colors: buildColors(p),
      tokenColors: buildTokenColors(p.tokens),
      semanticTokenColors: buildSemanticTokenColors(p.tokens),
    };
    const fileName = `${p.slug}-color-theme.json`;
    fs.writeFileSync(path.join(THEMES_DIR, fileName), JSON.stringify(theme, null, 2) + '\n');
    themeEntries.push({
      label: p.label,
      uiTheme: p.tokens.mode === 'light' ? 'vs' : 'vs-dark',
      path: `./themes/${fileName}`,
      game: p.game,
      year: p.year,
      mode: p.tokens.mode,
      slug: p.slug,
      contrast: { fgBg: fgBg.toFixed(2), commentBg: commentBg.toFixed(2), sidebarFgBg: sidebarFgBg.toFixed(2) },
    });
    console.log(`generated ${fileName}  (fg/bg ${fgBg.toFixed(2)}:1, comment ${commentBg.toFixed(2)}:1)`);
  }

  // Update package.json's contributes.themes to match, single source of truth.
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  pkg.contributes = pkg.contributes || {};
  pkg.contributes.themes = themeEntries
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(({ label, uiTheme, path: p }) => ({ label, uiTheme, path: p }));
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n');

  // Emit theme-list metadata for extension.js (smart toggle + quick pick).
  const metaPath = path.join(__dirname, '..', 'theme-metadata.json');
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      themeEntries
        .slice()
        .sort((a, b) => a.year - b.year || a.mode.localeCompare(b.mode))
        .map(({ label, game, year, mode, slug }) => ({ label, game, year, mode, slug })),
      null,
      2
    ) + '\n'
  );

  console.log(`\n${palettes.length} theme(s) generated.`);
  if (allFailures.length) {
    console.error('\nCONTRAST FAILURES:');
    allFailures.forEach((f) => console.error('  - ' + f));
    process.exitCode = 1;
  } else {
    console.log('All contrast checks passed (>= 4.5:1 for editor fg/bg, comments, sidebar fg/bg).');
  }
}

main();
