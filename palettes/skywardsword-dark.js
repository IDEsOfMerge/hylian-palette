'use strict';

// Skyward Sword (2011) -- Dark
//
// The Surface, sealed away below Skyloft's clouds for centuries -- specifically
// Eldin Volcano, all ash, obsidian and creeping lava, so the base tone is
// pushed deliberately red-orange-black rather than the neutral warm-brown-black
// of Twilight Princess Dark or the cool blue-black of Ocarina Dark. Lava
// becomes the string color (Eldin's molten rivers), Faron's green and
// Lanayru's teal brighten as they would catching firelight in a dungeon, and
// Rupee gold does the same. The one new color that has no Light-theme
// counterpart is a saturated violet used for decorators/annotations -- the
// malice of Demise and The Imprisoned, seeping up from beneath the Surface.
// Fi's sapphire blue is carried over unchanged from Skyward Sword Light for
// the cursor and focus border: the same steady light guiding Link whether
// he's walking Skyloft's clouds or Eldin's ash fields. The status bar shifts
// to a deep Imprisoned-purple, the Surface's own final-boss color.

module.exports = {
  slug: 'skywardsword-dark',
  label: 'Skyward Sword Dark',
  game: 'Skyward Sword',
  year: 2011,
  tokens: {
    mode: 'dark',
    bg: '#1C0C05',
    fg: '#E8DCC8',
    bgLine: '#2A1B14',
    bgWidget: '#33241E',
    bgInput: '#23130D',
    bgSidebar: '#271812',
    bgPanel: '#271812',
    bgActivity: '#2C1D17',
    tintHover: '#1F2125',
    tintSelect: '#202E3A',
    fgSecondary: '#B89C82',
    fgMuted: '#7A6858',
    fgVariable: '#DCC8AE',
    fgPunct: '#A88F76',
    fgComment: '#9C8A72',
    fgParameter: '#7FCBBE',
    fgProperty: '#8FB8D9',
    borderSubtle: '#3E302B',
    borderStrong: '#594E49',
    accentKeyword: '#4FBF7A',
    accentStorage: '#C08A54',
    accentString: '#E85A3A',
    accentRegex: '#FF7A3D',
    accentFunction: '#3E9FDB',
    accentFunctionDim: '#7FC4E8',
    accentType: '#3ED9C4',
    accentInterface: '#7FEAE0',
    accentNumber: '#E8C24A',
    accentDecorator: '#B060E0',
    accentNamespace: '#8098AA',
    accentCursor: '#2C8FCF',
    accentFocus: '#2C8FCF',
    accentBadge: '#FF6B2E',
    accentButton: '#3E9FDB',
    accentStatusBar: '#4A2359',
    colorError: '#E8433A',
    colorWarning: '#FF6B2E',
    colorInfo: '#7FC4E8',
    gitAdd: '#4FBF7A',
    gitDelete: '#E8433A',
    ansi: {
      black: '#2A1B14',
      red: '#CC3B33',
      green: '#4FBF7A',
      yellow: '#E8C24A',
      blue: '#3E9FDB',
      magenta: '#B060E0',
      cyan: '#3ED9C4',
      white: '#B89C82',
      brightBlack: '#7A6858',
      brightRed: '#E8433A',
      brightGreen: '#69C98E',
      brightYellow: '#DCB846',
      brightBlue: '#7FC4E8',
      brightMagenta: '#B870E3',
      brightCyan: '#7FEAE0',
      brightWhite: '#E8DCC8',
    },
  },
};
