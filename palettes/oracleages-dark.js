'use strict';

// Oracle of Ages (2001) -- Dark
//
// Signature story: the other half of Labrynna's duality -- PRESENT-DAY,
// built up and nocturnal. Symmetry City is the game's most striking Present
// location, its architecture famously laid out as a stark black-and-white
// checkerboard, so this theme's `bg` is a near-neutral graphite-black --
// almost true grey, barely tinted -- rather than reaching for another
// saturated navy or violet near-black like the family's other dark themes.
// It reads as flagstone under a night sky, not as a color. `fg` is Nayru's
// pale sapphire-white, the Harp of Ages catching city moonlight. Keywords
// shift to a twilight violet-blue -- the Present sky itself; strings and
// storage use the amber glow of torchlit windows across the checkered
// skyline; decorators stay lilac, matching Ralph's flowers from
// oracleages-light.js -- some habits outlast centuries. fgComment nods to
// the same weathered grey flagstone as the Light theme, just brightened for
// a dark background. Nayru's sapphire blue is the identity color, carried
// constant from Light and brightened here so her voice still reads clearly
// at night: same guide, six centuries later.

module.exports = {
  slug: 'oracleages-dark',
  label: 'Oracle of Ages Dark',
  game: 'Oracle of Ages',
  year: 2001,
  tokens: {
    mode: 'dark',
    bg: '#131417',
    fg: '#C4D4E8',
    bgLine: '#1F2023',
    bgWidget: '#2B2C2E',
    bgInput: '#121316',
    bgSidebar: '#1C222C',
    bgPanel: '#1B1F28',
    bgActivity: '#202631',
    tintHover: '#202E49',
    tintSelect: '#293F6B',
    fgSecondary: '#8B97A5',
    fgMuted: '#636A75',
    fgVariable: '#D0DEF0',
    fgPunct: '#8B96A8',
    fgComment: '#7A828C',
    fgParameter: '#7A85C4',
    fgProperty: '#D4B872',
    borderSubtle: '#2F3033',
    borderStrong: '#4C4C4F',
    accentKeyword: '#7A6AE0',
    accentStorage: '#8A94A0',
    accentString: '#E8A23D',
    accentRegex: '#E8703D',
    accentFunction: '#4FC4E0',
    accentFunctionDim: '#7FD8EC',
    accentType: '#E0B23D',
    accentInterface: '#E8C878',
    accentNumber: '#E0C878',
    accentDecorator: '#B89AE0',
    accentNamespace: '#7A8AA0',
    accentCursor: '#4A7FE8',
    accentFocus: '#4A7FE8',
    accentBadge: '#FF7A4A',
    accentButton: '#4FC4E0',
    accentStatusBar: '#2A3A6B',
    colorError: '#E8433A',
    colorWarning: '#FF8A3D',
    colorInfo: '#7FC4E8',
    gitAdd: '#4FC98A',
    gitDelete: '#E8433A',
    ansi: {
      black: '#1F2023',
      red: '#C46A3D',
      green: '#4FC98A',
      yellow: '#E0B23D',
      blue: '#4FC4E0',
      magenta: '#9A8AE0',
      cyan: '#6FD8D0',
      white: '#8B97A5',
      brightBlack: '#636A75',
      brightRed: '#E8433A',
      brightGreen: '#7FE0AA',
      brightYellow: '#F0D878',
      brightBlue: '#7FD8EC',
      brightMagenta: '#B89AE0',
      brightCyan: '#A0E8E0',
      brightWhite: '#C4D4E8',
    },
  },
};
