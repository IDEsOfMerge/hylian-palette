#!/usr/bin/env node
'use strict';

// Dev-only build tool. Expands a compact per-game "story palette" (~42 named
// tokens with documented lore & perceptual rationale) into full VS Code /
// Positron theme JSON files, using OKLCH perceptual color operations and
// enforcing multi-gate colorimetric validation (WCAG 2.1, APCA, CIEDE2000, CVD).
// Not shipped as a runtime dependency of the extension -- the extension itself
// stays a plain, zero-dependency package (see extension.js). Run with:
//   node scripts/generate-themes.js

const fs = require('fs');
const path = require('path');
const cs = require('./color-science');

const THEMES_DIR = path.join(__dirname, '..', 'themes');
const PALETTES_DIR = path.join(__dirname, '..', 'palettes');
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');

// ---------- perceptual OKLCH color helpers ----------

function alpha(hex, aa) {
  return `${hex.slice(0, 7).toUpperCase()}${aa.toUpperCase()}`;
}

function oklchLighten(hex, dL) {
  return cs.oklchShift(hex, { dL: +Math.abs(dL) });
}

function oklchDarken(hex, dL) {
  return cs.oklchShift(hex, { dL: -Math.abs(dL) });
}

// ---------- ANSI defaults (overridable per palette via t.ansi) ----------

function defaultAnsi(t) {
  return {
    black: t.borderStrong,
    red: oklchDarken(t.colorError, 0.04),
    green: t.gitAdd,
    yellow: t.accentNumber,
    blue: t.accentFunction,
    magenta: t.accentDecorator,
    cyan: t.accentType,
    white: t.fgSecondary,
    brightBlack: t.fgComment,
    brightRed: t.colorError,
    brightGreen: oklchLighten(t.gitAdd, 0.05),
    brightYellow: t.colorWarning,
    brightBlue: t.accentFunctionDim,
    brightMagenta: oklchLighten(t.accentDecorator, 0.05),
    brightCyan: t.accentInterface,
    brightWhite: t.fg,
  };
}

// ---------- workbench + Positron colors block ----------

