'use strict';

// Twilight Princess (2006) -- Dark
//
// The Twilight Realm. Deliberately desaturated -- murky brown-black fog,
// sickly muted greens, decayed crimson -- because that IS the game's real
// art direction here: everything drains to near-monochrome under the
// Twilight, with exactly one vivid color allowed through. That color is
// Midna's orange (accentCursor/accentFocus), which is why it's the single
// most saturated token in this entire palette while everything around it
// stays deliberately muted. It's kept exactly constant with Twilight
// Princess Light, just brightened, since Midna's magic is the one thread
// that ties both worlds together.

module.exports = {
  slug: 'twilight-princess-dark',
  label: 'Twilight Princess Dark',
  game: 'Twilight Princess',
  year: 2006,
  tokens: {
    mode: 'dark',
    bg: '#14100C',
    fg: '#C4B8A0',
    bgLine: '#201A14',
    bgWidget: '#241E16',
    bgInput: '#1A1610',
    bgSidebar: '#1C1712',
    bgPanel: '#18140F',
    bgActivity: '#201A12',
    tintHover: '#2C2418',
    tintSelect: '#382A14',
    fgSecondary: '#8A7C64',
    fgMuted: '#564E3E',
    fgVariable: '#B0A488',
    fgPunct: '#7A6E58',
    fgComment: '#8A7E68',
    fgParameter: '#8A9C7A',
    fgProperty: '#9C8C74',
    borderSubtle: '#302A20',
    borderStrong: '#4A4232',
    accentKeyword: '#5A7048',
    accentStorage: '#5A7048',
    accentString: '#A0402E',
    accentRegex: '#8A5028',
    accentFunction: '#3E5E78',
    accentFunctionDim: '#5E7E98',
    accentType: '#B0824A',
    accentInterface: '#D0A468',
    accentNumber: '#A08838',
    accentDecorator: '#5A6A48',
    accentNamespace: '#7A6E58',
    accentCursor: '#FF7A1E',
    accentFocus: '#FF7A1E',
    accentBadge: '#E8C020',
    accentButton: '#3E5E78',
    accentStatusBar: '#2A2216',
    colorError: '#C0503A',
    colorWarning: '#E8C020',
    colorInfo: '#5E7E98',
    gitAdd: '#5A7048',
    gitDelete: '#C0503A',
    ansi: {
      black: '#201A14',
      red: '#A0402E',
      green: '#5A7048',
      yellow: '#A08838',
      blue: '#3E5E78',
      magenta: '#8A6060',
      cyan: '#4A7868',
      white: '#8A7C64',
      brightBlack: '#564E3E',
      brightRed: '#C0503A',
      brightGreen: '#7A9058',
      brightYellow: '#C0A048',
      brightBlue: '#5E7E98',
      brightMagenta: '#A87878',
      brightCyan: '#6A9888',
      brightWhite: '#C4B8A0',
    },
  },
};
