'use strict';

// A Link Between Worlds (2013) -- Light
//
// Hyrule, redrawn: a spiritual successor to A Link to the Past's Light World,
// but pushed brighter and more saturated to match the game's crisp
// stereoscopic-3D "painting come to life" look, so it doesn't read as a
// reskin of that already-built theme or of Ocarina's mossier, greyer green.
// Link's tunic green anchors keywords, Kakariko's terracotta brick roofs
// give strings their warmth, and Hyrule's clear daytime sky supplies
// functions. The one signature accent that matters most here is Ravio's
// Bracelet -- the purple glow of the wall-merge ability that literally lets
// Link flatten into a painting and slip between Hyrule and Lorule. That
// bracelet-purple drives the cursor and focus border, and it is the single
// "identity" color kept exactly constant into A Link Between Worlds Dark: the
// same purple light works the merge whether you're standing in sunlit Hyrule
// or storm-lit Lorule, which is exactly the point of the mechanic. A soft
// lavender tint even bleeds faintly into the sidebar and hover states, as if
// the mirror world is always just barely visible through the wall.

module.exports = {
  slug: 'albw-light',
  label: 'A Link Between Worlds Light',
  game: 'A Link Between Worlds',
  year: 2013,
  tokens: {
    mode: 'light',
    bg: '#E2EAC8',
    fg: '#1C2A18',
    bgLine: '#D7DEBE',
    bgWidget: '#E4EBCB',
    bgInput: '#E8EFD4',
    bgSidebar: '#E1E5CD',
    bgPanel: '#E1E7CB',
    bgActivity: '#DDE1C8',
    tintHover: '#C3B9C5',
    tintSelect: '#AE98C3',
    fgSecondary: '#3E5A38',
    fgMuted: '#8FA080',
    fgVariable: '#1E3018',
    fgPunct: '#4A5C40',
    fgComment: '#54603E',
    fgParameter: '#2E6E5C',
    fgProperty: '#2E5C74',
    borderSubtle: '#C0C7AA',
    borderStrong: '#959A84',
    accentKeyword: '#1E8A4A',
    accentStorage: '#563305',
    accentString: '#BB4530',
    accentRegex: '#C2601C',
    accentFunction: '#1D7EC2',
    accentFunctionDim: '#6FB0E0',
    accentType: '#62C3BA',
    accentInterface: '#5FC4BC',
    accentNumber: '#B8860B',
    accentDecorator: '#D9A954',
    accentNamespace: '#5C7A94',
    accentCursor: '#7A45BE',
    accentFocus: '#7A45BE',
    accentBadge: '#D9480F',
    accentButton: '#1D7EC2',
    accentStatusBar: '#6B3FA0',
    colorError: '#C0392B',
    colorWarning: '#D9480F',
    colorInfo: '#4A90C4',
    gitAdd: '#1E8A4A',
    gitDelete: '#C0392B',
    ansi: {
      black: '#1E3018',
      red: '#A93226',
      green: '#1E8A4A',
      yellow: '#B8860B',
      blue: '#1D7EC2',
      magenta: '#7A45BE',
      cyan: '#62C3BA',
      white: '#3E5A38',
      brightBlack: '#8FA080',
      brightRed: '#C0392B',
      brightGreen: '#409C65',
      brightYellow: '#AF7F0A',
      brightBlue: '#6FB0E0',
      brightMagenta: '#8A5BC6',
      brightCyan: '#5FC4BC',
      brightWhite: '#1C2A18',
    },
  },
};
