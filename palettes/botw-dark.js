'use strict';

// Breath of the Wild (2017) -- Dark
//
// The Blood Moon: the one recurring night in Hyrule when Calamity Ganon's
// power peaks, dyeing the sky and moon a deep crimson and reviving every
// defeated enemy. The base tone is a true blood-red-black, kept deliberately
// on the red axis (rather than shifted toward violet) so it doesn't collide
// with Lorule's magenta-black next door -- this is danger-red, not
// corruption-purple. Malice, the purple-black goo Calamity Ganon leaks
// across the world, supplies strings and the terminal's magenta/badge
// accents. Against all of that, Sheikah technology's cyan-teal glow is
// carried over unchanged from Breath of the Wild Light as the cursor and
// focus color -- brightened just enough to still read as a beacon -- because
// Guardians, Towers and Shrines glow exactly the same cold cyan whether it's
// a quiet afternoon or the reddest midnight. A surviving sprig of
// Korok-leaf green-gold in the decorator slot is the one un-corrupted color
// left in the palette: nature persisting even under a blood-red sky.

module.exports = {
  slug: 'botw-dark',
  label: 'Breath of the Wild Dark',
  game: 'Breath of the Wild',
  year: 2017,
  tokens: {
    mode: 'dark',
    bg: '#180608',
    fg: '#E6D6D2',
    bgLine: '#261517',
    bgWidget: '#2F1F21',
    bgInput: '#1F0D0F',
    bgSidebar: '#241214',
    bgPanel: '#241214',
    bgActivity: '#281719',
    tintHover: '#1C2727',
    tintSelect: '#1E3C3B',
    fgSecondary: '#B08886',
    fgMuted: '#785C5A',
    fgVariable: '#E6C8C4',
    fgPunct: '#A08480',
    fgComment: '#A07876',
    fgParameter: '#7FE0D4',
    fgProperty: '#7FBEDC',
    borderSubtle: '#3B2B2D',
    borderStrong: '#56494B',
    accentKeyword: '#4FA860',
    accentStorage: '#9A7268',
    accentString: '#C858B0',
    accentRegex: '#E8703D',
    accentFunction: '#1FBFB8',
    accentFunctionDim: '#6FDBD4',
    accentType: '#3ED9D4',
    accentInterface: '#7FEAE4',
    accentNumber: '#E0B84A',
    accentDecorator: '#C0E85E',
    accentNamespace: '#9A7A7C',
    accentCursor: '#2FD4CC',
    accentFocus: '#2FD4CC',
    accentBadge: '#E8433A',
    accentButton: '#1FBFB8',
    accentStatusBar: '#5A1418',
    colorError: '#E8433A',
    colorWarning: '#E8703D',
    colorInfo: '#7FEAE4',
    gitAdd: '#4FA860',
    gitDelete: '#E8433A',
    ansi: {
      black: '#261517',
      red: '#CC3B33',
      green: '#4FA860',
      yellow: '#E0B84A',
      blue: '#1FBFB8',
      magenta: '#C858B0',
      cyan: '#3ED9D4',
      white: '#B08886',
      brightBlack: '#785C5A',
      brightRed: '#E8433A',
      brightGreen: '#69B578',
      brightYellow: '#D5AF46',
      brightBlue: '#6FDBD4',
      brightMagenta: '#CF6CB9',
      brightCyan: '#7FEAE4',
      brightWhite: '#E6D6D2',
    },
  },
};
