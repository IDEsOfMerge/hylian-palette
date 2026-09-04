'use strict';

// Phantom Hourglass (2007) -- Light
//
// Wind Waker's toon-shaded sequel, deliberately pushed cooler and more
// saturated than its parent: the DS's flatter, punchier cel-shading turns
// Wind Waker's warm parchment-and-turquoise Great Sea into a crisper,
// purely aquatic cyan-blue. accentCursor/accentFocus share one identity
// color -- a vivid cerulean "open ocean under a bright DS sky" -- kept
// constant into Phantom Hourglass Dark (brightened there), so the family
// resemblance to Wind Waker survives while the hue itself (pure cyan-blue,
// not WW's greener turquoise) stays unmistakably its own. accentNumber is
// the hourglass's sand -- literally the title item, and the game's real
// dread mechanic is a shrinking, numeric time limit inside the Temple of
// the Ocean King, so tying "numbers" to sand-gold is a direct mechanical
// callback. accentString is the red dotted course line the stylus draws
// across the sea chart -- Phantom Hourglass's signature DS-only mechanic
// was drawing directly on the map. fgComment carries that same idea one
// step further: it's toned as soft pencil/graphite-blue, the color of the
// handwritten notes and circled clues players scribble in the margins of
// their own charts -- a real, unique feature of this game's touch-screen
// interface, and a natural fit for what a code comment actually is.
// accentDecorator is Ciela the fairy's spark. Sidebar/panel zones drift
// toward the mint-green of the island chains dotting the ocean, echoing
// (without copying) how Wind Waker Light shifts its own UI zones toward
// land colors.

module.exports = {
  slug: 'phantomhourglass-light',
  label: 'Phantom Hourglass Light',
  game: 'Phantom Hourglass',
  year: 2007,
  tokens: {
    mode: 'light',
    bg: '#D2ECEF',
    fg: '#132A38',
    bgLine: '#C7E4E8',
    bgWidget: '#E4F6F8',
    bgInput: '#FFFFFF',
    bgSidebar: '#D8EFE4',
    bgPanel: '#CFE8DC',
    bgActivity: '#C5E0D2',
    tintHover: '#DCF0EE',
    tintSelect: '#A9DCE2',
    fgSecondary: '#3C5C68',
    fgMuted: '#7FA0AA',
    fgVariable: '#173A4A',
    fgPunct: '#3E5C66',
    fgComment: '#3F6478',
    fgParameter: '#1F6B5E',
    fgProperty: '#2C5570',
    borderSubtle: '#B9DBDF',
    borderStrong: '#8FBAC2',
    accentKeyword: '#1F7A45',
    accentStorage: '#56330A',
    accentString: '#C23B2E',
    accentRegex: '#B8541A',
    accentFunction: '#1B5FA8',
    accentFunctionDim: '#5B93C9',
    accentType: '#56B2A5',
    accentInterface: '#3FA89C',
    accentNumber: '#C6790E',
    accentDecorator: '#4FBEC9',
    accentNamespace: '#5A7A8C',
    accentCursor: '#0090C9',
    accentFocus: '#0090C9',
    accentBadge: '#E8890C',
    accentButton: '#1B5FA8',
    accentStatusBar: '#0C6E9E',
    colorError: '#A8241C',
    colorWarning: '#E8890C',
    colorInfo: '#5B93C9',
    gitAdd: '#1F7A45',
    gitDelete: '#A8241C',
    ansi: {
      black: '#1E3A44',
      red: '#7A1A12',
      green: '#1F7A45',
      yellow: '#8A5A08',
      blue: '#1B5FA8',
      magenta: '#6B4A8A',
      cyan: '#56B2A5',
      white: '#3C5C68',
      brightBlack: '#7FA0AA',
      brightRed: '#A8241C',
      brightGreen: '#3FA060',
      brightYellow: '#C6790E',
      brightBlue: '#5B93C9',
      brightMagenta: '#8A6BAA',
      brightCyan: '#3FA89C',
      brightWhite: '#132A38',
    },
  },
};
