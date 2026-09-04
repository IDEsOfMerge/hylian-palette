'use strict';

// Ocarina of Time (1998) -- Dark
//
// Midnight Hyrule Field / Shadow Temple / adult-timeline Ganondorf's Hyrule.
// Deliberately a cooler, bluer near-black than Majora's cosmic-violet void,
// so the family's two N64-era dark themes stay distinguishable. The three
// Spiritual Stones (Emerald/Ruby/Sapphire) and Navi's fairy-light all glow
// brighter here, as they would catching torchlight in a dungeon. Triforce
// gold is kept exactly constant with the Light theme -- the same relic reads
// the same whether it's noon over Hyrule Field or midnight in Ganon's
// Castle. Status bar shifts to Shadow Temple purple, the game's most
// dreaded dungeon.

module.exports = {
  slug: 'ocarina-dark',
  label: 'Ocarina of Time Dark',
  game: 'Ocarina of Time',
  year: 1998,
  tokens: {
    mode: 'dark',
    bg: '#0A0E1C',
    fg: '#C9D6C4',
    bgLine: '#141A2C',
    bgWidget: '#1A2136',
    bgInput: '#0F1424',
    bgSidebar: '#12172A',
    bgPanel: '#10152A',
    bgActivity: '#161C30',
    tintHover: '#1E2740',
    tintSelect: '#2C3550',
    fgSecondary: '#8FA08A',
    fgMuted: '#5E6E60',
    fgVariable: '#B8C4B0',
    fgPunct: '#7A8A78',
    fgComment: '#8A9A88',
    fgParameter: '#A8CFC0',
    fgProperty: '#9FB8CC',
    borderSubtle: '#232C42',
    borderStrong: '#384260',
    accentKeyword: '#3DBE82',
    accentStorage: '#C48A5A',
    accentString: '#E8534A',
    accentRegex: '#FF7A3D',
    accentFunction: '#4FA8E8',
    accentFunctionDim: '#7FC4F0',
    accentType: '#3ECBB8',
    accentInterface: '#7FE0D0',
    accentNumber: '#E8B93D',
    accentDecorator: '#A0F0E8',
    accentNamespace: '#7A9AB0',
    accentCursor: '#C9A227',
    accentFocus: '#C9A227',
    accentBadge: '#FF6B2E',
    accentButton: '#4FA8E8',
    accentStatusBar: '#5B2A7A',
    colorError: '#E8433A',
    colorWarning: '#FF6B2E',
    colorInfo: '#7FC4F0',
    gitAdd: '#3DBE82',
    gitDelete: '#E8433A',
    ansi: {
      black: '#141A2C',
      red: '#C23B32',
      green: '#3DBE82',
      yellow: '#C99A1E',
      blue: '#4FA8E8',
      magenta: '#8A5AC4',
      cyan: '#3ECBB8',
      white: '#8FA08A',
      brightBlack: '#5E6E60',
      brightRed: '#E8433A',
      brightGreen: '#5CE0A0',
      brightYellow: '#E8B93D',
      brightBlue: '#7FC4F0',
      brightMagenta: '#A87FE0',
      brightCyan: '#7FE0D0',
      brightWhite: '#C9D6C4',
    },
  },
};
