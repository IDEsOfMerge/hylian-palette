'use strict';

// Spirit Tracks (2009) -- Dark
//
// Demon King Malladus' corrupted realm: the Dark Realm beneath the Tower of
// Spirits and the black cracked-earth Chaos Realm of the finale, where the
// Tracks themselves have been torn up and New Hyrule's demon king wants his
// body back. The base tone is a black pushed toward warm red-purple --
// maroon rather than indigo -- which deliberately inverts Majora's Mask
// Dark's cooler blue-violet cosmic void (Majora's blue channel dominates
// its red; here red dominates blue), so the two purple-black darks in this
// family stay readable apart. accentCursor/accentFocus carry Spirit Tracks
// Light's identity color forward unchanged in hue: Zelda's pale ethereal
// spirit-blue, brightened here into a genuine glow -- fitting, since a
// ghost is more visible in the dark than in daylight, and Zelda spends
// this entire realm as exactly that. accentString/ansi.magenta keep her
// other identity color, the hot-pink dress, now practically neon against
// the maroon-black backdrop. accentDecorator is the violet rune-glow of
// Phantom possession, the mechanic that lets spirit-Zelda animate a
// suit of armor to fight at Link's side. fgComment stays a muted
// rose-mauve -- the same family as fg, just quieter, standing in for the
// hushed upper floors of the Tower of Spirits where Zelda's voice fades
// to a whisper.

module.exports = {
  slug: 'spirittracks-dark',
  label: 'Spirit Tracks Dark',
  game: 'Spirit Tracks',
  year: 2009,
  tokens: {
    mode: 'dark',
    bg: '#1C0A16',
    fg: '#DCC8CE',
    bgLine: '#28121F',
    bgWidget: '#2C1524',
    bgInput: '#170914',
    bgSidebar: '#20101C',
    bgPanel: '#1E0E1A',
    bgActivity: '#241220',
    tintHover: '#321A2C',
    tintSelect: '#402038',
    fgSecondary: '#AC94A6',
    fgMuted: '#705C6C',
    fgVariable: '#D6C2CC',
    fgPunct: '#9E8A96',
    fgComment: '#9A7E92',
    fgParameter: '#9EDCC8',
    fgProperty: '#C8A0C8',
    borderSubtle: '#321A2C',
    borderStrong: '#4A2840',
    accentKeyword: '#4A9E50',
    accentStorage: '#F0B57C',
    accentString: '#E858A0',
    accentRegex: '#FF8A3D',
    accentFunction: '#4A9EE0',
    accentFunctionDim: '#7FC0F0',
    accentType: '#8FB4C4',
    accentInterface: '#A8D4E0',
    accentNumber: '#D89048',
    accentDecorator: '#B08AE0',
    accentNamespace: '#8A7098',
    accentCursor: '#7DD8F0',
    accentFocus: '#7DD8F0',
    accentBadge: '#F0A83D',
    accentButton: '#4A9EE0',
    accentStatusBar: '#4A1638',
    colorError: '#FF4A5C',
    colorWarning: '#F0A83D',
    colorInfo: '#7FC0F0',
    gitAdd: '#4A9E50',
    gitDelete: '#FF4A5C',
    ansi: {
      black: '#28121F',
      red: '#C2405A',
      green: '#4A9E50',
      yellow: '#C9973E',
      blue: '#4A9EE0',
      magenta: '#E858A0',
      cyan: '#7DD8F0',
      white: '#AC94A6',
      brightBlack: '#705C6C',
      brightRed: '#FF4A5C',
      brightGreen: '#6ABE78',
      brightYellow: '#F0C050',
      brightBlue: '#7FC0F0',
      brightMagenta: '#F080C0',
      brightCyan: '#A0E8F5',
      brightWhite: '#DCC8CE',
    },
  },
};
