'use strict';

// Oracle of Seasons (2001) -- Light
//
// Signature story: Holodrum's four seasons are the game's own built-in
// palette-shift device, so Light and Dark each claim two. This Light theme
// leans into the WARM half of the year: Spring's cherry-blossom pink (the
// base `bg` -- the Lost Woods and Horon Village both bloom pink every
// Spring) meeting Summer's deep jungle green (`fg` -- Holodrum's overgrowth
// at its lushest, when Gnarled Root Dungeon's vines choke every path).
// Keywords use that same saturated Summer green; strings use the blossom
// pink itself, pushed more magenta for readability; functions use a clear
// Summer sky-blue; types use midsummer marigold-gold sun. fgComment nods to
// Gasha Seeds -- the speckled brown seeds you plant and wait on, Holodrum's
// original "annotation," since every one hides a different note-to-self
// about what might grow. The identity color -- Din's ember-red-orange,
// carried through both this theme and oracleseasons-dark.js -- belongs to
// Din herself, the fire-dancer Oracle of Seasons: whichever season is
// showing on the surface, her flame (and Subrosia's lava core beneath
// Holodrum) never actually goes out.

module.exports = {
  slug: 'oracleseasons-light',
  label: 'Oracle of Seasons Light',
  game: 'Oracle of Seasons',
  year: 2001,
  tokens: {
    mode: 'light',
    bg: '#F0DCE0',
    fg: '#1F3D1A',
    bgLine: '#E4D1D5',
    bgWidget: '#F1DEE2',
    bgInput: '#F2E1E4',
    bgSidebar: '#EFD3D4',
    bgPanel: '#EFD8DA',
    bgActivity: '#E8CFD0',
    tintHover: '#EBBBB5',
    tintSelect: '#E69E8F',
    fgSecondary: '#77806D',
    fgMuted: '#A1A095',
    fgVariable: '#2A4A22',
    fgPunct: '#5C6B52',
    fgComment: '#7A5A42',
    fgParameter: '#1F4A5C',
    fgProperty: '#6B4F1A',
    borderSubtle: '#CAB9BC',
    borderStrong: '#A39698',
    accentKeyword: '#2E8B3D',
    accentStorage: '#5A3105',
    accentString: '#D9587A',
    accentRegex: '#C23B5A',
    accentFunction: '#2E8FC4',
    accentFunctionDim: '#6FB8E0',
    accentType: '#D9A62E',
    accentInterface: '#E8C878',
    accentNumber: '#C99A2E',
    accentDecorator: '#E888B0',
    accentNamespace: '#6A7A8A',
    accentCursor: '#D9481E',
    accentFocus: '#D9481E',
    accentBadge: '#E8703D',
    accentButton: '#2E8FC4',
    accentStatusBar: '#B8391E',
    colorError: '#C0392B',
    colorWarning: '#D9701E',
    colorInfo: '#4A90C4',
    gitAdd: '#2E8B3D',
    gitDelete: '#C0392B',
    ansi: {
      black: '#2B3324',
      red: '#8E241A',
      green: '#2E8B3D',
      yellow: '#8A6508',
      blue: '#2E8FC4',
      magenta: '#C23B5A',
      cyan: '#3E8A8A',
      white: '#5C6B58',
      brightBlack: '#77806D',
      brightRed: '#C0392B',
      brightGreen: '#4FAE5F',
      brightYellow: '#D9A62E',
      brightBlue: '#6FB8E0',
      brightMagenta: '#E888B0',
      brightCyan: '#6FC4C0',
      brightWhite: '#1F3D1A',
    },
  },
};
