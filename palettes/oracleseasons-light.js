'use strict';

// Oracle of Seasons (2001) -- Light
//
// Swinging the Rod of Seasons atop a tree stump repaints all of Holodrum in
// four distinct GBC hardware palettes -- and here all four seasons share the
// syntax stage over a soft Spring cherry-blossom canvas: Summer canopy emerald
// (`accentKeyword`), Spring blossom crimson-rose (`accentString`), Winter
// creek cerulean (`accentFunction`), and Autumn harvest russet-gold
// (`accentNumber`), joined by Subrosian Star-Ore teal (`accentType`). Din's
// living flame (#D63E18 -> #FA5C32) stays constant into Dark.

module.exports = {
  slug: 'oracleseasons-light',
  label: 'Oracle of Seasons Light',
  game: 'Oracle of Seasons',
  year: 2001,
  subtitle: "Holodrum Spring cherry-blossom cream, Four Seasons & Din's flame",
  tokens: {
    mode: 'light',
    bg: '#FCE5E7',
    fg: '#162411',
    bgLine: '#F3DADC',
    bgWidget: '#FFEEF0',
    bgInput: '#FFF5F6',
    bgSidebar: '#FADDDE',
    bgPanel: '#F8D9DB',
    bgActivity: '#F4D3D4',
    tintHover: '#F9D2CE',
    tintSelect: '#F9BEB9',
    fgSecondary: '#3F503A',
    fgMuted: '#697664',
    fgVariable: '#1D2E17',
    fgPunct: '#44543F',
    fgComment: '#6E523F',
    fgParameter: '#004A5F',
    fgProperty: '#553510',
    borderSubtle: '#E0C5C7',
    borderStrong: '#9C8082',
    accentKeyword: '#004425',
    accentStorage: '#743B11',
    accentString: '#88004F',
    accentRegex: '#A62914',
    accentFunction: '#174F86',
    accentFunctionDim: '#375F8B',
    accentType: '#067479',
    accentInterface: '#14636C',
    accentNumber: '#8B6000',
    accentDecorator: '#5F2B8C',
    accentNamespace: '#355B6D',
    accentCursor: '#D63E18',
    accentFocus: '#D63E18',
    accentBadge: '#D95E1C',
    accentButton: '#1864A8',
    accentStatusBar: '#9E2B1C',
    colorError: '#61000E',
    colorWarning: '#944E00',
    colorInfo: '#005F98',
    gitAdd: '#00651C',
    gitDelete: '#61000E',
    ansi: {
      black: '#162411',
      red: '#52000A',
      green: '#00651C',
      yellow: '#8C5A00',
      blue: '#005184',
      magenta: '#5F2B8C',
      cyan: '#007271',
      white: '#44543F',
      brightBlack: '#6E523F',
      brightRed: '#61000E',
      brightGreen: '#026F20',
      brightYellow: '#935E00',
      brightBlue: '#1B5D8E',
      brightMagenta: '#693199',
      brightCyan: '#187574',
      brightWhite: '#1D2E17',
    },
  },
};
