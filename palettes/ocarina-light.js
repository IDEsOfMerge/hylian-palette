'use strict';

// Ocarina of Time (1998) -- Light
//
// Signature story: the three Spiritual Stones map onto the three primary
// syntax roles -- Kokiri EMERALD (green, entrusted by the Great Deku Tree)
// for keywords, Goron RUBY (red, guarded by Darunia) for strings, Zora
// SAPPHIRE (blue, guarded by Princess Ruto) for functions. Types/classes use
// the teal of the Ocarina of Time itself -- the game's title item. Numbers
// use Rupee gold (the series' value-color economy). Decorators use Navi's
// fairy-light. The base tone is the carved-sandstone Temple of Time /
// pause-menu aesthetic (moss-tinted stone), deliberately cooler and greener
// than Wind Waker's warm parchment so the two N64/GC-era light themes don't
// read as reskins. Triforce gold is the one constant "identity" accent kept
// unchanged between this Light theme and Ocarina of Time Dark.

module.exports = {
  slug: 'ocarina-light',
  label: 'Ocarina of Time Light',
  game: 'Ocarina of Time',
  year: 1998,
  tokens: {
    mode: 'light',
    bg: '#DEDCC6',
    fg: '#1E2A22',
    bgLine: '#D3D1B8',
    bgWidget: '#E8E6D0',
    bgInput: '#FAFAF0',
    bgSidebar: '#E2E8D8',
    bgPanel: '#DCE3D2',
    bgActivity: '#D5DCC5',
    tintHover: '#EDE4B8',
    tintSelect: '#E6D89A',
    fgSecondary: '#4A5A4A',
    fgMuted: '#8A9583',
    fgVariable: '#2A3D2F',
    fgPunct: '#556354',
    fgComment: '#4F5C4F',
    fgParameter: '#2F5A52',
    fgProperty: '#3A5548',
    borderSubtle: '#C7C4A4',
    borderStrong: '#A8A47C',
    accentKeyword: '#1B7A4D',
    accentStorage: '#6B4423',
    accentString: '#B5231A',
    accentRegex: '#C2410C',
    accentFunction: '#0F5E9C',
    accentFunctionDim: '#4A90C4',
    accentType: '#1E7A6E',
    accentInterface: '#4FA394',
    accentNumber: '#B8860B',
    accentDecorator: '#7EC8C3',
    accentNamespace: '#5C7A8A',
    accentCursor: '#C9A227',
    accentFocus: '#C9A227',
    accentBadge: '#D9480F',
    accentButton: '#0F5E9C',
    accentStatusBar: '#1B6CA8',
    colorError: '#C0392B',
    colorWarning: '#D9480F',
    colorInfo: '#4A90C4',
    gitAdd: '#1B7A4D',
    gitDelete: '#C0392B',
    ansi: {
      black: '#2A3327',
      red: '#8E1B14',
      green: '#1B7A4D',
      yellow: '#8A6508',
      blue: '#0F5E9C',
      magenta: '#6B4A8A',
      cyan: '#1E7A6E',
      white: '#5A6B5C',
      brightBlack: '#6B7A6E',
      brightRed: '#C0392B',
      brightGreen: '#2FA06A',
      brightYellow: '#C9A227',
      brightBlue: '#4A90C4',
      brightMagenta: '#8A6BAA',
      brightCyan: '#4FA394',
      brightWhite: '#1E2A22',
    },
  },
};
