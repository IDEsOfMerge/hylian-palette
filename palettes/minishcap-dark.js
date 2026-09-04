'use strict';

// The Minish Cap (2004) -- Dark
//
// Signature story: Vaati's corruption, made literal. The base `bg` is a
// warm magenta-violet near-black -- Dark Hyrule Castle and Vaati's Palace
// after his rise -- deliberately pushed more RED than Majora's Mask's cold
// blue-violet dark, so the family's two purple-black dark themes stay
// distinguishable (one is a warm, angry magenta; the other a cold, cosmic
// indigo). `fg` is a warm pale tan -- Ezlo's own color, kept constant from
// minishcap-light.js and brightened for the dark background: Ezlo stays
// with Link even into the game's final corrupted dungeon, the one warm and
// grounding presence in an otherwise poisoned palace. Keywords shift to a
// cooler corrupted violet-blue (the Four Sword's energy, twisted); strings
// use ember-coral torchlight; types keep the gold of the sealed Light
// Force, still glowing faintly even here; decorators keep the Wind Tribe's
// pale cyan, a reminder of what Vaati himself used to be before he turned
// on his own people. fgComment nods to fog-grey corrupted Kinstone shards
// drifting through the castle halls. Vaati's violet-magenta is the identity
// color, carried constant from Light and brightened to his true sorcerer
// form's glow -- his magic touches this world whether you can see him or
// not.

module.exports = {
  slug: 'minishcap-dark',
  label: 'The Minish Cap Dark',
  game: 'The Minish Cap',
  year: 2004,
  tokens: {
    mode: 'dark',
    bg: '#1C0A18',
    fg: '#D9C4A0',
    bgLine: '#271624',
    bgWidget: '#33232F',
    bgInput: '#1B0A17',
    bgSidebar: '#2C152D',
    bgPanel: '#291428',
    bgActivity: '#311A32',
    tintHover: '#411D4A',
    tintSelect: '#5A2A6B',
    fgSecondary: '#9D8874',
    fgMuted: '#715E55',
    fgVariable: '#E0D0B0',
    fgPunct: '#B0A08C',
    fgComment: '#A08AAC',
    fgParameter: '#8C7EC4',
    fgProperty: '#C4A868',
    borderSubtle: '#372734',
    borderStrong: '#52454F',
    accentKeyword: '#7A5AD9',
    accentStorage: '#6A5470',
    accentString: '#E8703D',
    accentRegex: '#D9542E',
    accentFunction: '#5FC4D9',
    accentFunctionDim: '#8FD8E8',
    accentType: '#E0B23D',
    accentInterface: '#E8C878',
    accentNumber: '#E0C878',
    accentDecorator: '#A0E0E8',
    accentNamespace: '#8A7A9A',
    accentCursor: '#B85AE8',
    accentFocus: '#B85AE8',
    accentBadge: '#E85AC4',
    accentButton: '#5FC4D9',
    accentStatusBar: '#4A1E5A',
    colorError: '#E8433A',
    colorWarning: '#FF8A3D',
    colorInfo: '#7FC4E8',
    gitAdd: '#4FC98A',
    gitDelete: '#E8433A',
    ansi: {
      black: '#271624',
      red: '#C4522E',
      green: '#4FC98A',
      yellow: '#E0B23D',
      blue: '#5FC4D9',
      magenta: '#B85AE8',
      cyan: '#6FD8D0',
      white: '#9D8874',
      brightBlack: '#715E55',
      brightRed: '#E8433A',
      brightGreen: '#7FE0AA',
      brightYellow: '#F0D878',
      brightBlue: '#8FD8E8',
      brightMagenta: '#E85AC4',
      brightCyan: '#A0E8E0',
      brightWhite: '#D9C4A0',
    },
  },
};
