'use strict';

// The Legend of Zelda: The Wind Waker (2002) -- Dark
//
// Completes the Wind Waker pair. Nighttime sailing on the Great Sea under
// starlight, Ganon's Tower's submerged black-green stone, the King of Red
// Lions' crimson sail glowing against a deep navy-teal ocean, Forsaken
// Fortress searchlight red as the danger accent. The Great Sea turquoise
// (accentFocus/accentType) and the King of Red Lions crimson (accentCursor/
// accentString) are the two identity colors kept constant with Wind Waker
// Light, brightened here so they still glow against the night ocean rather
// than reading as mere darkened repeats. Base tone deliberately keeps a
// teal-navy undertone (vs. Ocarina Dark's blue-navy or Majora's
// violet-black) so it still reads unmistakably as "the sea at night."

module.exports = {
  slug: 'windwaker-dark',
  label: 'Wind Waker Dark',
  game: 'The Wind Waker',
  year: 2002,
  tokens: {
    mode: 'dark',
    bg: '#06121C',
    fg: '#CDE8E0',
    bgLine: '#0C1E2A',
    bgWidget: '#0F2530',
    bgInput: '#0A1A22',
    bgSidebar: '#0B1F28',
    bgPanel: '#0A1C24',
    bgActivity: '#0D222C',
    tintHover: '#163040',
    tintSelect: '#1E3F50',
    fgSecondary: '#8FB8AE',
    fgMuted: '#5C8478',
    fgVariable: '#B8DED4',
    fgPunct: '#7FA89C',
    fgComment: '#6F9488',
    fgParameter: '#9AC4B8',
    fgProperty: '#A0C8DC',
    borderSubtle: '#1C3644',
    borderStrong: '#2E4E5E',
    accentKeyword: '#4FB050',
    accentStorage: '#4FB050',
    accentString: '#E8433A',
    accentRegex: '#FF6B35',
    accentFunction: '#3D8FE8',
    accentFunctionDim: '#6FB0F0',
    accentType: '#2AD9C2',
    accentInterface: '#6FEEDC',
    accentNumber: '#FFA53D',
    accentDecorator: '#E8C24A',
    accentNamespace: '#5A8A9E',
    accentCursor: '#E8433A',
    accentFocus: '#2AD9C2',
    accentBadge: '#FFA53D',
    accentButton: '#3D8FE8',
    accentStatusBar: '#0F3A4A',
    colorError: '#FF3B30',
    colorWarning: '#FFA53D',
    colorInfo: '#6FB0F0',
    gitAdd: '#4FB050',
    gitDelete: '#FF3B30',
    ansi: {
      black: '#0C1E2A',
      red: '#C23328',
      green: '#3D9640',
      yellow: '#C98A1E',
      blue: '#3D8FE8',
      magenta: '#8A5A9E',
      cyan: '#2AD9C2',
      white: '#8FB8AE',
      brightBlack: '#5C8478',
      brightRed: '#FF3B30',
      brightGreen: '#5CD060',
      brightYellow: '#FFA53D',
      brightBlue: '#6FB0F0',
      brightMagenta: '#B080C4',
      brightCyan: '#6FEEDC',
      brightWhite: '#CDE8E0',
    },
  },
};
