'use strict';

// Phantom Hourglass (2007) -- Dark
//
// The Temple of the Ocean King: thirteen floors of pitch-black stone that
// Link must re-descend again and again as a real-time sand timer drains,
// stalked by armored Phantoms that mean instant, run-ending death if their
// gaze catches you. The base tone is deliberately near-neutral gunmetal --
// cooler and far less saturated than any other entry in the family (Ocarina
// Dark's blue-navy, Wind Waker Dark's teal-navy, Twilight Princess Dark's
// brown-black, Majora's Mask Dark's violet-black all lean hard into one
// hue; this one reads as plated armor and wet dungeon stone instead).
// accentCursor/accentFocus keep Phantom Hourglass Light's cerulean identity
// exactly, brightened into a glow -- the same open-ocean blue, now the
// pinprick of daylight memory in an otherwise lightless temple.
// accentNumber stays the hourglass's sand, brightened to the amber-gold it
// takes on catching torchlight as the count spirals toward zero.
// accentString is Torch Phantom red and the stylus route-line, brightened.
// fgComment keeps Light's pencil-graphite rationale -- the same handwritten
// chart annotations, now dimmed as if read by lantern-light, carried by the
// Spirit of Time (Ciela's tiny ghost-light guide) through the Temple's
// dark. accentDecorator is that same spirit-light, brightened to a proper
// glow.

module.exports = {
  slug: 'phantomhourglass-dark',
  label: 'Phantom Hourglass Dark',
  game: 'Phantom Hourglass',
  year: 2007,
  tokens: {
    mode: 'dark',
    bg: '#11151B',
    fg: '#D6DEE2',
    bgLine: '#171C24',
    bgWidget: '#1A2028',
    bgInput: '#0D1116',
    bgSidebar: '#141A20',
    bgPanel: '#121820',
    bgActivity: '#161C24',
    tintHover: '#1E2830',
    tintSelect: '#26323C',
    fgSecondary: '#9FB4BE',
    fgMuted: '#5E727C',
    fgVariable: '#C6D4DA',
    fgPunct: '#8CA0AA',
    fgComment: '#7C94A0',
    fgParameter: '#7FD6C0',
    fgProperty: '#9AC4DC',
    borderSubtle: '#232C36',
    borderStrong: '#38454E',
    accentKeyword: '#3FBE70',
    accentStorage: '#C9925A',
    accentString: '#FF6B55',
    accentRegex: '#FF7A3D',
    accentFunction: '#4FA0E0',
    accentFunctionDim: '#7FC0EE',
    accentType: '#3ECBB8',
    accentInterface: '#7FE8D8',
    accentNumber: '#F0A83D',
    accentDecorator: '#7FE0EC',
    accentNamespace: '#7A9AAC',
    accentCursor: '#3FC1F0',
    accentFocus: '#3FC1F0',
    accentBadge: '#FFB347',
    accentButton: '#4FA0E0',
    accentStatusBar: '#1E4E66',
    colorError: '#FF4438',
    colorWarning: '#FFB347',
    colorInfo: '#7FC0EE',
    gitAdd: '#3FBE70',
    gitDelete: '#FF4438',
    ansi: {
      black: '#171C24',
      red: '#C2382E',
      green: '#3FBE70',
      yellow: '#C99A3E',
      blue: '#4FA0E0',
      magenta: '#8A6BAA',
      cyan: '#3ECBB8',
      white: '#9FB4BE',
      brightBlack: '#5E727C',
      brightRed: '#FF4438',
      brightGreen: '#5CE090',
      brightYellow: '#F0A83D',
      brightBlue: '#7FC0EE',
      brightMagenta: '#A88AC4',
      brightCyan: '#7FE8D8',
      brightWhite: '#D6DEE2',
    },
  },
};
