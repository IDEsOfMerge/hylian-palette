'use strict';

// Tears of the Kingdom (2023) -- Dark
//
// The Depths: a genuinely lightless void beneath all of Hyrule, absent from
// Breath of the Wild entirely, so this needed its own distinct identity
// rather than a reskin of that game's Blood-Moon danger palette. The base
// tone is pushed to a near-neutral, barely-violet near-black -- darker and
// less saturated than either Majora's cosmic-violet void or any of this
// family's other dark themes, aiming for true abyss rather than danger or
// corruption. Gloom, the purple goo Ganondorf's Secret Stone of Darkness
// leaks across the map (visible as purple splotches on the Depths map
// itself), supplies strings, the badge, and the terminal's magenta. Against
// all of that darkness, the one thing that actually lights the Depths is
// Zonai technology -- Lightroots, Brightbloom Seeds, charge-powered
// constructs -- glowing the exact same bioluminescent teal that lit the Sky
// Islands above. That teal is carried over unchanged as the cursor and focus
// color, brightened into a true beacon, because it is deliberately "the one
// bright accent" in an otherwise lightless world. Comment text is kept
// noticeably lighter than a typical dark-theme muted grey specifically
// because the backdrop is so close to true black -- a dim comment here would
// vanish entirely, which would rather defeat the point of a code comment.

module.exports = {
  slug: 'totk-dark',
  label: 'Tears of the Kingdom Dark',
  game: 'Tears of the Kingdom',
  year: 2023,
  tokens: {
    mode: 'dark',
    bg: '#0A0909',
    fg: '#DCE4E0',
    bgLine: '#191818',
    bgWidget: '#232222',
    bgInput: '#111010',
    bgSidebar: '#161515',
    bgPanel: '#161515',
    bgActivity: '#1B1A1A',
    tintHover: '#122B29',
    tintSelect: '#17413D',
    fgSecondary: '#8CA298',
    fgMuted: '#5C6C66',
    fgVariable: '#C8DAD4',
    fgPunct: '#7C948C',
    fgComment: '#9AB4AE',
    fgParameter: '#7FE0D2',
    fgProperty: '#7FB0DC',
    borderSubtle: '#2F2E2E',
    borderStrong: '#4C4B4B',
    accentKeyword: '#5ECB7E',
    accentStorage: '#8A7A94',
    accentString: '#C060D0',
    accentRegex: '#E8703D',
    accentFunction: '#4FC0DC',
    accentFunctionDim: '#8FDCE8',
    accentType: '#2EA89C',
    accentInterface: '#6FE0D4',
    accentNumber: '#D8B84A',
    accentDecorator: '#E0A050',
    accentNamespace: '#6C6478',
    accentCursor: '#3DE0D0',
    accentFocus: '#3DE0D0',
    accentBadge: '#B060D8',
    accentButton: '#2EA89C',
    accentStatusBar: '#3A1F52',
    colorError: '#E0524A',
    colorWarning: '#E0A050',
    colorInfo: '#4FC0DC',
    gitAdd: '#5ECB7E',
    gitDelete: '#E0524A',
    ansi: {
      black: '#191818',
      red: '#C54841',
      green: '#5ECB7E',
      yellow: '#D8B84A',
      blue: '#4FC0DC',
      magenta: '#C060D0',
      cyan: '#2EA89C',
      white: '#8CA298',
      brightBlack: '#5C6C66',
      brightRed: '#E0524A',
      brightGreen: '#76D391',
      brightYellow: '#CDAF46',
      brightBlue: '#8FDCE8',
      brightMagenta: '#C873D6',
      brightCyan: '#6FE0D4',
      brightWhite: '#DCE4E0',
    },
  },
};
