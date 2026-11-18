'use strict';

// Link's Awakening (1993) -- Dark
//
// Signature story: the ONE deliberately monochrome hardware-tribute theme in the
// entire catalog. The original 1993 Game Boy (DMG-01) had no color -- only a
// reflective olive-chartreuse STN LCD driven by 2-bit shade registers. Those
// canonical DMG shades anchor this palette directly: #0F380F (darkest pixel,
// `bg`), #306230 (structural borders/chrome), and #8BAC0F / #9BBC0F (classic
// mid-bright LCD phosphor tones).
//
// To make real programming genuinely comfortable without breaking the monochrome
// dream conceit, active tokens glide monotonically along the exact DMG phosphor
// curve in OKLCH space -- from deep olive-moss (`h ~ 136°`, `L ~ 0.69`) up to
// lit dot-matrix lime-chartreuse (`h ~ 112°`, `L ~ 0.90`) -- ensuring every
// single syntax token, comment, operator, and namespace clears WCAG AA 4.5:1
// against #0F380F while bold/italic typographic cues reinforce role boundaries.
// One narrow lore exception remains: `colorError` and `gitDelete` take a muted
// oxidized-amber Nightmare tint (#E08244), representing the foreign Nightmares
// haunting Koholint's dungeons -- the only presence never native to the Wind
// Fish's dream.

module.exports = {
  slug: 'linksawakening-dark',
  label: "Link's Awakening Dark",
  game: "Link's Awakening",
  year: 1993,
  subtitle: "1993 DMG-01 dot-matrix LCD phosphor green ramp — the Wind Fish's dream",
  tokens: {
    mode: 'dark',
    bg: '#0F380F',
    fg: '#C4DE54',
    bgLine: '#184418',
    bgWidget: '#204E20',
    bgInput: '#0B2E0B',
    bgSidebar: '#153F14',
    bgPanel: '#133C12',
    bgActivity: '#1B4719',
    tintHover: '#26561A',
    tintSelect: '#35691C',
    fgSecondary: '#98BA38',
    fgMuted: '#6A8F28',
    fgVariable: '#BBD84A',
    fgPunct: '#85AB2C',
    fgComment: '#83A825',
    fgParameter: '#A9CC44',
    fgProperty: '#9EC23B',
    borderSubtle: '#265226',
    borderStrong: '#5E8534',
    accentKeyword: '#9BBC0F',
    accentStorage: '#7FB032',
    accentString: '#B6D63C',
    accentRegex: '#D2E86B',
    accentFunction: '#8CC42B',
    accentFunctionDim: '#7AA836',
    accentType: '#A6CF52',
    accentInterface: '#BFE072',
    accentNumber: '#D6EB63',
    accentDecorator: '#CBE683',
    accentNamespace: '#7DA646',
    accentCursor: '#D6EB63',
    accentFocus: '#9BBC0F',
    accentBadge: '#B6D63C',
    accentButton: '#306230',
    accentStatusBar: '#1B4A1B',
    colorError: '#E08244',
    colorWarning: '#D4B83C',
    colorInfo: '#96C96E',
    gitAdd: '#8CC42B',
    gitDelete: '#E08244',
    ansi: {
      black: '#184418',
      red: '#D97B3E',
      green: '#8CC42B',
      yellow: '#C8C438',
      blue: '#7EB368',
      magenta: '#A6B856',
      cyan: '#88C478',
      white: '#9BBC0F',
      brightBlack: '#7BA124',
      brightRed: '#E89254',
      brightGreen: '#A8D84E',
      brightYellow: '#DCE868',
      brightBlue: '#98CCA0',
      brightMagenta: '#C0CF7A',
      brightCyan: '#B2E09C',
      brightWhite: '#D8EE78',
    },
  },
};
