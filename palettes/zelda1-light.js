'use strict';

// The Legend of Zelda (1986) -- Light
//
// Signature story: this is the ONLY Hylian theme pair grounded in a
// cartridge, not a screenshot. The 1987 North American NES release shipped
// in a gold-window box with an actual gold-colored cartridge -- Nintendo's
// way of signaling "this one has battery-save, this one matters" -- and
// that gold IS the Triforce the game is about, so it's the base tone here
// (a warmer, more saturated antique-gold than Ocarina's mossy stone or Wind
// Waker's cream parchment, so the three light themes don't collapse into
// "beige"). Link's own starting tunic supplies the keyword green; the very
// first weapon in the game -- the Wooden Sword under the old man's rock --
// supplies storage brown. Strings take the red of the Potion and the Heart
// Container, the game's two "restore/refill" pickups. Functions take the
// blue of the Blue Candle and the Blue Ring (the ring literally recolors
// Link's tunic and halves damage taken -- an ability upgrade, which is what
// "function" means here). Types take the dungeon-room teal-blue that NES
// Zelda uses for its stone block walls. Numbers take Rupee/Triforce amber.
// Triforce gold itself is reserved for the cursor/focus accent and stays
// constant into Dark -- the one piece of treasure that looks the same
// whether you're standing in Hyrule Field or a Level-9 dungeon.

module.exports = {
  slug: 'zelda1-light',
  label: 'The Legend of Zelda Light',
  game: 'The Legend of Zelda',
  year: 1986,
  tokens: {
    mode: 'light',
    bg: '#E7D9A0',
    fg: '#2B2410',
    bgLine: '#DCCB8C',
    bgWidget: '#EEE2B4',
    bgInput: '#F8F1D8',
    bgSidebar: '#E1D296',
    bgPanel: '#DFD094',
    bgActivity: '#D8C888',
    tintHover: '#F0E4B0',
    tintSelect: '#E6CE7A',
    fgSecondary: '#4A3E22',
    fgMuted: '#8C7C4E',
    fgVariable: '#33290F',
    fgPunct: '#5C4E2A',
    fgComment: '#5A4A26',
    fgParameter: '#3D5C2E',
    fgProperty: '#3A4F6B',
    borderSubtle: '#CBB97E',
    borderStrong: '#A8934F',
    accentKeyword: '#2F6B1F',
    accentStorage: '#B77F55',
    accentString: '#A8241A',
    accentRegex: '#C2570C',
    accentFunction: '#1B5EA8',
    accentFunctionDim: '#5B93C4',
    accentType: '#1D7A72',
    accentInterface: '#4FA89C',
    accentNumber: '#B8860B',
    accentDecorator: '#8C4A8A',
    accentNamespace: '#556B7A',
    accentCursor: '#D4A017',
    accentFocus: '#D4A017',
    accentBadge: '#D9480F',
    accentButton: '#1B5EA8',
    accentStatusBar: '#2F6B1F',
    colorError: '#B0281C',
    colorWarning: '#C2570C',
    colorInfo: '#5B93C4',
    gitAdd: '#2F6B1F',
    gitDelete: '#B0281C',
    ansi: {
      black: '#33290F',
      red: '#7A1810',
      green: '#2F6B1F',
      yellow: '#8C6B0A',
      blue: '#1B5EA8',
      magenta: '#6B3F6B',
      cyan: '#1D7A72',
      white: '#5C4E2A',
      brightBlack: '#8C7C4E',
      brightRed: '#B0281C',
      brightGreen: '#4A9635',
      brightYellow: '#D4A017',
      brightBlue: '#5B93C4',
      brightMagenta: '#8C4A8A',
      brightCyan: '#4FA89C',
      brightWhite: '#2B2410',
    },
  },
};
