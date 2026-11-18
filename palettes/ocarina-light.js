'use strict';

// Ocarina of Time (1998) -- Light
//
// Built directly around the sacred relics that unlock the Door of Time:
// Kokiri Emerald (`accentKeyword`), Goron Ruby (`accentString`), and Zora
// Sapphire (`accentFunction`) sit against sunlit Temple of Time limestone.
// Unlike generic teal, `accentType` wears the true sweet-potato royal
// periwinkle-indigo of the Ocarina of Time itself (echoed by the Shadow
// Medallion in `accentInterface`), while `accentNumber` takes Spirit-Medallion
// desert amber and `accentDecorator` catches Navi's cyan fairy-glow. Triforce
// gold (#C9A227) remains byte-for-byte identical across Light and Dark.

module.exports = {
  slug: 'ocarina-light',
  label: 'Ocarina of Time Light',
  game: 'Ocarina of Time',
  year: 1998,
  subtitle: 'Temple of Time limestone, three Spiritual Stones & royal-blue Ocarina',
  tokens: {
    mode: 'light',
    bg: '#EDE9D6',
    fg: '#182218',
    bgLine: '#E3DFCA',
    bgWidget: '#F3F0E2',
    bgInput: '#F6F5EC',
    bgSidebar: '#DDE6D2',
    bgPanel: '#DAE2CE',
    bgActivity: '#D4DDC6',
    tintHover: '#E6D9B9',
    tintSelect: '#DECA99',
    fgSecondary: '#414F41',
    fgMuted: '#6A756A',
    fgVariable: '#1F2D1F',
    fgPunct: '#455245',
    fgComment: '#4E5B4A',
    fgParameter: '#164C4A',
    fgProperty: '#2B3E57',
    borderSubtle: '#CFCAB3',
    borderStrong: '#8A866F',
    accentKeyword: '#007345',
    accentStorage: '#5F2E02',
    accentString: '#B92B3E',
    accentRegex: '#9A4300',
    accentFunction: '#3662B7',
    accentFunctionDim: '#1A619B',
    accentType: '#3D2E98',
    accentInterface: '#3B267D',
    accentNumber: '#875D00',
    accentDecorator: '#00717A',
    accentNamespace: '#385A6E',
    accentCursor: '#C9A227',
    accentFocus: '#C9A227',
    accentBadge: '#C94A18',
    accentButton: '#1458A6',
    accentStatusBar: '#2B4294',
    colorError: '#710022',
    colorWarning: '#925000',
    colorInfo: '#0E5E9A',
    gitAdd: '#006033',
    gitDelete: '#710022',
    ansi: {
      black: '#182218',
      red: '#61001C',
      green: '#006033',
      yellow: '#875D00',
      blue: '#004B8A',
      magenta: '#3D2E98',
      cyan: '#006F78',
      white: '#455245',
      brightBlack: '#4E5B4A',
      brightRed: '#710022',
      brightGreen: '#036A39',
      brightYellow: '#8B6000',
      brightBlue: '#195793',
      brightMagenta: '#4435A7',
      brightCyan: '#16737C',
      brightWhite: '#1F2D1F',
    },
  },
};
