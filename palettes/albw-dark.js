'use strict';

// A Link Between Worlds (2013) -- Dark
//
// Lorule, Hyrule's decayed mirror world -- the base tone is pushed toward a
// bruised magenta-purple-black (Lorule Castle's crumbling stone under a
// starless storm sky), kept distinct from Majora's cooler blue-violet void by
// leaning harder into red. Yuga, who spends the whole game turning Sages
// into paintings and finally himself into a living pink diamond, gets his
// signature magenta-pink for strings and the notification badge. Hyrule's
// green and blue survive here too, just sickened -- a decayed yellow-green
// for keywords and a storm-blue for functions, the same shapes cast in worse
// light. As in the Light theme, the identity accent is Ravio's Bracelet: the
// same purple wall-merge glow, simply brightened so it still reads clearly
// against Lorule's darker backdrop, driving the cursor, focus border, and
// (for a proper ANSI magenta) the terminal itself -- the mechanic that
// proves Hyrule and Lorule are two sides of one coin. The status bar drops
// to a deep Lorule Castle purple.

module.exports = {
  slug: 'albw-dark',
  label: 'A Link Between Worlds Dark',
  game: 'A Link Between Worlds',
  year: 2013,
  tokens: {
    mode: 'dark',
    bg: '#1D0A1A',
    fg: '#E0D0DC',
    bgLine: '#2B1928',
    bgWidget: '#342331',
    bgInput: '#241121',
    bgSidebar: '#281625',
    bgPanel: '#281625',
    bgActivity: '#2D1B2A',
    tintHover: '#331A3B',
    tintSelect: '#412450',
    fgSecondary: '#B18CB6',
    fgMuted: '#7A5E7E',
    fgVariable: '#E2CCE6',
    fgPunct: '#A184A6',
    fgComment: '#A084A4',
    fgParameter: '#8FDACB',
    fgProperty: '#9FC4EE',
    borderSubtle: '#3F2F3C',
    borderStrong: '#5A4C58',
    accentKeyword: '#5ECB78',
    accentStorage: '#9A6088',
    accentString: '#E85A9E',
    accentRegex: '#E8703D',
    accentFunction: '#5FA8E0',
    accentFunctionDim: '#8FC4EE',
    accentType: '#3ECBB0',
    accentInterface: '#7FE0D0',
    accentNumber: '#E0B84A',
    accentDecorator: '#E8C878',
    accentNamespace: '#8A7A9E',
    accentCursor: '#A66FE8',
    accentFocus: '#A66FE8',
    accentBadge: '#F0559E',
    accentButton: '#5FA8E0',
    accentStatusBar: '#4A2160',
    colorError: '#E0524A',
    colorWarning: '#E8703D',
    colorInfo: '#8FC4EE',
    gitAdd: '#5ECB78',
    gitDelete: '#E0524A',
    ansi: {
      black: '#2B1928',
      red: '#C54841',
      green: '#5ECB78',
      yellow: '#E0B84A',
      blue: '#5FA8E0',
      magenta: '#A66FE8',
      cyan: '#3ECBB0',
      white: '#B18CB6',
      brightBlack: '#7A5E7E',
      brightRed: '#E0524A',
      brightGreen: '#76D38C',
      brightYellow: '#D5AF46',
      brightBlue: '#8FC4EE',
      brightMagenta: '#B180EB',
      brightCyan: '#7FE0D0',
      brightWhite: '#E0D0DC',
    },
  },
};
