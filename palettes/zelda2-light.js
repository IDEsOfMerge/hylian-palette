'use strict';

// Zelda II: The Adventure of Link (1987) -- Light
//
// The odd game out, deliberately: this is the only mainline entry that's a
// side-scroller stitched onto a top-down overworld map, and the only one
// where Link's default tunic is RED, not green -- a fact so well-known
// among Zelda fans it needed to show up somewhere load-bearing, so it's the
// constant cursor/focus accent (the tunic dot you steer across the map)
// rather than being buried in a corner. The base tone is that overworld map
// itself -- the forest-canopy green Hyrule is rendered in from above,
// pushed more yellow-green and more saturated than A Link to the Past's
// cooler Light World so the two "top-down Hyrule map" light themes stay
// distinguishable. Keyword green is the terrain; storage brown is a town's
// log-cabin roofs. Function blue is the Magic meter -- Zelda II is the
// first game in the series with a spell system (Shield, Jump, Life, Fire,
// Reflect, Spell, Thunder), so "function" mapping to the blue magic bar on
// the HUD is a literal fit, not a stretch. Numbers take the gold of the
// Experience Point counter, the other stat this game introduced that no
// earlier Zelda had. Type/interface keep a palace-entrance teal that turns
// into the palace's actual interior magenta once you go inside, in Dark.

module.exports = {
  slug: 'zelda2-light',
  label: 'Zelda II Light',
  game: 'Zelda II: The Adventure of Link',
  year: 1987,
  tokens: {
    mode: 'light',
    bg: '#CFE0A0',
    fg: '#1E2B12',
    bgLine: '#C3D690',
    bgWidget: '#DCE8B6',
    bgInput: '#F0F4DC',
    bgSidebar: '#C9DA98',
    bgPanel: '#C6D68E',
    bgActivity: '#BDD082',
    tintHover: '#E4EEBE',
    tintSelect: '#D8CE6A',
    fgSecondary: '#3A4A28',
    fgMuted: '#7A8858',
    fgVariable: '#24361A',
    fgPunct: '#4C5C38',
    fgComment: '#4A5A30',
    fgParameter: '#6B3A22',
    fgProperty: '#35577A',
    borderSubtle: '#B7C888',
    borderStrong: '#93A461',
    accentKeyword: '#2E6B1E',
    accentStorage: '#7A4A20',
    accentString: '#A8241A',
    accentRegex: '#C2570C',
    accentFunction: '#1B5EA8',
    accentFunctionDim: '#5B93C4',
    accentType: '#17847A',
    accentInterface: '#4FA89C',
    accentNumber: '#B8860B',
    accentDecorator: '#8C4A8A',
    accentNamespace: '#556B7A',
    accentCursor: '#E13A1E',
    accentFocus: '#E13A1E',
    accentBadge: '#D9480F',
    accentButton: '#1B5EA8',
    accentStatusBar: '#4A6B1E',
    colorError: '#A8241A',
    colorWarning: '#C2570C',
    colorInfo: '#5B93C4',
    gitAdd: '#2E6B1E',
    gitDelete: '#A8241A',
    ansi: {
      black: '#24361A',
      red: '#7A1810',
      green: '#2E6B1E',
      yellow: '#8C6B0A',
      blue: '#1B5EA8',
      magenta: '#6B3F6B',
      cyan: '#17847A',
      white: '#4C5C38',
      brightBlack: '#7A8858',
      brightRed: '#A8241A',
      brightGreen: '#4FA637',
      brightYellow: '#B8860B',
      brightBlue: '#5B93C4',
      brightMagenta: '#8C4A8A',
      brightCyan: '#4FA89C',
      brightWhite: '#1E2B12',
    },
  },
};
