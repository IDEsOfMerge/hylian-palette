'use strict';

// Zelda II: The Adventure of Link (1987) -- Light
//
// Zelda II is the series' boldest mechanical departure -- a side-scrolling
// swordplay and spellcasting RPG with an EXP counter, a blue Magic Meter, and
// a Shield spell that turns Link's tunic crimson. Rather than stamping another
// green-keyword template onto it, `accentKeyword` claims that iconic Shield-Spell
// Red Tunic crimson, `accentFunction` maps to the cobalt Magic Meter (Shield,
// Jump, Life, Fairy, Fire, Reflect, Spell, Thunder), `accentString` takes
// Parapa Palace's warm sandstone-ochre brickwork, and `accentNumber` honors
// the series' only EXP progression counter.

module.exports = {
  slug: 'zelda2-light',
  label: 'Zelda II Light',
  game: 'Zelda II: The Adventure of Link',
  year: 1987,
  subtitle: 'Side-scrolling RPG spell meter, Red Tunic & sunlit Hyrule map',
  tokens: {
    mode: 'light',
    bg: '#E4EDC9',
    fg: '#1B2211',
    bgLine: '#DAE3BB',
    bgWidget: '#EDF3D8',
    bgInput: '#F2F6E6',
    bgSidebar: '#E0E6BF',
    bgPanel: '#DDE3BA',
    bgActivity: '#D7DDB0',
    tintHover: '#E3D9B5',
    tintSelect: '#DACB93',
    fgSecondary: '#454E3A',
    fgMuted: '#6D7564',
    fgVariable: '#232D17',
    fgPunct: '#49523E',
    fgComment: '#535B41',
    fgParameter: '#5F3629',
    fgProperty: '#243F5A',
    borderSubtle: '#C5CFA3',
    borderStrong: '#818A5D',
    accentKeyword: '#A3212D',
    accentStorage: '#572900',
    accentString: '#975106',
    accentRegex: '#992D00',
    accentFunction: '#00459A',
    accentFunctionDim: '#2B589A',
    accentType: '#077280',
    accentInterface: '#176171',
    accentNumber: '#165927',
    accentDecorator: '#6A3491',
    accentNamespace: '#395A6F',
    accentCursor: '#D62828',
    accentFocus: '#D62828',
    accentBadge: '#C84B14',
    accentButton: '#1654A8',
    accentStatusBar: '#7D1D22',
    colorError: '#760044',
    colorWarning: '#8B5500',
    colorInfo: '#1E589C',
    gitAdd: '#09611A',
    gitDelete: '#760044',
    ansi: {
      black: '#1B2211',
      red: '#67003A',
      green: '#005512',
      yellow: '#5A2E08',
      blue: '#00459A',
      magenta: '#6A3491',
      cyan: '#007075',
      white: '#49523E',
      brightBlack: '#535B41',
      brightRed: '#760044',
      brightGreen: '#045E17',
      brightYellow: '#613108',
      brightBlue: '#1752A3',
      brightMagenta: '#743A9E',
      brightCyan: '#147378',
      brightWhite: '#232D17',
    },
  },
};
