'use strict';

// The Minish Cap (2004) -- Light
//
// Signature story: the game's central gimmick is scale -- Ezlo shrinks Link
// down to Picori/Minish size, and every dew drop, blade of grass, and
// dropped acorn becomes a towering landmark. The base `bg` is a pale
// sky-blue, the color of the sky reflected inside an oversized dew drop
// the way Link would actually see it while standing beneath one. `fg` is
// Ezlo's own well-worn hat-brown -- the talking cap is Link's one constant
// companion for the entire adventure, so his color anchors the body text.
// Keywords use Minish Woods deep leaf-green; strings use the red Kinstone
// pieces traded with Hyrule Town's townsfolk (Kinstone-fusion is the game's
// signature side-mechanic); types use the gold of the Bound Chests sealing
// away the four Elements; decorators use the pale wind-cyan of the Wind
// Tribe atop Mt. Crenel. fgComment nods to worn bronze Kinstone fragments --
// the game's own currency of half-finished stories waiting to be matched
// up, a fitting parallel to a comment waiting on its code. The identity
// color is Vaati's violet-magenta -- carried constant (and brightened) into
// minishcap-dark.js, because his sealed presence looms over Hyrule in both
// themes even before he ever appears on screen.

module.exports = {
  slug: 'minishcap-light',
  label: 'The Minish Cap Light',
  game: 'The Minish Cap',
  year: 2004,
  tokens: {
    mode: 'light',
    bg: '#DAE1F2',
    fg: '#3A2A1A',
    bgLine: '#CFD6E6',
    bgWidget: '#DCE3F3',
    bgInput: '#DFE5F4',
    bgSidebar: '#D5D7EF',
    bgPanel: '#D8DCF1',
    bgActivity: '#D0D2E9',
    tintHover: '#C8BCE8',
    tintSelect: '#B89BDF',
    fgSecondary: '#7D7775',
    fgMuted: '#9D9BA0',
    fgVariable: '#4A3624',
    fgPunct: '#6B5A48',
    fgComment: '#6B5636',
    fgParameter: '#2A4A66',
    fgProperty: '#2E4A32',
    borderSubtle: '#B7BDCB',
    borderStrong: '#9499A5',
    accentKeyword: '#2E8B4A',
    accentStorage: '#7A4A22',
    accentString: '#D9542E',
    accentRegex: '#C23B2E',
    accentFunction: '#2E8FD9',
    accentFunctionDim: '#6FB8E8',
    accentType: '#D9A62E',
    accentInterface: '#E8C878',
    accentNumber: '#C9962E',
    accentDecorator: '#A0D8E8',
    accentNamespace: '#6A7A8A',
    accentCursor: '#8A3AC4',
    accentFocus: '#8A3AC4',
    accentBadge: '#E8703D',
    accentButton: '#2E8FD9',
    accentStatusBar: '#2E6B3A',
    colorError: '#C0392B',
    colorWarning: '#D9821E',
    colorInfo: '#4A90C4',
    gitAdd: '#2E8B4A',
    gitDelete: '#C0392B',
    ansi: {
      black: '#332619',
      red: '#8E241A',
      green: '#2E8B4A',
      yellow: '#8A6508',
      blue: '#2E8FD9',
      magenta: '#8A3AC4',
      cyan: '#3E9AA8',
      white: '#5C554E',
      brightBlack: '#7D7168',
      brightRed: '#C0392B',
      brightGreen: '#4FAE6A',
      brightYellow: '#D9A62E',
      brightBlue: '#6FB8E8',
      brightMagenta: '#A85AD9',
      brightCyan: '#6FC4C0',
      brightWhite: '#3A2A1A',
    },
  },
};
