'use strict';

// The Legend of Zelda (1986) -- Light
//
// Grounded in two unmistakable artifacts of 1986-87 hardware history: the warm
// sandy-ochre overworld ground (`$37` on the NES Ricoh 2C02 PPU) and the famous
// metallic gold North American cartridge shell. Primary syntax roles map onto
// the exact 2C02 hue families a player sees in the first five minutes of the
// quest: Link's starting green tunic for keywords, the Wooden Sword inside the
// Old Man's cave for storage, Heart Container / Red Potion vermilion for
// strings, Blue Ring / Magical Rod cobalt for functions, and dungeon-wall
// stone cyan for types. Triforce gold (#C89214 -> #F0B828) anchors cursor and
// focus across both Light and Dark.

module.exports = {
  slug: 'zelda1-light',
  label: 'The Legend of Zelda Light',
  game: 'The Legend of Zelda',
  year: 1986,
  subtitle: 'NES 2C02 sandstone overworld, gold cartridge & starting-tunic emerald',
  tokens: {
    mode: 'light',
    bg: '#F4E4BE',
    fg: '#281D0D',
    bgLine: '#EBD9AF',
    bgWidget: '#F7ECD0',
    bgInput: '#F8F1E0',
    bgSidebar: '#F0DDB3',
    bgPanel: '#EDD9AE',
    bgActivity: '#E9D3A4',
    tintHover: '#E8D4AE',
    tintSelect: '#E3C588',
    fgSecondary: '#554835',
    fgMuted: '#7B7060',
    fgVariable: '#342611',
    fgPunct: '#574B38',
    fgComment: '#62533B',
    fgParameter: '#294C2E',
    fgProperty: '#214059',
    borderSubtle: '#D8C596',
    borderStrong: '#958151',
    accentKeyword: '#1B5C1F',
    accentStorage: '#492600',
    accentString: '#A73731',
    accentRegex: '#9A4300',
    accentFunction: '#01489F',
    accentFunctionDim: '#2D5B9F',
    accentType: '#006F7F',
    accentInterface: '#145E70',
    accentNumber: '#875D00',
    accentDecorator: '#7E2C75',
    accentNamespace: '#345B6F',
    accentCursor: '#C89214',
    accentFocus: '#C89214',
    accentBadge: '#C94418',
    accentButton: '#1A4FA3',
    accentStatusBar: '#245E1E',
    colorError: '#680023',
    colorWarning: '#964D00',
    colorInfo: '#14599B',
    gitAdd: '#086114',
    gitDelete: '#680023',
    ansi: {
      black: '#281D0D',
      red: '#59001D',
      green: '#086114',
      yellow: '#865C00',
      blue: '#01489F',
      magenta: '#7E2C75',
      cyan: '#006D74',
      white: '#574B38',
      brightBlack: '#62533B',
      brightRed: '#680023',
      brightGreen: '#0C6B18',
      brightYellow: '#895E00',
      brightBlue: '#1955A8',
      brightMagenta: '#8A3180',
      brightCyan: '#157178',
      brightWhite: '#342611',
    },
  },
};
