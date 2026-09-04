'use strict';

// A Link to the Past (1991) -- Light World
//
// The most literal mapping in this whole project: ALttP is built around an
// actual Light World / Dark World duality, so Light World gets Light and
// Dark World gets Dark almost by definition. The base tone is Hyrule
// Field's bright spring-green grass under open sky, cooler and minty next
// to Zelda II's more yellow-olive overworld map so the two top-down-Hyrule
// light themes don't collide. The three Pendants of Virtue supply the
// primary syntax colors, kept in their actual (slightly mixed-up) in-game
// colors rather than the "expected" Triforce mapping: Pendant of Courage is
// green (keyword), Pendant of Power is blue (function -- Power calling
// abilities), and Pendant of Wisdom is red (string) -- yes, Wisdom is red
// and Power is blue in this particular game, a quirk the games after it
// don't repeat. Numbers take Rupee/Triforce gold. The identity color kept
// constant into Dark World is Crystal blue: the seven Maiden Crystals that
// replace the Pendants in the second half of the game glow the same blue
// whether the geography around them is lush Hyrule or its corrupted
// mirror, so it anchors cursor and focus in both variants. fgComment is
// the moss-weathered green-grey of Hyrule Castle's stonework.

module.exports = {
  slug: 'alttp-light',
  label: 'A Link to the Past Light',
  game: 'A Link to the Past',
  year: 1991,
  tokens: {
    mode: 'light',
    bg: '#D3E8C0',
    fg: '#16321A',
    bgLine: '#C7DEB2',
    bgWidget: '#E0F0D2',
    bgInput: '#F4FAEE',
    bgSidebar: '#CCE2BA',
    bgPanel: '#C8DEB4',
    bgActivity: '#C0D8A8',
    tintHover: '#E8F4DC',
    tintSelect: '#E0C878',
    fgSecondary: '#2E4A32',
    fgMuted: '#6E8868',
    fgVariable: '#1C3A22',
    fgPunct: '#3E5A40',
    fgComment: '#3C5840',
    fgParameter: '#6B4A1E',
    fgProperty: '#2A5A78',
    borderSubtle: '#B8CCA0',
    borderStrong: '#94AC78',
    accentKeyword: '#1E7A3A',
    accentStorage: '#7A5A2E',
    accentString: '#B8241A',
    accentRegex: '#C2570C',
    accentFunction: '#1B5EA8',
    accentFunctionDim: '#5B93C4',
    accentType: '#1E7A6E',
    accentInterface: '#4FA394',
    accentNumber: '#B8860B',
    accentDecorator: '#7A4A9A',
    accentNamespace: '#5C7A8A',
    accentCursor: '#2E86D6',
    accentFocus: '#2E86D6',
    accentBadge: '#D9480F',
    accentButton: '#1B5EA8',
    accentStatusBar: '#8C1A1A',
    colorError: '#B0281C',
    colorWarning: '#C2570C',
    colorInfo: '#5B93C4',
    gitAdd: '#1E7A3A',
    gitDelete: '#B0281C',
    ansi: {
      black: '#1C3A22',
      red: '#7A1810',
      green: '#1E7A3A',
      yellow: '#8C6B0A',
      blue: '#1B5EA8',
      magenta: '#6B3F8A',
      cyan: '#1E7A6E',
      white: '#3E5A40',
      brightBlack: '#6E8868',
      brightRed: '#B0281C',
      brightGreen: '#3FA060',
      brightYellow: '#D4A017',
      brightBlue: '#2E86D6',
      brightMagenta: '#8A5AC4',
      brightCyan: '#4FA394',
      brightWhite: '#16321A',
    },
  },
};
