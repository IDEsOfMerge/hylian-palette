'use strict';

// A Link to the Past (1991) -- Dark World
//
// Ganon's corrupted mirror of Hyrule: same geography as Light World, same
// building silhouettes, but the whole palette is dragged into sickly
// purples and magentas -- withered grass, jade-tinted water, a permanent
// violet haze over everything. That corruption color is given to
// Type/Interface here (a deliberate hue shift away from Light World's teal
// stonework, the same kind of "this world is not the one you know"
// discontinuity used for Zelda II's palace interiors), and the base tone is
// a deep violet-indigo void, distinguished from Zelda II's more pink-leaning
// magenta-black and from Ocarina's blue-black. Pendant colors survive as
// Crystal colors -- courage-green and power-blue keyword/function keep
// their Light World hues, just brightened -- because the Crystal Maidens'
// power isn't corrupted even though the land holding their prisons is.
// Crystal blue itself is the constant cursor/focus accent carried over
// unchanged in hue from Light World, brightened here for contrast: the
// seven crystals glow exactly the same shade in Turtle Rock as they would
// in the Sanctuary. fgComment is the purple haze/fog that visibly blankets
// the Dark World overworld in-game, rendered as a muted lavender.

module.exports = {
  slug: 'alttp-dark',
  label: 'A Link to the Past Dark',
  game: 'A Link to the Past',
  year: 1991,
  tokens: {
    mode: 'dark',
    bg: '#1B1030',
    fg: '#D4C4E8',
    bgLine: '#241640',
    bgWidget: '#2C1A4C',
    bgInput: '#180D28',
    bgSidebar: '#221238',
    bgPanel: '#201136',
    bgActivity: '#281842',
    tintHover: '#34205A',
    tintSelect: '#4A2570',
    fgSecondary: '#B8A0D0',
    fgMuted: '#7A6090',
    fgVariable: '#D4C4E8',
    fgPunct: '#A48CC0',
    fgComment: '#A88CC4',
    fgParameter: '#E0A8D4',
    fgProperty: '#8FB8E0',
    borderSubtle: '#3A2456',
    borderStrong: '#5C3A78',
    accentKeyword: '#3FA060',
    accentStorage: '#C48A5A',
    accentString: '#E0453A',
    accentRegex: '#F0763A',
    accentFunction: '#4F9EE0',
    accentFunctionDim: '#8AC0E8',
    accentType: '#C060E0',
    accentInterface: '#E080D8',
    accentNumber: '#E8B93D',
    accentDecorator: '#9A5AD4',
    accentNamespace: '#8A7AA6',
    accentCursor: '#4A9EE8',
    accentFocus: '#4A9EE8',
    accentBadge: '#FF6B2E',
    accentButton: '#4F9EE0',
    accentStatusBar: '#7A1E5C',
    colorError: '#E0453A',
    colorWarning: '#FF6B2E',
    colorInfo: '#8AC0E8',
    gitAdd: '#3FA060',
    gitDelete: '#E0453A',
    ansi: {
      black: '#241640',
      red: '#C23B2E',
      green: '#3FA060',
      yellow: '#C99A1E',
      blue: '#4F9EE0',
      magenta: '#B850D8',
      cyan: '#3ECBBE',
      white: '#B8A0D0',
      brightBlack: '#7A6090',
      brightRed: '#E0453A',
      brightGreen: '#6ED47E',
      brightYellow: '#E8B93D',
      brightBlue: '#8AC0E8',
      brightMagenta: '#E080D8',
      brightCyan: '#7FE0D4',
      brightWhite: '#D4C4E8',
    },
  },
};
