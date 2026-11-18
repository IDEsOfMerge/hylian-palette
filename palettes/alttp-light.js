'use strict';

// A Link to the Past (1991) -- Light World
//
// SNES 15-bit BGR555 color gave Hyrule its canonical fairy-tale vibrancy:
// sunbeams piercing Lost Woods fog, Sanctuary stained glass, and the three
// Pendants of Virtue in their quirky, authentic SNES colors -- Courage emerald
// (`accentKeyword`), Power sapphire (`accentFunction`), and Wisdom ruby
// (`accentString`). `accentDecorator` nods to one of 16-bit gaming's favorite
// palette quirks: Link's famous magenta-pink sprite hair. Maiden-Crystal /
// Magic-Mirror azure anchors cursor and focus across Light World and Dark World.

module.exports = {
  slug: 'alttp-light',
  label: 'A Link to the Past Light',
  game: 'A Link to the Past',
  year: 1991,
  subtitle: 'SNES Light World celadon meadow, Three Pendants & pink-haired Link',
  tokens: {
    mode: 'light',
    bg: '#DCF0D9',
    fg: '#142317',
    bgLine: '#D0E7CD',
    bgWidget: '#E7F6E4',
    bgInput: '#EFF9EE',
    bgSidebar: '#D5EACE',
    bgPanel: '#D1E7CA',
    bgActivity: '#CAE2C2',
    tintHover: '#C0E0F4',
    tintSelect: '#A2D5F3',
    fgSecondary: '#3E5040',
    fgMuted: '#677669',
    fgVariable: '#1B2E1E',
    fgPunct: '#435445',
    fgComment: '#4B5D4B',
    fgParameter: '#5D3821',
    fgProperty: '#1C4158',
    borderSubtle: '#BAD3B6',
    borderStrong: '#748D71',
    accentKeyword: '#1B7037',
    accentStorage: '#582E07',
    accentString: '#BE2138',
    accentRegex: '#9E3F00',
    accentFunction: '#044AA7',
    accentFunctionDim: '#2F5EA6',
    accentType: '#004B53',
    accentInterface: '#0D424C',
    accentNumber: '#855E00',
    accentDecorator: '#87216D',
    accentNamespace: '#345B6F',
    accentCursor: '#1E74CC',
    accentFocus: '#1E74CC',
    accentBadge: '#C93B2B',
    accentButton: '#1A56B0',
    accentStatusBar: '#186337',
    colorError: '#760028',
    colorWarning: '#915100',
    colorInfo: '#0A5A9A',
    gitAdd: '#006129',
    gitDelete: '#760028',
    ansi: {
      black: '#142317',
      red: '#660021',
      green: '#006129',
      yellow: '#5A3009',
      blue: '#004894',
      magenta: '#87216D',
      cyan: '#00707C',
      white: '#435445',
      brightBlack: '#4B5D4B',
      brightRed: '#760028',
      brightGreen: '#036B2E',
      brightYellow: '#5F3208',
      brightBlue: '#18549D',
      brightMagenta: '#932677',
      brightCyan: '#167480',
      brightWhite: '#1B2E1E',
    },
  },
};
