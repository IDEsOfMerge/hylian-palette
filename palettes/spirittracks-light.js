'use strict';

// Spirit Tracks (2009) -- Light
//
// New Hyrule as seen from the footplate of the Spirit Train: a meadow-green
// world map cut everywhere by the golden Spirit Tracks themselves, restored
// rail by rail as Link reconnects the kingdom. The base tone is a sunlit
// grass green -- a hue no other theme in this family uses (everyone else
// sits in warm tan/khaki/cream), which keeps Spirit Tracks legible at a
// glance next to Phantom Hourglass's cyan-blue ocean and the earlier
// entries' parchment tones. accentBadge is that rail gold, the single most
// recognizable image from the box art and world map. The real signature
// color, though, is accentCursor/accentFocus: a pale, slightly desaturated
// "ethereal" sky-blue standing in for Zelda herself, whose spirit is
// severed from her body for almost the entire game and who travels at
// Link's side as a translucent ghost -- a genuinely unusual color story
// unique to this entry, so it's the one token kept exactly constant into
// Spirit Tracks Dark (brightened there, since a ghost reads brighter
// against night). accentString takes Zelda's other, stranger signature --
// her physical body's bright hot-pink dress, an unusually saturated color
// choice for a mainline Zelda protagonist -- and reuses it for ansi.magenta
// too, so pink consistently means "Zelda" throughout. accentNumber is the
// weathered sandstone of the Tower of Spirits' many numbered floors.
// fgComment is the moss creeping over the game's disused, overgrown rail
// spurs -- track that exists but has fallen quiet, much like a comment.

module.exports = {
  slug: 'spirittracks-light',
  label: 'Spirit Tracks Light',
  game: 'Spirit Tracks',
  year: 2009,
  tokens: {
    mode: 'light',
    bg: '#D8E6BC',
    fg: '#232C14',
    bgLine: '#CCDCA8',
    bgWidget: '#E8F0D2',
    bgInput: '#FAFBEE',
    bgSidebar: '#E6E0BC',
    bgPanel: '#E0D8AC',
    bgActivity: '#D8CC96',
    tintHover: '#EEE4B0',
    tintSelect: '#E6D488',
    fgSecondary: '#4A5A2E',
    fgMuted: '#8C9868',
    fgVariable: '#2C3818',
    fgPunct: '#4E5C36',
    fgComment: '#4E5E32',
    fgParameter: '#3E6E4A',
    fgProperty: '#3A5468',
    borderSubtle: '#CCDCA0',
    borderStrong: '#A8B87C',
    accentKeyword: '#2E7D32',
    accentStorage: '#6B4A24',
    accentString: '#C23574',
    accentRegex: '#B8541A',
    accentFunction: '#2A6E9E',
    accentFunctionDim: '#5E9BC9',
    accentType: '#5A7A8A',
    accentInterface: '#7FA8B8',
    accentNumber: '#A8621E',
    accentDecorator: '#8A6BAA',
    accentNamespace: '#5A7248',
    accentCursor: '#3E9EC7',
    accentFocus: '#3E9EC7',
    accentBadge: '#C67F0E',
    accentButton: '#2A6E9E',
    accentStatusBar: '#3E5E28',
    colorError: '#A8241A',
    colorWarning: '#C67F0E',
    colorInfo: '#5E9BC9',
    gitAdd: '#2E7D32',
    gitDelete: '#A8241A',
    ansi: {
      black: '#2C3818',
      red: '#7A1810',
      green: '#2E7D32',
      yellow: '#8A5A08',
      blue: '#2A6E9E',
      magenta: '#C23574',
      cyan: '#3E9EC7',
      white: '#4A5A2E',
      brightBlack: '#8C9868',
      brightRed: '#A8241A',
      brightGreen: '#4A9E50',
      brightYellow: '#C67F0E',
      brightBlue: '#5E9BC9',
      brightMagenta: '#E858A0',
      brightCyan: '#7DD8F0',
      brightWhite: '#232C14',
    },
  },
};
