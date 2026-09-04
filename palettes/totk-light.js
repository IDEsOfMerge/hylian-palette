'use strict';

// Tears of the Kingdom (2023) -- Light
//
// The Sky Islands: pale, ethereal heights unique to this game, so the base
// tone is pulled paler and whiter-gold than Breath of the Wild's grounded
// sage-green -- the same Hyrule, a higher and airier era of it. Sky-Island
// plant life famously grows an autumnal yellow rather than green, which
// supplies the warm burnt-orange used for strings, while ancient Zonai
// devices -- their gold circuitry glowing on every construct and shrine --
// give keywords their amber. The signature accent, though, is the cool
// bioluminescent teal that Zonai technology emits everywhere it appears,
// from the Great Sky Island's Temple of Time down to the smallest activated
// construct. That Zonai teal drives the cursor and focus border and is kept
// exactly constant into Tears of the Kingdom Dark -- the same ancient light
// threading through both the game's highest heights and its lowest depths,
// which is the whole point of the Depths' design.

module.exports = {
  slug: 'totk-light',
  label: 'Tears of the Kingdom Light',
  game: 'Tears of the Kingdom',
  year: 2023,
  tokens: {
    mode: 'light',
    bg: '#E9E8D8',
    fg: '#1C241E',
    bgLine: '#DDDCCD',
    bgWidget: '#EAE9DA',
    bgInput: '#EEEDE1',
    bgSidebar: '#E6E8DB',
    bgPanel: '#E7E8DA',
    bgActivity: '#E1E3D6',
    tintHover: '#ACD5C6',
    tintSelect: '#84C8BA',
    fgSecondary: '#4A5C42',
    fgMuted: '#909C82',
    fgVariable: '#242E20',
    fgPunct: '#5A6650',
    fgComment: '#63604A',
    fgParameter: '#2E7A72',
    fgProperty: '#2E5C86',
    borderSubtle: '#C6C5B8',
    borderStrong: '#9A998F',
    accentKeyword: '#C08A2E',
    accentStorage: '#8A7048',
    accentString: '#C2632E',
    accentRegex: '#C2601C',
    accentFunction: '#2A85C4',
    accentFunctionDim: '#6FB4DB',
    accentType: '#3E6FA8',
    accentInterface: '#5FC4BC',
    accentNumber: '#C9971E',
    accentDecorator: '#D99A42',
    accentNamespace: '#6A84A0',
    accentCursor: '#1FA89C',
    accentFocus: '#1FA89C',
    accentBadge: '#D9480F',
    accentButton: '#2A85C4',
    accentStatusBar: '#2E7A8F',
    colorError: '#C0392B',
    colorWarning: '#D9480F',
    colorInfo: '#4FA0C4',
    gitAdd: '#2E8F5A',
    gitDelete: '#C0392B',
    ansi: {
      black: '#242E20',
      red: '#A93226',
      green: '#2E8F5A',
      yellow: '#C9971E',
      blue: '#2A85C4',
      magenta: '#9A6BA0',
      cyan: '#3E6FA8',
      white: '#4A5C42',
      brightBlack: '#909C82',
      brightRed: '#C0392B',
      brightGreen: '#4DA073',
      brightYellow: '#BF8F1D',
      brightBlue: '#6FB4DB',
      brightMagenta: '#A67DAB',
      brightCyan: '#5FC4BC',
      brightWhite: '#1C241E',
    },
  },
};
