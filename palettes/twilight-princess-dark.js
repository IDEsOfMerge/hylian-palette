'use strict';

// Twilight Princess (2006) -- Dark
//
// Inside the Twilight Realm, colors drain into smoky sepia-shale monochrome
// except for two luminous exceptions: the glowing turquoise-cyan Sol circuitry
// etched into the Palace of Twilight (`accentType`) and Midna's blazing
// imp-hair orange (`accentCursor`/`accentFocus`/`accentBadge`, the single
// highest-chroma token in the file at C ~ 0.19). Crucially, desaturation is
// achieved in OKLCH by lowering *chroma* (`C ~ 0.03-0.11`) while keeping
// *lightness* (`L ~ 0.70-0.86`) cleanly above comments -- preserving both the
// brooding atmosphere and effortless 6:1-10:1 code legibility.

module.exports = {
  slug: 'twilight-princess-dark',
  label: 'Twilight Princess Dark',
  game: 'Twilight Princess',
  year: 2006,
  subtitle: 'Palace of Twilight shale-obsidian, smoky low-chroma & blazing Midna orange',
  tokens: {
    mode: 'dark',
    bg: '#150F08',
    fg: '#DFD2C0',
    bgLine: '#1E1710',
    bgWidget: '#231C15',
    bgInput: '#100B06',
    bgSidebar: '#1A130C',
    bgPanel: '#19120B',
    bgActivity: '#1E160E',
    tintHover: '#301907',
    tintSelect: '#422107',
    fgSecondary: '#ACA08C',
    fgMuted: '#766D5F',
    fgVariable: '#D7C8B2',
    fgPunct: '#A59986',
    fgComment: '#9A8E80',
    fgParameter: '#A2C1A2',
    fgProperty: '#D1B598',
    borderSubtle: '#2C241C',
    borderStrong: '#685E55',
    accentKeyword: '#AED5A1',
    accentStorage: '#ADA397',
    accentString: '#EC8E72',
    accentRegex: '#E69E72',
    accentFunction: '#7AAFD4',
    accentFunctionDim: '#99C2E0',
    accentType: '#37E2DD',
    accentInterface: '#71F0F4',
    accentNumber: '#EEC87B',
    accentDecorator: '#B79DD6',
    accentNamespace: '#A89986',
    accentCursor: '#FF781F',
    accentFocus: '#FF781F',
    accentBadge: '#FF781F',
    accentButton: '#4A6E8A',
    accentStatusBar: '#2B2218',
    colorError: '#C75E5E',
    colorWarning: '#FAB048',
    colorInfo: '#7BBEE1',
    gitAdd: '#98BE8B',
    gitDelete: '#C75E5E',
    ansi: {
      black: '#1E1710',
      red: '#C75E5E',
      green: '#98BE8B',
      yellow: '#EBC578',
      blue: '#7AAFD4',
      magenta: '#B79DD6',
      cyan: '#5BDFDA',
      white: '#ACA08C',
      brightBlack: '#9A8E80',
      brightRed: '#C75E5E',
      brightGreen: '#A9D29B',
      brightYellow: '#FDD584',
      brightBlue: '#91C2E4',
      brightMagenta: '#C9B1E8',
      brightCyan: '#7AEEE9',
      brightWhite: '#DFD2C0',
    },
  },
};
