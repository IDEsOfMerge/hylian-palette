'use strict';

// Link's Awakening (1993) -- Dark
//
// Signature story: the ONE deliberately near-monochrome theme in the whole
// family. The original 1993 Game Boy had no color -- just a reflective
// green-tinted LCD driven by four fixed shades. Those four real DMG hex
// values are used directly and exactly: #0F380F (darkest, used here as
// `bg`), #306230, #8BAC0F (used here as `fgComment`), and #9BBC0F
// (brightest, used here as `fg`). Everything else in this file is a shade
// built by sliding along that SAME hue family -- deep forest green at the
// dark end fading to a yellow-green chartreuse at the bright end, exactly
// like the real hardware's phosphor-ish glow -- rather than reaching for
// blue, red, or purple. This is a deliberate thematic choice: the entire
// game turns out to be the Wind Fish's dream, and Koholint Island itself
// dissolves the moment Link wakes up, so a screen that can only ever show
// you shades of one color -- nothing else -- fits the "none of this was
// ever really there" ending better than any amount of extra hue would.
//
// Two intentional, narrow exceptions: colorError/colorDelete/ansi.red use a
// muted rust, standing in for the Nightmares -- the shape-shifting, foreign
// intrusions haunting the ends of each dungeon, the only things in Koholint
// that were never native to the dream. And because the identity color from
// Light (Marin's coral, see linksawakening-light.js) has nowhere left to
// live in a true 4-shade palette, this Dark theme intentionally does NOT
// carry an identity accent forward -- per the brief's own carve-out, the
// monochrome concept is the whole point here and takes priority over accent
// continuity. accentCursor uses the single brightest value the original
// hardware could ever produce (#9BBC0F) -- the cursor is, quite literally,
// the brightest pixel a 1993 Game Boy screen could draw.

module.exports = {
  slug: 'linksawakening-dark',
  label: "Link's Awakening Dark",
  game: "Link's Awakening",
  year: 1993,
  tokens: {
    mode: 'dark',
    bg: '#0F380F',
    fg: '#9BBC0F',
    bgLine: '#1B421B',
    bgWidget: '#274C27',
    bgInput: '#0E350E',
    bgSidebar: '#1F4714',
    bgPanel: '#1C4414',
    bgActivity: '#234B19',
    tintHover: '#31580F',
    tintSelect: '#476D0F',
    fgSecondary: '#6E920F',
    fgMuted: '#4E730F',
    fgVariable: '#A8C93A',
    fgPunct: '#6B8A28',
    fgComment: '#8BAC0F',
    fgParameter: '#93B830',
    fgProperty: '#7FA82A',
    borderSubtle: '#2C502C',
    borderStrong: '#496849',
    accentKeyword: '#6FCB2A',
    accentStorage: '#86C457',
    accentString: '#A9CB3A',
    accentRegex: '#C9DB5A',
    accentFunction: '#7FE04A',
    accentFunctionDim: '#5FAE3A',
    accentType: '#8FE070',
    accentInterface: '#A8E0A0',
    accentNumber: '#C9E06A',
    accentDecorator: '#D9F080',
    accentNamespace: '#5C8A4A',
    accentCursor: '#9BBC0F',
    accentFocus: '#8BAC0F',
    accentBadge: '#C9DB2A',
    accentButton: '#4C8A1E',
    accentStatusBar: '#16481A',
    colorError: '#B8562A',
    colorWarning: '#C9A82A',
    colorInfo: '#6FAE8A',
    gitAdd: '#6FCB2A',
    gitDelete: '#B8562A',
    ansi: {
      black: '#16481A',
      red: '#8A4A22',
      green: '#6FCB2A',
      yellow: '#C9A82A',
      blue: '#5C8A6A',
      magenta: '#7A8A4A',
      cyan: '#6FAE8A',
      white: '#8BAC0F',
      brightBlack: '#4C6B1E',
      brightRed: '#B8562A',
      brightGreen: '#8FE070',
      brightYellow: '#D9CB4A',
      brightBlue: '#7FAE9A',
      brightMagenta: '#9AAA6A',
      brightCyan: '#A8E0A0',
      brightWhite: '#C9E06A',
    },
  },
};
