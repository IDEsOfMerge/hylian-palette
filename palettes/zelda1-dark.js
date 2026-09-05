'use strict';

// The Legend of Zelda (1986) -- Dark
//
// The NES dungeon-room look, taken as a deliberate hardware constraint
// rather than an apology for it: every Level room in the original game sits
// on a flat, un-dithered black background ($0F on the PPU, true 0-IRE
// black) with a small handful of accent colors for the block walls,
// statues, and enemies -- there is no gradient, no ambient light, just
// black and a few saturated hues, which is exactly what a "no gray-on-gray"
// dark theme should look like. The base tone leans warm-black (a faint
// torchlit brown undertone) so it reads as its own thing next to Ocarina's
// blue-black midnight and Wind Waker's teal-black sea-at-night. Keyword
// green, string red, and function blue keep the same hue families as Light
// (Link's tunic, the Potion/Heart red, the Blue Candle/Ring blue) just
// brightened to read against black, the way NES sprite colors themselves
// get punchier under a dark backdrop. Type takes the dungeon block-wall
// teal. fgComment is the pale grey-gold of the old-man cave hint text --
// "IT'S A SECRET TO EVERYBODY" -- rendered in NES Zelda's actual dialogue
// off-white. Triforce gold is kept as the constant cursor/focus accent from
// Light, simply brightened for contrast: the same three golden triangles,
// whether you're finding one in a dungeon or holding all eight on the box.

module.exports = {
  slug: 'zelda1-dark',
  label: 'The Legend of Zelda Dark',
  game: 'The Legend of Zelda',
  year: 1986,
  tokens: {
    mode: 'dark',
    bg: '#120D08',
    fg: '#D8C9A0',
    bgLine: '#1C140C',
    bgWidget: '#221A10',
    bgInput: '#170F09',
    bgSidebar: '#1A1209',
    bgPanel: '#19120A',
    bgActivity: '#1E160C',
    tintHover: '#2A2012',
    tintSelect: '#3A2A10',
    fgSecondary: '#B0A078',
    fgMuted: '#7A6C48',
    fgVariable: '#E0D2A8',
    fgPunct: '#9A8A5C',
    fgComment: '#9C8C5E',
    fgParameter: '#8FC49C',
    fgProperty: '#8FAFCC',
    borderSubtle: '#2E2414',
    borderStrong: '#4A3A1E',
    accentKeyword: '#66BC4C',
    accentStorage: '#C48A5A',
    accentString: '#E0453A',
    accentRegex: '#F0763A',
    accentFunction: '#4F9EE0',
    accentFunctionDim: '#8AC0E8',
    accentType: '#3ECBBE',
    accentInterface: '#7FE0D4',
    accentNumber: '#D9A62A',
    accentDecorator: '#C47AC4',
    accentNamespace: '#7A93A6',
    accentCursor: '#E8B93D',
    accentFocus: '#E8B93D',
    accentBadge: '#FF6B2E',
    accentButton: '#4F9EE0',
    accentStatusBar: '#5B2A1E',
    colorError: '#E0453A',
    colorWarning: '#FF6B2E',
    colorInfo: '#8AC0E8',
    gitAdd: '#66BC4C',
    gitDelete: '#E0453A',
    ansi: {
      black: '#1C140C',
      red: '#C23B2E',
      green: '#66BC4C',
      yellow: '#C99A1E',
      blue: '#4F9EE0',
      magenta: '#A85AC4',
      cyan: '#3ECBBE',
      white: '#B0A078',
      brightBlack: '#7A6C48',
      brightRed: '#E0453A',
      brightGreen: '#6ED45A',
      brightYellow: '#E8B93D',
      brightBlue: '#8AC0E8',
      brightMagenta: '#C47AC4',
      brightCyan: '#7FE0D4',
      brightWhite: '#E0D2A8',
    },
  },
};
