# Changelog

All notable changes to the "Hylian Palette" extension are documented here.

## [0.3.0] - 2026-09-04

- Added an original extension icon (`icon.png`) — an abstract gold/violet gem, echoing the Hyrule/Lorule light-vs-dark-mirror-world duality through color language only, deliberately not a Triforce or any other game-specific silhouette.
- Added `.github/workflows/build.yml`: regenerates and validates every theme (WCAG contrast, JSON strictness, `positron*` key provenance, generated-output-matches-committed check) and packages the extension on every push/PR.
- Added `scripts/validate.js`, consolidating the JSON-strictness and `positron*`-key-provenance checks used throughout development into one reusable script.
- Added a rigorous color-science pass (`analysis/color_science.R`, hand-implemented in pure R after `colorspace`/`farver` proved unstable in this environment): a global PCA of all 34 themes' syntax colors, per-theme CIE a\*-b\* colorspace diagrams, and a color-vision-deficiency audit across 2,652 role-pairs. Found and fixed 20 palette token adjustments (mostly `accentStorage`, which was frequently too close to `accentKeyword`/`accentString`/`colorError` under red-green color blindness) across 19 themes, cutting severe CVD collisions from 35 to 13. See the README's "Color science" section.

## [0.2.0] - 2026-09-03

Renamed to **Hylian Palette** and expanded to cover every mainline Legend of Zelda game.

- Added Light and Dark themes for all 17 mainline games (34 themes total): The Legend of Zelda, Zelda II, A Link to the Past, Link's Awakening, Ocarina of Time, Majora's Mask, Oracle of Seasons, Oracle of Ages, The Wind Waker, The Minish Cap, Twilight Princess, Phantom Hourglass, Spirit Tracks, Skyward Sword, A Link Between Worlds, Breath of the Wild, and Tears of the Kingdom.
- Added Wind Waker Dark and Majora's Mask Light, completing those two games' pairs.
- Introduced a token-driven theme generator (`scripts/generate-themes.js`) so every theme shares the same well-tested structural formula while each game's ~40 "story" colors carry its own in-universe rationale; every theme passes an automated WCAG contrast check.
- Retitled the toggle command to `Hylian Palette: Toggle Theme` and made it a *smart* per-game toggle (flips Light↔Dark within whichever game is active, rather than only Wind Waker/Majora's Mask).
- Added `Hylian Palette: Pick Zelda Theme`, a quick-pick grouped by game in release order.

## [0.1.0] - 2026-09-03

Initial release.

- Added **Wind Waker Light** — a warm, nautical light theme (parchment/map background, Great Sea turquoise, ocean blue, Hero's green, King of Red Lions crimson, rupee orange).
- Added **Majora's Mask Dark** — a cosmic, neon-on-void dark theme (Majora magenta, Fierce Deity cyan, Woodfall purple, Termina/Moon orange, Garo gray).
- Comprehensive TextMate `tokenColors` and `semanticTokenColors` covering comments, keywords, storage, strings, numbers, booleans, constants, functions, methods, variables, properties, parameters, classes, types, interfaces, namespaces, decorators, operators, punctuation, tags, regex, and documentation comments.
- Full Positron-specific theming: Console, Variables, Plots, Data Explorer/Grid, Packages, Notebooks, action bars, modal dialogs, context menus, dropdowns, checkboxes, tooltips, and runtime state icons.
- Added `Wind Waker × Majora: Toggle Theme` command to switch between the two themes via the Command Palette.
