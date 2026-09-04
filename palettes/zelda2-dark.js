'use strict';

// Zelda II: The Adventure of Link (1987) -- Dark
//
// The palace interiors, which are famous among NES-generation players for
// looking nothing like the rest of the game -- side-scrolling corridors on
// a flat black void with brick walls rendered in a hot magenta-pink, not
// the grey stone you'd expect from a dungeon. That palace magenta is given
// to Type/Interface here rather than forced into a "normal" teal, because
// that swap-in IS the real discontinuity a player feels walking from the
// green overworld map into a palace door -- Light's palace-entrance teal
// gives way to actual interior pink, on purpose. The base tone is a
// magenta-black void distinct from both the blue-black of Ocarina's Shadow
// Temple and the violet-black of A Link to the Past's Dark World. Link's
// red tunic stays the constant cursor/focus accent from Light, brightened
// for contrast -- the hero looks the same shade of red whether he's on the
// map or three palaces deep. fgComment takes the pale pink dither NES
// Zelda II actually renders its palace brickwork in, viewed at a
// text-sized scale. Magic-blue function and XP-gold numbers also carry
// over unbrightened-in-hue from Light, since neither the spell system nor
// the level-up counter changes character between overworld and interior.

module.exports = {
  slug: 'zelda2-dark',
  label: 'Zelda II Dark',
  game: 'Zelda II: The Adventure of Link',
  year: 1987,
  tokens: {
    mode: 'dark',
    bg: '#170817',
    fg: '#E6D8E2',
    bgLine: '#200A20',
    bgWidget: '#2A0F2A',
    bgInput: '#1C081C',
    bgSidebar: '#220C22',
    bgPanel: '#200A22',
    bgActivity: '#260E28',
    tintHover: '#341040',
    tintSelect: '#4A1550',
    fgSecondary: '#C4A0C0',
    fgMuted: '#7A5C78',
    fgVariable: '#E4D0E0',
    fgPunct: '#B090AC',
    fgComment: '#B090B8',
    fgParameter: '#8FB8E0',
    fgProperty: '#8FAFDC',
    borderSubtle: '#3A1640',
    borderStrong: '#5C2460',
    accentKeyword: '#66BC4C',
    accentStorage: '#C48A5A',
    accentString: '#E0453A',
    accentRegex: '#F0763A',
    accentFunction: '#4F9EE0',
    accentFunctionDim: '#8AC0E8',
    accentType: '#E0449A',
    accentInterface: '#F080C0',
    accentNumber: '#E8B93D',
    accentDecorator: '#7A6BC4',
    accentNamespace: '#9A7AA6',
    accentCursor: '#F03A2E',
    accentFocus: '#F03A2E',
    accentBadge: '#FF6B2E',
    accentButton: '#4F9EE0',
    accentStatusBar: '#6B1E5C',
    colorError: '#E0453A',
    colorWarning: '#FF6B2E',
    colorInfo: '#8AC0E8',
    gitAdd: '#66BC4C',
    gitDelete: '#E0453A',
    ansi: {
      black: '#200A20',
      red: '#C23B2E',
      green: '#66BC4C',
      yellow: '#C99A1E',
      blue: '#4F9EE0',
      magenta: '#C43FA0',
      cyan: '#3ECBBE',
      white: '#C4A0C0',
      brightBlack: '#7A5C78',
      brightRed: '#E0453A',
      brightGreen: '#6ED45A',
      brightYellow: '#E8B93D',
      brightBlue: '#8AC0E8',
      brightMagenta: '#F080C0',
      brightCyan: '#7FE0D4',
      brightWhite: '#E4D0E0',
    },
  },
};
