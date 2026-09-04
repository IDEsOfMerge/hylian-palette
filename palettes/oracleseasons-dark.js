'use strict';

// Oracle of Seasons (2001) -- Dark
//
// Signature story: the COLD half of Holodrum's year. The base `bg` is a
// dark rust-terracotta-black -- Autumn dusk over the Woods of Winter, dried
// maple leaves underfoot -- deliberately more red-saturated than Twilight
// Princess's gentler brown-black dark, so the two warm near-blacks in the
// family stay distinguishable. `fg` is pale ice-blue -- Winter frost
// settling over that same dusk, snow catching the last light. Keywords use
// a bold Winter ice-blue; strings and storage use Autumn maple-leaf
// rust-orange; types lean frosted teal. fgComment nods to faded, sun-bleached
// Autumn leaf litter -- the quietest, most muted thing in the seasonal
// cycle. Din's ember-red-orange -- constant with oracleseasons-light.js,
// brightened here for legibility against the dark background -- is the one
// color that refuses to go seasonal: however cold it gets on the surface,
// Subrosia's lava core keeps burning directly underneath Holodrum, and Din
// herself never stops dancing.

module.exports = {
  slug: 'oracleseasons-dark',
  label: 'Oracle of Seasons Dark',
  game: 'Oracle of Seasons',
  year: 2001,
  tokens: {
    mode: 'dark',
    bg: '#220E0A',
    fg: '#C8DCE0',
    bgLine: '#2D1A16',
    bgWidget: '#382623',
    bgInput: '#200D0A',
    bgSidebar: '#361912',
    bgPanel: '#321711',
    bgActivity: '#3A1D17',
    tintHover: '#521F13',
    tintSelect: '#712B18',
    fgSecondary: '#939A9C',
    fgMuted: '#6D6B6A',
    fgVariable: '#D4E4E8',
    fgPunct: '#8FA0A5',
    fgComment: '#A87858',
    fgParameter: '#7FAEC4',
    fgProperty: '#6FC4B8',
    borderSubtle: '#3D2B27',
    borderStrong: '#574845',
    accentKeyword: '#4AA8D9',
    accentStorage: '#C46A2E',
    accentString: '#D9642E',
    accentRegex: '#E87A3D',
    accentFunction: '#4FB8E8',
    accentFunctionDim: '#7FD0F0',
    accentType: '#7FE0D8',
    accentInterface: '#A8E0DC',
    accentNumber: '#E0A83D',
    accentDecorator: '#A0C8E0',
    accentNamespace: '#6A8AA0',
    accentCursor: '#E8562E',
    accentFocus: '#E8562E',
    accentBadge: '#FF7A3D',
    accentButton: '#4FB8E8',
    accentStatusBar: '#7A2A1A',
    colorError: '#E8433A',
    colorWarning: '#FF8A3D',
    colorInfo: '#7FC4E8',
    gitAdd: '#5CC98A',
    gitDelete: '#E8433A',
    ansi: {
      black: '#2D1A16',
      red: '#B8562A',
      green: '#5CC98A',
      yellow: '#E0A83D',
      blue: '#4FB8E8',
      magenta: '#C46A2E',
      cyan: '#7FE0D8',
      white: '#A87858',
      brightBlack: '#6D6B6A',
      brightRed: '#E8433A',
      brightGreen: '#8AE0AA',
      brightYellow: '#FFCB6A',
      brightBlue: '#7FD0F0',
      brightMagenta: '#E8956A',
      brightCyan: '#A8E0DC',
      brightWhite: '#C8DCE0',
    },
  },
};