function buildColors(p) {
  const t = p.tokens;
  const isLight = t.mode === 'light';
  const ansi = { ...defaultAnsi(t), ...(t.ansi || {}) };
  const statusBarFg = cs.readableTextOn(t.accentStatusBar, '#FAF8F5', '#141418');
  const statusBarHover = cs.relLuminance(statusBarFg) > 0.4 ? '#FFFFFF22' : '#00000018';
  const statusBarBorder = oklchDarken(t.accentStatusBar, 0.06);
  const buttonHover = isLight ? oklchDarken(t.accentButton, 0.05) : oklchLighten(t.accentButton, 0.05);
  const fnHover = isLight ? oklchDarken(t.accentFunction, 0.05) : oklchLighten(t.accentFunction, 0.05);
  const errHover = isLight ? oklchDarken(t.colorError, 0.05) : oklchLighten(t.colorError, 0.05);

  return {
    // Base workbench defaults
    foreground: t.fg,
    descriptionForeground: t.fgSecondary,
    disabledForeground: t.fgMuted,
    errorForeground: t.colorError,
    'icon.foreground': t.fgSecondary,
    focusBorder: t.accentFocus,
    'widget.shadow': isLight ? '#0000001F' : '#00000055',
    'sash.hoverBorder': t.accentFocus,
    'selection.background': alpha(t.accentFocus, '40'),

    // Core editor canvas & cursor
    'editor.background': t.bg,
    'editor.foreground': t.fg,
    'editor.lineHighlightBackground': t.bgLine,
    'editor.lineHighlightBorder': '#00000000',
    'editorLineNumber.foreground': t.borderStrong,
    'editorLineNumber.activeForeground': t.fg,
    'editorCursor.foreground': t.accentCursor,
    'editorCursor.background': t.bg,
    'editor.selectionBackground': alpha(t.accentFocus, '40'),
    'editor.selectionHighlightBackground': alpha(t.accentFocus, '20'),
    'editor.inactiveSelectionBackground': alpha(t.accentFocus, '1A'),
    'editor.wordHighlightBackground': alpha(t.accentFunction, '22'),
    'editor.wordHighlightStrongBackground': alpha(t.accentFunction, '38'),
    'editor.findMatchBackground': alpha(t.accentBadge, '58'),
    'editor.findMatchHighlightBackground': alpha(t.accentBadge, '2E'),
    'editor.findMatchBorder': t.accentBadge,
    'editor.hoverHighlightBackground': alpha(t.accentFocus, '1A'),
    'editorLink.activeForeground': t.accentFocus,

    // Sticky scroll, inlay hints, ghost text & code lens
    'editorStickyScroll.background': t.bg,
    'editorStickyScrollHover.background': t.bgLine,
    'editorStickyScroll.border': t.borderSubtle,
    'editorInlayHint.foreground': t.fgSecondary,
    'editorInlayHint.background': alpha(t.borderSubtle, '66'),
    'editorInlayHint.typeForeground': t.accentInterface,
    'editorInlayHint.parameterForeground': t.fgParameter,
    'editorGhostText.foreground': t.fgMuted,
    'editorCodeLens.foreground': t.fgComment,
    'editorLightBulb.foreground': t.colorWarning,
    'editorLightBulbAutoFix.foreground': t.accentType,

    // Brackets, guides, gutter & overview ruler
    'editorBracketMatch.background': alpha(t.accentFocus, '28'),
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
    'editorGutter.background': t.bg,
    'editorGutter.addedBackground': t.gitAdd,
    'editorGutter.modifiedBackground': t.accentFunction,
    'editorGutter.deletedBackground': t.gitDelete,
    'editorOverviewRuler.border': t.borderSubtle,
    'editorOverviewRuler.errorForeground': t.colorError,
    'editorOverviewRuler.warningForeground': t.colorWarning,
    'editorOverviewRuler.infoForeground': t.colorInfo,
    'editorOverviewRuler.addedForeground': alpha(t.gitAdd, 'CC'),
    'editorOverviewRuler.modifiedForeground': alpha(t.accentFunction, 'CC'),
    'editorOverviewRuler.deletedForeground': alpha(t.gitDelete, 'CC'),
    'editorOverviewRuler.findMatchForeground': alpha(t.accentBadge, 'CC'),

    // Tabs & breadcrumbs
    'editorGroup.border': t.borderSubtle,
    'editorGroupHeader.tabsBackground': t.bgActivity,
    'editorGroupHeader.tabsBorder': t.borderSubtle,
    'tab.activeBackground': t.bg,
    'tab.activeForeground': t.fg,
    'tab.inactiveBackground': t.bgActivity,
    'tab.inactiveForeground': t.fgSecondary,
    'tab.hoverBackground': t.tintHover,
    'tab.border': t.borderSubtle,
    'tab.activeBorderTop': t.accentFocus,
    'tab.activeModifiedBorder': t.accentBadge,
    'tab.unfocusedActiveForeground': t.fgSecondary,
    'breadcrumb.background': t.bg,
    'breadcrumb.foreground': t.fgSecondary,
    'breadcrumb.focusForeground': t.fg,
    'breadcrumb.activeSelectionForeground': t.accentFunction,

    // Minimap & scrollbars
    'minimap.background': t.bg,
    'minimap.selectionHighlight': alpha(t.accentFocus, '55'),
    'minimap.findMatchHighlight': alpha(t.accentBadge, 'AA'),
    'minimap.errorHighlight': alpha(t.colorError, 'AA'),
    'minimap.warningHighlight': alpha(t.colorWarning, 'AA'),
    'minimapSlider.background': alpha(t.fg, '1F'),
    'minimapSlider.hoverBackground': alpha(t.fg, '36'),
    'minimapSlider.activeBackground': alpha(t.fg, '4D'),
    'scrollbar.shadow': isLight ? '#00000014' : '#00000044',
    'scrollbarSlider.background': alpha(t.fg, '22'),
    'scrollbarSlider.hoverBackground': alpha(t.fg, '38'),
    'scrollbarSlider.activeBackground': alpha(t.fg, '50'),

    // Sidebar, activity bar, status bar & title bar
    'sideBar.background': t.bgSidebar,
    'sideBar.foreground': t.fg,
    'sideBar.border': t.borderSubtle,
    'sideBarTitle.foreground': t.fg,
    'sideBarSectionHeader.background': t.bgPanel,
    'sideBarSectionHeader.foreground': t.fg,
    'sideBarSectionHeader.border': t.borderSubtle,

    'activityBar.background': t.bgActivity,
    'activityBar.foreground': t.accentFocus,
    'activityBar.inactiveForeground': t.fgSecondary,
    'activityBar.border': t.borderSubtle,
    'activityBar.activeBorder': t.accentFocus,
    'activityBarBadge.background': t.accentBadge,
    'activityBarBadge.foreground': cs.readableTextOn(t.accentBadge),

    'statusBar.background': t.accentStatusBar,
    'statusBar.foreground': statusBarFg,
    'statusBar.border': statusBarBorder,
    'statusBar.noFolderBackground': t.accentKeyword,
    'statusBar.noFolderForeground': cs.readableTextOn(t.accentKeyword),
    'statusBar.debuggingBackground': t.colorError,
    'statusBar.debuggingForeground': cs.readableTextOn(t.colorError),
    'statusBarItem.hoverBackground': statusBarHover,
    'statusBarItem.remoteBackground': t.accentType,
    'statusBarItem.remoteForeground': cs.readableTextOn(t.accentType),

    'titleBar.activeBackground': t.bgActivity,
    'titleBar.activeForeground': t.fg,
    'titleBar.inactiveBackground': t.bgSidebar,
    'titleBar.inactiveForeground': t.fgSecondary,
    'titleBar.border': t.borderSubtle,

    // Command Center
    'commandCenter.foreground': t.fg,
    'commandCenter.activeForeground': t.fg,
    'commandCenter.background': t.bgInput,
    'commandCenter.activeBackground': t.tintHover,
    'commandCenter.border': t.borderSubtle,
    'commandCenter.inactiveForeground': t.fgSecondary,
    'commandCenter.inactiveBorder': alpha(t.borderSubtle, '99'),
    'commandCenter.activeBorder': t.accentFocus,

    // Panels & integrated terminal
    'panel.background': t.bgPanel,
    'panel.border': t.borderSubtle,
    'panelTitle.activeForeground': t.fg,
    'panelTitle.activeBorder': t.accentFocus,
    'panelTitle.inactiveForeground': t.fgSecondary,
    'terminal.background': t.bg,
    'terminal.foreground': t.fg,
    'terminal.border': t.borderSubtle,
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
    'terminalStickyScroll.background': t.bg,
    'terminalStickyScrollHover.background': t.bgLine,
    'terminalStickyScroll.border': t.borderSubtle,
    'terminalCommandDecoration.defaultBackground': t.fgMuted,
    'terminalCommandDecoration.successBackground': t.gitAdd,
    'terminalCommandDecoration.errorBackground': t.colorError,

    // Lists & trees
    'list.activeSelectionBackground': t.tintSelect,
    'list.activeSelectionForeground': t.fg,
    'list.inactiveSelectionBackground': cs.oklchMix(t.tintSelect, t.bgSidebar, 0.42),
    'list.inactiveSelectionForeground': t.fg,
    'list.hoverBackground': t.tintHover,
    'list.hoverForeground': t.fg,
    'list.focusOutline': t.accentFocus,
    'list.highlightForeground': t.accentFunction,
    'list.errorForeground': t.colorError,
    'list.warningForeground': t.colorWarning,
    'tree.indentGuidesStroke': t.borderSubtle,

    // Inputs, dropdowns, buttons & badges
    'input.background': t.bgInput,
    'input.foreground': t.fg,
    'input.border': t.borderSubtle,
    'input.placeholderForeground': t.fgMuted,
    'inputOption.activeBorder': t.accentFocus,
    'inputOption.activeBackground': alpha(t.accentFocus, '26'),
    'inputOption.activeForeground': t.fg,
    'dropdown.background': t.bgWidget,
    'dropdown.foreground': t.fg,
    'dropdown.border': t.borderSubtle,

    'button.background': t.accentButton,
    'button.foreground': cs.readableTextOn(t.accentButton),
    'button.hoverBackground': buttonHover,
    'button.secondaryBackground': t.bgPanel,
    'button.secondaryForeground': t.fg,
    'button.secondaryHoverBackground': t.tintHover,
    'badge.background': t.accentBadge,
    'badge.foreground': cs.readableTextOn(t.accentBadge),
    'progressBar.background': t.accentFocus,

    // Popups, hover, suggest, quick input & peek view
    'notifications.background': t.bgWidget,
    'notifications.foreground': t.fg,
    'notifications.border': t.borderSubtle,
    'notificationsErrorIcon.foreground': t.colorError,
    'notificationsWarningIcon.foreground': t.colorWarning,
    'notificationsInfoIcon.foreground': t.colorInfo,

    'editorWidget.background': t.bgWidget,
    'editorWidget.foreground': t.fg,
    'editorWidget.border': t.borderSubtle,
    'editorHoverWidget.background': t.bgWidget,
    'editorHoverWidget.foreground': t.fg,
    'editorHoverWidget.border': t.borderSubtle,
    'editorSuggestWidget.background': t.bgWidget,
    'editorSuggestWidget.foreground': t.fg,
    'editorSuggestWidget.border': t.borderSubtle,
    'editorSuggestWidget.selectedBackground': t.tintSelect,
    'editorSuggestWidget.selectedForeground': t.fg,
    'editorSuggestWidget.highlightForeground': t.accentFunction,
    'quickInput.background': t.bgWidget,
    'quickInput.foreground': t.fg,
    'quickInputList.focusBackground': t.tintSelect,
    'quickInputList.focusForeground': t.fg,
    'pickerGroup.foreground': t.accentFunction,
    'pickerGroup.border': t.borderSubtle,

    'peekView.border': t.accentFocus,
    'peekViewEditor.background': t.bgSidebar,
    'peekViewEditor.matchHighlightBackground': alpha(t.accentBadge, '44'),
    'peekViewResult.background': t.bgPanel,
    'peekViewResult.fileForeground': t.fg,
    'peekViewResult.lineForeground': t.fgSecondary,
    'peekViewResult.selectionBackground': t.tintSelect,
    'peekViewResult.selectionForeground': t.fg,
    'peekViewTitle.background': t.bgActivity,
    'peekViewTitleLabel.foreground': t.fg,
    'peekViewTitleDescription.foreground': t.fgSecondary,

    // Diff, merge, git, notebooks & charts
    'diffEditor.insertedTextBackground': alpha(t.gitAdd, '26'),
    'diffEditor.removedTextBackground': alpha(t.gitDelete, '26'),
    'diffEditor.insertedLineBackground': alpha(t.gitAdd, '18'),
    'diffEditor.removedLineBackground': alpha(t.gitDelete, '18'),
    'diffEditor.border': t.borderSubtle,
    'merge.currentHeaderBackground': alpha(t.gitAdd, '44'),
    'merge.currentContentBackground': alpha(t.gitAdd, '1C'),
    'merge.incomingHeaderBackground': alpha(t.accentFunction, '44'),
    'merge.incomingContentBackground': alpha(t.accentFunction, '1C'),
    'gitDecoration.addedResourceForeground': t.gitAdd,
    'gitDecoration.modifiedResourceForeground': t.accentFunction,
    'gitDecoration.deletedResourceForeground': t.gitDelete,
    'gitDecoration.untrackedResourceForeground': t.accentType,
    'gitDecoration.ignoredResourceForeground': t.fgMuted,
    'gitDecoration.conflictingResourceForeground': t.colorWarning,
    'gitDecoration.stageModifiedResourceForeground': t.accentInterface,
    'gitDecoration.stageDeletedResourceForeground': t.colorError,

    'notebook.editorBackground': t.bg,
    'notebook.cellEditorBackground': t.bg,
    'notebook.cellBorderColor': t.borderSubtle,
    'notebook.focusedCellBorder': t.accentFocus,
    'notebook.cellStatusBarItemHoverBackground': t.tintHover,
    'notebookStatusSuccessIcon.foreground': t.gitAdd,
    'notebookStatusErrorIcon.foreground': t.colorError,
    'notebookStatusRunningIcon.foreground': t.accentFunction,

    'charts.foreground': t.fg,
    'charts.lines': t.borderStrong,
    'charts.red': t.colorError,
    'charts.blue': t.accentFunction,
    'charts.yellow': t.colorWarning,
    'charts.orange': t.accentRegex,
    'charts.green': t.gitAdd,
    'charts.purple': t.accentDecorator,

    'textLink.foreground': t.accentFunction,
    'textLink.activeForeground': t.accentInterface,
    'textPreformat.foreground': t.accentType,
    'textBlockQuote.background': t.bgSidebar,
    'textBlockQuote.border': t.accentFocus,

    // AI Chat & Inline Chat
    'chat.requestBorder': t.borderSubtle,
    'chat.requestBackground': cs.oklchMix(t.bg, t.bgSidebar, 0.55),
    'chat.slashCommandBackground': alpha(t.accentFunction, '24'),
    'chat.slashCommandForeground': t.accentFunction,
    'chat.avatarBackground': t.accentButton,
    'chat.avatarForeground': cs.readableTextOn(t.accentButton),
    'chat.editedFileForeground': t.colorWarning,
    'inlineChat.background': t.bgWidget,
    'inlineChat.foreground': t.fg,
    'inlineChat.border': t.borderStrong,
    'inlineChat.shadow': isLight ? '#0000001F' : '#00000055',
    'inlineChatInput.border': t.borderSubtle,
    'inlineChatInput.focusBorder': t.accentFocus,
    'inlineChatInput.placeholderForeground': t.fgMuted,
    'inlineChatInput.background': t.bgInput,
    'inlineChatDiff.inserted': alpha(t.gitAdd, '26'),
    'inlineChatDiff.removed': alpha(t.gitDelete, '26'),

    // Test Explorer
    'testing.iconFailed': t.colorError,
    'testing.iconErrored': t.colorError,
    'testing.iconPassed': t.gitAdd,
    'testing.runAction': t.gitAdd,
    'testing.iconQueued': t.colorWarning,
    'testing.iconUnset': t.fgMuted,
    'testing.iconSkipped': t.fgMuted,
    'testing.peekBorder': t.colorError,
    'testing.peekHeaderBackground': alpha(t.colorError, '1A'),
    'testing.message.error.lineBackground': alpha(t.colorError, '1F'),
    'testing.message.info.decorationForeground': t.colorInfo,

    // Confirmed Positron IDE workbench tokens (validated against posit-dev/positron)
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
    'positronModalDialog.buttonHoverBackground': buttonHover,
    'positronModalDialog.defaultButtonBackground': t.accentFunction,
    'positronModalDialog.defaultButtonHoverBackground': fnHover,
    'positronModalDialog.buttonActiveBackground': oklchDarken(t.accentButton, 0.08),
    'positronModalDialog.buttonDisabledBackground': alpha(t.fgMuted, '40'),
    'positronModalDialog.buttonForeground': cs.readableTextOn(t.accentButton),
    'positronModalDialog.defaultButtonForeground': cs.readableTextOn(t.accentFunction),
    'positronModalDialog.buttonDestructiveBackground': t.colorError,
    'positronModalDialog.buttonDestructiveHoverBackground': errHover,
    'positronModalDialog.buttonDestructiveForeground': cs.readableTextOn(t.colorError),
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
    'positronVariables.inactiveSelectionBackground': cs.oklchMix(t.tintSelect, t.bgSidebar, 0.42),
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

// ---------- tokenColors / semanticTokenColors ----------

function buildTokenColors(t) {
  return [
    { scope: ['comment', 'comment.line', 'comment.block'], settings: { foreground: t.fgComment, fontStyle: 'italic' } },
    { scope: ['comment.block.documentation', 'comment.documentation', 'comment.line.roxygen.r'], settings: { foreground: t.fgComment, fontStyle: 'italic' } },
    { scope: ['comment.block.documentation storage.type.class', 'comment.block.documentation keyword', 'punctuation.definition.tag.documentation', 'keyword.other.documentation.roxygen.r'], settings: { foreground: t.accentType, fontStyle: 'bold italic' } },
    { scope: ['keyword.control', 'keyword.control.flow', 'keyword.control.import', 'keyword.control.export', 'keyword.control.conditional', 'keyword.control.loop', 'keyword', 'keyword.other'], settings: { foreground: t.accentKeyword, fontStyle: 'bold' } },
    { scope: ['keyword.operator.pipe.r', 'keyword.operator.pipe', 'keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.wordlike'], settings: { foreground: t.accentKeyword, fontStyle: 'bold' } },
    { scope: ['keyword.operator', 'keyword.operator.assignment', 'keyword.operator.comparison', 'keyword.operator.logical', 'keyword.operator.arithmetic'], settings: { foreground: t.fgPunct } },
    { scope: ['storage.type', 'storage'], settings: { foreground: t.accentStorage, fontStyle: 'bold' } },
    { scope: ['storage.modifier'], settings: { foreground: t.accentStorage, fontStyle: 'italic' } },
    { scope: ['string.quoted', 'string.template', 'string', 'string.interpolated'], settings: { foreground: t.accentString } },
    { scope: ['string.regexp'], settings: { foreground: t.accentRegex } },
    { scope: ['constant.character.escape', 'punctuation.definition.template-expression'], settings: { foreground: t.accentFunctionDim } },
    { scope: ['constant.numeric', 'constant.numeric.integer', 'constant.numeric.float', 'constant.numeric.hex'], settings: { foreground: t.accentNumber } },
    { scope: ['constant.language.boolean', 'constant.language', 'constant.language.r', 'constant.language.python'], settings: { foreground: t.accentNumber, fontStyle: 'bold' } },
    { scope: ['constant.other', 'constant.other.enummember', 'constant.other.symbol', 'constant.other.color.rgb-value.hex.css'], settings: { foreground: t.accentType } },
    { scope: ['entity.name.function', 'meta.function-call', 'support.function', 'support.function.r'], settings: { foreground: t.accentFunction } },
    { scope: ['support.function.builtin', 'support.function.magic', 'support.function.magic.python'], settings: { foreground: t.accentFunctionDim } },
    { scope: ['entity.name.function.member', 'meta.method', 'meta.function-call.method'], settings: { foreground: t.accentFunction } },
    { scope: ['variable', 'variable.other.readwrite', 'variable.other.object', 'variable.other.r'], settings: { foreground: t.fgVariable } },
    { scope: ['variable.language', 'variable.language.this', 'variable.language.self', 'variable.parameter.function.language.special.self.python'], settings: { foreground: t.fgVariable, fontStyle: 'italic bold' } },
    { scope: ['variable.parameter', 'variable.parameter.function', 'variable.parameter.r'], settings: { foreground: t.fgParameter, fontStyle: 'italic' } },
    { scope: ['variable.other.property', 'variable.other.object.property', 'meta.object-literal.key', 'variable.other.member'], settings: { foreground: t.fgProperty } },
    { scope: ['entity.name.type.class', 'entity.name.class', 'support.class'], settings: { foreground: t.accentType, fontStyle: 'bold' } },
    { scope: ['entity.name.type', 'support.type', 'support.type.python'], settings: { foreground: t.accentType } },
    { scope: ['entity.name.type.interface', 'entity.name.type.type-parameter'], settings: { foreground: t.accentInterface, fontStyle: 'italic' } },
    { scope: ['entity.name.type.enum'], settings: { foreground: t.accentType, fontStyle: 'bold' } },
    { scope: ['entity.name.namespace', 'entity.name.type.module', 'entity.name.type.namespace', 'support.other.namespace.r'], settings: { foreground: t.accentNamespace } },
    { scope: ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'], settings: { foreground: t.accentDecorator, fontStyle: 'italic' } },
    { scope: ['punctuation', 'punctuation.separator', 'punctuation.terminator', 'punctuation.definition'], settings: { foreground: t.fgPunct } },
    { scope: ['punctuation.definition.tag'], settings: { foreground: t.fgPunct } },
    { scope: ['entity.name.tag', 'entity.name.tag.yaml'], settings: { foreground: t.accentFunction } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: t.accentNumber, fontStyle: 'italic' } },
    { scope: ['support.type.property-name.json', 'support.type.property-name', 'support.type.property-name.toml', 'support.type.property-name.css'], settings: { foreground: t.accentFunction } },
    { scope: ['markup.heading', 'punctuation.definition.heading.markdown'], settings: { foreground: t.accentKeyword, fontStyle: 'bold' } },
    { scope: ['markup.bold'], settings: { foreground: t.fg, fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { foreground: t.fg, fontStyle: 'italic' } },
    { scope: ['markup.underline.link', 'string.other.link.title.markdown'], settings: { foreground: t.accentFunction, fontStyle: 'underline' } },
    { scope: ['markup.quote'], settings: { foreground: t.fgComment, fontStyle: 'italic' } },
    { scope: ['markup.list'], settings: { foreground: t.fgPunct } },
    { scope: ['markup.inline.raw', 'markup.raw'], settings: { foreground: t.accentType } },
    { scope: ['markup.fenced_code.block', 'markup.code'], settings: { foreground: t.accentString } },
    { scope: ['fenced_code.block.language', 'fenced_code.block.language.markdown'], settings: { foreground: t.accentInterface, fontStyle: 'italic' } },
    { scope: ['markup.inserted', 'punctuation.definition.inserted'], settings: { foreground: t.gitAdd } },
    { scope: ['markup.deleted', 'punctuation.definition.deleted'], settings: { foreground: t.gitDelete } },
    { scope: ['markup.changed', 'punctuation.definition.changed'], settings: { foreground: t.colorWarning } },
    { scope: ['invalid', 'invalid.illegal'], settings: { foreground: t.colorError } },
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

// ---------- driver ----------

// Release-date tiebreaker for same-year releases (Oracle of Seasons & Ages, Feb 2001)
const GAME_CHRONO_ORDER = [
  'The Legend of Zelda',
  'Zelda II: The Adventure of Link',
  'A Link to the Past',
  "Link's Awakening",
  'Ocarina of Time',
  "Majora's Mask",
  'Oracle of Seasons',
  'Oracle of Ages',
  'The Wind Waker',
  'The Minish Cap',
  'Twilight Princess',
  'Phantom Hourglass',
  'Spirit Tracks',
  'Skyward Sword',
  'A Link Between Worlds',
  'Breath of the Wild',
  'Tears of the Kingdom',
  'Echoes of Wisdom',
];

// Canonical 5 Hardware Eras (1-to-1 with all 18 mainline games)
const ERA_BY_GAME = {
  'The Legend of Zelda': '8-bit & 16-bit',
  'Zelda II: The Adventure of Link': '8-bit & 16-bit',
  'A Link to the Past': '8-bit & 16-bit',
  "Link's Awakening": 'Handheld',
  'Oracle of Seasons': 'Handheld',
  'Oracle of Ages': 'Handheld',
  'The Minish Cap': 'Handheld',
  'Ocarina of Time': 'N64 & GameCube',
  "Majora's Mask": 'N64 & GameCube',
  'The Wind Waker': 'N64 & GameCube',
  'Twilight Princess': 'N64 & GameCube',
  'Phantom Hourglass': 'Nintendo DS',
  'Spirit Tracks': 'Nintendo DS',
  'Skyward Sword': 'Modern',
  'A Link Between Worlds': 'Modern',
  'Breath of the Wild': 'Modern',
  'Tears of the Kingdom': 'Modern',
  'Echoes of Wisdom': 'Modern',
};

// Canonical 5 Official Zelda Timeline Branches (Hyrule Historia + Echoes of Wisdom)
const TIMELINE_BY_GAME = {
  'Skyward Sword': 'Unified',
  'The Minish Cap': 'Unified',
  'Ocarina of Time': 'Unified',
  "Majora's Mask": 'Child',
  'Twilight Princess': 'Child',
  'The Wind Waker': 'Adult',
  'Phantom Hourglass': 'Adult',
  'Spirit Tracks': 'Adult',
  'A Link to the Past': 'Downfall',
  "Link's Awakening": 'Downfall',
  'Oracle of Seasons': 'Downfall',
  'Oracle of Ages': 'Downfall',
  'A Link Between Worlds': 'Downfall',
  'Echoes of Wisdom': 'Downfall',
  'The Legend of Zelda': 'Downfall',
  'Zelda II: The Adventure of Link': 'Downfall',
  'Breath of the Wild': 'Era of the Wilds',
  'Tears of the Kingdom': 'Era of the Wilds',
};

// 13 syntax roles used for per-mode CIEDE2000 theme similarity (identical across JS/Python/R)
const SIMILARITY_ROLES = [
  'accentKeyword', 'accentStorage', 'accentString', 'accentRegex',
  'accentFunction', 'accentFunctionDim', 'accentType', 'accentInterface',
  'accentNumber', 'accentDecorator', 'accentNamespace', 'colorError', 'colorWarning',
];

// 1993 Game Boy DMG-01 olive LCD monochrome tribute — excluded from polychromatic farthest slot
const MONOCHROME_OUTLIER_SLUG = 'linksawakening-dark';

function loadPalettes() {
  return fs.readdirSync(PALETTES_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort()
    .map((f) => require(path.join(PALETTES_DIR, f)));
}

/**
 * Computes per-mode 13-role CIEDE2000 chromatic neighbors (top 6 ascending)
 * and farthest polychromatic theme (excluding MONOCHROME_OUTLIER_SLUG) for
 * every palette so extension.js can power "Pick Similar Theme" with zero
 * runtime color math.
 *
 * Sorts by exact unrounded mean ΔE₀₀ (with slug tiebreaker) before rounding to
 * 1 decimal so results are strictly invariant to palette input ordering.
 */
function computeThemeSimilarityMetadata(palettes) {
  const labBySlug = new Map(
    palettes.map((p) => [p.slug, SIMILARITY_ROLES.map((r) => cs.hexToLab(p.tokens[r]))])
  );
  const neighborsBySlug = new Map();
  const farthestBySlug = new Map();

  for (const mode of ['light', 'dark']) {
    const pool = palettes.filter((p) => p.tokens.mode === mode);
    for (let i = 0; i < pool.length; i++) {
      const a = pool[i];
      const la = labBySlug.get(a.slug);
      const dists = [];
      for (let j = 0; j < pool.length; j++) {
        if (i === j) continue;
        const b = pool[j];
        const lb = labBySlug.get(b.slug);
        let sum = 0;
        for (let k = 0; k < la.length; k++) sum += cs.ciede2000(la[k], lb[k]);
        const rawDe = sum / la.length;
        dists.push({ slug: b.slug, rawDe, de: Math.round(rawDe * 10) / 10 });
      }
      dists.sort((x, y) => x.rawDe - y.rawDe || x.slug.localeCompare(y.slug));
      neighborsBySlug.set(
        a.slug,
        dists.slice(0, 6).map(({ slug, de }) => ({ slug, de }))
      );
      const farPool = dists.filter((d) => d.slug !== MONOCHROME_OUTLIER_SLUG);
      const far = farPool[farPool.length - 1] || dists[dists.length - 1] || null;
      farthestBySlug.set(a.slug, far ? { slug: far.slug, de: far.de } : null);
    }
  }

  return { neighborsBySlug, farthestBySlug };
}

function main() {
  const palettes = loadPalettes();
  const allFailures = [];
  const themeEntries = [];

  if (!fs.existsSync(THEMES_DIR)) fs.mkdirSync(THEMES_DIR, { recursive: true });

  for (const p of palettes) {
    const era = ERA_BY_GAME[p.game];
    const timeline = TIMELINE_BY_GAME[p.game];
    if (!era) {
      throw new Error(`Missing ERA_BY_GAME mapping for game "${p.game}" (${p.slug})`);
    }
    if (!timeline) {
      throw new Error(`Missing TIMELINE_BY_GAME mapping for game "${p.game}" (${p.slug})`);
    }

    const audit = cs.auditPalette(p);
    allFailures.push(...audit.errors);

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

    const m = audit.metrics;
    themeEntries.push({
      label: p.label,
      uiTheme: p.tokens.mode === 'light' ? 'vs' : 'vs-dark',
      path: `./themes/${fileName}`,
      game: p.game,
      era,
      timeline,
      year: p.year,
      mode: p.tokens.mode,
      slug: p.slug,
      subtitle: p.subtitle || '',
    });
    console.log(
      `generated ${fileName.padEnd(40)} (fg/bg ${m.fgBg.toFixed(2)}:1, Lc ${m.fgLc.toFixed(1)}, comment ${m.commentBg.toFixed(2)}:1, minSyntax ${m.minSyntaxCr.toFixed(2)}:1)`
    );
  }

  // Update package.json's contributes.themes to match, single source of truth.
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  pkg.contributes = pkg.contributes || {};
  pkg.contributes.themes = themeEntries
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(({ label, uiTheme, path: p }) => ({ label, uiTheme, path: p }));
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n');

  const { neighborsBySlug, farthestBySlug } = computeThemeSimilarityMetadata(palettes);

  // Emit theme-list metadata for extension.js (smart toggle + live-preview quick picks).
  const metaPath = path.join(__dirname, '..', 'theme-metadata.json');
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      themeEntries
        .slice()
        .sort((a, b) => {
          const giA = GAME_CHRONO_ORDER.indexOf(a.game);
          const giB = GAME_CHRONO_ORDER.indexOf(b.game);
          if (a.year !== b.year) return a.year - b.year;
          if (giA !== giB) return giA - giB;
          if (a.mode !== b.mode) return a.mode === 'light' ? -1 : 1; // Light before Dark
          return a.label.localeCompare(b.label);
        })
        .map(({ label, game, era, timeline, year, mode, slug, subtitle }) => ({
          label,
          game,
          era,
          timeline,
          year,
          mode,
          slug,
          subtitle,
          neighbors: neighborsBySlug.get(slug) || [],
          farthest: farthestBySlug.get(slug) || null,
        })),
      null,
      2
    ) + '\n'
  );

  console.log(`\n${palettes.length} theme(s) generated.`);
  if (allFailures.length) {
    console.error('\nPERCEPTUAL / CONTRAST AUDIT FAILURES:');
    allFailures.forEach((f) => console.error('  - ' + f));
    process.exitCode = 1;
  } else {
    console.log('All perceptual gates passed (WCAG >= 4.5:1 across all 20 text/syntax roles + ANSI, APCA |Lc|, CIEDE2000 & CVD separation).');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  ERA_BY_GAME,
  TIMELINE_BY_GAME,
  GAME_CHRONO_ORDER,
  SIMILARITY_ROLES,
  MONOCHROME_OUTLIER_SLUG,
  loadPalettes,
  buildColors,
  buildTokenColors,
  buildSemanticTokenColors,
  computeThemeSimilarityMetadata,
  main,
};
