'use strict';

// Link's Awakening (1993) -- Light
//
// Signature story: this Light theme draws on the beloved 2019 Nintendo
// Switch remake's "toy diorama" art direction -- tilt-shift, candy-bright,
// like Koholint Island rebuilt out of painted plastic on a tabletop. The
// base tone is a pale sea-glass mint, the color of the ocean ringing the
// island as seen through the remake's soft depth-of-field. Keywords use the
// saturated grass green of Mabe Village's toy-hills; strings use Marin's
// warm coral-red hair (she is the game's emotional core -- her Ballad of
// the Wind Fish is the one thing that can wake the sleeper); functions use
// the bright sea-blue that surrounds the island; types use the marigold-gold
// of the Wind Fish's Egg atop Mt. Tamaranch; numbers use the amber of the
// eight Instruments of the Sirens Link collects one by one; decorators use
// Chain Chomp candy-pink, the toy-diorama's most literal "toy." The cursor
// and focus color is Marin's coral -- deliberately NOT carried over to Dark
// (see linksawakening-dark.js for why: that theme abandons color almost
// entirely, so there is nothing left to keep constant except the concept
// itself). fgComment nods to the Owl Statues scattered across Koholint,
// whose cryptic carved-stone hints are the game's original "code comments."

module.exports = {
  slug: 'linksawakening-light',
  label: "Link's Awakening Light",
  game: "Link's Awakening",
  year: 1993,
  tokens: {
    mode: 'light',
    bg: '#DCEEE6',
    fg: '#1B3A3E',
    bgLine: '#D1E2DB',
    bgWidget: '#DEEFE7',
    bgInput: '#E1F0EA',
    bgSidebar: '#D2E9E2',
    bgPanel: '#D7ECE4',
    bgActivity: '#CDE3DC',
    tintHover: '#B6DCD7',
    tintSelect: '#93CCC9',
    fgSecondary: '#6C8685',
    fgMuted: '#93AAA6',
    fgVariable: '#234A4F',
    fgPunct: '#4F6669',
    fgComment: '#55606A',
    fgParameter: '#1F5A66',
    fgProperty: '#2A5A3A',
    borderSubtle: '#B9C8C1',
    borderStrong: '#96A29C',
    accentKeyword: '#2E9E4F',
    accentStorage: '#5A3105',
    accentString: '#D9432E',
    accentRegex: '#E8703D',
    accentFunction: '#2E7FC4',
    accentFunctionDim: '#6FB0E0',
    accentType: '#D9A62E',
    accentInterface: '#E8C878',
    accentNumber: '#B8791E',
    accentDecorator: '#E888B0',
    accentNamespace: '#7A7A9E',
    accentCursor: '#E8562E',
    accentFocus: '#2E9EA0',
    accentBadge: '#E8703D',
    accentButton: '#2E7FC4',
    accentStatusBar: '#2E9E4F',
    colorError: '#C0392B',
    colorWarning: '#D9A62E',
    colorInfo: '#6FB0E0',
    gitAdd: '#2E9E4F',
    gitDelete: '#C0392B',
    ansi: {
      black: '#233B3E',
      red: '#8E241A',
      green: '#2E9E4F',
      yellow: '#8A6508',
      blue: '#2E7FC4',
      magenta: '#8A4A6B',
      cyan: '#2E9EA0',
      white: '#5A6B69',
      brightBlack: '#6B7A78',
      brightRed: '#C0392B',
      brightGreen: '#4FC46F',
      brightYellow: '#D9A62E',
      brightBlue: '#6FB0E0',
      brightMagenta: '#E888B0',
      brightCyan: '#6FCFC9',
      brightWhite: '#1B3A3E',
    },
  },
};
