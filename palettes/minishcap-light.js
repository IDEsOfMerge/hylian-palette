'use strict';

// The Minish Cap (2004) -- Light
//
// Shrunk to thumb-height beneath Minish Woods clover: the canvas (`bg`) holds
// the pale sky-tint inside a giant blade-of-grass dewdrop, while `fg` wears
// the warm walnut-umber of Ezlo's cap. The four sacred Elements infused into
// the Picori Blade drive the syntax palette -- Fire-Element & Red-Kinstone
// vermilion (`accentString`), Water-Element sapphire (`accentFunction`),
// Earth-Element amethyst (`accentType`), and Wind-Element gold (`accentNumber`)
// -- joined by Ezlo clover-green (`accentKeyword`) and Vaati's violet
// (`accentCursor`/`accentFocus`).

module.exports = {
  slug: 'minishcap-light',
  label: 'The Minish Cap Light',
  game: 'The Minish Cap',
  year: 2004,
  subtitle: 'Oversized morning dewdrop, Ezlo clover-green & the Four Elements',
  tokens: {
    mode: 'light',
    bg: '#E2EDFC',
    fg: '#2D1A0D',
    bgLine: '#D7E2F4',
    bgWidget: '#ECF4FF',
    bgInput: '#F3F8FF',
    bgSidebar: '#DDE5FA',
    bgPanel: '#DAE2F8',
    bgActivity: '#D3DCF4',
    tintHover: '#D9DAFA',
    tintSelect: '#CACAFB',
    fgSecondary: '#5C4434',
    fgMuted: '#816D60',
    fgVariable: '#3B2210',
    fgPunct: '#634C3D',
    fgComment: '#6D5440',
    fgParameter: '#0F4766',
    fgProperty: '#214728',
    borderSubtle: '#C1CEE1',
    borderStrong: '#7C889C',
    accentKeyword: '#227236',
    accentStorage: '#5D2904',
    accentString: '#BA3435',
    accentRegex: '#9A4300',
    accentFunction: '#105181',
    accentFunctionDim: '#356187',
    accentType: '#57228C',
    accentInterface: '#4F1C71',
    accentNumber: '#8B6000',
    accentDecorator: '#007275',
    accentNamespace: '#3E5871',
    accentCursor: '#7E34BD',
    accentFocus: '#7E34BD',
    accentBadge: '#D95826',
    accentButton: '#165EB0',
    accentStatusBar: '#216B3A',
    colorError: '#600019',
    colorWarning: '#8F5300',
    colorInfo: '#035E9D',
    gitAdd: '#006425',
    gitDelete: '#600019',
    ansi: {
      black: '#2D1A0D',
      red: '#510013',
      green: '#006425',
      yellow: '#875D00',
      blue: '#004F8B',
      magenta: '#57228C',
      cyan: '#007275',
      white: '#634C3D',
      brightBlack: '#6D5440',
      brightRed: '#600019',
      brightGreen: '#026E2A',
      brightYellow: '#8E6200',
      brightBlue: '#1B5B95',
      brightMagenta: '#60289A',
      brightCyan: '#187578',
      brightWhite: '#3B2210',
    },
  },
};
