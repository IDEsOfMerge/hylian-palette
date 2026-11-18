'use strict';

// The Legend of Zelda (1986) -- Dark
//
// Every labyrinth room in the 1986 original sits on flat un-dithered `$0F` PPU
// black, letting small 3-color sprites pop like stained glass on CRT phosphor.
// This theme honors that stark figure-ground clarity: a warm torchlit charcoal
// canvas (#110D08) paired with high-purity NES dungeon hues -- tunic emerald,
// Red Candle vermilion-orange, Blue Ring azure, Level-9 cyan block walls, and
// radiant Triforce gold. `fgComment` carries the weathered off-gold of the Old
// Man's cave hints ("IT'S A SECRET TO EVERYBODY"), while diagnostic errors
// occupy deep Death-Mountain crimson cleanly separated from string literals.

module.exports = {
  slug: 'zelda1-dark',
  label: 'The Legend of Zelda Dark',
  game: 'The Legend of Zelda',
  year: 1986,
  subtitle: 'NES $0F torchlit dungeon obsidian & 8-bit sprite luminance',
  tokens: {
    mode: 'dark',
    bg: '#140D06',
    fg: '#E1D3B6',
    bgLine: '#1D150D',
    bgWidget: '#231A13',
    bgInput: '#100904',
    bgSidebar: '#1A1109',
    bgPanel: '#191008',
    bgActivity: '#1E130A',
    tintHover: '#2B1901',
    tintSelect: '#3B2300',
    fgSecondary: '#AFA081',
    fgMuted: '#796D57',
    fgVariable: '#DBC8A4',
    fgPunct: '#A6987C',
    fgComment: '#9D8C6D',
    fgParameter: '#8CC8A0',
    fgProperty: '#92C0E8',
    borderSubtle: '#2B2219',
    borderStrong: '#685E53',
    accentKeyword: '#9AE849',
    accentStorage: '#E1A988',
    accentString: '#F16F38',
    accentRegex: '#FFA153',
    accentFunction: '#5DA7FF',
    accentFunctionDim: '#86BCFF',
    accentType: '#0FD8DA',
    accentInterface: '#63E6EF',
    accentNumber: '#FFD88E',
    accentDecorator: '#E27FE5',
    accentNamespace: '#84A7BB',
    accentCursor: '#F0B828',
    accentFocus: '#F0B828',
    accentBadge: '#F26422',
    accentButton: '#3B82D6',
    accentStatusBar: '#4D2418',
    colorError: '#F33E52',
    colorWarning: '#FFA838',
    colorInfo: '#70B7FA',
    gitAdd: '#68CC5F',
    gitDelete: '#F33E52',
    ansi: {
      black: '#1D150D',
      red: '#EA344B',
      green: '#68CC5F',
      yellow: '#CB8F62',
      blue: '#5DA7FF',
      magenta: '#E27FE5',
      cyan: '#1BDBDD',
      white: '#AFA081',
      brightBlack: '#9D8C6D',
      brightRed: '#F33E52',
      brightGreen: '#77E16D',
      brightYellow: '#DD9E6E',
      brightBlue: '#83BBFF',
      brightMagenta: '#F495F6',
      brightCyan: '#55EAEB',
      brightWhite: '#E1D3B6',
    },
  },
};
