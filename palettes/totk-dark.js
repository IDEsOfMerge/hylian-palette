'use strict';

// Tears of the Kingdom (2023) -- Dark
//
// Dropping through a Chasm into the pitch-black Depths (`bg: #0A0C0D`):
// unlike BotW's magenta Malice, Ganondorf's Gloom veins the abyssal floor
// in visceral crimson-scarlet (`accentString`). Everything else that shines
// down here is an actual light source players rely on to navigate the dark:
// Zonai Lightroot spiral jade (`accentKeyword`, cursor, focus), thrown
// Brightbloom Seed lime (`accentDecorator`), drifting Poe wisp ice-blue
// (`accentFunction`), Recall gold (`accentType`), and Zonaite ore (`accentStorage`).

module.exports = {
  slug: 'totk-dark',
  label: 'Tears of the Kingdom Dark',
  game: 'Tears of the Kingdom',
  year: 2023,
  subtitle: 'Pitch-black Depths basalt, Zonai Lightroot jade, Poes & crimson Gloom',
  tokens: {
    mode: 'dark',
    bg: '#080D0D',
    fg: '#C8D9D2',
    bgLine: '#0F1516',
    bgWidget: '#151A1B',
    bgInput: '#05090A',
    bgSidebar: '#0A1212',
    bgPanel: '#091111',
    bgActivity: '#0C1515',
    tintHover: '#002116',
    tintSelect: '#002E1F',
    fgSecondary: '#95A69F',
    fgMuted: '#65726D',
    fgVariable: '#BBD0C8',
    fgPunct: '#8B9C95',
    fgComment: '#7B928B',
    fgParameter: '#96C3B1',
    fgProperty: '#9CC0D6',
    borderSubtle: '#192325',
    borderStrong: '#526164',
    accentKeyword: '#50FEB7',
    accentStorage: '#A8C3CE',
    accentString: '#F6597C',
    accentRegex: '#FF9044',
    accentFunction: '#399FC8',
    accentFunctionDim: '#6AB1D2',
    accentType: '#FFC83E',
    accentInterface: '#FEDB6E',
    accentNumber: '#B97AFD',
    accentDecorator: '#B1E664',
    accentNamespace: '#8C9DB3',
    accentCursor: '#38E096',
    accentFocus: '#38E096',
    accentBadge: '#F03E58',
    accentButton: '#1FA876',
    accentStatusBar: '#144536',
    colorError: '#F3182E',
    colorWarning: '#FFAE33',
    colorInfo: '#54C9FF',
    gitAdd: '#28E5A0',
    gitDelete: '#F3182E',
    ansi: {
      black: '#0F1516',
      red: '#F12231',
      green: '#1EE19C',
      yellow: '#FFC83E',
      blue: '#54C9FF',
      magenta: '#BF8AFB',
      cyan: '#5CE3D2',
      white: '#95A69F',
      brightBlack: '#7B928B',
      brightRed: '#F3182E',
      brightGreen: '#28F3A9',
      brightYellow: '#FBD98F',
      brightBlue: '#90D9FF',
      brightMagenta: '#CDA4FF',
      brightCyan: '#76EDDD',
      brightWhite: '#C8D9D2',
    },
  },
};
